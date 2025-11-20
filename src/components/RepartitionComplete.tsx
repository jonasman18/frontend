import React, { useState, useEffect, useRef } from "react";
import ModalForm from "./ModalForm";
import { ApiService } from "../services/ApiService";
import type { Salle } from "../models/Salle";
import type { Repartition } from "../models/Repartition";
import type { Repartir } from "../models/Repartir";

interface Props {
  onClose: () => void;
  onSave: (data: Repartir) => void;
  repartition?: Repartition;
  salleInitiale?: string;
}

const RepartitionComplete: React.FC<Props> = ({
  repartition,
  salleInitiale,
  onClose,
  onSave,
}) => {
  const [salles, setSalles] = useState<Salle[]>([]);
  const [formRep, setFormRep] = useState<Repartition>(
    repartition ?? {
      idRepartition: undefined,
      groupe: "",
      etudiantDebut: "",
      etudiantFin: "",
      salle: null,
    }
  );

  /** Salle sélectionnée */
  const [salleChoisie, setSalleChoisie] = useState(
    salleInitiale ?? repartition?.salle?.numeroSalle ?? ""
  );

  const [capacite, setCapacite] = useState(0);
  const [nombreEtudiants, setNombreEtudiants] = useState(0);
  const [erreurCapacite, setErreurCapacite] = useState("");

  const isCalculatingRef = useRef(false);

  /** UTILS */
  const extraireNumero = (mat: string) =>
    parseInt(mat.replace(/\D/g, ""), 10) || 0;

  const extraireLettres = (mat: string) =>
    mat.match(/[A-Za-z-]+/g)?.join("") ?? "";

  const calculerEtudiants = (debut: string, fin: string) => {
    const a = extraireNumero(debut);
    const b = extraireNumero(fin);
    return a && b && b >= a ? b - a + 1 : 0;
  };

  /** Charger les salles */
  useEffect(() => {
    ApiService.getSalles().then(setSalles);
  }, []);

  /** Sync début/fin → capacité */
  useEffect(() => {
    if (isCalculatingRef.current) return;
    const n = calculerEtudiants(formRep.etudiantDebut, formRep.etudiantFin);
    setNombreEtudiants(n);
    if (n > 0) setCapacite(n);
  }, [formRep.etudiantDebut, formRep.etudiantFin]);

  /** Sync capacité → fin */
  useEffect(() => {
    if (!formRep.etudiantDebut || capacite <= 0) return;

    isCalculatingRef.current = true;
    const debNum = extraireNumero(formRep.etudiantDebut);
    const lettres = extraireLettres(formRep.etudiantDebut);
    const newFin = `${debNum + capacite - 1} ${lettres}`.trim();

    setFormRep((p) => ({ ...p, etudiantFin: newFin }));

    setTimeout(() => (isCalculatingRef.current = false), 50);
  }, [capacite]);

  /** Init modification */
  useEffect(() => {
    if (repartition) {
      const n = calculerEtudiants(
        repartition.etudiantDebut,
        repartition.etudiantFin
      );
      setCapacite(n);
      setNombreEtudiants(n);
    }
  }, [repartition]);

  /** Vérifier dépassement capacité */
  useEffect(() => {
    const salle = salles.find((s) => s.numeroSalle === salleChoisie);
    if (salle && capacite > salle.capaciteMax) {
      setErreurCapacite(
        `⚠️ La capacité (${capacite}) dépasse les ${salle.capaciteMax} places de la salle !`
      );
    } else {
      setErreurCapacite("");
    }
  }, [capacite, salleChoisie, salles]);

  /** Sync capacité → nombreEtudiants dynamiquement */
useEffect(() => {
  if (capacite > 0) {
    setNombreEtudiants(capacite);
  }
}, [capacite]);


  /** Handle form change */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormRep({ ...formRep, [e.target.name]: e.target.value });
  };

  /** Soumission */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ⛔ Bloquer l’enregistrement si la salle est trop petite
    const salle = salles.find((s) => s.numeroSalle === salleChoisie);
    if (salle && capacite > salle.capaciteMax) {
      alert(
        `Impossible d’enregistrer : ${capacite} étudiants > ${salle.capaciteMax} places !`
      );
      return;
    }

    try {
      const saved = await ApiService.saveRepartition(formRep);
      const repId = saved.idRepartition!;

      const payloadRepartir: Repartir = {
        id: {
          numeroSalle: salleChoisie,
          idRepartition: repId,
        },
        salle: { numeroSalle: salleChoisie } as Salle,
        repartition: { idRepartition: repId } as Repartition,
      };

      await ApiService.saveRepartir(payloadRepartir);
      onSave(payloadRepartir);
    } catch (e) {
      console.error("Erreur handleSubmit:", e);
      alert("Erreur lors de l’enregistrement.");
    }
  };

  return (
    <ModalForm
      title={repartition ? "Modifier Répartition" : "Créer une Répartition"}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel={repartition ? "Mettre à jour" : "Enregistrer"}
    >
      {/* CARD INFOS */}
      <div className="bg-emerald-800/40 p-4 rounded-lg border border-emerald-600 mb-4">
        <h3 className="text-emerald-300 font-semibold mb-3 text-lg">
          Informations de la Répartition
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-300">Groupe</label>
            <input
              type="text"
              name="groupe"
              value={formRep.groupe}
              onChange={handleChange}
              className="w-full bg-emerald-900 border border-emerald-600 text-white p-2 rounded-md"
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-300">Matricule début</label>
            <input
              type="text"
              name="etudiantDebut"
              value={formRep.etudiantDebut}
              onChange={handleChange}
              className="w-full bg-emerald-900 border border-emerald-600 text-white p-2 rounded-md"
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-300">Capacité</label>
            <input
              type="number"
              value={capacite}
              onChange={(e) => setCapacite(parseInt(e.target.value, 10) || 0)}
              className="w-full bg-emerald-900 border border-emerald-600 text-white p-2 rounded-md"
            />
          </div>

          <div>
            <label className="text-sm text-gray-300">Matricule fin</label>
            <input
              type="text"
              name="etudiantFin"
              value={formRep.etudiantFin}
              onChange={handleChange}
              className="w-full bg-emerald-900 border border-emerald-600 text-white p-2 rounded-md"
              required
            />
          </div>
        </div>

        <div className="mt-4 p-3 bg-emerald-900/40 rounded-md border border-emerald-700 text-center">
          <span className="text-gray-300">Étudiants détectés : </span>
          <span className="text-emerald-300 font-bold">{nombreEtudiants}</span>
        </div>

        {erreurCapacite && (
          <div className="mt-3 text-center text-red-400 font-semibold">
            {erreurCapacite}
          </div>
        )}
      </div>

      {/* CARD SALLE */}
      <div className="bg-emerald-800/40 p-4 rounded-lg border border-emerald-600">
        <h3 className="text-emerald-300 font-semibold mb-3 text-lg text-center">
          Salle associée
        </h3>

        {repartition ? (
          /** 🔒 Lecture seule */
          <div className="p-3 rounded-md bg-emerald-900 border border-emerald-700 text-white text-center">
            <p className="text-xl font-bold tracking-wide">
              SALLE {salleChoisie} —{" "}
              {salles.find((s) => s.numeroSalle === salleChoisie)
                ?.capaciteMax ?? "?"}{" "}
              places
            </p>
          </div>
        ) : (
          /** 🟢 Select en création */
          <select
            value={salleChoisie}
            onChange={(e) => setSalleChoisie(e.target.value)}
            className="w-full bg-emerald-900 border border-emerald-600 text-white p-2 rounded-md"
            required
          >
            <option value="">-- Choisir une salle --</option>

            {salles.map((s) => (
              <option key={s.numeroSalle} value={s.numeroSalle}>
                SALLE {s.numeroSalle} — {s.capaciteMax} places
              </option>
            ))}
          </select>
        )}
      </div>
    </ModalForm>
  );
};

export default RepartitionComplete;
