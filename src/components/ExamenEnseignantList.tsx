import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiService } from "../services/ApiService";
import type { Examen } from "../models/Examen";
import type { Enseignant } from "../models/Enseignant";
import TableList from "./TableList";

// Composant principal
export default function ExamenEnseignantList() {
  const navigate = useNavigate();
  const [examens, setExamens] = useState<Examen[]>([]);
  const [enseignants, setEnseignants] = useState<Enseignant[]>([]);
  const [selectedExamen, setSelectedExamen] = useState<Examen | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🟢 Charger la liste des examens au montage
  useEffect(() => {
    const fetchExamens = async () => {
      try {
        setLoading(true);
        const data = await ApiService.getExamens();
        setExamens(data);
      } catch {
        setError("❌ Erreur lors du chargement des examens.");
      } finally {
        setLoading(false);
      }
    };
    fetchExamens();
  }, []);

  // 🧑‍🏫 Ouvrir la modale pour un examen
  const openModal = async (examen: Examen) => {
    setSelectedExamen(examen);
    setShowModal(true);
    setLoading(true);
    setError(null);

    try {
      const idMatiere = examen.matiere?.idMatiere;
      let enseignantsMat: Enseignant[] = [];

      if (typeof idMatiere === "number") {
        enseignantsMat = await ApiService.getEnseignantsByMatiere(idMatiere);
      }

      const resp = await fetch(`http://localhost:8080/api/examens/${examen.idExamen}/enseignants`);
      if (!resp.ok) throw new Error("Erreur lors de la récupération des enseignants de l'examen");
      const ensExamen = await resp.json();

      const selected = ensExamen.map((ee: any) => ee.enseignant.idEnseignant);
      setSelectedIds(selected);
      setEnseignants(enseignantsMat);
    } catch {
      setError("⚠️ Impossible de charger les enseignants de cet examen.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Sélection / désélection d’un enseignant
  const toggleSelection = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // 💾 Sauvegarder les associations
  const handleSave = async () => {
    if (!selectedExamen) return;
    setSaving(true);
    try {
      await ApiService.saveExamenEnseignants(selectedExamen.idExamen!, selectedIds);
      alert("✅ Enseignants associés avec succès !");
      setShowModal(false);
    } catch {
      alert("❌ Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  // 🧹 Fermer la modale proprement
  const closeModal = () => {
    setShowModal(false);
    setSelectedIds([]);
    setEnseignants([]);
    setSelectedExamen(null);
  };

  const columns = [
    {
      key: "matiere.nomMatiere",
      label: "Matière",
    },
    {
      key: "niveau.codeNiveau",
      label: "Niveau",
    },
    {
      key: "dateExamen",
      label: "Date",
    },
    {
      key: "action",
      label: "Action",
      render: (ex: Examen) => (
        <div className="text-center">
          <button
            onClick={() => openModal(ex)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-lg shadow-sm"
          >
            🧑‍🏫 Gérer enseignants
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6 text-emerald-700">
        🧾 Gestion des Enseignants par Examen
      </h1>

      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded-md mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-center text-gray-500">Chargement des examens...</p>
      ) : (
        <TableList<Examen>
          title="Liste des Examens"
          columns={columns}
          data={examens}
          idKey="idExamen"
          onAdd={() => navigate("/examen-enseignant-form")}
          onEdit={() => {}}
          onDelete={() => {}}
          showActions={false}
        />
      )}

      {/* 🔹 MODALE D’AFFECTATION */}
      {showModal && selectedExamen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative animate-fadeIn">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-600 text-lg"
            >
              ✕
            </button>

            <h2 className="text-xl font-semibold mb-4 text-emerald-700">
              Enseignants pour <span className="text-gray-700">{selectedExamen.matiere.nomMatiere}</span>
            </h2>

            {loading ? (
              <p className="text-center text-gray-500">Chargement...</p>
            ) : enseignants.length === 0 ? (
              <p className="text-center text-gray-500 italic">
                Aucun enseignant trouvé pour cette matière.
              </p>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2">
                {enseignants.map((e) => (
                  <label
                    key={e.idEnseignant}
                    className={`flex items-center gap-3 border p-2 rounded-lg cursor-pointer transition-all ${
                      selectedIds.includes(e.idEnseignant)
                        ? "bg-emerald-100 border-emerald-400"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(e.idEnseignant)}
                      onChange={() => toggleSelection(e.idEnseignant)}
                    />
                    <div>
                      <span className="font-medium">{e.nomEnseignant}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        ({e.grade || "—"})
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className={`px-4 py-2 rounded-lg text-white ${
                  saving
                    ? "bg-emerald-400 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {saving ? "Enregistrement..." : "💾 Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}