import React, { useEffect, useState } from "react";
import { ApiService } from "../services/ApiService";
import type { Examen } from "../models/Examen";
import type { Matiere } from "../models/Matiere";
import type { Niveau } from "../models/Niveau";
import type { Salle } from "../models/Salle";

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
  const [salles, setSalles] = useState<Salle[]>([]);
  const [selectedSalles, setSelectedSalles] = useState<string[]>([]);

  // Charger les données
  useEffect(() => {
    Promise.all([
      ApiService.getMatieres(),
      ApiService.getNiveaux(),
      ApiService.getSalles(),
    ]).then(([mData, nData, sData]) => {
      setMatieres(mData);
      setNiveaux(nData);
      setSalles(sData);
    });
  }, []);

  // Lorsqu'on édite un examen : re-sélectionner les salles déjà enregistrées
  useEffect(() => {
    if (examen) {
      setFormData(examen);
      const sallesExistantes = examen.numeroSalle
        ? examen.numeroSalle.split(",").map((s) => s.trim())
        : [];
      setSelectedSalles(sallesExistantes);
    }
  }, [examen]);

  // Gestion des changements
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === "matiere.idMatiere")
        return {
          ...prev,
          matiere: { ...prev.matiere, idMatiere: Number(value) },
        };
      if (name === "niveau.idNiveau")
        return {
          ...prev,
          niveau: { ...prev.niveau, idNiveau: Number(value) },
        };
      if (name === "duree")
        return { ...prev, duree: value === "" ? 0 : parseFloat(value) };
      return { ...prev, [name]: value };
    });
  };

  // Sélection/désélection d’une salle
  const toggleSalle = (numero: string) => {
    setSelectedSalles((prev) =>
      prev.includes(numero)
        ? prev.filter((s) => s !== numero)
        : [...prev, numero]
    );
  };

  // Soumission du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.matiere?.idMatiere || !formData.niveau?.idNiveau) {
      alert("Sélectionnez la matière et le niveau.");
      return;
    }
    if (selectedSalles.length === 0) {
      alert("Veuillez sélectionner au moins une salle.");
      return;
    }

    // Concaténer les salles en une seule chaîne
    const updatedForm = {
      ...formData,
      numeroSalle: selectedSalles.join(","),
    };

    onSave(updatedForm);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <div className="bg-emerald-800 text-white rounded-lg shadow-xl p-6 w-full max-w-xl">
        <h2 className="text-xl font-bold text-center mb-6">
          {formData.idExamen ? "Modifier un Examen" : "Ajouter un Examen"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Matière */}
          <div>
            <label className="block text-sm font-medium">Matière</label>
            <select
              name="matiere.idMatiere"
              value={formData.matiere?.idMatiere ?? ""}
              onChange={handleChange}
              required
              className="w-full border border-emerald-600 bg-emerald-900 text-white rounded-md p-2 mt-1"
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
              className="w-full border border-emerald-600 bg-emerald-900 text-white rounded-md p-2 mt-1"
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
                className="w-full border border-emerald-600 bg-emerald-900 text-white rounded-md p-2 mt-1"
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
                className="w-full border border-emerald-600 bg-emerald-900 text-white rounded-md p-2 mt-1"
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
                className="w-full border border-emerald-600 bg-emerald-900 text-white rounded-md p-2 mt-1"
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
                className="w-full border border-emerald-600 bg-emerald-900 text-white rounded-md p-2 mt-1"
              />
            </div>
          </div>

          {/* Sélection multiple de salles */}
          <div>
            <label className="block text-sm font-medium">Salles</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
              {salles.map((s) => (
                <label
                  key={s.numeroSalle}
                  className={`flex items-center gap-2 cursor-pointer rounded-md px-2 py-1 transition ${
                    selectedSalles.includes(s.numeroSalle)
                      ? "bg-emerald-600"
                      : "bg-emerald-900 hover:bg-emerald-700"
                  }`}
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

          {/* Session */}
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
