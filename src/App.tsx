import React from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import {
  BookOpen,
  Users,
  ClipboardList,
  Building,
  School,
  Monitor,
  LayoutDashboard,
  FileDown,
  Map,
  Layers,
  CalendarDays,
  UserCheck,
} from "lucide-react";

import NeuralBackground from "./components/NeuralBackground";
import ExamenList from "./components/ExamenList";
import MatiereList from "./components/MatiereList";
import EnseignantList from "./components/EnseignantList";
import SurveillantList from "./components/SurveillantList";
import ParcoursList from "./components/ParcoursList";
import SalleList from "./components/SalleList";
import EnseignerList from "./components/EnseignerList";
import SurveillerList from "./components/SurveillerList";
import ExamenParcoursList from "./components/ExamenParcoursList";
import RepartitionList from "./components/RepartitionList";
import RepartirList from "./components/RepartirList";
import RepartitionParSalleList from "./components/RepartitionParSalleList";
import PlanningSurveillanceList from "./components/PlanningSurveillanceList";
import DownloadPlanningButton from "./components/DownloadPlanningButton";

function App() {
  const menuItems = [
    { to: "/examens", label: "Examens", icon: BookOpen },
    { to: "/matieres", label: "Matières", icon: Layers },
    { to: "/enseignants", label: "Enseignants", icon: Users },
    { to: "/enseigner", label: "Enseignements", icon: ClipboardList },
    { to: "/parcours", label: "Parcours", icon: School },
    { to: "/salles", label: "Salles", icon: Building },
    { to: "/surveillants", label: "Surveillants", icon: UserCheck },
    { to: "/repartitions", label: "Répartitions", icon: LayoutDashboard },
    { to: "/repartir", label: "Répartition des salles", icon: Map },
    { to: "/repartition-salle", label: "Répartition par Salle", icon: Monitor },
    { to: "/planning-surveillance", label: "Planning Surveillance", icon: CalendarDays },
    { to: "/DownloadPlanningButton", label: "Télécharger EDT PDF", icon: FileDown },
  ];

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="h-screen relative text-white flex">
        <NeuralBackground />

        {/* 🌟 Navbar modernisée */}
        <nav className="relative z-10 w-60 bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 border-r border-emerald-800 p-5 flex flex-col items-start gap-1 shadow-[0_0_30px_rgba(0,0,0,0.6)]">
          <h1 className="text-xl font-bold mb-4 text-emerald-300 flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-emerald-400" /> Tableau de bord
          </h1>

          <div className="flex flex-col gap-1 w-full">
            {menuItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 w-full ${
                    isActive
                      ? "bg-gradient-to-r from-green-400 via-cyan-400 to-indigo-500 text-black shadow-lg shadow-emerald-400/40 scale-[1.03]"
                      : "hover:bg-gradient-to-r hover:from-emerald-800 hover:to-cyan-700/40 hover:text-emerald-200"
                  }`
                }
              >
                {/* Barre lumineuse animée à gauche */}
                <span
                  className={`absolute left-0 top-0 h-full w-[3px] rounded-r-md transition-all duration-500 ${
                    window.location.pathname === to
                      ? "bg-gradient-to-b from-emerald-400 via-cyan-300 to-indigo-400 scale-y-100"
                      : "scale-y-0"
                  }`}
                ></span>

                {/* Icône + texte */}
                <Icon
                  className={`w-5 h-5 transition-transform duration-300 ${
                    window.location.pathname === to
                      ? "text-black rotate-12"
                      : "text-emerald-300 group-hover:scale-110"
                  }`}
                />
                <span>{label}</span>

                {/* Effet lumineux animé */}
                {window.location.pathname === to && (
                  <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-emerald-400/20 via-cyan-400/10 to-transparent animate-pulse pointer-events-none"></span>
                )}
              </NavLink>
            ))}
          </div>

          {/* Ligne décorative */}
          <div className="mt-5 border-t border-emerald-800/70 w-full"></div>

          <div className="text-xs text-emerald-400/70 mt-3 text-center w-full">
            © 2025 - Gestion Examens
          </div>
        </nav>

        {/* 🌿 Contenu principal */}
        <main className="flex-1 relative z-10 px-8 py-6 overflow-y-auto bg-emerald-950/10">
          <Routes>
            <Route path="/" element={<ExamenList />} />
            <Route path="/examens" element={<ExamenList />} />
            <Route path="/examenparcours" element={<ExamenParcoursList />} />
            <Route path="/matieres" element={<MatiereList />} />
            <Route path="/enseignants" element={<EnseignantList />} />
            <Route path="/surveillants" element={<SurveillantList />} />
            <Route path="/parcours" element={<ParcoursList />} />
            <Route path="/salles" element={<SalleList />} />
            <Route path="/enseigner" element={<EnseignerList />} />
            <Route path="/surveiller" element={<SurveillerList />} />
            <Route path="/repartitions" element={<RepartitionList />} />
            <Route path="/repartir" element={<RepartirList />} />
            <Route path="/repartition-salle" element={<RepartitionParSalleList />} />
            <Route path="/planning-surveillance" element={<PlanningSurveillanceList />} />
            <Route path="/DownloadPlanningButton" element={<DownloadPlanningButton />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;