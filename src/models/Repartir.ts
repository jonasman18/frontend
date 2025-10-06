import type { Repartition } from "./Repartition";
import type { Salle } from "./Salle";

export interface Repartir {
  id: {
    numeroSalle: string;
    idRepartition: number;
  };
  salle?: Salle;
  repartition?: Repartition;
}
