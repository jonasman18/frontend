import React, { useEffect, useState, useMemo } from "react";
import { ApiService } from "../services/ApiService";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { PlanningSurveillance } from "../models/PlanningSurveillance";
import PlanningSurveillanceForm from "./PlanningSurveillanceForm";

const PlanningSurveillanceList: React.FC = () => {
  const [planningList, setPlanningList] = useState<PlanningSurveillance[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PlanningSurveillance | null>(null);

  // Chargement initial (sans blocage, affiche état vide en attendant)
  useEffect(() => {
    ApiService.getPlanningSurveillance()
      .then((data) => {
        setPlanningList(data);
      })
      .catch(() => {
        setError("Erreur lors du chargement du planning de surveillance.");
      });
  }, []);

  // Gestion de la sauvegarde (ajout ou mise à jour locale optimiste)
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

  // Gestion de la suppression
  const handleDelete = (id: number) => {
    if (confirm("Voulez-vous vraiment supprimer ce planning ?")) {
      ApiService.deletePlanningSurveillance(id)
        .then(() => setPlanningList((prev) => prev.filter((p) => p.idPlanning !== id)))
        .catch(() => alert("Erreur lors de la suppression."));
    }
  };

  // Formatage des dates
  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Formatage des heures
  const formatTime = (time?: string): string =>
    time ? new Date(time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";

  // Filtrage pour afficher seulement présent et futur
  const filteredPlanningList = useMemo(() => {
    const today = new Date('2025-10-31');  // Date actuelle fixe pour test (31/10/2025)
    today.setHours(0, 0, 0, 0);
    return planningList.filter((p) => {
      const examDate = new Date(p.examen?.dateExamen || '');
      return examDate >= today;
    });
  }, [planningList]);

  // Groupement des plannings par date, puis par tranche horaire, puis par salle
  const groupedData = useMemo(() => {
    // Groupement par date
    const byDate: Record<string, PlanningSurveillance[]> = {};
    filteredPlanningList.forEach((p) => {
      const date = p.examen?.dateExamen ?? "";
      if (!byDate[date]) byDate[date] = [];
      byDate[date].push(p);
    });

    const sortedDates = Object.keys(byDate).sort((a, b) => a.localeCompare(b));

    return sortedDates.map((date) => {
      let items = byDate[date];
      // Tri par heure de début-fin
      items = items.sort((a, b) => {
        const ta = `${formatTime(a.heureDebut ?? a.examen?.heureDebut)}-${formatTime(a.heureFin ?? a.examen?.heureFin)}`;
        const tb = `${formatTime(b.heureDebut ?? b.examen?.heureDebut)}-${formatTime(b.heureFin ?? b.examen?.heureFin)}`;
        return ta.localeCompare(tb);
      });

      // Groupement par tranche horaire
      const timeSlots: Array<{
        debut: string;
        fin: string;
        salles: Array<{ salle: string; plannings: PlanningSurveillance[] }>;
      }> = [];
      let j = 0;
      while (j < items.length) {
        const curr = items[j];
        const debut = formatTime(curr.heureDebut ?? curr.examen?.heureDebut);
        const fin = formatTime(curr.heureFin ?? curr.examen?.heureFin);
        const timeItems: PlanningSurveillance[] = [];
        while (
          j < items.length &&
          formatTime(items[j].heureDebut ?? items[j].examen?.heureDebut) === debut &&
          formatTime(items[j].heureFin ?? items[j].examen?.heureFin) === fin
        ) {
          timeItems.push(items[j]);
          j++;
        }

        // Groupement par salle dans la tranche horaire
        const bySalle: Record<string, PlanningSurveillance[]> = {};
        timeItems.forEach((p) => {
          const salleKey = p.salle?.numeroSalle ?? "—";
          if (!bySalle[salleKey]) bySalle[salleKey] = [];
          bySalle[salleKey].push(p);
        });

        const sortedSalles = Object.keys(bySalle).sort((a, b) => a.localeCompare(b));
        const salleGroups = sortedSalles.map((salleKey) => ({
          salle: salleKey,
          plannings: bySalle[salleKey],
        }));

        timeSlots.push({ debut, fin, salles: salleGroups });
      }

      const totalRowsForDate = timeSlots.reduce((acc, ts) => acc + ts.salles.length, 0);

      return { date, totalRows: totalRowsForDate, timeSlots };
    });
  }, [filteredPlanningList]);

  // Calcul des statistiques
  const stats = useMemo(() => {
    const totalExamens = new Set(filteredPlanningList.map((p) => p.examen?.idExamen)).size;
    const totalSalles = new Set(filteredPlanningList.map((p) => p.salle?.numeroSalle)).size;
    const totalSurveillants = new Set(filteredPlanningList.map((p) => p.surveillant?.idSurveillant)).size;
    return { totalExamens, totalSalles, totalSurveillants, totalPlannings: filteredPlanningList.length };
  }, [filteredPlanningList]);

  // Export PDF avec vérifications robustes
  const exportPDF = () => {
    if (filteredPlanningList.length === 0) {
      alert("Aucun planning à exporter.");
      return;
    }

    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("RÉPARTITION DES SURVEILLANTS", 105, 20, { align: "center" });

    const bodyRows: string[][] = [];

    // Tri des plannings par date, heure, salle
    const sortedPlannings = [...filteredPlanningList].sort((a, b) => {
      const da = a.examen?.dateExamen ?? "";
      const db = b.examen?.dateExamen ?? "";
      if (da !== db) return da.localeCompare(db);
      const ta = `${formatTime(a.heureDebut ?? a.examen?.heureDebut)}-${formatTime(a.heureFin ?? a.examen?.heureFin)}`;
      const tb = `${formatTime(b.heureDebut ?? b.examen?.heureDebut)}-${formatTime(b.heureFin ?? b.examen?.heureFin)}`;
      if (ta !== tb) return ta.localeCompare(tb);
      const sa = a.salle?.numeroSalle ?? "";
      const sb = b.salle?.numeroSalle ?? "";
      return sa.localeCompare(sb);
    });

    // Agrégation par date-heure-salle
    let i = 0;
    while (i < sortedPlannings.length) {
      const current = sortedPlannings[i];
      const date = formatDate(current.examen?.dateExamen);
      const debut = formatTime(current.heureDebut ?? current.examen?.heureDebut);
      const fin = formatTime(current.heureFin ?? current.examen?.heureFin);
      const salle = current.salle?.numeroSalle ?? "—";

      // Collecte du groupe pour cette date-heure-salle
      const group: PlanningSurveillance[] = [];
      while (
        i < sortedPlannings.length &&
        (sortedPlannings[i].examen?.dateExamen ?? "") === (current.examen?.dateExamen ?? "") &&
        formatTime(sortedPlannings[i].heureDebut ?? sortedPlannings[i].examen?.heureDebut) === debut &&
        formatTime(sortedPlannings[i].heureFin ?? sortedPlannings[i].examen?.heureFin) === fin &&
        (sortedPlannings[i].salle?.numeroSalle ?? "—") === salle
      ) {
        group.push(sortedPlannings[i]);
        i++;
      }

      const surveillantsList = group
        .map((p) => p.surveillant?.nomSurveillant || "")
        .filter((name) => name !== "")
        .join(", ") || "Aucun";
      const matiere = current.examen?.matiere?.nomMatiere ?? "Inconnue";

      bodyRows.push([date, debut, fin, salle, surveillantsList, matiere]);
    }

    autoTable(doc, {
      startY: 28,
      head: [["Date", "Début", "Fin", "Salle", "Surveillants", "Matière"]],
      body: bodyRows,
      styles: { fontSize: 9, halign: "center" },
      headStyles: { fillColor: [25, 90, 60], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 248, 245] },
    });

    doc.save("Repartition_Surveillants.pdf");
  };

  // Affichage d'erreur global
  if (error) {
    return <div className="text-center text-red-400 py-4">{error}</div>;
  }

  return (
    <div className="space-y-8 bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 p-6 rounded-2xl shadow-xl border border-emerald-800">
      {/* Header avec titre et actions */}
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
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-md font-medium transition disabled:opacity-50"
            disabled={filteredPlanningList.length === 0}
          >
            📄 Exporter PDF
          </button>
        </div>
      </div>

      {/* Récapitulatif des statistiques */}
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
          Nombre de plannings
        </div>
      </div>

      {/* Tableau principal des plannings */}
      <div className="overflow-x-auto border border-emerald-800 rounded-md shadow-lg">
        <table className="w-full border-collapse text-sm text-gray-200">
          <thead className="bg-emerald-800/90 text-emerald-100 uppercase tracking-wide">
            <tr>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-center">Début</th>
              <th className="p-3 text-center">Fin</th>
              <th className="p-3 text-left">Salle</th>
              <th className="p-3 text-left">Surveillant(s)</th>
              <th className="p-3 text-left">Matière</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {groupedData.map(({ date, totalRows, timeSlots }, dateIndex) =>
              timeSlots.map((timeSlot, timeIndex) => (
                <React.Fragment key={`${date}-${timeIndex}`}>
                  {timeSlot.salles.map((salleGroup, salleIndex) => {
                    const { salle, plannings } = salleGroup;
                    const firstPlanning = plannings[0];
                    const surveillantsList = plannings
                      .map((p) => p.surveillant?.nomSurveillant || "")
                      .filter((name) => name !== "")
                      .join(", ") || "Aucun";
                    const matiere = firstPlanning?.examen?.matiere?.nomMatiere ?? "Inconnue";

                    const isFirstTimeSlot = timeIndex === 0;
                    const isFirstSalle = salleIndex === 0;

                    return (
                      <tr
                        key={`${date}-${timeSlot.debut}-${salle}-${salleIndex}`}
                        className="hover:bg-emerald-900/50 border-t border-emerald-800 transition"
                      >
                        {isFirstTimeSlot && isFirstSalle && (
                          <td
                            rowSpan={totalRows}
                            className="p-3 text-left text-emerald-300 font-semibold align-middle border-r border-emerald-700 text-base"
                          >
                            {formatDate(date)}
                          </td>
                        )}
                        {isFirstSalle && (
                          <>
                            <td
                              rowSpan={timeSlot.salles.length}
                              className="p-3 text-center text-emerald-200 font-medium border-r border-emerald-700"
                            >
                              {timeSlot.debut}
                            </td>
                            <td
                              rowSpan={timeSlot.salles.length}
                              className="p-3 text-center text-emerald-200 font-medium border-r border-emerald-700"
                            >
                              {timeSlot.fin}
                            </td>
                          </>
                        )}
                        <td className="p-3 font-medium text-emerald-200">{salle}</td>
                        <td className="p-3 text-gray-100">{surveillantsList}</td>
                        <td className="p-3 text-emerald-300 font-semibold">{matiere}</td>
                        <td className="p-3 text-center space-x-2">
                          <button
                            onClick={() => {
                              setEditing(firstPlanning);
                              setShowForm(true);
                            }}
                            className="px-2 py-1 rounded bg-blue-500 hover:bg-blue-600 transition text-xs"
                            title="Modifier"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(firstPlanning.idPlanning!)}
                            className="px-2 py-1 rounded bg-red-600 hover:bg-red-700 transition text-xs"
                            title="Supprimer"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))
            )}
            {filteredPlanningList.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">
                  Aucun planning de surveillance présent ou futur trouvé. Ajoutez-en un pour commencer !
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Formulaire modal */}
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