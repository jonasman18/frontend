import React, { useEffect, useState } from "react";
import { ApiService } from "../services/ApiService";
import type { Examen } from "../models/Examen";
import type { Surveillant } from "../models/Surveillant";
import ModalForm from "./ModalForm";

interface SurveillerFormProps {
  onSave: (idExamen: number, idSurveillant: number) => void;
  onClose: () => void;
}

const SurveillerForm: React.FC<SurveillerFormProps> = ({ onSave, onClose }) => {
  const [examens, setExamens] = useState<Examen[]>([]);
  const [surveillants, setSurveillants] = useState<Surveillant[]>([]);
  const [idExamen, setIdExamen] = useState<number>(0);
  const [idSurveillant, setIdSurveillant] = useState<number>(0);

  useEffect(() => {
    ApiService.getExamens().then(setExamens);
    ApiService.getSurveillants().then(setSurveillants);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (idExamen && idSurveillant) {
      onSave(idExamen, idSurveillant);
    } else {
      alert("Veuillez sélectionner un examen et un surveillant !");
    }
  };

  return (
    <ModalForm title="Associer un Surveillant à un Examen" onClose={onClose} onSubmit={handleSubmit} submitLabel="Associer">
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
              {s.nomSurveillant}
            </option>
          ))}
        </select>
      </div>
    </ModalForm>
  );
};

export default SurveillerForm;
