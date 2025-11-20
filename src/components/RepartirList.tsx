import React, { useEffect, useState } from "react";
import { ApiService } from "../services/ApiService";
import type { Repartir } from "../models/Repartir";
import RepartitionComplete from "./RepartitionComplete";
import TableList from "./TableList";

const RepartirList: React.FC = () => {
  const [list, setList] = useState<Repartir[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Repartir | null>(null);

  const load = () =>
    ApiService.getRepartir().then(setList);

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (salle: string, repId: number) => {
    if (confirm("Supprimer ?")) {
      await ApiService.deleteRepartir(salle, repId);
      await load();
    }
  };

  const filtered = list;

  return (
    <div className="p-4">
      <TableList
        title="Répartition des salles"
        columns={[
          { key: "salle.numeroSalle", label: "Salle" },
          { key: "repartition.groupe", label: "Groupe" },
          { key: "repartition.etudiantDebut", label: "Début" },
          { key: "repartition.etudiantFin", label: "Fin" },
        ]}
        data={filtered.map((r) => ({
          ...r,
          uid: `${r.id.numeroSalle}-${r.id.idRepartition}`,
        }))}
        idKey="uid"
        onAdd={() => {
          setEditing(null);
          setShowForm(true);
        }}
        onEdit={(row) => {
          const found = list.find(
            (r) =>
              `${r.id.numeroSalle}-${r.id.idRepartition}` === row.uid
          );
          setEditing(found || null);
          setShowForm(true);
        }}
        onDelete={(uid) => {
          const found = list.find(
            (r) => `${r.id.numeroSalle}-${r.id.idRepartition}` === uid
          );
          if (found)
            handleDelete(found.id.numeroSalle, found.id.idRepartition);
        }}
      />

      {showForm && (
        <RepartitionComplete
          repartition={editing?.repartition}
          salleInitiale={editing?.id.numeroSalle}
          onSave={() => {
            setShowForm(false);
            setEditing(null);
            load();
          }}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
};

export default RepartirList;
