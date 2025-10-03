import React, { useEffect, useState } from "react";
import { ApiService } from "../services/ApiService";
import type { Enseignant } from "../models/Enseignant";
import EnseignantForm from "./EnseignantForm";
import TableList from "./TableList";

const EnseignantList: React.FC = () => {
  const [enseignants, setEnseignants] = useState<Enseignant[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Enseignant | null>(null);

  useEffect(() => {
    ApiService.getEnseignants().then(setEnseignants);
  }, []);

  const handleDelete = (id: number | string) => {
    if (confirm("Confirmer la suppression ?")) {
      ApiService.deleteEnseignant(Number(id)).then(() => {
        setEnseignants((prev) => prev.filter((e) => e.idEnseignant !== Number(id)));
      });
    }
  };

  const handleSave = (enseignant: Enseignant) => {
    ApiService.saveEnseignant(enseignant).then((saved) => {
      if (editing) {
        setEnseignants((prev) =>
          prev.map((e) => (e.idEnseignant === saved.idEnseignant ? saved : e))
        );
      } else {
        setEnseignants((prev) => [...prev, saved]);
      }
      setShowForm(false);
      setEditing(null);
    });
  };

  return (
    <div>
      <TableList
        title="Liste des Enseignants"
        columns={[
          { key: "idEnseignant", label: "ID" },
          { key: "nomEnseignant", label: "Nom" },
          { key: "grade", label: "Grade" },
        ]}
        data={enseignants}
        idKey="idEnseignant"
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
        <EnseignantForm
          enseignant={editing ?? undefined}
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

export default EnseignantList;
