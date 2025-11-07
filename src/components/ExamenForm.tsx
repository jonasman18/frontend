import React, { useEffect, useRef, useState } from "react";
import { ApiService } from "../services/ApiService";
import type { Examen } from "../models/Examen";
import type { Matiere } from "../models/Matiere";
import type { Niveau } from "../models/Niveau";
import type { Salle } from "../models/Salle";
import type { Enseignant } from "../models/Enseignant";
import type { Parcours } from "../models/Parcours";
import { motion, AnimatePresence } from "framer-motion";

interface ExamenFormProps {
  examen?: Examen;
  onSave: (toSave: Examen) => Promise<Examen>;
  onClose: () => void;
}

const initialForm = (): Examen => ({
  matiere: { nomMatiere: "", niveau: { codeNiveau: "" } },
  niveau: { codeNiveau: "" },
  dateExamen: "",
  heureDebut: "",
  heureFin: "",
  duree: 0,
  numeroSalle: "",
});

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

// Normalise date DD/MM/YYYY → YYYY-MM-DD
function normalizeDate(dateStr?: string | null): string | null {
  if (!dateStr) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  const parts = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (parts) {
    return `${parts[3]}-${parts[2]}-${parts[1]}`;
  }
  return null;
}

// Normalise datetime (date part seulement)
function normalizeDateTime(dtStr?: string | null): string | null {
  if (!dtStr) return null;
  const [datePart, timePart] = dtStr.split("T");
  const normalizedDate = normalizeDate(datePart);
  if (normalizedDate && timePart) {
    return `${normalizedDate}T${timePart}`;
  }
  return dtStr;
}

function parseLocalDateTime(localDT?: string | null): Date | null {
  if (!localDT) return null;
  // Remplace DD/MM/YYYY par YYYY-MM-DD dans la string complète
  let normalizedStr = localDT.replace(/(\d{2})\/(\d{2})\/(\d{4})/g, '$3-$2-$1');
  const [datePart, timePart] = normalizedStr.split("T");
  if (!datePart) return null;
  const [y, m, d] = datePart.split("-").map(Number);
  let hh = 0, mm = 0;
  if (timePart) {
    const [H, M] = timePart.split(":");
    hh = Number(H ?? 0);
    mm = Number(M ?? 0);
  }
  const dt = new Date(y, m - 1, d, hh, mm, 0, 0);
  if (isNaN(dt.getTime())) return null;
  return dt;
}

function formatLocalDateTime(dt: Date): string {
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(
    dt.getDate()
  )}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
}

