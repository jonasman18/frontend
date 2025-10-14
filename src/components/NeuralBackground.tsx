import React, { useRef, useEffect, type FC } from "react";

interface Point {
  x: number;
  y: number;
  z: number;
}

interface Screen {
  x: number;
  y: number;
  z: number;
  scale: number;
  color: string;
  lastX?: number;
  lastY?: number;
}

interface Connection {
  x: number;
  y: number;
  z: number;
  size: number;
  screen: Screen;
  links: Connection[];
  probabilities: number[];
  isEnd: boolean;
  glowSpeed: number;
  step(): void;
  draw(): void;
  link(): void;
  setScreen(): void;
  rootStep?(): void;
}

interface Data {
  glowSpeed: number;
  speed: number;
  x: number;
  y: number;
  z: number;
  size: number;
  screen: Screen;
  connection: Connection;
  nextConnection: Connection;
  ox: number;
  oy: number;
  oz: number;
  os: number;
  nx: number;
  ny: number;
  nz: number;
  ns: number;
  dx: number;
  dy: number;
  dz: number;
  ds: number;
  proportion: number;
  ended?: number;
  step(): void;
  draw(): void;
  setConnection(connection: Connection): void;
  setScreen(): void;
  reset(): void;
}

interface Options {
  range: number;
  baseConnections: number;
  addedConnections: number;
  baseSize: number;
  minSize: number;
  dataToConnectionSize: number;
  sizeMultiplier: number;
  allowedDist: number;
  baseDist: number;
  addedDist: number;
  connectionAttempts: number;
  dataToConnections: number;
  baseSpeed: number;
  addedSpeed: number;
  baseGlowSpeed: number;
  addedGlowSpeed: number;
  rotVelX: number;
  rotVelY: number;
  repaintColor: string;
  connectionColor: string;
  rootColor: string;
  endColor: string;
  dataColor: string;
  wireframeWidth: number;
  wireframeColor: string;
  depth: number;
  focalLength: number;
  vanishPoint: { x: number; y: number };
}

