import React, { useEffect, useState } from "react";
import type { Matiere } from "../models/Matiere";
import type { Niveau } from "../models/Niveau";
import { ApiService } from "../services/ApiService";
import ModalForm from "./ModalForm";

interface MatiereFormProps {
  matiere?: Matiere;
  onSave: (matiere: Matiere) => void;
  onClose: () => void;
}

const MatiereForm: React.FC<MatiereFormProps> = ({ matiere, onSave, onClose }) => {
  const [formData, setFormData] = useState<Matiere>(
    matiere ?? { nomMatiere: "", niveau: undefined }
  );
  const [niveaux, setNiveaux] = useState<Niveau[]>([]);

  useEffect(() => {
    ApiService.getNiveaux().then(setNiveaux);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "niveau") {
      const niv = niveaux.find((n) => n.idNiveau === Number(value));
      setFormData((prev) => ({ ...prev, niveau: niv }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
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
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-emerald-300">
            Nom de la Matière
          </label>
          <input
            type="text"
            name="nomMatiere"
            value={formData.nomMatiere}
            onChange={handleChange}
            required
            className="w-full border border-emerald-600 bg-emerald-900 text-white rounded-md p-2 mt-1 focus:ring-2 focus:ring-emerald-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-emerald-300">
            Niveau
          </label>
          <select
            name="niveau"
            value={formData.niveau?.idNiveau ?? ""}
            onChange={handleChange}
            required
            className="w-full border border-emerald-600 bg-emerald-900 text-white rounded-md p-2 mt-1 focus:ring-2 focus:ring-emerald-400"
          >
            <option value="">-- Choisir un niveau --</option>
            {niveaux.map((n) => (
              <option key={n.idNiveau} value={n.idNiveau}>
                {n.codeNiveau}
              </option>
            ))}
          </select>
        </div>
      </div>
    </ModalForm>
  );
};

export default MatiereForm;
