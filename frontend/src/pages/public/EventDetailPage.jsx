import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getActualiteBySlug } from '../../api/publicApi';
import { Calendar, Clock, MapPin, User, ArrowLeft, CalendarPlus, ChevronRight, ChevronLeft, FileText, ExternalLink } from 'lucide-react';

import styles from './EventDetailPage.module.css';

/* Parse contenu JSON or fallback to plain text */
const parseContenu = (contenu) => {
  if (!contenu) return { html: '', lieu: '', heureDebut: '', heureFin: '', intervenant: '', googleMapsUrl: '', programme: [], extrait: '', auteurNom: '', categorie: '', lienInscription: '', programmeIframe: '', lienProgramme: '', slidesUrls: [] };
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
      lienInscription: parsed.lienInscription || '',
      programmeIframe: parsed.programmeIframe || '',
      lienProgramme: parsed.lienProgramme || '',
      slidesUrls: parsed.slidesUrls || [],
    };
  } catch {
    return { html: contenu, lieu: '', heureDebut: '', heureFin: '', intervenant: '', googleMapsUrl: '', programme: [], extrait: '', auteurNom: '', categorie: '', lienInscription: '', programmeIframe: '', lienProgramme: '', slidesUrls: [] };
  }
};

const EventDetailPage = () => {
  const { id } = useParams();
  const slug = id;
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const data = await getActualiteBySlug(slug);
        setEvent(data);
      } catch (err) {
        console.error("Failed to fetch event details", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [slug]);

  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.errorState}>
            <h2>Événement introuvable</h2>
            <p>L'événement demandé n'existe pas ou n'est plus disponible.</p>
            <Link to="/evenements" className={styles.backLink}>
              <ArrowLeft size={16} />
              Retour à la liste des événements
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const parsed = parseContenu(event.contenu);
  const isEvent = event.type === 'EVENEMENT';

  // Format date
  const eventDate = event.dateEvenement
    ? new Date(event.dateEvenement)
    : (event.dateCreation ? new Date(event.dateCreation) : new Date());

  const dateFormatted = isNaN(eventDate.getTime()) 
    ? '' 
    : eventDate.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

  // Capitalize first letter
  const dateDisplay = dateFormatted ? dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1) : '';

  // Horaires
  const horaires = parsed.heureDebut && parsed.heureFin
    ? `${parsed.heureDebut} - ${parsed.heureFin}`
    : parsed.heureDebut || '';

  // Category label
  const categoryLabels = {
    COLLOQUE: 'Colloque Scientifique',
    CONFERENCE: 'Conférence',
    SEMINAIRE: 'Séminaire',
    WORKSHOP: 'Workshop',
    SOUTENANCE: 'Soutenance',
    JOURNEE_PORTES_OUVERTES: 'Journée Portes Ouvertes',
    AUTRE: 'Événement',
  };
  const categoryLabel = categoryLabels[parsed.categorie] || parsed.categorie || event.type;

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link to="/">Accueil</Link>
          <ChevronRight size={14} />
          <Link to="/evenements">Événements</Link>
          <ChevronRight size={14} />
          <span>{event.titre}</span>
        </nav>

        {/* Header Section */}
        <div className={styles.headerSection}>
          {/* Tags */}
          <div className={styles.tags}>
            {isEvent && parsed.categorie && (
              <span className={styles.tagPrimary}>{categoryLabel}</span>
            )}
            <span className={styles.tagTertiary}>
              {isEvent ? 'Ouvert au public' : event.type}
            </span>
          </div>

          {/* Title */}
          <h1 className={styles.title}>{event.titre}</h1>

          {/* Hero Image */}
          {event.imageCoverUrl && (
            <div className={styles.heroWrap}>
              <img
                src={event.imageCoverUrl}
                alt={event.titre}
                className={styles.heroImage}
              />
              <div className={styles.heroOverlay} />
            </div>
          )}
        </div>

        {/* Two Column Layout */}
        <div className={styles.grid}>

          {/* Main Content Column */}
          <div className={styles.mainColumn}>
            <div className={styles.contentCard}>
              {/* Rich HTML content */}
              {parsed.html ? (
                <div
                  className={styles.prose}
                  dangerouslySetInnerHTML={{ __html: parsed.html }}
                />
              ) : (
                <p className={styles.prose}>{event.contenu}</p>
              )}

              {/* Programme Section */}
              {isEvent && parsed.programmeIframe && (
                <div className={styles.programmeSection}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                    <h2 className={styles.programmeTitle} style={{ margin: 0 }}>Programme de l'événement</h2>
                    {!parsed.programmeIframe.includes('<iframe') && (
                      <a 
                        href={parsed.programmeIframe} 
                        target="_blank" 
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: '#87452f',
                          color: '#fff',
                          padding: '8px 14px',
                          textDecoration: 'none',
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: '12px',
                          textTransform: 'uppercase',
                          fontWeight: 500,
                          borderRadius: '2px'
                        }}
                      >
                        <ExternalLink size={14} />
                        Consulter / Télécharger le Programme
                      </a>
                    )}
                  </div>
                  <div className={styles.iframeWrapper}>
                    {parsed.programmeIframe.includes('<iframe') ? (
                      <div dangerouslySetInnerHTML={{ __html: parsed.programmeIframe }} />
                    ) : (
                      <iframe 
                        src={parsed.programmeIframe.includes('drive.google.com/file/d/') && !parsed.programmeIframe.includes('/preview')
                          ? parsed.programmeIframe.replace(/\/view(\?.*)?$/, '/preview')
                          : parsed.programmeIframe
                        }
                        width="100%"
                        height="450"
                        style={{ border: 'none', display: 'block' }}
                        title="Programme de l'événement"
                      />
                    )}
                  </div>
                </div>
              )}

              {isEvent && !parsed.programmeIframe && parsed.programme && parsed.programme.length > 0 && (
                <div className={styles.programmeSection}>
                  <h2 className={styles.programmeTitle}>Programme de l'événement</h2>
                  <div className={styles.programmeList}>
                    {parsed.programme.map((slot, idx) => (
                      <div className={styles.programmeItem} key={idx}>
                        <span className={styles.programmeTime}>{slot.time}</span>
                        <div className={styles.programmeContent}>
                          <h3 className={styles.programmeSlotTitle}>{slot.title}</h3>
                          {slot.description && (
                            <p className={styles.programmeDesc}>{slot.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gallery / Interactive Slideshow with Navigation Arrows */}
              {parsed.slidesUrls && parsed.slidesUrls.length > 0 && (
                <div className={styles.programmeSection}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h2 className={styles.programmeTitle} style={{ margin: 0 }}>Galerie Photos / Slides</h2>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', fontWeight: 600, color: '#87452f' }}>
                      Photo {Math.min(activeSlide, parsed.slidesUrls.length - 1) + 1} / {parsed.slidesUrls.length}
                    </span>
                  </div>

                  <div style={{ position: 'relative', width: '100%', background: '#191c1e', borderRadius: '4px', overflow: 'hidden', border: '1px solid #d9c2bb' }}>
                    {/* Main Slide Image */}
                    <div style={{ width: '100%', height: '440px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111' }}>
                      <img 
                        src={parsed.slidesUrls[Math.min(activeSlide, parsed.slidesUrls.length - 1)]} 
                        alt={`Slide ${activeSlide + 1}`} 
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                      />
                    </div>

                    {/* Left & Right Arrows */}
                    {parsed.slidesUrls.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() => setActiveSlide(prev => (prev > 0 ? prev - 1 : parsed.slidesUrls.length - 1))}
                          style={{
                            position: 'absolute',
                            left: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'rgba(0,0,0,0.65)',
                            color: '#fff',
                            border: '1px solid rgba(255,255,255,0.4)',
                            borderRadius: '50%',
                            width: '42px',
                            height: '42px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            zIndex: 10
                          }}
                          aria-label="Photo précédente"
                        >
                          <ChevronLeft size={24} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveSlide(prev => (prev < parsed.slidesUrls.length - 1 ? prev + 1 : 0))}
                          style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'rgba(0,0,0,0.65)',
                            color: '#fff',
                            border: '1px solid rgba(255,255,255,0.4)',
                            borderRadius: '50%',
                            width: '42px',
                            height: '42px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            zIndex: 10
                          }}
                          aria-label="Photo suivante"
                        >
                          <ChevronRight size={24} />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Thumbnail Row */}
                  {parsed.slidesUrls.length > 1 && (
                    <div style={{ display: 'flex', gap: '10px', marginTop: '12px', overflowX: 'auto', paddingBottom: '6px' }}>
                      {parsed.slidesUrls.map((url, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveSlide(idx)}
                          style={{
                            width: '74px',
                            height: '54px',
                            flexShrink: 0,
                            padding: 0,
                            border: idx === Math.min(activeSlide, parsed.slidesUrls.length - 1) ? '3px solid #87452f' : '1px solid #d9c2bb',
                            borderRadius: '3px',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            opacity: idx === Math.min(activeSlide, parsed.slidesUrls.length - 1) ? 1 : 0.6,
                            transition: 'all 0.2s'
                          }}
                        >
                          <img src={url} alt={`Thumb ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className={styles.sidebar}>
            {/* Practical Info */}
            <div className={styles.infoCard}>
              <h2 className={styles.infoTitle}>Informations Pratiques</h2>
              <div className={styles.infoList}>
                {/* Date */}
                <div className={styles.infoRow}>
                  <Calendar size={20} className={styles.infoIcon} />
                  <div>
                    <div className={styles.infoLabel}>Date</div>
                    <div className={styles.infoValue}>{dateDisplay}</div>
                  </div>
                </div>

                {/* Horaires */}
                {horaires && (
                  <div className={styles.infoRow}>
                    <Clock size={20} className={styles.infoIcon} />
                    <div>
                      <div className={styles.infoLabel}>Horaires</div>
                      <div className={styles.infoValue}>{horaires}</div>
                    </div>
                  </div>
                )}

                {/* Lieu */}
                {parsed.lieu && (
                  <div className={styles.infoRow}>
                    <MapPin size={20} className={styles.infoIcon} />
                    <div>
                      <div className={styles.infoLabel}>Lieu</div>
                      <div className={styles.infoValue}>{parsed.lieu}</div>
                    </div>
                  </div>
                )}

                {/* Intervenant */}
                {parsed.intervenant && (
                  <div className={styles.infoRow}>
                    <User size={20} className={styles.infoIcon} />
                    <div>
                      <div className={styles.infoLabel}>Intervenant Principal</div>
                      <div className={styles.infoValue}>{parsed.intervenant}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* CTA Buttons */}
              <div className={styles.ctaButtons}>
                {parsed.lienInscription ? (
                  <a href={parsed.lienInscription} target="_blank" rel="noreferrer" className={styles.ctaPrimary} style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                    S'inscrire à l'événement
                  </a>
                ) : (
                  <button className={styles.ctaPrimary} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                    S'inscrire à l'événement
                  </button>
                )}
              </div>
            </div>

            {/* Google Maps */}
            {parsed.googleMapsUrl && (
              <div className={styles.mapCard} style={{ maxWidth: '400px', height: '300px', border: '3px solid #d9c2bb', borderRadius: '8px', padding: '4px', background: '#fff' }}>
                {parsed.googleMapsUrl.includes('<iframe') ? (
                  <div 
                    dangerouslySetInnerHTML={{ __html: parsed.googleMapsUrl }}
                    className={styles.mapIframeWrap}
                    style={{ display: 'flex', width: '100%', height: '100%' }}
                  />
                ) : (
                  <iframe
                    src={parsed.googleMapsUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 'none', display: 'block' }}
                    allowFullScreen
                    loading="lazy"
                    title="Localisation de l'événement"
                  />
                )}
              </div>
            )}

            {/* Map placeholder if no URL */}
            {!parsed.googleMapsUrl && parsed.lieu && (
              <div className={styles.mapPlaceholder}>
                <MapPin size={32} className={styles.mapPlaceholderIcon} />
              </div>
            )}
          </aside>
        </div>

        {/* Back Link */}
        <div className={styles.backSection}>
          <Link to="/evenements" className={styles.backLink}>
            <ArrowLeft size={16} />
            Retour à la liste des événements
          </Link>
        </div>

      </div>
    </div>
  );
};

export default EventDetailPage;
