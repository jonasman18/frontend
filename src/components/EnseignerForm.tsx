import React, { useEffect, useState } from "react";
import { ApiService } from "../services/ApiService";
import type { Enseigner } from "../models/Enseigner";
import type { Matiere } from "../models/Matiere";
import type { Enseignant } from "../models/Enseignant";
import ModalForm from "./ModalForm";

interface Props {
  enseigner?: Enseigner; // si défini -> mode édition
  onSave: (idMatiere: number, idEnseignant: number) => void;
  onClose: () => void;
}

const EnseignerForm: React.FC<Props> = ({ enseigner, onSave, onClose }) => {
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [enseignants, setEnseignants] = useState<Enseignant[]>([]);
  const [idMatiere, setIdMatiere] = useState<number | "">(
    enseigner?.matiere?.idMatiere ?? ""
  );
  const [idEnseignant, setIdEnseignant] = useState<number | "">(
    enseigner?.enseignant?.idEnseignant ?? ""
  );

  useEffect(() => {
    Promise.all([ApiService.getMatieres(), ApiService.getEnseignants()]).then(
      ([mats, ens]) => {
        setMatieres(mats);
        setEnseignants(ens);
      }
    );
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idMatiere || !idEnseignant) {
      alert("Veuillez sélectionner une matière et un enseignant");
      return;
    }
    onSave(Number(idMatiere), Number(idEnseignant));
  };

  return (
    <ModalForm
      title={
        enseigner
          ? "Modifier une association (Matière ↔ Enseignant)"
          : "Nouvelle association (Matière ↔ Enseignant)"
      }
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel={enseigner ? "Mettre à jour" : "Enregistrer"}
    >
      {/* Sélecteur Matière */}
      <div>
        <label className="block text-sm mb-1">Matière</label>
        <select
          value={idMatiere}
          onChange={(e) => setIdMatiere(Number(e.target.value))}
          className="w-full px-3 py-2 rounded-md text-black"
        >
          <option value="">-- Sélectionner une matière --</option>
          {matieres.map((m) => (
            <option key={m.idMatiere} value={m.idMatiere}>
              {m.nomMatiere}
            </option>
          ))}
        </select>
      </div>

      {/* Sélecteur Enseignant */}
      <div>
        <label className="block text-sm mb-1">Enseignant</label>
        <select
          value={idEnseignant}
          onChange={(e) => setIdEnseignant(Number(e.target.value))}
          className="w-full px-3 py-2 rounded-md text-black"
        >
          <option value="">-- Sélectionner un enseignant --</option>
          {enseignants.map((e) => (
            <option key={e.idEnseignant} value={e.idEnseignant}>
              {e.nomEnseignant} ({e.grade})
            </option>
          ))}
        </select>
      </div>
    </ModalForm>
  );
};

export default EnseignerForm;
