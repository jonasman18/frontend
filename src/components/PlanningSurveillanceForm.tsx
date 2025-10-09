import React, { useEffect, useState } from "react";
import { ApiService } from "../services/ApiService";
import type { Examen } from "../models/Examen";
import type { Salle } from "../models/Salle";
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
  const [surveillants, setSurveillants] = useState<Surveillant[]>([]);
  const [sallesDetectees, setSallesDetectees] = useState<Salle[]>([]);
  const [surveillantsDetectes, setSurveillantsDetectes] = useState<
    Record<string, Surveillant[]>
  >({});

  const [formData, setFormData] = useState<PlanningSurveillance>(
    planning || {
      examen: undefined,
      salle: undefined,
      surveillant: undefined,
      heureDebut: "",
      heureFin: "",
      dateExamen: "",
    }
  );

  // Charger les données initiales
  useEffect(() => {
    Promise.all([
      ApiService.getExamens(),
      ApiService.getSalles(),
      ApiService.getSurveillants(),
    ]).then(([e, s, sv]) => {
      setExamens(e);
      setSalles(s);
      setSurveillants(sv);
    });
  }, []);

  // 🔹 Détection automatique selon l’examen
  useEffect(() => {
    const ex = formData.examen;
    if (!ex?.idExamen) return;

    // 1️⃣ Salles liées à l’examen
    const numerosSallesExamen = ex.numeroSalle
      ? ex.numeroSalle.split(",").map((s) => s.trim())
      : [];

    const sallesAssociees = salles.filter((s) =>
      numerosSallesExamen.includes(s.numeroSalle)
    );

    // 2️⃣ Distribution équitable : chaque surveillant ne surveille qu'une salle
    const distribution: Record<string, Surveillant[]> = {};
    const surveillantsDejaAffectes = new Set<number>();

    // Préparer les salles par ordre de nombre max de surveillants
    const sallesTriees = [...sallesAssociees].sort(
      (a, b) => (a.nbrSurveillant ?? 3) - (b.nbrSurveillant ?? 3)
    );

    // Algorithme équitable : tour par tour
    let round = 0;
    let encoreDesPlaces = true;

    while (encoreDesPlaces) {
      encoreDesPlaces = false;
      for (const salle of sallesTriees) {
        const max = salle.nbrSurveillant ?? 3;
        const affectes = distribution[salle.numeroSalle] ?? [];

        if (affectes.length < max) {
          // Trouver un surveillant compatible et libre
          const compatible = surveillants.find((sv) => {
            if (!sv.numeroSalle) return false;
            const sallesSv = sv.numeroSalle
              .split(",")
              .map((num) => num.trim());
            return (
              sallesSv.includes(salle.numeroSalle) &&
              !surveillantsDejaAffectes.has(sv.idSurveillant!)
            );
          });

          if (compatible) {
            affectes.push(compatible);
            surveillantsDejaAffectes.add(compatible.idSurveillant!);
            distribution[salle.numeroSalle] = affectes;
            encoreDesPlaces = true;
          }
        }
      }
      round++;
      if (round > 100) break; // sécurité anti-boucle infinie
    }

    // Appliquer les données
    setSallesDetectees(sallesAssociees);
    setSurveillantsDetectes(distribution);

    setFormData((prev) => ({
      ...prev,
      salle: sallesAssociees.length === 1 ? sallesAssociees[0] : prev.salle,
      heureDebut: ex.heureDebut?.replace(" ", "T") || prev.heureDebut,
      heureFin: ex.heureFin?.replace(" ", "T") || prev.heureFin,
      dateExamen: ex.dateExamen || prev.dateExamen,
    }));
  }, [formData.examen, salles, surveillants]);

  // Gestion de changement
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ✅ Enregistrement — un planning par salle
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.examen || sallesDetectees.length === 0) {
      alert("Veuillez sélectionner un examen avec au moins une salle !");
      return;
    }

    // Générer un planning pour chaque salle
    const planningsParSalle: PlanningSurveillance[] = sallesDetectees.map(
      (salle) => {
        const surveillantsSalle = surveillantsDetectes[salle.numeroSalle] || [];
        return {
          ...formData,
          salle,
          surveillants: surveillantsSalle,
          examen: formData.examen!,
          heureDebut: formData.heureDebut || "",
          heureFin: formData.heureFin || "",
          dateExamen: formData.dateExamen || "",
        };
      }
    );

    console.log("🧾 Plannings à sauvegarder :", planningsParSalle);

    Promise.all(planningsParSalle.map((p) => ApiService.savePlanningSurveillance(p)))
      .then(() => {
        alert("✅ Plannings enregistrés avec succès !");
        onClose();
      })
      .catch(() => alert("❌ Erreur lors de la sauvegarde du planning."));
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
      <div className="flex gap-3 mt-3">
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

      {/* 🏫 Salles détectées */}
      {sallesDetectees.length > 0 && (
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">
            Salles détectées :
          </label>
          <div className="flex flex-wrap gap-2 mt-1">
            {sallesDetectees.map((s) => (
              <span
                key={s.numeroSalle}
                className="bg-emerald-700 px-3 py-1 rounded-full text-sm"
              >
                {s.numeroSalle} ({s.nbrSurveillant ?? 3} max)
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 👩‍🏫 Répartition par salle */}
      {Object.keys(surveillantsDetectes).length > 0 && (
        <div className="mt-5">
          <label className="block text-sm font-medium mb-2">
            Répartition automatique des surveillants :
          </label>
          <table className="w-full border border-emerald-600 rounded-lg overflow-hidden text-sm text-white">
            <thead className="bg-emerald-800">
              <tr>
                <th className="p-2 border border-emerald-700 text-left">Salle</th>
                <th className="p-2 border border-emerald-700 text-left">
                  Surveillants assignés
                </th>
                <th className="p-2 border border-emerald-700 text-center">
                  Nombre
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(surveillantsDetectes).map(([numSalle, svList]) => (
                <tr key={numSalle} className="hover:bg-emerald-700 transition">
                  <td className="p-2 border border-emerald-700">{numSalle}</td>
                  <td className="p-2 border border-emerald-700">
                    {svList.length > 0
                      ? svList.map((sv) => sv.nomSurveillant).join(", ")
                      : "Aucun surveillant disponible"}
                  </td>
                  <td className="p-2 border border-emerald-700 text-center">
                    {svList.length}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ModalForm>
  );
};

export default PlanningSurveillanceForm;
