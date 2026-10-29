import React from 'react';
import styles from './Badge.module.css';

const statusMap = {
  'Publiee': { label: 'PUBLIÉ', class: styles.publiee },
  'En_Attente': { label: 'EN ATTENTE', class: styles.enAttente },
  'Refusee': { label: 'REFUSÉE', class: styles.refusee },
  'Brouillon': { label: 'BROUILLON', class: styles.brouillon },
};

const Badge = ({ status }) => {
  const badgeConfig = statusMap[status] || { label: status, class: styles.default };

  return (
    <span className={`${styles.badge} ${badgeConfig.class}`}>
      {badgeConfig.label}
    </span>
  );
};

export default Badge;