function formatTime(dtStr?: string) {
  if (!dtStr) return "";
  const d = parseLocalDateTime(dtStr);
  if (!d) return "";
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Extrait la partie temps (HH:MM) d'une string heureDebut/Fin (qui peut être HH:MM ou full datetime)
function extractTimePart(timeStr?: string): string {
  if (!timeStr) return "";
  const timePart = timeStr.split('T')[1];
  if (timePart) {
    return timePart.split(':').slice(0, 2).join(':');
  }
  // Si pas de T, assume que c'est déjà HH:MM
  return timeStr;
}

const BUFFER_MINUTES = 0; // Buffer supprimé (0 minutes)

const ExamenForm: React.FC<ExamenFormProps> = ({ examen, onSave, onClose }) => {
  const [formData, setFormData] = useState<Examen>(examen ?? initialForm());
  const [loading, setLoading] = useState(false);
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [filteredMatieres, setFilteredMatieres] = useState<Matiere[]>([]);
  const [searchMatiere, setSearchMatiere] = useState<string>("");
  const [niveaux, setNiveaux] = useState<Niveau[]>([]);
  const [salles, setSalles] = useState<Salle[]>([]);
  const [selectedSalles, setSelectedSalles] = useState<string[]>([]);
  const [dureeHeure, setDureeHeure] = useState<number>(0);
  const [dureeMinute, setDureeMinute] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [enseignants, setEnseignants] = useState<Enseignant[]>([]);
  const [selectedEnseignantIds, setSelectedEnseignantIds] = useState<number[]>([]);
  const [parcours, setParcours] = useState<Parcours[]>([]);
  const [selectedParcoursIds, setSelectedParcoursIds] = useState<number[]>([]);

  // État pour les examens du jour (pour optimiser les checks)
  const [allExamens, setAllExamens] = useState<Examen[]>([]);

  // État pour les salles désactivées (floutées)
  const [disabledSalles, setDisabledSalles] = useState<string[]>([]);

  // popup succès
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  const lastEditedRef = useRef<"debut" | "fin" | "duree" | null>(null);
  const updatingRef = useRef(false);

  // Refs
  const sallesRef = useRef<HTMLDivElement>(null);
  const heuresRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (ref: { current: HTMLDivElement | null }) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  // --- Charger données
  useEffect(() => {
    Promise.all([ApiService.getMatieres(), ApiService.getNiveaux(), ApiService.getSalles(), ApiService.getParcours()])
      .then(([m, n, s, p]) => {
        setMatieres(m);
        setFilteredMatieres(m);
        setNiveaux(n);
        setSalles(s);
        setParcours(p ?? []);
      })
      .catch((err) => {
        console.error("Erreur chargement données:", err);
      });
  }, []);

  // Charger les examens quand la date change (optimisation) - ✅ Avec params pour pagination
  useEffect(() => {
    if (!formData.dateExamen) {
      setAllExamens([]);
      setDisabledSalles([]);
      return;
    }
    ApiService.getExamens({ page: 0, size: 100 })  // ✅ Fournit les args manquants
      .then((response) => {
        // Si c'est une Page, extrait le content ; sinon assume array
        const examensData = response.content ? response.content : response;
        setAllExamens(examensData);
      })
      .catch((err) => {
        console.error("Erreur chargement examens:", err);
        setAllExamens([]);
      });
  }, [formData.dateExamen]);

  // Calculer les salles désactivées (synchrone après fetch)
  useEffect(() => {
    if (!allExamens.length || !formData.heureDebut || !salles.length) {
      setDisabledSalles([]);
      return;
    }

    const selectedDate = normalizeDate(formData.dateExamen) ?? formData.dateExamen;
    const debut = parseLocalDateTime(formData.heureDebut);
    if (!debut || !selectedDate) {
      setDisabledSalles([]);
      return;
    }

    const dur = dureeHeure + dureeMinute / 60;
    const fin = new Date(debut.getTime() + dur * 60 * 60 * 1000);

    const disabled: string[] = [];
    for (const salle of salles) {
      const salleNum = salle.numeroSalle;
      let hasConflict = false;

      for (const ex of allExamens) {
        if (formData.idExamen && ex.idExamen === formData.idExamen) continue; // Exclure l'examen en édition
        const exDate = normalizeDate(ex.dateExamen) ?? ex.dateExamen;
        if (exDate !== selectedDate) continue;

        const existingSalles = ex.numeroSalle?.split(",").map((s: string) => s.trim()) || [];
        if (!existingSalles.includes(salleNum)) continue;

        const exDebutStr = `${exDate}T${extractTimePart(ex.heureDebut)}`;
        const exFinStr = `${exDate}T${extractTimePart(ex.heureFin)}`;
        const exDebut = parseLocalDateTime(exDebutStr);
        const exFin = parseLocalDateTime(exFinStr);
        if (!exDebut || !exFin) continue;

        const bufferMs = BUFFER_MINUTES * 60 * 1000;
        const overlap = (debut.getTime() < exFin.getTime() + bufferMs) && (fin.getTime() > exDebut.getTime() - bufferMs);
        if (overlap) {
          hasConflict = true;
          break;
        }
      }

      if (hasConflict) {
        disabled.push(salleNum);
      }
    }

    setDisabledSalles(disabled);

    // Auto-désélection des salles maintenant désactivées
    const newlyDisabled = disabled.filter(s => selectedSalles.includes(s));
    if (newlyDisabled.length > 0) {
      setSelectedSalles(prev => prev.filter(s => !disabled.includes(s))); // Retire les conflictuelles
    }
  }, [allExamens, formData.heureDebut, dureeHeure, dureeMinute, formData.idExamen, salles, selectedSalles]);

  // --- Si édition : normalise et reconstruit les datetimes complets
  useEffect(() => {
    if (examen) {
      const baseDate = normalizeDate(examen.dateExamen) ?? examen.dateExamen ?? "";
      const normalizedExamen = {
        ...examen,
        dateExamen: baseDate,
        heureDebut: normalizeDateTime(examen.heureDebut) ?? examen.heureDebut ?? "",
        heureFin: normalizeDateTime(examen.heureFin) ?? examen.heureFin ?? "",
      };

      // Reconstruit les heures avec la date si nécessaire (cas legacy time-only)
      let hd = normalizedExamen.heureDebut;
      let hf = normalizedExamen.heureFin;
      if (baseDate) {
        const timeDebut = extractTimePart(examen.heureDebut);
        const timeFin = extractTimePart(examen.heureFin);
        if (timeDebut && !hd.includes('T')) {
          hd = `${baseDate}T${timeDebut}`;
        }
        if (timeFin && !hf.includes('T')) {
          hf = `${baseDate}T${timeFin}`;
        }
      }

      const finalExamen = { ...normalizedExamen, heureDebut: hd, heureFin: hf };
      setFormData(finalExamen);
      setSelectedSalles(
        examen.numeroSalle ? examen.numeroSalle.split(",").map((x) => x.trim()) : []
      );
      const total = examen.duree ?? 0;
      const h = Math.floor(total);
      const m = Math.round((total - h) * 60);
      setDureeHeure(h);
      setDureeMinute(m);

      if (examen.idExamen) {
        ApiService.getEnseignantsByExamen(examen.idExamen)
          .then((ens) => {
            setSelectedEnseignantIds(ens.map((e: Enseignant) => e.idEnseignant ?? 0));
          })
          .catch(() => {});
        ApiService.getParcoursByExamen(examen.idExamen)
          .then((pars) => {
            setSelectedParcoursIds(pars.map((p: Parcours) => p.idParcours ?? 0));
          })
          .catch(() => {});
      }
    }
  }, [examen]);

  // --- Charger enseignants
  useEffect(() => {
    if (formData.matiere?.idMatiere) {
      ApiService.getEnseignantsByMatiere(formData.matiere.idMatiere).then(setEnseignants);
    } else {
      setEnseignants([]);
      setSelectedEnseignantIds([]);
    }
  }, [formData.matiere?.idMatiere]);

  // --- Filtrage matières (par niveau et recherche)
  useEffect(() => {
    const query = searchMatiere.toLowerCase();
    const selectedId = formData.niveau?.idNiveau;

    let filtered = matieres;
    if (selectedId) {
      const selectedNiv = niveaux.find((n) => n.idNiveau === selectedId);
      if (selectedNiv) {
        const code = selectedNiv.codeNiveau;
        filtered = matieres.filter((m) => m.niveau?.codeNiveau === code);
      }
    }

    filtered = filtered.filter((m) => m.nomMatiere.toLowerCase().includes(query));
    setFilteredMatieres(filtered);
  }, [searchMatiere, matieres, formData.niveau?.idNiveau, niveaux]);

  // --- Liens date ↔ heures (amélioré pour gérer time-only)
  useEffect(() => {
    if (!formData.dateExamen) return;
    const baseDate = normalizeDate(formData.dateExamen) ?? formData.dateExamen;
    setFormData((prev) => {
      let hd = prev.heureDebut;
      let debutDT: Date | null = null;

      // Si hd n'a pas de date, ajoute-la
      if (!hd.includes('T')) {
        const timePart = extractTimePart(hd) || '08:00';
        hd = `${baseDate}T${timePart}`;
      }

      debutDT = parseLocalDateTime(hd);
      if (!debutDT) {
        debutDT = parseLocalDateTime(`${baseDate}T08:00`)!;
        hd = formatLocalDateTime(debutDT);
      }

      const dur = prev.duree ?? 1;
      const hf = formatLocalDateTime(new Date(debutDT.getTime() + dur * 60 * 60 * 1000));
      return { ...prev, heureDebut: hd, heureFin: hf };
    });
  }, [formData.dateExamen]);

  // --- Heure début → heure fin
  useEffect(() => {
    if (!formData.heureDebut || lastEditedRef.current === "fin" || updatingRef.current) return;
    const debut = parseLocalDateTime(formData.heureDebut);
    if (!debut) return;
    const dur = dureeHeure + dureeMinute / 60;
    if (dur > 0) {
      updatingRef.current = true;
      const newFin = new Date(debut.getTime() + dur * 60 * 60 * 1000);
      setFormData((prev) => ({ ...prev, heureFin: formatLocalDateTime(newFin), duree: dur }));
      setTimeout(() => (updatingRef.current = false), 100);
    }
  }, [formData.heureDebut, dureeHeure, dureeMinute]);

  // --- Durée → heure fin
  useEffect(() => {
    if (lastEditedRef.current === "fin" || updatingRef.current) return;
    const debut = parseLocalDateTime(formData.heureDebut);
    if (!debut) return;
    const dur = dureeHeure + dureeMinute / 60;
    updatingRef.current = true;
    const newFin = new Date(debut.getTime() + dur * 60 * 60 * 1000);
    setFormData((prev) => ({ ...prev, heureFin: formatLocalDateTime(newFin), duree: dur }));
    setTimeout(() => (updatingRef.current = false), 100);
  }, [dureeHeure, dureeMinute, formData.heureDebut]);

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
  }, [formData.heureFin, formData.heureDebut]);

  const handleChangeSimple = (name: string, value: any) => {
    if (name === "dateExamen") {
      value = normalizeDate(value) ?? value;
    } else if (name === "heureDebut" || name === "heureFin") {
      value = normalizeDateTime(value) ?? value;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Ignorer le toggle si la salle est désactivée
  const toggleSalle = (numero: string) => {
    if (disabledSalles.includes(numero)) return; // Prévention de sélection
    setSelectedSalles((prev) => (prev.includes(numero) ? prev.filter((s) => s !== numero) : [...prev, numero]));
  };

  const toggleEnseignant = (id: number) => {
    setSelectedEnseignantIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleParcours = (id: number) => {
    setSelectedParcoursIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const debut = parseLocalDateTime(formData.heureDebut);
    const fin = parseLocalDateTime(formData.heureFin);

    if (!debut || !fin || fin <= debut) {
      setError("Heure de fin invalide.");
      setLoading(false);
      return;
    }

    const matiereId = formData.matiere?.idMatiere ?? (typeof formData.matiere === "number" ? formData.matiere : null);
    const niveauId = formData.niveau?.idNiveau ?? (typeof formData.niveau === "number" ? formData.niveau : null);

    if (!matiereId || !niveauId) {
      setError("Veuillez sélectionner une matière et un niveau valides.");
      setLoading(false);
      return;
    }

    // Validation des salles (non null/vide)
    if (selectedSalles.length === 0) {
      setError("Veuillez sélectionner au moins une salle.");
      setLoading(false);
      return;
    }

    // Validation des parcours
    if (selectedParcoursIds.length === 0) {
      setError("Veuillez sélectionner au moins un parcours.");
      setLoading(false);
      return;
    }

    const toSave: Examen = {
      ...formData,
      matiere: {
        idMatiere: Number(matiereId),
        nomMatiere: matieres.find((m) => m.idMatiere === Number(matiereId))?.nomMatiere || "",
        niveau: undefined
      },
      niveau: {
        idNiveau: Number(niveauId),
        codeNiveau: niveaux.find((n) => n.idNiveau === Number(niveauId))?.codeNiveau || "",
      },
      numeroSalle: selectedSalles.join(","),
      duree: Number((dureeHeure + dureeMinute / 60).toFixed(2)),
      dateExamen: normalizeDate(formData.dateExamen) ?? formData.dateExamen,
      heureDebut: formatLocalDateTime(debut),
      heureFin: formatLocalDateTime(fin),
    };

    try {
      const saved = await onSave(toSave);

      if (selectedEnseignantIds.length > 0 && saved.idExamen) {
        try {
          await ApiService.saveExamenEnseignants(saved.idExamen, selectedEnseignantIds);
        } catch (err) {
          console.error("Erreur sauvegarde enseignants:", err);
        }
      }

      if (selectedParcoursIds.length > 0 && saved.idExamen) {
        try {
          await ApiService.updateExamenParcoursGlobal(saved.idExamen, selectedParcoursIds);
        } catch (err) {
          console.error("Erreur sauvegarde parcours:", err);
        }
      }

      setSuccessMessage(formData.idExamen ? "Mise à jour avec succès !" : "Examen créé !");
      setShowSuccessPopup(true);
      setTimeout(() => {
        setShowSuccessPopup(false);
        onClose();
      }, 3000);
    } catch (err) {
      console.error("Erreur save:", err);
      setError("Erreur lors de la sauvegarde. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  // Dropdown refs
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [showDropdown, setShowDropdownState] = useState<boolean>(false);

  const handleClickOutside = (e: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setShowDropdownState(false);
      document.removeEventListener("mousedown", handleClickOutside);
    }
  };

  useEffect(() => {
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function updateShowDropdown(next: boolean | ((prev: boolean) => boolean)): void {
    const nextVisible = typeof next === "function" ? next(showDropdown) : next;
    setShowDropdownState(nextVisible);

    if (nextVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-2 sm:p-4">
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-3xl shadow-2xl p-3 sm:p-4 md:p-6 w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl max-h-[95vh] border border-emerald-600/30 backdrop-blur-md overflow-y-auto">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-center mb-3 sm:mb-4 md:mb-6 text-emerald-100 drop-shadow-sm sticky top-0 bg-gradient-to-br from-emerald-900/95 via-emerald-800/95 to-teal-900/95 z-10 py-3 rounded-t-3xl -mx-3 sm:-mx-4 md:-mx-6">
          {formData.idExamen ? "✏️ Modifier un Examen" : "➕ Ajouter un Examen"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3 pr-2 -mr-2">
          {/* Niveau + Matière */}
          <div className="grid grid-cols-1 gap-2.5 sm:gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-emerald-200 mb-1.5">
                Niveau
              </label>
              <select
                value={formData.niveau?.idNiveau ?? ""}
                onChange={(e) => {
                  const newId = Number(e.target.value);
                  const newNiv = niveaux.find((n) => n.idNiveau === newId);
                  setFormData((p) => {
                    const newNiveau = newNiv || { idNiveau: newId, codeNiveau: "" };
                    const resetMatiere = p.matiere && newNiv && p.matiere.niveau?.codeNiveau !== newNiv.codeNiveau;
                    return {
                      ...p,
                      niveau: newNiveau,
                      ...(resetMatiere ? { matiere: { nomMatiere: "", niveau: newNiveau } } : {}),
                    };
                  });
                }}
                required
                className="w-full border-2 border-emerald-500/40 bg-emerald-950/70 rounded-2xl p-2 text-sm transition-all duration-200 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none hover:shadow-lg active:scale-95"
              >
                <option value="">-- Sélectionner --</option>
                {niveaux.map((n) => (
                  <option key={n.idNiveau} value={n.idNiveau}>
                    {n.codeNiveau}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="relative" ref={dropdownRef}>
                <label className="block text-xs sm:text-sm font-semibold text-emerald-200 mb-1.5">Matière</label>
                <div
                  className="border-2 border-emerald-500/40 bg-emerald-950/70 rounded-2xl p-2 cursor-pointer select-none text-sm transition-all duration-200 hover:border-emerald-400 hover:shadow-lg active:scale-95"
                  onClick={() => {
                    updateShowDropdown((prev) => !prev);
                    setTimeout(() => inputRef.current?.focus(), 50);
                  }}
                >
                  {formData.matiere?.nomMatiere || "-- Sélectionner --"}
                </div>

                {showDropdown && (
                  <div className="absolute z-50 mt-1 w-full bg-emerald-950/95 border-2 border-emerald-600/40 rounded-2xl shadow-2xl max-h-48 overflow-y-auto animate-in fade-in duration-200 backdrop-blur-md">
                    <div className="sticky top-0 bg-emerald-950/95 p-1.5 border-b border-emerald-600/20">
                      <input
                        ref={inputRef}
                        type="text"
                        value={searchMatiere}
                        onChange={(e) => {
                          setSearchMatiere(e.target.value);
                          const query = e.target.value.toLowerCase();
                          const selectedId = formData.niveau?.idNiveau;
                          let filtered = matieres;
                          if (selectedId) {
                            const selectedNiv = niveaux.find((n) => n.idNiveau === selectedId);
                            if (selectedNiv) {
                              const code = selectedNiv.codeNiveau;
                              filtered = matieres.filter((m) => m.niveau?.codeNiveau === code);
                            }
                          }
                          filtered = filtered.filter((m) =>
                            m.nomMatiere.toLowerCase().includes(query)
                          );
                          setFilteredMatieres(filtered);
                        }}
                        placeholder="🔍 Rechercher une matière..."
                        className="w-full bg-emerald-900/40 text-white rounded-xl px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-400 outline-none text-sm transition-all duration-200"
                      />
                    </div>

                    {filteredMatieres.map((m) => (
                      <div
                        key={m.idMatiere}
                        className={`px-2.5 py-1.5 cursor-pointer hover:bg-emerald-700/40 text-sm transition-all duration-200 ${
                          formData.matiere?.idMatiere === m.idMatiere
                            ? "bg-emerald-600/60"
                            : ""
                        }`}
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, matiere: { ...m, niveau: prev.niveau } }));
                          updateShowDropdown(false);
                          setSearchMatiere("");
                        }}
                      >
                        {m.nomMatiere}
                      </div>
                    ))}

                    {filteredMatieres.length === 0 && (
                      <div className="px-2.5 py-1.5 text-gray-400 text-xs italic">
                        Aucune matière trouvée
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section Enseignants */}
          {formData.matiere?.idMatiere && enseignants.length > 0 && (
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-emerald-200 mb-1.5">
                Enseignants pour {formData.matiere.nomMatiere}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {enseignants.map((e) => (
                  <label
                    key={e.idEnseignant}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-2xl cursor-pointer border-2 border-emerald-500/20 transition-all duration-200 text-xs hover:shadow-lg active:scale-95 ${
                      selectedEnseignantIds.includes(e.idEnseignant)
                        ? "bg-emerald-600/60 border-emerald-400"
                        : "bg-emerald-950/40 hover:bg-emerald-800/30"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedEnseignantIds.includes(e.idEnseignant)}
                      onChange={() => toggleEnseignant(e.idEnseignant)}
                      className="rounded"
                    />
                    <span className="truncate">
                      {e.nomEnseignant} {e.grade && <span className="text-xs text-gray-300">({e.grade})</span>}
                    </span>
                  </label>
                ))}
              </div>
              {selectedEnseignantIds.length === 0 && (
                <p className="text-xs text-gray-400 mt-1 italic">Aucun enseignant sélectionné (optionnel).</p>
              )}
            </div>
          )}

          {formData.matiere?.idMatiere && enseignants.length === 0 && (
            <p className="text-xs sm:text-sm text-gray-400 italic bg-emerald-950/20 p-2 rounded-2xl">Aucun enseignant associé à cette matière.</p>
          )}

          {/* Section Parcours */}
          <div>
            <label className="block text-sm font-medium text-emerald-200 mb-2">
              Parcours concernés :
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {parcours.map((p) => (
                <label
                  key={p.idParcours}
                  className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-xl border-2 transition-all duration-200 text-sm font-medium ${
                    selectedParcoursIds.includes(p.idParcours ?? 0)
                      ? "bg-emerald-600/70 border-emerald-400 text-white"
                      : "bg-emerald-950/50 border-emerald-700 hover:bg-emerald-800/40 text-gray-200"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedParcoursIds.includes(p.idParcours ?? 0)}
                    onChange={() => toggleParcours(p.idParcours ?? 0)}
                    className="accent-emerald-500"
                  />
                  {p.codeParcours}
                </label>
              ))}
            </div>
            {selectedParcoursIds.length === 0 && (
              <p className="text-xs text-red-400 mt-1 italic">Veuillez sélectionner au moins un parcours.</p>
            )}
          </div>

          {/* Date */}
          <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
            <div className="flex justify-center sm:justify-start">
              <div className="w-full sm:w-1/2">
                <label className="block text-xs sm:text-sm font-semibold text-emerald-200 mb-1.5">Date examen</label>
                <input
                  type="date"
                  value={formData.dateExamen ?? ""}
                  onChange={(e) => handleChangeSimple("dateExamen", e.target.value)}
                  required
                  className="w-full border-2 border-emerald-500/40 bg-emerald-950/70 rounded-2xl p-2 mt-1 text-sm transition-all duration-200 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none hover:shadow-lg active:scale-95"
                />
              </div>
            </div>
          </div>

          {/* Heures + Durée */}
          <div ref={heuresRef} className="grid grid-cols-1 gap-2.5 sm:gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-emerald-200 mb-1.5">Heure début</label>
              <input
                type="datetime-local"
                value={formData.heureDebut ?? ""}
                onChange={(e) => handleChangeSimple("heureDebut", e.target.value)}
                required
                className="w-full border-2 border-emerald-500/40 bg-emerald-950/70 rounded-2xl p-2 mt-1 text-sm transition-all duration-200 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none hover:shadow-lg active:scale-95"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-emerald-200 mb-1.5">Heure fin</label>
              <input
                type="datetime-local"
                value={formData.heureFin ?? ""}
                onChange={(e) => handleChangeSimple("heureFin", e.target.value)}
                required
                className="w-full border-2 border-emerald-500/40 bg-emerald-950/70 rounded-2xl p-2 mt-1 text-sm transition-all duration-200 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none hover:shadow-lg active:scale-95"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-emerald-200 mb-1.5">Durée</label>
              <div className="flex items-center gap-1.5 mt-1">
                <input
                  type="number"
                  min={0}
                  value={dureeHeure}
                  onChange={(e) => setDureeHeure(Number(e.target.value))}
                  className="w-10 sm:w-12 text-center border-2 border-emerald-500/40 bg-emerald-950/70 rounded-xl p-1.5 text-sm transition-all duration-200 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none hover:shadow-lg active:scale-95"
                />
                <span className="text-xs sm:text-sm font-semibold text-emerald-200">H</span>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={dureeMinute}
                  onChange={(e) => setDureeMinute(Number(e.target.value))}
                  className="w-10 sm:w-12 text-center border-2 border-emerald-500/40 bg-emerald-950/70 rounded-xl p-1.5 text-sm transition-all duration-200 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none hover:shadow-lg active:scale-95"
                />
                <span className="text-xs sm:text-sm font-semibold text-emerald-200">MIN</span>
              </div>
            </div>
          </div>

          {/* Salles */}
          <div ref={sallesRef}>
            <label className="block text-xs sm:text-sm font-semibold text-emerald-200 mb-1.5">Salles <span className="text-red-400">*</span></label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {salles.map((s) => {
                const isDisabled = disabledSalles.includes(s.numeroSalle);
                const isSelected = selectedSalles.includes(s.numeroSalle);
                return (
                  <label
                    key={s.numeroSalle}
                    className={`flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-2xl cursor-pointer border-2 border-emerald-500/20 transition-all duration-200 text-xs font-medium hover:shadow-lg active:scale-95 ${
                      isSelected
                        ? "bg-emerald-600/60 border-emerald-400"
                        : "bg-emerald-950/40 hover:bg-emerald-800/30"
                    } ${isDisabled ? "opacity-70 blur-sm pointer-events-none" : ""}`}
                    title={isDisabled ? "Salle occupée à l'heure choisie" : ""}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSalle(s.numeroSalle)}
                      disabled={isDisabled}
                      className="rounded"
                    />
                    {s.numeroSalle}
                  </label>
                );
              })}
            </div>
            {disabledSalles.length > 0 && (
              <p className="text-xs text-yellow-300 mt-1 italic">⚠️ {disabledSalles.length} salle(s) indisponible(s) à cette heure.</p>
            )}
          </div>

          {error && (
            <div className="text-xs sm:text-sm text-red-300 bg-red-900/30 p-2.5 rounded-2xl border-2 border-red-700/40 shadow-lg">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-3 pb-4 sticky bottom-0 bg-gradient-to-br from-emerald-900/95 via-emerald-800/95 to-teal-900/95 z-10 py-2.5 border-t border-emerald-600/20 rounded-b-3xl -mx-3 sm:-mx-4 md:-mx-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="bg-gray-600/70 hover:bg-gray-500/70 text-white px-5 py-2 rounded-2xl text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-5 py-2 rounded-2xl font-semibold text-sm transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50 flex items-center gap-2 justify-center"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span> Enregistrement...
                </>
              ) : (
                formData.idExamen ? "Mettre à jour" : "Enregistrer"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Popup succès */}
      <AnimatePresence>
        {showSuccessPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 flex items-center justify-center p-2 sm:p-4"
          >
            <div
              className="absolute inset-0 bg-black/70"
              onClick={() => {
                setShowSuccessPopup(false);
                onClose();
              }}
            />

            <motion.div
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              transition={{ duration: 0.18 }}
              className="relative bg-white text-gray-900 rounded-3xl shadow-2xl max-w-sm sm:max-w-md w-full p-3 sm:p-4 md:p-6 max-h-[80vh] border border-gray-200 z-10"
            >
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-green-600">✅ Succès !</h3>
                <button
                  className="text-gray-500 hover:text-gray-700 text-sm"
                  onClick={() => {
                    setShowSuccessPopup(false);
                    onClose();
                  }}
                >
                  ✖
                </button>
              </div>

              <div className="text-center text-sm text-gray-700 mb-4">
                <p className="text-lg font-semibold mb-2">{successMessage}</p>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <button
                  onClick={() => {
                    setShowSuccessPopup(false);
                    onClose();
                  }}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 flex-1 sm:flex-none"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExamenForm;