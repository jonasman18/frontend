import React, { useEffect, useState } from "react";
import { ApiService } from "../services/ApiService";
import type { Salle } from "../models/Salle";
import SalleForm from "./SalleForm";
import TableList from "./TableList";

const SalleList: React.FC = () => {
  const [salles, setSalles] = useState<Salle[]>([]);
  const [filteredSalles, setFilteredSalles] = useState<Salle[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingSalle, setEditingSalle] = useState<Salle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ApiService.getSalles()
      .then((data) => {
        setSalles(data);
        setFilteredSalles(data);
      })
      .catch((err) => {
        console.error("Erreur chargement salles:", err);
        setError("Erreur de chargement des salles");
      })
      .finally(() => setLoading(false));
  }, []);

  // 🔍 Filtrage en direct
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFilteredSalles(
      salles.filter(
        (s) =>
          s.numeroSalle.toLowerCase().includes(term) ||
          s.capaciteMax?.toString().includes(term) ||
          s.nbrSurveillant?.toString().includes(term)
      )
    );
  }, [searchTerm, salles]);

  const handleDelete = (numeroSalle: string) => {
    if (confirm("Confirmer la suppression ?")) {
      ApiService.deleteSalle(numeroSalle)
        .then(() =>
          setSalles((prev) => prev.filter((s) => s.numeroSalle !== numeroSalle))
        )
        .catch((err) => {
          console.error("Erreur suppression salle:", err);
          alert("Erreur lors de la suppression");
        });
    }
  };

  const handleSave = (salle: Salle) => {
    ApiService.saveSalle(salle)
      .then((savedSalle) => {
        if (editingSalle) {
          setSalles((prev) =>
            prev.map((s) =>
              s.numeroSalle === savedSalle.numeroSalle ? savedSalle : s
            )
          );
        } else {
          setSalles((prev) => [...prev, savedSalle]);
        }
        setShowForm(false);
        setEditingSalle(null);
      })
      .catch((err) => {
        console.error("Erreur sauvegarde salle:", err);
        alert("Erreur lors de la sauvegarde");
      });
  };

  if (loading)
    return <div className="text-center text-gray-200">Chargement des salles...</div>;
  if (error)
    return <div className="text-center text-red-400">Erreur: {error}</div>;

  return (
    <div className="space-y-4">
      {/* 🔍 Barre de recherche */}
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Rechercher une salle ou capacité..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 rounded-md text-gray-900 w-1/3 border border-emerald-600 focus:ring-2 focus:ring-emerald-500 outline-none transition-all duration-300"
        />
      </div>

      {/* 🧾 TableList stylée */}
      <TableList
        title="Liste des Salles"
        columns={[
          { key: "numeroSalle", label: "Numéro Salle" },
          { key: "capaciteMax", label: "Capacité Max" },
          { key: "nbrSurveillant", label: "Nombre Surveillants" },
        ]}
        data={filteredSalles}
        idKey="numeroSalle"
        onAdd={() => {
          setEditingSalle(null);
          setShowForm(true);
        }}
        onEdit={(item) => {
          setEditingSalle(item);
          setShowForm(true);
        }}
        onDelete={(id) => handleDelete(String(id))}
      />

      {showForm && (
        <SalleForm
          salle={editingSalle ?? undefined}
          onSave={handleSave}
          onClose={() => {
            setShowForm(false);
            setEditingSalle(null);
          }}
        />
      )}
    </div>
  );
};

export default SalleList;
