import axios from "axios";
import type { Examen } from "../models/Examen";
import type { Matiere } from "../models/Matiere";
import type { Niveau } from "../models/Niveau";
import type { Enseignant } from "../models/Enseignant";
import type { Surveillant } from "../models/Surveillant";
import type { Parcours } from "../models/Parcours";
import type { Salle } from "../models/Salle";
import type { Enseigner } from "../models/Enseigner";
import type { Surveiller } from "../models/Surveiller";
import type { ExamenParcours } from "../models/ExamenParcours";
import type { Repartition } from "../models/Repartition";
import type { Repartir } from "../models/Repartir";

const API_BASE_URL = "http://localhost:8080/api";

export class ApiService {
  // ----------------- EXAMENS -----------------
  static getExamens(): Promise<Examen[]> {
    return axios.get(`${API_BASE_URL}/examens`).then((res) => res.data);
  }

  static getExamenById(id: number): Promise<Examen> {
    return axios.get(`${API_BASE_URL}/examens/${id}`).then((res) => res.data);
  }

  static saveExamen(examen: Examen): Promise<Examen> {
    const cleanedExamen = {
      ...examen,
      // On ne garde que les IDs côté backend
      matiere: examen.matiere?.idMatiere
        ? { idMatiere: examen.matiere.idMatiere }
        : null,
      niveau: examen.niveau?.idNiveau
        ? { idNiveau: examen.niveau.idNiveau }
        : null,

      // Conversion de duree (float → BigDecimal compatible)
      duree:
        examen.duree && !isNaN(Number(examen.duree))
          ? Number(examen.duree)
          : 0,

      // Heure et date bien envoyées au format attendu
      heureDebut: examen.heureDebut ?? null,
      heureFin: examen.heureFin ?? null,
      dateExamen: examen.dateExamen ?? null,

      // Salle(s)
      numeroSalle: examen.numeroSalle ?? "",

      // Session (string)
      session: examen.session ?? "",
    };

    if (examen.idExamen) {
      return axios
        .put(`${API_BASE_URL}/examens/${examen.idExamen}`, cleanedExamen)
        .then((res) => res.data);
    } else {
      return axios
        .post(`${API_BASE_URL}/examens`, cleanedExamen)
        .then((res) => res.data);
    }
  }

  static deleteExamen(id: number): Promise<void> {
    return axios.delete(`${API_BASE_URL}/examens/${id}`).then(() => {});
  }

  // ----------------- MATIERES -----------------
  static getMatieres(): Promise<Matiere[]> {
    return axios.get(`${API_BASE_URL}/matieres`).then((res) => res.data);
  }

  static getMatiereById(id: number): Promise<Matiere> {
    return axios.get(`${API_BASE_URL}/matieres/${id}`).then((res) => res.data);
  }

  static saveMatiere(matiere: Matiere): Promise<Matiere> {
    if (matiere.idMatiere) {
      return axios
        .put(`${API_BASE_URL}/matieres/${matiere.idMatiere}`, matiere)
        .then((res) => res.data);
    } else {
      return axios.post(`${API_BASE_URL}/matieres`, matiere).then((res) => res.data);
    }
  }

  static deleteMatiere(id: number): Promise<void> {
    return axios.delete(`${API_BASE_URL}/matieres/${id}`).then(() => {});
  }

  // ----------------- NIVEAUX -----------------
  static getNiveaux(): Promise<Niveau[]> {
    return axios.get(`${API_BASE_URL}/niveaux`).then((res) => res.data);
  }

  static getNiveauById(id: number): Promise<Niveau> {
    return axios.get(`${API_BASE_URL}/niveaux/${id}`).then((res) => res.data);
  }

  static saveNiveau(niveau: Niveau): Promise<Niveau> {
    if (niveau.idNiveau) {
      return axios
        .put(`${API_BASE_URL}/niveaux/${niveau.idNiveau}`, niveau)
        .then((res) => res.data);
    } else {
      return axios.post(`${API_BASE_URL}/niveaux`, niveau).then((res) => res.data);
    }
  }

  static deleteNiveau(id: number): Promise<void> {
    return axios.delete(`${API_BASE_URL}/niveaux/${id}`).then(() => {});
  }

