import React, { useState } from "react";
import type { Enseignant } from "../models/Enseignant";
import ModalForm from "./ModalForm";

interface EnseignantFormProps {
  enseignant?: Enseignant;
  onSave: (enseignant: Enseignant) => void;
  onClose: () => void;
}

const EnseignantForm: React.FC<EnseignantFormProps> = ({ enseignant, onSave, onClose }) => {
  const [formData, setFormData] = useState<Enseignant>(
    enseignant ?? { idEnseignant: 0, nomEnseignant: "", grade: "" }
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
      title={enseignant ? "Modifier un Enseignant" : "Ajouter un Enseignant"}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel={enseignant ? "Mettre à jour" : "Enregistrer"}
    >
      <div>
        <label className="block text-sm font-medium">ID Enseignant</label>
        <input
          type="number"
          name="idEnseignant"
          value={formData.idEnseignant}
          onChange={handleChange}
          required
          className="w-full border border-emerald-600 bg-emerald-900 text-white rounded-md p-2 mt-1"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Nom</label>
        <input
          type="text"
          name="nomEnseignant"
          value={formData.nomEnseignant}
          onChange={handleChange}
          required
          className="w-full border border-emerald-600 bg-emerald-900 text-white rounded-md p-2 mt-1"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Grade</label>
        <input
          type="text"
          name="grade"
          value={formData.grade}
          onChange={handleChange}
          className="w-full border border-emerald-600 bg-emerald-900 text-white rounded-md p-2 mt-1"
        />
      </div>
    </ModalForm>
  );
};

export default EnseignantForm;
