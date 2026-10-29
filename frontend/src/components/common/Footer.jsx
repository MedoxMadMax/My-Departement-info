import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        
        {/* Logos & Department Info */}
        <div className={styles.column}>
          <div className={styles.logosWrap}>
            <img src="/logo.svg" alt="Logo Département Informatique" className={styles.footerLogo} />
            <img src="/title.svg" alt="Faculté des Sciences - Université" className={styles.footerTitleImg} />
          </div>
          <p className={styles.text}>
            <strong>Faculté des Sciences</strong><br />
            Université Mohammed Premier<br />
            BV Mohammed VI - BP 717<br />
            60000 Oujda, Maroc
          </p>
        </div>

        {/* Info Département */}
        <div className={styles.column}>
          <h3 className={styles.title}>INFO DÉPARTEMENT</h3>
          <ul className={styles.list}>
            <li><Link to="/departement">Présentation &amp; Missions</Link></li>
            <li><Link to="/departement">Structure &amp; Organigramme</Link></li>
            <li><Link to="/equipe">Équipe Pédagogique &amp; Chercheurs</Link></li>
            <li><Link to="/formations">Offre de Formations</Link></li>
            <li><Link to="/evenements">Actualités &amp; Événements</Link></li>
          </ul>
        </div>

        {/* Liens Rapides & Services */}
        <div className={styles.column}>
          <h3 className={styles.title}>LIENS RAPIDES</h3>
          <ul className={styles.list}>
            <li><Link to="/formations">Cursus Licence &amp; Master</Link></li>
            <li><Link to="/contact">Plan du Campus &amp; Accès</Link></li>
            <li><Link to="/login">Espace Interne Authentifié</Link></li>
            <li><a href="https://fso.ump.ma" target="_blank" rel="noopener noreferrer">Site Faculté des Sciences ↗</a></li>
            <li><a href="https://www.ump.ma" target="_blank" rel="noopener noreferrer">Portail Université UMP ↗</a></li>
          </ul>
        </div>
        
      </div>
      
      <div className={styles.bottomBar}>
        <div className="container">
          <p>© {new Date().getFullYear()} DÉPARTEMENT INFORMATIQUE — FACULTÉ DES SCIENCES OUJDA. TOUS DROITS RÉSERVÉS.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
