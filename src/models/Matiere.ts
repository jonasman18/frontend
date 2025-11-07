import type { Niveau } from "./Niveau";

export interface Matiere {
  idMatiere?: number;
  nomMatiere: string;
  niveau?: Niveau;
}
