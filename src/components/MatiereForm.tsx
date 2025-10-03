import React, { useState } from "react";
import type { Matiere } from "../models/Matiere";
import ModalForm from "./ModalForm";

interface MatiereFormProps {
  matiere?: Matiere;
  onSave: (matiere: Matiere) => void;
  onClose: () => void;
}

const MatiereForm: React.FC<MatiereFormProps> = ({ matiere, onSave, onClose }) => {
  const [formData, setFormData] = useState<Matiere>(
    matiere ?? { idMatiere: undefined, nomMatiere: "" }
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
      title={formData.idMatiere ? "Modifier une Matière" : "Ajouter une Matière"}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel={formData.idMatiere ? "Mettre à jour" : "Enregistrer"}
    >
      <div>
        <label className="block text-sm font-medium">Nom de la Matière</label>
        <input
          type="text"
          name="nomMatiere"
          value={formData.nomMatiere}
          onChange={handleChange}
          required
          className="w-full border border-emerald-600 bg-emerald-900 text-white rounded-md p-2 mt-1 focus:ring-2 focus:ring-emerald-400"
        />
      </div>
    </ModalForm>
  );
};

export default MatiereForm;
