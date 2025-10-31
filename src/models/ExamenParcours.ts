import type { Examen } from "./Examen";
import type { Parcours } from "./Parcours";

export interface ExamenParcoursId {
  idExamen: number;
  idParcours: number;
}

export interface ExamenParcours {
  idExamenParcours?: ExamenParcoursId | undefined;  
 
  examen?: Examen;
  parcours?: Parcours;
}
