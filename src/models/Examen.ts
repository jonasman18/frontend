

export interface Examen {
  idExamen?: number; // optionnel
  matiere: {
    idMatiere?: number;
    nomMatiere: string;
  };
  niveau: {
    idNiveau?: number;
    codeNiveau: string;
  };
  dateExamen: string;
  heureDebut: string;
  heureFin: string;
  duree?: number;
  numeroSalle?: string;
  session?: string;
}