  // ----------------- ENSEIGNANTS -----------------
  static getEnseignants(): Promise<Enseignant[]> {
    return axios.get(`${API_BASE_URL}/enseignants`).then((res) => res.data);
  }

  static getEnseignantById(id: number): Promise<Enseignant> {
    return axios.get(`${API_BASE_URL}/enseignants/${id}`).then((res) => res.data);
  }

  static saveEnseignant(enseignant: Enseignant): Promise<Enseignant> {
    if (enseignant.idEnseignant) {
      return axios
        .put(`${API_BASE_URL}/enseignants/${enseignant.idEnseignant}`, enseignant)
        .then((res) => res.data);
    } else {
      return axios.post(`${API_BASE_URL}/enseignants`, enseignant).then((res) => res.data);
    }
  }

  static deleteEnseignant(id: number): Promise<void> {
    return axios.delete(`${API_BASE_URL}/enseignants/${id}`).then(() => {});
  }

  // ----------------- SURVEILLANTS -----------------
  static getSurveillants(): Promise<Surveillant[]> {
    return axios.get(`${API_BASE_URL}/surveillants`).then((res) => res.data);
  }

  static getSurveillantById(id: number): Promise<Surveillant> {
    return axios.get(`${API_BASE_URL}/surveillants/${id}`).then((res) => res.data);
  }

static saveSurveillant(surveillant: Surveillant): Promise<Surveillant> {
  if (surveillant.idSurveillant && surveillant.idSurveillant > 0) {
    // Modification
    return axios
      .put(`${API_BASE_URL}/surveillants/${surveillant.idSurveillant}`, surveillant)
      .then((res) => res.data);
  } else {
    // Ajout
    return axios
      .post(`${API_BASE_URL}/surveillants`, surveillant)
      .then((res) => res.data);
  }
}


  static deleteSurveillant(id: number): Promise<void> {
    return axios.delete(`${API_BASE_URL}/surveillants/${id}`).then(() => {});
  }

  // ----------------- PARCOURS -----------------
  static getParcours(): Promise<Parcours[]> {
    return axios.get(`${API_BASE_URL}/parcours`).then((res) => res.data);
  }

  static getParcoursById(id: number): Promise<Parcours> {
    return axios.get(`${API_BASE_URL}/parcours/${id}`).then((res) => res.data);
  }

  static saveParcours(parcours: Parcours): Promise<Parcours> {
    if (parcours.idParcours) {
      return axios
        .put(`${API_BASE_URL}/parcours/${parcours.idParcours}`, parcours)
        .then((res) => res.data);
    } else {
      return axios.post(`${API_BASE_URL}/parcours`, parcours).then((res) => res.data);
    }
  }

  static deleteParcours(id: number): Promise<void> {
    return axios.delete(`${API_BASE_URL}/parcours/${id}`).then(() => {});
  }

  // ----------------- SALLES -----------------
  static getSalles(): Promise<Salle[]> {
    return axios.get(`${API_BASE_URL}/salles`).then((res) => res.data);
  }

  static getSalleById(numeroSalle: string): Promise<Salle> {
    return axios.get(`${API_BASE_URL}/salles/${numeroSalle}`).then((res) => res.data);
  }

  static saveSalle(salle: Salle): Promise<Salle> {
    if (salle.numeroSalle) {
      return axios
        .put(`${API_BASE_URL}/salles/${salle.numeroSalle}`, salle)
        .then((res) => res.data);
    } else {
      return axios.post(`${API_BASE_URL}/salles`, salle).then((res) => res.data);
    }
  }

  static deleteSalle(numeroSalle: string): Promise<void> {
    return axios.delete(`${API_BASE_URL}/salles/${numeroSalle}`).then(() => {});
  }

  // ----------------- ENSEIGNER -----------------
  static getEnseigners(): Promise<Enseigner[]> {
    return axios.get(`${API_BASE_URL}/enseigner`).then((res) => res.data);
  }

  static saveEnseigner(idMatiere: number, idEnseignant: number): Promise<Enseigner> {
    return axios
      .post(`${API_BASE_URL}/enseigner`, {
        matiere: { idMatiere },
        enseignant: { idEnseignant },
      })
      .then((res) => res.data);
  }

