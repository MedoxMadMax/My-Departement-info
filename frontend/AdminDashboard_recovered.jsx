import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import {
  Plus, Trash2, Edit3, ArrowLeft, Save, ImageIcon,
  Calendar, Clock, MapPin, User, Link as LinkIcon,
  FileText, CalendarDays, Newspaper
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import './AdminDashboard.css';

/* ============================================
   HELPER: Parse "contenu" JSON or fallback
   We store structured metadata inside the contenu
   field as JSON to avoid backend schema changes.
   ============================================ */
const parseContenu = (contenu) => {
  if (!contenu) return { html: '', lieu: '', heureDebut: '', heureFin: '', intervenant: '', googleMapsUrl: '', programme: [], extrait: '', auteurNom: '', categorie: '' };
  try {
    const parsed = JSON.parse(contenu);
    return {
      html: parsed.html || '',
      lieu: parsed.lieu || '',
      heureDebut: parsed.heureDebut || '',
      heureFin: parsed.heureFin || '',
      intervenant: parsed.intervenant || '',
      googleMapsUrl: parsed.googleMapsUrl || '',
      programme: parsed.programme || [],
      extrait: parsed.extrait || '',
      auteurNom: parsed.auteurNom || '',
      categorie: parsed.categorie || '',
    };
  } catch {
    // Legacy plain text content
    return { html: contenu, lieu: '', heureDebut: '', heureFin: '', intervenant: '', googleMapsUrl: '', programme: [], extrait: '', auteurNom: '', categorie: '' };
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
  });
};

/* ============================================
   STATUS BADGE
   ============================================ */
const StatusBadge = ({ statut }) => {
  const s = (statut || '').toLowerCase().replace(/\s+/g, '_');
  const labels = {
    publiee: 'Publié',
    en_attente: 'En Attente',
    brouillon: 'Brouillon',
    refusee: 'Refusé',
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
});

/* ============================================
   MAIN COMPONENT
   ============================================ */
const AdminDashboard = () => {
  // Core state
  const [activeTab, setActiveTab] = useState('events');
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(getInitialFormData(true));

  // Notifications
  const [alert, setAlert] = useState(null);

  const showAlert = useCallback((type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  }, []);

  // ---- DATA FETCHING ----
  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axiosClient.get('/api/admin/actualites');
      setItems(res.data);
    } catch (err) {
      console.error('Fetch error:', err);
      showAlert('error', 'Erreur lors du chargement des données.');
    } finally {
      setIsLoading(false);
    }
  }, [showAlert]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // ---- FILTERED ITEMS ----
  const filteredItems = useMemo(() => {
    if (activeTab === 'events') {
      return items.filter((i) => i.type === 'EVENEMENT');
    }
    return items.filter((i) => i.type !== 'EVENEMENT');
  }, [items, activeTab]);

  const eventCount = useMemo(() => items.filter((i) => i.type === 'EVENEMENT').length, [items]);
  const newsCount = useMemo(() => items.filter((i) => i.type !== 'EVENEMENT').length, [items]);

  // ---- HANDLERS ----
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
  };

  const handleCreate = () => {
    const isEvent = activeTab === 'events';
    setFormData(getInitialFormData(isEvent));
    setEditingItem(null);
    setIsEditing(true);
  };

  const handleEdit = (item) => {
    const parsed = parseContenu(item.contenu);
    setFormData({
      titre: item.titre || '',
      type: item.type || 'EVENEMENT',
      statut: item.statut || 'Publiee',
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
    const payload = {
      titre: formData.titre,
      contenu: serializeContenu(formData),
      type: formData.type,
      statut: formData.statut,
      dateEvenement: formData.dateEvenement || null,
      imageCoverUrl: formData.imageCoverUrl || null,
    };

    try {
      if (editingItem) {
        await axiosClient.put(`/api/admin/actualites/${editingItem.id}`, payload);
        showAlert('success', 'Modifications enregistrées avec succès.');
      } else {
        await axiosClient.post('/api/admin/actualites', payload);
        showAlert('success', 'Nouvel élément créé avec succès.');
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

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.')) return;
    try {
      await axiosClient.delete(`/api/admin/actualites/${id}`);
      showAlert('success', 'Élément supprimé.');
      fetchItems();
    } catch (err) {
      console.error('Delete error:', err);
      showAlert('error', 'Erreur lors de la suppression.');
    }
  };

  // ---- FORM FIELD UPDATER ----
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
          <button className="admin-dash__save-btn" onClick={handleSave} disabled={isSaving}>
            <Save size={16} />
            {isSaving ? 'Enregistrement...' : "Enregistrer"}
          </button>
        </div>

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
                  <option value="Publiee">Publié</option>
                  <option value="En_Attente">Brouillon</option>
                  <option value="Refusee">Refusé</option>
                </select>
              </div>

              {/* Catégorie (Events) */}
              {isEvent && (
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
              <div className="admin-dash__image-preview">
                {formData.imageCoverUrl ? (
                  <>
                    <img src={formData.imageCoverUrl} alt="Couverture" onError={(e) => { e.target.style.display = 'none'; }} />
                    <div className="admin-dash__image-overlay">Cliquez pour modifier</div>
                  </>
                ) : (
                  <div className="admin-dash__image-placeholder">
                    <ImageIcon size={28} />
                    <span>Aucune image</span>
                  </div>
                )}
              </div>
              <div className="admin-dash__panel-field">
                <label className="admin-dash__panel-label">URL de l'image</label>
                <input
                  className="admin-dash__panel-input"
                  type="url"
                  placeholder="https://exemple.com/image.jpg"
                  value={formData.imageCoverUrl}
                  onChange={(e) => updateField('imageCoverUrl', e.target.value)}
                />
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
                    type="url"
                    placeholder="URL Google Maps Embed..."
                    value={formData.googleMapsUrl}
                    onChange={(e) => updateField('googleMapsUrl', e.target.value)}
                  />
                </div>
                {formData.googleMapsUrl && (
                  <div style={{ marginTop: 10, borderRadius: 6, overflow: 'hidden', border: '1px solid #E8E4DE' }}>
                    <iframe
                      src={formData.googleMapsUrl}
                      width="100%"
                      height="150"
                      style={{ border: 'none', display: 'block' }}
                      allowFullScreen
                      loading="lazy"
                      title="Map preview"
                    />
                  </div>
                )}
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
                {filteredItems.map((item) => {
                  const parsed = parseContenu(item.contenu);
                  return (
                    <tr key={item.id}>
                      <td className="admin-dash__td-title">{item.titre}</td>
                      <td>{parsed.categorie || '—'}</td>
                      <td>{item.dateEvenement ? new Date(item.dateEvenement).toLocaleDateString('fr-FR') : '—'}</td>
                      <td>{parsed.intervenant || '—'}</td>
                      <td><StatusBadge statut={item.statut} /></td>
                      <td>
                        <div className="admin-dash__actions">
                          <button className="admin-dash__action-btn" onClick={() => handleEdit(item)} title="Modifier">
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
                {filteredItems.map((item) => {
                  const parsed = parseContenu(item.contenu);
                  return (
                    <tr key={item.id}>
                      <td className="admin-dash__td-title">{item.titre}</td>
                      <td className="admin-dash__td-excerpt">{parsed.extrait || '—'}</td>
                      <td>{item.dateCreation ? new Date(item.dateCreation).toLocaleDateString('fr-FR') : '—'}</td>
                      <td><StatusBadge statut={item.statut} /></td>
                      <td>
                        <div className="admin-dash__actions">
                          <button className="admin-dash__action-btn" onClick={() => handleEdit(item)} title="Modifier">
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
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
