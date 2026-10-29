import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  User, Mail, Lock, Phone, Eye, EyeOff, Camera, Save, 
  ShieldCheck, CheckCircle2, GraduationCap, Briefcase, Building, 
  BookOpen, Award, FileText, Download, Globe, Plus, Trash2,
  ExternalLink, Edit3, ArrowLeft
} from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

import useAuth from '../../hooks/useAuth';
import axiosClient from '../../api/axiosClient';
import Toast from '../../components/common/Toast';
import TeacherDetailPage from '../public/TeacherDetailPage';
import { parseTeacherBio } from '../../utils/academicProfileHelper';
import styles from './ProfilePage.module.css';

const ProfilePage = () => {
  const { user, hasRole } = useAuth();
  const [searchParams] = useSearchParams();
  const targetTeacherId = searchParams.get('id') || searchParams.get('enseignantId');
  const isEditingTargetTeacher = Boolean(targetTeacherId);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeMode, setActiveMode] = useState('editor'); // 'editor' | 'preview'
  const [isUploadingCv, setIsUploadingCv] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    email: '',
    nom: '',
    prenom: '',
    telephone: '',
    photo: '',
    grade: 'Maître de Conférences',
    specialite: '',
    bureau: '',
    laboratoireId: '',
    cvUrl: '',
    password: '',
    confirmPassword: ''
  });

  // Academic details
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

  // Laboratoires list
  const [laboratoires, setLaboratoires] = useState([]);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isSecretaire = hasRole('ROLE_SECRETAIRE') && !hasRole('ROLE_ADMIN') && !hasRole('ROLE_SUPER_ADMIN');
  const isProf = hasRole('ROLE_PROF') || (!hasRole('ROLE_ADMIN') && !hasRole('ROLE_SUPER_ADMIN') && !hasRole('ROLE_SECRETAIRE'));
  const showAcademicEditor = isProf || isEditingTargetTeacher;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        if (isEditingTargetTeacher) {
          const [ensRes, labsRes] = await Promise.all([
            axiosClient.get(`/api/public/enseignants/${targetTeacherId}`),
            axiosClient.get('/api/admin/laboratoires').catch(() => ({ data: [] }))
          ]);
          const data = ensRes.data;
          setLaboratoires(labsRes.data || []);
          
          setFormData({
            email: data.email || '',
            nom: data.nom || '',
            prenom: data.prenom || '',
            telephone: data.telephone || '',
            photo: data.photo || '',
            grade: data.grade || 'Maître de Conférences',
            specialite: data.specialite || '',
            bureau: data.bureau || '',
            laboratoireId: data.laboratoires?.[0]?.id || '',
            cvUrl: data.cvUrl || '',
            password: '',
            confirmPassword: ''
          });

          const parsedBio = parseTeacherBio(data.biographie);
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
        } else {
          const [meRes, labsRes] = await Promise.all([
            axiosClient.get('/api/me'),
            axiosClient.get('/api/admin/laboratoires').catch(() => ({ data: [] }))
          ]);
          const data = meRes.data;
          setLaboratoires(labsRes.data || []);
          
          setFormData({
            email: data.email || '',
            nom: data.nom || '',
            prenom: data.prenom || '',
            telephone: data.telephone || '',
            photo: data.photo || '',
            grade: data.grade || 'Maître de Conférences',
            specialite: data.specialite || '',
            bureau: data.bureau || '',
            laboratoireId: data.laboratoires?.[0]?.id || '',
            cvUrl: data.cvUrl || '',
            password: '',
            confirmPassword: ''
          });

          const parsedBio = parseTeacherBio(data.biographie);
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
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setToast({ type: 'error', message: 'Erreur lors du chargement des informations du profil.' });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [targetTeacherId]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formDataObj = new FormData();
    formDataObj.append('file', file);
    try {
      const response = await axiosClient.post('/api/upload', formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data && response.data.url) {
        setFormData(prev => ({ ...prev, photo: response.data.url }));
        setToast({ type: 'success', message: 'Photo de profil téléchargée avec succès.' });
      }
    } catch (error) {
      console.error('Upload error:', error);
      const msg = error.response?.data?.error || 'Erreur lors du téléchargement de la photo.';
      setToast({ type: 'error', message: msg });
    } finally {
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

  // Add Theme
  const handleAddTheme = () => {
    if (!newTheme.trim()) return;
    setThemesRecherche(prev => [...prev, newTheme.trim()]);
    setNewTheme('');
  };

  const handleRemoveTheme = (index) => {
    setThemesRecherche(prev => prev.filter((_, idx) => idx !== index));
  };

  // Add Enseignement
  const handleAddEnseignement = () => {
    if (!newEnseignement.trim()) return;
    setEnseignements(prev => [...prev, newEnseignement.trim()]);
    setNewEnseignement('');
  };

  const handleRemoveEnseignement = (index) => {
    setEnseignements(prev => prev.filter((_, idx) => idx !== index));
  };

  // Add Publication
  const handleAddPublication = () => {
    if (!newPub.titre.trim()) return;
    setPublications(prev => [...prev, { ...newPub }]);
    setNewPub({ titre: '', annee: '', revue: '', url: '' });
  };

  const handleRemovePublication = (index) => {
    setPublications(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

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
        photo: formData.photo,
        grade: formData.grade,
        specialite: formData.specialite,
        bureau: formData.bureau,
        laboratoireId: formData.laboratoireId || null,
        laboratoireIds: formData.laboratoireId ? [formData.laboratoireId] : [],
        cvUrl: formData.cvUrl,
        biographie: bioPayload,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      if (isEditingTargetTeacher) {
        if (isSecretaire) {
          await axiosClient.post('/api/secretaire/demandes', {
            typeEntite: 'Enseignant',
            action: 'UPDATE',
            entiteId: parseInt(targetTeacherId),
            donnees: payload
          });
          setToast({ type: 'success', message: `Demande de mise à jour du profil de ${formData.prenom} ${formData.nom} envoyée avec succès pour validation.` });
        } else {
          await axiosClient.put(`/api/admin/enseignants/${targetTeacherId}`, payload);
          setToast({ type: 'success', message: `Profil de ${formData.prenom} ${formData.nom} mis à jour et synchronisé avec succès !` });
        }
      } else {
        await axiosClient.put('/api/me', payload);
        setToast({ type: 'success', message: 'Profil et dossier académique mis à jour immédiatement avec succès !' });
      }

      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
    } catch (err) {
      console.error('Save error:', err);
      const msg = err.response?.data?.error || 'Erreur lors de la mise à jour du profil.';
      setToast({ type: 'error', message: msg });
    } finally {
      setSaving(false);
    }
  };

  // Construct preview data object for live preview
  const selectedLab = laboratoires.find(l => String(l.id) === String(formData.laboratoireId));
  const previewDataObject = {
    id: isEditingTargetTeacher ? parseInt(targetTeacherId) : (user?.id || 1),
    nom: formData.nom || 'Nom',
    prenom: formData.prenom || 'Prénom',
    email: formData.email,
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

  const quillModules = {
    toolbar: [
      [{ header: [2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['blockquote', 'link'],
      ['clean'],
    ],
  };

  if (loading) {
    return <div className={styles.loading}>Chargement du profil...</div>;
  }

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

      {/* Admin / Secretaire Context Banner */}
      {isEditingTargetTeacher && (
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '8px',
          padding: '14px 18px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <div style={{ fontWeight: '700', color: '#166534', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={18} /> Console {isSecretaire ? 'Secrétariat' : 'Administration'} — Édition Profil Enseignant
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#15803d' }}>
              Vous éditez le profil complet de : <strong>{formData.prenom} {formData.nom}</strong> ({formData.grade || 'Enseignant'})
            </p>
          </div>
          <Link to="/dashboard/enseignants" style={{ textDecoration: 'none' }}>
            <button type="button" className="btn btn-secondary" style={{ padding: '7px 14px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <ArrowLeft size={14} /> Retour à la liste des enseignants
            </button>
          </Link>
        </div>
      )}

      {/* Top Header with Mode Toggles & Save Button */}
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.headerTitle}>
            {isEditingTargetTeacher
              ? `Profil Académique — ${formData.prenom} ${formData.nom}`
              : (showAcademicEditor ? 'Espace Enseignant-Chercheur — Profil Académique' : 'Paramètres du Profil')}
          </h1>
          <p className={styles.headerSubtitle}>
            {showAcademicEditor 
              ? 'Rédigez la biographie, thèmes de recherche, enseignements, publications et coordonnées.' 
              : 'Gérez vos informations personnelles et identifiants.'}
          </p>
        </div>

        <div className={styles.topActions}>
          {showAcademicEditor && (
            <div style={{ display: 'flex', gap: 6 }}>
              <button 
                type="button" 
                className={`${styles.modeToggleBtn} ${activeMode === 'editor' ? styles.modeToggleBtnActive : ''}`}
                onClick={() => setActiveMode('editor')}
              >
                <Edit3 size={15} /> Mode Édition
              </button>
              <button 
                type="button" 
                className={`${styles.modeToggleBtn} ${activeMode === 'preview' ? styles.modeToggleBtnActive : ''}`}
                onClick={() => setActiveMode('preview')}
              >
                <ExternalLink size={15} /> Aperçu en Direct
              </button>
            </div>
          )}

          <button 
            type="button" 
            className={styles.saveBtnTop} 
            onClick={handleSubmit} 
            disabled={saving}
          >
            <Save size={16} /> {saving ? 'Enregistrement...' : (isEditingTargetTeacher && isSecretaire ? 'Soumettre pour validation' : 'Enregistrer le Profil')}
          </button>
        </div>
      </div>

      {/* LIVE PREVIEW MODE */}
      {activeMode === 'preview' && (
        <div>
          <div className={styles.previewBanner}>
            <span>
              <strong>Aperçu en direct :</strong> Voici exactement la page de profil détaillée que verront les étudiants et visiteurs sur le portail public.
            </span>
            <button 
              className={styles.modeToggleBtn}
              onClick={() => setActiveMode('editor')}
            >
              <Edit3 size={14} /> Revenir à l'édition
            </button>
          </div>
          <div style={{ marginTop: 20 }}>
            <TeacherDetailPage previewData={previewDataObject} />
          </div>
        </div>
      )}

      {/* EDITOR MODE */}
      {activeMode === 'editor' && (
        <form onSubmit={handleSubmit} className={styles.formGrid}>
          {/* =========================================================
              COLONNE DE GAUCHE : CONTENU ACADÉMIQUE
             ========================================================= */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Section 1 : Biographie & Présentation */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                <FileText size={18} className={styles.cardTitleIcon} />
                Biographie &amp; Présentation
              </h2>
              <p className={styles.hint}>
                Rédigez une présentation générale de votre parcours académique, vos expertises et activités scientifiques.
              </p>
              <div style={{ minHeight: 220, marginBottom: 40 }}>
                <ReactQuill 
                  theme="snow"
                  value={presentationHtml}
                  onChange={setPresentationHtml}
                  modules={quillModules}
                  placeholder="Décrivez votre parcours, vos distinctions, projets de recherche..."
                  style={{ height: 170 }}
                />
              </div>
            </div>

            {/* Section 2 : Thèmes de Recherche & Responsabilités */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                <Award size={18} className={styles.cardTitleIcon} />
                Thèmes de Recherche &amp; Direction de Thèses
              </h2>
              <p className={styles.hint}>
                Ajoutez les axes scientifiques majeurs, thèmes de recherche et responsabilités (direction de thèses, projets).
              </p>
              
              <div className={styles.dynamicInputRow}>
                <input 
                  type="text" 
                  className={styles.input} 
                  placeholder="ex: Vision par Ordinateur & Apprentissage Profond"
                  value={newTheme}
                  onChange={e => setNewTheme(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTheme(); } }}
                />
                <button type="button" onClick={handleAddTheme} className={styles.addListItemBtn}>
                  <Plus size={16} /> Ajouter
                </button>
              </div>

              {themesRecherche.length > 0 && (
                <div className={styles.itemsBadgeList}>
                  {themesRecherche.map((theme, idx) => (
                    <div key={idx} className={styles.itemBadgeRow}>
                      <span>{theme}</span>
                      <button type="button" onClick={() => handleRemoveTheme(idx)} className={styles.removeItemBtn} title="Supprimer">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 3 : Enseignements & Responsabilités Pédagogiques */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                <BookOpen size={18} className={styles.cardTitleIcon} />
                Enseignements &amp; Modules
              </h2>
              <p className={styles.hint}>
                Ajoutez les modules et cours que vous dispensez (avec filière et niveau).
              </p>
              
              <div className={styles.dynamicInputRow}>
                <input 
                  type="text" 
                  className={styles.input} 
                  placeholder="ex: Algorithmique Avancée & Graphes (Licence 3)"
                  value={newEnseignement}
                  onChange={e => setNewEnseignement(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddEnseignement(); } }}
                />
                <button type="button" onClick={handleAddEnseignement} className={styles.addListItemBtn}>
                  <Plus size={16} /> Ajouter
                </button>
              </div>

              {enseignements.length > 0 && (
                <div className={styles.itemsBadgeList}>
                  {enseignements.map((ens, idx) => (
                    <div key={idx} className={styles.itemBadgeRow}>
                      <span>{ens}</span>
                      <button type="button" onClick={() => handleRemoveEnseignement(idx)} className={styles.removeItemBtn} title="Supprimer">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 4 : Publications Scientifiques */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                <GraduationCap size={18} className={styles.cardTitleIcon} />
                Publications &amp; Travaux Scientifiques
              </h2>
              <p className={styles.hint}>
                Renseignez vos principaux articles de revues, actes de conférences et brevets.
              </p>

              <div className={styles.pubFormWrap}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Titre de la publication *</label>
                  <input 
                    type="text" 
                    className={styles.input} 
                    placeholder="ex: Deep Learning for Medical Image Segmentation"
                    value={newPub.titre}
                    onChange={e => setNewPub({ ...newPub, titre: e.target.value })}
                  />
                </div>

                <div className={styles.row}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>Année</label>
                    <input 
                      type="text" 
                      className={styles.input} 
                      placeholder="ex: 2024"
                      value={newPub.annee}
                      onChange={e => setNewPub({ ...newPub, annee: e.target.value })}
                    />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>Revue / Conférence</label>
                    <input 
                      type="text" 
                      className={styles.input} 
                      placeholder="ex: IEEE TPAMI, CVPR, NeurIPS..."
                      value={newPub.revue}
                      onChange={e => setNewPub({ ...newPub, revue: e.target.value })}
                    />
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Lien DOI / URL vers la publication</label>
                  <input 
                    type="url" 
                    className={styles.input} 
                    placeholder="ex: https://doi.org/10.1109/..."
                    value={newPub.url}
                    onChange={e => setNewPub({ ...newPub, url: e.target.value })}
                  />
                </div>

                <button type="button" onClick={handleAddPublication} className={styles.addListItemBtn} style={{ alignSelf: 'flex-start' }}>
                  <Plus size={16} /> Ajouter cette publication
                </button>
              </div>

              {publications.length > 0 && (
                <div className={styles.pubListWrap}>
                  {publications.map((pub, idx) => (
                    <div key={idx} className={styles.pubItemRow}>
                      <div className={styles.pubItemInfo}>
                        <div className={styles.pubItemTitle}>{pub.titre}</div>
                        <div className={styles.pubItemMeta}>
                          {pub.annee && <span><strong>Année :</strong> {pub.annee}</span>}
                          {pub.revue && <span><strong>Revue :</strong> {pub.revue}</span>}
                          {pub.url && <a href={pub.url} target="_blank" rel="noopener noreferrer" style={{ color: '#87452f' }}>[Lien DOI]</a>}
                        </div>
                      </div>
                      <button type="button" onClick={() => handleRemovePublication(idx)} className={styles.removeItemBtn} title="Supprimer">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 5 : Liens & Profils Scientifiques Externes */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                <Globe size={18} className={styles.cardTitleIcon} />
                Liens &amp; Profils Scientifiques
              </h2>

              <div className={styles.row}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Google Scholar</label>
                  <input 
                    type="url" 
                    className={styles.input} 
                    placeholder="https://scholar.google.com/citations?user=..."
                    value={liensAcademiques.googleScholar}
                    onChange={e => setLiensAcademiques({ ...liensAcademiques, googleScholar: e.target.value })}
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>ResearchGate</label>
                  <input 
                    type="url" 
                    className={styles.input} 
                    placeholder="https://www.researchgate.net/profile/..."
                    value={liensAcademiques.researchGate}
                    onChange={e => setLiensAcademiques({ ...liensAcademiques, researchGate: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>ORCID</label>
                  <input 
                    type="url" 
                    className={styles.input} 
                    placeholder="https://orcid.org/0000-000X-XXXX-XXXX"
                    value={liensAcademiques.orcid}
                    onChange={e => setLiensAcademiques({ ...liensAcademiques, orcid: e.target.value })}
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>DBLP</label>
                  <input 
                    type="url" 
                    className={styles.input} 
                    placeholder="https://dblp.org/pid/..."
                    value={liensAcademiques.dblp}
                    onChange={e => setLiensAcademiques({ ...liensAcademiques, dblp: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>LinkedIn</label>
                  <input 
                    type="url" 
                    className={styles.input} 
                    placeholder="https://linkedin.com/in/..."
                    value={liensAcademiques.linkedin}
                    onChange={e => setLiensAcademiques({ ...liensAcademiques, linkedin: e.target.value })}
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>GitHub / GitLab</label>
                  <input 
                    type="url" 
                    className={styles.input} 
                    placeholder="https://github.com/..."
                    value={liensAcademiques.github}
                    onChange={e => setLiensAcademiques({ ...liensAcademiques, github: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* =========================================================
              COLONNE DE DROITE : IDENTITÉ VISUELLE, CV & COORDONNÉES
             ========================================================= */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Portrait & CV */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                <User size={18} className={styles.cardTitleIcon} />
                Identité Visuelle &amp; CV
              </h2>

              <div className={styles.avatarSection}>
                <div className={styles.avatarWrap}>
                  {formData.photo ? (
                    <img src={formData.photo} alt="Profil" className={styles.avatarImg} />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      <span>{formData.prenom?.[0]}{formData.nom?.[0]}</span>
                    </div>
                  )}
                </div>

                <div className={styles.avatarActions}>
                  <label className={styles.btnSmall}>
                    <Camera size={14} style={{ marginRight: 6 }} />
                    Changer la photo
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
                  </label>
                  {formData.photo && (
                    <button 
                      type="button" 
                      className={styles.btnSmallDelete} 
                      onClick={() => setFormData(prev => ({ ...prev, photo: '' }))}
                    >
                      Retirer
                    </button>
                  )}
                </div>
              </div>

              {/* CV PDF Upload */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Curriculum Vitae (Format PDF)</label>
                
                {formData.cvUrl ? (
                  <div className={styles.cvStatusBox}>
                    <div className={styles.cvStatusText}>
                      <CheckCircle2 size={16} color="#16a34a" /> CV disponible en PDF
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <a href={formData.cvUrl} target="_blank" rel="noopener noreferrer" className={styles.cvTestLink}>
                        Consulter
                      </a>
                      <button 
                        type="button" 
                        onClick={() => setFormData(prev => ({ ...prev, cvUrl: '' }))}
                        className={styles.btnSmallDelete}
                        style={{ padding: '3px 8px', fontSize: 11 }}
                      >
                        Retirer
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className={styles.btnSmall} style={{ justifyContent: 'center' }}>
                    <Download size={15} style={{ marginRight: 6 }} />
                    {isUploadingCv ? 'Téléchargement du CV...' : 'Uploader mon CV (PDF)'}
                    <input 
                      type="file" 
                      accept=".pdf,application/pdf" 
                      style={{ display: 'none' }} 
                      onChange={handleCvUpload} 
                      disabled={isUploadingCv} 
                    />
                  </label>
                )}
                <input 
                  type="url" 
                  className={styles.input} 
                  style={{ marginTop: 6 }}
                  placeholder="Ou collez un lien URL direct vers votre CV (PDF)"
                  value={formData.cvUrl}
                  onChange={e => setFormData({ ...formData, cvUrl: e.target.value })}
                />
              </div>
            </div>

            {/* Identité & Grade */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                <GraduationCap size={18} className={styles.cardTitleIcon} />
                Grade &amp; Affiliations
              </h2>

              <div className={styles.row}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Prénom *</label>
                  <input 
                    type="text" 
                    className={styles.input} 
                    value={formData.prenom} 
                    onChange={e => setFormData({ ...formData, prenom: e.target.value })} 
                    placeholder="Votre prénom"
                    required
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Nom *</label>
                  <input 
                    type="text" 
                    className={styles.input} 
                    value={formData.nom} 
                    onChange={e => setFormData({ ...formData, nom: e.target.value })} 
                    placeholder="Votre nom"
                    required
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Grade Académique</label>
                <select 
                  className={styles.input} 
                  value={formData.grade} 
                  onChange={e => setFormData({ ...formData, grade: e.target.value })}
                >
                  <option value="Professeur de l'Enseignement Supérieur">Professeur de l'Enseignement Supérieur (PES)</option>
                  <option value="Professeur Habilité">Professeur Habilité (PH)</option>
                  <option value="Maître de Conférences">Maître de Conférences (MCF)</option>
                  <option value="Professeur Assistant">Professeur Assistant (PA)</option>
                  <option value="Vacataire">Vacataire / Chargé de cours</option>
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Spécialité / Domaine</label>
                <div className={styles.inputWithIcon}>
                  <Briefcase size={16} className={styles.fieldIcon} />
                  <input 
                    type="text" 
                    className={styles.input} 
                    value={formData.specialite} 
                    onChange={e => setFormData({ ...formData, specialite: e.target.value })} 
                    placeholder="ex: Intelligence Artificielle, Réseaux..."
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Laboratoire de Recherche affilié</label>
                <select 
                  className={styles.input} 
                  value={formData.laboratoireId} 
                  onChange={e => setFormData({ ...formData, laboratoireId: e.target.value })}
                >
                  <option value="">-- Aucun / Non affilié --</option>
                  {laboratoires.map(lab => (
                    <option key={lab.id} value={lab.id}>
                      {lab.acronyme ? `${lab.acronyme} — ` : ''}{lab.nom}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Coordonnées */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                <Building size={18} className={styles.cardTitleIcon} />
                Coordonnées Directes
              </h2>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Bureau / Emplacement</label>
                <div className={styles.inputWithIcon}>
                  <Building size={16} className={styles.fieldIcon} />
                  <input 
                    type="text" 
                    className={styles.input} 
                    value={formData.bureau} 
                    onChange={e => setFormData({ ...formData, bureau: e.target.value })} 
                    placeholder="ex: Bâtiment Informatique - Bureau B204"
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Téléphone Direct</label>
                <div className={styles.inputWithIcon}>
                  <Phone size={16} className={styles.fieldIcon} />
                  <input 
                    type="tel" 
                    className={styles.input} 
                    value={formData.telephone} 
                    onChange={e => setFormData({ ...formData, telephone: e.target.value })} 
                    placeholder="06 XX XX XX XX"
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Email Académique</label>
                <div className={styles.inputWithIcon}>
                  <Mail size={16} className={styles.fieldIcon} />
                  <input 
                    type="email" 
                    className={styles.input} 
                    value={formData.email} 
                    disabled 
                    style={{ background: '#f3f4f6', cursor: 'not-allowed' }}
                  />
                </div>
              </div>
            </div>

            {/* Sécurité & Mot de Passe */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                <ShieldCheck size={18} className={styles.cardTitleIcon} />
                Sécurité &amp; Mot de Passe
              </h2>
              <p className={styles.hint}>
                Laissez vide pour conserver le mot de passe actuel.
              </p>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Nouveau mot de passe</label>
                <div className={styles.inputWithIcon}>
                  <Lock size={16} className={styles.fieldIcon} />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    className={styles.input} 
                    value={formData.password} 
                    onChange={e => setFormData({ ...formData, password: e.target.value })} 
                    placeholder="Min 6 caractères"
                  />
                  <button 
                    type="button" 
                    className={styles.eyeBtn} 
                    onClick={() => setShowPassword(prev => !prev)}
                    title={showPassword ? "Masquer" : "Afficher"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Confirmer le mot de passe</label>
                <div className={styles.inputWithIcon}>
                  <Lock size={16} className={styles.fieldIcon} />
                  <input 
                    type={showConfirmPassword ? 'text' : 'password'} 
                    className={styles.input} 
                    value={formData.confirmPassword} 
                    onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} 
                    placeholder="Retapez pour confirmer"
                  />
                  <button 
                    type="button" 
                    className={styles.eyeBtn} 
                    onClick={() => setShowConfirmPassword(prev => !prev)}
                    title={showConfirmPassword ? "Masquer" : "Afficher"}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {formData.password && (
                <div className={styles.passwordValidation}>
                  <div className={formData.password.length >= 6 ? styles.valid : styles.invalid}>
                    <CheckCircle2 size={14} /> Au moins 6 caractères
                  </div>
                  <div className={formData.password === formData.confirmPassword && formData.confirmPassword ? styles.valid : styles.invalid}>
                    <CheckCircle2 size={14} /> Les mots de passe correspondent
                  </div>
                </div>
              )}

              <button type="submit" className={styles.saveBtnTop} style={{ width: '100%', justifyContent: 'center' }} disabled={saving}>
                <Save size={18} />
                {saving ? 'Enregistrement...' : 'Enregistrer mon profil'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProfilePage;