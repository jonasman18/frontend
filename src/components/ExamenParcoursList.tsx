import React, { useEffect, useState } from "react";
import { ApiService } from "../services/ApiService";
import type { ExamenParcours } from "../models/ExamenParcours";
import ExamenParcoursForm from "./ExamenParcoursForm";
import TableList from "./TableList";

const ExamenParcoursList: React.FC = () => {
  const [associations, setAssociations] = useState<ExamenParcours[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingExamenId, setEditingExamenId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // 🔄 Charger toutes les associations
  const loadAssociations = () => {
    ApiService.getExamenParcours()
      .then((data) => setAssociations(data ?? []))
      .catch((err) => {
        console.error("Erreur chargement examen-parcours:", err);
        setAssociations([]);
      });
  };

  useEffect(() => {
    loadAssociations();
  }, []);

  // ✅ Regrouper les parcours par examen
  const groupedData = Object.values(
    associations.reduce((acc, a) => {
      const examId = a.examen?.idExamen;
      if (!examId) return acc;

      if (!acc[examId]) {
        acc[examId] = {
          idExamen: examId,
          matiere: a.examen?.matiere?.nomMatiere ?? "",
          dateExamen: a.examen?.dateExamen ?? "",
          parcours: new Set<string>(),
        };
      }

      if (a.parcours?.codeParcours) {
        acc[examId].parcours.add(a.parcours.codeParcours);
      }

      return acc;
    }, {} as Record<number, any>)
  );

  // ✅ Supprimer toutes les associations d’un examen
  const handleDeleteExam = (idExamen: number) => {
    if (confirm("Voulez-vous supprimer toutes les associations de cet examen ?")) {
      ApiService.deleteAllExamenParcoursByExamen(idExamen)
        .then(() => {
          setMessage("✅ Associations supprimées avec succès !");
          setTimeout(() => setMessage(null), 2500);
          loadAssociations();
        })
        .catch((err) => {
          console.error("Erreur lors de la suppression :", err);
          setMessage("❌ Erreur lors de la suppression !");
          setTimeout(() => setMessage(null), 2500);
        });
    }
  };

  return (
    <div className="relative">
      {/* ✅ Message temporaire au centre */}
      {message && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-emerald-700 text-white px-6 py-3 rounded-xl shadow-lg text-center z-50 animate-fadeIn">
          {message}
        </div>
      )}

      <TableList
        title="Associations Examens ↔ Parcours"
        columns={[
          { key: "matiere", label: "Matière" },
          { key: "dateExamen", label: "Date Examen" },
          { key: "parcours", label: "Parcours associés" },
        ]}
        data={groupedData.map((g) => ({
          ...g,
          parcours: Array.from(g.parcours).join(" / "), // ex: IG / SR
          uid: g.idExamen, // clé unique
        }))}
        idKey="uid"
        onAdd={() => {
          setEditingExamenId(null);
          setShowForm(true);
        }}
        onEdit={(item) => {
          setEditingExamenId(Number(item.uid));
          setShowForm(true);
        }}
        onDelete={(uid) => handleDeleteExam(Number(uid))}
      />

      {/* ✅ Formulaire modal */}
      {showForm && (
        <ExamenParcoursForm
          examenId={editingExamenId ?? undefined}
          onSave={() => {
            setShowForm(false);
            loadAssociations();
          }}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default ExamenParcoursList;
