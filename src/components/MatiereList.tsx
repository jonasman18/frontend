import React, { useEffect, useState, useMemo, useDeferredValue } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ApiService } from "../services/ApiService";
import type { Matiere } from "../models/Matiere";
import type { Niveau } from "../models/Niveau";
import MatiereForm from "./MatiereForm";

const MatiereList: React.FC = () => {
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [niveaux, setNiveaux] = useState<Niveau[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNiveau, setSelectedNiveau] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [editingMatiere, setEditingMatiere] = useState<Matiere | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  const deferredSearch = useDeferredValue(searchTerm);

  // ⚡ Charger avec cache immédiat
  const loadData = async () => {
    setIsLoading(true);

    // Afficher instantanément le cache
    const cachedMat = localStorage.getItem("matieres_cache");
    const cachedNiv = localStorage.getItem("niveaux_cache");
    if (cachedMat) setMatieres(JSON.parse(cachedMat));
    if (cachedNiv) setNiveaux(JSON.parse(cachedNiv));
    if (cachedMat || cachedNiv) setIsLoading(false);

    // Mise à jour en arrière-plan
    try {
      const [matiereData, niveauData] = await Promise.all([
        ApiService.getMatieres(),
        ApiService.getNiveaux(),
      ]);
      setMatieres(matiereData);
      setNiveaux(niveauData);
      localStorage.setItem("matieres_cache", JSON.stringify(matiereData));
      localStorage.setItem("niveaux_cache", JSON.stringify(niveauData));
    } catch (err) {
      console.error("Erreur chargement matières :", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 🔍 Filtrage optimisé
  const filteredMatieres = useMemo(() => {
    const term = deferredSearch.toLowerCase();
    return matieres.filter((m) => {
      const matchSearch = m.nomMatiere.toLowerCase().includes(term);
      const matchNiveau =
        selectedNiveau === "all" || m.niveau?.codeNiveau === selectedNiveau;
      return matchSearch && matchNiveau;
    });
  }, [deferredSearch, matieres, selectedNiveau]);

  // 🧩 Regroupement par niveau
  const groupedByNiveau = useMemo(() => {
    const groups: Record<string, Matiere[]> = {};
    filteredMatieres.forEach((m) => {
      const niv = m.niveau?.codeNiveau || "Sans niveau";
      if (!groups[niv]) groups[niv] = [];
      groups[niv].push(m);
    });

    const order = ["L1", "L2", "L3", "M1", "M2"];
    return Object.entries(groups).sort(([a], [b]) => {
      const ia = order.indexOf(a);
      const ib = order.indexOf(b);
      if (ia === -1 && ib === -1) return a.localeCompare(b);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
  }, [filteredMatieres]);

  // 🗑️ Suppression
  const handleDelete = (id: number) => {
    if (confirm("Supprimer cette matière ?")) {
      ApiService.deleteMatiere(id).then(() => {
        setMatieres((prev) => prev.filter((m) => m.idMatiere !== id));
        localStorage.setItem(
          "matieres_cache",
          JSON.stringify(matieres.filter((m) => m.idMatiere !== id))
        );
      });
    }
  };

  // 💾 Enregistrement
  const handleSave = (matiere: Matiere) => {
    ApiService.saveMatiere(matiere).then((saved) => {
      setMatieres((prev) => {
        const exists = prev.some((m) => m.idMatiere === saved.idMatiere);
        const updated = exists
          ? prev.map((m) => (m.idMatiere === saved.idMatiere ? saved : m))
          : [...prev, saved];
        localStorage.setItem("matieres_cache", JSON.stringify(updated));
        return updated;
      });
      setShowForm(false);
      setEditingMatiere(null);
    });
  };

  return (
    <motion.div
      layout
      className="p-6 bg-emerald-950 rounded-lg shadow-lg text-white transition-all duration-500"
    >
      {/* Barre supérieure */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
        <h1 className="text-2xl font-bold text-emerald-300">
          📚 Matières par Niveau
        </h1>

        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={selectedNiveau}
            onChange={(e) => setSelectedNiveau(e.target.value)}
            className="bg-emerald-900 border border-emerald-600 rounded-md px-3 py-2"
          >
            <option value="all">🌍 Tous les niveaux</option>
            {niveaux.map((n) => (
              <option key={n.idNiveau} value={n.codeNiveau}>
                {n.codeNiveau}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="🔍 Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 rounded-md text-gray-900 border border-emerald-600 outline-none"
          />

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewMode(viewMode === "table" ? "cards" : "table")}
            className="bg-emerald-600 hover:bg-emerald-700 px-3 py-2 rounded-md font-semibold"
          >
            {viewMode === "table" ? "🗂️ Vue cartes" : "📋 Vue tableau"}
          </motion.button>

          <button
            onClick={() => {
              setEditingMatiere(null);
              setShowForm(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-md font-semibold"
          >
            ➕ Ajouter
          </button>
        </div>
      </div>

      {/* Vue dynamique avec cache */}
      <AnimatePresence mode="wait">
        {viewMode === "table" ? (
          <motion.div
            key="table"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            <div className="overflow-x-auto border border-emerald-700 rounded-lg">
              {isLoading && matieres.length === 0 ? (
                <p className="text-center text-emerald-400 py-6">
                  Chargement des matières...
                </p>
              ) : groupedByNiveau.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead className="bg-emerald-800 text-white">
                    <tr>
                      <th className="px-4 py-2 border-b border-emerald-700 w-1/6">
                        Niveau
                      </th>
                      <th className="px-4 py-2 border-b border-emerald-700">
                        Matières
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedByNiveau.map(([niveau, liste]) => (
                      <tr key={niveau}>
                        <td className="px-4 py-3 border-b border-emerald-800 font-semibold text-emerald-300 align-top">
                          {niveau}
                        </td>
                        <td className="px-4 py-3 border-b border-emerald-800">
                          <div className="flex flex-col gap-2">
                            {liste.map((m) => (
                              <div
                                key={m.idMatiere}
                                className="flex justify-between items-center bg-emerald-900/40 px-3 py-2 rounded-md hover:bg-emerald-800 transition"
                              >
                                <span className="text-white">
                                  {m.nomMatiere}
                                </span>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      setEditingMatiere(m);
                                      setShowForm(true);
                                    }}
                                    className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md text-sm"
                                  >
                                    ✏
                                  </button>
                                  <button
                                    onClick={() => handleDelete(m.idMatiere!)}
                                    className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md text-sm"
                                  >
                                    🗑
                                  </button>
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
                <p className="text-center text-emerald-400 italic py-6">
                  Aucune matière trouvée.
                </p>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="cards"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4 }}
          >
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupedByNiveau.map(([niveau, liste]) => (
                <div
                  key={niveau}
                  className="bg-emerald-900/50 border border-emerald-700 rounded-xl p-4 shadow-md"
                >
                  <h3 className="text-lg font-semibold text-emerald-300 mb-3">
                    {niveau}
                  </h3>
                  <div className="flex flex-col gap-2">
                    {liste.map((m) => (
                      <div
                        key={m.idMatiere}
                        className="bg-emerald-950/60 rounded-md p-3 flex justify-between items-center hover:bg-emerald-800 transition"
                      >
                        <span>{m.nomMatiere}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingMatiere(m);
                              setShowForm(true);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-sm"
                          >
                            ✏
                          </button>
                          <button
                            onClick={() => handleDelete(m.idMatiere!)}
                            className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-sm"
                          >
                            🗑
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Formulaire modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <MatiereForm
              matiere={editingMatiere ?? undefined}
              onSave={handleSave}
              onClose={() => {
                setShowForm(false);
                setEditingMatiere(null);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MatiereList;