const NeuralBackground: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctxRaw = canvas.getContext("2d");
    if (!ctxRaw) return;
    const ctx: CanvasRenderingContext2D = ctxRaw; // Typage non-null après vérification

    let w = 0;
    let h = 0;
    let squareRange = 0;
    let squareAllowed = 0;
    let mostDistant = 0;
    let sinX = 0;
    let sinY = 0;
    let cosX = 1;
    let cosY = 1;
    let connections: Connection[] = [];
    let toDevelop: Connection[] = [];
    let data: Data[] = [];
    let all: (Connection | Data)[] = [];
    let tick = 0;
    const Tau = Math.PI * 2;
    let animId: number;

    const opts: Options = {
      range: 300, // Augmenté pour plus de couverture
      baseConnections: 4, // Plus de connexions par nœud
      addedConnections: 6,
      baseSize: 5,
      minSize: 1,
      dataToConnectionSize: 0.4,
      sizeMultiplier: 0.7,
      allowedDist: 50, // Augmenté pour éviter les chevauchements
      baseDist: 50,
      addedDist: 40,
      connectionAttempts: 100,
      dataToConnections: 1.5, // Plus de particules de données
      baseSpeed: 0.04,
      addedSpeed: 0.05,
      baseGlowSpeed: 0.4,
      addedGlowSpeed: 0.4,
      rotVelX: 0.003,
      rotVelY: 0.002,
      repaintColor: "rgba(6, 78, 59, 0.1)",
      connectionColor: "hsla(160, 60%, light%, alp)",
      rootColor: "hsla(120, 80%, light%, alp)",
      endColor: "hsla(140, 40%, light%, alp)",
      dataColor: "hsla(100, 80%, light%, alp)",
      wireframeWidth: 0.1,
      wireframeColor: "#10b981",
      depth: 300, // Augmenté pour plus de profondeur
      focalLength: 300,
      vanishPoint: { x: 0, y: 0 },
    };

    const squareDist = (a: Point, b: Point): number => {
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dz = b.z - a.z;
      return dx * dx + dy * dy + dz * dz;
    };

    class ConnectionImpl implements Connection {
      x: number;
      y: number;
      z: number;
      size: number;
      screen: Screen = { x: 0, y: 0, z: 0, scale: 0, color: "" };
      links: Connection[] = [];
      probabilities: number[] = [];
      isEnd: boolean = false;
      glowSpeed: number;

      constructor(x: number, y: number, z: number, size: number) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.size = size;
        this.glowSpeed = opts.baseGlowSpeed + opts.addedGlowSpeed * Math.random();
      }

      link(): void {
        if (this.size < opts.minSize) {
          this.isEnd = true;
          return;
        }

        const links: Point[] = [];
        const connectionsNum = opts.baseConnections + Math.floor(Math.random() * opts.addedConnections);
        let attempt = opts.connectionAttempts;
        let alpha: number, beta: number, len: number;
        let cosA: number, sinA: number, cosB: number, sinB: number;
        const pos: Point = { x: 0, y: 0, z: 0 };
        let passedExisting: boolean, passedBuffered: boolean;

        while (links.length < connectionsNum && --attempt > 0) {
          alpha = Math.random() * Math.PI;
          beta = Math.random() * Tau;
          len = opts.baseDist + opts.addedDist * Math.random();

          cosA = Math.cos(alpha);
          sinA = Math.sin(alpha);
          cosB = Math.cos(beta);
          sinB = Math.sin(beta);

          pos.x = this.x + len * cosA * sinB;
          pos.y = this.y + len * sinA * sinB;
          pos.z = this.z + len * cosB;

          if (pos.x * pos.x + pos.y * pos.y + pos.z * pos.z < squareRange) {
            passedExisting = true;
            passedBuffered = true;
            for (let i = 0; i < connections.length; ++i) {
              if (squareDist(pos, { x: connections[i].x, y: connections[i].y, z: connections[i].z }) < squareAllowed) {
                passedExisting = false;
                break;
              }
            }

            if (passedExisting) {
              for (let i = 0; i < links.length; ++i) {
                if (squareDist(pos, links[i]) < squareAllowed) {
                  passedBuffered = false;
                  break;
                }
              }
            }

            if (passedExisting && passedBuffered) {
              links.push({ x: pos.x, y: pos.y, z: pos.z });
            }
          }
        }

        if (links.length === 0) {
          this.isEnd = true;
        } else {
          for (let i = 0; i < links.length; ++i) {
            const pos = links[i];
            const connection = new ConnectionImpl(pos.x, pos.y, pos.z, this.size * opts.sizeMultiplier);
            this.links[i] = connection;
            all.push(connection);
            connections.push(connection);
          }
          for (let i = 0; i < this.links.length; ++i) {
            toDevelop.push(this.links[i]);
          }
        }
      }

      step(): void {
        this.setScreen();
        this.screen.color = (this.isEnd ? opts.endColor : opts.connectionColor)
          .replace("light", (30 + ((tick * this.glowSpeed) % 30)).toString())
          .replace("alp", (0.2 + (1 - this.screen.z / mostDistant) * 0.8).toString());

        for (let i = 0; i < this.links.length; ++i) {
          ctx.moveTo(this.screen.x, this.screen.y);
          ctx.lineTo(this.links[i].screen.x, this.links[i].screen.y);
        }
      }

      rootStep(): void {
        this.setScreen();
        this.screen.color = opts.rootColor
          .replace("light", (30 + ((tick * this.glowSpeed) % 30)).toString())
          .replace("alp", ((1 - this.screen.z / mostDistant) * 0.8).toString());

        for (let i = 0; i < this.links.length; ++i) {
          ctx.moveTo(this.screen.x, this.screen.y);
          ctx.lineTo(this.links[i].screen.x, this.links[i].screen.y);
        }
      }

      draw(): void {
        const radius = Math.max(0, this.screen.scale * this.size); // Clamp radius to 0 to avoid negative
        if (radius > 0) { // Skip drawing if radius is 0
          ctx.fillStyle = this.screen.color;
          ctx.beginPath();
          ctx.arc(this.screen.x, this.screen.y, radius, 0, Tau);
          ctx.fill();
        }
      }

      setScreen(): void {
        let x = this.x;
        let y = this.y;
        let z = this.z;

        // Rotation X
        const Y = y;
        y = y * cosX - z * sinX;
        z = z * cosX + Y * sinX;

        // Rotation Y
        const Z = z;
        z = z * cosY - x * sinY;
        x = x * cosY + Z * sinY;

        this.screen.z = z;
        z += opts.depth;

        // Clamp z to positive value to avoid negative scale
        z = Math.max(z, 0.1); // Minimum z to prevent division by zero or negative
        this.screen.scale = opts.focalLength / z;
        this.screen.x = opts.vanishPoint.x + x * this.screen.scale;
        this.screen.y = opts.vanishPoint.y + y * this.screen.scale;
      }
    }

    class DataImpl implements Data {
      glowSpeed: number;
      speed: number;
      x: number = 0;
      y: number = 0;
      z: number = 0;
      size: number = 0;
      screen: Screen = { x: 0, y: 0, z: 0, scale: 0, color: "" };
      connection!: Connection;
      nextConnection!: Connection;
      ox: number = 0;
      oy: number = 0;
      oz: number = 0;
      os: number = 0;
      nx: number = 0;
      ny: number = 0;
      nz: number = 0;
      ns: number = 0;
      dx: number = 0;
      dy: number = 0;
      dz: number = 0;
      ds: number = 0;
      proportion: number = 0;
      ended?: number;

      constructor(connection: Connection) {
        this.glowSpeed = opts.baseGlowSpeed + opts.addedGlowSpeed * Math.random();
        this.speed = opts.baseSpeed + opts.addedSpeed * Math.random();
        this.connection = connection;
        this.setConnection(connection);
      }

      reset(): void {
        this.setConnection(connections[0]);
        this.ended = 2;
      }

      step(): void {
        this.proportion += this.speed;

        if (this.proportion < 1) {
          this.x = this.ox + this.dx * this.proportion;
          this.y = this.oy + this.dy * this.proportion;
          this.z = this.oz + this.dz * this.proportion;
          this.size = Math.max(0, (this.os + this.ds * this.proportion) * opts.dataToConnectionSize); // Clamp size to 0
        } else {
          this.setConnection(this.nextConnection);
        }

        this.screen.lastX = this.screen.x;
        this.screen.lastY = this.screen.y;
        this.setScreen();
        this.screen.color = opts.dataColor
          .replace("light", (40 + ((tick * this.glowSpeed) % 50)).toString())
          .replace("alp", (0.2 + (1 - this.screen.z / mostDistant) * 0.6).toString());
      }

      draw(): void {
        if (this.ended) {
          --this.ended;
          return;
        }

        const lineWidth = Math.max(0, this.size * this.screen.scale); // Clamp lineWidth to 0 to avoid negative
        if (lineWidth > 0) { // Skip drawing if lineWidth is 0
          ctx.beginPath();
          ctx.strokeStyle = this.screen.color;
          ctx.lineWidth = lineWidth;
          ctx.moveTo(this.screen.lastX ?? 0, this.screen.lastY ?? 0);
          ctx.lineTo(this.screen.x, this.screen.y);
          ctx.stroke();
        }
      }

      setConnection(connection: Connection): void {
        if (connection.isEnd) {
          this.reset();
          return;
        }
        this.connection = connection;
        this.nextConnection = connection.links[Math.floor(connection.links.length * Math.random())];

        this.ox = connection.x;
        this.oy = connection.y;
        this.oz = connection.z;
        this.os = connection.size;

        this.nx = this.nextConnection.x;
        this.ny = this.nextConnection.y;
        this.nz = this.nextConnection.z;
        this.ns = this.nextConnection.size;

        this.dx = this.nx - this.ox;
        this.dy = this.ny - this.oy;
        this.dz = this.nz - this.oz;
        this.ds = this.ns - this.os;

        this.proportion = 0;
      }

      setScreen(): void {
        let x = this.x;
        let y = this.y;
        let z = this.z;

        // Rotation X
        const Y = y;
        y = y * cosX - z * sinX;
        z = z * cosX + Y * sinX;

        // Rotation Y
        const Z = z;
        z = z * cosY - x * sinY;
        x = x * cosY + Z * sinY;

        this.screen.z = z;
        z += opts.depth;

        // Clamp z to positive value to avoid negative scale
        z = Math.max(z, 0.1); // Minimum z to prevent division by zero or negative
        this.screen.scale = opts.focalLength / z;
        this.screen.x = opts.vanishPoint.x + x * this.screen.scale;
        this.screen.y = opts.vanishPoint.y + y * this.screen.scale;
      }
    }

    const updateDimensions = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      w = canvas.width;
      h = canvas.height;
      opts.vanishPoint.x = w / 2;
      opts.vanishPoint.y = h / 2;
      squareRange = opts.range * opts.range;
      squareAllowed = opts.allowedDist * opts.allowedDist;
      mostDistant = opts.depth + opts.range;
    };

    const init = (): void => {
      connections.length = 0;
      data.length = 0;
      all.length = 0;
      toDevelop.length = 0;

      // Créer plusieurs racines dispersées pour couvrir la page
      const numRoots = 8; // Nombre de réseaux neuronaux dispersés
      for (let r = 0; r < numRoots; r++) {
        const rootX = (Math.random() - 0.5) * opts.range * 2; // Positions aléatoires dans l'espace 3D
        const rootY = (Math.random() - 0.5) * opts.range * 2;
        const rootZ = (Math.random() - 0.5) * opts.range * 2;
        const connection = new ConnectionImpl(rootX, rootY, rootZ, opts.baseSize);
        connection.step = connection.rootStep!.bind(connection);
        connections.push(connection);
        all.push(connection);
        connection.link();
      }

      while (toDevelop.length > 0) {
        toDevelop[0].link();
        toDevelop.shift();
      }
    };

    const anim = (): void => {
      animId = requestAnimationFrame(anim);

      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = opts.repaintColor;
      ctx.fillRect(0, 0, w, h);

      ++tick;

      const rotX = tick * opts.rotVelX;
      const rotY = tick * opts.rotVelY;

      cosX = Math.cos(rotX);
      sinX = Math.sin(rotX);
      cosY = Math.cos(rotY);
      sinY = Math.sin(rotY);

      if (data.length < connections.length * opts.dataToConnections) {
        const datum = new DataImpl(connections[Math.floor(Math.random() * connections.length)]); // Choisir une racine aléatoire pour les données
        data.push(datum);
        all.push(datum);
      }

      ctx.globalCompositeOperation = "lighter";
      ctx.beginPath();
      ctx.lineWidth = opts.wireframeWidth;
      ctx.strokeStyle = opts.wireframeColor;
      all.forEach((item) => item.step());
      ctx.stroke();
      ctx.globalCompositeOperation = "source-over";
      all.sort((a, b) => b.screen.z - a.screen.z);
      all.forEach((item) => item.draw());
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    ctx.fillStyle = "#0f4a38";
    ctx.fillRect(0, 0, w, h);
    setTimeout(init, 100);
    animId = requestAnimationFrame(anim);

    return () => {
      window.removeEventListener("resize", updateDimensions);
      if (animId) cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ background: "transparent" }}
    />
  );
};

export default NeuralBackground;