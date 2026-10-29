import React from 'react';
import { getImageUrl } from '../../api/axiosClient';

const DirectorQuote = ({ data = {} }) => {
  const quote = data.motDirecteur || `"Notre mission est de préparer nos étudiants à devenir non seulement des experts techniques de haut niveau, mais aussi des acteurs innovants conscients des enjeux scientifiques, éthiques et sociétaux liés au numérique."`;
  const name = data.nomDirecteur || 'Pr. Directeur du Département';
  const title = data.titreDirecteur || 'Chef du Département Informatique';
  const photo = data.photoDirecteur ? getImageUrl(data.photoDirecteur) : null;

  return (
    <div style={{
      backgroundColor: 'var(--color-surface-white)',
      borderRadius: 'var(--radius-default)',
      boxShadow: 'var(--shadow-l1)',
      border: '1px solid rgba(0, 0, 0, 0.06)',
      display: 'flex',
      overflow: 'hidden',
      alignItems: 'stretch',
      minHeight: '210px',
      flexWrap: 'wrap'
    }}>
      {photo ? (
        <div style={{ 
          flex: '0 0 200px', 
          minWidth: '180px',
          backgroundColor: '#0f172a',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <img 
            src={photo} 
            alt={name} 
            style={{ 
              width: '100%', 
              height: '100%', 
              minHeight: '210px',
              objectFit: 'cover', 
              display: 'block'
            }} 
          />
        </div>
      ) : (
        <div style={{
          flex: '0 0 160px',
          minWidth: '140px',
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          padding: '20px'
        }}>
          <span style={{ fontSize: '44px', marginBottom: '8px' }}>🎓</span>
          <span style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.05em', textAlign: 'center' }}>DIRECTION</span>
        </div>
      )}

      <div style={{ 
        flex: 1, 
        minWidth: '260px',
        padding: 'var(--space-xl) var(--space-xl)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        borderLeft: '4px solid var(--color-primary-container)'
      }}>
        <div style={{ fontSize: '28px', color: 'var(--color-primary-container)', lineHeight: 1, marginBottom: '8px', opacity: 0.6 }}>
          “
        </div>
        <p style={{
          fontSize: '17px',
          fontWeight: '500',
          fontStyle: 'italic',
          lineHeight: '1.6',
          color: 'var(--color-on-surface)',
          marginBottom: 'var(--space-md)',
          marginTop: 0
        }}>
          {quote}
        </p>
        <div style={{
          fontSize: '13px',
          fontWeight: '700',
          color: 'var(--color-primary-container)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em'
        }}>
          — {name}, <span style={{ color: 'var(--color-on-surface-variant)', fontWeight: '600' }}>{title}</span>
        </div>
      </div>
    </div>
  );
};

export default DirectorQuote;
