import React, { useEffect, useState } from "react";
import { ApiService } from "../services/ApiService";
import type { Surveillant } from "../models/Surveillant";
import SurveillantForm from "./SurveillantForm";
import TableList from "./TableList";

const SurveillantList: React.FC = () => {
  const [surveillants, setSurveillants] = useState<Surveillant[]>([]);
  const [filteredSurveillants, setFilteredSurveillants] = useState<Surveillant[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Surveillant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔹 Chargement initial
  useEffect(() => {
    ApiService.getSurveillants()
      .then((data) => {
        setSurveillants(data);
        setFilteredSurveillants(data);
      })
      .catch(() => setError("Erreur chargement surveillants"))
      .finally(() => setLoading(false));
  }, []);

  // 🔍 Filtrage dynamique
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFilteredSurveillants(
      surveillants.filter(
        (s) =>
          s.nomSurveillant?.toLowerCase().includes(term) ||
          s.groupeSurveillant?.toLowerCase().includes(term) ||
          s.numeroSalle?.toLowerCase().includes(term) ||
          String(s.idSurveillant).includes(term)
      )
    );
  }, [searchTerm, surveillants]);

  // 🔹 Suppression
  const handleDelete = (id: number) => {
    if (confirm("Confirmer la suppression ?")) {
      ApiService.deleteSurveillant(id)
        .then(() =>
          setSurveillants((prev) => prev.filter((s) => s.idSurveillant !== id))
        )
        .catch(() => alert("Erreur lors de la suppression"));
    }
  };

  // 🔹 Sauvegarde
  const handleSave = (surv: Surveillant) => {
    ApiService.saveSurveillant(surv)
      .then((saved) => {
        if (editing) {
          setSurveillants((prev) =>
            prev.map((s) =>
              s.idSurveillant === saved.idSurveillant ? saved : s
            )
          );
        } else {
          setSurveillants((prev) => [...prev, saved]);
        }
        setShowForm(false);
        setEditing(null);
      })
      .catch(() => alert("Erreur sauvegarde surveillant"));
  };

  if (loading)
    return <div className="text-center text-gray-300">Chargement des surveillants...</div>;
  if (error)
    return <div className="text-center text-red-400">Erreur : {error}</div>;

  return (
    <div className="space-y-4">
      {/* 🔍 Barre de recherche */}
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Rechercher par nom, groupe ou salle..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 rounded-md text-gray-900 w-1/3 border border-emerald-600 focus:ring-2 focus:ring-emerald-500 outline-none transition-all duration-300"
        />
      </div>

      {/* 🧾 Table des surveillants */}
      <TableList
        title="Liste des Surveillants"
        columns={[
          { key: "idSurveillant", label: "ID" },
          { key: "nomSurveillant", label: "Nom" },
          { key: "groupeSurveillant", label: "Groupe" },
          { key: "numeroSalle", label: "Salle" },
        ]}
        data={filteredSurveillants}
        idKey="idSurveillant"
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
        <SurveillantForm
          surveillant={editing ?? undefined}
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

export default SurveillantList;
