import React, { useEffect, useState } from "react";
import { ApiService } from "../services/ApiService";
import type { Examen } from "../models/Examen";
import ExamenForm from "./ExamenForm";
import TableList from "./TableList";

const ExamenList: React.FC = () => {
  const [examens, setExamens] = useState<Examen[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Examen | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadExamens = () => {
    setLoading(true);
    ApiService.getExamens()
      .then(setExamens)
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

  if (loading) return <p className="text-center text-gray-300">Chargement...</p>;
  if (error) return <p className="text-center text-red-400">{error}</p>;

  return (
    <div>
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
        data={examens}
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
