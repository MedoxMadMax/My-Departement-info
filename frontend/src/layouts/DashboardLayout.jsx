import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import NotificationBar from '../components/dashboard/NotificationBar/NotificationBar';
import styles from './DashboardLayout.module.css';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={styles.layout}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className={styles.overlay} onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <div className={`${styles.sidebarWrapper} ${sidebarOpen ? styles.open : ''}`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Mobile Header */}
        <div className={styles.mobileHeader}>
          <button className={styles.menuBtn} onClick={() => setSidebarOpen(true)}>
            ☰
          </button>
          <div className={styles.mobileLogo}>ADMIN CONSOLE</div>
        </div>

        <main className={styles.contentArea}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
