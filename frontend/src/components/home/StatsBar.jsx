import React from 'react';
import StatCard from '../common/StatCard';
import styles from './StatsBar.module.css';

const StatsBar = () => {
  return (
    <section className={styles.statsBar}>
      <div className={`container ${styles.grid}`}>
        <StatCard number="850" label="ÉTUDIANTS" />
        <StatCard number="42" label="CHERCHEURS" />
        <StatCard number="12" label="LABORATOIRES" />
        <StatCard number="98%" label="INSERTION" />
      </div>
    </section>
  );
};

export default StatsBar;
