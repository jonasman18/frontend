export interface Enseignant {
  idEnseignant: number; // optionnel car généré par la DB
  nomEnseignant: string;
  grade?: string;
}
