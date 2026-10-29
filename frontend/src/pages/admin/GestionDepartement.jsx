import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import axiosClient, { getImageUrl } from '../../api/axiosClient';
import useAuth from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import Toast from '../../components/common/Toast';
import ConfirmModal from '../../components/common/ConfirmModal';
import styles from './GestionDepartement.module.css';

const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ['link', 'clean']
  ],
};

const GestionDepartement = () => {
  const { hasRole } = useAuth();
  const isSecretaire = hasRole('ROLE_SECRETAIRE') && !hasRole('ROLE_ADMIN') && !hasRole('ROLE_SUPER_ADMIN');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const [formData, setFormData] = useState({
    id: null,
    titre: 'LE DÉPARTEMENT',
    sousTitre: '',
    motDirecteur: '',
    nomDirecteur: '',
    titreDirecteur: '',
    photoDirecteur: '',
    imageCover: '',
    histoire: '',
    valeurs: '',
    adresse: '',
    telephone: '',
    email: '',
    horaires: '',
    chiffresCles: [
      { valeur: '1200+', label: 'Étudiants Formés' },
      { valeur: '45+', label: 'Enseignants-Chercheurs' },
      { valeur: '5', label: 'Filières d\'Excellence' },
      { valeur: '2', label: 'Laboratoires de Recherche' },
    ]
  });

  useEffect(() => {
    fetchDepartementData();
  }, []);

  const fetchDepartementData = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/api/admin/departement');
      if (res.data) {
        setFormData({
          id: res.data.id || null,
          titre: res.data.titre || 'LE DÉPARTEMENT',
          sousTitre: res.data.sousTitre || '',
          motDirecteur: res.data.motDirecteur || '',
          nomDirecteur: res.data.nomDirecteur || '',
          titreDirecteur: res.data.titreDirecteur || '',
          photoDirecteur: res.data.photoDirecteur || '',
          imageCover: res.data.imageCover || '',
          histoire: res.data.histoire || '',
          valeurs: res.data.valeurs || '',
          adresse: res.data.adresse || '',
          telephone: res.data.telephone || '',
          email: res.data.email || '',
          horaires: res.data.horaires || '',
          chiffresCles: res.data.chiffresCles && res.data.chiffresCles.length > 0 
            ? res.data.chiffresCles 
            : [
                { valeur: '1200+', label: 'Étudiants Formés' },
                { valeur: '45+', label: 'Enseignants-Chercheurs' },
                { valeur: '5', label: 'Filières d\'Excellence' },
                { valeur: '2', label: 'Laboratoires de Recherche' },
              ]
        });
      }
    } catch (err) {
      console.error('Error fetching departement info:', err);
      setToast({ type: 'error', message: 'Erreur lors du chargement des données du département.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploadingPhoto(true);
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await axiosClient.post('/api/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data && res.data.url) {
        setFormData(prev => ({ ...prev, photoDirecteur: res.data.url }));
        setToast({ type: 'success', message: 'Photo du directeur téléchargée avec succès.' });
      }
    } catch (err) {
      console.error('Upload photo error:', err);
      const msg = err.response?.data?.error || 'Erreur lors du téléchargement de la photo.';
      setToast({ type: 'error', message: msg });
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploadingCover(true);
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await axiosClient.post('/api/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data && res.data.url) {
        setFormData(prev => ({ ...prev, imageCover: res.data.url }));
        setToast({ type: 'success', message: 'Image de couverture téléchargée avec succès.' });
      }
    } catch (err) {
      console.error('Upload cover error:', err);
      const msg = err.response?.data?.error || 'Erreur lors du téléchargement de l\'image.';
      setToast({ type: 'error', message: msg });
    } finally {
      setIsUploadingCover(false);
      e.target.value = '';
    }
  };

  const handleStatChange = (index, key, val) => {
    const updated = [...formData.chiffresCles];
    updated[index][key] = val;
    setFormData(prev => ({ ...prev, chiffresCles: updated }));
  };

  const handleAddStat = () => {
    setFormData(prev => ({
      ...prev,
      chiffresCles: [...prev.chiffresCles, { valeur: '100+', label: 'Nouveau chiffre' }]
    }));
  };

  const handleRemoveStat = (index) => {
    const updated = formData.chiffresCles.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, chiffresCles: updated }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (isSecretaire) {
        await axiosClient.post('/api/secretaire/demandes', {
          typeEntite: 'Departement',
          action: 'UPDATE',
          entiteId: formData.id || 1,
          donnees: formData
        });
        setToast({ type: 'success', message: 'Demande de modification envoyée avec succès pour validation.' });
      } else {
        await axiosClient.put('/api/admin/departement', formData);
        setToast({ type: 'success', message: 'Informations du département enregistrées avec succès.' });
      }
    } catch (err) {
      console.error('Save error:', err);
      const msg = err.response?.data?.error || 'Erreur lors de l\'enregistrement des informations.';
      setToast({ type: 'error', message: msg });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container} style={{ textAlign: 'center', padding: '50px 0' }}>
        <p>Chargement des informations du département...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Présentation &amp; Identité du Département</h1>
          <p className={styles.subtitle}>
            Personnalisez le contenu, les photos, le mot de la direction et les informations affichées sur la page publique du département.
          </p>
        </div>
        <div className={styles.headerActions}>
          <a href="/departement" target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" size="sm">
              👁 Voir la page publique ↗
            </Button>
          </a>
        </div>
      </div>

      <form onSubmit={handleSave}>
        {/* Section 1: Titre & Accroche */}
        <div className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>
            🏛 En-tête de la Page
          </h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Titre Principal de la page</label>
              <input
                type="text"
                className={styles.input}
                value={formData.titre}
                onChange={(e) => handleInputChange('titre', e.target.value)}
                placeholder="ex: LE DÉPARTEMENT"
                required
              />
            </div>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label className={styles.label}>Sous-titre / Accroche introductive</label>
              <textarea
                className={styles.textarea}
                value={formData.sousTitre}
                onChange={(e) => handleInputChange('sousTitre', e.target.value)}
                rows={2}
                placeholder="Accroche affichée sous le titre..."
              />
            </div>
          </div>
        </div>

        {/* Section 2: Mot de la Direction & Photo */}
        <div className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>
            👤 Direction &amp; Mot d'Ouverture
          </h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Nom du Directeur / Responsable</label>
              <input
                type="text"
                className={styles.input}
                value={formData.nomDirecteur}
                onChange={(e) => handleInputChange('nomDirecteur', e.target.value)}
                placeholder="ex: Pr. Nom Prénom"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Fonction / Titre</label>
              <input
                type="text"
                className={styles.input}
                value={formData.titreDirecteur}
                onChange={(e) => handleInputChange('titreDirecteur', e.target.value)}
                placeholder="ex: Chef du Département Informatique"
              />
            </div>

            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label className={styles.label}>Photo du Directeur / Responsable</label>
              <div className={styles.uploadBox}>
                {formData.photoDirecteur ? (
                  <img
                    src={getImageUrl(formData.photoDirecteur)}
                    alt="Directeur"
                    className={styles.photoPreview}
                  />
                ) : (
                  <div style={{
                    width: '90px',
                    height: '90px',
                    borderRadius: '50%',
                    background: '#e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px'
                  }}>
                    👤
                  </div>
                )}
                <div className={styles.uploadActions}>
                  <label>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handlePhotoUpload}
                      disabled={isUploadingPhoto}
                    />
                    <span className="btn btn-secondary" style={{ cursor: 'pointer', padding: '8px 14px', fontSize: '13px', display: 'inline-block' }}>
                      {isUploadingPhoto ? 'Téléchargement...' : '📷 Choisir une photo'}
                    </span>
                  </label>
                  {formData.photoDirecteur && (
                    <button
                      type="button"
                      onClick={() => handleInputChange('photoDirecteur', '')}
                      style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', cursor: 'pointer', textAlign: 'left' }}
                    >
                      Supprimer la photo
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label className={styles.label}>Mot de la Direction (Citation / Message)</label>
              <textarea
                className={styles.textarea}
                value={formData.motDirecteur}
                onChange={(e) => handleInputChange('motDirecteur', e.target.value)}
                rows={3}
                placeholder="Message du chef de département..."
              />
            </div>
          </div>
        </div>

        {/* Section 3: Présentation, Histoire & Couverture */}
        <div className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>
            📖 Présentation, Histoire &amp; Visuels
          </h2>
          <div className={styles.formGrid}>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label className={styles.label}>Image de Couverture / Bâtiment / Campus</label>
              <div className={styles.uploadBox}>
                {formData.imageCover ? (
                  <img
                    src={getImageUrl(formData.imageCover)}
                    alt="Couverture"
                    className={styles.coverPreview}
                  />
                ) : (
                  <div style={{
                    width: '180px',
                    height: '100px',
                    background: '#e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '6px',
                    fontSize: '13px',
                    color: '#64748b'
                  }}>
                    Pas d'image
                  </div>
                )}
                <div className={styles.uploadActions}>
                  <label>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleCoverUpload}
                      disabled={isUploadingCover}
                    />
                    <span className="btn btn-secondary" style={{ cursor: 'pointer', padding: '8px 14px', fontSize: '13px', display: 'inline-block' }}>
                      {isUploadingCover ? 'Téléchargement...' : '🖼 Importer une image de campus'}
                    </span>
                  </label>
                  {formData.imageCover && (
                    <button
                      type="button"
                      onClick={() => handleInputChange('imageCover', '')}
                      style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', cursor: 'pointer', textAlign: 'left' }}
                    >
                      Supprimer l'image
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label className={styles.label}>Histoire, Missions &amp; Rayonnement (Éditeur de texte)</label>
              <ReactQuill
                theme="snow"
                value={formData.histoire}
                onChange={(content) => handleInputChange('histoire', content)}
                modules={quillModules}
                style={{ height: '220px', marginBottom: '45px' }}
              />
            </div>

            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label className={styles.label}>Valeurs &amp; Piliers (séparés par des virgules)</label>
              <input
                type="text"
                className={styles.input}
                value={formData.valeurs}
                onChange={(e) => handleInputChange('valeurs', e.target.value)}
                placeholder="ex: Excellence Scientifique, Innovation Ouverte, Rigueur Académique"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Chiffres Clés */}
        <div className={styles.sectionCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 className={styles.sectionTitle} style={{ borderBottom: 'none', margin: 0, padding: 0 }}>
              📊 Chiffres Clés &amp; Statistiques
            </h2>
            <button
              type="button"
              onClick={handleAddStat}
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              + Ajouter un chiffre
            </button>
          </div>
          <div className={styles.statsGrid}>
            {formData.chiffresCles.map((st, idx) => (
              <div key={idx} className={styles.statItem}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className={styles.label} style={{ fontSize: '12px' }}>Statistique #{idx + 1}</label>
                  {formData.chiffresCles.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveStat(idx)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '14px', cursor: 'pointer' }}
                      title="Supprimer"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  className={styles.input}
                  value={st.valeur}
                  onChange={(e) => handleStatChange(idx, 'valeur', e.target.value)}
                  placeholder="ex: 1200+"
                />
                <input
                  type="text"
                  className={styles.input}
                  value={st.label}
                  onChange={(e) => handleStatChange(idx, 'label', e.target.value)}
                  placeholder="ex: Étudiants Formés"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Coordonnées & Contact */}
        <div className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>
            📍 Coordonnées &amp; Informations Pratiques
          </h2>
          <div className={styles.formGrid}>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label className={styles.label}>Adresse Postale &amp; Bâtiment</label>
              <input
                type="text"
                className={styles.input}
                value={formData.adresse}
                onChange={(e) => handleInputChange('adresse', e.target.value)}
                placeholder="ex: Faculté des Sciences, BV Mohammed VI - BP 717, 60000 Oujda, Maroc"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Téléphone</label>
              <input
                type="text"
                className={styles.input}
                value={formData.telephone}
                onChange={(e) => handleInputChange('telephone', e.target.value)}
                placeholder="ex: +212 536 50 06 01"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Email de Contact</label>
              <input
                type="email"
                className={styles.input}
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="ex: informatique@fso.ump.ma"
              />
            </div>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label className={styles.label}>Horaires d'Ouverture</label>
              <input
                type="text"
                className={styles.input}
                value={formData.horaires}
                onChange={(e) => handleInputChange('horaires', e.target.value)}
                placeholder="ex: Lundi - Vendredi : 08h30 - 18h00"
              />
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className={styles.saveBar}>
          <Button
            type="submit"
            variant="primary"
            disabled={saving}
          >
            {saving ? 'Enregistrement en cours...' : (isSecretaire ? 'Soumettre pour validation' : 'Enregistrer les modifications')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default GestionDepartement;
