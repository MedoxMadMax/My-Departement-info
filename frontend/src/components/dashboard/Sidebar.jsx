import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import axiosClient from '../../api/axiosClient';
import Toast from '../common/Toast';
import styles from './Sidebar.module.css';
import Button from '../common/Button';

const Sidebar = ({ onClose }) => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);
  const [toast, setToast] = useState(null);
  const prevCountRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    if (!hasRole('ROLE_SUPER_ADMIN') && !hasRole('ROLE_ADMIN') && !hasRole('ROLE_SECRETAIRE')) return;

    let isMounted = true;
    const fetchPending = async () => {
      try {
        const { data } = await axiosClient.get('/api/dashboard/stats');
        if (!isMounted) return;
        const currentCount = data.enAttente || 0;

        if (prevCountRef.current !== null && currentCount > prevCountRef.current && hasRole('ROLE_SUPER_ADMIN')) {
          setToast({
            type: 'info',
            message: `🔔 ${currentCount - prevCountRef.current} nouvelle(s) demande(s) de validation reçue(s) !`
          });
        }
        prevCountRef.current = currentCount;
        setPendingCount(currentCount);
      } catch (err) {
        // silent
      }
    };

    fetchPending();
    const interval = setInterval(fetchPending, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [hasRole]);

  const navItems = [
    { label: 'DASHBOARD', path: '/dashboard', show: true },
    { label: 'EVENTS MGMT', path: '/dashboard/actualites', show: hasRole('ROLE_ADMIN') || hasRole('ROLE_SUPER_ADMIN') || hasRole('ROLE_SECRETAIRE') },
    { label: 'LE DÉPARTEMENT', path: '/dashboard/departement', show: hasRole('ROLE_ADMIN') || hasRole('ROLE_SUPER_ADMIN') || hasRole('ROLE_SECRETAIRE') },
    { label: 'USER ACCOUNTS', path: '/dashboard/utilisateurs', show: hasRole('ROLE_SUPER_ADMIN') || hasRole('ROLE_SECRETAIRE') },
    { label: 'PEDAGOGY (FILIÈRES)', path: '/dashboard/filieres', show: hasRole('ROLE_ADMIN') || hasRole('ROLE_SUPER_ADMIN') || hasRole('ROLE_SECRETAIRE') },
    { label: 'ENSEIGNANTS', path: '/dashboard/enseignants', show: hasRole('ROLE_ADMIN') || hasRole('ROLE_SUPER_ADMIN') || hasRole('ROLE_SECRETAIRE') },
    { label: 'LABORATOIRES', path: '/dashboard/laboratoires', show: hasRole('ROLE_ADMIN') || hasRole('ROLE_SUPER_ADMIN') || hasRole('ROLE_SECRETAIRE') },
    { label: 'VALIDATION', path: '/dashboard/validation', show: hasRole('ROLE_SUPER_ADMIN') },
    { label: 'HISTORIQUE', path: '/dashboard/historique', show: hasRole('ROLE_ADMIN') || hasRole('ROLE_SUPER_ADMIN') || hasRole('ROLE_SECRETAIRE') },
    { label: 'MON PROFIL', path: '/dashboard/profil', show: !hasRole('ROLE_ADMIN') && !hasRole('ROLE_SUPER_ADMIN') && !hasRole('ROLE_SECRETAIRE') },
  ];

  const getSidebarTitle = () => {
    if (hasRole('ROLE_SUPER_ADMIN') || hasRole('ROLE_ADMIN')) return 'CONSOLE ADMIN';
    if (hasRole('ROLE_SECRETAIRE')) return 'ESPACE SECRÉTARIAT';
    if (hasRole('ROLE_PROF')) return 'ESPACE ENSEIGNANT';
    return 'ESPACE MEMBRE';
  };

  const getSidebarSubtitle = () => {
    if (hasRole('ROLE_SUPER_ADMIN')) return 'SUPER ADMIN ACCESS';
    if (hasRole('ROLE_ADMIN')) return 'ADMINISTRATION SYSTÈME';
    if (hasRole('ROLE_SECRETAIRE')) return 'GESTION & DEMANDES';
    if (hasRole('ROLE_PROF')) return 'GESTION PÉDAGOGIQUE';
    return 'PORTAIL DÉPARTEMENT';
  };

  return (
    <aside className={styles.sidebar}>
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          duration={5000}
          onClose={() => setToast(null)}
        />
      )}

      <div className={styles.header}>
        <div className={styles.title}>{getSidebarTitle()}</div>
        <div className={styles.subtitle}>{getSidebarSubtitle()}</div>
      </div>

      <nav className={styles.nav}>
        {navItems.filter(item => item.show).map(item => (
          <NavLink 
            key={item.path}
            to={item.path} 
            end={item.path === '/dashboard'}
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            onClick={onClose}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <span>{item.label}</span>
            {item.label === 'VALIDATION' && pendingCount > 0 && (
              <span className={styles.whatsappBadge}>
                {pendingCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className={styles.footer}>
        <Button variant="primary" fullWidth className={styles.actionBtn}>
          + NEW ACTION
        </Button>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          ↪ LOGOUT
        </button>
        
        {user && (
          <div className={styles.userCard}>
            <div className={styles.avatar}></div>
            <div className={styles.userInfo}>
              <div className={styles.userName}>{user.nom ? `${user.prenom} ${user.nom}` : user.email}</div>
              <div className={styles.userRole}>{user.roles[0]?.replace('ROLE_', '')}</div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
