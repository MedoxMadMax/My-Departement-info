import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import styles from './LoginPage.module.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Identifiants incorrects ou problème de connexion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <Card className={styles.loginCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>ESPACE INTERNE</h1>
          <p className={styles.subtitle}>
            Accès réservé au personnel administratif et enseignant.
          </p>
        </div>

        {error && <div className={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input 
            id="email" 
            type="email" 
            label="ADRESSE EMAIL" 
            placeholder="jean.dupont@univ.fr" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
          
          <Input 
            id="password" 
            type="password" 
            label="MOT DE PASSE" 
            placeholder="••••••••" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
          
          <div className={styles.forgotPassword}>
            <a href="#">Mot de passe oublié ?</a>
          </div>

          <Button type="submit" variant="primary" fullWidth size="lg" disabled={loading}>
            {loading ? 'CONNEXION...' : 'SE CONNECTER'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;
