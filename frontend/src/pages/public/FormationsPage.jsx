import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFilieres } from '../../api/publicApi';
import Loader from '../../components/common/Loader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import styles from './FormationsPage.module.css';

const FormationsPage = () => {
  const [filieres, setFilieres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');

  useEffect(() => {
    const fetchFilieres = async () => {
      try {
        const data = await getFilieres();
        setFilieres(data);
      } catch (error) {
        console.error("Failed to fetch filieres", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFilieres();
  }, []);

  if (loading) return <Loader center />;

  const licenceProgrammes = filieres.filter(f => f.type === 'Licence');
  const masterProgrammes = filieres.filter(f => f.type === 'Master');

  return (
    <div className={styles.page}>
      
      {/* Header */}
      <section className={styles.header}>
        <div className="container">
          <div className={styles.headerContent}>
            <h1 className={styles.title}>PROGRAMMES<br />D'ÉTUDES</h1>
            <p className={styles.subtitle}>
              Découvrez nos cursus d'excellence en informatique, conçus pour 
              répondre aux défis technologiques de demain.
            </p>
          </div>
        </div>
      </section>

      {/* Level Filters */}
      <div className={styles.filtersWrapper}>
        <div className={`container ${styles.filters}`}>
          <button 
            className={`${styles.filterBtn} ${activeFilter === 'ALL' ? styles.active : ''}`}
            onClick={() => setActiveFilter('ALL')}
          >
            TOUS LES NIVEAUX
          </button>
          <button 
            className={`${styles.filterBtn} ${activeFilter === 'LICENCE' ? styles.active : ''}`}
            onClick={() => setActiveFilter('LICENCE')}
          >
            LICENCE (BAC+3)
          </button>
          <button 
            className={`${styles.filterBtn} ${activeFilter === 'MASTER' ? styles.active : ''}`}
            onClick={() => setActiveFilter('MASTER')}
          >
            MASTER (BAC+5)
          </button>
        </div>
      </div>

      {/* Programmes List */}
      <section className="section">
        <div className="container">
          
          {(activeFilter === 'ALL' || activeFilter === 'LICENCE') && (
            <>
              <h2 className={styles.sectionTitle}>LICENCES</h2>
              <div className={styles.grid}>
                {licenceProgrammes.map(prog => (
                  <ProgramCard key={prog.id} program={prog} />
                ))}
                {licenceProgrammes.length === 0 && (
                  <p className="text-gray-500">Aucune licence disponible pour le moment.</p>
                )}
              </div>
            </>
          )}

          {(activeFilter === 'ALL' || activeFilter === 'MASTER') && (
            <>
              <h2 className={styles.sectionTitle} style={{ marginTop: activeFilter === 'ALL' ? 'var(--space-2xl)' : '0' }}>MASTERS</h2>
              <div className={styles.grid}>
                {masterProgrammes.map(prog => (
                  <ProgramCard key={prog.id} program={prog} />
                ))}
                {masterProgrammes.length === 0 && (
                  <p className="text-gray-500">Aucun master disponible pour le moment.</p>
                )}
              </div>
            </>
          )}

        </div>
      </section>

    </div>
  );
};

const ProgramCard = ({ program }) => {
  const duration = program.duree ? `${program.duree} ans` : (program.type === 'Licence' ? '3 ans' : '2 ans');

  return (
    <Card className={styles.card} hoverable>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>{program.nom}</h3>
        <span className={styles.badge}>{program.type}</span>
      </div>
      <p className={styles.cardDesc}>
        {program.description}
      </p>
      <div className={styles.cardFooter}>
        <div className={styles.meta}>
          <span>⏱ {duration}</span>
        </div>
        {program.lienProgramme ? (
          <a href={program.lienProgramme} target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" size="sm">DÉTAILS →</Button>
          </a>
        ) : (
          <Button variant="secondary" size="sm" disabled>DÉTAILS →</Button>
        )}
      </div>
    </Card>
  );
};

export default FormationsPage;
