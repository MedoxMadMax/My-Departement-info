import React, { useEffect, useState } from 'react';
import axiosClient from '../../../api/axiosClient';
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import styles from './NotificationBar.module.css';
import useAuth from '../../../hooks/useAuth';

const NotificationBar = () => {
    const { hasRole } = useAuth();
    const isSecretaire = hasRole('ROLE_SECRETAIRE') && !hasRole('ROLE_ADMIN') && !hasRole('ROLE_SUPER_ADMIN');
    const [demandes, setDemandes] = useState([]);

    useEffect(() => {
        if (!isSecretaire) return;
        const fetchDemandes = async () => {
            try {
                const { data } = await axiosClient.get('/api/secretaire/demandes');
                // Only show resolved requests (Validee or Refusee) from the last 7 days, max 3
                const resolved = data.filter(d => d.statut !== 'En_Attente').slice(0, 3);
                setDemandes(resolved);
            } catch (err) {
                console.error("Failed to fetch demandes", err);
            }
        };
        fetchDemandes();
    }, [isSecretaire]);

    if (!isSecretaire || demandes.length === 0) return null;

    return (
        <div className={styles.notificationContainer}>
            <h4 className={styles.title}>Statut de vos dernières demandes</h4>
            {demandes.map(d => (
                <div key={d.id} className={`${styles.notificationCard} ${d.statut === 'Validee' ? styles.validee : styles.refusee}`}>
                    <div className={styles.icon}>
                        {d.statut === 'Validee' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                    </div>
                    <div className={styles.content}>
                        <p className={styles.message}>
                            <strong>{d.action} {d.typeEntite}</strong> a été {d.statut === 'Validee' ? 'validée' : 'refusée'}.
                        </p>
                        {d.statut === 'Refusee' && d.motifRefus && (
                            <p className={styles.motif}>Motif : {d.motifRefus}</p>
                        )}
                        <span className={styles.date}>{d.dateCreation}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default NotificationBar;