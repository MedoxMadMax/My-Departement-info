import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Mail, Phone, MapPin, Building, GraduationCap,
  Download, ExternalLink, BookOpen, User, Award, CheckCircle2,
  FileText, Globe, Share2, Copy, Check, Edit3
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import axiosClient, { getImageUrl } from '../../api/axiosClient';
import Loader from '../../components/common/Loader';
import { parseTeacherBio } from '../../utils/academicProfileHelper';
import styles from './TeacherDetailPage.module.css';

const TeacherDetailPage = ({ previewData = null }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasRole, isAuthenticated } = useAuth();
  const [teacher, setTeacher] = useState(previewData);
  const [loading, setLoading] = useState(!previewData);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (previewData) {
      setTeacher(previewData);
      setLoading(false);
      return;
    }

    const fetchTeacher = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get(`/api/public/enseignants/${id}`);
        setTeacher(res.data);
      } catch (err) {
        console.error('Error fetching teacher detail:', err);
        setError('Enseignant introuvable ou profil non disponible.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTeacher();
    }
  }, [id, previewData]);

  const handleCopyEmail = (email) => {
    if (!email) return;
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) return <Loader center />;

  if (error || !teacher) {
    return (
      <div className={styles.errorContainer}>
        <div className="container">
          <h2>Profil Enseignant</h2>
          <p>{error || "Impossible de charger le profil de l'enseignant."}</p>
          <Link to="/equipe" className={styles.backBtn}>
            <ArrowLeft size={16} /> Retour à l'équipe pédagogique
          </Link>
        </div>
      </div>
    );
  }

  const bio = parseTeacherBio(teacher.biographie);
  const mainLab = teacher.laboratoires?.[0];

  const isOwner = user && (user.id === teacher.id || user.email === teacher.email);
  const canEdit = isAuthenticated && (isOwner || hasRole('ROLE_ADMIN') || hasRole('ROLE_SUPER_ADMIN') || hasRole('ROLE_SECRETAIRE'));
  const editUrl = isOwner ? '/dashboard/profil' : `/dashboard/profil?id=${teacher.id}`;

  return (
    <div className={styles.page}>
      {/* Breadcrumb & Top Bar */}
      <div className={styles.topNav}>
        <div className="container">
          <div className={styles.breadcrumbWrap} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <Link to="/equipe" className={styles.backLink}>
                <ArrowLeft size={16} /> Retour à l'équipe pédagogique
              </Link>
              <span className={styles.breadcrumbSep}>/</span>
              <span className={styles.breadcrumbCurrent}>
                {teacher.prenom} {teacher.nom}
              </span>
            </div>

            {canEdit && !previewData && (
              <Link to={editUrl} style={{ textDecoration: 'none' }}>
                <button 
                  type="button" 
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: 'var(--color-primary-container)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 14px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                  }}
                >
                  <Edit3 size={14} /> Éditer ce profil
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="container">
        <div className={styles.layoutGrid}>
          {/* =========================================================
              COLONNE DE GAUCHE : CONTENU ACADÉMIQUE
             ========================================================= */}
          <main className={styles.academicColumn}>
            {/* Header Académique Card */}
            <div className={styles.academicHeaderCard}>
              <div className={styles.gradeBadgeWrap}>
                <span className={styles.gradeBadge}>
                  <GraduationCap size={14} />
                  {teacher.grade || "Enseignant-Chercheur"}
                </span>
                {teacher.specialite && (
                  <span className={styles.specialiteBadge}>
                    {teacher.specialite}
                  </span>
                )}
              </div>

              <h1 className={styles.fullName}>
                {teacher.prenom} {teacher.nom}
              </h1>

              {/* Affiliations */}
              <div className={styles.affiliationsBlock}>
                <div className={styles.affiliationItem}>
                  <strong>Département :</strong> Informatique — Faculté des Sciences
                </div>
                {mainLab && (
                  <div className={styles.affiliationItem}>
                    <strong>Laboratoire de Recherche :</strong> {mainLab.acronyme ? `${mainLab.acronyme} — ` : ''}{mainLab.nom}
                  </div>
                )}
              </div>
            </div>

            {/* Section 1 : Biographie & Présentation */}
            {bio.presentationHtml && (
              <section className={styles.contentSection}>
                <div className={styles.sectionHeader}>
                  <User size={20} className={styles.sectionIcon} />
                  <h2 className={styles.sectionTitle}>Biographie &amp; Présentation</h2>
                </div>
                <div 
                  className={styles.bioText}
                  dangerouslySetInnerHTML={{ __html: bio.presentationHtml }}
                />
              </section>
            )}

            {/* Section 2 : Thèmes de Recherche & Responsabilités */}
            {bio.themesRecherche && bio.themesRecherche.length > 0 && (
              <section className={styles.contentSection}>
                <div className={styles.sectionHeader}>
                  <Award size={20} className={styles.sectionIcon} />
                  <h2 className={styles.sectionTitle}>Recherche &amp; Thèmes Scientifiques</h2>
                </div>
                <ul className={styles.themesList}>
                  {bio.themesRecherche.map((theme, idx) => (
                    <li key={idx} className={styles.themeItem}>
                      <CheckCircle2 size={16} className={styles.bulletIcon} />
                      <span>{theme}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Section 3 : Enseignements & Responsabilités Pédagogiques */}
            {bio.enseignements && bio.enseignements.length > 0 && (
              <section className={styles.contentSection}>
                <div className={styles.sectionHeader}>
                  <BookOpen size={20} className={styles.sectionIcon} />
                  <h2 className={styles.sectionTitle}>Enseignements &amp; Modules</h2>
                </div>
                <div className={styles.enseignementsGrid}>
                  {bio.enseignements.map((ens, idx) => (
                    <div key={idx} className={styles.enseignementCard}>
                      <GraduationCap size={16} className={styles.ensCardIcon} />
                      <span>{ens}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Section 4 : Publications Scientifiques */}
            {bio.publications && bio.publications.length > 0 && (
              <section className={styles.contentSection}>
                <div className={styles.sectionHeader}>
                  <FileText size={20} className={styles.sectionIcon} />
                  <h2 className={styles.sectionTitle}>Publications &amp; Travaux Scientifiques</h2>
                </div>
                <div className={styles.publicationsList}>
                  {bio.publications.map((pub, idx) => (
                    <div key={idx} className={styles.pubCard}>
                      <div className={styles.pubHeader}>
                        {pub.annee && <span className={styles.pubYear}>{pub.annee}</span>}
                        {pub.revue && <span className={styles.pubVenue}>{pub.revue}</span>}
                      </div>
                      <h3 className={styles.pubTitle}>{pub.titre}</h3>
                      {pub.url && (
                        <a 
                          href={pub.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className={styles.pubLink}
                        >
                          Consulter la publication <ExternalLink size={13} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </main>

          {/* =========================================================
              COLONNE DE DROITE : IDENTITÉ VISUELLE & COORDONNÉES
             ========================================================= */}
          <aside className={styles.sidebarColumn}>
            {/* Portrait Grand Format */}
            <div className={styles.portraitCard}>
              <div className={styles.photoContainer}>
                {teacher.photo ? (
                  <img 
                    src={getImageUrl(teacher.photo)} 
                    alt={`${teacher.prenom} ${teacher.nom}`} 
                    className={styles.portraitImg}
                  />
                ) : (
                  <div className={styles.portraitPlaceholder}>
                    <span>{teacher.prenom?.[0]}{teacher.nom?.[0]}</span>
                  </div>
                )}
              </div>

              {/* Bouton d'Action : Télécharger le CV (PDF) */}
              {teacher.cvUrl ? (
                <a 
                  href={getImageUrl(teacher.cvUrl)} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={styles.cvDownloadBtn}
                  title="Télécharger le Curriculum Vitae en format PDF"
                >
                  <Download size={18} /> Télécharger le CV (PDF)
                </a>
              ) : (
                <div className={styles.cvUnavailable}>
                  <FileText size={16} /> CV non disponible
                </div>
              )}
            </div>

            {/* Coordonnées Directes */}
            <div className={styles.contactCard}>
              <h3 className={styles.cardTitle}>Coordonnées Directes</h3>
              
              <div className={styles.contactList}>
                {/* Email */}
                {teacher.email && (
                  <div className={styles.contactItem}>
                    <div className={styles.contactIconWrap}>
                      <Mail size={16} />
                    </div>
                    <div className={styles.contactTextWrap}>
                      <span className={styles.contactLabel}>E-mail Académique</span>
                      <a href={`mailto:${teacher.email}`} className={styles.contactLink}>
                        {teacher.email}
                      </a>
                    </div>
                    <button 
                      onClick={() => handleCopyEmail(teacher.email)} 
                      className={styles.copyBtn}
                      title="Copier l'adresse e-mail"
                    >
                      {copied ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                    </button>
                  </div>
                )}

                {/* Bureau */}
                {teacher.bureau && (
                  <div className={styles.contactItem}>
                    <div className={styles.contactIconWrap}>
                      <Building size={16} />
                    </div>
                    <div className={styles.contactTextWrap}>
                      <span className={styles.contactLabel}>Bureau sur le Campus</span>
                      <span className={styles.contactValue}>{teacher.bureau}</span>
                    </div>
                  </div>
                )}

                {/* Téléphone */}
                {teacher.telephone && (
                  <div className={styles.contactItem}>
                    <div className={styles.contactIconWrap}>
                      <Phone size={16} />
                    </div>
                    <div className={styles.contactTextWrap}>
                      <span className={styles.contactLabel}>Téléphone direct</span>
                      <a href={`tel:${teacher.telephone}`} className={styles.contactLink}>
                        {teacher.telephone}
                      </a>
                    </div>
                  </div>
                )}

                {/* Adresse postale */}
                <div className={styles.contactItem}>
                  <div className={styles.contactIconWrap}>
                    <MapPin size={16} />
                  </div>
                  <div className={styles.contactTextWrap}>
                    <span className={styles.contactLabel}>Adresse Postale</span>
                    <span className={styles.contactValue}>
                      Département d'Informatique<br />
                      Faculté des Sciences, BP 717, 60000 Oujda
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profils & Liens Scientifiques */}
            {bio.liensAcademiques && Object.values(bio.liensAcademiques).some(Boolean) && (
              <div className={styles.linksCard}>
                <h3 className={styles.cardTitle}>Profils Scientifiques</h3>
                <div className={styles.academicLinksList}>
                  {bio.liensAcademiques.googleScholar && (
                    <a 
                      href={bio.liensAcademiques.googleScholar} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className={styles.academicLinkBtn}
                    >
                      <Globe size={16} /> Google Scholar
                    </a>
                  )}
                  {bio.liensAcademiques.researchGate && (
                    <a 
                      href={bio.liensAcademiques.researchGate} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className={styles.academicLinkBtn}
                    >
                      <Globe size={16} /> ResearchGate
                    </a>
                  )}
                  {bio.liensAcademiques.orcid && (
                    <a 
                      href={bio.liensAcademiques.orcid} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className={styles.academicLinkBtn}
                    >
                      <Award size={16} /> ORCID
                    </a>
                  )}
                  {bio.liensAcademiques.dblp && (
                    <a 
                      href={bio.liensAcademiques.dblp} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className={styles.academicLinkBtn}
                    >
                      <BookOpen size={16} /> DBLP
                    </a>
                  )}
                  {bio.liensAcademiques.linkedin && (
                    <a 
                      href={bio.liensAcademiques.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className={styles.academicLinkBtn}
                    >
                      <ExternalLink size={16} /> LinkedIn
                    </a>
                  )}
                  {bio.liensAcademiques.github && (
                    <a 
                      href={bio.liensAcademiques.github} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className={styles.academicLinkBtn}
                    >
                      <ExternalLink size={16} /> GitHub
                    </a>
                  )}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default TeacherDetailPage;
