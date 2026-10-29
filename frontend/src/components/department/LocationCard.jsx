import React from 'react';
import Card from '../common/Card';

const LocationCard = ({ data = {} }) => {
  const adresse = data.adresse || "Faculté des Sciences, BV Mohammed VI - BP 717, 60000 Oujda, Maroc";
  const tel = data.telephone || "+212 536 50 06 01";
  const email = data.email || "informatique@fso.ump.ma";
  const horaires = data.horaires || "Lundi - Vendredi : 08h30 - 18h00";

  return (
    <Card style={{ overflow: 'hidden' }}>
      <div style={{
        height: '110px',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        padding: 'var(--space-md)',
        textAlign: 'center'
      }}>
        <span style={{ fontSize: '24px', marginBottom: '4px' }}>📍</span>
        <span style={{ fontSize: '13px', fontWeight: '700', letterSpacing: '0.05em' }}>CAMPUS &amp; LOCALISATION</span>
      </div>
      <div style={{ padding: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div>
          <strong style={{ fontSize: '13px', color: 'var(--color-on-surface)' }}>Adresse :</strong>
          <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--color-on-surface-variant)', lineHeight: '1.4' }}>
            {adresse}
          </p>
        </div>
        {tel && (
          <div>
            <strong style={{ fontSize: '13px', color: 'var(--color-on-surface)' }}>Téléphone :</strong>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--color-on-surface-variant)' }}>
              {tel}
            </p>
          </div>
        )}
        {email && (
          <div>
            <strong style={{ fontSize: '13px', color: 'var(--color-on-surface)' }}>Email :</strong>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--color-primary-container)', wordBreak: 'break-all' }}>
              {email}
            </p>
          </div>
        )}
        {horaires && (
          <div>
            <strong style={{ fontSize: '13px', color: 'var(--color-on-surface)' }}>Horaires :</strong>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--color-on-surface-variant)' }}>
              {horaires}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default LocationCard;
