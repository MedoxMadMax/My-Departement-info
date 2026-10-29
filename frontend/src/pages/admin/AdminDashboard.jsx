import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ReactQuill, { Quill } from 'react-quill-new';
import BlotFormatter from '@enzedonline/quill-blot-formatter2';
Quill.register('modules/blotFormatter', BlotFormatter);
import 'react-quill-new/dist/quill.snow.css';
import {
  Plus, Trash2, Edit3, ArrowLeft, Save, ImageIcon,
  Calendar, Clock, MapPin, User, Link as LinkIcon,
  FileText, CalendarDays, Newspaper, Eye, ChevronLeft, ChevronRight, Upload, ExternalLink
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import useAuth from '../../hooks/useAuth';
import ConfirmModal from '../../components/common/ConfirmModal';
import Pagination from '../../components/common/Pagination';
import './AdminDashboard.css';

/* ============================================
   HELPER: Parse "contenu" JSON or fallback
   We store structured metadata inside the contenu
   field as JSON to avoid backend schema changes.
   ============================================ */
const parseContenu = (contenu) => {
  if (!contenu) return { html: '', lieu: '', heureDebut: '', heureFin: '', intervenant: '', googleMapsUrl: '', programme: [], extrait: '', auteurNom: '', categorie: '', slidesUrls: [], lienInscription: '', programmeIframe: '', lienProgramme: '' };
  try {
    const parsed = JSON.parse(contenu);
    let mapUrl = parsed.googleMapsUrl || '';
    if (mapUrl.includes('<iframe')) {
      const match = mapUrl.match(/src="([^"]+)"/);
      if (match) mapUrl = match[1];
    }
    // Fix HTML entities in the URL like &#39; which break the URL parameters
    mapUrl = mapUrl.replace(/&#39;/g, "'").replace(/&amp;/g, "&").replace(/&quot;/g, '"');
    
    return {
      html: parsed.html || '',
      lieu: parsed.lieu || '',
      heureDebut: parsed.heureDebut || '',
      heureFin: parsed.heureFin || '',
      intervenant: parsed.intervenant || '',
      googleMapsUrl: mapUrl,
      programme: parsed.programme || [],
      extrait: parsed.extrait || '',
      auteurNom: parsed.auteurNom || '',
      categorie: parsed.categorie || '',
      slidesUrls: parsed.slidesUrls || [],
      lienInscription: parsed.lienInscription || '',
      programmeIframe: parsed.programmeIframe || '',
      lienProgramme: parsed.lienProgramme || '',
    };
  } catch {
    return { html: contenu, lieu: '', heureDebut: '', heureFin: '', intervenant: '', googleMapsUrl: '', programme: [], extrait: '', auteurNom: '', categorie: '', slidesUrls: [], lienInscription: '', programmeIframe: '', lienProgramme: '' };
  }
};

const serializeContenu = (formData) => {
  return JSON.stringify({
    html: formData.body,
    lieu: formData.lieu,
    heureDebut: formData.heureDebut,
    heureFin: formData.heureFin,
    intervenant: formData.intervenant,
    googleMapsUrl: formData.googleMapsUrl,
    programme: formData.programme,
    extrait: formData.extrait,
    auteurNom: formData.auteurNom,
    categorie: formData.categorie,
    slidesUrls: formData.slidesUrls,
    lienInscription: formData.lienInscription,
    programmeIframe: formData.programmeIframe,
      lienProgramme: formData.lienProgramme,
  });
};

/* ============================================
   STATUS BADGE
   ============================================ */
const StatusBadge = ({ statut }) => {
  const s = (statut || '').toLowerCase().replace(/\s+/g, '_');
  const labels = {
    publiee: 'Publié',
    publie: 'Publié',
    en_attente: 'En Attente',
    brouillon: 'Brouillon',
    refusee: 'Refusé (Brouillon)',
    refuse: 'Refusé (Brouillon)',
  };
  return (
    <span className={`admin-dash__badge admin-dash__badge--${s}`}>
      {labels[s] || statut}
    </span>
  );
};

/* ============================================
   QUILL TOOLBAR CONFIG
   ============================================ */
const QUILL_MODULES = {
  blotFormatter: {},
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline'],
    ['link', 'image', 'video'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['code-block'],
    ['clean'],
  ],
};

const QUILL_FORMATS = [
  'header', 'bold', 'italic', 'underline',
  'link', 'image', 'video',
  'list', 'code-block',
];

/* ============================================
   INITIAL FORM DATA
   ============================================ */
const getInitialFormData = (isEvent) => ({
  titre: '',
  type: isEvent ? 'EVENEMENT' : 'Actualite',
  statut: 'Publiee',
  imageCoverUrl: '',
  dateEvenement: '',
  heureDebut: '',
  heureFin: '',
  lieu: '',
  intervenant: '',
  googleMapsUrl: '',
  body: '',
  programme: [],
  extrait: '',
  auteurNom: '',
  categorie: isEvent ? 'COLLOQUE' : '',
    slidesUrls: [],
    lienInscription: '',
    programmeIframe: '',
    lienProgramme: '',
});

/* ============================================
   MAIN COMPONENT
   ============================================ */
const AdminDashboard = () => {
  const { hasRole } = useAuth();
  const isSecretaire = hasRole('ROLE_SECRETAIRE') && !hasRole('ROLE_ADMIN') && !hasRole('ROLE_SUPER_ADMIN');
  const apiPrefix = isSecretaire ? '/api/secretaire/actualites' : '/api/admin/actualites';
  const apiUpload = isSecretaire ? '/api/secretaire/upload' : '/api/admin/upload';
  // Core state
  const [activeTab, setActiveTab] = useState('events');
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(getInitialFormData(true));
  const [adminSlideIdx, setAdminSlideIdx] = useState(0);
  const [isUploadingProgramme, setIsUploadingProgramme] = useState(false);
  const [isUploadingSlides, setIsUploadingSlides] = useState(false);

  // Modal states
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, title: '' });
  const [isDeleting, setIsDeleting] = useState(false);

  // Notifications
  const [alert, setAlert] = useState(null);

  const showAlert = useCallback((type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  }, []);  // ---- DATA FETCHING ----
  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axiosClient.get(apiPrefix);
      setItems(res.data);
    } catch (err) {
      console.error('Fetch error:', err);
      showAlert('error', 'Erreur lors du chargement des données.');
    } finally {
      setIsLoading(false);
    }
  }, [apiPrefix, showAlert]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // ---- PAGINATION & FILTERED ITEMS ----
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const filteredItems = useMemo(() => {
    if (activeTab === 'events') {
      return items.filter((i) => i.type === 'EVENEMENT');
    }
    return items.filter((i) => i.type !== 'EVENEMENT');
  }, [items, activeTab]);

  const paginatedItems = useMemo(() => {
    return filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [filteredItems, currentPage, pageSize]);

  const eventCount = useMemo(() => items.filter((i) => i.type === 'EVENEMENT').length, [items]);
  const newsCount = useMemo(() => items.filter((i) => i.type !== 'EVENEMENT').length, [items]);

  // ---- HANDLERS ----
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleCreate = () => {
    const isEvent = activeTab === 'events';
    const initial = getInitialFormData(isEvent);
    initial.statut = isSecretaire ? 'Brouillon' : 'Publiee';
    setFormData(initial);
    setEditingItem(null);
    setIsEditing(true);
  };

  const handleEdit = (item) => {
    const parsed = parseContenu(item.contenu);
    setFormData({
      titre: item.titre || '',
      type: item.type || 'EVENEMENT',
      statut: item.statut || (isSecretaire ? 'Brouillon' : 'Publiee'),
      imageCoverUrl: item.imageCoverUrl || '',
      dateEvenement: item.dateEvenement ? item.dateEvenement.split('T')[0] : '',
      heureDebut: parsed.heureDebut || '',
      heureFin: parsed.heureFin || '',
      lieu: parsed.lieu || '',
      intervenant: parsed.intervenant || '',
      googleMapsUrl: parsed.googleMapsUrl || '',
      body: parsed.html || '',
      programme: parsed.programme || [],
      extrait: parsed.extrait || '',
      auteurNom: parsed.auteurNom || '',
      categorie: parsed.categorie || '',
      slidesUrls: parsed.slidesUrls || [],
      lienInscription: parsed.lienInscription || '',
      programmeIframe: parsed.programmeIframe || '',
      lienProgramme: parsed.lienProgramme || '',
    });
    setEditingItem(item);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingItem(null);
  };

  const handleSave = async () => {
    if (!formData.titre.trim()) {
      showAlert('error', 'Le titre est obligatoire.');
      return;
    }

    setIsSaving(true);
    const targetStatut = isSecretaire 
      ? (formData.statut === 'Brouillon' ? 'Brouillon' : 'En_Attente') 
      : formData.statut;

    const payload = {
      titre: formData.titre,
      contenu: serializeContenu(formData),
      type: formData.type,
      statut: targetStatut,
      dateEvenement: formData.dateEvenement || null,
      imageCoverUrl: formData.imageCoverUrl || null,
    };

    try {
      if (editingItem) {
        await axiosClient.put(`${apiPrefix}/${editingItem.id}`, payload);
        if (isSecretaire) {
          if (formData.statut === 'Brouillon') {
            showAlert('success', 'Brouillon enregistré avec succès (non soumis à l\'administrateur).');
          } else {
            showAlert('success', 'Demande de publication soumise avec succès à l\'administrateur.');
          }
        } else {
          showAlert('success', 'Modifications enregistrées avec succès.');
        }
      } else {
        await axiosClient.post(apiPrefix, payload);
        if (isSecretaire) {
          if (formData.statut === 'Brouillon') {
            showAlert('success', 'Brouillon créé avec succès (non soumis à l\'administrateur).');
          } else {
            showAlert('success', 'Demande de publication envoyée à l\'administrateur.');
          }
        } else {
          showAlert('success', 'Nouvel élément créé avec succès.');
        }
      }
      setIsEditing(false);
      setEditingItem(null);
      fetchItems();
    } catch (err) {
      console.error('Save error:', err);
      showAlert('error', 'Erreur lors de l\'enregistrement.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id, title = '') => {
    setDeleteModal({ isOpen: true, id, title: title || "cet élément" });
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    setIsDeleting(true);
    try {
      await axiosClient.delete(`${apiPrefix}/${deleteModal.id}`);
      showAlert('success', 'Élément supprimé avec succès.');
      setDeleteModal({ isOpen: false, id: null, title: '' });
      fetchItems();
    } catch (err) {
      console.error('Delete error:', err);
      showAlert('error', 'Erreur lors de la suppression.');
    } finally {
      setIsDeleting(false);
    }
  };

  // ---- FORM FIELD UPDATER ----

  const handlePhotoUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    const formDataObj = new FormData();
    formDataObj.append('file', file);
    try {
      const response = await axiosClient.post(apiUpload, formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data && response.data.url) {
        updateField(field, response.data.url);
      }
    } catch (error) {
      console.error('Upload error:', error);
      showAlert('error', 'Erreur lors du tǸlǸchargement de l\'image.');
    }
  };

  const updateField = (field, value) => {

    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ---- PROGRAMME MANAGEMENT ----
  const addProgrammeSlot = () => {
    setFormData((prev) => ({
      ...prev,
      programme: [...prev.programme, { time: '', title: '', description: '' }],
    }));
  };

  const updateProgrammeSlot = (idx, field, value) => {
    setFormData((prev) => ({
      ...prev,
      programme: prev.programme.map((slot, i) =>
        i === idx ? { ...slot, [field]: value } : slot
      ),
    }));
  };

  const removeProgrammeSlot = (idx) => {
    setFormData((prev) => ({
      ...prev,
      programme: prev.programme.filter((_, i) => i !== idx),
    }));
  };

  // ============================================
  //   RENDER: EDITOR VIEW
  // ============================================
  if (isEditing) {
    const isEvent = formData.type === 'EVENEMENT';
    const pageTitle = editingItem
      ? isEvent ? "Modifier l'événement" : "Modifier l'actualité"
      : isEvent ? "Créer un événement" : "Créer une actualité";

    return (
      <div className="admin-dash">
        {alert && (
          <div className={`admin-dash__alert admin-dash__alert--${alert.type}`}>
            {alert.message}
          </div>
        )}

        {/* Editor Header */}
        <div className="admin-dash__editor-header">
          <div className="admin-dash__editor-header-left">
            <button className="admin-dash__back-btn" onClick={handleCancel} title="Retour à la liste">
              <ArrowLeft size={20} />
            </button>
            <h1 className="admin-dash__editor-page-title">{pageTitle}</h1>
          </div>
                      <button className="admin-dash__save-btn" onClick={() => {
              const previewData = {
                titre: formData.titre,
                type: formData.type,
                dateEvenement: formData.dateEvenement,
                imageCoverUrl: formData.imageCoverUrl,
                contenu: serializeContenu(formData)
              };
              localStorage.setItem('eventPreview', JSON.stringify(previewData));
              window.open(`/evenements/${editingItem ? editingItem.id : 'new'}/preview`, '_blank');
            }} type="button" style={{ background: '#2D8A70', marginRight: '10px' }}>
              <Eye size={16} /> Prévisualiser
            </button>
            <button className="admin-dash__save-btn" onClick={handleSave} disabled={isSaving}>
              <Save size={16} />
              {isSaving 
                ? 'Enregistrement...' 
                : isSecretaire 
                  ? (formData.statut === 'Brouillon' ? 'Enregistrer en Brouillon' : 'Soumettre pour Publication')
                  : 'Enregistrer'}
            </button>
        </div>

        {editingItem && editingItem.motifRefus && (
          <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderLeft: '4px solid #e11d48', padding: '14px 18px', margin: '0 24px 20px 24px', borderRadius: '4px', color: '#9f1239' }}>
            <strong style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>⚠️ Cet élément a été refusé par l'administrateur avec le motif suivant :</strong>
            <p style={{ margin: '0 0 6px 0', fontSize: '13px', fontStyle: 'italic', fontWeight: '500' }}>« {editingItem.motifRefus} »</p>
            <span style={{ fontSize: '12px', color: '#881337' }}>
              Vos données précédentes sont entièrement conservées ci-dessous. Vous pouvez corriger le contenu et cliquer sur <strong>Enregistrer</strong> pour soumettre à nouveau l'élément à la validation.
            </span>
          </div>
        )}

        {/* Editor Body: Two columns */}
        <div className="admin-dash__editor-body">
          {/* LEFT – Main Content */}
          <div className="admin-dash__editor-main">
            {/* Title */}
            <div className="admin-dash__field-group">
              <label className="admin-dash__label">
                {isEvent ? "Titre de l'événement" : "Titre de l'article"}
              </label>
              <input
                className="admin-dash__input"
                type="text"
                placeholder={isEvent ? "Symposium International sur l'IA..." : "Titre de l'actualité..."}
                value={formData.titre}
                onChange={(e) => updateField('titre', e.target.value)}
              />
            </div>

            {/* News: Extrait */}
            {!isEvent && (
              <div className="admin-dash__field-group">
                <label className="admin-dash__label">Extrait (résumé court)</label>
                <textarea
                  className="admin-dash__textarea"
                  placeholder="Un court résumé de l'article..."
                  value={formData.extrait}
                  onChange={(e) => updateField('extrait', e.target.value)}
                  rows={3}
                />
              </div>
            )}

            {/* WYSIWYG Editor */}
            <div className="admin-dash__field-group">
              <label className="admin-dash__label">
                {isEvent ? 'Contenu Principal' : "Corps de l'article"}
              </label>
              <div className="admin-dash__quill-wrapper">
                <ReactQuill
                  theme="snow"
                  value={formData.body}
                  onChange={(val) => updateField('body', val)}
                  modules={QUILL_MODULES}
                  formats={QUILL_FORMATS}
                  placeholder={isEvent
                    ? "Décrivez l'événement, les thématiques abordées..."
                    : "Rédigez le contenu de votre article..."
                  }
                />
              </div>
            </div>

            {/* Programme section (Events only) */}
            {isEvent && (
              <div className="admin-dash__programme">
                <div className="admin-dash__programme-header">
                  <h3 className="admin-dash__programme-title">
                    Programme du Colloque
                  </h3>
                  <button className="admin-dash__programme-add" onClick={addProgrammeSlot}>
                    <Plus size={14} /> Ajouter un créneau
                  </button>
                </div>

                <div className="admin-dash__programme-list">
                  {formData.programme.length === 0 ? (
                    <div className="admin-dash__programme-empty">
                      <CalendarDays size={20} style={{ marginBottom: 6, opacity: 0.5 }} />
                      <div>Aucun créneau ajouté. Cliquez sur "Ajouter un créneau" pour commencer.</div>
                    </div>
                  ) : (
                    formData.programme.map((slot, idx) => (
                      <div className="admin-dash__programme-item" key={idx}>
                        <div className="admin-dash__programme-time">
                          <input
                            type="text"
                            placeholder="09:00 – 10:30"
                            value={slot.time}
                            onChange={(e) => updateProgrammeSlot(idx, 'time', e.target.value)}
                          />
                        </div>
                        <div className="admin-dash__programme-content">
                          <input
                            type="text"
                            placeholder="Titre de la session"
                            value={slot.title}
                            onChange={(e) => updateProgrammeSlot(idx, 'title', e.target.value)}
                          />
                          <textarea
                            placeholder="Description de la session..."
                            value={slot.description}
                            onChange={(e) => updateProgrammeSlot(idx, 'description', e.target.value)}
                          />
                        </div>
                        <button className="admin-dash__programme-delete" onClick={() => removeProgrammeSlot(idx)} title="Supprimer">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT – Sidebar Panels */}
          <div className="admin-dash__editor-sidebar">
            {/* Parameters Panel */}
            <div className="admin-dash__panel">
              <h3 className="admin-dash__panel-title">
                {isEvent ? "Paramètres de l'événement" : "Paramètres de l'article"}
              </h3>

              {/* Statut */}
              <div className="admin-dash__panel-field">
                <label className="admin-dash__panel-label">Statut</label>
                <select
                  className="admin-dash__select"
                  value={formData.statut}
                  onChange={(e) => updateField('statut', e.target.value)}
                >
                  {isSecretaire ? (
                    <>
                      <option value="Brouillon">Brouillon (Non soumis, préparation privée)</option>
                      <option value="Publiee">Soumettre pour publication (En attente validation)</option>
                      {formData.statut === 'Refusee' && <option value="Refusee" disabled>Refusé (Brouillon à corriger)</option>}
                    </>
                  ) : (
                    <>
                      <option value="Publiee">Publié (En ligne)</option>
                      <option value="Brouillon">Brouillon (Hors ligne)</option>
                      <option value="En_Attente">En Attente de Validation</option>
                      {formData.statut === 'Refusee' && <option value="Refusee">Refusé</option>}
                    </>
                  )}
                </select>
              </div>

              {/* Catégorie (Events) */}
              {isEvent && (
                <>
<div className="admin-dash__panel-field">
                  <label className="admin-dash__panel-label">Catégorie</label>
                  <select
                    className="admin-dash__select"
                    value={formData.categorie}
                    onChange={(e) => updateField('categorie', e.target.value)}
                  >
                    <option value="COLLOQUE">Colloque</option>
                    <option value="CONFERENCE">Conférence</option>
                    <option value="SEMINAIRE">Séminaire</option>
                    <option value="WORKSHOP">Workshop</option>
                    <option value="SOUTENANCE">Soutenance</option>
                    <option value="JOURNEE_PORTES_OUVERTES">Journée Portes Ouvertes</option>
                    <option value="AUTRE">Autre</option>
                  </select>
                </div>
                  <div className="admin-dash__panel-field">
                    <label className="admin-dash__panel-label">Lien d'inscription (ex: Google Form)</label>
                    <input 
                      className="admin-dash__panel-input" 
                      type="url" 
                      placeholder="https://forms.gle/..."
                      value={formData.lienInscription} 
                      onChange={(e) => updateField('lienInscription', e.target.value)} 
                    />
                  </div>

                  {/* Programme Section with Google Drive / Upload support */}
                  <div className="admin-dash__panel-field">
                    <label className="admin-dash__panel-label">Programme de l'événement (Lien Google Drive, PDF ou code &lt;iframe&gt;)</label>
                    <input 
                      className="admin-dash__panel-input" 
                      type="text" 
                      placeholder="Collez l'URL Google Drive, un code <iframe> ou uploadez un PDF..." 
                      value={formData.programmeIframe} 
                      onChange={(e) => {
                        let val = e.target.value;
                        if (val.includes('drive.google.com/file/d/') && val.includes('/view')) {
                          val = val.replace(/\/view(\?usp=sharing|\?.*)?$/, '/preview');
                        }
                        updateField('programmeIframe', val);
                      }} 
                    />
                    <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                      <label style={{ background: '#227d72', color: '#fff', padding: '7px 12px', borderRadius: '4px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500 }}>
                        <Upload size={14} />
                        {isUploadingProgramme ? 'Téléchargement...' : 'Uploader un fichier Programme (PDF / Image)'}
                        <input 
                          type="file" 
                          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" 
                          style={{ display: 'none' }} 
                          disabled={isUploadingProgramme}
                          onChange={async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            setIsUploadingProgramme(true);
                            const formDataObj = new FormData();
                            formDataObj.append('file', file);
                            try {
                              const response = await axiosClient.post(apiUpload, formDataObj, { headers: { 'Content-Type': 'multipart/form-data' } });
                              if (response.data && response.data.url) {
                                updateField('programmeIframe', response.data.url);
                                showAlert('success', 'Fichier du programme uploadé avec succès.');
                              }
                            } catch (err) {
                              console.error('Upload programme error:', err);
                              showAlert('error', 'Erreur lors du téléchargement du fichier programme.');
                            } finally {
                              setIsUploadingProgramme(false);
                              e.target.value = '';
                            }
                          }} 
                        />
                      </label>
                      {formData.programmeIframe && (
                        <button 
                          type="button" 
                          onClick={() => updateField('programmeIframe', '')}
                          style={{ background: '#e74c3c', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                        >
                          Retirer le programme
                        </button>
                      )}
                    </div>

                    {/* Live preview of programme in admin dashboard */}
                    {formData.programmeIframe && (
                      <div style={{ marginTop: '10px', border: '1px solid #d9c2bb', borderRadius: '4px', overflow: 'hidden', background: '#f8f9fa', padding: '8px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#53433e', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <FileText size={14} /> Aperçu du Programme :
                        </div>
                        {formData.programmeIframe.includes('<iframe') ? (
                          <div dangerouslySetInnerHTML={{ __html: formData.programmeIframe }} style={{ width: '100%', maxHeight: '250px', overflow: 'hidden' }} />
                        ) : (
                          <iframe 
                            src={formData.programmeIframe.includes('drive.google.com/file/d/') && !formData.programmeIframe.includes('/preview') 
                              ? formData.programmeIframe.replace(/\/view(\?.*)?$/, '/preview')
                              : formData.programmeIframe
                            } 
                            width="100%" 
                            height="200" 
                            style={{ border: 'none', borderRadius: '4px' }} 
                            title="Aperçu Programme"
                          />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Slides Section with Interactive Preview & Left/Right Arrows */}
                  <div className="admin-dash__panel-field">
                    <label className="admin-dash__panel-label">
                      Galerie Photos / Slides ({(formData.slidesUrls || []).length} photos)
                    </label>
                    
                    {formData.slidesUrls && formData.slidesUrls.length > 0 && (
                      <div style={{ marginBottom: '12px', border: '1px solid #d9c2bb', borderRadius: '6px', overflow: 'hidden', background: '#191c1e' }}>
                        {/* Interactive Carousel Preview */}
                        <div style={{ position: 'relative', width: '100%', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111' }}>
                          <img 
                            src={formData.slidesUrls[Math.min(adminSlideIdx, formData.slidesUrls.length - 1)]} 
                            alt={`Slide ${adminSlideIdx + 1}`} 
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                          />
                          
                          {/* Navigation Arrows */}
                          {formData.slidesUrls.length > 1 && (
                            <>
                              <button 
                                type="button" 
                                onClick={() => setAdminSlideIdx(prev => (prev > 0 ? prev - 1 : formData.slidesUrls.length - 1))}
                                style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.65)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2 }}
                                title="Photo précédente"
                              >
                                <ChevronLeft size={18} />
                              </button>
                              <button 
                                type="button" 
                                onClick={() => setAdminSlideIdx(prev => (prev < formData.slidesUrls.length - 1 ? prev + 1 : 0))}
                                style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.65)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2 }}
                                title="Photo suivante"
                              >
                                <ChevronRight size={18} />
                              </button>
                            </>
                          )}

                          {/* Counter Badge */}
                          <div style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.75)', color: '#fff', fontSize: '11px', padding: '3px 8px', borderRadius: '4px', fontFamily: 'JetBrains Mono, monospace' }}>
                            {Math.min(adminSlideIdx, formData.slidesUrls.length - 1) + 1} / {formData.slidesUrls.length}
                          </div>
                        </div>

                        {/* Thumbnail Strip with Delete */}
                        <div style={{ display: 'flex', gap: '8px', padding: '8px', overflowX: 'auto', background: '#f8f9fa' }}>
                          {formData.slidesUrls.map((url, i) => (
                            <div 
                              key={i} 
                              onClick={() => setAdminSlideIdx(i)}
                              style={{ 
                                position: 'relative', 
                                width: '56px', 
                                height: '56px', 
                                flexShrink: 0, 
                                cursor: 'pointer',
                                border: i === Math.min(adminSlideIdx, formData.slidesUrls.length - 1) ? '2px solid #87452f' : '1px solid #ddd',
                                borderRadius: '4px',
                                overflow: 'hidden'
                              }}
                            >
                              <img src={url} alt={`Thumb ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              <button 
                                type="button" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const newUrls = formData.slidesUrls.filter((_, index) => index !== i);
                                  updateField('slidesUrls', newUrls);
                                  if (adminSlideIdx >= newUrls.length) setAdminSlideIdx(Math.max(0, newUrls.length - 1));
                                }} 
                                style={{ position: 'absolute', top: 1, right: 1, background: '#e74c3c', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}
                                title="Supprimer cette photo"
                              >
                                X
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <label className="admin-dash__save-btn" style={{ background: '#2B2E33', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 15px', color: '#fff', fontSize: '14px', borderRadius: '4px' }}>
                      <ImageIcon size={16} />
                      {isUploadingSlides ? 'Téléchargement...' : 'Ajouter des photos aux slides'}
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        style={{ display: 'none' }} 
                        disabled={isUploadingSlides}
                        onChange={async (e) => {
                          const files = Array.from(e.target.files || []);
                          if (files.length === 0) return;
                          setIsUploadingSlides(true);
                          try {
                            const uploadedUrls = [];
                            for (const file of files) {
                              const formDataObj = new FormData();
                              formDataObj.append('file', file);
                              const response = await axiosClient.post(apiUpload, formDataObj, { headers: { 'Content-Type': 'multipart/form-data' } });
                              if (response.data && response.data.url) {
                                uploadedUrls.push(response.data.url);
                              }
                            }
                            if (uploadedUrls.length > 0) {
                              updateField('slidesUrls', [...(formData.slidesUrls || []), ...uploadedUrls]);
                              showAlert('success', `${uploadedUrls.length} photo(s) ajoutée(s) aux slides.`);
                            }
                          } catch (error) {
                            console.error('Upload slides error:', error);
                            showAlert('error', 'Erreur lors du téléchargement des photos.');
                          } finally {
                            setIsUploadingSlides(false);
                            e.target.value = '';
                          }
                        }} 
                      />
                    </label>
                  </div>
              </>
              )}

              {/* News: Auteur */}
              {!isEvent && (
                <div className="admin-dash__panel-field">
                  <label className="admin-dash__panel-label">Auteur</label>
                  <input
                    className="admin-dash__panel-input"
                    type="text"
                    placeholder="Nom de l'auteur"
                    value={formData.auteurNom}
                    onChange={(e) => updateField('auteurNom', e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Informations Pratiques (Events) */}
            {isEvent && (
              <div className="admin-dash__panel">
                <h3 className="admin-dash__panel-title">Informations Pratiques</h3>

                <div className="admin-dash__panel-field">
                  <label className="admin-dash__panel-label">Date</label>
                  <input
                    className="admin-dash__panel-input"
                    type="date"
                    value={formData.dateEvenement}
                    onChange={(e) => updateField('dateEvenement', e.target.value)}
                  />
                </div>

                <div className="admin-dash__row">
                  <div className="admin-dash__panel-field">
                    <label className="admin-dash__panel-label">Début</label>
                    <input
                      className="admin-dash__panel-input"
                      type="time"
                      value={formData.heureDebut}
                      onChange={(e) => updateField('heureDebut', e.target.value)}
                    />
                  </div>
                  <div className="admin-dash__panel-field">
                    <label className="admin-dash__panel-label">Fin</label>
                    <input
                      className="admin-dash__panel-input"
                      type="time"
                      value={formData.heureFin}
                      onChange={(e) => updateField('heureFin', e.target.value)}
                    />
                  </div>
                </div>

                <div className="admin-dash__panel-field">
                  <label className="admin-dash__panel-label">Lieu</label>
                  <input
                    className="admin-dash__panel-input"
                    type="text"
                    placeholder="Amphi Turing, Bâtiment Turing"
                    value={formData.lieu}
                    onChange={(e) => updateField('lieu', e.target.value)}
                  />
                </div>

                <div className="admin-dash__panel-field">
                  <label className="admin-dash__panel-label">Conférencier Principal</label>
                  <input
                    className="admin-dash__panel-input"
                    type="text"
                    placeholder="Pr. Marie Curie II"
                    value={formData.intervenant}
                    onChange={(e) => updateField('intervenant', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* News: Date */}
            {!isEvent && (
              <div className="admin-dash__panel">
                <h3 className="admin-dash__panel-title">Publication</h3>
                <div className="admin-dash__panel-field">
                  <label className="admin-dash__panel-label">Date de publication</label>
                  <input
                    className="admin-dash__panel-input"
                    type="date"
                    value={formData.dateEvenement}
                    onChange={(e) => updateField('dateEvenement', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Image de Couverture */}
                          <div className="admin-dash__panel">
                <h3 className="admin-dash__panel-title">Image de Couverture</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {formData.imageCoverUrl && (
                    <div style={{ position: 'relative', width: '100%', maxHeight: '200px', overflow: 'hidden', borderRadius: '4px' }}>
                      <img src={formData.imageCoverUrl} alt="Couverture" style={{ width: '100%', height: 'auto', display: 'block' }} />
                      <button type="button" onClick={() => updateField('imageCoverUrl', '')} style={{ position: 'absolute', top: '10px', right: '10px', background: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Retirer la photo</button>
                    </div>
                  )}
                  <input
                    className="admin-dash__panel-input"
                    type="url"
                    placeholder="URL de l'image (https://exemple.com/image.jpg)"
                    value={formData.imageCoverUrl}
                    onChange={(e) => updateField('imageCoverUrl', e.target.value)}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label className="admin-dash__save-btn" style={{ background: '#2B2E33', cursor: 'pointer', display: 'inline-block', padding: '10px 15px', color: '#fff', fontSize: '14px', borderRadius: '4px' }}>
                      <ImageIcon size={16} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                      Uploader une image
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handlePhotoUpload(e, 'imageCoverUrl')} />
                    </label>
                  </div>
                </div>
              </div>

            {/* Localisation (Events) */}
            {isEvent && (
              <div className="admin-dash__panel">
                <h3 className="admin-dash__panel-title">Localisation</h3>
                                  <div className="admin-dash__panel-field">
                    <label className="admin-dash__panel-label">URL Google Maps Embed</label>
                    <input
                      className="admin-dash__panel-input"
                      type="text"
                      placeholder="Collez ici l'URL ou le code <iframe> complet..."
                      value={formData.googleMapsUrl}
                      onChange={(e) => {
                          const val = e.target.value;
                          const srcMatch = val.match(/src="([^"]+)"/);
                          let url = (srcMatch && srcMatch[1]) ? srcMatch[1] : val;
                          url = url.replace(/&#39;/g, "'").replace(/&amp;/g, "&").replace(/&quot;/g, '"');
                          updateField('googleMapsUrl', url);
                        }}
                    />
                    {formData.googleMapsUrl && (
                      <div style={{ marginTop: '10px', borderRadius: '4px', overflow: 'hidden', border: '1px solid #eee' }}>
                        <iframe src={formData.googleMapsUrl} width="100%" height="250" style={{ border: 0 }} allowFullScreen loading="lazy"></iframe>
                      </div>
                    )}
                  </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  //   RENDER: LIST VIEW
  // ============================================
  return (
    <div className="admin-dash">
      {alert && (
        <div className={`admin-dash__alert admin-dash__alert--${alert.type}`}>
          {alert.message}
        </div>
      )}

      {/* Header */}
      <div className="admin-dash__header">
        <h1 className="admin-dash__title">
          Espace <span className="admin-dash__title-accent">Administration</span>
        </h1>
        <button className="admin-dash__add-btn" onClick={handleCreate}>
          <Plus size={16} />
          {activeTab === 'events' ? 'Nouvel Événement' : 'Nouvelle Actualité'}
        </button>
      </div>

      {/* Tabs */}
      <div className="admin-dash__tabs">
        <button
          className={`admin-dash__tab ${activeTab === 'events' ? 'admin-dash__tab--active' : ''}`}
          onClick={() => handleTabSwitch('events')}
        >
          <CalendarDays size={16} className="admin-dash__tab-icon" />
          Événements
          <span className="admin-dash__tab-count">{eventCount}</span>
        </button>
        <button
          className={`admin-dash__tab ${activeTab === 'news' ? 'admin-dash__tab--active' : ''}`}
          onClick={() => handleTabSwitch('news')}
        >
          <Newspaper size={16} className="admin-dash__tab-icon" />
          Actualités
          <span className="admin-dash__tab-count">{newsCount}</span>
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="admin-dash__loading">
          <div className="admin-dash__spinner" />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="admin-dash__empty">
          <div className="admin-dash__empty-icon">
            {activeTab === 'events' ? <CalendarDays size={28} /> : <Newspaper size={28} />}
          </div>
          <div className="admin-dash__empty-text">
            {activeTab === 'events' ? "Aucun événement" : "Aucune actualité"}
          </div>
          <div className="admin-dash__empty-sub">
            Cliquez sur le bouton ci-dessus pour en créer un{activeTab === 'news' ? 'e' : ''}.
          </div>
        </div>
      ) : (
        <div className="admin-dash__table-wrap">
          {activeTab === 'events' ? (
            /* Events Table */
            <table className="admin-dash__table">
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Catégorie</th>
                  <th>Date</th>
                  <th>Intervenant</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((item) => {
                  const parsed = parseContenu(item.contenu);
                  return (
                    <tr key={item.id}>
                      <td className="admin-dash__td-title">
                        <div>{item.titre}</div>
                        {item.motifRefus && (
                          <div style={{ fontSize: '11px', color: '#991b1b', marginTop: '4px', background: '#fee2e2', padding: '2px 8px', borderRadius: '3px', display: 'inline-block' }}>
                            <strong>Motif refus :</strong> {item.motifRefus}
                          </div>
                        )}
                      </td>
                      <td>{parsed.categorie || '—'}</td>
                      <td>{item.dateEvenement ? new Date(item.dateEvenement).toLocaleDateString('fr-FR') : '—'}</td>
                      <td>{parsed.intervenant || '—'}</td>
                      <td><StatusBadge statut={item.statut} /></td>
                      <td>
                        <div className="admin-dash__actions">
                          <button className="admin-dash__action-btn" onClick={() => handleEdit(item)} title="Modifier / Corriger">
                            <Edit3 size={15} />
                          </button>
                          <button className="admin-dash__action-btn admin-dash__action-btn--delete" onClick={() => handleDelete(item.id)} title="Supprimer">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            /* News Table */
            <table className="admin-dash__table">
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Extrait</th>
                  <th>Date de Publication</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((item) => {
                  const parsed = parseContenu(item.contenu);
                  return (
                    <tr key={item.id}>
                      <td className="admin-dash__td-title">
                        <div>{item.titre}</div>
                        {item.motifRefus && (
                          <div style={{ fontSize: '11px', color: '#991b1b', marginTop: '4px', background: '#fee2e2', padding: '2px 8px', borderRadius: '3px', display: 'inline-block' }}>
                            <strong>Motif refus :</strong> {item.motifRefus}
                          </div>
                        )}
                      </td>
                      <td className="admin-dash__td-excerpt">{parsed.extrait || '—'}</td>
                      <td>{item.dateCreation ? new Date(item.dateCreation).toLocaleDateString('fr-FR') : '—'}</td>
                      <td><StatusBadge statut={item.statut} /></td>
                      <td>
                        <div className="admin-dash__actions">
                          <button className="admin-dash__action-btn" onClick={() => handleEdit(item)} title="Modifier / Corriger">
                            <Edit3 size={15} />
                          </button>
                          <button className="admin-dash__action-btn admin-dash__action-btn--delete" onClick={() => handleDelete(item.id)} title="Supprimer">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          <Pagination
            currentPage={currentPage}
            totalItems={filteredItems.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Modern Pop-up Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title={activeTab === 'events' ? "Supprimer l'événement" : "Supprimer l'actualité"}
        message={`Êtes-vous sûr de vouloir supprimer ${deleteModal.title ? `« ${deleteModal.title} »` : "cet élément"} ? Cette action est irréversible.`}
        confirmText="Supprimer définitivement"
        cancelText="Annuler"
        type="danger"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, id: null, title: '' })}
      />
    </div>
  );
};

export default AdminDashboard;
