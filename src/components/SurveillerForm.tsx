import React, { useEffect, useState } from "react";
import { ApiService } from "../services/ApiService";
import type { Examen } from "../models/Examen";
import type { Surveillant } from "../models/Surveillant";
import type { Surveiller } from "../models/Surveiller";
import ModalForm from "./ModalForm";

interface SurveillerFormProps {
  surveiller?: Surveiller; // si on édite une association existante
  onSave: (idExamen: number, idSurveillant: number) => void;
  onClose: () => void;
}

const SurveillerForm: React.FC<SurveillerFormProps> = ({
  surveiller,
  onSave,
  onClose,
}) => {
  const [examens, setExamens] = useState<Examen[]>([]);
  const [surveillants, setSurveillants] = useState<Surveillant[]>([]);
  const [idExamen, setIdExamen] = useState<number>(0);
  const [idSurveillant, setIdSurveillant] = useState<number>(0);

  // 🔹 Charger les données
  useEffect(() => {
    Promise.all([ApiService.getExamens(), ApiService.getSurveillants()]).then(
      ([examData, survData]) => {
        setExamens(examData);
        setSurveillants(survData);
      }
    );
  }, []);

  // 🔹 Préremplir si édition
  useEffect(() => {
    if (surveiller) {
      setIdExamen(surveiller.examen?.idExamen ?? 0);
      setIdSurveillant(surveiller.surveillant?.idSurveillant ?? 0);
    }
  }, [surveiller]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!idExamen || !idSurveillant) {
      alert("Veuillez sélectionner un examen et un surveillant !");
      return;
    }

    onSave(idExamen, idSurveillant);
  };

  return (
    <ModalForm
      title={
        surveiller
          ? "Modifier l’association Examen ↔ Surveillant"
          : "Associer un Surveillant à un Examen"
      }
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel={surveiller ? "Modifier" : "Associer"}
    >
      <div>
        <label className="block text-sm font-medium">Examen</label>
        <select
          value={idExamen}
          onChange={(e) => setIdExamen(Number(e.target.value))}
          className="w-full border border-emerald-600 bg-emerald-900 text-white rounded-md p-2 mt-1"
        >
          <option value={0}>-- Sélectionner --</option>
          {examens.map((examen) => (
            <option key={examen.idExamen} value={examen.idExamen}>
              {examen.matiere?.nomMatiere} - {examen.dateExamen}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">Surveillant</label>
        <select
          value={idSurveillant}
          onChange={(e) => setIdSurveillant(Number(e.target.value))}
          className="w-full border border-emerald-600 bg-emerald-900 text-white rounded-md p-2 mt-1"
        >
          <option value={0}>-- Sélectionner --</option>
          {surveillants.map((s) => (
            <option key={s.idSurveillant} value={s.idSurveillant}>
              {s.nomSurveillant} — Salle {s.numeroSalle}
            </option>
          ))}
        </select>
      </div>
    </ModalForm>
  );
};

export default SurveillerForm;
