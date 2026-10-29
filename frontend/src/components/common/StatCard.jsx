import React from 'react';
import styles from './StatCard.module.css';

const StatCard = ({ number, label, highlight = false, color = null }) => {
  return (
    <div className={`${styles.statCard} ${highlight ? styles.highlight : ''}`}>
      <div className={styles.number} style={color ? { color } : {}}>
        {number}
      </div>
      <div className={styles.label}>{label}</div>
    </div>
  );
};

export default StatCard;
