import React, { useState, useEffect } from 'react';
import { Plus, Edit2, TestTube2, Trash2, X } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import axiosClient from '../../api/axiosClient';
import Toast from '../../components/common/Toast';
import ConfirmModal from '../../components/common/ConfirmModal';
import styles from './GestionLaboratoires.module.css';

const GestionLaboratoires = () => {
  const { hasRole } = useAuth();
  const isSecretaire = hasRole('ROLE_SECRETAIRE') && !hasRole('ROLE_ADMIN') && !hasRole('ROLE_SUPER_ADMIN');
  const [laboratoires, setLaboratoires] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ nom: '', acronyme: '', description: '', enseignantIds: [] });
  const [selectedEnsId, setSelectedEnsId] = useState('');
  const [toast, setToast] = useState(null);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchLaboratoires();
    fetchEnseignants();
  }, []);

  const fetchLaboratoires = async () => {
    try {
      const { data } = await axiosClient.get('/api/admin/laboratoires');
      setLaboratoires(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEnseignants = async () => {
    try {
      const { data } = await axiosClient.get('/api/admin/enseignants');
      setEnseignants(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenModal = (lab = null) => {
    if (lab) {
      setEditingId(lab.id);
      setFormData({ 
        nom: lab.nom, 
        acronyme: lab.acronyme, 
        description: lab.description || '',
        enseignantIds: lab.enseignantIds || []
      });
    } else {
      setEditingId(null);
      setFormData({ nom: '', acronyme: '', description: '', enseignantIds: [] });
    }
    setIsModalOpen(true);
    setSelectedEnsId('');
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleAddEns = () => {
    if (!selectedEnsId) return;
    const id = parseInt(selectedEnsId, 10);
    if (!formData.enseignantIds.includes(id)) {
      setFormData({ ...formData, enseignantIds: [...formData.enseignantIds, id] });
    }
    setSelectedEnsId('');
  };

  const handleRemoveEns = (idToRemove) => {
    setFormData({ 
      ...formData, 
      enseignantIds: formData.enseignantIds.filter(id => id !== idToRemove) 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        if (isSecretaire) { 
          await axiosClient.post('/api/secretaire/demandes', { typeEntite: 'Laboratoire', action: 'UPDATE', entiteId: editingId, donnees: formData }); 
          setToast({ type: 'success', message: 'Demande de modification envoyée avec succès.' }); 
        } else { 
          await axiosClient.put(`/api/admin/laboratoires/${editingId}`, formData); 
          setToast({ type: 'success', message: 'Laboratoire mis à jour avec succès.' }); 
        }
      } else {
        if (isSecretaire) { 
          await axiosClient.post('/api/secretaire/demandes', { typeEntite: 'Laboratoire', action: 'CREATE', donnees: formData }); 
          setToast({ type: 'success', message: 'Demande de création envoyée avec succès.' }); 
        } else { 
          await axiosClient.post('/api/admin/laboratoires', formData); 
          setToast({ type: 'success', message: 'Laboratoire créé avec succès.' }); 
        }
      }
      handleCloseModal();
      fetchLaboratoires();
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: 'Erreur lors de la sauvegarde.' });
    }
  };

  const handleDelete = (id, name = '') => {
    setDeleteModal({ isOpen: true, id, name: name || 'ce laboratoire' });
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    setIsDeleting(true);
    try {
      if (isSecretaire) { 
        await axiosClient.post('/api/secretaire/demandes', { typeEntite: 'Laboratoire', action: 'DELETE', entiteId: deleteModal.id, donnees: { id: deleteModal.id } }); 
        setToast({ type: 'success', message: 'Demande de suppression envoyée avec succès.' }); 
      } else { 
        await axiosClient.delete(`/api/admin/laboratoires/${deleteModal.id}`); 
        setToast({ type: 'success', message: 'Laboratoire supprimé avec succès.' }); 
      }
      setDeleteModal({ isOpen: false, id: null, name: '' });
      fetchLaboratoires();
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: 'Erreur lors de la suppression.' });
    } finally {
      setIsDeleting(false);
    }
  };

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
          <h1 className={styles.title}>Recherche &amp; Laboratoires</h1>
          <p className={styles.description}>GESTION DES LABORATOIRES DE RECHERCHE DÉPARTEMENTAUX</p>
        </div>
        <button className={styles.addBtn} onClick={() => handleOpenModal()}>
          <Plus size={18} />
          NOUVEAU LABO
        </button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: '8rem' }}>ACRONYME</th>
              <th>NOM COMPLET</th>
              <th>CHERCHEURS AFFILIÉS</th>
              <th>AXES DE RECHERCHE</th>
              <th style={{ width: '6rem', textAlign: 'center' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {laboratoires.map((lab) => (
              <tr key={lab.id}>
                <td>
                  <div className={styles.acronymeBadge}>
                    {lab.acronyme}
                  </div>
                </td>
                <td className={styles.laboName}>
                  {lab.nom}
                </td>
                <td>
                  <div className="text-sm font-bold mb-1">
                    {lab.enseignants?.length || 0} CHERCHEURS
                  </div>
                  <ul className={styles.axesList}>
                    {lab.enseignants?.map((ens, index) => (
                      <li key={index}>{ens}</li>
                    ))}
                    {(!lab.enseignants || lab.enseignants.length === 0) && (
                      <li className="text-gray-400 italic text-xs">Aucun chercheur</li>
                    )}
                  </ul>
                </td>
                <td>
                  <div className={styles.axesHeader}>
                    <TestTube2 size={18} />
                    <span>{lab.axesCount || 0} AXES ACTIFS</span>
                  </div>
                  <ul className={styles.axesList}>
                    {lab.axes?.map((axe, index) => (
                      <li key={index}>{axe}</li>
                    ))}
                    {(!lab.axes || lab.axes.length === 0) && (
                      <li className="text-gray-400 italic">Aucun axe défini</li>
                    )}
                  </ul>
                </td>
                <td>
                  <div className={styles.actions}>
                    <button className={styles.actionBtn} title="Éditer" onClick={() => handleOpenModal(lab)}>
                      <Edit2 size={18} />
                    </button>
                    <button className={styles.actionBtn} title="Supprimer" onClick={() => handleDelete(lab.id, `${lab.acronyme} - ${lab.nom}`)}>
                      <Trash2 size={18} className="text-error" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {laboratoires.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>Aucun laboratoire trouvé.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.statCardPrimary}`}>
          <div className={styles.statLabel}>TOTAL LABORATOIRES</div>
          <div className={styles.statValue}>{laboratoires.length.toString().padStart(2, '0')}</div>
        </div>
        <div className={`${styles.statCard} ${styles.statCardSecondary}`}>
          <div className={styles.statLabel}>CHERCHEURS AFFILIÉS</div>
          <div className={styles.statValue}>47</div>
        </div>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{editingId ? 'Modifier le Labo' : 'Nouveau Labo'}</h2>
              <button onClick={handleCloseModal} className={styles.closeBtn}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Acronyme</label>
                <input 
                  type="text" 
                  className={styles.formInput}
                  style={{ textTransform: 'uppercase' }}
                  value={formData.acronyme} 
                  onChange={(e) => setFormData({...formData, acronyme: e.target.value})}
                  placeholder="Ex: LRI"
                  required 
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Nom Complet</label>
                <input 
                  type="text" 
                  className={styles.formInput}
                  value={formData.nom} 
                  onChange={(e) => setFormData({...formData, nom: e.target.value})}
                  required 
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Chercheurs affiliés</label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <select
                    className={styles.formInput}
                    value={selectedEnsId}
                    onChange={(e) => setSelectedEnsId(e.target.value)}
                    style={{ flex: 1 }}
                  >
                    <option value="">-- Sélectionner un chercheur --</option>
                    {enseignants.map(ens => (
                      <option key={ens.id} value={ens.id} disabled={formData.enseignantIds.includes(ens.id)}>
                        {ens.nom} {ens.prenom}
                      </option>
                    ))}
                  </select>
                  <button 
                    type="button" 
                    onClick={handleAddEns}
                    disabled={!selectedEnsId}
                    style={{
                      padding: '0 16px',
                      backgroundColor: 'var(--color-primary)',
                      color: 'var(--color-on-primary)',
                      border: 'none',
                      cursor: selectedEnsId ? 'pointer' : 'not-allowed',
                      fontWeight: 'bold',
                      opacity: selectedEnsId ? 1 : 0.5
                    }}
                  >
                    Ajouter
                  </button>
                </div>
                
                {formData.enseignantIds.length > 0 && (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, border: '1px solid var(--color-outline)', padding: '8px' }}>
                    {formData.enseignantIds.map(id => {
                      const ens = enseignants.find(e => e.id === id);
                      if (!ens) return null;
                      return (
                        <li key={id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 4px', borderBottom: '1px solid var(--color-surface-container)' }}>
                          <span>{ens.nom} {ens.prenom}</span>
                          <button 
                            type="button" 
                            onClick={() => handleRemoveEns(id)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--color-error)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}
                          >
                            <Trash2 size={14} /> Supprimer
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Description</label>
                <textarea 
                  className={styles.formInput}
                  rows="3"
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                ></textarea>
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
        title="Supprimer le laboratoire"
        message={`Êtes-vous sûr de vouloir supprimer le laboratoire ${deleteModal.name ? `« ${deleteModal.name} »` : ''} ? Cette action est irréversible.`}
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

export default GestionLaboratoires;
