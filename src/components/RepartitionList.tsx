import React, { useEffect, useState } from "react";
import { ApiService } from "../services/ApiService";
import type { Repartition } from "../models/Repartition";
import TableList from "./TableList";
import RepartitionForm from "./RepartitionForm";

const RepartitionList: React.FC = () => {
  const [repartitions, setRepartitions] = useState<Repartition[]>([]);
  const [filtered, setFiltered] = useState<Repartition[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Repartition | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    ApiService.getRepartitions()
      .then((data) => {
        setRepartitions(data);
        setFiltered(data);
      })
      .catch(() => alert("Erreur de chargement des répartitions"));
  }, []);

  // Recherche
  useEffect(() => {
    const lower = search.toLowerCase();
    setFiltered(
      repartitions.filter(
        (r) =>
          r.groupe.toLowerCase().includes(lower) ||
          r.etudiantDebut.toLowerCase().includes(lower) ||
          r.etudiantFin.toLowerCase().includes(lower)
      )
    );
  }, [search, repartitions]);

  const handleDelete = (id: number | string) => {
    if (confirm("Voulez-vous supprimer cette répartition ?")) {
      ApiService.deleteRepartition(Number(id))
        .then(() => setRepartitions(repartitions.filter((r) => r.idRepartition !== id)))
        .catch(() => alert("Erreur lors de la suppression"));
    }
  };

  const handleSave = (rep: Repartition) => {
    ApiService.saveRepartition(rep)
      .then((saved) => {
        if (editing) {
          setRepartitions((prev) =>
            prev.map((r) => (r.idRepartition === saved.idRepartition ? saved : r))
          );
        } else {
          setRepartitions((prev) => [...prev, saved]);
        }
        setShowForm(false);
        setEditing(null);
      })
      .catch(() => alert("Erreur lors de la sauvegarde"));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-white">Liste des Répartitions</h1>
        <input
          type="text"
          placeholder="🔍 Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 rounded-md border border-gray-400 text-black"
        />
      </div>

      <TableList
        title=""
        columns={[

          { key: "groupe", label: "Groupe" },
          { key: "etudiantDebut", label: "Début" },
          { key: "etudiantFin", label: "Fin" },
        ]}
        data={filtered}
        idKey="idRepartition"
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
        <RepartitionForm
          repartition={editing ?? undefined}
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

export default RepartitionList;
