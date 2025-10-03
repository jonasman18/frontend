import React, { useState } from "react";
import type { Salle } from "../models/Salle";
import ModalForm from "./ModalForm";

interface SalleFormProps {
  salle?: Salle;
  onSave: (salle: Salle) => void;
  onClose: () => void;
}

const SalleForm: React.FC<SalleFormProps> = ({ salle, onSave, onClose }) => {
  const [formData, setFormData] = useState<Salle>(
    salle || { numeroSalle: "", capaciteMax: 0, nbrSurveillant: 0 }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "capaciteMax" || name === "nbrSurveillant" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <ModalForm title={salle ? "Modifier une Salle" : "Ajouter une Salle"} onClose={onClose} onSubmit={handleSubmit}>
      {!salle && (
        <div>
          <label className="block text-sm font-medium">Numéro de Salle</label>
          <input
            type="text"
            name="numeroSalle"
            value={formData.numeroSalle}
            onChange={handleChange}
            required
            className="w-full border border-emerald-600 bg-emerald-900 text-white rounded-md p-2 mt-1"
          />
        </div>
      )}
      <div>
        <label className="block text-sm font-medium">Capacité Max</label>
        <input
          type="number"
          name="capaciteMax"
          value={formData.capaciteMax}
          onChange={handleChange}
          required
          className="w-full border border-emerald-600 bg-emerald-900 text-white rounded-md p-2 mt-1"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Nombre de Surveillants</label>
        <input
          type="number"
          name="nbrSurveillant"
          value={formData.nbrSurveillant}
          onChange={handleChange}
          required
          className="w-full border border-emerald-600 bg-emerald-900 text-white rounded-md p-2 mt-1"
        />
      </div>
    </ModalForm>
  );
};

export default SalleForm;