  static deleteEnseigner(idMatiere: number, idEnseignant: number): Promise<void> {
    return axios
      .delete(`${API_BASE_URL}/enseigner/${idMatiere}/${idEnseignant}`)
      .then(() => {});
  }

  static updateEnseigner(
    idMatiere: number,
    idEnseignant: number,
    newIdMatiere: number,
    newIdEnseignant: number
  ): Promise<Enseigner> {
    return axios
      .put(`${API_BASE_URL}/enseigner/${idMatiere}/${idEnseignant}`, {
        matiere: { idMatiere: newIdMatiere },
        enseignant: { idEnseignant: newIdEnseignant },
      })
      .then((res) => res.data);
  }

  // ----------------- SURVEILLER -----------------
  static getSurveiller(): Promise<Surveiller[]> {
    return axios.get(`${API_BASE_URL}/surveiller`).then((res) => res.data);
  }

  static addSurveiller(idExamen: number, idSurveillant: number): Promise<Surveiller> {
    return axios
      .post(`${API_BASE_URL}/surveiller`, {
        examen: { idExamen },
        surveillant: { idSurveillant },
      })
      .then((res) => res.data);
  }

  static updateSurveiller(
  oldIdExamen: number,
  oldIdSurveillant: number,
  newIdExamen: number,
  newIdSurveillant: number
) {
  return axios
    .put(`${API_BASE_URL}/surveiller/${oldIdExamen}/${oldIdSurveillant}`, {
      examen: { idExamen: newIdExamen },
      surveillant: { idSurveillant: newIdSurveillant },
    })
    .then((res) => res.data);
}


  static deleteSurveiller(idExamen: number, idSurveillant: number): Promise<void> {
    return axios
      .delete(`${API_BASE_URL}/surveiller/${idExamen}/${idSurveillant}`)
      .then(() => {});
  }

