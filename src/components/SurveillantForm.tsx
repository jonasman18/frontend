import React, { useState } from "react";
import type { Surveillant } from "../models/Surveillant";
import ModalForm from "./ModalForm";

interface SurveillantFormProps {
  surveillant?: Surveillant;
  onSave: (surveillant: Surveillant) => void;
  onClose: () => void;
}

const SurveillantForm: React.FC<SurveillantFormProps> = ({
  surveillant,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] = useState<Surveillant>(
    surveillant || {
      nomSurveillant: "",
      groupeSurveillant: "",
      numeroSalle: "",
      contact: "",
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <ModalForm
      title={
        surveillant ? "Modifier un Surveillant" : "Ajouter un Surveillant"
      }
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      {/* Nom */}
      <div>
        <label className="block text-sm font-medium">Nom</label>
        <input
          type="text"
          name="nomSurveillant"
          value={formData.nomSurveillant}
          onChange={handleChange}
          required
          className="w-full border border-emerald-600 bg-emerald-900 text-white rounded-md p-2 mt-1"
        />
      </div>

      {/* Groupe */}
      <div>
        <label className="block text-sm font-medium">Groupe</label>
        <input
          type="text"
          name="groupeSurveillant"
          value={formData.groupeSurveillant}
          onChange={handleChange}
          className="w-full border border-emerald-600 bg-emerald-900 text-white rounded-md p-2 mt-1"
        />
      </div>

      {/* Numéro de salle */}
      <div>
        <label className="block text-sm font-medium">Numéro Salle</label>
        <input
          type="text"
          name="numeroSalle"
          value={formData.numeroSalle}
          onChange={handleChange}
          required
          className="w-full border border-emerald-600 bg-emerald-900 text-white rounded-md p-2 mt-1"
        />
      </div>

      {/* Contact */}
      <div>
        <label className="block text-sm font-medium">Contact</label>
        <input
          type="text"
          name="contact"
          value={formData.contact}
          onChange={handleChange}
          placeholder="Ex : 034 12 345 67"
          className="w-full border border-emerald-600 bg-emerald-900 text-white rounded-md p-2 mt-1"
        />
      </div>
    </ModalForm>
  );
};

export default SurveillantForm;
