import type { Examen } from "./Examen";
import type { Surveillant } from "./Surveillant";

export interface SurveillerId {
  idExamen: number;
  idSurveillant: number;
}

export interface Surveiller {
  id: SurveillerId;
  examen: Examen;
  surveillant: Surveillant;
}
