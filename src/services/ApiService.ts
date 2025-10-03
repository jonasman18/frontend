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
    if (examen.idExamen) {
      return axios
        .put(`${API_BASE_URL}/examens/${examen.idExamen}`, examen)
        .then((res) => res.data);
    } else {
      return axios.post(`${API_BASE_URL}/examens`, examen).then((res) => res.data);
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
    if (surveillant.idSurveillant) {
      return axios
        .put(`${API_BASE_URL}/surveillants/${surveillant.idSurveillant}`, surveillant)
        .then((res) => res.data);
    } else {
      return axios.post(`${API_BASE_URL}/surveillants`, surveillant).then((res) => res.data);
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

  static deleteSurveiller(idExamen: number, idSurveillant: number): Promise<void> {
    return axios
      .delete(`${API_BASE_URL}/surveiller/${idExamen}/${idSurveillant}`)
      .then(() => {});
  }

  // ----------------- EXAMENPARCOURS -----------------
  static getExamenParcours(): Promise<ExamenParcours[]> {
    return axios.get(`${API_BASE_URL}/examenparcours`).then((res) => res.data);
  }

  // ExamenParcours
static async saveExamenParcours(data: any, oldId?: { idExamen: number; idParcours: number }) {
  if (oldId) {
    // 🔄 Mettre à jour (modification)
    const res = await axios.put(
      `${API_BASE_URL}/examenparcours/${oldId.idExamen}/${oldId.idParcours}`,
      data
    );
    return res.data;
  } else {
    // ➕ Nouvelle association
    const res = await axios.post(`${API_BASE_URL}/examenparcours`, data);
    return res.data;
  }
}


  static deleteExamenParcours(idExamen: number, idParcours: number): Promise<void> {
    return axios
      .delete(`${API_BASE_URL}/examenparcours/${idExamen}/${idParcours}`)
      .then(() => {});
  }
}
