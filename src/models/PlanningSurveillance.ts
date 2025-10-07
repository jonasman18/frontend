import type { Examen } from "./Examen";
import type { Parcours } from "./Parcours";
import type { Salle } from "./Salle";
import type { Surveillant } from "./Surveillant";

export interface PlanningSurveillance {
  idPlanning?: number;
  examen?: Examen;
  parcours?: Parcours;
  salle?: Salle;
  surveillant?: Surveillant;
  heureDebut: string;
  heureFin: string;
  dateExamen?: string;
}
