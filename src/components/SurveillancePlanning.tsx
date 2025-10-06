/* import React, { useEffect, useState } from "react";
import { ApiService } from "../services/ApiService";
import type { Examen } from "../models/Examen";
import type { Surveiller } from "../models/Surveiller";
import type { Repartir } from "../models/Repartir";
import type { Salle } from "../models/Salle";

const SurveillancePlanning: React.FC = () => {
  const [examens, setExamens] = useState<Examen[]>([]);
  const [repartitions, setRepartitions] = useState<Repartir[]>([]);
  const [surveillances, setSurveillances] = useState<Surveiller[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      ApiService.getExamens(),
      ApiService.getRepartir(),
      ApiService.getSurveiller(),
    ])
      .then(([examData, repartirData, surveillerData]) => {
        setExamens(examData ?? []);
        setRepartitions(repartirData ?? []);
        setSurveillances(surveillerData ?? []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerate = async () => {
    if (!window.confirm("Voulez-vous générer automatiquement le planning ?")) return;
    try {
      await ApiService.generateAutoSurveillance();
      alert("Planning généré avec succès !");
      loadData();
    } catch (error) {
      alert("Erreur lors de la génération automatique.");
    }
  };

  if (loading) return <div className="text-center mt-6">Chargement...</div>;

  // 🧩 Relier examen → répartition → salles → surveillants
  const planning = examens.map((ex) => {
    const sallesExamen = repartitions
      .filter((r) => r.repartition?.idRepartition === ex.repartition?.idRepartition)
      .map((r) => r.salle);

    const sallesAvecSurveillants = sallesExamen.map((salle) => {
      const surveillantsSalle = surveillances
        .filter((sv) => sv.surveillant?.numeroSalle === salle?.numeroSalle)
        .map((sv) => sv.surveillant);
      return { salle, surveillantsSalle };
    });

    return { examen: ex, salles: sallesAvecSurveillants };
  });

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-semibold text-emerald-300">
          🧾 Planning de Surveillance
        </h1>
        <button
          onClick={handleGenerate}
          className="bg-emerald-700 hover:bg-emerald-600 px-4 py-2 rounded-md font-semibold"
        >
          ⚙️ Générer automatiquement
        </button>
      </div>

      {planning.map(({ examen, salles }) => (
        <div key={examen.idExamen} className="bg-emerald-900 rounded-lg p-4 mb-6 shadow">
          <h2 className="text-lg font-bold text-white mb-2">
            {examen.matiere?.nomMatiere} — {examen.dateExamen}
          </h2>

          {salles.length === 0 ? (
            <p className="text-gray-400">Aucune salle liée à cet examen.</p>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {salles.map(({ salle, surveillantsSalle }) => (
                <div
                  key={salle?.numeroSalle}
                  className="bg-emerald-800 rounded-md p-3 border border-emerald-600"
                >
                  <h3 className="text-emerald-200 font-semibold mb-1">
                    Salle {salle?.numeroSalle}
                  </h3>

                  {surveillantsSalle.length > 0 ? (
                    <ul className="list-disc list-inside text-gray-100">
                      {surveillantsSalle.map((s) => (
                        <li key={s.idSurveillant}>
                          {s.nomSurveillant} 
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-400 text-sm">
                      Aucun surveillant assigné
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SurveillancePlanning; */
