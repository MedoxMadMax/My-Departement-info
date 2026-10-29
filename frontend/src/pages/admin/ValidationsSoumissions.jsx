import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { Check, X, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import styles from './ValidationsSoumissions.module.css';
import Loader from '../../components/common/Loader';
import Toast from '../../components/common/Toast';

const ValidationsSoumissions = () => {
  const [actualites, setActualites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Tous');
  const [toast, setToast] = useState(null);
  const [rejectModal, setRejectModal] = useState({ isOpen: false, id: null, motif: '' });

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const { data } = await axiosClient.get('/api/super-admin/actualites/pending');
      setActualites(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (id) => {
    try {
      await axiosClient.patch(`/api/super-admin/actualites/${id}/valider`);
      setToast({ type: 'success', message: 'Publication validée avec succès !' });
      fetchPending();
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: 'Erreur lors de la validation.' });
    }
  };

  const handleReject = (id) => {
    setRejectModal({ isOpen: true, id: id, motif: '' });
  };

  const submitReject = async () => {
    if (!rejectModal.motif || !rejectModal.motif.trim()) {
      setToast({ type: 'error', message: 'Veuillez saisir un motif de refus obligatoire pour orienter la secrétaire.' });
      return;
    }
    try {
      await axiosClient.patch(`/api/super-admin/actualites/${rejectModal.id}/refuser`, { 
        motifRefus: rejectModal.motif.trim() 
      });
      setRejectModal({ isOpen: false, id: null, motif: '' });
      setToast({ type: 'success', message: 'Soumission refusée. Le motif a été transmis à la secrétaire.' });
      fetchPending();
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: 'Erreur lors du refus.' });
    }
  };

  const filteredActualites = filter === 'Tous' 
    ? actualites 
    : actualites.filter(act => act.type.toLowerCase() === filter.toLowerCase());

  if (loading) return <Loader center />;

  return (
    <div className={styles.page}>
      
      <section className={styles.header}>
        <div>
          <h2 className={styles.title}>Validations Soumissions</h2>
          <p className={styles.subtitle}>Workflow de Validation Académique</p>
        </div>
        <div className={styles.statsContainer}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>En Attente</span>
            <div className={styles.statValueContainer}>
              <span className={styles.statValuePrimary}>{actualites.length}</span>
              <Clock className="text-primary" size={32} />
            </div>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Approuvés (24h)</span>
            <div className={styles.statValueContainer}>
              <span className={styles.statValueSuccess}>--</span>
              <CheckCircle className="text-tertiary-container" size={32} />
            </div>
          </div>
        </div>
      </section>

      <div className={styles.filtersContainer}>
        <span className={styles.filterLabel}>Filtrer par :</span>
        <div className={styles.filtersList}>
          {['Tous', 'Événement', 'Actualité', 'Séminaire'].map(f => (
            <span 
              key={f}
              className={filter === f ? styles.filterItemActive : styles.filterItem}
              onClick={() => setFilter(f)}
            >
              {f}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Type</th>
              <th>Titre de la publication</th>
              <th>Auteur (Rôle)</th>
              <th style={{ textAlign: 'center' }}>Date</th>
              <th style={{ textAlign: 'right' }}>Décision</th>
            </tr>
          </thead>
          <tbody>
            {filteredActualites.map((act) => (
              <tr key={act.id}>
                <td>
                  <span className={act.type === 'Evenement' ? styles.badgeEvenement : styles.badgeActualite}>
                    {act.type}
                  </span>
                </td>
                <td>
                  <p className={styles.pubTitle}>{act.titre}</p>
                  <p className={styles.pubId}>ID: SUB-{act.id}</p>
                </td>
                <td>
                  <p className={styles.authorName}>{act.auteur}</p>
                  <p className={styles.authorRole}>Auteur</p>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span className={styles.dateText}>{act.dateCreation?.split(' ')[0]}</span>
                </td>
                <td>
                  <div className={styles.actionsContainer}>
                    <button className={styles.btnApprove} onClick={() => handleValidate(act.id)}>
                      <Check size={18} /> Valider
                    </button>
                    <button className={styles.btnReject} onClick={() => handleReject(act.id)}>
                      <X size={18} /> Rejeter
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredActualites.length === 0 && (
              <tr>
                <td colSpan="5" className={styles.emptyState}>
                  Aucune soumission en attente.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>


      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          duration={5000} 
          onClose={() => setToast(null)} 
        />
      )}

      {rejectModal.isOpen && (
        <div className={styles.modalOverlay} onClick={() => setRejectModal({ isOpen: false, id: null, motif: '' })}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ background: '#fee2e2', color: '#dc2626', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Motif du refus</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Ce motif sera affiché à la secrétaire pour qu'elle puisse corriger son brouillon.</p>
              </div>
            </div>
            <textarea
              className={styles.textarea}
              value={rejectModal.motif}
              onChange={(e) => setRejectModal({ ...rejectModal, motif: e.target.value })}
              placeholder="Ex: Merci d'ajouter la salle de conférence exacte et de vérifier l'heure de début..."
              rows={4}
              autoFocus
            />
            <div className={styles.modalActions}>
              <button 
                type="button" 
                className={styles.cancelBtn} 
                onClick={() => setRejectModal({ isOpen: false, id: null, motif: '' })}
              >
                Annuler
              </button>
              <button 
                type="button" 
                className={styles.btnReject} 
                onClick={submitReject}
                style={{ background: '#dc2626', color: '#ffffff', borderColor: '#dc2626' }}
              >
                Confirmer le refus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default ValidationsSoumissions;
