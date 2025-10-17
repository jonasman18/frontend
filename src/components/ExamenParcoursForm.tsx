import React, { useEffect, useState } from "react";
import { ApiService } from "../services/ApiService";
import type { Examen } from "../models/Examen";
import type { Parcours } from "../models/Parcours";
import ModalForm from "./ModalForm";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  examenId?: number;
  onSave: () => void;
  onClose: () => void;
}

const ExamenParcoursForm: React.FC<Props> = ({ examenId, onSave, onClose }) => {
  const [examens, setExamens] = useState<Examen[]>([]);
  const [parcoursList, setParcoursList] = useState<Parcours[]>([]);
  const [selectedExam, setSelectedExam] = useState<number>(examenId ?? 0);
  const [selectedParcours, setSelectedParcours] = useState<number[]>([]);
  const [hadAssociations, setHadAssociations] = useState(false);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Charger examens + parcours + associations existantes
  useEffect(() => {
    setLoading(true);
    Promise.all([ApiService.getExamens(), ApiService.getParcours()])
      .then(async ([examData, parcData]) => {
        setExamens(examData ?? []);
        setParcoursList(parcData ?? []);

        if (examenId) {
          const all = await ApiService.getExamenParcours();
          const current = all.filter((a) => a.examen?.idExamen === examenId);
          setSelectedParcours(current.map((c) => c.parcours?.idParcours ?? 0));
          setHadAssociations(current.length > 0);
        }
      })
      .finally(() => setLoading(false));
  }, [examenId]);

  // Toggle sélection parcours
  const toggleParcours = (id: number) => {
    setSelectedParcours((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Afficher alerte temporaire
  const showAlert = (type: "success" | "error", message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 3000);
  };

  // Soumission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedExam) {
      showAlert("error", "Veuillez sélectionner un examen.");
      return;
    }

    ApiService.updateExamenParcoursGlobal(selectedExam, selectedParcours)
      .then(() => {
        showAlert(
          "success",
          hadAssociations
            ? "✅ Mise à jour des parcours réussie !"
            : "✅ Association ajoutée avec succès !"
        );

        setTimeout(() => {
          onSave();
          onClose();
        }, 1000);
      })
      .catch(() => showAlert("error", "❌ Erreur lors de la mise à jour globale."));
  };

  return (
    <div className="relative">
      {/* 🌟 Alerte stylée et centrée */}
      <AnimatePresence>
        {alert && (
          <motion.div
            key="alert"
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className={`fixed top-8 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-xl shadow-2xl text-white font-semibold text-center z-[1000] ${
              alert.type === "success"
                ? "bg-emerald-600/95 backdrop-blur-sm border border-emerald-400/40"
                : "bg-red-600/95 backdrop-blur-sm border border-red-400/40"
            }`}
          >
            {alert.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔶 Formulaire principal */}
      <ModalForm
        title="Quels parcours ?"
        onClose={onClose}
        onSubmit={handleSubmit}
        submitLabel="Enregistrer"
      >
        {loading ? (
          <div className="text-center text-gray-300">Chargement...</div>
        ) : (
          <>
            {/* Sélecteur d’examen */}
            <div>
              <label className="block text-sm font-medium">Examen</label>
              <select
                value={selectedExam}
                onChange={(e) => setSelectedExam(Number(e.target.value))}
                disabled={!!examenId}
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

            {/* Sélecteur multi-parcours */}
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Parcours</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                {parcoursList.map((p) => (
                  <label
                    key={p.idParcours}
                    className="flex items-center gap-2 cursor-pointer bg-emerald-800 rounded-md px-2 py-1 hover:bg-emerald-700 transition"
                  >
                    <input
                      type="checkbox"
                      checked={selectedParcours.includes(p.idParcours ?? 0)}
                      onChange={() => toggleParcours(p.idParcours ?? 0)}
                    />
                    {p.codeParcours}
                  </label>
                ))}
              </div>
            </div>
          </>
        )}
      </ModalForm>
    </div>
  );
};

export default ExamenParcoursForm;
