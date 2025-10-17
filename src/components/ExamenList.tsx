import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ApiService } from "../services/ApiService";
import type { Examen } from "../models/Examen";
import ExamenForm from "./ExamenForm";
import ExamenParcoursForm from "./ExamenParcoursForm";
import ExamenParcoursList from "./ExamenParcoursList";
import TableList from "./TableList";

function formatDuree(num?: number): string {
  if (num == null) return "";
  const heures = Math.floor(num);
  const minutes = Math.round((num - heures) * 60);
  return minutes === 0 ? `${heures}H` : `${heures}H${minutes}`;
}

function formatDateFR(dateStr?: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${d.getFullYear()}`;
}

const ExamenList: React.FC = () => {
  const [examens, setExamens] = useState<Examen[]>([]);
  const [filteredExamens, setFilteredExamens] = useState<Examen[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Examen | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(false);

  // ✅ États pour ExamenParcours
  const [showExamenParcours, setShowExamenParcours] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState<number | undefined>();
  const [showExamenParcoursList, setShowExamenParcoursList] = useState(false);

  // Charger examens
  const loadExamens = () => {
    setLoading(true);
    ApiService.getExamens()
      .then((data) => {
        setExamens(data);
        setFilteredExamens(data);
      })
      .catch(() => {
        setError("Impossible de charger les examens");
        setExamens([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadExamens();
  }, []);

  // Recherche dynamique
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFilteredExamens(
      examens.filter(
        (e) =>
          e.matiere?.nomMatiere?.toLowerCase().includes(term) ||
          e.niveau?.codeNiveau?.toLowerCase().includes(term) ||
          e.session?.toLowerCase().includes(term) ||
          e.numeroSalle?.toLowerCase().includes(term) ||
          e.dateExamen?.toLowerCase().includes(term)
      )
    );
  }, [searchTerm, examens]);

  // Tri par date
  const sortedExamens = [...filteredExamens].sort((a, b) => {
    const da = new Date(a.dateExamen ?? "").getTime();
    const db = new Date(b.dateExamen ?? "").getTime();
    return sortAsc ? db - da : da - db;
  });

  // Suppression
  const handleDelete = (id: number | string) => {
    if (confirm("Supprimer cet examen ?")) {
      ApiService.deleteExamen(Number(id))
        .then(() => loadExamens())
        .catch(() => alert("Erreur lors de la suppression"));
    }
  };

  // Sauvegarde (ajout / modification)
  const handleSave = async (examen: Examen) => {
    try {
      const isEdit = !!examen.idExamen;
      const saved = await ApiService.saveExamen(examen);
      loadExamens();
      setShowForm(false);
      setEditing(null);

      // 👉 Si c’est un ajout, ouvrir ExamenParcoursForm
      if (!isEdit && saved && saved.idExamen) {
        setTimeout(() => {
          setSelectedExamId(saved.idExamen);
          setShowExamenParcours(true);
        }, 300);
      }
    } catch (err) {
      alert("Erreur lors de l’enregistrement");
    }
  };

  if (loading) return <p className="text-center text-gray-300">Chargement...</p>;
  if (error) return <p className="text-center text-red-400">{error}</p>;

  return (
    <div className="space-y-4 relative pb-20">
      {/* Barre recherche / tri */}
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Rechercher un examen (matière, niveau, salle, date...)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 rounded-md text-gray-900 w-1/3 border border-emerald-600 focus:ring-2 focus:ring-emerald-500 outline-none transition-all duration-300"
        />
        <button
          onClick={() => setSortAsc(!sortAsc)}
          className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-md font-semibold transition"
        >
          {sortAsc ? "⬇️" : "⬆️"}
        </button>
      </div>

      {/* Table des examens */}
      <TableList
        title="Liste des Examens"
        columns={[
          { key: "matiere.nomMatiere", label: "Matière" },
          { key: "niveau.codeNiveau", label: "Niveau" },
          {
            key: "dateExamen",
            label: "Date",
            render: (item) => formatDateFR(item.dateExamen),
          },
          {
            key: "heureDebut",
            label: "Heure Début",
            render: (item) =>
              item.heureDebut
                ? new Date(item.heureDebut).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "",
          },
          {
            key: "heureFin",
            label: "Heure Fin",
            render: (item) =>
              item.heureFin
                ? new Date(item.heureFin).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "",
          },
          {
            key: "duree",
            label: "Durée",
            render: (item) => formatDuree(item.duree),
          },
          { key: "numeroSalle", label: "Salle" },
          { key: "session", label: "Session" },
        ]}
        data={sortedExamens}
        idKey="idExamen"
        onAdd={() => {
          setEditing(null);
          setShowForm(true);
        }}
        onEdit={(item) => {
          setEditing(item);
          setShowForm(true);
        }}
        onDelete={handleDelete}
      />

      {/* 🧭 Bouton flottant vers ExamenParcoursList */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowExamenParcoursList(true)}
        className="fixed bottom-6 right-6 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-full shadow-xl font-semibold transition-all"
      >
        📘 Quels parcours ?
      </motion.button>

      {/* 📋 Popup centré pour ExamenParcoursList */}
      <AnimatePresence>
        {showExamenParcoursList && (
          <motion.div
            key="examen-parcours-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-emerald-950 border border-emerald-700 shadow-2xl rounded-2xl w-[85%] max-w-4xl p-6 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-emerald-200">
                  📋 Associations Examens ↔ Parcours
                </h3>
                <button
                  onClick={() => setShowExamenParcoursList(false)}
                  className="text-red-400 hover:text-red-300 text-sm font-medium"
                >
                  ✖ Fermer
                </button>
              </div>
              <ExamenParcoursList />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ⚡️ Modales pour ExamenForm et ExamenParcoursForm */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            key="examen-form"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50"
          >
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

        {showExamenParcours && selectedExamId && (
          <motion.div
            key="examen-parcours-form"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50"
          >
            <ExamenParcoursForm
              examenId={selectedExamId}
              onSave={() => {
                setShowExamenParcours(false);
                setSelectedExamId(undefined);
                loadExamens();
              }}
              onClose={() => {
                setShowExamenParcours(false);
                setSelectedExamId(undefined);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExamenList;
