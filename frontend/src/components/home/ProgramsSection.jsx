import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';
import Card from '../common/Card';
import styles from './ProgramsSection.module.css';

const ProgramCard = ({ program }) => {
  let badgeLevel = 'BAC +3';
  if (program.type === 'Master') badgeLevel = 'BAC +5';
  if (program.type === 'Doctorat') badgeLevel = 'BAC +8';

  return (
    <Card hoverable className={styles.card}>
      <div className={styles.badge}>{badgeLevel}</div>
      <h3 className={styles.cardTitle}>{program.nom}</h3>
      <p className={styles.cardDesc}>
        {program.description?.substring(0, 100)}...
      </p>
    </Card>
  );
};

const ProgramsSection = ({ programs = [] }) => {
  // Let's take the first 4 active programs, ideally a mix.
  const displayPrograms = programs.slice(0, 4);

  return (
    <section className={`section ${styles.section}`}>
      <div className={`container ${styles.grid}`}>
        
        <div className={styles.textContent}>
          <h2 className={styles.title}>PROGRAMMES D'ÉTUDES</h2>
          <p className={styles.desc}>
            Nos cursus sont conçus pour offrir une base théorique solide tout en 
            restant à la pointe de l'innovation technologique mondiale.
          </p>
          <Link to="/formations" style={{ width: '100%', textDecoration: 'none' }}>
            <Button variant="secondary" icon="→" fullWidth className={styles.btn}>
              ACCÉDER AU CURSUS
            </Button>
          </Link>
        </div>

        <div className={styles.cardsGrid}>
          {displayPrograms.map(p => (
            <Link to="/formations" key={p.id} className={styles.cardLink}>
              <ProgramCard program={p} />
            </Link>
          ))}
          {displayPrograms.length === 0 && (
            <p>Les programmes sont en cours de mise à jour.</p>
          )}
        </div>

      </div>
    </section>
  );
};

export default ProgramsSection;
