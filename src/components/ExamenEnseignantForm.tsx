import React, { useEffect, useState } from "react";
import { ApiService } from "../services/ApiService";
import type { Examen } from "../models/Examen";
import type { Enseignant } from "../models/Enseignant";

interface Props {
  examen: Examen;
  onClose: () => void;
  onSaved: () => void;
}

const ExamenEnseignantForm: React.FC<Props> = ({ examen, onClose, onSaved }) => {
  const [enseignants, setEnseignants] = useState<Enseignant[]>([]);
  const [selectedEnseignants, setSelectedEnseignants] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger enseignants selon la matière de l’examen
  useEffect(() => {
    if (examen.matiere?.idMatiere) {
      ApiService.getEnseignantsByMatiere(examen.matiere.idMatiere)
        .then((data) => setEnseignants(data))
        .catch(() => setError("Erreur de chargement des enseignants."));
    }
  }, [examen]);

  const toggleEnseignant = (id: number) => {
    setSelectedEnseignants((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examen.idExamen) {
      setError("Examen non valide !");
      return;
    }

    setLoading(true);
    try {
      await ApiService.saveExamenEnseignants(examen.idExamen, selectedEnseignants);
      onSaved();
    } catch {
      setError("Erreur lors de l’enregistrement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4">
      <div className="bg-emerald-900 rounded-2xl p-6 text-white w-full max-w-md border border-emerald-600/50">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Associer enseignants à l’examen
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-sm mb-2 text-emerald-200">
              Matière : <strong>{examen.matiere.nomMatiere}</strong>
            </p>
            {enseignants.length === 0 && (
              <p className="text-gray-300 text-sm">
                Aucun enseignant trouvé pour cette matière.
              </p>
            )}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {enseignants.map((ens) => (
                <label
                  key={ens.idEnseignant}
                  className={`flex items-center gap-2 cursor-pointer p-2 rounded-lg border transition ${
                    selectedEnseignants.includes(ens.idEnseignant)
                      ? "bg-emerald-600 border-emerald-400"
                      : "bg-emerald-950 border-emerald-700 hover:bg-emerald-800"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedEnseignants.includes(ens.idEnseignant)}
                    onChange={() => toggleEnseignant(ens.idEnseignant)}
                  />
                  {ens.nomEnseignant} {ens.grade && <span>({ens.grade})</span>}
                </label>
              ))}
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-300 bg-red-900/30 p-2 rounded-md border border-red-700">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold"
            >
              {loading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExamenEnseignantForm;
