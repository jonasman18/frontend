import type { Examen } from "./Examen";
import type { Salle } from "./Salle";
import type { Surveillant } from "./Surveillant";

export interface PlanningSurveillance {
  idPlanning?: number;
  examen?: Examen;
  salle?: Salle;
  surveillant?: Surveillant;
  heureDebut: string;
  heureFin: string;
  dateExamen?: string;
}
