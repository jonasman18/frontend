import React, { useState } from "react";
import type { Parcours } from "../models/Parcours";
import ModalForm from "./ModalForm";

interface ParcoursFormProps {
  parcours?: Parcours;
  onSave: (parcours: Parcours) => void;
  onClose: () => void;
}

const ParcoursForm: React.FC<ParcoursFormProps> = ({ parcours, onSave, onClose }) => {
  const [formData, setFormData] = useState<Parcours>(
    parcours || { codeParcours: "", libelleParcours: "" }
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
    <ModalForm title={parcours ? "Modifier un Parcours" : "Ajouter un Parcours"} onClose={onClose} onSubmit={handleSubmit}>
      <div>
        <label className="block text-sm font-medium">Code Parcours</label>
        <input
          type="text"
          name="codeParcours"
          value={formData.codeParcours}
          onChange={handleChange}
          required
          className="w-full border border-emerald-600 bg-emerald-900 text-white rounded-md p-2 mt-1"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Libellé Parcours</label>
        <input
          type="text"
          name="libelleParcours"
          value={formData.libelleParcours}
          onChange={handleChange}
          required
          className="w-full border border-emerald-600 bg-emerald-900 text-white rounded-md p-2 mt-1"
        />
      </div>
    </ModalForm>
  );
};

export default ParcoursForm;
