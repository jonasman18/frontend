import React, { useEffect, useState } from "react";
import { ApiService } from "../services/ApiService";
import type { Repartir } from "../models/Repartir";
import RepartirForm from "./RepartirForm";
import TableList from "./TableList";

const RepartirList: React.FC = () => {
  const [repartirList, setRepartirList] = useState<Repartir[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Repartir | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Chargement initial
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    ApiService.getRepartir()
      .then((data) => setRepartirList(data))
      .catch((err) => console.error("Erreur chargement repartir:", err));
  };

  // Ajout ou mise à jour
  const handleSave = (rep: Repartir) => {
    if (editing) {
      // 🔹 Si modification
      ApiService.updateRepartir(
        editing.id.numeroSalle,
        editing.id.idRepartition,
        rep.id.numeroSalle,
        rep.id.idRepartition
      )
        .then(() => {
          loadData();
          setShowForm(false);
          setEditing(null);
        })
        .catch(() => alert("Erreur lors de la mise à jour"));
    } else {
      // 🔹 Si ajout
      ApiService.saveRepartir(rep)
        .then(() => {
          loadData();
          setShowForm(false);
        })
        .catch(() => alert("Erreur lors de l’ajout"));
    }
  };

  // Suppression
  const handleDelete = (numeroSalle: string, idRepartition: number) => {
    if (confirm("Supprimer cette association ?")) {
      ApiService.deleteRepartir(numeroSalle, idRepartition)
        .then(loadData)
        .catch(() => alert("Erreur lors de la suppression"));
    }
  };

  // 🔍 Filtrage de recherche (par salle ou groupe)
  const filteredList = repartirList.filter((r) => {
    const salle = r.salle?.numeroSalle?.toLowerCase() || "";
    const groupe = r.repartition?.groupe?.toLowerCase() || "";
    return (
      salle.includes(searchTerm.toLowerCase()) ||
      groupe.includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="p-4">
      {/* Barre de recherche */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-emerald-100">
          Répartition des Salles
        </h1>
        <input
          type="text"
          placeholder="Rechercher par salle ou groupe..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-emerald-500 bg-emerald-900 text-white px-3 py-2 rounded-md focus:ring-2 focus:ring-emerald-400 w-64"
        />
      </div>

      {/* TableList */}
      <TableList
        title="Liste des Répartitions (Salle ↔ Groupe)"
        columns={[
          { key: "salle.numeroSalle", label: "Salle" },
          { key: "repartition.groupe", label: "Groupe" },
          { key: "repartition.etudiantDebut", label: "Début" },
          { key: "repartition.etudiantFin", label: "Fin" },
        ]}
        data={filteredList.map((r, i) => ({ ...r, uid: `${r.id.numeroSalle}-${r.id.idRepartition}` }))}
        idKey="uid"
        onAdd={() => {
          setEditing(null);
          setShowForm(true);
        }}
        onEdit={(item) => {
          const assoc = repartirList.find(
            (r) => `${r.id.numeroSalle}-${r.id.idRepartition}` === item.uid
          );
          setEditing(assoc ?? null);
          setShowForm(true);
        }}
        onDelete={(uid) => {
          const assoc = repartirList.find(
            (r) => `${r.id.numeroSalle}-${r.id.idRepartition}` === uid
          );
          if (assoc) {
            handleDelete(assoc.id.numeroSalle, assoc.id.idRepartition);
          }
        }}
      />

      {/* Formulaire Modal */}
      {showForm && (
        <RepartirForm
          repartir={editing ?? undefined}
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

export default RepartirList;
