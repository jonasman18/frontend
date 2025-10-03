import React, { useEffect, useState } from "react";
import { ApiService } from "../services/ApiService";
import type { Examen } from "../models/Examen";
import type { Matiere } from "../models/Matiere";
import type { Niveau } from "../models/Niveau";

interface ExamenFormProps {
  examen?: Examen;
  onSave: (examen: Examen) => void;
  onClose: () => void;
}

const initialForm = (): Examen => ({
  matiere: { nomMatiere: "" },
  niveau: { codeNiveau: "" },
  dateExamen: "",
  heureDebut: "",
  heureFin: "",
  duree: 0,
  numeroSalle: "",
  session: "",
});

const ExamenForm: React.FC<ExamenFormProps> = ({ examen, onSave, onClose }) => {
  const [formData, setFormData] = useState<Examen>(examen ?? initialForm());
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [niveaux, setNiveaux] = useState<Niveau[]>([]);

  useEffect(() => {
    Promise.all([ApiService.getMatieres(), ApiService.getNiveaux()]).then(
      ([mData, nData]) => {
        setMatieres(mData);
        setNiveaux(nData);
      }
    );
  }, []);

  useEffect(() => {
    if (examen) setFormData(examen);
  }, [examen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === "matiere.idMatiere")
        return {
          ...prev,
          matiere: {
            ...prev.matiere,
            idMatiere: Number(value),
          },
        };
      if (name === "niveau.idNiveau")
        return {
          ...prev,
          niveau: {
            ...prev.niveau,
            idNiveau: Number(value),
          },
        };
      if (name === "duree")
        return { ...prev, duree: value === "" ? 0 : parseFloat(value) };
      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.matiere?.idMatiere || !formData.niveau?.idNiveau) {
      alert("Sélectionnez matière et niveau");
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <div className="bg-emerald-800 text-white rounded-lg shadow-xl p-6 w-full max-w-xl">
        <h2 className="text-xl font-bold text-center mb-6">
          {formData.idExamen ? "Modifier un Examen" : "Ajouter un Examen"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Matiere */}
          <div>
            <label className="block text-sm font-medium">Matière</label>
            <select
              name="matiere.idMatiere"
              value={formData.matiere?.idMatiere ?? ""}
              onChange={handleChange}
              required
              className="w-full border border-emerald-600 bg-emerald-900 text-white rounded-md p-2 mt-1 focus:ring-2 focus:ring-emerald-400"
            >
              <option value="">-- Sélectionner --</option>
              {matieres.map((m) => (
                <option key={m.idMatiere} value={m.idMatiere}>
                  {m.nomMatiere}
                </option>
              ))}
            </select>
          </div>

          {/* Niveau */}
          <div>
            <label className="block text-sm font-medium">Niveau</label>
            <select
              name="niveau.idNiveau"
              value={formData.niveau?.idNiveau ?? ""}
              onChange={handleChange}
              required
              className="w-full border border-emerald-600 bg-emerald-900 text-white rounded-md p-2 mt-1 focus:ring-2 focus:ring-emerald-400"
            >
              <option value="">-- Sélectionner --</option>
              {niveaux.map((n) => (
                <option key={n.idNiveau} value={n.idNiveau}>
                  {n.codeNiveau}
                </option>
              ))}
            </select>
          </div>

          {/* Date + Durée */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Date</label>
              <input
                type="date"
                name="dateExamen"
                value={formData.dateExamen ?? ""}
                onChange={handleChange}
                required
                className="w-full border border-emerald-600 bg-emerald-900 text-white rounded-md p-2 mt-1 focus:ring-2 focus:ring-emerald-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Durée (h)</label>
              <input
                type="number"
                step="0.5"
                name="duree"
                value={formData.duree ?? 0}
                onChange={handleChange}
                className="w-full border border-emerald-600 bg-emerald-900 text-white rounded-md p-2 mt-1 focus:ring-2 focus:ring-emerald-400"
              />
            </div>
          </div>

          {/* Heures */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Heure Début</label>
              <input
                type="datetime-local"
                name="heureDebut"
                value={formData.heureDebut ?? ""}
                onChange={handleChange}
                required
                className="w-full border border-emerald-600 bg-emerald-900 text-white rounded-md p-2 mt-1 focus:ring-2 focus:ring-emerald-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Heure Fin</label>
              <input
                type="datetime-local"
                name="heureFin"
                value={formData.heureFin ?? ""}
                onChange={handleChange}
                required
                className="w-full border border-emerald-600 bg-emerald-900 text-white rounded-md p-2 mt-1 focus:ring-2 focus:ring-emerald-400"
              />
            </div>
          </div>

          {/* Salle & Session */}
          <div>
            <label className="block text-sm font-medium">Salle</label>
            <input
              type="text"
              name="numeroSalle"
              value={formData.numeroSalle ?? ""}
              onChange={handleChange}
              className="w-full border border-emerald-600 bg-emerald-900 text-white rounded-md p-2 mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Session</label>
            <input
              type="text"
              name="session"
              value={formData.session ?? ""}
              onChange={handleChange}
              className="w-full border border-emerald-600 bg-emerald-900 text-white rounded-md p-2 mt-1"
            />
          </div>

          {/* Boutons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-md"
            >
              {formData.idExamen ? "Mettre à jour" : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExamenForm;
