import React, { useState, useEffect } from "react";
import ModalForm from "./ModalForm";
import type { Repartition } from "../models/Repartition";

interface RepartitionFormProps {
  repartition?: Repartition;
  onSave: (rep: Repartition) => void;
  onClose: () => void;
}

const RepartitionForm: React.FC<RepartitionFormProps> = ({
  repartition,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] = useState<Repartition>(
    repartition ?? {
      idRepartition: undefined,
      groupe: "",
      etudiantDebut: "",
      etudiantFin: "",
    }
  );

  const [capacite, setCapacite] = useState<number>(0);
  const [nombreEtudiants, setNombreEtudiants] = useState(0);

  // 🔢 Extraire le numéro d’un matricule
  const extraireNumero = (matricule: string): number => {
    const num = parseInt(matricule.replace(/\D/g, ""), 10);
    return isNaN(num) ? 0 : num;
  };

  // 📏 Calculer la différence entre deux matricules
  const calculerNombreEtudiants = (debut: string, fin: string): number => {
    const numDebut = extraireNumero(debut);
    const numFin = extraireNumero(fin);
    if (numDebut === 0 || numFin === 0 || numFin < numDebut) return 0;
    return numFin - numDebut + 1;
  };

  // ⚙️ Si on modifie une répartition existante → calculer la capacité initiale
  useEffect(() => {
    if (repartition?.etudiantDebut && repartition?.etudiantFin) {
      const n = calculerNombreEtudiants(
        repartition.etudiantDebut,
        repartition.etudiantFin
      );
      setCapacite(n);
      setNombreEtudiants(n);
    }
  }, [repartition]);

  // ⚙️ Mettre à jour le nombre d’étudiants à chaque changement
  useEffect(() => {
    setNombreEtudiants(
      calculerNombreEtudiants(formData.etudiantDebut, formData.etudiantFin)
    );
  }, [formData.etudiantDebut, formData.etudiantFin]);

  // ⚙️ Calcul automatique du matricule de fin selon la capacité
  useEffect(() => {
    if (formData.etudiantDebut && capacite > 0) {
      const debutNum = extraireNumero(formData.etudiantDebut);
      const lettre = formData.etudiantDebut.match(/[A-Za-z-]+/g)?.join("") ?? "";
      const finNum = debutNum + capacite - 1;
      setFormData((prev) => ({
        ...prev,
        etudiantFin: `${finNum} ${lettre}`.trim(),
      }));
    }
  }, [formData.etudiantDebut, capacite]);

  // 🖋️ Gérer les changements de texte
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 📏 Gérer le champ capacité
  const handleCapaciteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setCapacite(isNaN(val) ? 0 : val);
  };

  // 📨 Soumission du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <ModalForm
      title={
        repartition
          ? "Modifier une Répartition"
          : "Ajouter une Nouvelle Répartition"
      }
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel={repartition ? "Mettre à jour" : "Enregistrer"}
    >
      {/* Groupe */}
      <div>
        <label className="block text-sm font-medium mb-1">Groupe</label>
        <input
          type="text"
          name="groupe"
          value={formData.groupe}
          onChange={handleChange}
          required
          className="w-full border border-emerald-600 bg-emerald-900 text-white rounded-md p-2 mt-1 focus:ring-2 focus:ring-emerald-400"
        />
      </div>

      {/* Matricule début */}
      <div>
        <label className="block text-sm font-medium mb-1">Matricule Début</label>
        <input
          type="text"
          name="etudiantDebut"
          value={formData.etudiantDebut}
          onChange={handleChange}
          required
          placeholder="Ex: 1620 H-F"
          className="w-full border border-emerald-600 bg-emerald-900 text-white rounded-md p-2 mt-1 focus:ring-2 focus:ring-emerald-400"
        />
      </div>

      {/* Capacité */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Capacité (nombre d’étudiants)
        </label>
        <input
          type="number"
          min="1"
          value={capacite || ""}
          onChange={handleCapaciteChange}
          placeholder="Ex: 30"
          className="w-full border border-emerald-600 bg-emerald-900 text-white rounded-md p-2 mt-1 focus:ring-2 focus:ring-emerald-400"
        />
      </div>

      {/* Matricule fin */}
      <div>
        <label className="block text-sm font-medium mb-1">Matricule Fin</label>
        <input
          type="text"
          name="etudiantFin"
          value={formData.etudiantFin}
          onChange={handleChange}
          required
          placeholder="Ex: 1966 H-F"
          className="w-full border border-emerald-600 bg-emerald-900 text-white rounded-md p-2 mt-1 focus:ring-2 focus:ring-emerald-400"
        />
      </div>

      {/* Résumé dynamique */}
      <div className="mt-4 bg-emerald-800 p-3 rounded-md text-center">
        <p className="text-sm text-gray-200">
          <strong>Nombre d'étudiants détectés :</strong>{" "}
          <span className="text-emerald-300 font-semibold">
            {nombreEtudiants > 0 ? nombreEtudiants : "—"}
          </span>
        </p>
      </div>
    </ModalForm>
  );
};

export default RepartitionForm;
