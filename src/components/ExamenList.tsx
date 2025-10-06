import React, { useEffect, useState } from "react";
import { ApiService } from "../services/ApiService";
import type { Examen } from "../models/Examen";
import ExamenForm from "./ExamenForm";
import TableList from "./TableList";

const ExamenList: React.FC = () => {
  const [examens, setExamens] = useState<Examen[]>([]);
  const [filteredExamens, setFilteredExamens] = useState<Examen[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Examen | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔹 Charger les examens
  const loadExamens = () => {
    setLoading(true);
    ApiService.getExamens()
      .then((data) => {
        setExamens(data);
        setFilteredExamens(data);
      })
      .catch((err) => {
        console.error("Erreur chargement examens:", err);
        setError("Impossible de charger les examens");
        setExamens([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadExamens();
  }, []);

  // 🔍 Recherche dynamique
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFilteredExamens(
      examens.filter(
        (e) =>
          e.matiere?.nomMatiere?.toLowerCase().includes(term) ||
          e.niveau?.codeNiveau?.toLowerCase().includes(term) ||
          e.session?.toLowerCase().includes(term) ||
          e.numeroSalle?.toLowerCase().includes(term) ||
          e.dateExamen?.toLowerCase().includes(term) ||
          e.heureDebut?.toLowerCase().includes(term) ||
          e.heureFin?.toLowerCase().includes(term) ||
          String(e.idExamen).includes(term)
      )
    );
  }, [searchTerm, examens]);

  const handleDelete = (id: number | string) => {
    if (confirm("Supprimer cet examen ?")) {
      ApiService.deleteExamen(Number(id))
        .then(() => loadExamens())
        .catch(() => alert("Erreur lors de la suppression"));
    }
  };

  const handleSave = (examen: Examen) => {
    ApiService.saveExamen(examen)
      .then(() => {
        loadExamens();
        setShowForm(false);
        setEditing(null);
      })
      .catch(() => alert("Erreur lors de l’enregistrement"));
  };

  if (loading)
    return <p className="text-center text-gray-300">Chargement...</p>;
  if (error)
    return <p className="text-center text-red-400">{error}</p>;

  return (
    <div className="space-y-4">
      {/* 🔍 Barre de recherche */}
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Rechercher un examen (matière, niveau, salle, date...)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 rounded-md text-gray-900 w-1/3 border border-emerald-600 focus:ring-2 focus:ring-emerald-500 outline-none transition-all duration-300"
        />
      </div>

      {/* 🧾 Table des examens */}
      <TableList
        title="Liste des Examens"
        columns={[
          { key: "idExamen", label: "ID" },
          { key: "matiere.nomMatiere", label: "Matière" },
          { key: "niveau.codeNiveau", label: "Niveau" },
          { key: "dateExamen", label: "Date" },
          { key: "heureDebut", label: "Heure Début" },
          { key: "heureFin", label: "Heure Fin" },
          { key: "duree", label: "Durée" },
          { key: "numeroSalle", label: "Salle" },
          { key: "session", label: "Session" },
        ]}
        data={filteredExamens}
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

      {/* 🧩 Formulaire modal */}
      {showForm && (
        <ExamenForm
          examen={editing ?? undefined}
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

export default ExamenList;
