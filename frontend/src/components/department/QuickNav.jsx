import React from 'react';
import Card from '../common/Card';

const QuickNav = () => {
  return (
    <Card>
      <div style={{ padding: 'var(--space-lg)' }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '700',
          marginBottom: 'var(--space-md)',
          color: 'var(--color-on-surface)'
        }}>ACCÈS RAPIDE</h3>
        <ul style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-sm)'
        }}>
          <li><a href="#" style={{ color: 'var(--color-primary-container)', fontWeight: '500' }}>→ Organigramme (PDF)</a></li>
          <li><a href="#" style={{ color: 'var(--color-primary-container)', fontWeight: '500' }}>→ Rapport d'activité 2023</a></li>
          <li><a href="#" style={{ color: 'var(--color-primary-container)', fontWeight: '500' }}>→ Charte éthique</a></li>
        </ul>
      </div>
    </Card>
  );
};

export default QuickNav;
