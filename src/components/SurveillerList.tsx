import React, { useEffect, useState } from "react";
import { ApiService } from "../services/ApiService";
import type { Surveiller } from "../models/Surveiller";
import SurveillerForm from "./SurveillerForm";

const SurveillerList: React.FC = () => {
  const [surveillerList, setSurveillerList] = useState<Surveiller[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    ApiService.getSurveiller().then(setSurveillerList);
  }, []);

  const handleAdd = (idExamen: number, idSurveillant: number) => {
    ApiService.addSurveiller(idExamen, idSurveillant).then(newAssoc => {
      setSurveillerList([...surveillerList, newAssoc]);
      setShowForm(false);
    });
  };

  const handleDelete = (idExamen: number, idSurveillant: number) => {
    if (confirm("Voulez-vous vraiment supprimer cette association ?")) {
      ApiService.deleteSurveiller(idExamen, idSurveillant).then(() => {
        setSurveillerList(
          surveillerList.filter(
            s => !(s.id.idExamen === idExamen && s.id.idSurveillant === idSurveillant)
          )
        );
      });
    }
  };

  return (
    <div>
      <h1>Associations Examen ↔ Surveillant</h1>
      <button onClick={() => setShowForm(true)} style={{ background: "blue", color: "white" }}>
        Nouvelle association
      </button>

      <table border={1} cellPadding={5} style={{ marginTop: "20px", width: "100%" }}>
        <thead>
          <tr>
            <th>ID Examen</th>
            <th>Nom Surveillant</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
  {surveillerList.map((s) => (
    <tr key={`${s.id.idExamen}-${s.id.idSurveillant}`}>
      <td>{s.examen?.matiere?.nomMatiere} - {s.examen?.dateExamen}</td>
      <td>{s.surveillant?.nomSurveillant}</td>
      <td>
        <button
          onClick={() => handleDelete(s.id.idExamen, s.id.idSurveillant)}
          style={{ background: "red", color: "white" }}
        >
          Supprimer
        </button>
      </td>
    </tr>
  ))}
</tbody>

      </table>

      {showForm && (
        <SurveillerForm
          onSave={handleAdd}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default SurveillerList;
