import React, { useEffect, useRef, useState } from "react";
import { ApiService } from "../services/ApiService";
import type { Examen } from "../models/Examen";
import type { Salle } from "../models/Salle";
import type { Surveillant } from "../models/Surveillant";
import type { PlanningSurveillance } from "../models/PlanningSurveillance";
import ModalForm from "./ModalForm";

interface PlanningSurveillanceFormProps {
  planning?: PlanningSurveillance;
  onSave: (planning: PlanningSurveillance[]) => void;
  onClose: () => void;
}

const PlanningSurveillanceForm: React.FC<PlanningSurveillanceFormProps> = ({
  planning,
  onSave,
  onClose,
}) => {
  const [examens, setExamens] = useState<Examen[]>([]);
  const [filteredExamens, setFilteredExamens] = useState<Examen[]>([]);
  const [searchExamen, setSearchExamen] = useState("");
  const [showExamenDropdown, setShowExamenDropdown] = useState(false);

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

  const examenRef = useRef<HTMLDivElement>(null);

  // Charger les données initiales
  useEffect(() => {
    Promise.all([
      ApiService.getExamens(),
      ApiService.getSalles(),
      ApiService.getSurveillants(),
    ]).then(([e, s, sv]) => {
      setExamens(e);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      setFilteredExamens(
        e.filter((ex) => {
          if (!ex.dateExamen) return false;
          const examDate = new Date(ex.dateExamen);
          examDate.setHours(0, 0, 0, 0);
          return examDate >= today;
        })
      );
      setSalles(s);
      setSurveillants(sv);
    });
  }, []);

  // Filtrage dynamique pour examens
  useEffect(() => {
    const q = searchExamen.toLowerCase();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setFilteredExamens(
      examens.filter(
        (e) => {
          if (!e.dateExamen) return false;
          const examDate = new Date(e.dateExamen);
          examDate.setHours(0, 0, 0, 0);
          return examDate >= today &&
            (e.matiere?.nomMatiere?.toLowerCase().includes(q) ||
            e.dateExamen?.toLowerCase().includes(q) ||
            e.session?.toLowerCase().includes(q) ||
            e.numeroSalle?.toLowerCase().includes(q));
        }
      )
    );
  }, [searchExamen, examens]);

  // Fermer le dropdown si clic à l’extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        examenRef.current &&
        !examenRef.current.contains(e.target as Node)
      ) {
        setShowExamenDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

    const sallesTriees = [...sallesAssociees].sort(
      (a, b) => (a.nbrSurveillant ?? 3) - (b.nbrSurveillant ?? 3)
    );

    let encoreDesPlaces = true;
    let round = 0;

    while (encoreDesPlaces) {
      encoreDesPlaces = false;
      for (const salle of sallesTriees) {
        const max = salle.nbrSurveillant ?? 3;
        const affectes = distribution[salle.numeroSalle] ?? [];

        if (affectes.length < max) {
          const compatible = surveillants.find((sv) => {
            if (!sv.numeroSalle) return false;
            const sallesSv = sv.numeroSalle.split(",").map((n) => n.trim());
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
      if (round > 100) break;
    }

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

  // Gestion de changement simple
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ✅ Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.examen || sallesDetectees.length === 0) {
      alert("⚠️ Veuillez sélectionner un examen avec au moins une salle !");
      return;
    }

    try {
      const result = await ApiService.savePlanningSurveillance({
        examen: formData.examen,
        sallesDetectees,
        surveillantsDetectes,
        dateExamen: formData.dateExamen,
        heureDebut: formData.heureDebut,
        heureFin: formData.heureFin,
      });

      alert("✅ Plannings enregistrés avec succès !");
      onSave(result);
      onClose();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde :", error);
      alert("❌ Erreur lors de la sauvegarde du planning.");
    }
  };

  return (
    <ModalForm
      title={planning ? "Modifier le Planning" : "Ajouter un Planning"}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      {/* Examen - Sélecteur avec recherche */}
      <div ref={examenRef} className="relative mb-4">
        <label className="block text-sm font-medium mb-1 text-emerald-100">
          Examen
        </label>
        <div
          className="border border-emerald-600 bg-emerald-950 text-white rounded-lg p-2 cursor-pointer"
          onClick={() => setShowExamenDropdown((p) => !p)}
        >
          {formData.examen
            ? `${formData.examen.matiere?.nomMatiere || "N/A"} — ${formData.examen.dateExamen || "N/A"}`
            : "-- Sélectionner --"}
        </div>

        {showExamenDropdown && (
          <div className="absolute mt-1 w-full bg-emerald-950 border border-emerald-700 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
            <div className="sticky top-0 bg-emerald-950 p-2 border-b border-emerald-700">
              <input
                type="text"
                value={searchExamen}
                onChange={(e) => setSearchExamen(e.target.value)}
                placeholder="🔍 Rechercher un examen (matière, date...)"
                className="w-full bg-emerald-900 text-white rounded-md px-2 py-1 outline-none focus:ring-2 focus:ring-emerald-500"
                autoFocus
              />
            </div>
            {filteredExamens.map((ex) => (
              <div
                key={ex.idExamen}
                className={`px-3 py-2 cursor-pointer hover:bg-emerald-700 ${
                  formData.examen?.idExamen === ex.idExamen ? "bg-emerald-600" : ""
                }`}
                onClick={() => {
                  handleSelectChange("examen", ex);
                  setShowExamenDropdown(false);
                  setSearchExamen("");
                }}
              >
                {ex.matiere?.nomMatiere} — {ex.dateExamen} ({ex.session})
              </div>
            ))}
            {filteredExamens.length === 0 && (
              <div className="px-3 py-2 text-gray-400 text-sm">
                Aucun examen trouvé
              </div>
            )}
          </div>
        )}
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