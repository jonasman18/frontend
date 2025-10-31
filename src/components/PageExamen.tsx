import React, { useEffect, useState } from "react";
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
  const [loadingList, setLoadingList] = useState(false); // ✅ Pour actualisation liste

  // --- Charger les examens ---
  const chargerExamens = async () => {
    setLoadingList(true);
    try {
      const data = await ApiService.getExamens();
      setExamens(data);
    } catch (err) {
      console.error("Erreur chargement examens:", err);
      // Optionnel : setError pour UI
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    chargerExamens(); // ✅ Charge initial
  }, []);

  // --- Lorsqu’un examen est ajouté / modifié --- Améliorée : async, API call, retour Promise<Examen>
  const handleExamenSaved = async (examen: Examen): Promise<Examen> => {
    try {
      const saved = await ApiService.saveExamen(examen);
      setExamenCree(saved);
      setShowExamenForm(false);

      // 👉 Si c’est un ajout, ouvrir ExamenParcoursForm
      const isEdit = !!examen.idExamen;
      if (!isEdit) {
        setTimeout(() => setShowExamenParcoursForm(true), 200); // petit délai visuel
      }

      chargerExamens(); // ✅ Refresh liste après save
      return saved; // ✅ Retour pour ExamenForm
    } catch (err) {
      console.error("Erreur enregistrement examen:", err);
      throw new Error("Erreur lors de l’enregistrement"); // ✅ Propager pour gestion dans child
    }
  };

  // --- Lorsqu’un ExamenParcours est sauvegardé ---
  const handleParcoursSaved = () => {
    // Amélioré : Pas d'alert, mais message plus élégant (optionnel : toast)
    console.log("✅ Examen et parcours enregistrés avec succès !");
    setShowExamenParcoursForm(false);
    chargerExamens(); // ✅ Refresh après save parcours
  };

  return (
    <div className="p-6 bg-emerald-950 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6 text-emerald-300">
        📘 Gestion des Examens
      </h1>

      <div className="mb-4">
        <button
          onClick={() => setShowExamenForm(true)}
          className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          ➕ Ajouter un Examen
        </button>
      </div>

      {/* --- Liste des examens enregistrés --- */}
      <div className="bg-emerald-900/40 border border-emerald-700 rounded-xl p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold text-emerald-200">
            Liste des examens
          </h2>
          <button
            onClick={chargerExamens}
            disabled={loadingList}
            className="text-sm px-3 py-1 bg-emerald-700 hover:bg-emerald-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingList ? "🔄" : "🔄 Actualiser"}
          </button>
        </div>

        {examens.length === 0 ? (
          <div className="text-gray-400 text-center py-8">Aucun examen enregistré.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse border border-emerald-700">
              <thead className="bg-emerald-800">
                <tr>
                  <th className="border border-emerald-700 p-2 text-left">Matière</th>
                  <th className="border border-emerald-700 p-2 text-left">Niveau</th>
                  <th className="border border-emerald-700 p-2 text-left">Date</th>
                  <th className="border border-emerald-700 p-2 text-left">Durée (h)</th>
                  <th className="border border-emerald-700 p-2 text-left">Salles</th>
                  <th className="border border-emerald-700 p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {examens.map((e) => (
                  <tr key={e.idExamen} className="hover:bg-emerald-800/50 transition-colors">
                    <td className="border border-emerald-700 p-2">
                      {e.matiere?.nomMatiere || "N/A"}
                    </td>
                    <td className="border border-emerald-700 p-2">
                      {e.niveau?.codeNiveau || "N/A"}
                    </td>
                    <td className="border border-emerald-700 p-2">{e.dateExamen || "N/A"}</td>
                    <td className="border border-emerald-700 p-2">
                      {e.duree?.toFixed(2) || "N/A"}
                    </td>
                    <td className="border border-emerald-700 p-2">
                      {e.numeroSalle || "N/A"}
                    </td>
                    <td className="border border-emerald-700 p-2 space-x-2">
                      <button
                        onClick={() => {
                          setExamenCree(e);
                          setShowExamenParcoursForm(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md text-white text-sm transition-colors"
                      >
                        🧭 Parcours
                      </button>
                      <button
                        onClick={async () => {
                          if (
                            confirm(
                              `Supprimer l’examen de ${e.matiere?.nomMatiere || "cet examen"} ?`
                            )
                          ) {
                            try {
                              await ApiService.deleteExamen(e.idExamen!);
                              chargerExamens();
                            } catch (err) {
                              console.error("Erreur suppression:", err);
                              alert("Erreur lors de la suppression");
                            }
                          }
                        }}
                        className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md text-white text-sm transition-colors"
                      >
                        🗑 Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- Modales --- */}
      {showExamenForm && (
        <ExamenForm
          onSave={handleExamenSaved} // ✅ Async Promise<Examen>
          onClose={() => setShowExamenForm(false)}
        />
      )}

      {showExamenParcoursForm && examenCree && (
        <ExamenParcoursForm
          examenId={examenCree.idExamen!}
          onSave={handleParcoursSaved}
          onClose={() => setShowExamenParcoursForm(false)}
        />
      )}
    </div>
  );
};

export default PageExamen;