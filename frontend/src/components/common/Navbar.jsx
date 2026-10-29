import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import styles from './Navbar.module.css';
import Button from './Button';
import useAuth from '../../hooks/useAuth';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={`container ${styles.navContainer}`}>
        <Link to="/" className={styles.logoLink} title="Accueil - Département Informatique">
          <img src="/logo.svg" alt="Logo Département Informatique" className={styles.navLogo} />
        </Link>

        <nav className={`${styles.navLinks} ${mobileMenuOpen ? styles.open : ''}`}>
          <NavLink to="/" className={({ isActive }) => isActive ? styles.active : ''} end>
            ACCUEIL
          </NavLink>
          <NavLink to="/departement" className={({ isActive }) => isActive ? styles.active : ''}>
            DÉPARTEMENT
          </NavLink>
          <NavLink to="/formations" className={({ isActive }) => isActive ? styles.active : ''}>
            FORMATIONS
          </NavLink>
          <NavLink to="/equipe" className={({ isActive }) => isActive ? styles.active : ''}>
            EQUIPE PEDAGOGIQUE
          </NavLink>
          <NavLink to="/evenements" className={({ isActive }) => isActive ? styles.active : ''}>
            ACTUALITÉS
          </NavLink>
        </nav>

        <div className={styles.actions}>
          <Link to={isAuthenticated ? "/dashboard" : "/login"}>
            <Button variant="secondary" size="sm">
              ESPACE INTERNE
            </Button>
          </Link>
          <Link to="/contact">
            <Button variant="primary" size="sm">
              CONTACT
            </Button>
          </Link>
          <span className={styles.lockIcon}>🔒</span>
          
          <button 
            className={styles.hamburger} 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            ☰
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
