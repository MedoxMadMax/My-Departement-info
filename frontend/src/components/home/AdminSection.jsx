import React from 'react';
import Card from '../common/Card';
import styles from './AdminSection.module.css';

const AdminSection = ({ admins = [] }) => {
  return (
    <section className={`section ${styles.section}`}>
      <div className="container">
        <h2 className={styles.title}>ADMINISTRATION & DIRECTION</h2>
        
        <div className={styles.grid}>
          {admins.map(admin => (
            <Card key={admin.id} className={styles.card}>
              <div className={styles.avatar}>
                {admin.photo ? (
                  <img src={admin.photo} alt={admin.nom} />
                ) : (
                  <span>{admin.prenom?.[0]}{admin.nom?.[0]}</span>
                )}
              </div>
              <div className={styles.info}>
                <div className={styles.name}>
                  {admin.grade} {admin.prenom} {admin.nom}
                </div>
                <div className={styles.role}>
                  {/* Ideally fetch specific role, fallback to first filiere or static */}
                  Direction
                </div>
              </div>
              <a href={`mailto:${admin.email}`} className={styles.mailIcon}>
                ✉
              </a>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AdminSection;
