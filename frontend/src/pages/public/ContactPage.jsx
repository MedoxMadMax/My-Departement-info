import React, { useState } from 'react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import Toast from '../../components/common/Toast';
import styles from './ContactPage.module.css';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'general',
    message: ''
  });
  const [toast, setToast] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setToast({ type: 'success', message: 'Message envoyé avec succès ! Notre équipe vous répondra dans les plus brefs délais.' });
    setFormData({ name: '', email: '', subject: 'general', message: '' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  return (
    <div className={styles.page}>
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          duration={5000} 
          onClose={() => setToast(null)} 
        />
      )}
      
      <section className={styles.header}>
        <div className="container">
          <h1 className={styles.title}>NOUS<br />CONTACTER</h1>
          <p className={styles.subtitle}>
            Une question sur nos formations, nos recherches ou nos partenariats ? 
            N'hésitez pas à nous écrire.
          </p>
        </div>
      </section>

      <section className="section">
        <div className={`container ${styles.grid}`}>
          
          <div className={styles.formCol}>
            <Card className={styles.formCard}>
              <h2 className={styles.formTitle}>ENVOYER UN MESSAGE</h2>
              <form onSubmit={handleSubmit}>
                <div className={styles.formRow}>
                  <Input 
                    id="name" 
                    label="Nom Complet" 
                    placeholder="Jean Dupont" 
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                  <Input 
                    id="email" 
                    type="email" 
                    label="Email" 
                    placeholder="jean@example.com" 
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className={styles.selectGroup}>
                  <label htmlFor="subject" className={styles.label}>Sujet</label>
                  <select 
                    id="subject" 
                    className={styles.select}
                    value={formData.subject}
                    onChange={handleChange}
                  >
                    <option value="general">Renseignement général</option>
                    <option value="scolarite">Scolarité & Admission</option>
                    <option value="recherche">Recherche & Laboratoires</option>
                    <option value="entreprise">Partenariat Entreprise</option>
                  </select>
                </div>
                
                <Input 
                  id="message" 
                  type="textarea" 
                  label="Message" 
                  placeholder="Votre message ici..." 
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
                
                <Button type="submit" variant="primary" size="lg">
                  ENVOYER LE MESSAGE
                </Button>
              </form>
            </Card>
          </div>

          <aside className={styles.infoCol}>
            <Card className={styles.infoCard}>
              <h3 className={styles.infoTitle}>COORDONNÉES</h3>
              
              <div className={styles.infoBlock}>
                <h4>ADRESSE POSTALE</h4>
                <p>
                  Département Informatique<br />
                  Bâtiment Ada Lovelace<br />
                  25 Avenue de l'Innovation<br />
                  75000 Paris
                </p>
              </div>
              
              <div className={styles.infoBlock}>
                <h4>TÉLÉPHONE</h4>
                <p>+33 (0)1 23 45 67 89</p>
              </div>
              
              <div className={styles.infoBlock}>
                <h4>EMAIL SECRÉTARIAT</h4>
                <p><a href="mailto:contact-info@univ.fr">contact-info@univ.fr</a></p>
              </div>
            </Card>

            <Card className={styles.mapCard}>
              <div className={styles.mapPlaceholder}>
                [CARTE INTERACTIVE DU CAMPUS]
              </div>
            </Card>
          </aside>

        </div>
      </section>

    </div>
  );
};

export default ContactPage;
