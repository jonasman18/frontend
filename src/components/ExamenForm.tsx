import React, { useEffect, useRef, useState } from "react";
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

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function parseLocalDateTime(localDT?: string | null): Date | null {
  if (!localDT) return null;
  const [datePart, timePart] = localDT.split("T");
  if (!datePart) return null;
  const [y, m, d] = datePart.split("-").map(Number);
  let hh = 0,
    mm = 0;
  if (timePart) {
    const [H, M] = timePart.split(":");
    hh = Number(H ?? 0);
    mm = Number(M ?? 0);
  }
  return new Date(y, m - 1, d, hh, mm, 0, 0);
}

function formatLocalDateTime(dt: Date): string {
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(
    dt.getDate()
  )}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
}

const ExamenForm: React.FC<ExamenFormProps> = ({ examen, onSave, onClose }) => {
  const [formData, setFormData] = useState<Examen>(examen ?? initialForm());
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [filteredMatieres, setFilteredMatieres] = useState<Matiere[]>([]);
  const [searchMatiere, setSearchMatiere] = useState<string>("");
  const [niveaux, setNiveaux] = useState<Niveau[]>([]);
  const [salles, setSalles] = useState<Salle[]>([]);
  const [selectedSalles, setSelectedSalles] = useState<string[]>([]);
  const [dureeHeure, setDureeHeure] = useState<number>(0);
  const [dureeMinute, setDureeMinute] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const lastEditedRef = useRef<"debut" | "fin" | "duree" | null>(null);
  const updatingRef = useRef(false); // ✅ Anti-boucle

  // --- Charger données
  useEffect(() => {
    Promise.all([
      ApiService.getMatieres(),
      ApiService.getNiveaux(),
      ApiService.getSalles(),
    ]).then(([m, n, s]) => {
      setMatieres(m);
      setFilteredMatieres(m);
      setNiveaux(n);
      setSalles(s);
    });
  }, []);

  // --- Si édition
  useEffect(() => {
    if (examen) {
      setFormData(examen);
      setSelectedSalles(
        examen.numeroSalle ? examen.numeroSalle.split(",").map((x) => x.trim()) : []
      );
      const total = examen.duree ?? 0;
      const h = Math.floor(total);
      const m = Math.round((total - h) * 60);
      setDureeHeure(h);
      setDureeMinute(m);
    }
  }, [examen]);

  // --- Filtrage matières
  useEffect(() => {
    const query = searchMatiere.toLowerCase();
    setFilteredMatieres(
      matieres.filter((m) => m.nomMatiere.toLowerCase().includes(query))
    );
  }, [searchMatiere, matieres]);

  // --- Liens date ↔ heures
  useEffect(() => {
    if (!formData.dateExamen) return;
    const baseDate = formData.dateExamen;
    setFormData((prev) => {
      const hd = prev.heureDebut || `${baseDate}T08:00`;
      const debutDT = parseLocalDateTime(hd);
      const dur = prev.duree ?? 1;
      const hf = debutDT
        ? formatLocalDateTime(new Date(debutDT.getTime() + dur * 60 * 60 * 1000))
        : `${baseDate}T09:00`;
      return { ...prev, heureDebut: hd, heureFin: hf };
    });
  }, [formData.dateExamen]);

  // --- Heure début → heure fin
  useEffect(() => {
    if (!formData.heureDebut || lastEditedRef.current === "fin" || updatingRef.current)
      return;
    const debut = parseLocalDateTime(formData.heureDebut);
    if (!debut) return;
    const dur = dureeHeure + dureeMinute / 60;
    if (dur > 0) {
      updatingRef.current = true;
      const newFin = new Date(debut.getTime() + dur * 60 * 60 * 1000);
      setFormData((prev) => ({
        ...prev,
        heureFin: formatLocalDateTime(newFin),
        duree: dur,
      }));
      setTimeout(() => (updatingRef.current = false), 100);
    }
  }, [formData.heureDebut]);

  // --- Durée → heure fin
  useEffect(() => {
    if (lastEditedRef.current === "fin" || updatingRef.current) return;
    const debut = parseLocalDateTime(formData.heureDebut);
    if (!debut) return;
    const dur = dureeHeure + dureeMinute / 60;
    updatingRef.current = true;
    const newFin = new Date(debut.getTime() + dur * 60 * 60 * 1000);
    setFormData((prev) => ({
      ...prev,
      heureFin: formatLocalDateTime(newFin),
      duree: dur,
    }));
    setTimeout(() => (updatingRef.current = false), 100);
  }, [dureeHeure, dureeMinute]);

  // --- Heure fin → recalcul durée
  useEffect(() => {
    if (updatingRef.current) return;
    const debut = parseLocalDateTime(formData.heureDebut);
    const fin = parseLocalDateTime(formData.heureFin);
    if (!debut || !fin) return;
    const diff = (fin.getTime() - debut.getTime()) / (1000 * 60 * 60);
    if (diff < 0) {
      setError("L'heure de fin ne peut pas être avant l'heure de début.");
    } else {
      setError(null);
      updatingRef.current = true;
      setDureeHeure(Math.floor(diff));
      setDureeMinute(Math.round((diff - Math.floor(diff)) * 60));
      setFormData((prev) => ({ ...prev, duree: diff }));
      setTimeout(() => (updatingRef.current = false), 100);
    }
  }, [formData.heureFin]);

  // --- Gestion saisies
  const handleChangeSimple = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleSalle = (numero: string) => {
    setSelectedSalles((prev) =>
      prev.includes(numero)
        ? prev.filter((s) => s !== numero)
        : [...prev, numero]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  const debut = parseLocalDateTime(formData.heureDebut);
  const fin = parseLocalDateTime(formData.heureFin);

  if (!debut || !fin || fin <= debut) {
    setError("Heure de fin invalide.");
    return;
  }

  const matiereId =
    formData.matiere?.idMatiere ??
    (typeof formData.matiere === "number" ? formData.matiere : null);
  const niveauId =
    formData.niveau?.idNiveau ??
    (typeof formData.niveau === "number" ? formData.niveau : null);

  if (!matiereId || !niveauId) {
    setError("Veuillez sélectionner une matière et un niveau valides.");
    return;
  }

  const toSave: Examen = {
    ...formData,
    matiere: {
      idMatiere: Number(matiereId),
      nomMatiere:
        matieres.find((m) => m.idMatiere === Number(matiereId))?.nomMatiere || "",
    },
    niveau: {
      idNiveau: Number(niveauId),
      codeNiveau: niveaux.find((n) => n.idNiveau === Number(niveauId))?.codeNiveau || "",
    },
    numeroSalle: selectedSalles.join(","),
    duree: Number((dureeHeure + dureeMinute / 60).toFixed(2)),
    dateExamen: formData.dateExamen,
    heureDebut: formData.heureDebut,
    heureFin: formData.heureFin,
  };

  console.log("📤 Données envoyées à l'API:", toSave);
  onSave(toSave);
};


  // --- UI
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4">
      <div className="bg-gradient-to-b from-emerald-900 to-emerald-800 text-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl border border-emerald-600/50">
        <h2 className="text-2xl font-semibold text-center mb-6 text-emerald-200">
          {formData.idExamen ? "✏️ Modifier un Examen" : "➕ Ajouter un Examen"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Matière + Niveau */}
          <div className="grid grid-cols-2 gap-4">
            {/* Matière avec recherche + sélection */}
            <div>
              <label className="block text-sm font-medium text-emerald-100 mb-1">
                Matière
              </label>
              <div className="flex items-center gap-2">
                <div className="relative w-1/4">
                  <input
                    type="text"
                    value={searchMatiere}
                    onChange={(e) => setSearchMatiere(e.target.value)}
                    placeholder="🔍"
                    className="w-full border border-emerald-600 bg-emerald-950 rounded-lg p-2 text-center"
                  />
                </div>
                <select
                  value={formData.matiere?.idMatiere ?? ""}
                  onChange={(e) => {
                    const selected = matieres.find(
                      (m) => m.idMatiere === Number(e.target.value)
                    );
                    if (selected) {
                      setFormData((p) => ({ ...p, matiere: selected }));
                      setSearchMatiere("");
                    }
                  }}
                  className="w-3/4 border border-emerald-600 bg-emerald-950 rounded-lg p-2"
                >
                  <option value="">-- Sélectionner --</option>
                  {filteredMatieres.map((m) => (
                    <option key={m.idMatiere} value={m.idMatiere}>
                      {m.nomMatiere}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Niveau */}
            <div>
              <label className="block text-sm font-medium text-emerald-100 mb-1">
                Niveau
              </label>
              <select
                value={formData.niveau?.idNiveau ?? ""}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    niveau: { ...p.niveau, idNiveau: Number(e.target.value) },
                  }))
                }
                required
                className="w-full border border-emerald-600 bg-emerald-950 rounded-lg p-2"
              >
                <option value="">-- Sélectionner --</option>
                {niveaux.map((n) => (
                  <option key={n.idNiveau} value={n.idNiveau}>
                    {n.codeNiveau}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date + Durée */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Date examen</label>
              <input
                type="date"
                value={formData.dateExamen ?? ""}
                onChange={(e) => handleChangeSimple("dateExamen", e.target.value)}
                required
                className="w-full border border-emerald-600 bg-emerald-950 rounded-lg p-2 mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Durée</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="number"
                  min={0}
                  value={dureeHeure}
                  onChange={(e) => setDureeHeure(Number(e.target.value))}
                  className="w-14 text-center border border-emerald-600 bg-emerald-950 rounded-lg p-2"
                />
                <span>H</span>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={dureeMinute}
                  onChange={(e) => setDureeMinute(Number(e.target.value))}
                  className="w-14 text-center border border-emerald-600 bg-emerald-950 rounded-lg p-2"
                />
                <span>MIN</span>
              </div>
            </div>
          </div>

          {/* Heures */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Heure début</label>
              <input
                type="datetime-local"
                value={formData.heureDebut ?? ""}
                onChange={(e) => handleChangeSimple("heureDebut", e.target.value)}
                required
                className="w-full border border-emerald-600 bg-emerald-950 rounded-lg p-2 mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Heure fin</label>
              <input
                type="datetime-local"
                value={formData.heureFin ?? ""}
                onChange={(e) => handleChangeSimple("heureFin", e.target.value)}
                required
                className="w-full border border-emerald-600 bg-emerald-950 rounded-lg p-2 mt-1"
              />
            </div>
          </div>

          {/* Salles */}
          <div>
            <label className="block text-sm font-medium">Salles</label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {salles.map((s) => (
                <label
                  key={s.numeroSalle}
                  className={`flex items-center gap-2 px-2 py-1 rounded-lg cursor-pointer border transition ${
                    selectedSalles.includes(s.numeroSalle)
                      ? "bg-emerald-600 border-emerald-400"
                      : "bg-emerald-950 border-emerald-700 hover:bg-emerald-800"
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
            <select
              value={formData.session ?? ""}
              onChange={(e) => handleChangeSimple("session", e.target.value)}
              className="w-1/2 border border-emerald-600 bg-emerald-950 rounded-lg p-2 mt-1"
            >
              <option value="">-- Choisir une session --</option>
              <option value="Matin">Matin</option>
              <option value="Après-midi">Après-midi</option>
              <option value="Soir">Soir</option>
            </select>
          </div>

          {error && (
            <div className="text-sm text-red-300 bg-red-900/30 p-2 rounded-md border border-red-700">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold"
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
