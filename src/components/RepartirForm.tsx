import React, { useEffect, useState } from "react";
import { ApiService } from "../services/ApiService";
import type { Salle } from "../models/Salle";
import type { Repartition } from "../models/Repartition";
import type { Repartir } from "../models/Repartir";
import ModalForm from "./ModalForm";

interface RepartirFormProps {
  onSave: (rep: Repartir) => void;
  onClose: () => void;
  repartir?: Repartir;
}

const RepartirForm: React.FC<RepartirFormProps> = ({ onSave, onClose, repartir }) => {
  const [salles, setSalles] = useState<Salle[]>([]);
  const [repartitions, setRepartitions] = useState<Repartition[]>([]);
  const [formData, setFormData] = useState<Repartir>({
    id: {
      numeroSalle: repartir?.id?.numeroSalle ?? "",
      idRepartition: repartir?.id?.idRepartition ?? 0,
    },
    salle: repartir?.salle ?? ({} as Salle),
    repartition: repartir?.repartition ?? ({} as Repartition),
  });

  useEffect(() => {
    Promise.all([ApiService.getSalles(), ApiService.getRepartitions()])
      .then(([sallesData, repartitionsData]) => {
        setSalles(sallesData);
        setRepartitions(repartitionsData);
      })
      .catch(() => alert("Erreur lors du chargement des données"));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "numeroSalle") {
      setFormData((prev) => ({
        ...prev,
        id: { ...prev.id, numeroSalle: value },
        salle: { numeroSalle: value } as Salle,
      }));
    } else if (name === "idRepartition") {
      setFormData((prev) => ({
        ...prev,
        id: { ...prev.id, idRepartition: Number(value) },
        repartition: { idRepartition: Number(value) } as Repartition,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id.numeroSalle || !formData.id.idRepartition) {
      alert("Veuillez choisir une salle et une répartition !");
      return;
    }
    onSave(formData);
  };

  return (
    <ModalForm
      title={
        repartir ? "Modifier une Répartition de Salle" : "Associer Salle ↔ Répartition"
      }
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel={repartir ? "Mettre à jour" : "Enregistrer"}
    >
      {/* Sélection Salle */}
      <div>
        <label className="block text-sm font-medium text-emerald-200 mb-1">
          Salle :
        </label>
        <select
          name="numeroSalle"
          value={formData.id.numeroSalle}
          onChange={handleChange}
          required
          className="w-full border border-emerald-500 bg-emerald-900 text-white rounded-md p-2 focus:ring-2 focus:ring-emerald-400"
        >
          <option value="">-- Choisir une salle --</option>
          {salles.map((salle) => (
            <option key={salle.numeroSalle} value={salle.numeroSalle}>
              {salle.numeroSalle} ({salle.capaciteMax} places)
            </option>
          ))}
        </select>
      </div>

      {/* Sélection Répartition */}
      <div>
        <label className="block text-sm font-medium text-emerald-200 mb-1">
          Répartition :
        </label>
        <select
          name="idRepartition"
          value={formData.id.idRepartition}
          onChange={handleChange}
          required
          className="w-full border border-emerald-500 bg-emerald-900 text-white rounded-md p-2 focus:ring-2 focus:ring-emerald-400"
        >
          <option value="">-- Choisir une répartition --</option>
          {repartitions.map((r) => (
            <option key={r.idRepartition} value={r.idRepartition}>
              Groupe {r.groupe} ({r.etudiantDebut} → {r.etudiantFin})
            </option>
          ))}
        </select>
      </div>
    </ModalForm>
  );
};

export default RepartirForm;
