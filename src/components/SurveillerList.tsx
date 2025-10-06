import React, { useEffect, useState } from "react";
import { ApiService } from "../services/ApiService";
import type { Surveiller } from "../models/Surveiller";
import SurveillerForm from "./SurveillerForm";
import TableList from "./TableList";

const SurveillerList: React.FC = () => {
  const [surveillerList, setSurveillerList] = useState<Surveiller[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Surveiller | null>(null);

  // 🔹 Charger la liste des surveillants ↔ examens
  const loadData = () => {
    ApiService.getSurveiller()
      .then(setSurveillerList)
      .catch((err) => console.error("Erreur chargement surveillances:", err));
  };

  useEffect(() => {
    loadData();
  }, []);

  // 🔹 Ajouter ou modifier
  const handleSave = (
    idExamen: number,
    idSurveillant: number,
    old?: Surveiller
  ) => {
    if (old) {
      // 🔄 Modification
      ApiService.updateSurveiller(
        old.id.idExamen,
        old.id.idSurveillant,
        idExamen,
        idSurveillant
      ).then(() => {
        loadData();
        setShowForm(false);
        setEditing(null);
      });
    } else {
      // ➕ Ajout
      ApiService.addSurveiller(idExamen, idSurveillant).then(() => {
        loadData();
        setShowForm(false);
      });
    }
  };

  // 🔹 Supprimer une association
  const handleDelete = (idExamen: number, idSurveillant: number) => {
    if (confirm("Voulez-vous vraiment supprimer cette association ?")) {
      ApiService.deleteSurveiller(idExamen, idSurveillant)
        .then(() => loadData())
        .catch(() => alert("Erreur lors de la suppression"));
    }
  };

  return (
    <div>
      <TableList
        title="Associations Examen ↔ Surveillant"
        columns={[
          { key: "examen.matiere.nomMatiere", label: "Matière" },
          { key: "examen.dateExamen", label: "Date Examen" },
          { key: "surveillant.nomSurveillant", label: "Surveillant" },
        ]}
        data={surveillerList.map((s) => ({
          ...s,
          uid: `${s.id.idExamen}-${s.id.idSurveillant}`,
        }))}
        idKey="uid"
        onAdd={() => {
          setEditing(null);
          setShowForm(true);
        }}
        onEdit={(item) => {
          const assoc = surveillerList.find(
            (s) => `${s.id.idExamen}-${s.id.idSurveillant}` === item.uid
          );
          if (assoc) {
            setEditing(assoc);
            setShowForm(true);
          }
        }}
        onDelete={(uid) => {
          const assoc = surveillerList.find(
            (s) => `${s.id.idExamen}-${s.id.idSurveillant}` === uid
          );
          if (assoc)
            handleDelete(assoc.id.idExamen, assoc.id.idSurveillant);
        }}
      />

      {showForm && (
        <SurveillerForm
          onSave={(idExamen, idSurveillant) =>
            handleSave(idExamen, idSurveillant, editing ?? undefined)
          }
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          surveiller={editing ?? undefined}
        />
      )}
    </div>
  );
};

export default SurveillerList;
