import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getActualites } from '../../api/publicApi';
import { getImageUrl } from '../../api/axiosClient';
import { Search, Filter } from 'lucide-react';
import Loader from '../../components/common/Loader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Pagination from '../../components/common/Pagination';
import styles from './EventsPage.module.css';

const EventsPage = () => {
  const [actualites, setActualites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getActualites();
        setActualites(data);
      } catch (error) {
        console.error("Failed to fetch events", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterYear, filterMonth, filterCategory]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  if (loading) return <Loader center />;

  const availableYears = [...new Set(actualites.map(a => new Date(a.dateCreation).getFullYear()))].filter(y => !isNaN(y)).sort((a,b)=>b-a);
  const availableMonths = [...new Set(actualites.map(a => new Date(a.dateCreation).getMonth() + 1))].filter(m => !isNaN(m)).sort((a,b)=>a-b);
  const availableCategories = [...new Set(actualites.map(a => {
    try {
      const parsed = JSON.parse(a.contenu);
      return parsed.categorie || a.type;
    } catch {
      return a.type;
    }
  }))].filter(c => c).sort();

  const filteredActualites = actualites.filter(actu => {
    if (searchTerm && !actu.titre.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    const date = new Date(actu.dateCreation);
    if (filterYear && date.getFullYear().toString() !== filterYear) return false;
    if (filterMonth && (date.getMonth() + 1).toString() !== filterMonth) return false;
    if (filterCategory) {
      let cat = actu.type;
      try {
        const parsed = JSON.parse(actu.contenu);
        if (parsed.categorie) cat = parsed.categorie;
      } catch {}
      if (cat !== filterCategory) return false;
    }
    return true;
  });

  const paginatedActualites = filteredActualites.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className={styles.page}>
      
      <section className={styles.header}>
        <div className="container">
          <h1 className={styles.title}>ACTUALITÉS & ÉVÉNEMENTS</h1>
          <p className={styles.subtitle}>
            Restez informé de la vie du département : conférences, séminaires, et annonces.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className={styles.filterBar}>
            <div className={styles.searchBox}>
              <Search size={18} className={styles.filterIcon} />
              <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={styles.searchInput} />
            </div>
            <div className={styles.filterSelects}>
              <Filter size={18} className={styles.filterIcon} />
              <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className={styles.select}>
                <option value="">Toutes les années</option>
                {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className={styles.select}>
                <option value="">Tous les mois</option>
                {availableMonths.map(m => <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('fr-FR', { month: 'long' })}</option>)}
              </select>
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className={styles.select}>
                <option value="">Toutes les catégories</option>
                {availableCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          
          <div className={styles.grid}>
            {paginatedActualites.map(actu => (
              <EventCard key={actu.id} item={actu} />
            ))}
          </div>

          {filteredActualites.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
              Aucun événement ou actualité ne correspond à vos critères.
            </div>
          )}

          <Pagination
            currentPage={currentPage}
            totalItems={filteredActualites.length}
            pageSize={pageSize}
            onPageChange={handlePageChange}
          />
        </div>
      </section>

    </div>
  );
};

const EventCard = ({ item }) => {
  const dateStr = new Date(item.dateCreation).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <Card hoverable className={styles.card}>
      <div className={styles.imageWrapper}>
        {item.imageCoverUrl ? (
          <img src={getImageUrl(item.imageCoverUrl)} alt={item.titre} className={styles.image} />
        ) : (
          <div className={styles.imagePlaceholder}></div>
        )}
      </div>
      
      <div className={styles.content}>
        <div className={styles.meta}>
          <span className={styles.date}>{dateStr}</span>
          <span className={styles.type}>{item.type}</span>
        </div>
        
        <h3 className={styles.cardTitle}>{item.titre}</h3>
        
        <div className={styles.cardFooter}>
          <Link to={`/evenements/${item.slug}`}>
            <Button variant="secondary" size="sm">LIRE LA SUITE</Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default EventsPage;
