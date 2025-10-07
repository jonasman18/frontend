import React, { useEffect, useState } from "react";
import { ApiService } from "../services/ApiService";
import type { PlanningSurveillance } from "../models/PlanningSurveillance";
import PlanningSurveillanceForm from "./PlanningSurveillanceForm";
import TableList from "./TableList";

const PlanningSurveillanceList: React.FC = () => {
  const [planningList, setPlanningList] = useState<PlanningSurveillance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PlanningSurveillance | null>(null);

  // 🔹 Charger le planning au montage
  useEffect(() => {
    ApiService.getPlanningSurveillance()
      .then((data) => {
        setPlanningList(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Erreur de chargement du planning de surveillance.");
        setLoading(false);
      });
  }, []);

  // 🔹 Sauvegarde (ajout ou modification)
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
      .catch(() => alert("Erreur lors de la sauvegarde du planning"));
  };

  // 🔹 Suppression
  const handleDelete = (id: number) => {
    if (confirm("Confirmer la suppression de ce planning ?")) {
      ApiService.deletePlanningSurveillance(id)
        .then(() =>
          setPlanningList((prev) =>
            prev.filter((p) => p.idPlanning !== id)
          )
        )
        .catch(() => alert("Erreur lors de la suppression"));
    }
  };

  if (loading)
    return <div className="text-center text-gray-300">Chargement du planning...</div>;
  if (error)
    return <div className="text-center text-red-400">{error}</div>;

  return (
    <div className="space-y-4">
      <TableList
        title="Planning de Surveillance"
        columns={[
          { key: "examen.matiere.nomMatiere", label: "Examen" },
          { key: "heureDebut", label: "Heure Début" },
          { key: "heureFin", label: "Heure Fin" },
          { key: "salle.numeroSalle", label: "Salle" },
          { key: "parcours.codeParcours", label: "Parcours" },
          { key: "surveillant.nomSurveillant", label: "Surveillant" },
        ]}
        data={planningList.map((p) => ({
          ...p,
          uid: p.idPlanning,
        }))}
        idKey="uid"
        onAdd={() => {
          setEditing(null);
          setShowForm(true);
        }}
        onEdit={(item) => {
          setEditing(item);
          setShowForm(true);
        }}
        onDelete={(id) => handleDelete(Number(id))}
      />

      {/* 🧩 Formulaire modal */}
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
