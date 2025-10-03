import type { Matiere } from "./Matiere";
import type { Enseignant } from "./Enseignant";

export interface EnseignerId {
  idMatiere: number;
  idEnseignant: number;
}

export interface Enseigner {
  id: EnseignerId;
  matiere: Matiere;
  enseignant: Enseignant;
}
