import React, { useState, useEffect } from 'react';
import { 
  UserPlus, Trash2, Upload, Image as ImageIcon, Eye, EyeOff, 
  ExternalLink, Edit3, ArrowLeft, Save, GraduationCap, Briefcase, 
  Building, BookOpen, Award, FileText, Download, Globe, Plus
} from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

import useAuth from '../../hooks/useAuth';
import axiosClient, { getImageUrl } from '../../api/axiosClient';
import Toast from '../../components/common/Toast';
import ConfirmModal from '../../components/common/ConfirmModal';
import TeacherDetailPage from '../public/TeacherDetailPage';
import { parseTeacherBio } from '../../utils/academicProfileHelper';
import styles from './AdminEnseignants.module.css';

const quillModules = {
  toolbar: [
    [{ header: [2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['blockquote', 'link'],
    ['clean'],
  ],
};

const AdminEnseignants = () => {
  const { hasRole } = useAuth();
  const isSecretaire = hasRole('ROLE_SECRETAIRE') && !hasRole('ROLE_ADMIN') && !hasRole('ROLE_SUPER_ADMIN');
  const [enseignants, setEnseignants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingCv, setIsUploadingCv] = useState(false);
  const [toast, setToast] = useState(null);

  // View Mode: 'list' | 'edit' | 'create'
  const [viewMode, setViewMode] = useState('list');
  // Sub Mode when editing/creating: 'editor' | 'preview'
  const [activeSubMode, setActiveSubMode] = useState('editor');

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });
  const [isDeleting, setIsDeleting] = useState(false);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Laboratoires list
  const [laboratoires, setLaboratoires] = useState([]);
  
  // Editing state
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    grade: 'Maître de Conférences',
    specialite: '',
    bureau: '',
    laboratoireId: '',
    telephone: '',
    photo: '',
    cvUrl: '',
    password: '',
    confirmPassword: ''
  });

  // Academic Bio details
  const [presentationHtml, setPresentationHtml] = useState('');
  const [themesRecherche, setThemesRecherche] = useState([]);
  const [newTheme, setNewTheme] = useState('');
  const [enseignements, setEnseignements] = useState([]);
  const [newEnseignement, setNewEnseignement] = useState('');
  const [publications, setPublications] = useState([]);
  const [newPub, setNewPub] = useState({ titre: '', annee: '', revue: '', url: '' });
  const [liensAcademiques, setLiensAcademiques] = useState({
    googleScholar: '',
    researchGate: '',
    orcid: '',
    dblp: '',
    linkedin: '',
    github: '',
  });

  const fetchEnseignants = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/api/admin/enseignants');
      setEnseignants(response.data || []);
    } catch (err) {
      console.error("Error fetching enseignants:", err);
      setToast({ type: 'error', message: "Erreur lors du chargement des enseignants." });
    } finally {
      setLoading(false);
    }
  };

  const fetchLaboratoires = async () => {
    try {
      const res = await axiosClient.get('/api/admin/laboratoires');
      setLaboratoires(res.data || []);
    } catch (err) {
      console.error('Error fetching laboratories:', err);
    }
  };

  useEffect(() => {
    fetchEnseignants();
    fetchLaboratoires();
  }, []);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploadingPhoto(true);
    const formDataObj = new FormData();
    formDataObj.append('file', file);
    try {
      const response = await axiosClient.post('/api/upload', formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data && response.data.url) {
        setFormData(prev => ({ ...prev, photo: response.data.url }));
        setToast({ type: 'success', message: 'Photo téléchargée avec succès.' });
      }
    } catch (error) {
      console.error('Upload photo error:', error);
      const msg = error.response?.data?.error || 'Erreur lors du téléchargement de la photo.';
      setToast({ type: 'error', message: msg });
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const handleCvUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploadingCv(true);
    const formDataObj = new FormData();
    formDataObj.append('file', file);
    try {
      const response = await axiosClient.post('/api/upload', formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data && response.data.url) {
        setFormData(prev => ({ ...prev, cvUrl: response.data.url }));
        setToast({ type: 'success', message: 'Curriculum Vitae (PDF) téléchargé avec succès.' });
      }
    } catch (error) {
      console.error('CV upload error:', error);
      const msg = error.response?.data?.error || 'Erreur lors du téléchargement du CV (PDF).';
      setToast({ type: 'error', message: msg });
    } finally {
      setIsUploadingCv(false);
      e.target.value = '';
    }
  };

  const handleStartCreate = () => {
    setEditingId(null);
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      grade: 'Maître de Conférences',
      specialite: '',
      bureau: '',
      laboratoireId: '',
      telephone: '',
      photo: '',
      cvUrl: '',
      password: '',
      confirmPassword: ''
    });
    setPresentationHtml('');
    setThemesRecherche([]);
    setEnseignements([]);
    setPublications([]);
    setLiensAcademiques({
      googleScholar: '',
      researchGate: '',
      orcid: '',
      dblp: '',
      linkedin: '',
      github: '',
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
    setActiveSubMode('editor');
    setViewMode('create');
  };

  const handleStartEdit = async (enseignant) => {
    setEditingId(enseignant.id);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setActiveSubMode('editor');
    
    setFormData({
      nom: enseignant.nom || '',
      prenom: enseignant.prenom || '',
      email: enseignant.email || '',
      grade: enseignant.grade || 'Maître de Conférences',
      specialite: enseignant.specialite || '',
      bureau: enseignant.bureau || '',
      laboratoireId: enseignant.laboratoires?.[0]?.id || '',
      telephone: enseignant.telephone || '',
      photo: enseignant.photo || '',
      cvUrl: enseignant.cvUrl || '',
      password: '',
      confirmPassword: ''
    });

    const parsedBio = parseTeacherBio(enseignant.biographie);
    setPresentationHtml(parsedBio.presentationHtml || '');
    setThemesRecherche(parsedBio.themesRecherche || []);
    setEnseignements(parsedBio.enseignements || []);
    setPublications(parsedBio.publications || []);
    setLiensAcademiques(parsedBio.liensAcademiques || {
      googleScholar: '',
      researchGate: '',
      orcid: '',
      dblp: '',
      linkedin: '',
      github: '',
    });

    setViewMode('edit');

    try {
      const res = await axiosClient.get(`/api/public/enseignants/${enseignant.id}`);
      if (res.data) {
        const fullBio = parseTeacherBio(res.data.biographie);
        setPresentationHtml(fullBio.presentationHtml || '');
        setThemesRecherche(fullBio.themesRecherche || []);
        setEnseignements(fullBio.enseignements || []);
        setPublications(fullBio.publications || []);
        setLiensAcademiques(fullBio.liensAcademiques || {
          googleScholar: '',
          researchGate: '',
          orcid: '',
          dblp: '',
          linkedin: '',
          github: '',
        });
        if (res.data.cvUrl) {
          setFormData(prev => ({ ...prev, cvUrl: res.data.cvUrl }));
        }
      }
    } catch (err) {
      console.warn('Could not fetch single teacher detail:', err);
    }
  };

  const handleBackToList = () => {
    setViewMode('list');
    setEditingId(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddTheme = () => {
    if (!newTheme.trim()) return;
    setThemesRecherche(prev => [...prev, newTheme.trim()]);
    setNewTheme('');
  };

  const handleRemoveTheme = (index) => {
    setThemesRecherche(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddEnseignement = () => {
    if (!newEnseignement.trim()) return;
    setEnseignements(prev => [...prev, newEnseignement.trim()]);
    setNewEnseignement('');
  };

  const handleRemoveEnseignement = (index) => {
    setEnseignements(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddPub = () => {
    if (!newPub.titre.trim()) return;
    setPublications(prev => [...prev, { ...newPub }]);
    setNewPub({ titre: '', annee: '', revue: '', url: '' });
  };

  const handleRemovePub = (index) => {
    setPublications(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!editingId && !formData.password) {
      setToast({ type: 'error', message: 'Le mot de passe est obligatoire pour créer un compte enseignant.' });
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      setToast({ type: 'error', message: 'Les mots de passe ne correspondent pas.' });
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setToast({ type: 'error', message: 'Le mot de passe doit contenir au moins 6 caractères.' });
      return;
    }

    setSaving(true);
    try {
      const bioPayload = JSON.stringify({
        presentationHtml,
        themesRecherche,
        enseignements,
        publications,
        liensAcademiques,
      });

      const payload = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        telephone: formData.telephone,
        grade: formData.grade,
        specialite: formData.specialite,
        bureau: formData.bureau,
        laboratoireId: formData.laboratoireId || null,
        laboratoireIds: formData.laboratoireId ? [formData.laboratoireId] : [],
        photo: formData.photo,
        cvUrl: formData.cvUrl,
        biographie: bioPayload,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      if (isSecretaire) {
        await axiosClient.post('/api/secretaire/demandes', {
          typeEntite: 'Enseignant',
          action: editingId ? 'UPDATE' : 'CREATE',
          entiteId: editingId || null,
          donnees: payload
        });
        setToast({ type: 'success', message: 'Demande soumise avec succès pour validation.' });
      } else {
        if (editingId) {
          await axiosClient.put(`/api/admin/enseignants/${editingId}`, payload);
          setToast({ type: 'success', message: 'Profil enseignant mis à jour et synchronisé avec succès.' });
        } else {
          await axiosClient.post('/api/admin/enseignants', payload);
          setToast({ type: 'success', message: 'Enseignant ajouté avec succès.' });
        }
      }

      fetchEnseignants();
      setViewMode('list');
      setEditingId(null);
    } catch (err) {
      console.error('Submit error:', err);
      const msg = err.response?.data?.error || "Erreur lors de l'enregistrement de l'enseignant.";
      setToast({ type: 'error', message: msg });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id, name) => {
    setDeleteModal({ isOpen: true, id, name });
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    setIsDeleting(true);
    try {
      if (isSecretaire) {
        await axiosClient.post('/api/secretaire/demandes', {
          typeEntite: 'Enseignant',
          action: 'DELETE',
          entiteId: deleteModal.id,
          donnees: { nom: deleteModal.name }
        });
        setToast({ type: 'success', message: 'Demande de suppression soumise pour validation.' });
      } else {
        await axiosClient.delete(`/api/admin/enseignants/${deleteModal.id}`);
        setToast({ type: 'success', message: 'Enseignant supprimé avec succès.' });
        fetchEnseignants();
      }
    } catch (err) {
      console.error('Delete error:', err);
      const msg = err.response?.data?.error || "Erreur lors de la suppression de l'enseignant.";
      setToast({ type: 'error', message: msg });
    } finally {
      setIsDeleting(false);
      setDeleteModal({ isOpen: false, id: null, name: '' });
    }
  };

  const filteredEnseignants = enseignants.filter(e => {
    const fullName = `${e.prenom || ''} ${e.nom || ''}`.toLowerCase();
    const email = (e.email || '').toLowerCase();
    const grade = (e.grade || '').toLowerCase();
    const specialite = (e.specialite || '').toLowerCase();
    const q = searchTerm.toLowerCase();
    return fullName.includes(q) || email.includes(q) || grade.includes(q) || specialite.includes(q);
  });

  const selectedLab = laboratoires.find(l => String(l.id) === String(formData.laboratoireId));
  const previewDataObject = {
    id: editingId || 1,
    nom: formData.nom || 'Nom',
    prenom: formData.prenom || 'Prénom',
    email: formData.email || 'enseignant@ump.ac.ma',
    telephone: formData.telephone,
    photo: formData.photo,
    grade: formData.grade,
    specialite: formData.specialite,
    bureau: formData.bureau,
    cvUrl: formData.cvUrl,
    laboratoires: selectedLab ? [selectedLab] : [],
    biographie: JSON.stringify({
      presentationHtml,
      themesRecherche,
      enseignements,
      publications,
      liensAcademiques,
    })
  };

  return (
    <div className={styles.container}>
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          duration={5000}
          onClose={() => setToast(null)}
        />
      )}

      {viewMode !== 'list' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            background: '#ffffff',
            border: '1px solid #d9c2bb',
            padding: '16px 20px',
            borderLeft: '6px solid var(--color-primary)'
          }}>
            <div>
              <button 
                type="button" 
                onClick={handleBackToList}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-primary)',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '6px',
                  padding: 0
                }}
              >
                <ArrowLeft size={16} /> Retour à la liste des enseignants
              </button>
              <h1 style={{
                fontFamily: 'Inter',
                fontSize: '22px',
                fontWeight: '700',
                color: '#191c1e',
                margin: 0,
                textTransform: 'uppercase'
              }}>
                {viewMode === 'edit' 
                  ? `Modifier l'Enseignant : Pr. ${formData.prenom} ${formData.nom}` 
                  : 'Ajouter un Nouvel Enseignant'}
              </h1>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button 
                  type="button" 
                  onClick={() => setActiveSubMode('editor')}
                  style={{
                    background: activeSubMode === 'editor' ? 'var(--color-primary)' : '#f1f5f9',
                    color: activeSubMode === 'editor' ? '#ffffff' : '#334155',
                    border: '1px solid #cbd5e1',
                    padding: '9px 16px',
                    fontSize: '13px',
                    fontWeight: '600',
                    borderRadius: '4px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <Edit3 size={15} /> Mode Édition
                </button>
                <button 
                  type="button" 
                  onClick={() => setActiveSubMode('preview')}
                  style={{
                    background: activeSubMode === 'preview' ? 'var(--color-primary)' : '#f1f5f9',
                    color: activeSubMode === 'preview' ? '#ffffff' : '#334155',
                    border: '1px solid #cbd5e1',
                    padding: '9px 16px',
                    fontSize: '13px',
                    fontWeight: '600',
                    borderRadius: '4px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <ExternalLink size={15} /> Aperçu en Direct
                </button>
              </div>

              <button 
                type="button" 
                onClick={handleSubmit} 
                disabled={saving}
                style={{
                  background: 'var(--color-primary)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 20px',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '13px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  borderRadius: '4px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <Save size={16} /> {saving ? 'Enregistrement...' : (isSecretaire ? 'Soumettre pour validation' : 'Enregistrer')}
              </button>
            </div>
          </div>

          {activeSubMode === 'preview' ? (
            <div style={{
              background: '#ffffff',
              border: '1px solid #d9c2bb',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}>
              <div style={{
                background: '#e0f2fe',
                borderBottom: '1px solid #bae6fd',
                padding: '12px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#0369a1',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                <ExternalLink size={16} />
                Aperçu en direct du profil public de cet enseignant (tel qu'il apparaîtra sur /equipe)
              </div>
              <div style={{ padding: '24px 0' }}>
                <TeacherDetailPage previewData={previewDataObject} />
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{
                background: '#ffffff',
                border: '1px solid #d9c2bb',
                borderRadius: '8px',
                padding: '24px',
                borderLeft: '6px solid var(--color-primary)'
              }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#191c1e', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Briefcase size={20} color="var(--color-primary)" />
                  Informations Personnelles &amp; Académiques
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  <div className={styles.formGroup}>
                    <label>Prénom *</label>
                    <input className={styles.input} type="text" name="prenom" required value={formData.prenom} onChange={handleChange} placeholder="ex: Mohammed" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Nom *</label>
                    <input className={styles.input} type="text" name="nom" required value={formData.nom} onChange={handleChange} placeholder="ex: Salah" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Email Académique *</label>
                    <input className={styles.input} type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="ex: m.salah@ump.ac.ma" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Téléphone Direct</label>
                    <input className={styles.input} type="text" name="telephone" value={formData.telephone} onChange={handleChange} placeholder="ex: +212 5 36 50 06 01" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Grade Académique *</label>
                    <select className={styles.input} name="grade" required value={formData.grade} onChange={handleChange}>
                      <option value="Professeur de l'Enseignement Supérieur (PES)">Professeur de l'Enseignement Supérieur (PES)</option>
                      <option value="Professeur Habilité (PH)">Professeur Habilité (PH)</option>
                      <option value="Maître de Conférences">Maître de Conférences</option>
                      <option value="Professeur Assistant">Professeur Assistant</option>
                      <option value="Doctorant / Vacataire">Doctorant / Vacataire</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Spécialité &amp; Domaine d'Expertise</label>
                    <input className={styles.input} type="text" name="specialite" value={formData.specialite} onChange={handleChange} placeholder="ex: Intelligence Artificielle, Cloud" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Bureau / Campus</label>
                    <input className={styles.input} type="text" name="bureau" value={formData.bureau} onChange={handleChange} placeholder="ex: Bâtiment Informatique, B204" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Laboratoire de Recherche Affilié</label>
                    <select className={styles.input} name="laboratoireId" value={formData.laboratoireId} onChange={handleChange}>
                      <option value="">-- Aucun laboratoire --</option>
                      {laboratoires.map(lab => (
                        <option key={lab.id} value={lab.id}>
                          {lab.acronyme ? `${lab.acronyme} — ` : ''}{lab.nom}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>{editingId ? 'Nouveau Mot de Passe (Optionnel)' : 'Mot de Passe *'}</label>
                    <div className={styles.passwordWrap}>
                      <input 
                        className={styles.input} 
                        type={showPassword ? "text" : "password"} 
                        name="password" 
                        required={!editingId} 
                        value={formData.password} 
                        onChange={handleChange} 
                        placeholder={editingId ? "Laisser vide si inchangé" : "Mot de passe"} 
                      />
                      <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label>{editingId ? 'Confirmer le Mot de Passe' : 'Confirmer le Mot de Passe *'}</label>
                    <div className={styles.passwordWrap}>
                      <input 
                        className={styles.input} 
                        type={showConfirmPassword ? "text" : "password"} 
                        name="confirmPassword" 
                        required={!editingId && Boolean(formData.password)} 
                        value={formData.confirmPassword} 
                        onChange={handleChange} 
                        placeholder="Retapez le mot de passe" 
                      />
                      <button type="button" className={styles.eyeBtn} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: PHOTO & CV */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #d9c2bb',
                borderRadius: '8px',
                padding: '24px',
                borderLeft: '6px solid var(--color-primary)'
              }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#191c1e', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ImageIcon size={20} color="var(--color-primary)" />
                  Photo de Profil HD &amp; Curriculum Vitae (PDF)
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                  {/* Photo Uploader */}
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <label className={styles.label} style={{ display: 'block', marginBottom: '8px' }}>Photo de Profil (HD)</label>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', background: '#cbd5e1', flexShrink: 0 }}>
                        {formData.photo ? (
                          <img src={getImageUrl(formData.photo)} alt="Portrait" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>👤</div>
                        )}
                      </div>
                      <div>
                        <label style={{ display: 'inline-block', cursor: 'pointer' }}>
                          <input type="file" accept="image/*" onChange={handlePhotoUpload} disabled={isUploadingPhoto} style={{ display: 'none' }} />
                          <span className={styles.filterBtn} style={{ padding: '8px 14px', fontSize: '12px' }}>
                            <Upload size={14} /> {isUploadingPhoto ? 'Téléchargement...' : 'Télécharger Photo'}
                          </span>
                        </label>
                        {formData.photo && (
                          <button type="button" onClick={() => setFormData(prev => ({ ...prev, photo: '' }))} style={{ display: 'block', background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', cursor: 'pointer', marginTop: '6px' }}>
                            Supprimer la photo
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* CV PDF Uploader */}
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <label className={styles.label} style={{ display: 'block', marginBottom: '8px' }}>Curriculum Vitae (Format PDF)</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {formData.cvUrl ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                          <span style={{ fontSize: '13px', fontWeight: '600', color: '#0369a1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FileText size={16} /> CV_Academique.pdf
                          </span>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <a href={getImageUrl(formData.cvUrl)} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: '#0284c7', textDecoration: 'none', fontWeight: '600' }}>
                              Visualiser ↗
                            </a>
                            <button type="button" onClick={() => setFormData(prev => ({ ...prev, cvUrl: '' }))} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', cursor: 'pointer' }}>
                              Retirer
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Aucun fichier CV (PDF) attaché.</p>
                      )}
                      <div>
                        <label style={{ display: 'inline-block', cursor: 'pointer' }}>
                          <input type="file" accept=".pdf,.doc,.docx" onChange={handleCvUpload} disabled={isUploadingCv} style={{ display: 'none' }} />
                          <span className={styles.filterBtn} style={{ padding: '8px 14px', fontSize: '12px' }}>
                            <Upload size={14} /> {isUploadingCv ? 'Téléchargement...' : 'Télécharger CV (PDF)'}
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: BIOGRAPHIE & PRÉSENTATION */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #d9c2bb',
                borderRadius: '8px',
                padding: '24px',
                borderLeft: '6px solid var(--color-primary)'
              }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#191c1e', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BookOpen size={20} color="var(--color-primary)" />
                  Biographie &amp; Présentation Académique
                </h2>
                <ReactQuill 
                  theme="snow"
                  value={presentationHtml}
                  onChange={setPresentationHtml}
                  modules={quillModules}
                  placeholder="Rédigez le parcours académique, responsabilités et engagements scientifiques..."
                  style={{ height: '240px', marginBottom: '48px' }}
                />
              </div>

              {/* SECTION 4: THÈMES DE RECHERCHE */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #d9c2bb',
                borderRadius: '8px',
                padding: '24px',
                borderLeft: '6px solid var(--color-primary)'
              }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#191c1e', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={20} color="var(--color-primary)" />
                  Thèmes &amp; Axes de Recherche
                </h2>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                  <input 
                    className={styles.input} 
                    type="text" 
                    value={newTheme} 
                    onChange={(e) => setNewTheme(e.target.value)} 
                    placeholder="Ajouter un axe de recherche (ex: Deep Learning & Vision par Ordinateur)" 
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTheme(); } }}
                  />
                  <button type="button" onClick={handleAddTheme} className={styles.addBtn} style={{ padding: '0 20px', flexShrink: 0 }}>
                    <Plus size={16} /> Ajouter
                  </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {themesRecherche.map((th, idx) => (
                    <span key={idx} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      {th}
                      <button type="button" onClick={() => handleRemoveTheme(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0, display: 'flex' }}>✕</button>
                    </span>
                  ))}
                  {themesRecherche.length === 0 && <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>Aucun thème de recherche ajouté.</p>}
                </div>
              </div>

              {/* SECTION 5: ENSEIGNEMENTS & MODULES */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #d9c2bb',
                borderRadius: '8px',
                padding: '24px',
                borderLeft: '6px solid var(--color-primary)'
              }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#191c1e', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <GraduationCap size={20} color="var(--color-primary)" />
                  Enseignements &amp; Modules
                </h2>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                  <input 
                    className={styles.input} 
                    type="text" 
                    value={newEnseignement} 
                    onChange={(e) => setNewEnseignement(e.target.value)} 
                    placeholder="Ajouter une matière (ex: Algorithmique Avancée — Master 1 Informatique)" 
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddEnseignement(); } }}
                  />
                  <button type="button" onClick={handleAddEnseignement} className={styles.addBtn} style={{ padding: '0 20px', flexShrink: 0 }}>
                    <Plus size={16} /> Ajouter
                  </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {enseignements.map((ensItem, idx) => (
                    <span key={idx} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      {ensItem}
                      <button type="button" onClick={() => handleRemoveEnseignement(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0, display: 'flex' }}>✕</button>
                    </span>
                  ))}
                  {enseignements.length === 0 && <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>Aucun enseignement ajouté.</p>}
                </div>
              </div>

              {/* SECTION 6: PUBLICATIONS */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #d9c2bb',
                borderRadius: '8px',
                padding: '24px',
                borderLeft: '6px solid var(--color-primary)'
              }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#191c1e', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={20} color="var(--color-primary)" />
                  Publications &amp; Travaux Scientifiques
                </h2>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', alignItems: 'flex-end' }}>
                  <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '11px' }}>Titre de la publication</label>
                    <input className={styles.input} type="text" value={newPub.titre} onChange={(e) => setNewPub({ ...newPub, titre: e.target.value })} placeholder="ex: Deep Neural Architectures for Edge Computing" />
                  </div>
                  <div className={styles.formGroup}>
                    <label style={{ fontSize: '11px' }}>Année</label>
                    <input className={styles.input} type="text" value={newPub.annee} onChange={(e) => setNewPub({ ...newPub, annee: e.target.value })} placeholder="ex: 2024" />
                  </div>
                  <div className={styles.formGroup}>
                    <label style={{ fontSize: '11px' }}>Revue / Conférence</label>
                    <input className={styles.input} type="text" value={newPub.revue} onChange={(e) => setNewPub({ ...newPub, revue: e.target.value })} placeholder="ex: IEEE Transactions on AI" />
                  </div>
                  <div className={styles.formGroup}>
                    <label style={{ fontSize: '11px' }}>Lien URL / DOI</label>
                    <input className={styles.input} type="text" value={newPub.url} onChange={(e) => setNewPub({ ...newPub, url: e.target.value })} placeholder="https://doi.org/..." />
                  </div>
                  <div>
                    <button type="button" onClick={handleAddPub} className={styles.addBtn} style={{ width: '100%', padding: '10px 16px', justifyContent: 'center' }}>
                      + Ajouter Publication
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {publications.map((p, idx) => (
                    <div key={idx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '12px 16px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ fontSize: '14px', color: '#1e293b' }}>{p.titre}</strong>
                        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
                          {p.annee && <span>({p.annee}) </span>}
                          {p.revue && <span>— {p.revue} </span>}
                          {p.url && <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ color: '#0284c7', marginLeft: '6px' }}>Lien DOI ↗</a>}
                        </p>
                      </div>
                      <button type="button" onClick={() => handleRemovePub(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {publications.length === 0 && <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>Aucune publication ajoutée.</p>}
                </div>
              </div>

              {/* SECTION 7: LIENS ACADÉMIQUES */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #d9c2bb',
                borderRadius: '8px',
                padding: '24px',
                borderLeft: '6px solid var(--color-primary)'
              }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#191c1e', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Globe size={20} color="var(--color-primary)" />
                  Profils Scientifiques &amp; Liens Externes
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                  <div className={styles.formGroup}>
                    <label>Google Scholar</label>
                    <input className={styles.input} type="text" value={liensAcademiques.googleScholar} onChange={(e) => setLiensAcademiques({ ...liensAcademiques, googleScholar: e.target.value })} placeholder="https://scholar.google.com/citations?..." />
                  </div>
                  <div className={styles.formGroup}>
                    <label>ResearchGate</label>
                    <input className={styles.input} type="text" value={liensAcademiques.researchGate} onChange={(e) => setLiensAcademiques({ ...liensAcademiques, researchGate: e.target.value })} placeholder="https://www.researchgate.net/profile/..." />
                  </div>
                  <div className={styles.formGroup}>
                    <label>ORCID</label>
                    <input className={styles.input} type="text" value={liensAcademiques.orcid} onChange={(e) => setLiensAcademiques({ ...liensAcademiques, orcid: e.target.value })} placeholder="https://orcid.org/0000-..." />
                  </div>
                  <div className={styles.formGroup}>
                    <label>DBLP Computer Science</label>
                    <input className={styles.input} type="text" value={liensAcademiques.dblp} onChange={(e) => setLiensAcademiques({ ...liensAcademiques, dblp: e.target.value })} placeholder="https://dblp.org/pid/..." />
                  </div>
                  <div className={styles.formGroup}>
                    <label>LinkedIn</label>
                    <input className={styles.input} type="text" value={liensAcademiques.linkedin} onChange={(e) => setLiensAcademiques({ ...liensAcademiques, linkedin: e.target.value })} placeholder="https://linkedin.com/in/..." />
                  </div>
                  <div className={styles.formGroup}>
                    <label>GitHub</label>
                    <input className={styles.input} type="text" value={liensAcademiques.github} onChange={(e) => setLiensAcademiques({ ...liensAcademiques, github: e.target.value })} placeholder="https://github.com/..." />
                  </div>
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '16px 0' }}>
                <button type="button" onClick={handleBackToList} className={styles.cancelBtn}>
                  Annuler
                </button>
                <button type="submit" disabled={saving} className={styles.saveBtn}>
                  {saving ? 'Enregistrement...' : (isSecretaire ? 'Soumettre pour validation' : 'Enregistrer les modifications')}
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        /* ============================================================
            VIEW MODE: LIST (ALL TEACHERS CARDS)
           ============================================================ */
        <>
          <div className={styles.header}>
            <div className={styles.headerRow}>
              <div>
                <span className={styles.subtitle}>GESTION DES COMPTES</span>
                <h1 className={styles.title}>CORPS PÉDAGOGIQUE</h1>
                <p className={styles.description}>
                  Gérez l'ensemble des enseignants-chercheurs, leurs affiliations de laboratoire, publications et profils académiques.
                </p>
              </div>
              
              <div className={styles.actions}>
                <div style={{ display: 'flex', alignItems: 'center', height: '45px' }}>
                  <input 
                    type="text" 
                    placeholder="Rechercher un enseignant..." 
                    className={styles.input} 
                    style={{ height: '100%', minWidth: '240px' }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button className={styles.addBtn} onClick={handleStartCreate}>
                  <UserPlus size={18} /> Ajouter un Membre
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Chargement des enseignants...</div>
          ) : (
            <div className={styles.grid}>
              {filteredEnseignants.map(enseignant => (
                <div className={styles.card} key={enseignant.id}>
                  <div className={styles.cardHeader}>
                    <div className={styles.avatar}>
                      {enseignant.photo ? (
                        <img src={getImageUrl(enseignant.photo)} alt={`${enseignant.prenom} ${enseignant.nom}`} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: '#d9c2bb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: '#53433e' }}>
                          {enseignant.prenom?.[0]}{enseignant.nom?.[0]}
                        </div>
                      )}
                    </div>
                    <div className={styles.info}>
                      <h3>{enseignant.prenom} {enseignant.nom}</h3>
                      <p className={styles.grade}>{enseignant.grade || "Non spécifié"}</p>
                    </div>
                  </div>
                  
                  <div className={styles.cardBody}>
                    {enseignant.specialite && (
                      <div style={{ marginBottom: 6 }}>
                        <p className={styles.label}>Spécialité</p>
                        <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#191c1e', fontWeight: 500 }}>{enseignant.specialite}</p>
                      </div>
                    )}
                    {enseignant.bureau && (
                      <div style={{ marginBottom: 6 }}>
                        <p className={styles.label}>Bureau</p>
                        <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#53433e' }}>{enseignant.bureau}</p>
                      </div>
                    )}
                    {enseignant.laboratoires && enseignant.laboratoires.length > 0 && (
                      <div style={{ marginBottom: 6 }}>
                        <p className={styles.label}>Laboratoire</p>
                        <span style={{ display: 'inline-block', background: '#fef3c7', color: '#92400e', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', marginTop: '2px' }}>
                          {enseignant.laboratoires[0].acronyme || enseignant.laboratoires[0].nom}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className={styles.label}>Contact</p>
                      <p className={styles.contact}>{enseignant.email}</p>
                    </div>
                    {enseignant.telephone && (
                      <div>
                        <p className={styles.label}>Téléphone</p>
                        <p style={{ fontFamily: 'Inter', fontSize: 14 }}>{enseignant.telephone}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className={styles.cardFooter}>
                    <button 
                      type="button"
                      className={styles.editBtn}
                      onClick={() => handleStartEdit(enseignant)}
                    >
                      Éditer Profil
                    </button>
                    <button className={styles.deleteBtn} onClick={() => handleDelete(enseignant.id, `${enseignant.prenom} ${enseignant.nom}`)} title="Supprimer">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
              {filteredEnseignants.length === 0 && (
                <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', color: '#64748b' }}>
                  Aucun enseignant trouvé pour la recherche.
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Confirmation de suppression"
        message={`Êtes-vous sûr de vouloir supprimer l'enseignant "${deleteModal.name}" ?`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
        confirmLabel={isDeleting ? "Suppression..." : (isSecretaire ? "Soumettre suppression" : "Supprimer")}
        isDanger={true}
      />
    </div>
  );
};

export default AdminEnseignants;
