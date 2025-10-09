import React, { useEffect, useState } from "react";
import { ApiService } from "../services/ApiService";
import type { PlanningSurveillance } from "../models/PlanningSurveillance";
import PlanningSurveillanceForm from "./PlanningSurveillanceForm";

const PlanningSurveillanceList: React.FC = () => {
  const [planningList, setPlanningList] = useState<PlanningSurveillance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PlanningSurveillance | null>(null);

  // 🔹 Charger le planning
  useEffect(() => {
    ApiService.getPlanningSurveillance()
      .then((data) => {
        setPlanningList(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Erreur lors du chargement du planning de surveillance.");
        setLoading(false);
      });
  }, []);

  // 🔹 Sauvegarde
  const handleSave = (planning: PlanningSurveillance) => {
    ApiService.savePlanningSurveillance(planning)
      .then((saved) => {
        if (editing) {
          setPlanningList((prev) =>
            prev.map((p) =>
              p.idPlanning === saved.idPlanning ? saved : p
            )
          );
        } else {
          setPlanningList((prev) => [...prev, saved]);
        }
        setShowForm(false);
        setEditing(null);
      })
      .catch(() => alert("Erreur lors de la sauvegarde du planning."));
  };

  // 🔹 Suppression
  const handleDelete = (id: number) => {
    if (confirm("Voulez-vous vraiment supprimer ce planning ?")) {
      ApiService.deletePlanningSurveillance(id)
        .then(() => {
          setPlanningList((prev) =>
            prev.filter((p) => p.idPlanning !== id)
          );
        })
        .catch(() => alert("Erreur lors de la suppression."));
    }
  };

  if (loading)
    return <div className="text-center text-gray-300">Chargement...</div>;
  if (error)
    return <div className="text-center text-red-400">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">
          📋 Planning de Surveillance
        </h2>
        <button
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md"
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
        >
          ➕ Ajouter
        </button>
      </div>

      {/* 🧾 Tableau de planning */}
      <div className="overflow-x-auto">
        <table className="w-full border border-emerald-700 rounded-lg text-sm text-white">
          <thead className="bg-emerald-800">
            <tr>
              <th className="p-2 border border-emerald-700 text-left">Examen</th>
              <th className="p-2 border border-emerald-700 text-left">Salle</th>
              <th className="p-2 border border-emerald-700 text-left">Surveillant</th>
              <th className="p-2 border border-emerald-700 text-center">Date</th>
              <th className="p-2 border border-emerald-700 text-center">Début</th>
              <th className="p-2 border border-emerald-700 text-center">Fin</th>
              <th className="p-2 border border-emerald-700 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {planningList.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="text-center text-gray-400 py-3 border border-emerald-700"
                >
                  Aucun planning enregistré.
                </td>
              </tr>
            ) : (
              planningList.map((p) => (
                <tr key={p.idPlanning} className="hover:bg-emerald-700 transition">
                  <td className="p-2 border border-emerald-700">
                    {p.examen?.matiere?.nomMatiere ?? "—"}
                  </td>
                  <td className="p-2 border border-emerald-700">
                    {p.salle?.numeroSalle ?? "—"}
                  </td>
                  <td className="p-2 border border-emerald-700">
                    {p.surveillant?.nomSurveillant ?? "—"}
                  </td>
                  <td className="p-2 border border-emerald-700 text-center">
                    {p.examen?.dateExamen ?? "—"}
                  </td>
                  <td className="p-2 border border-emerald-700 text-center">
                    {p.heureDebut
                      ? new Date(p.heureDebut).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </td>
                  <td className="p-2 border border-emerald-700 text-center">
                    {p.heureFin
                      ? new Date(p.heureFin).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </td>
                  <td className="p-2 border border-emerald-700 text-center space-x-2">
                    <button
                      onClick={() => {
                        setEditing(p);
                        setShowForm(true);
                      }}
                      className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-700"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(p.idPlanning!)}
                      className="px-2 py-1 rounded bg-red-600 hover:bg-red-700"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 🧩 Modal Formulaire */}
      {showForm && (
        <PlanningSurveillanceForm
          planning={editing ?? undefined}
          onSave={handleSave}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
};

export default PlanningSurveillanceList;
