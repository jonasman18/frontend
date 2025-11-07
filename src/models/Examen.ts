

export interface Examen {
  idExamen?: number;
  matiere: {
    niveau: any;
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
  enseignants?: number[];  
  parcours?: number[];
}

