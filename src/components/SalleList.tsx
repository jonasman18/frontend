import React, { useEffect, useState } from 'react';
import { ApiService } from '../services/ApiService';
import type { Salle } from '../models/Salle';
import SalleForm from './SalleForm';

const SalleList: React.FC = () => {
  const [salles, setSalles] = useState<Salle[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSalle, setEditingSalle] = useState<Salle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ApiService.getSalles()
      .then(data => setSalles(data))
      .catch(err => {
        console.error('Erreur chargement salles:', err);
        setError('Erreur de chargement des salles');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = (numeroSalle: string) => {
    if (confirm('Confirmer la suppression ?')) {
      ApiService.deleteSalle(numeroSalle)
        .then(() => setSalles(salles.filter(s => s.numeroSalle !== numeroSalle)))
        .catch(err => {
          console.error('Erreur suppression salle:', err);
          alert('Erreur lors de la suppression');
        });
    }
  };

  const handleEdit = (salle: Salle) => {
    setEditingSalle(salle);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingSalle(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingSalle(null);
  };

  const handleSave = (salle: Salle) => {
    ApiService.saveSalle(salle)
      .then(savedSalle => {
        if (editingSalle) {
          setSalles(salles.map(s => s.numeroSalle === savedSalle.numeroSalle ? savedSalle : s));
        } else {
          setSalles([...salles, savedSalle]);
        }
        handleCloseForm();
      })
      .catch(err => {
        console.error('Erreur sauvegarde salle:', err);
        alert('Erreur lors de la sauvegarde');
      });
  };

  if (loading) return <div>Chargement des salles...</div>;
  if (error) return <div style={{ color: 'red' }}>Erreur: {error}</div>;

  return (
    <div>
      <h1>Liste des Salles</h1>
      <button onClick={handleAdd} style={{ backgroundColor: '#3498db', color: 'white', padding: '10px', border: 'none', borderRadius: '5px' }}>
        Ajouter une salle
      </button>

      <table style={{ borderCollapse: 'collapse', width: '100%', marginTop: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#3498db', color: 'white' }}>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Numéro Salle</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Capacité Max</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Nombre Surveillants</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {salles.map(salle => (
            <tr key={salle.numeroSalle}>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{salle.numeroSalle}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{salle.capaciteMax}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{salle.nbrSurveillant}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                <button onClick={() => handleEdit(salle)} style={{ backgroundColor: '#2ecc71', color: 'white', padding: '5px', border: 'none', borderRadius: '3px', marginRight: '5px' }}>
                  Modifier
                </button>
                <button onClick={() => handleDelete(salle.numeroSalle)} style={{ backgroundColor: '#e74c3c', color: 'white', padding: '5px', border: 'none', borderRadius: '3px' }}>
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showForm && (
        <SalleForm salle={editingSalle ?? undefined} onSave={handleSave} onClose={handleCloseForm} />
      )}
    </div>
  );
};

export default SalleList;
