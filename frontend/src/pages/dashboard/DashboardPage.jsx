import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import axiosClient from '../../api/axiosClient';
import styles from './DashboardPage.module.css';

const DashboardPage = () => {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  const [recentLogs, setRecentLogs] = useState([]);
  const [stats, setStats] = useState({ enAttente: 0, valide: 0, refuse: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  const isProf = hasRole('ROLE_PROF') && !hasRole('ROLE_ADMIN') && !hasRole('ROLE_SUPER_ADMIN') && !hasRole('ROLE_SECRETAIRE');
  const isSec = hasRole('ROLE_SECRETAIRE') && !hasRole('ROLE_ADMIN') && !hasRole('ROLE_SUPER_ADMIN');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const endpoint = isSec ? '/api/secretaire/historique' : '/api/admin/historique';
        const { data } = await axiosClient.get(endpoint);
        setRecentLogs(data.slice(0, 5));
      } catch (error) {
        console.error("Erreur lors de la récupération de l'historique", error);
      }
    };

    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        const { data } = await axiosClient.get('/api/dashboard/stats');
        if (data && !data.isProf) {
          setStats({
            enAttente: data.enAttente || 0,
            valide: data.valide || 0,
            refuse: data.refuse || 0,
          });
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des statistiques", error);
      } finally {
        setLoadingStats(false);
      }
    };
    
    if (!isProf) {
      fetchLogs();
      fetchStats();
    }
  }, [hasRole, isProf, isSec]);

  const getDashboardRoleTitle = () => {
    if (hasRole('ROLE_SUPER_ADMIN')) return 'Tableau de Bord — Super Administrateur';
    if (hasRole('ROLE_ADMIN')) return 'Tableau de Bord — Administrateur';
    if (hasRole('ROLE_SECRETAIRE')) return 'Tableau de Bord — Secrétariat';
    if (isProf) return 'Tableau de Bord — Espace Enseignant';
    return 'Tableau de Bord';
  };

  const getDashboardSubtitle = () => {
    const name = user?.prenom ? `${user.prenom} ${user.nom}` : (user?.email || '');
    if (isSec) return `Bienvenue ${name}. Suivez vos demandes de validation en direct et gérez vos propositions d'événements.`;
    if (isProf) return `Bienvenue ${name}. Consultez les informations pédagogiques et actualités du département.`;
    return `Bienvenue ${name}. Vue d'ensemble du département et suivi des validations.`;
  };

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1 className={styles.title}>{getDashboardRoleTitle()}</h1>
        <p className={styles.subtitle}>{getDashboardSubtitle()}</p>
      </header>

      {/* Realistic Validation Stats Cards (Hidden for Enseignant) */}
      {!isProf && (
        <div className={styles.statsGrid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', marginBottom: '32px' }}>
          <Card>
            <StatCard 
              number={loadingStats ? '...' : stats.enAttente} 
              label="EN ATTENTE DE VALIDATION" 
              highlight 
              color="var(--color-primary)" 
            />
          </Card>
          <Card>
            <StatCard 
              number={loadingStats ? '...' : stats.valide} 
              label="VALIDÉ" 
              color="#16a34a" 
            />
          </Card>
          <Card>
            <StatCard 
              number={loadingStats ? '...' : stats.refuse} 
              label="REFUSÉ" 
              color="#dc2626" 
            />
          </Card>
        </div>
      )}

      <div className={styles.contentGrid}>
        <Card className={styles.activityCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              {isProf ? 'Informations Récentes' : 'Activité Récente'}
            </h2>
          </div>
          <div className={styles.cardBody}>
            {recentLogs.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentLogs.map((log) => (
                  <li key={log.id} style={{ borderBottom: '1px solid var(--color-outline-variant)', paddingBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '14px', color: 'var(--color-primary)' }}>{log.action}</strong>
                      <span style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)' }}>
                        {log.date ? (() => { 
                          const parts = log.date.split(" "); 
                          const d = parts[0].split("-"); 
                          return `${d[2]}/${d[1]}/${d[0]} ${parts[1]||""}`.trim();
                        })() : log.date}
                      </span>
                    </div>
                    <div style={{ fontSize: '14px' }}>
                      {log.utilisateur} a effectué cette action sur <span style={{ fontWeight: 'bold' }}>{log.entite}</span>.
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '14px' }}>
                {isProf 
                  ? 'Bienvenue dans votre espace enseignant. Vous pouvez modifier votre dossier académique à tout moment depuis « Mon Profil ».' 
                  : 'Aucune activité récente enregistrée.'}
              </p>
            )}
          </div>
        </Card>

        <Card className={styles.quickActionsCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Actions Rapides</h2>
          </div>
          <div className={styles.cardBody}>
            <ul className={styles.actionList}>
              {hasRole('ROLE_SUPER_ADMIN') && (
                <>
                  <li>
                    <button onClick={() => navigate('/dashboard/validation')}>+ Gérer les validations ({stats.enAttente})</button>
                  </li>
                  <li>
                    <button onClick={() => navigate('/dashboard/actualites')}>+ Créer un événement</button>
                  </li>
                  <li>
                    <button onClick={() => navigate('/dashboard/utilisateurs')}>+ Ajouter un utilisateur</button>
                  </li>
                </>
              )}
              {isSec && (
                <>
                  <li>
                    <button onClick={() => navigate('/dashboard/actualites')}>+ Proposer un événement</button>
                  </li>
                  <li>
                    <button onClick={() => navigate('/dashboard/enseignants')}>+ Proposer un enseignant</button>
                  </li>
                  <li>
                    <button onClick={() => navigate('/dashboard/filieres')}>+ Proposer une filière</button>
                  </li>
                </>
              )}
              {isProf && (
                <>
                  <li>
                    <button onClick={() => navigate('/dashboard/profil')}>+ Éditer mon dossier académique</button>
                  </li>
                  <li>
                    <button onClick={() => navigate('/equipe')}>+ Voir l'équipe pédagogique</button>
                  </li>
                  <li>
                    <button onClick={() => navigate('/formations')}>+ Consulter les filières</button>
                  </li>
                </>
              )}
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;