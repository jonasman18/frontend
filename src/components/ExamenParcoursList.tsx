import React, { useEffect, useState } from "react";
import { ApiService } from "../services/ApiService";
import type { ExamenParcours } from "../models/ExamenParcours";
import ExamenParcoursForm from "./ExamenParcoursForm";
import TableList from "./TableList";

const ExamenParcoursList: React.FC = () => {
  const [associations, setAssociations] = useState<ExamenParcours[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ExamenParcours | null>(null);

  useEffect(() => {
    ApiService.getExamenParcours()
      .then(setAssociations)
      .catch((err) => {
        console.error("Erreur chargement examen-parcours:", err);
        setAssociations([]);
      });
  }, []);

  const handleDelete = (idExamen: number, idParcours: number) => {
    if (confirm("Voulez-vous supprimer cette association ?")) {
      ApiService.deleteExamenParcours(idExamen, idParcours).then(() => {
        setAssociations((prev) =>
          prev.filter(
            (a) =>
              !(
                a.id.idExamen === idExamen &&
                a.id.idParcours === idParcours
              )
          )
        );
      });
    }
  };

  const handleSave = (ep: ExamenParcours) => {
    ApiService.saveExamenParcours(ep, editing?.id) // ✅ oldId si édition
      .then((saved) => {
        if (editing) {
          // Mettre à jour la ligne existante
          setAssociations((prev) =>
            prev.map((a) =>
              a.id.idExamen === editing.id.idExamen &&
              a.id.idParcours === editing.id.idParcours
                ? saved
                : a
            )
          );
        } else {
          // Ajouter une nouvelle association
          setAssociations((prev) => [...prev, saved]);
        }
        setShowForm(false);
        setEditing(null);
      });
  };

  return (
    <div>
      <TableList
        title="Associations Examens - Parcours"
        columns={[
          { key: "examen.matiere.nomMatiere", label: "Matière" },
          { key: "examen.dateExamen", label: "Date Examen" },
          { key: "parcours.codeParcours", label: "Code Parcours" },
          { key: "parcours.libelleParcours", label: "Libellé" },
        ]}
        data={associations.map((a) => ({
          ...a,
          uid: `${a.id.idExamen}-${a.id.idParcours}`, // 🔑 clé stable
        }))}
        idKey="uid"
        onAdd={() => {
          setEditing(null);
          setShowForm(true);
        }}
        onEdit={(item) => {
          const assoc = associations.find(
            (a) => `${a.id.idExamen}-${a.id.idParcours}` === item.uid
          );
          setEditing(assoc ?? null);
          setShowForm(true);
        }}
        onDelete={(uid) => {
          const assoc = associations.find(
            (a) => `${a.id.idExamen}-${a.id.idParcours}` === uid
          );
          if (assoc) {
            handleDelete(assoc.id.idExamen, assoc.id.idParcours);
          }
        }}
      />

      {showForm && (
        <ExamenParcoursForm
          examenParcours={editing ?? undefined}
          onSave={handleSave}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default ExamenParcoursList;
