import React from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
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
    { to: "/examens", label: "Examens", color: "emerald" },
    { to: "/examenparcours", label: "Examens ↔ Parcours", color: "teal" },
    { to: "/matieres", label: "Matières", color: "purple" },
    { to: "/enseignants", label: "Enseignants", color: "cyan" },
    { to: "/enseigner", label: "Enseignements", color: "indigo" },
    { to: "/parcours", label: "Parcours", color: "pink" },
    { to: "/salles", label: "Salles", color: "orange" },
    { to: "/surveillants", label: "Surveillants", color: "red" },
    { to: "/repartitions", label: "Répartitions", color: "green" },
    { to: "/repartir", label: "Répartir", color: "yellow" },
    { to: "/repartition-salle", label: "Répartition par Salle", color: "lime" },
    { to: "/planning-surveillance", label: "Planning Surveillance", color: "teal" },
    { to: "/DownloadPlanningButton", label: "Télécharger Planning PDF", color: "gray" },
  ];

  return (
    <Router>
      <div className="h-screen relative text-white flex">
        <NeuralBackground /> {/* Animation neurale en arrière-plan */}
        {/* Navbar verticale à gauche */}
        <nav className="relative z-10 w-64 bg-gradient-to-b from-green-500 via-emerald-800 to-emerald-900 shadow-2xl backdrop-blur-md bg-opacity-95 border-r border-emerald-600 flex flex-col gap-1 p-6 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 ease-in-out w-full text-left shadow-md ${
                  isActive
                    ? `bg-gradient-to-r from-${item.color}-400 to-${item.color}-500 text-black shadow-${item.color}-300/50 transform scale-105`
                    : `hover:bg-${item.color}-700 hover:shadow-${item.color}-500/25 hover:translate-x-1`
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Contenu principal, scrollable */}
        <main className="flex-1 relative z-10 px-10 py-6 overflow-y-auto">
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