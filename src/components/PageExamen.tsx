import React, { useState } from "react";
import ExamenForm from "./ExamenForm";
import ExamenParcoursForm from "./ExamenParcoursForm";
import { ApiService } from "../services/ApiService";
import type { Examen } from "../models/Examen";

const PageExamen: React.FC = () => {
  // --- États pour gérer les formulaires ---
  const [showExamenForm, setShowExamenForm] = useState(false);
  const [showExamenParcoursForm, setShowExamenParcoursForm] = useState(false);
  const [examenCree, setExamenCree] = useState<Examen | null>(null);
  const [examens, setExamens] = useState<Examen[]>([]);

  // --- Charger les examens ---
  const chargerExamens = async () => {
    const data = await ApiService.getExamens();
    setExamens(data);
  };

  // --- Lorsqu’un examen est ajouté ---
  const handleExamenSaved = (examen: Examen) => {
    setExamenCree(examen);
    setShowExamenForm(false);
    setTimeout(() => setShowExamenParcoursForm(true), 200); // petit délai visuel
  };

  // --- Lorsqu’un ExamenParcours est sauvegardé ---
  const handleParcoursSaved = () => {
    alert("✅ Examen et parcours enregistrés avec succès !");
    setShowExamenParcoursForm(false);
    chargerExamens();
  };

  return (
    <div className="p-6 bg-emerald-950 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6 text-emerald-300">
        📘 Gestion des Examens
      </h1>

      <div className="mb-4">
        <button
          onClick={() => setShowExamenForm(true)}
          className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg font-semibold"
        >
          ➕ Ajouter un Examen
        </button>
      </div>

      {/* --- Liste des examens enregistrés --- */}
      <div className="bg-emerald-900/40 border border-emerald-700 rounded-xl p-4">
        <h2 className="text-xl font-semibold mb-3 text-emerald-200">
          Liste des examens
        </h2>
        <button
          onClick={chargerExamens}
          className="text-sm mb-3 px-3 py-1 bg-emerald-700 hover:bg-emerald-600 rounded-md"
        >
          🔄 Actualiser
        </button>

        {examens.length === 0 ? (
          <div className="text-gray-400">Aucun examen enregistré.</div>
        ) : (
          <table className="w-full text-sm border-collapse border border-emerald-700">
            <thead className="bg-emerald-800">
              <tr>
                <th className="border border-emerald-700 p-2">Matière</th>
                <th className="border border-emerald-700 p-2">Niveau</th>
                <th className="border border-emerald-700 p-2">Date</th>
                <th className="border border-emerald-700 p-2">Durée (h)</th>
                <th className="border border-emerald-700 p-2">Salles</th>
                <th className="border border-emerald-700 p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {examens.map((e) => (
                <tr key={e.idExamen} className="hover:bg-emerald-800/50">
                  <td className="border border-emerald-700 p-2">
                    {e.matiere?.nomMatiere}
                  </td>
                  <td className="border border-emerald-700 p-2">
                    {e.niveau?.codeNiveau}
                  </td>
                  <td className="border border-emerald-700 p-2">{e.dateExamen}</td>
                  <td className="border border-emerald-700 p-2">
                    {e.duree?.toFixed(2)}
                  </td>
                  <td className="border border-emerald-700 p-2">
                    {e.numeroSalle}
                  </td>
                  <td className="border border-emerald-700 p-2 space-x-2">
                    <button
                      onClick={() => {
                        setExamenCree(e);
                        setShowExamenParcoursForm(true);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md text-white text-sm"
                    >
                      🧭 Parcours
                    </button>
                    <button
                      onClick={async () => {
                        if (
                          confirm(
                            `Supprimer l’examen de ${e.matiere?.nomMatiere} ?`
                          )
                        ) {
                          await ApiService.deleteExamen(e.idExamen!);
                          chargerExamens();
                        }
                      }}
                      className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md text-white text-sm"
                    >
                      🗑 Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* --- Modales --- */}
      {showExamenForm && (
        <ExamenForm
          onSave={handleExamenSaved}
          onClose={() => setShowExamenForm(false)}
        />
      )}

      {showExamenParcoursForm && examenCree && (
        <ExamenParcoursForm
          examenId={examenCree.idExamen}
          onSave={handleParcoursSaved}
          onClose={() => setShowExamenParcoursForm(false)}
        />
      )}
    </div>
  );
};

export default PageExamen;
