import React from "react";

const DownloadPlanningButton: React.FC = () => {
  const download = async () => {
  try {
    const res = await fetch("http://localhost:8080/api/planning/pdf");
    if (!res.ok) throw new Error("Erreur lors du téléchargement");
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "planning_examens.pdf";
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    alert("❌ Impossible de télécharger le PDF.");
  }
};

  return (
    <button
      onClick={download}
      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg"
    >
      📄 Télécharger le planning PDF
    </button>
  );
};

export default DownloadPlanningButton;
