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
  const [examen, setExamen] = useState<Examen | null>(null);
  const [parcoursList, setParcoursList] = useState<Parcours[]>([]);
  const [selectedParcours, setSelectedParcours] = useState<number[]>([]);
  const [hadAssociations, setHadAssociations] = useState(false);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // ✅ Charger uniquement les données nécessaires
  useEffect(() => {
    if (!examenId) return;

    setLoading(true);

    Promise.all([
      ApiService.getExamenById(examenId), // 🧩 charge uniquement cet examen
      ApiService.getParcours(), // 🧩 tous les parcours
      ApiService.getExamenParcours(), // 🧩 associations examen <-> parcours
    ])
      .then(([exam, parcours, examParcours]) => {
        setExamen(exam);
        setParcoursList(parcours ?? []);

        const current = examParcours.filter((a) => a.examen?.idExamen === examenId);
        setSelectedParcours(current.map((c) => c.parcours?.idParcours ?? 0));
        setHadAssociations(current.length > 0);
      })
      .finally(() => setLoading(false));
  }, [examenId]);

  // ✅ Sélection / désélection
  const toggleParcours = (id: number) => {
    setSelectedParcours((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // ✅ Alerte animée
  const showAlert = (type: "success" | "error", message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 2500);
  };

  // ✅ Soumission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!examenId) {
      showAlert("error", "Aucun examen sélectionné !");
      return;
    }

    ApiService.updateExamenParcoursGlobal(examenId, selectedParcours)
      .then(() => {
        showAlert(
          "success",
          hadAssociations
            ? "✅ Parcours mis à jour avec succès !"
            : "✅ Parcours associés à l'examen !"
        );

        setTimeout(() => {
          onSave();
          onClose();
        }, 900);
      })
      .catch(() => showAlert("error", "❌ Erreur lors de la mise à jour."));
  };

  return (
    <div className="relative">
      {/* 🌟 Popup d’alerte */}
      <AnimatePresence>
        {alert && (
          <motion.div
            key="alert"
            initial={{ opacity: 0, y: -25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className={`fixed top-8 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-xl shadow-xl text-white font-semibold text-center z-[1000] ${
              alert.type === "success"
                ? "bg-emerald-600/95 backdrop-blur-md border border-emerald-400/40"
                : "bg-red-600/95 backdrop-blur-md border border-red-400/40"
            }`}
          >
            {alert.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🧭 Formulaire principal */}
      <ModalForm
        title="🧭 Quels parcours ?"
        onClose={onClose}
        onSubmit={handleSubmit}
        submitLabel="Enregistrer"
      >
        {loading ? (
          <div className="text-center text-gray-300 py-4 animate-pulse">
            Chargement des parcours...
          </div>
        ) : (
          <>
            {/* ✅ Info de l’examen */}
            {examen && (
              <div className="mb-4 text-sm text-emerald-200 bg-emerald-950/50 border border-emerald-700/40 rounded-xl p-3 shadow-inner">
                <p className="font-semibold text-emerald-300 text-lg">
                  📘 {examen.matiere?.nomMatiere ?? "Matière inconnue"}
                </p>
                <p>
                  📅{" "}
                  {examen.dateExamen
                    ? new Date(examen.dateExamen).toLocaleDateString("fr-FR")
                    : "Date non précisée"}{" "}
                  — 🕒{" "}
                  {examen.heureDebut
                    ? new Date(examen.heureDebut).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "--:--"}
                </p>
                {examen.niveau?.codeNiveau && (
                  <p>🎓 Niveau : {examen.niveau.codeNiveau}</p>
                )}
                {examen.numeroSalle && <p>🏫 Salle : {examen.numeroSalle}</p>}
              </div>
            )}

            {/* ✅ Sélecteur de parcours */}
            <div>
              <label className="block text-sm font-medium text-emerald-200 mb-2">
                Parcours concernés :
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {parcoursList.map((p) => (
                  <label
                    key={p.idParcours}
                    className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-xl border-2 transition-all duration-200 text-sm font-medium ${
                      selectedParcours.includes(p.idParcours ?? 0)
                        ? "bg-emerald-600/70 border-emerald-400 text-white"
                        : "bg-emerald-950/50 border-emerald-700 hover:bg-emerald-800/40 text-gray-200"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedParcours.includes(p.idParcours ?? 0)}
                      onChange={() => toggleParcours(p.idParcours ?? 0)}
                      className="accent-emerald-500"
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
