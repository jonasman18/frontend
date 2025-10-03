import React, { useEffect, useState } from "react";
import { ApiService } from "../services/ApiService";
import type { Enseigner } from "../models/Enseigner";
import EnseignerForm from "./EnseignerForm";
import TableList from "./TableList";

const EnseignerList: React.FC = () => {
  const [associations, setAssociations] = useState<Enseigner[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Enseigner | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    ApiService.getEnseigners()
      .then(setAssociations)
      .catch((err) => console.error("Erreur chargement:", err));
  };

  const handleSave = (idMatiere: number, idEnseignant: number) => {
    if (editing) {
      // 🔹 Mode édition → on appelle update
      ApiService.updateEnseigner(
        editing.matiere.idMatiere!,
        editing.enseignant.idEnseignant!,
        idMatiere,
        idEnseignant
      ).then(() => {
        loadData();
        setShowForm(false);
        setEditing(null);
      });
    } else {
      // 🔹 Nouveau → on appelle save
      ApiService.saveEnseigner(idMatiere, idEnseignant).then(() => {
        loadData();
        setShowForm(false);
      });
    }
  };

  const handleDelete = (idMatiere: number, idEnseignant: number) => {
    if (confirm("Supprimer cette association ?")) {
      ApiService.deleteEnseigner(idMatiere, idEnseignant).then(loadData);
    }
  };

  return (
    <div>
      <TableList
        title="Liste des Enseignements (Matière ↔ Enseignant)"
        columns={[
          { key: "matiere.nomMatiere", label: "Matière" },
          { key: "enseignant.nomEnseignant", label: "Enseignant" },
          { key: "enseignant.grade", label: "Grade" },
        ]}
        data={associations.map((a) => ({
          ...a,
          id: `${a.matiere.idMatiere}-${a.enseignant.idEnseignant}`, // clé stable
        }))}
        idKey="id"
        onAdd={() => {
          setEditing(null);
          setShowForm(true);
        }}
        onEdit={(item) => {
          const assoc = associations.find(
            (a) =>
              `${a.matiere.idMatiere}-${a.enseignant.idEnseignant}` === item.id
          );
          setEditing(assoc ?? null);
          setShowForm(true);
        }}
        onDelete={(itemId) => {
          const assoc = associations.find(
            (a) =>
              `${a.matiere.idMatiere}-${a.enseignant.idEnseignant}` === itemId
          );
          if (assoc) {
            handleDelete(assoc.matiere.idMatiere!, assoc.enseignant.idEnseignant!);
          }
        }}
      />

      {showForm && (
        <EnseignerForm
          enseigner={editing ?? undefined} // ✅ passe bien l’association si edition
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

export default EnseignerList;
