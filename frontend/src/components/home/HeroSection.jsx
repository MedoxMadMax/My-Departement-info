import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';
import styles from './HeroSection.module.css';

const HeroSection = () => {
  return (
    <section className={styles.hero}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.content}>
          <h1 className={styles.title}>
            <span className={styles.titleWhite}>L'EXCELLENCE EN</span>
            <span className={styles.titleAccent}>SCIENCES DU NUMÉRIQUE</span>
          </h1>
          <div className={styles.descriptionBlock}>
            <p className={styles.description}>
              Le département forme les futurs ingénieurs et chercheurs aux défis 
              technologiques de demain : intelligence artificielle, cybersécurité, 
              et systèmes distribués.
            </p>
          </div>
          <div className={styles.actions}>
            <Link to="/formations">
              <Button variant="primary">DÉCOUVRIR LE CURSUS</Button>
            </Link>
          </div>
        </div>
        <div className={styles.imageWrapper}>
          <img 
            src="https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
            alt="Faculté des Sciences" 
            className={styles.image}
          />
          <div className={styles.caption}>
            FACULTÉ DES SCIENCES - CAMPUS CENTRAL - BÂTIMENT ADA LOVELACE
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
