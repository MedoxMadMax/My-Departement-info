import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, X, ExternalLink } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import axiosClient from '../../api/axiosClient';
import Toast from '../../components/common/Toast';
import ConfirmModal from '../../components/common/ConfirmModal';
import styles from './GestionFilieres.module.css';

const GestionFilieres = () => {
  const { hasRole } = useAuth();
  const isSecretaire = hasRole('ROLE_SECRETAIRE') && !hasRole('ROLE_ADMIN') && !hasRole('ROLE_SUPER_ADMIN');
  const [filieres, setFilieres] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ nom: '', type: 'Licence', description: '', isActive: true, lienProgramme: '', duree: 3 });
  const [toast, setToast] = useState(null);

  // Delete modal
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchFilieres();
  }, []);

  const fetchFilieres = async () => {
    try {
      const { data } = await axiosClient.get('/api/admin/filieres');
      setFilieres(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenModal = (filiere = null) => {
    if (filiere) {
      setEditingId(filiere.id);
      setFormData({ 
        nom: filiere.nom, 
        type: filiere.type, 
        description: filiere.description || '', 
        isActive: filiere.isActive,
        lienProgramme: filiere.lienProgramme || '',
        duree: filiere.duree || 3
      });
    } else {
      setEditingId(null);
      setFormData({ nom: '', type: 'Licence', description: '', isActive: true, lienProgramme: '', duree: 3 });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        if (isSecretaire) { 
          await axiosClient.post('/api/secretaire/demandes', { typeEntite: 'Filiere', action: 'UPDATE', entiteId: editingId, donnees: formData }); 
          setToast({ type: 'success', message: 'Demande de modification envoyée avec succès.' }); 
        } else { 
          await axiosClient.put(`/api/admin/filieres/${editingId}`, formData); 
          setToast({ type: 'success', message: 'Filière mise à jour avec succès.' }); 
        }
      } else {
        if (isSecretaire) { 
          await axiosClient.post('/api/secretaire/demandes', { typeEntite: 'Filiere', action: 'CREATE', donnees: formData }); 
          setToast({ type: 'success', message: 'Demande de création envoyée avec succès.' }); 
        } else { 
          await axiosClient.post('/api/admin/filieres', formData); 
          setToast({ type: 'success', message: 'Filière créée avec succès.' }); 
        }
      }
      handleCloseModal();
      fetchFilieres();
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: 'Erreur lors de la sauvegarde.' });
    }
  };

  const handleDelete = (id, name = '') => {
    setDeleteModal({ isOpen: true, id, name: name || 'cette filière' });
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    setIsDeleting(true);
    try {
      if (isSecretaire) { 
        await axiosClient.post('/api/secretaire/demandes', { typeEntite: 'Filiere', action: 'DELETE', entiteId: deleteModal.id, donnees: { id: deleteModal.id } }); 
        setToast({ type: 'success', message: 'Demande de suppression envoyée avec succès.' }); 
      } else { 
        await axiosClient.delete(`/api/admin/filieres/${deleteModal.id}`); 
        setToast({ type: 'success', message: 'Filière supprimée avec succès.' }); 
      }
      setDeleteModal({ isOpen: false, id: null, name: '' });
      fetchFilieres();
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: 'Erreur lors de la suppression.' });
    } finally {
      setIsDeleting(false);
    }
  };

  const activeCount = filieres.filter(f => f.isActive).length;

  return (
    <div className={styles.page}>
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          duration={5000} 
          onClose={() => setToast(null)} 
        />
      )}
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>OFFRE DE FORMATION</h1>
          <p className={styles.description}>Gestion des filières académiques du département.</p>
        </div>
        <button className={styles.addBtn} onClick={() => handleOpenModal()}>
          <Plus size={18} />
          NOUVELLE FILIÈRE
        </button>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Filières</div>
          <div className={styles.statValue}>{filieres.length.toString().padStart(2, '0')}</div>
        </div>
        <div className={styles.statCardHighlighted}>
          <div className={styles.statLabel}>Filières Ouvertes</div>
          <div className={styles.statValue}>{activeCount.toString().padStart(2, '0')}</div>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: '5rem' }}>ID</th>
              <th>INTITULÉ</th>
              <th>CYCLE / TYPE</th>
              <th>STATUT</th>
              <th style={{ textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filieres.map(filiere => (
              <tr key={filiere.id}>
                <td className={styles.tableId}>{filiere.id}</td>
                <td className={styles.tableTitle}>{filiere.nom}</td>
                <td>
                  <span className={styles.badgeType}>{filiere.type}</span>
                </td>
                <td>
                  {filiere.isActive ? (
                    <span className={styles.statusActive}>
                      <CheckCircle size={16} /> OUVERTE
                    </span>
                  ) : (
                    <span className={styles.statusInactive}>
                      <XCircle size={16} /> FERMÉE
                    </span>
                  )}
                </td>
                <td>
                  <div className={styles.actions}>
                    <button className={styles.actionBtn} title="Éditer" onClick={() => handleOpenModal(filiere)}>
                      <Edit2 size={18} />
                    </button>
                    <button className={`${styles.actionBtn} ${styles.deleteBtn}`} title="Supprimer" onClick={() => handleDelete(filiere.id, filiere.nom)}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filieres.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>Aucune filière trouvée.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{editingId ? 'Modifier la Filière' : 'Nouvelle Filière'}</h2>
              <button onClick={handleCloseModal} className={styles.closeBtn}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Nom de la Filière</label>
                <input 
                  type="text" 
                  className={styles.formInput}
                  value={formData.nom} 
                  onChange={(e) => setFormData({...formData, nom: e.target.value})}
                  required 
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Type</label>
                <select 
                  className={styles.formInput}
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  <option value="Licence">Licence</option>
                  <option value="Master">Master</option>
                  <option value="Ingénieur">Ingénieur</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Durée (Années d'études)</label>
                <input 
                  type="number" 
                  min="1"
                  max="10"
                  className={styles.formInput}
                  value={formData.duree} 
                  onChange={(e) => setFormData({...formData, duree: parseInt(e.target.value, 10)})}
                  required 
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Lien du programme (Optionnel)</label>
                <input 
                  type="url" 
                  className={styles.formInput}
                  value={formData.lienProgramme} 
                  onChange={(e) => setFormData({...formData, lienProgramme: e.target.value})}
                  placeholder="https://..."
                />
              </div>
              <div className={styles.checkboxGroup}>
                <input 
                  type="checkbox" 
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                />
                <label className={styles.formLabel} style={{ marginBottom: 0 }}>Filière Active (Ouverte)</label>
              </div>
              <div className={styles.modalActions}>
                <button type="button" onClick={handleCloseModal} className={styles.cancelBtn}>Annuler</button>
                <button type="submit" className={styles.submitBtn}>{isSecretaire ? 'Soumettre demande' : 'Enregistrer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modern Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Supprimer la filière"
        message={`Êtes-vous sûr de vouloir supprimer la filière ${deleteModal.name ? `« ${deleteModal.name} »` : ''} ? Cette action est irréversible.`}
        confirmText={isSecretaire ? "Soumettre la suppression" : "Supprimer définitivement"}
        cancelText="Annuler"
        type="danger"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
      />
    </div>
  );
};

export default GestionFilieres;
