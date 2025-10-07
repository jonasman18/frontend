import React from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
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
//import SurveillancePlanning from "./components/SurveillancePlanning";
import PlanningSurveillanceList from "./components/PlanningSurveillanceList";
//import PlanningSurveillanceTableView from "./components/PlanningSurveillanceTableView";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-green-500 text-white crossed-diagonal-bg">
        {/* Navbar */}
        <nav className="flex flex-wrap justify-center gap-4 p-4 bg-emerald-800 shadow-lg">
          {[
            { to: "/examens", label: "Examens" },
            { to: "/examenparcours", label: "Examens & Parcours" },
            { to: "/matieres", label: "Matières" },
            { to: "/enseignants", label: "Enseignants" },
            { to: "/enseigner", label: "Enseignements" },
            { to: "/parcours", label: "Parcours" },
            { to: "/salles", label: "Salles" },
            { to: "/surveillants", label: "Surveillants" },
            { to: "/surveiller", label: "Surveillance" },
            { to: "/repartitions", label: "Répartitions" },
            { to: "/repartir", label: "Répartir" },
            { to: "/repartition-salle", label: "Répartition par Salle" },
            { to: "/planning-surveillance", label: "Planning Surveillance" },
            { to: "/planning-surveillance-view", label: "Vue Planning" },

          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `px-3 py-2 rounded-md font-semibold transition ${
                  isActive ? "bg-emerald-400 text-black" : "hover:bg-emerald-600"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Contenu pleine largeur */}
        <div className="w-full px-10 py-6">
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
   
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
