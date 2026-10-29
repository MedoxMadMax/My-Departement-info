import React, { useState, useEffect } from 'react';
import { Search, Calendar } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import styles from './HistoriquePage.module.css';
import Loader from '../../components/common/Loader';
import Pagination from '../../components/common/Pagination';
import useAuth from '../../hooks/useAuth';

const HistoriquePage = () => {
  const { hasRole } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    fetchHistorique();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterDate]);

  const fetchHistorique = async () => {
    try {
      const endpoint = hasRole('ROLE_SECRETAIRE') && !hasRole('ROLE_ADMIN') && !hasRole('ROLE_SUPER_ADMIN') ? '/api/secretaire/historique' : '/api/admin/historique';
      const { data } = await axiosClient.get(endpoint);
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action) => {
    if (!action) return styles.badgeDefault;
    const act = action.toLowerCase();
    if (act.includes('valida') || act.includes('accept')) return styles.badgeValidation;
    if (act.includes('refus') || act.includes('rejet') || act.includes('suppr')) return styles.badgeSuppression;
    if (act.includes('crea') || act.includes('créa')) return styles.badgeCreation;
    if (act.includes('demande') || act.includes('modif')) return styles.badgeModification;
    return styles.badgeDefault;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const parts = dateString.split(' ');
    const datePart = parts[0];
    const timePart = parts[1] || '';
    
    const [year, month, day] = datePart.split('-');
    if (year && month && day) {
      return `${day}/${month}/${year} ${timePart}`.trim();
    }
    return dateString;
  };

  const filteredLogs = logs.filter(log => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = (
      (log.action && log.action.toLowerCase().includes(term)) ||
      (log.entite && log.entite.toLowerCase().includes(term)) ||
      (log.details && log.details.toLowerCase().includes(term)) ||
      (log.utilisateur && log.utilisateur.toLowerCase().includes(term))
    );

    const matchesDate = filterDate ? (log.date && log.date.startsWith(filterDate)) : true;

    return matchesSearch && matchesDate;
  });

  const paginatedLogs = filteredLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (loading) return <Loader center />;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.titleContainer}>
          <h1 className={styles.title}>JOURNAL D'AUDIT</h1>
          <p className={styles.subtitle}>Traçabilité et historique complet des actions système.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className={styles.searchContainer} style={{ width: 'auto', cursor: 'pointer' }}>
            <input 
              type="date"
              className={styles.searchInput}
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              onClick={(e) => {
                try {
                  e.target.showPicker();
                } catch(err) {}
              }}
              style={{ paddingRight: '40px', cursor: 'pointer' }}
            />
            <Calendar className={styles.searchIcon} size={20} style={{ pointerEvents: 'none' }} />
          </div>
          
          <div className={styles.searchContainer}>
            <input 
              type="text" 
              className={styles.searchInput}
              placeholder="Rechercher une action, entité..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className={styles.searchIcon} size={20} />
          </div>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Horodatage</th>
              <th>Utilisateur</th>
              <th>Action</th>
              <th>Entité</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLogs.map(log => (
              <tr key={log.id}>
                <td className={styles.timeText}>{formatDate(log.date)}</td>
                <td>
                  <div className={styles.userBox}>
                    <span className={styles.userName}>{log.utilisateur}</span>
                  </div>
                </td>
                <td>
                  <span className={getActionBadge(log.action)}>
                    {log.action}
                  </span>
                </td>
                <td>
                  <span className={styles.entityType}>{log.entite} (ID: {log.entiteId})</span>
                  {log.details && (
                    <span className={styles.entityDetails}>{log.details}</span>
                  )}
                </td>
              </tr>
            ))}
            {filteredLogs.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '3rem' }}>
                  Aucun historique trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={filteredLogs.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default HistoriquePage;
