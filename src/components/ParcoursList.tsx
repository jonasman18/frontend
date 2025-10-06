import React, { useEffect, useState } from "react";
import { ApiService } from "../services/ApiService";
import type { Parcours } from "../models/Parcours";
import ParcoursForm from "./ParcoursForm";
import TableList from "./TableList";

const ParcoursList: React.FC = () => {
  const [parcours, setParcours] = useState<Parcours[]>([]);
  const [filteredParcours, setFilteredParcours] = useState<Parcours[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingParcours, setEditingParcours] = useState<Parcours | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔹 Chargement initial
  useEffect(() => {
    ApiService.getParcours()
      .then((data) => {
        setParcours(data);
        setFilteredParcours(data);
      })
      .catch(() => setError("Erreur lors du chargement des parcours"))
      .finally(() => setLoading(false));
  }, []);

  // 🔍 Recherche dynamique
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFilteredParcours(
      parcours.filter(
        (p) =>
          p.codeParcours?.toLowerCase().includes(term) ||
          p.libelleParcours?.toLowerCase().includes(term) ||
          p.idParcours?.toString().includes(term)
      )
    );
  }, [searchTerm, parcours]);

  // 🔧 Suppression
  const handleDelete = (id: number) => {
    if (confirm("Confirmer la suppression ?")) {
      ApiService.deleteParcours(id)
        .then(() =>
          setParcours((prev) => prev.filter((p) => p.idParcours !== id))
        )
        .catch(() => alert("Erreur lors de la suppression"));
    }
  };

  // 💾 Sauvegarde
  const handleSave = (p: Parcours) => {
    ApiService.saveParcours(p)
      .then((saved) => {
        if (editingParcours) {
          setParcours((prev) =>
            prev.map((x) =>
              x.idParcours === saved.idParcours ? saved : x
            )
          );
        } else {
          setParcours((prev) => [...prev, saved]);
        }
        setShowForm(false);
        setEditingParcours(null);
      })
      .catch(() => alert("Erreur lors de la sauvegarde"));
  };

  if (loading)
    return <div className="text-center text-gray-200">Chargement des parcours...</div>;
  if (error)
    return <div className="text-center text-red-400">Erreur : {error}</div>;

  return (
    <div className="space-y-4">
      

      {/* 🧾 Tableau principal */}
      <TableList
        title="Liste des Parcours"
        columns={[
          { key: "idParcours", label: "ID" },
          { key: "codeParcours", label: "Code" },
          { key: "libelleParcours", label: "Libellé" },
        ]}
        data={filteredParcours}
        idKey="idParcours"
        onAdd={() => {
          setEditingParcours(null);
          setShowForm(true);
        }}
        onEdit={(item) => {
          setEditingParcours(item);
          setShowForm(true);
        }}
        onDelete={(id) => handleDelete(Number(id))}
      />

      {showForm && (
        <ParcoursForm
          parcours={editingParcours ?? undefined}
          onSave={handleSave}
          onClose={() => {
            setShowForm(false);
            setEditingParcours(null);
          }}
        />
      )}
    </div>
  );
};

export default ParcoursList;
