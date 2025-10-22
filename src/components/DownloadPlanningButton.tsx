import React, { useEffect, useRef, useState } from "react";
import { ApiService } from "../services/ApiService";

interface Niveau {
  idNiveau?: number;
  codeNiveau: string;
}

interface Parcours {
  idParcours?: number;
  codeParcours: string;
}

interface Enseignant {
  idEnseignant?: number;
  nomEnseignant: string;
}

const DownloadPlanningButton: React.FC = () => {
  const [niveaux, setNiveaux] = useState<Niveau[]>([]);
  const [parcours, setParcours] = useState<Parcours[]>([]);
  const [enseignants, setEnseignants] = useState<Enseignant[]>([]);
  const [filteredEnseignants, setFilteredEnseignants] = useState<Enseignant[]>([]);

  const [selectedNiveau, setSelectedNiveau] = useState<string>("");
  const [selectedParcours, setSelectedParcours] = useState<string>("");
  const [selectedEnseignant, setSelectedEnseignant] = useState<string>("");

  const [searchEns, setSearchEns] = useState<string>("");

  // Dropdown pour enseignants
  const [showDropdown, setShowDropdownState] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    Promise.all([
      ApiService.getNiveaux(),
      ApiService.getParcours(),
      ApiService.getEnseignants(),
    ]).then(([niv, par, ens]) => {
      setNiveaux(niv);
      setParcours(par);
      setEnseignants(ens);
      setFilteredEnseignants(ens);
    });
  }, []);

  // 🔍 Recherche dynamique enseignant
  useEffect(() => {
    const query = searchEns.toLowerCase();
    setFilteredEnseignants(
      enseignants.filter((e) =>
        e.nomEnseignant.toLowerCase().includes(query)
      )
    );
  }, [searchEns, enseignants]);

  // 🔻 Gestion ouverture/fermeture dropdown enseignant
  const handleClickOutside = (e: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setShowDropdownState(false);
      document.removeEventListener("mousedown", handleClickOutside);
    }
  };

  function setShowDropdown(next: boolean | ((prev: boolean) => boolean)) {
    const nextVisible = typeof next === "function" ? next(showDropdown) : next;
    setShowDropdownState(nextVisible);
    if (nextVisible)
      document.addEventListener("mousedown", handleClickOutside);
    else
      document.removeEventListener("mousedown", handleClickOutside);
  }

  // 📄 Téléchargement PDF
  const download = async (filter: boolean = false) => {
    try {
      let url = "http://localhost:8080/api/planning/pdf";
      if (filter) {
        const params = new URLSearchParams();
        if (selectedNiveau) params.append("niveau", selectedNiveau);
        if (selectedParcours) params.append("parcours", selectedParcours);
        if (selectedEnseignant) params.append("enseignant", selectedEnseignant);
        url += "?" + params.toString();
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error("Erreur lors du téléchargement");
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = window.URL.createObjectURL(blob);
      a.download = "planning_examens.pdf";
      a.click();
      window.URL.revokeObjectURL(a.href);
    } catch (err) {
      alert("❌ Il n'y a aucun qui correspond à votre filtre.");
      console.error(err);
    }
  };

  return (
    <div className="bg-emerald-900/40 p-5 rounded-2xl shadow-lg border border-emerald-700 max-w-3xl mx-auto mt-6">
      <h2 className="text-xl font-semibold text-center text-emerald-200 mb-4">
        📅 Télécharger le planning des examens
      </h2>

      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Sélecteur niveau */}
        <div>
          <label className="block text-sm text-emerald-100 mb-1">Niveau</label>
          <select
            value={selectedNiveau}
            onChange={(e) => setSelectedNiveau(e.target.value)}
            className="w-full bg-emerald-950 border border-emerald-700 rounded-lg p-2 text-white"
          >
            <option value="">-- Tous les niveaux --</option>
            {niveaux.map((n) => (
              <option key={n.idNiveau} value={n.codeNiveau}>
                {n.codeNiveau}
              </option>
            ))}
          </select>
        </div>

        {/* Sélecteur parcours */}
        <div>
          <label className="block text-sm text-emerald-100 mb-1">Parcours</label>
          <select
            value={selectedParcours}
            onChange={(e) => setSelectedParcours(e.target.value)}
            className="w-full bg-emerald-950 border border-emerald-700 rounded-lg p-2 text-white"
          >
            <option value="">-- Tous les parcours --</option>
            {parcours.map((p) => (
              <option key={p.idParcours} value={p.codeParcours}>
                {p.codeParcours}
              </option>
            ))}
          </select>
        </div>

        {/* Sélecteur enseignant avec recherche dynamique */}
        <div className="relative" ref={dropdownRef}>
          <label className="block text-sm text-emerald-100 mb-1">
            Enseignant
          </label>

          {/* Boîte principale */}
          <div
            className="border border-emerald-700 bg-emerald-950 rounded-lg p-2 cursor-pointer select-none"
            onClick={() => {
              setShowDropdown((prev) => !prev);
              setTimeout(() => inputRef.current?.focus(), 50);
            }}
          >
            {selectedEnseignant || "-- Tous les enseignants --"}
          </div>

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute z-50 mt-1 w-full bg-emerald-950 border border-emerald-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {/* Champ de recherche */}
              <div className="sticky top-0 bg-emerald-950 p-2 border-b border-emerald-700">
                <input
                  ref={inputRef}
                  type="text"
                  value={searchEns}
                  onChange={(e) => setSearchEns(e.target.value)}
                  placeholder="🔍 Rechercher..."
                  className="w-full bg-emerald-900 text-white rounded-md px-2 py-1 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Option pour réinitialiser (tous les enseignants) */}
              <div
                className={`px-3 py-2 cursor-pointer hover:bg-emerald-700 ${
                  selectedEnseignant === "" ? "bg-emerald-600" : ""
                }`}
                onClick={() => {
                  setSelectedEnseignant("");
                  setShowDropdown(false);
                  setSearchEns("");
                  setFilteredEnseignants(enseignants);
                }}
              >
                🌍 Tous les enseignants
              </div>

              {/* Liste filtrée */}
              {filteredEnseignants.map((e) => (
                <div
                  key={e.idEnseignant}
                  className={`px-3 py-2 cursor-pointer hover:bg-emerald-700 ${
                    selectedEnseignant === e.nomEnseignant ? "bg-emerald-600" : ""
                  }`}
                  onClick={() => {
                    setSelectedEnseignant(e.nomEnseignant);
                    setShowDropdown(false);
                    setSearchEns("");
                    setFilteredEnseignants(enseignants);
                  }}
                >
                  {e.nomEnseignant}
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
      </div>

      {/* Boutons */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => download(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg font-medium shadow-md"
        >
          🎯 Télécharger filtré
        </button>

        <button
          onClick={() => download(false)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium shadow-md"
        >
          🌍 Télécharger tout
        </button>
      </div>
    </div>
  );
};

export default DownloadPlanningButton;
