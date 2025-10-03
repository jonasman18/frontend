import React, { useEffect, useState } from 'react';
import { ApiService } from '../services/ApiService';
import type { Parcours } from '../models/Parcours';
import ParcoursForm from './ParcoursForm';

const ParcoursList: React.FC = () => {
  const [parcours, setParcours] = useState<Parcours[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingParcours, setEditingParcours] = useState<Parcours | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ApiService.getParcours()
      .then(data => setParcours(data))
      .catch(() => setError('Erreur chargement parcours'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = (id: number) => {
    if (confirm('Confirmer la suppression ?')) {
      ApiService.deleteParcours(id)
        .then(() => setParcours(parcours.filter(p => p.idParcours !== id)))
        .catch(() => alert('Erreur lors de la suppression'));
    }
  };

  const handleEdit = (parcours: Parcours) => {
    setEditingParcours(parcours);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingParcours(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingParcours(null);
  };

  const handleSave = (parcoursToSave: Parcours) => {
    ApiService.saveParcours(parcoursToSave)
      .then(saved => {
        if (editingParcours) {
          setParcours(prevParcours => prevParcours.map(p => p.idParcours === saved.idParcours ? saved : p));
        } else {
          setParcours(prevParcours => [...prevParcours, saved]);
        }
        handleCloseForm();
      })
      .catch(() => alert('Erreur sauvegarde parcours'));
  };

  if (loading) return <div>Chargement des parcours...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h1>Liste des Parcours</h1>
      <button onClick={handleAdd} style={{ backgroundColor: '#3498db', color: 'white', padding: '10px', border: 'none', borderRadius: '5px' }}>
        Ajouter un parcours
      </button>

      <table style={{ borderCollapse: 'collapse', width: '100%', marginTop: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#3498db', color: 'white' }}>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>ID</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Code</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Libellé</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {parcours.map(p => (
            <tr key={p.idParcours}>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{p.idParcours}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{p.codeParcours}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{p.libelleParcours}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                <button onClick={() => handleEdit(p)} style={{ backgroundColor: '#2ecc71', color: 'white', padding: '5px', border: 'none', borderRadius: '3px', marginRight: '5px' }}>
                  Modifier
                </button>
                <button onClick={() => handleDelete(p.idParcours!)} style={{ backgroundColor: '#e74c3c', color: 'white', padding: '5px', border: 'none', borderRadius: '3px' }}>
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showForm && (
        <ParcoursForm
          parcours={editingParcours ?? undefined}
          onSave={handleSave}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default ParcoursList;
