import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import styles from './AuthLayout.module.css';

const AuthLayout = () => {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className="container flex" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" className={styles.logo}>
            CS Dept.
          </Link>
          <Link to="/" className={styles.backLink}>
            ← Retour au site
          </Link>
        </div>
      </header>
      
      <main className={styles.main}>
        <Outlet />
      </main>

      <footer className={styles.footer}>
        <div className="container flex" style={{ justifyContent: 'space-between' }}>
          <p>© 2024 University Computer Science Department. All rights reserved.</p>
          <div className={styles.footerLinks}>
            <Link to="/contact">Privacy Policy</Link>
            <Link to="/contact">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout;
