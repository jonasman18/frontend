import React, { useEffect, useState } from "react";
import { ApiService } from "../services/ApiService";
import type { Examen } from "../models/Examen";
import type { Salle } from "../models/Salle";
import type { Parcours } from "../models/Parcours";
import type { Surveillant } from "../models/Surveillant";
import type { PlanningSurveillance } from "../models/PlanningSurveillance";
import ModalForm from "./ModalForm";

interface PlanningSurveillanceFormProps {
  planning?: PlanningSurveillance;
  onSave: (planning: PlanningSurveillance) => void;
  onClose: () => void;
}

const PlanningSurveillanceForm: React.FC<PlanningSurveillanceFormProps> = ({
  planning,
  onSave,
  onClose,
}) => {
  const [examens, setExamens] = useState<Examen[]>([]);
  const [salles, setSalles] = useState<Salle[]>([]);
  const [parcours, setParcours] = useState<Parcours[]>([]);
  const [surveillants, setSurveillants] = useState<Surveillant[]>([]);

  const [formData, setFormData] = useState<PlanningSurveillance>(
    planning || {
      examen: undefined,
      salle: undefined,
      parcours: undefined,
      surveillant: undefined,
      heureDebut: "",
      heureFin: "",
      dateExamen: "",
    }
  );

  // 🔹 Charger les données nécessaires
  useEffect(() => {
    ApiService.getExamens().then(setExamens);
    ApiService.getSalles().then(setSalles);
    ApiService.getParcours().then(setParcours);
    ApiService.getSurveillants().then(setSurveillants);
  }, []);

  // 🔹 Détection automatique selon l’examen choisi
  useEffect(() => {
    const ex = formData.examen;
    if (!ex?.idExamen) return;

    // 🧩 Salle de l’examen
    const salleAssociee = salles.find((s) => s.numeroSalle === ex.numeroSalle);

    // 🧩 Surveillants de cette salle
    const surveillantsSalle = surveillants.filter(
      (s) => s.numeroSalle === ex.numeroSalle
    );

    // 🧩 Parcours associé à cet examen via ExamenParcours
    ApiService.getExamenParcours()
      .then((list) => {
        const ep = list.find((ep) => ep.examen?.idExamen === ex.idExamen);
        const parcoursAssocie = ep?.parcours;
        setFormData((prev) => ({
          ...prev,
          salle: salleAssociee || prev.salle,
          parcours: parcoursAssocie || prev.parcours,
          surveillant:
            surveillantsSalle.length === 1
              ? surveillantsSalle[0]
              : prev.surveillant,
          heureDebut: ex.heureDebut
            ? ex.heureDebut.replace(" ", "T")
            : prev.heureDebut,
          heureFin: ex.heureFin
            ? ex.heureFin.replace(" ", "T")
            : prev.heureFin,
          dateExamen: ex.dateExamen || prev.dateExamen,
        }));
      })
      .catch(() => console.warn("Erreur récupération parcours examen"));
  }, [formData.examen, salles, surveillants]);

  // 🔹 Gestion des changements
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // 🔹 Validation et envoi
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.examen ||
      !formData.salle?.numeroSalle ||
      !formData.surveillant?.idSurveillant
    ) {
      alert("Veuillez remplir tous les champs obligatoires !");
      return;
    }

    const planningToSave: PlanningSurveillance = {
      ...formData,
      heureDebut: formData.heureDebut || "",
      heureFin: formData.heureFin || "",
      dateExamen: formData.dateExamen || "",
    };

    onSave(planningToSave);
  };

  return (
    <ModalForm
      title={planning ? "Modifier le Planning" : "Ajouter au Planning"}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      {/* Examen */}
      <div>
        <label className="block text-sm font-medium">Examen</label>
        <select
          value={formData.examen?.idExamen || ""}
          onChange={(e) => {
            const ex = examens.find(
              (x) => x.idExamen === Number(e.target.value)
            );
            handleSelectChange("examen", ex);
          }}
          className="w-full border border-emerald-600 bg-emerald-900 text-white rounded-md p-2 mt-1"
        >
          <option value="">-- Sélectionner --</option>
          {examens.map((ex) => (
            <option key={ex.idExamen} value={ex.idExamen}>
              {ex.matiere?.nomMatiere} — {ex.dateExamen}
            </option>
          ))}
        </select>
      </div>

      {/* Heures */}
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium">Heure Début</label>
          <input
            type="datetime-local"
            name="heureDebut"
            value={formData.heureDebut || ""}
            onChange={handleChange}
            className="w-full border border-emerald-600 bg-emerald-900 text-white rounded-md p-2 mt-1"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium">Heure Fin</label>
          <input
            type="datetime-local"
            name="heureFin"
            value={formData.heureFin || ""}
            onChange={handleChange}
            className="w-full border border-emerald-600 bg-emerald-900 text-white rounded-md p-2 mt-1"
          />
        </div>
      </div>

      {/* Salle */}
      <div>
        <label className="block text-sm font-medium">Salle</label>
        <select
          value={formData.salle?.numeroSalle || ""}
          onChange={(e) => {
            const salle = salles.find(
              (s) => s.numeroSalle === e.target.value
            );
            handleSelectChange("salle", salle);
          }}
          className="w-full border border-emerald-600 bg-emerald-900 text-white rounded-md p-2 mt-1"
        >
          <option value="">-- Sélectionner --</option>
          {salles.map((s) => (
            <option key={s.numeroSalle} value={s.numeroSalle}>
              {s.numeroSalle}
            </option>
          ))}
        </select>
      </div>

      {/* Parcours */}
      <div>
        <label className="block text-sm font-medium">Parcours</label>
        <select
          value={formData.parcours?.idParcours || ""}
          onChange={(e) => {
            const p = parcours.find(
              (x) => x.idParcours === Number(e.target.value)
            );
            handleSelectChange("parcours", p);
          }}
          className="w-full border border-emerald-600 bg-emerald-900 text-white rounded-md p-2 mt-1"
        >
          <option value="">-- Sélectionner --</option>
          {parcours.map((p) => (
            <option key={p.idParcours} value={p.idParcours}>
              {p.codeParcours}
            </option>
          ))}
        </select>
      </div>

      {/* Surveillant */}
      <div>
        <label className="block text-sm font-medium">Surveillant</label>
        <select
          value={formData.surveillant?.idSurveillant || ""}
          onChange={(e) => {
            const s = surveillants.find(
              (x) => x.idSurveillant === Number(e.target.value)
            );
            handleSelectChange("surveillant", s);
          }}
          className="w-full border border-emerald-600 bg-emerald-900 text-white rounded-md p-2 mt-1"
        >
          <option value="">-- Sélectionner --</option>
          {surveillants.map((s) => (
            <option key={s.idSurveillant} value={s.idSurveillant}>
              {s.nomSurveillant} ({s.numeroSalle})
            </option>
          ))}
        </select>
      </div>
    </ModalForm>
  );
};

export default PlanningSurveillanceForm;
