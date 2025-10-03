import React, { useEffect, useState } from "react";
import { ApiService } from "../services/ApiService";
import type { Examen } from "../models/Examen";
import type { Parcours } from "../models/Parcours";
import type { ExamenParcours } from "../models/ExamenParcours";
import ModalForm from "./ModalForm";

interface Props {
  examenParcours?: ExamenParcours;
  onSave: (ep: ExamenParcours) => void;
  onClose: () => void;
}

const ExamenParcoursForm: React.FC<Props> = ({
  examenParcours,
  onSave,
  onClose,
}) => {
  const [examens, setExamens] = useState<Examen[]>([]);
  const [parcoursList, setParcoursList] = useState<Parcours[]>([]);
  const [idExamen, setIdExamen] = useState<number>(
    examenParcours?.id?.idExamen ?? examenParcours?.examen?.idExamen ?? 0
  );
  const [idParcours, setIdParcours] = useState<number>(
    examenParcours?.id?.idParcours ?? examenParcours?.parcours?.idParcours ?? 0
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([ApiService.getExamens(), ApiService.getParcours()])
      .then(([examData, parcData]) => {
        setExamens(examData ?? []);
        setParcoursList(parcData ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!idExamen || !idParcours) {
      alert("Veuillez sélectionner un examen et un parcours");
      return;
    }

    const payload: ExamenParcours = {
      id: { idExamen, idParcours },
      examen: { idExamen } as any,
      parcours: { idParcours } as any,
    };

    onSave(payload);
  };

  return (
    <ModalForm
      title={
        examenParcours
          ? "Modifier Association Examen ↔ Parcours"
          : "Nouvelle Association Examen ↔ Parcours"
      }
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel={examenParcours ? "Mettre à jour" : "Associer"}
    >
      {loading ? (
        <div className="text-center text-gray-300">Chargement des options...</div>
      ) : (
        <>
          {/* Sélecteur Examen */}
          <div>
            <label className="block text-sm font-medium">Examen</label>
            <select
              value={idExamen}
              onChange={(e) => setIdExamen(Number(e.target.value))}
              className="w-full border border-emerald-600 bg-emerald-900 text-white rounded-md p-2 mt-1 focus:ring-2 focus:ring-emerald-400"
            >
              <option value={0}>-- Sélectionner un examen --</option>
              {examens.map((e) => (
                <option key={e.idExamen} value={e.idExamen}>
                  {e.matiere?.nomMatiere} — {e.dateExamen}
                </option>
              ))}
            </select>
          </div>

          {/* Sélecteur Parcours */}
          <div>
            <label className="block text-sm font-medium">Parcours</label>
            <select
              value={idParcours}
              onChange={(e) => setIdParcours(Number(e.target.value))}
              className="w-full border border-emerald-600 bg-emerald-900 text-white rounded-md p-2 mt-1 focus:ring-2 focus:ring-emerald-400"
            >
              <option value={0}>-- Sélectionner un parcours --</option>
              {parcoursList.map((p) => (
                <option key={p.idParcours} value={p.idParcours}>
                  {p.codeParcours} — {p.libelleParcours}
                </option>
              ))}
            </select>
          </div>
        </>
      )}
    </ModalForm>
  );
};

export default ExamenParcoursForm;
