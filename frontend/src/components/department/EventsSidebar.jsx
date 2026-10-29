import React from 'react';
import Card from '../common/Card';

const EventsSidebar = () => {
  return (
    <Card>
      <div style={{ padding: 'var(--space-lg)' }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '700',
          marginBottom: 'var(--space-md)',
          color: 'var(--color-on-surface)'
        }}>ÉVÉNEMENTS À VENIR</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {/* Mock events for now, could be passed as props */}
          <div style={{ borderLeft: '2px solid var(--color-primary)', paddingLeft: 'var(--space-sm)' }}>
            <div style={{ fontSize: '12px', color: 'var(--color-primary-container)', fontWeight: '600' }}>15 NOV</div>
            <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-on-surface)' }}>Journée Portes Ouvertes</div>
          </div>
          
          <div style={{ borderLeft: '2px solid var(--color-primary)', paddingLeft: 'var(--space-sm)' }}>
            <div style={{ fontSize: '12px', color: 'var(--color-primary-container)', fontWeight: '600' }}>22 NOV</div>
            <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-on-surface)' }}>Colloque IA & Éthique</div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default EventsSidebar;
