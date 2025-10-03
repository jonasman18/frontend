import React, { useEffect, useState } from 'react';
import { ApiService } from '../services/ApiService';
import type { Surveillant } from '../models/Surveillant';
import SurveillantForm from './SurveillantForm';

const SurveillantList: React.FC = () => {
  const [surveillants, setSurveillants] = useState<Surveillant[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSurveillant, setEditingSurveillant] = useState<Surveillant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ApiService.getSurveillants()
      .then(data => setSurveillants(data))
      .catch(() => setError('Erreur chargement surveillants'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = (id: number) => {
    if (confirm('Confirmer la suppression ?')) {
      ApiService.deleteSurveillant(id)
        .then(() => setSurveillants(surveillants.filter(s => s.idSurveillant !== id)))
        .catch(() => alert('Erreur lors de la suppression'));
    }
  };

  const handleEdit = (surveillant: Surveillant) => {
    setEditingSurveillant(surveillant);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingSurveillant(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingSurveillant(null);
  };

  const handleSave = (surveillant: Surveillant) => {
    ApiService.saveSurveillant(surveillant)
      .then(saved => {
        if (editingSurveillant) {
          setSurveillants(surveillants.map(s => s.idSurveillant === saved.idSurveillant ? saved : s));
        } else {
          setSurveillants([...surveillants, saved]);
        }
        handleCloseForm();
      })
      .catch(() => alert('Erreur sauvegarde surveillant'));
  };

  if (loading) return <div>Chargement des surveillants...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h1>Liste des Surveillants</h1>
      <button onClick={handleAdd} style={{ backgroundColor: '#3498db', color: 'white', padding: '10px', border: 'none', borderRadius: '5px' }}>
        Ajouter un surveillant
      </button>

      <table style={{ borderCollapse: 'collapse', width: '100%', marginTop: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#3498db', color: 'white' }}>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>ID</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Nom</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Groupe</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Salle</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {surveillants.map(s => (
            <tr key={s.idSurveillant}>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{s.idSurveillant}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{s.nomSurveillant}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{s.groupeSurveillant}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{s.numeroSalle}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                <button onClick={() => handleEdit(s)} style={{ backgroundColor: '#2ecc71', color: 'white', padding: '5px', border: 'none', borderRadius: '3px', marginRight: '5px' }}>
                  Modifier
                </button>
                <button onClick={() => handleDelete(s.idSurveillant!)} style={{ backgroundColor: '#e74c3c', color: 'white', padding: '5px', border: 'none', borderRadius: '3px' }}>
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showForm && (
        <SurveillantForm
          surveillant={editingSurveillant ?? undefined}
          onSave={handleSave}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default SurveillantList;
