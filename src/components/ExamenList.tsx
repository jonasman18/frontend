import React, { useEffect, useState, useMemo, useDeferredValue } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ApiService } from "../services/ApiService";
import { useAuth } from "../context/AuthContext"; // ← Ajout : import du contexte d'auth
import type { Examen } from "../models/Examen";
import type { ExamenParcours } from "../models/ExamenParcours";
import ExamenForm from "./ExamenForm";

// 🕒 Utils
const formatDateFR = (dateStr?: string): string => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const jours = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  return `${jours[d.getDay()]} ${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${d.getFullYear()}`;
};

const formatHeures = (debut?: string, fin?: string): string => {
  if (!debut || !fin) return "";
  const d = new Date(debut);
  const f = new Date(fin);
  const pad = (n: number) => n.toString().padStart(2, "0");
  const diffMs = f.getTime() - d.getTime();
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  const diffM = Math.floor((diffMs / (1000 * 60)) % 60);
  const duree = diffH > 0 ? `${diffH}h${diffM > 0 ? diffM : ""}` : `${diffM} min`;
  return `${pad(d.getHours())}h${pad(d.getMinutes())}-${pad(f.getHours())}h${pad(
    f.getMinutes()
  )} (${duree})`;
};

const ExamenList: React.FC = () => {
  const { isAdmin } = useAuth(); // ← Ajout : récupération du rôle admin
  const [examens, setExamens] = useState<Examen[]>([]);
  const [examParcours, setExamParcours] = useState<Record<number, string[]>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filterNiveau, setFilterNiveau] = useState("all");
  const [filterDate, setFilterDate] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Examen | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortAsc, setSortAsc] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [fullscreen, setFullscreen] = useState(false);

  const deferredSearch = useDeferredValue(searchTerm);

  // ⚡ Chargement + cache localStorage
  const loadExamens = async (forceRefresh = false) => {
    try {
      if (!forceRefresh) {
        const cached = localStorage.getItem("examens_cache");
        if (cached) {
          const parsed = JSON.parse(cached);
          setExamens(parsed);
          setIsLoading(false);
        }
        const cachedEP = localStorage.getItem("exam_parcours_cache");
        if (cachedEP) setExamParcours(JSON.parse(cachedEP));
      }

      // 🌀 Rechargement en arrière-plan
      const [examData, epData]: [Examen[], ExamenParcours[]] = await Promise.all([
        ApiService.getUpcomingExamens(),
        ApiService.getExamenParcours(),
      ]);

      setExamens(examData);
      localStorage.setItem("examens_cache", JSON.stringify(examData));

      const map: Record<number, string[]> = {};
      epData.forEach((a) => {
        if (a.examen?.idExamen && a.parcours?.codeParcours) {
          if (!map[a.examen.idExamen]) map[a.examen.idExamen] = [];
          map[a.examen.idExamen].push(a.parcours.codeParcours);
        }
      });
      setExamParcours(map);
      localStorage.setItem("exam_parcours_cache", JSON.stringify(map));
    } catch (err) {
      console.error("⚠️ Erreur chargement examens :", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadExamens();
  }, []);

  // 🔍 Filtrage et tri optimisés
  const filteredExamens = useMemo(() => {
    const term = deferredSearch.toLowerCase();
    return examens.filter((e) => {
      const matchSearch =
        e.matiere?.nomMatiere?.toLowerCase().includes(term) ||
        e.niveau?.codeNiveau?.toLowerCase().includes(term) ||
        e.numeroSalle?.toLowerCase().includes(term);
      const matchNiveau = filterNiveau === "all" || e.niveau?.codeNiveau === filterNiveau;
      const matchDate = !filterDate || e.dateExamen?.startsWith(filterDate);
      return matchSearch && matchNiveau && matchDate;
    });
  }, [deferredSearch, examens, filterNiveau, filterDate]);

  const sortedExamens = useMemo(() => {
    return [...filteredExamens].sort((a, b) => {
      const da = new Date(a.dateExamen ?? "").getTime();
      const db = new Date(b.dateExamen ?? "").getTime();
      return sortAsc ? db - da : da - db;
    });
  }, [filteredExamens, sortAsc]);

  // 📅 Regroupement par date
  const groupedByDate = useMemo(() => {
    const groups: Record<string, Examen[]> = {};
    sortedExamens.forEach((ex) => {
      const date = formatDateFR(ex.dateExamen);
      if (!groups[date]) groups[date] = [];
      groups[date].push(ex);
    });
    return Object.entries(groups).sort(([a], [b]) => {
      const da = new Date(a.split(" ").pop()!.split("/").reverse().join("-")).getTime();
      const db = new Date(b.split(" ").pop()!.split("/").reverse().join("-")).getTime();
      return da - db;
    });
  }, [sortedExamens]);

  // 🗑️ Suppression (gardé pour admin seulement)
  const handleDelete = async (id?: number) => {
    if (!id || !isAdmin) { // ← Ajout : blocage si non-admin
      if (!isAdmin) alert("❌ Mode lecture seule : vous ne pouvez pas supprimer.");
      return;
    }
    if (confirm("Supprimer cet examen ?")) {
      await ApiService.deleteExamen(id);
      loadExamens(true);
    }
  };

  // 💾 Sauvegarde (gardé pour admin seulement)
  const handleSave = async (examen: Examen): Promise<Examen> => {
    if (!isAdmin) { // ← Ajout : blocage si non-admin
      alert("❌ Mode lecture seule : vous ne pouvez pas modifier.");
      throw new Error("Non autorisé");
    }
    const saved = await ApiService.saveExamen(examen);
    await loadExamens(true);
    setShowForm(false);
    setEditing(null);
    return saved;
  };

  // Édition (gardé pour admin seulement)
  const handleEdit = (examen: Examen) => {
    if (!isAdmin) { // ← Ajout : blocage si non-admin
      alert("❌ Mode lecture seule : vous ne pouvez pas modifier.");
      return;
    }
    setEditing(examen);
    setShowForm(true);
  };

  return (
    <motion.div
      layout
      className={`p-6 bg-emerald-950 text-white rounded-xl shadow-lg relative transition-all duration-500 ${
        fullscreen ? "fixed inset-0 z-50 p-10 overflow-y-auto" : ""
      }`}
    >
      {/* Barre supérieure */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
        <div className="flex items-center gap-3"> {/* ← Groupé pour badge */}
          <h1
            className="text-2xl font-bold text-emerald-300 cursor-pointer hover:text-emerald-400 transition"
            onClick={() => setFullscreen(!fullscreen)}
          >
            📘 Examens {fullscreen && "(plein écran)"}
          </h1>
          {/* ← Ajout : Badge lecture seule si non-admin */}
          {!isAdmin && (
            <span className="px-3 py-1 bg-gray-600 text-gray-200 rounded-full text-sm font-medium">
               Mode lecture seule
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={filterNiveau}
            onChange={(e) => setFilterNiveau(e.target.value)}
            className="bg-emerald-900 border border-emerald-600 rounded-md px-3 py-2"
          >
            <option value="all">🌍 Tous niveaux</option>
            {["L1", "L2", "L3", "M1", "M2"].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="bg-emerald-900 border border-emerald-600 rounded-md px-3 py-2 text-white"
          />

          <input
            type="text"
            placeholder="🔍 Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 rounded-md text-gray-900 border border-emerald-600 outline-none"
          />

          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="bg-emerald-600 hover:bg-emerald-700 px-3 py-2 rounded-md"
          >
            {sortAsc ? "⬇️" : "⬆️"}
          </button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewMode(viewMode === "table" ? "cards" : "table")}
            className="bg-emerald-600 hover:bg-emerald-700 px-3 py-2 rounded-md font-semibold"
          >
            {viewMode === "table" ? "🗂️ Vue cartes" : "📋 Vue tableau"}
          </motion.button>

          {/* ← Condition : Bouton Nouvel Examen seulement pour admin */}
          {isAdmin && (
            <button
              onClick={() => {
                setEditing(null);
                setShowForm(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-md font-semibold"
            >
              ➕ Nouvel Examen
            </button>
          )}
        </div>
      </div>

      {/* Vue dynamique */}
      <AnimatePresence mode="wait">
        {viewMode === "table" ? (
          <motion.div 
            key="table" 
            initial={{ opacity: 0, y: 20, scale: 0.98 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: -20, scale: 0.98 }} 
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="overflow-x-auto border border-emerald-700 rounded-lg">
              {isLoading ? (
                <p className="text-center text-emerald-400 py-6">Chargement...</p>
              ) : groupedByDate.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead className="bg-emerald-800 text-white">
                    <tr>
                      <th className="px-4 py-2 border-b border-emerald-700 w-1/6">Date</th>
                      <th className="px-4 py-2 border-b border-emerald-700">Examens</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedByDate.map(([date, liste]) => (
                      <tr key={date}>
                        <td className="px-4 py-3 border-b border-emerald-800 font-semibold text-emerald-300 align-top">
                          {date}
                        </td>
                        <td className="px-4 py-3 border-b border-emerald-800">
                          <div className="flex flex-col gap-2">
                            {liste.map((ex) => (
                              <div
                                key={ex.idExamen}
                                className="flex justify-between items-center bg-emerald-900/40 px-3 py-2 rounded-md hover:bg-emerald-800 transition"
                              >
                                <div>
                                  <span className="font-semibold">{ex.matiere?.nomMatiere}</span>
                                  <div className="text-sm text-emerald-300">
                                    {ex.niveau?.codeNiveau} • {formatHeures(ex.heureDebut, ex.heureFin)} • Salle{" "}
                                    {ex.numeroSalle}
                                  </div>
                                  {examParcours[ex.idExamen ?? 0] && (
                                    <div className="text-xs text-emerald-400 mt-1">
                                      Parcours : {examParcours[ex.idExamen ?? 0].join(" / ")}
                                    </div>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  {/* ← Condition : Boutons actions seulement pour admin */}
                                  {isAdmin ? (
                                    <>
                                      <button
                                        onClick={() => handleEdit(ex)} // ← Appel handler conditionné
                                        className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md text-sm"
                                      >
                                        ✏
                                      </button>
                                      <button
                                        onClick={() => handleDelete(ex.idExamen)}
                                        className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md text-sm"
                                      >
                                        🗑
                                      </button>
                                    </>
                                  ) : (
                                    <span className="text-gray-500 text-sm px-3 py-1">👁️ Lecture</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-center text-emerald-400 italic py-6">Aucun examen trouvé.</p>
              )}
            </div>
          </motion.div>
        ) : (
          // Vue cartes (pas d'actions, donc OK pour lecture seule)
          <motion.div 
            key="cards" 
            initial={{ opacity: 0, y: 20, scale: 0.98 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: -20, scale: 0.98 }} 
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupedByDate.map(([date, liste]) => (
                <div
                  key={date}
                  className="bg-emerald-900/50 border border-emerald-700 rounded-xl p-4 shadow-md"
                >
                  <h3 className="text-lg font-semibold text-emerald-300 mb-3">{date}</h3>
                  <div className="flex flex-col gap-2">
                    {liste.map((ex) => (
                      <div
                        key={ex.idExamen}
                        className="bg-emerald-950/60 rounded-md p-3 hover:bg-emerald-800 transition"
                      >
                        <span className="font-semibold">{ex.matiere?.nomMatiere}</span>
                        <div className="text-sm text-emerald-300">
                          {ex.niveau?.codeNiveau} • {formatHeures(ex.heureDebut, ex.heureFin)} • Salle{" "}
                          {ex.numeroSalle}
                        </div>
                        {examParcours[ex.idExamen ?? 0] && (
                          <div className="text-xs text-emerald-400 mt-1">
                            Parcours : {examParcours[ex.idExamen ?? 0].join(" / ")}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modales (seulement si admin, mais conditionnée en amont) */}
      <AnimatePresence>
        {showForm && (
          <motion.div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
            <ExamenForm
              examen={editing ?? undefined}
              onSave={handleSave}
              onClose={() => {
                setShowForm(false);
                setEditing(null);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ExamenList;