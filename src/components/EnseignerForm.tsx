import React, { useEffect, useRef, useState } from "react";
import { ApiService } from "../services/ApiService";
import type { Enseigner } from "../models/Enseigner";
import type { Matiere } from "../models/Matiere";
import type { Enseignant } from "../models/Enseignant";
import ModalForm from "./ModalForm";

interface Props {
  enseigner?: Enseigner;
  onSave: (idMatiere: number, idEnseignant: number) => void;
  onClose: () => void;
}

const EnseignerForm: React.FC<Props> = ({ enseigner, onSave, onClose }) => {
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [enseignants, setEnseignants] = useState<Enseignant[]>([]);

  const [filteredMatieres, setFilteredMatieres] = useState<Matiere[]>([]);
  const [filteredEnseignants, setFilteredEnseignants] = useState<Enseignant[]>([]);
  const [searchMatiere, setSearchMatiere] = useState("");
  const [searchEnseignant, setSearchEnseignant] = useState("");

  const [idMatiere, setIdMatiere] = useState<number | "" | undefined>(
    enseigner?.matiere?.idMatiere ?? ""
  );
  const [idEnseignant, setIdEnseignant] = useState<number | "" | undefined>(
    enseigner?.enseignant?.idEnseignant ?? ""
  );

  const [showMatiereDropdown, setShowMatiereDropdown] = useState(false);
  const [showEnseignantDropdown, setShowEnseignantDropdown] = useState(false);

  const matiereRef = useRef<HTMLDivElement>(null);
  const enseignantRef = useRef<HTMLDivElement>(null);

  // Charger les données
  useEffect(() => {
    Promise.all([ApiService.getMatieres(), ApiService.getEnseignants()]).then(
      ([mats, ens]) => {
        setMatieres(mats);
        setFilteredMatieres(mats);
        setEnseignants(ens);
        setFilteredEnseignants(ens);
      }
    );
  }, []);

  // Filtrage dynamique
  useEffect(() => {
    const q = searchMatiere.toLowerCase();
    setFilteredMatieres(
      matieres.filter((m) => m.nomMatiere.toLowerCase().includes(q))
    );
  }, [searchMatiere, matieres]);

  useEffect(() => {
    const q = searchEnseignant.toLowerCase();
    setFilteredEnseignants(
      enseignants.filter(
        (e) =>
          e.nomEnseignant.toLowerCase().includes(q) ||
          e.grade?.toLowerCase().includes(q)
      )
    );
  }, [searchEnseignant, enseignants]);

  // Fermer les dropdowns si clic à l’extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        matiereRef.current &&
        !matiereRef.current.contains(e.target as Node)
      ) {
        setShowMatiereDropdown(false);
      }
      if (
        enseignantRef.current &&
        !enseignantRef.current.contains(e.target as Node)
      ) {
        setShowEnseignantDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
      {/* Sélecteur de Matière */}
      <div ref={matiereRef} className="relative mb-4">
        <label className="block text-sm font-medium mb-1 text-emerald-100">
          Matière
        </label>
        <div
          className="border border-emerald-600 bg-emerald-950 text-white rounded-lg p-2 cursor-pointer"
          onClick={() => setShowMatiereDropdown((p) => !p)}
        >
          {idMatiere
            ? matieres.find((m) => m.idMatiere === idMatiere)?.nomMatiere
            : "-- Sélectionner --"}
        </div>

        {showMatiereDropdown && (
          <div className="absolute mt-1 w-full bg-emerald-950 border border-emerald-700 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
            <div className="sticky top-0 bg-emerald-950 p-2 border-b border-emerald-700">
              <input
                type="text"
                value={searchMatiere}
                onChange={(e) => setSearchMatiere(e.target.value)}
                placeholder="🔍 Rechercher une matière..."
                className="w-full bg-emerald-900 text-white rounded-md px-2 py-1 outline-none focus:ring-2 focus:ring-emerald-500"
                autoFocus
              />
            </div>
            {filteredMatieres.map((m) => (
              <div
                key={m.idMatiere}
                className={`px-3 py-2 cursor-pointer hover:bg-emerald-700 ${
                  idMatiere === m.idMatiere ? "bg-emerald-600" : ""
                }`}
                onClick={() => {
                  setIdMatiere(m.idMatiere);
                  setShowMatiereDropdown(false);
                }}
              >
                {m.nomMatiere}
              </div>
            ))}
            {filteredMatieres.length === 0 && (
              <div className="px-3 py-2 text-gray-400 text-sm">
                Aucune matière trouvée
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sélecteur d’Enseignant */}
      <div ref={enseignantRef} className="relative">
        <label className="block text-sm font-medium mb-1 text-emerald-100">
          Enseignant
        </label>
        <div
          className="border border-emerald-600 bg-emerald-950 text-white rounded-lg p-2 cursor-pointer"
          onClick={() => setShowEnseignantDropdown((p) => !p)}
        >
          {idEnseignant
            ? enseignants.find((e) => e.idEnseignant === idEnseignant)
                ?.nomEnseignant
            : "-- Sélectionner --"}
        </div>

        {showEnseignantDropdown && (
          <div className="absolute mt-1 w-full bg-emerald-950 border border-emerald-700 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
            <div className="sticky top-0 bg-emerald-950 p-2 border-b border-emerald-700">
              <input
                type="text"
                value={searchEnseignant}
                onChange={(e) => setSearchEnseignant(e.target.value)}
                placeholder="🔍 Rechercher un enseignant..."
                className="w-full bg-emerald-900 text-white rounded-md px-2 py-1 outline-none focus:ring-2 focus:ring-emerald-500"
                autoFocus
              />
            </div>
            {filteredEnseignants.map((e) => (
              <div
                key={e.idEnseignant}
                className={`px-3 py-2 cursor-pointer hover:bg-emerald-700 ${
                  idEnseignant === e.idEnseignant ? "bg-emerald-600" : ""
                }`}
                onClick={() => {
                  setIdEnseignant(e.idEnseignant);
                  setShowEnseignantDropdown(false);
                }}
              >
                {e.nomEnseignant} ({e.grade})
              </div>
            ))}
            {filteredEnseignants.length === 0 && (
              <div className="px-3 py-2 text-gray-400 text-sm">
                Aucun enseignant trouvé
              </div>
            )}
          </div>
        )}
      </div>
    </ModalForm>
  );
};

export default EnseignerForm;
