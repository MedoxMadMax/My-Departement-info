import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Mail } from 'lucide-react';
import { getEnseignants } from '../../api/publicApi';
import { getImageUrl } from '../../api/axiosClient';
import Loader from '../../components/common/Loader';
import Card from '../../components/common/Card';
import styles from './TeamPage.module.css';

const TeamPage = () => {
  const [enseignants, setEnseignants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const data = await getEnseignants();
        setEnseignants(data);
      } catch (error) {
        console.error("Failed to fetch team", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  if (loading) return <Loader center />;

  return (
    <div className={styles.page}>
      
      <section className={styles.header}>
        <div className="container">
          <h1 className={styles.title}>ÉQUIPE<br />PÉDAGOGIQUE</h1>
          <p className={styles.subtitle}>
            Découvrez les enseignants-chercheurs qui animent notre département.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className={styles.grid}>
            {enseignants.map(ens => (
              <Card key={ens.id} hoverable className={styles.card}>
                <div className={styles.avatar}>
                  {ens.photo ? (
                    <img src={getImageUrl(ens.photo)} alt={ens.nom} />
                  ) : (
                    <span>{ens.prenom?.[0]}{ens.nom?.[0]}</span>
                  )}
                </div>
                <div className={styles.info}>
                  <h3 className={styles.name}>{ens.prenom} {ens.nom}</h3>
                  <div className={styles.grade}>{ens.grade}</div>
                  
                  <div className={styles.details}>
                    <p><strong>Laboratoire :</strong> {ens.laboratoires?.[0]?.acronyme || ens.laboratoires?.[0]?.nom || 'Non assigné'}</p>
                    <p><strong>Spécialité :</strong> {ens.specialite || 'Informatique'}</p>
                    {ens.bureau && <p><strong>Bureau :</strong> {ens.bureau}</p>}
                  </div>
                  
                  <div className={styles.cardActions}>
                    <Link to={`/equipe/${ens.id}`} className={styles.profileBtn}>
                      Voir profil complet <ArrowRight size={14} />
                    </Link>
                    <a href={`mailto:${ens.email}`} className={styles.email} title={`Écrire à ${ens.email}`}>
                      <Mail size={14} />
                    </a>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default TeamPage;
