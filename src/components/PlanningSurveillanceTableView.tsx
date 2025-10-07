/*
import React, { useEffect, useState } from "react";
import { ApiService } from "../services/ApiService";
import type { PlanningSurveillance } from "../models/PlanningSurveillance";

const PlanningSurveillanceTableView: React.FC = () => {
  const [plannings, setPlannings] = useState<PlanningSurveillance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    ApiService.getPlanningSurveillance()
      .then((data) => {
        setPlannings(data);
        setLoading(false);
      })
      .catch(() => alert("Erreur lors du chargement du planning"));
  }, []);

  const filtered = selectedDate
    ? plannings.filter((p) => p.dateExamen === selectedDate)
    : plannings;

  if (loading)
    return (
      <div className="text-center text-gray-400">Chargement du planning...</div>
    );

  return (
    <div className="p-4 bg-emerald-950 text-white rounded-lg shadow-md space-y-4">
      <h2 className="text-2xl font-semibold text-emerald-300 mb-3">
        🗓️ Planning de Surveillance
      </h2>

     
      <div className="flex justify-between items-center mb-3">
        <div>
          <label className="mr-2">Filtrer par date :</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-emerald-600 bg-emerald-900 text-white rounded-md p-1"
          />
        </div>
        {selectedDate && (
          <button
            onClick={() => setSelectedDate("")}
            className="text-sm text-emerald-400 underline"
          >
            Effacer le filtre
          </button>
        )}
      </div>

     
      <table className="min-w-full border border-emerald-700 rounded-lg overflow-hidden text-sm">
        <thead className="bg-emerald-800 text-emerald-200 uppercase">
          <tr>
            <th className="px-3 py-2 border border-emerald-700">Heure</th>
            <th className="px-3 py-2 border border-emerald-700">Salle</th>
            <th className="px-3 py-2 border border-emerald-700">Parcours</th>
            <th className="px-3 py-2 border border-emerald-700">Surveillants</th>
            <th className="px-3 py-2 border border-emerald-700">Matière</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length > 0 ? (
            filtered.map((p) => (
              <tr
                key={p.idPlanning}
                className="hover:bg-emerald-800 transition-all"
              >
                <td className="px-3 py-2 border border-emerald-700 text-center">
                  {p.heureDebut} - {p.heureFin}
                </td>
                <td className="px-3 py-2 border border-emerald-700 text-center">
                  {p.salle?.numeroSalle || "—"}
                </td>
                <td className="px-3 py-2 border border-emerald-700 text-center">
                  {p.parcours?.codeParcours || "—"}
                </td>
                <td className="px-3 py-2 border border-emerald-700">
                  {p.surveillant || "—"}
                </td>
                <td className="px-3 py-2 border border-emerald-700 text-center">
                  {p.examen?.matiere?.nomMatiere || "—"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={5}
                className="text-center py-3 text-gray-400 border border-emerald-700"
              >
                Aucun planning trouvé {selectedDate ? "pour cette date" : ""}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PlanningSurveillanceTableView; 

*/
