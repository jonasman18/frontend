import React, { useEffect, useState, useMemo } from "react";
import { ApiService } from "../services/ApiService";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { PlanningSurveillance } from "../models/PlanningSurveillance";
import PlanningSurveillanceForm from "./PlanningSurveillanceForm";

const PlanningSurveillanceList: React.FC = () => {
  const [planningList, setPlanningList] = useState<PlanningSurveillance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PlanningSurveillance | null>(null);

  // Chargement
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

  const handleSave = (newPlannings: PlanningSurveillance[] | PlanningSurveillance) => {
    if (Array.isArray(newPlannings)) {
      setPlanningList((prev) => [...prev, ...newPlannings]);
    } else {
      setPlanningList((prev) =>
        editing
          ? prev.map((p) => (p.idPlanning === newPlannings.idPlanning ? newPlannings : p))
          : [...prev, newPlannings]
      );
    }
    setShowForm(false);
    setEditing(null);
  };

  const handleDelete = (id: number) => {
    if (confirm("Voulez-vous vraiment supprimer ce planning ?")) {
      ApiService.deletePlanningSurveillance(id)
        .then(() => setPlanningList((prev) => prev.filter((p) => p.idPlanning !== id)))
        .catch(() => alert("Erreur lors de la suppression."));
    }
  };

  const formatTime = (time?: string) =>
    time ? new Date(time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";

  // --- Groupement par matière et salle
  const groupedByMatiere = useMemo(() => {
    return planningList.reduce((acc, p) => {
      const matiere = p.examen?.matiere?.nomMatiere ?? "Inconnue";
      const salle = p.salle?.numeroSalle ?? "—";
      if (!acc[matiere]) acc[matiere] = {};
      if (!acc[matiere][salle]) acc[matiere][salle] = [];
      acc[matiere][salle].push(p);
      return acc;
    }, {} as Record<string, Record<string, PlanningSurveillance[]>>);
  }, [planningList]);

  // --- Statistiques en haut ---
  const stats = useMemo(() => {
    const totalExamens = new Set(planningList.map((p) => p.examen?.idExamen)).size;
    const totalSalles = new Set(planningList.map((p) => p.salle?.numeroSalle)).size;
    const totalSurveillants = new Set(planningList.map((p) => p.surveillant?.idSurveillant)).size;
    return { totalExamens, totalSalles, totalSurveillants, totalPlannings: planningList.length };
  }, [planningList]);

  // --- Export PDF ---
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("RÉPARTITION DES SURVEILLANTS", 105, 20, { align: "center" });

    autoTable(doc, {
      startY: 28,
      head: [["Matière", "Salle", "Surveillants", "Date", "Début", "Fin"]],
      body: Object.entries(groupedByMatiere).flatMap(([matiere, salles]) =>
        Object.entries(salles).map(([salle, rows], i) => [
          i === 0 ? matiere : "",
          salle,
          rows.map((p) => p.surveillant?.nomSurveillant).join(", "),
          rows[0].examen?.dateExamen ?? "",
          formatTime(rows[0].heureDebut ?? rows[0].examen?.heureDebut),
          formatTime(rows[0].heureFin ?? rows[0].examen?.heureFin),
        ])
      ),
      styles: { fontSize: 9, halign: "center" },
      headStyles: { fillColor: [25, 90, 60], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 248, 245] },
    });

    doc.save("Repartition_Surveillants.pdf");
  };

  if (loading)
    return <div className="text-center text-gray-400 py-4">Chargement...</div>;
  if (error)
    return <div className="text-center text-red-400 py-4">{error}</div>;

  return (
    <div className="space-y-8 bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 p-6 rounded-2xl shadow-xl border border-emerald-800">
      {/* === HEADER === */}
      <div className="flex justify-between items-center border-b border-emerald-800 pb-3">
        <h2 className="text-3xl font-bold text-emerald-300 tracking-wide">
          🧾 RÉPARTITION DES SURVEILLANTS
        </h2>
        <div className="flex gap-3">
          <button
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg shadow-md font-medium transition"
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
          >
            ➕ Ajouter
          </button>
          <button
            onClick={exportPDF}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-md font-medium transition"
          >
            📄 Exporter PDF
          </button>
        </div>
      </div>

      {/* === RÉCAPITULATIF === */}
      <div className="grid grid-cols-4 gap-4 text-center text-sm font-medium">
        <div className="bg-emerald-800/40 border border-emerald-700 py-3 rounded-md shadow-inner text-emerald-200">
          <div className="text-2xl font-bold text-emerald-300">{stats.totalExamens}</div>
          Examens
        </div>
        <div className="bg-emerald-800/40 border border-emerald-700 py-3 rounded-md shadow-inner text-emerald-200">
          <div className="text-2xl font-bold text-emerald-300">{stats.totalSalles}</div>
          Salles
        </div>
        <div className="bg-emerald-800/40 border border-emerald-700 py-3 rounded-md shadow-inner text-emerald-200">
          <div className="text-2xl font-bold text-emerald-300">{stats.totalSurveillants}</div>
          Surveillants
        </div>
        <div className="bg-emerald-800/40 border border-emerald-700 py-3 rounded-md shadow-inner text-emerald-200">
          <div className="text-2xl font-bold text-emerald-300">{stats.totalPlannings}</div>
          Nombre de planning
        </div>
      </div>

      {/* === TABLEAU === */}
      <div className="overflow-x-auto border border-emerald-800 rounded-md shadow-lg">
        <table className="w-full border-collapse text-sm text-gray-200">
          <thead className="bg-emerald-800/90 text-emerald-100 uppercase tracking-wide">
            <tr>
              <th className="p-3 text-left">Matière</th>
              <th className="p-3 text-left">Salle</th>
              <th className="p-3 text-left">Surveillant(s)</th>
              <th className="p-3 text-center">Date</th>
              <th className="p-3 text-center">Début</th>
              <th className="p-3 text-center">Fin</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedByMatiere).map(([matiere, salles]) => {
              const salleEntries = Object.entries(salles);
              return salleEntries.map(([salle, rows], i) => (
                <tr
                  key={matiere + salle}
                  className="hover:bg-emerald-900/50 border-t border-emerald-800 transition"
                >
                  {i === 0 && (
                    <td
                      rowSpan={salleEntries.length}
                      className="p-3 text-emerald-300 font-semibold align-middle border-r border-emerald-700 text-base"
                    >
                      {matiere}
                    </td>
                  )}
                  <td className="p-3 font-medium text-emerald-200">{salle}</td>
                  <td className="p-3 text-gray-100">
                    {rows.map((p) => p.surveillant?.nomSurveillant).join(", ")}
                  </td>
                  <td className="p-3 text-center text-gray-300">
                    {rows[0].examen?.dateExamen}
                  </td>
                  <td className="p-3 text-center text-gray-300">
                    {formatTime(rows[0].heureDebut ?? rows[0].examen?.heureDebut)}
                  </td>
                  <td className="p-3 text-center text-gray-300">
                    {formatTime(rows[0].heureFin ?? rows[0].examen?.heureFin)}
                  </td>
                  <td className="p-3 text-center space-x-2">
                    <button
                      onClick={() => {
                        setEditing(rows[0]);
                        setShowForm(true);
                      }}
                      className="px-2 py-1 rounded bg-blue-500 hover:bg-blue-600 transition"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(rows[0].idPlanning!)}
                      className="px-2 py-1 rounded bg-red-600 hover:bg-red-700 transition"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ));
            })}
          </tbody>
        </table>
      </div>

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
