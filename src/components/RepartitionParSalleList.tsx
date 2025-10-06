import React, { useEffect, useState } from "react";
import { ApiService } from "../services/ApiService";
import type { Repartir } from "../models/Repartir";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const RepartitionParSalleList: React.FC = () => {
  const [data, setData] = useState<Record<string, Repartir[]>>({});
  const [loading, setLoading] = useState(true);
  const [searchMatricule, setSearchMatricule] = useState("");
  const [searchResult, setSearchResult] = useState<string | null>(null);

  useEffect(() => {
    ApiService.getRepartitionParSalle()
      .then(setData)
      .catch((err) => console.error("Erreur chargement:", err))
      .finally(() => setLoading(false));
  }, []);

  const calculerNombreEtudiants = (debut: string, fin: string) => {
    const numDebut = parseInt(debut.replace(/\D/g, ""), 10);
    const numFin = parseInt(fin.replace(/\D/g, ""), 10);
    if (isNaN(numDebut) || isNaN(numFin) || numFin < numDebut) return 0;
    return numFin - numDebut + 1;
  };

  // ✅ Recherche de salle pour un matricule donné
  const handleSearch = () => {
    if (!searchMatricule.trim()) {
      setSearchResult("Veuillez saisir un numéro de matricule.");
      return;
    }

    const numCherche = parseInt(searchMatricule.replace(/\D/g, ""), 10);
    if (isNaN(numCherche)) {
      setSearchResult("Matricule invalide.");
      return;
    }

    let trouve = false;
    for (const [salle, repartitions] of Object.entries(data)) {
      for (const rep of repartitions) {
        const numDebut = parseInt(rep.repartition?.etudiantDebut?.replace(/\D/g, "") || "", 10);
        const numFin = parseInt(rep.repartition?.etudiantFin?.replace(/\D/g, "") || "", 10);
        if (numCherche >= numDebut && numCherche <= numFin) {
          setSearchResult(`✅ L'étudiant ${searchMatricule} est dans la salle ${salle} (${rep.repartition?.groupe})`);
          trouve = true;
          break;
        }
      }
      if (trouve) break;
    }

    if (!trouve) {
      setSearchResult(`❌ Aucun résultat trouvé pour ${searchMatricule}`);
    }
  };

  // ✅ Export PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Répartition des Étudiants par Salle", 14, 15);

    let yOffset = 25;
    Object.entries(data).forEach(([salle, repartitions]) => {
      doc.setFontSize(13);
      doc.text(`Salle ${salle}`, 14, yOffset);
      yOffset += 6;

      const tableData = repartitions.map((r) => [
        r.repartition?.groupe ?? "",
        r.repartition?.etudiantDebut ?? "",
        r.repartition?.etudiantFin ?? "",
        calculerNombreEtudiants(
          r.repartition?.etudiantDebut ?? "",
          r.repartition?.etudiantFin ?? ""
        ).toString(),
      ]);

      autoTable(doc, {
        startY: yOffset,
        head: [["Groupe", "Étudiant Début", "Étudiant Fin", "Nombre"]],
        body: tableData,
        theme: "grid",
        headStyles: { fillColor: [6, 78, 59] },
        alternateRowStyles: { fillColor: [230, 255, 240] },
        styles: { fontSize: 11, cellPadding: 3 },
        margin: { left: 14, right: 14 },
      });

      yOffset = (doc as any).lastAutoTable.finalY + 10;
    });

    doc.save("repartition-par-salle.pdf");
  };

  if (loading) return <p className="text-center text-gray-300">Chargement...</p>;

  return (
    <div className="p-6 bg-emerald-950 text-white rounded-lg shadow-lg">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-3">
        <h1 className="text-2xl font-bold">Répartition des Étudiants par Salle</h1>

        <div className="flex gap-2">
          <input
            type="text"
            value={searchMatricule}
            onChange={(e) => setSearchMatricule(e.target.value)}
            placeholder="Rechercher un matricule"
            className="px-3 py-2 rounded-md text-black w-64"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md font-semibold"
          >
            🔍 Rechercher
          </button>
          <button
            onClick={handleExportPDF}
            className="bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-md font-semibold"
          >
            📄 PDF
          </button>
        </div>
      </div>

      {searchResult && (
        <div
          className={`text-center mb-4 font-semibold ${
            searchResult.startsWith("✅")
              ? "text-emerald-400"
              : "text-red-400"
          }`}
        >
          {searchResult}
        </div>
      )}

      {Object.entries(data).map(([salle, repartitions]) => (
        <div key={salle} className="mb-8">
          <h2 className="text-xl font-semibold mb-2 text-emerald-300">
            Salle {salle}
          </h2>
          <table className="w-full border border-emerald-700 text-left rounded-md overflow-hidden">
            <thead className="bg-emerald-800 text-white">
              <tr>
                <th className="px-4 py-2 border-b border-emerald-700">Groupe</th>
                <th className="px-4 py-2 border-b border-emerald-700">
                  Étudiant début
                </th>
                <th className="px-4 py-2 border-b border-emerald-700">
                  Étudiant fin
                </th>
                <th className="px-4 py-2 border-b border-emerald-700 text-center">
                  Nombre
                </th>
              </tr>
            </thead>
            <tbody>
              {repartitions.map((r) => (
                <tr
                  key={`${r.id.idRepartition}-${r.id.numeroSalle}`}
                  className="hover:bg-emerald-900"
                >
                  <td className="px-4 py-2 border-b border-emerald-700">
                    {r.repartition?.groupe}
                  </td>
                  <td className="px-4 py-2 border-b border-emerald-700">
                    {r.repartition?.etudiantDebut}
                  </td>
                  <td className="px-4 py-2 border-b border-emerald-700">
                    {r.repartition?.etudiantFin}
                  </td>
                  <td className="px-4 py-2 border-b border-emerald-700 text-center">
                    {calculerNombreEtudiants(
                      r.repartition?.etudiantDebut || "",
                      r.repartition?.etudiantFin || ""
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default RepartitionParSalleList;
