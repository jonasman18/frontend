import React, { useEffect, useState } from "react";
import { ApiService } from "../services/ApiService";
import type { Matiere } from "../models/Matiere";
import MatiereForm from "./MatiereForm";

const MatiereList: React.FC = () => {
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMatiere, setEditingMatiere] = useState<Matiere | null>(null);

  useEffect(() => {
    ApiService.getMatieres().then(setMatieres);
  }, []);

  const handleDelete = (id: number) => {
    if (confirm("Supprimer cette matière ?")) {
      ApiService.deleteMatiere(id).then(() =>
        setMatieres(matieres.filter((m) => m.idMatiere !== id))
      );
    }
  };

  const handleSave = (matiere: Matiere) => {
    ApiService.saveMatiere(matiere).then((saved) => {
      if (editingMatiere) {
        setMatieres(matieres.map((m) => (m.idMatiere === saved.idMatiere ? saved : m)));
      } else {
        setMatieres([...matieres, saved]);
      }
      setShowForm(false);
      setEditingMatiere(null);
    });
  };

  return (
    <div className="p-6 bg-emerald-950 rounded-lg shadow-lg text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Liste des Matières</h1>
        <button
          onClick={() => {
            setEditingMatiere(null);
            setShowForm(true);
          }}
          className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-md font-semibold"
        >
          ➕ Ajouter
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border border-emerald-700 rounded-md">
          <thead className="bg-emerald-800 text-white">
            <tr>
              <th className="px-4 py-2 border-b border-emerald-700">ID</th>
              <th className="px-4 py-2 border-b border-emerald-700">Nom</th>
              <th className="px-4 py-2 border-b border-emerald-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {matieres.map((m) => (
              <tr
                key={m.idMatiere}
                className="hover:bg-emerald-900 transition"
              >
                <td className="px-4 py-2 border-b border-emerald-700">{m.idMatiere}</td>
                <td className="px-4 py-2 border-b border-emerald-700">{m.nomMatiere}</td>
                <td className="px-4 py-2 border-b border-emerald-700 flex gap-2">
                  <button
                    onClick={() => {
                      setEditingMatiere(m);
                      setShowForm(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md text-sm"
                  >
                    ✏ Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(m.idMatiere!)}
                    className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md text-sm"
                  >
                    🗑 Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <MatiereForm
          matiere={editingMatiere ?? undefined}
          onSave={handleSave}
          onClose={() => {
            setShowForm(false);
            setEditingMatiere(null);
          }}
        />
      )}
    </div>
  );
};

export default MatiereList;
