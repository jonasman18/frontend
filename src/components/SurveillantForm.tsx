import React, { useEffect, useState } from "react";
import { ApiService } from "../services/ApiService";
import type { Salle } from "../models/Salle";
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

  const [salles, setSalles] = useState<Salle[]>([]);
  const [selectedSalles, setSelectedSalles] = useState<string[]>([]);

  // 🔹 Charger les salles depuis l’API
  useEffect(() => {
    ApiService.getSalles().then(setSalles);

    if (surveillant?.numeroSalle) {
      // si l’existant contient "007,008"
      setSelectedSalles(
        surveillant.numeroSalle.split(",").map((s) => s.trim())
      );
    }
  }, [surveillant]);

  // 🔹 Gestion sélection multiple
  const toggleSalle = (numero: string) => {
    setSelectedSalles((prev) =>
      prev.includes(numero)
        ? prev.filter((s) => s !== numero)
        : [...prev, numero]
    );
  };

  // 🔹 Gestion des champs simples
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Soumission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nomSurveillant || selectedSalles.length === 0) {
      alert("Veuillez renseigner le nom et au moins une salle !");
      return;
    }

    const surveillantToSave: Surveillant = {
      ...formData,
      numeroSalle: selectedSalles.join(","), // Ex: "007,008"
    };

    onSave(surveillantToSave);
  };

  return (
    <ModalForm
      title={surveillant ? "Modifier un Surveillant" : "Ajouter un Surveillant"}
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

      {/* Sélection multiple de salles */}
      <div>
        <label className="block text-sm font-medium">Salles assignées</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
          {salles.map((s) => (
            <label
              key={s.numeroSalle}
              className="flex items-center gap-2 cursor-pointer bg-emerald-800 rounded-md px-2 py-1 hover:bg-emerald-700 transition"
            >
              <input
                type="checkbox"
                checked={selectedSalles.includes(s.numeroSalle)}
                onChange={() => toggleSalle(s.numeroSalle)}
              />
              {s.numeroSalle}
            </label>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div>
        <label className="block text-sm font-medium mt-3">Contact</label>
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
