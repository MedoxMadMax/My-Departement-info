import React from 'react';
import { getImageUrl } from '../../api/axiosClient';

const HistorySection = ({ data = {} }) => {
  const coverPhoto = data.imageCover ? getImageUrl(data.imageCover) : null;
  const rawValues = data.valeurs || "Excellence Scientifique, Innovation Ouverte, Rigueur Académique, Responsabilité Sociétale";
  const valuesList = Array.isArray(rawValues) 
    ? rawValues 
    : (typeof rawValues === 'string' ? rawValues.split(',').map(v => v.trim()).filter(Boolean) : []);

  const defaultHtml = `
    <p>Fondé pour répondre aux défis majeurs de l'ère du numérique, le Département Informatique de la Faculté des Sciences d'Oujda a toujours été à la pointe de l'innovation pédagogique et de la recherche scientifique.</p>
    <p>De l'avènement de l'Internet aux avancées contemporaines en Intelligence Artificielle, Cloud Computing, Cybersécurité et Science des Données, nos cursus évoluent constamment en synergie étroite avec les besoins du monde professionnel et académique.</p>
  `;

  const histoireHtml = data.histoire || defaultHtml;

  return (
    <section style={{ marginTop: 'var(--space-xl)' }}>
      {coverPhoto && (
        <div style={{
          marginBottom: 'var(--space-xl)',
          borderRadius: 'var(--radius-default)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-l1)',
          maxHeight: '340px'
        }}>
          <img 
            src={coverPhoto} 
            alt="Campus & Département Informatique" 
            style={{ width: '100%', height: '340px', objectFit: 'cover', display: 'block' }}
          />
        </div>
      )}

      <h2 style={{
        fontSize: '24px',
        fontWeight: '700',
        marginBottom: 'var(--space-md)',
        color: 'var(--color-on-surface)',
        textTransform: 'uppercase'
      }}>
        Histoire &amp; Missions
      </h2>

      <div 
        style={{
          fontSize: '16px',
          color: 'var(--color-on-surface-variant)',
          lineHeight: '1.8',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-md)',
          wordBreak: 'break-word',
          overflowWrap: 'anywhere',
          maxWidth: '100%'
        }}
        dangerouslySetInnerHTML={{ __html: histoireHtml }}
      />

      {valuesList.length > 0 && (
        <div style={{ marginTop: 'var(--space-lg)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-on-surface)', marginBottom: '12px' }}>
            Nos Valeurs &amp; Piliers Fondateurs
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {valuesList.map((val, idx) => (
              <span 
                key={idx} 
                style={{
                  backgroundColor: 'var(--color-surface-container)',
                  color: 'var(--color-primary-container)',
                  fontWeight: '600',
                  fontSize: '14px',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: '1px solid rgba(0,0,0,0.06)'
                }}
              >
                ✦ {val}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default HistorySection;
