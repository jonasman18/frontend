import React, { useState } from "react";
import type { Enseignant } from "../models/Enseignant";
import ModalForm from "./ModalForm";

interface EnseignantFormProps {
  enseignant?: Enseignant;
  onSave: (enseignant: Enseignant) => void;
  onClose: () => void;
}

const EnseignantForm: React.FC<EnseignantFormProps> = ({ enseignant, onSave, onClose }) => {
  const initialGrade = enseignant?.grade ?? "";
  const gradeOptions = [
    "Enseignant(e)",
    "Docteur en informatique",
    "Docteur HDR",
    "Professeur titulaire",
    "Maitre de conferences",
    "Assistant d'enseignement superieur",
    "Doctorant en informatique"
  ];
  const [formData, setFormData] = useState<Enseignant>({
    idEnseignant: enseignant?.idEnseignant ?? 0,
    nomEnseignant: enseignant?.nomEnseignant ?? "",
    grade: initialGrade
  });
  const [isCustom, setIsCustom] = useState(!!enseignant && !gradeOptions.includes(initialGrade));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGradeSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "Autres...") {
      if (!isCustom) {
        setFormData((prev) => ({ ...prev, grade: "" }));
      }
      setIsCustom(true);
    } else {
      setIsCustom(false);
      setFormData((prev) => ({ ...prev, grade: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const displayGrade = isCustom ? "Autres..." : formData.grade;

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
        <select
          name="grade"
          value={displayGrade}
          onChange={handleGradeSelectChange}
          className="w-full border border-emerald-600 bg-emerald-900 text-white rounded-md p-2 mt-1"
        >
          <option value="">Sélectionnez un grade</option>
          {gradeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
          <option value="Autres...">Autres...</option>
        </select>
      </div>
      {isCustom && (
        <div>
          <label className="block text-sm font-medium">Autre grade</label>
          <input
            type="text"
            name="grade"
            value={formData.grade}
            onChange={handleChange}
            className="w-full border border-emerald-600 bg-emerald-900 text-white rounded-md p-2 mt-1"
          />
        </div>
      )}
    </ModalForm>
  );
};

export default EnseignantForm;