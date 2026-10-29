import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import styles from './NewsSection.module.css';

const getExcerpt = (contenu) => {
  if (!contenu) return '';
  try {
    const parsed = JSON.parse(contenu);
    if (parsed.extrait) return parsed.extrait;
    // Fallback to stripping HTML if no excerpt
    if (typeof document !== 'undefined' && parsed.html) {
      const tmp = document.createElement('DIV');
      tmp.innerHTML = parsed.html;
      return tmp.textContent || tmp.innerText || '';
    }
    return '';
  } catch {
    return contenu;
  }
};

const NewsCard = ({ newsItem }) => {
  const dateStr = new Date(newsItem.dateCreation).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <Card hoverable className={styles.card}>
      <div className={styles.imageWrapper}>
        {newsItem.imageCoverUrl ? (
          <img src={newsItem.imageCoverUrl} alt={newsItem.titre} className={styles.image} />
        ) : (
          <div className={styles.imagePlaceholder}></div>
        )}
      </div>
      
      <div className={styles.content}>
        <div className={styles.meta}>
          <span className={styles.date}>{dateStr}</span>
          <span className={styles.type}>{newsItem.type}</span>
        </div>
        
        <h3 className={styles.cardTitle}>{newsItem.titre}</h3>
        
        <div className={styles.cardFooter}>
          <Link to={`/evenements/${newsItem.slug}`}>
            <button className={styles.readMoreBtn}>LIRE LA SUITE</button>
          </Link>
        </div>
      </div>
    </Card>
  );
};

const NewsSection = ({ news = [] }) => {
  return (
    <section className="section">
      <div className="container">
        <div className={styles.header}>
          <h2 className={styles.sectionTitle}>À LA UNE</h2>
          <Link to="/evenements" className={styles.seeAll}>
            VOIR TOUTES LES ACTUALITÉS
          </Link>
        </div>
        
        <div className={styles.grid}>
          {news.map(item => (
            <NewsCard key={item.id} newsItem={item} />
          ))}
          {news.length === 0 && <p>Aucune actualité pour le moment.</p>}
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