  // ----------------- EXAMENPARCOURS -----------------
 
static getExamenParcours(): Promise<ExamenParcours[]> {
  return axios.get(`${API_BASE_URL}/examenparcours`).then((res) => res.data);
}

static async saveExamenParcours(
  data: any,
  oldId?: { idExamen: number; idParcours: number }
) {
  if (oldId) {
    const res = await axios.put(
      `${API_BASE_URL}/examenparcours/${oldId.idExamen}/${oldId.idParcours}`,
      data
    );
    return res.data;
  } else {
    const res = await axios.post(`${API_BASE_URL}/examenparcours`, data);
    return res.data;
  }
}

static deleteExamenParcours(idExamen: number, idParcours: number): Promise<void> {
  return axios
    .delete(`${API_BASE_URL}/examenparcours/${idExamen}/${idParcours}`)
    .then(() => {});
}

// ✅ Nouvelle version cohérente avec le backend
static deleteAllExamenParcoursByExamen(idExamen: number) {
  return axios.delete(`${API_BASE_URL}/examenparcours/examen/${idExamen}`);
}

static updateExamenParcoursGlobal(idExamen: number, parcoursIds: number[]) {
  return axios
    .post(`${API_BASE_URL}/examenparcours/update-global`, { idExamen, parcoursIds })
    .then((res) => res.data);
}


// ----------------- REPARTITIONS -----------------
static getRepartitions(): Promise<Repartition[]> {
  return axios.get(`${API_BASE_URL}/repartitions`).then(res => res.data);
}

static saveRepartition(rep: Repartition): Promise<Repartition> {
  if (rep.idRepartition) {
    return axios.put(`${API_BASE_URL}/repartitions/${rep.idRepartition}`, rep).then(res => res.data);
  } else {
    return axios.post(`${API_BASE_URL}/repartitions`, rep).then(res => res.data);
  }
}

static deleteRepartition(id: number): Promise<void> {
  return axios.delete(`${API_BASE_URL}/repartitions/${id}`).then(() => {});
}

// --- REPARTIR ---
static getRepartir(): Promise<Repartir[]> {
  return axios.get(`${API_BASE_URL}/repartir`).then((res) => res.data);
}

static saveRepartir(rep: Repartir): Promise<Repartir> {
  return axios.post(`${API_BASE_URL}/repartir`, rep).then((res) => res.data);
}


static updateRepartir(
  oldNumeroSalle: string,
  oldIdRepartition: number,
  newNumeroSalle: string,
  newIdRepartition: number
) {
  return axios.put(`${API_BASE_URL}/repartir/${oldNumeroSalle}/${oldIdRepartition}`, {
    salle: { numeroSalle: newNumeroSalle },
    repartition: { idRepartition: newIdRepartition },
  }).then(res => res.data);
}


static deleteRepartir(numeroSalle: string, idRepartition: number): Promise<void> {
  return axios.delete(`${API_BASE_URL}/repartir/${numeroSalle}/${idRepartition}`);
}

// --- REPARTIR (par salle) ---
static async getRepartitionParSalle() {
  const res = await axios.get(`${API_BASE_URL}/repartir/par-salle`);
  return res.data; // Map<String, List<Repartir>>
}

// --- SURVEILLANCE AUTO ---
static async generateAutoSurveillance() {
  const res = await fetch(`${API_BASE_URL}/surveiller/generate-auto`, {
    method: "POST",
  });
  return res.json();
}

static async getRepartitionByExamen(idExamen: number) {
  const res = await fetch(`${API_BASE_URL}/examens/${idExamen}/repartitions`);
  return res.json();
}


// Dans ApiService.ts
static getPlanningSurveillance() {
  return axios.get(`${API_BASE_URL}/planning-surveillance`).then(res => res.data);
}


// --- PLANNING DE SURVEILLANCE ---
static getPlanningByExamen(idExamen: number) {
  return axios
    .get(`${API_BASE_URL}/planning-surveillance/examen/${idExamen}`)
    .then((res) => res.data);
}

static generatePlanning(idExamen: number) {
  return axios
    .post(`${API_BASE_URL}/planning-surveillance/generate/${idExamen}`)
    .then((res) => res.data);
}


// ✅ Récupérer un seul par ID
static getPlanningById(id: number) {
  return axios.get(`${API_BASE_URL}/planning-surveillance/id/${id}`).then(res => res.data);
}



// ✅ Supprimer
static deletePlanningSurveillance(id: number) {
  return axios.delete(`${API_BASE_URL}/planning-surveillance/${id}`);
}

// --- Dans ApiService.ts ---
static getParcoursByExamen(idExamen: number) {
  return axios
    .get(`${API_BASE_URL}/examenparcours/idExamen/${idExamen}`)
    .then((res) => res.data);
}

static getSurveillantsBySalle(numeroSalle: string) {
  return axios
    .get(`${API_BASE_URL}/surveillants/by-salle/${numeroSalle}`)
    .then((res) => res.data);
}

static updateExamenSalleGlobal(idExamen: number, salles: string[]) {
  return axios.post("/examensalle/update-global", { idExamen, salles });
}

static getExamenSalle() {
  return axios.get("/examensalle");
}

// --- PLANNING DE SURVEILLANCE ---
static async savePlanningSurveillance(planning: any) {
  // ✅ Si on a plusieurs salles détectées ou plusieurs surveillants à répartir
  if (planning.sallesDetectees && planning.surveillantsDetectes) {
    const promises: Promise<any>[] = [];

    for (const [numSalle, listeSurv] of Object.entries(
      planning.surveillantsDetectes
    )) {
      for (const sv of listeSurv as any[]) {
        const item = {
          examen: { idExamen: planning.examen.idExamen },
          salle: { numeroSalle: numSalle },
          surveillant: { idSurveillant: sv.idSurveillant },
          dateExamen: planning.dateExamen,
          heureDebut: planning.heureDebut,
          heureFin: planning.heureFin,
        };

        // Chaque ligne correspond à une combinaison (examen + salle + surveillant)
        promises.push(
          axios.post(`${API_BASE_URL}/planning-surveillance`, item)
        );
      }
    }

    return Promise.all(promises).then((res) => res.map((r) => r.data));
  }

  // ✅ Sinon, simple enregistrement unique
  if (planning.idPlanning) {
    return axios
      .put(`${API_BASE_URL}/planning-surveillance/${planning.idPlanning}`, planning)
      .then((res) => res.data);
  } else {
    return axios
      .post(`${API_BASE_URL}/planning-surveillance`, planning)
      .then((res) => res.data);
  }
}



}
