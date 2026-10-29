import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, UserPlus, Shield, X, Edit, Power, PowerOff, Eye, EyeOff } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import axiosClient from '../../api/axiosClient';
import Toast from '../../components/common/Toast';
import styles from './AdminUsers.module.css';

const AdminUsers = () => {
  const { hasRole } = useAuth();
  const isSecretaire = hasRole('ROLE_SECRETAIRE') && !hasRole('ROLE_ADMIN') && !hasRole('ROLE_SUPER_ADMIN');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    roles: isSecretaire ? 'ROLE_SECRETAIRE' : 'ROLE_ADMIN'
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/api/super-admin/utilisateurs');
      setUsers(response.data);
    } catch (err) {
      console.error("Error fetching users:", err);
      setToast({ type: 'error', message: "Erreur lors du chargement des utilisateurs." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (id) => {
    try {
      if (isSecretaire) { 
        setToast({ type: 'warning', message: "Seul un Administrateur peut activer ou désactiver un compte directement." }); 
        return;
      } 
      await axiosClient.patch(`/api/super-admin/utilisateurs/${id}/activer`);
      setToast({ type: 'success', message: "Statut de l'utilisateur mis à jour." });
      fetchUsers();
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: "Erreur lors du changement de statut." });
    }
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      if (isSecretaire) { 
        setToast({ type: 'warning', message: "Seul un Administrateur peut modifier les rôles directement." }); 
        return;
      } 
      await axiosClient.patch(`/api/super-admin/utilisateurs/${id}/role`, {
        roles: [newRole]
      });
      setToast({ type: 'success', message: "Rôle de l'utilisateur modifié avec succès." });
      fetchUsers();
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: "Erreur lors du changement de rôle." });
    }
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Email,Type,Roles,Status\n"
      + users.map(e => `${e.email},${e.type},${e.roles.join(';')},${e.isActive ? 'Active' : 'Inactive'}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "utilisateurs.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();

    if (!formData.password) {
      setToast({ type: 'error', message: 'Le mot de passe est obligatoire.' });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setToast({ type: 'error', message: 'Les mots de passe ne correspondent pas.' });
      return;
    }

    if (formData.password.length < 6) {
      setToast({ type: 'error', message: 'Le mot de passe doit contenir au moins 6 caractères.' });
      return;
    }

    try {
      if (isSecretaire) { 
        await axiosClient.post('/api/secretaire/demandes', { typeEntite: 'Utilisateur', action: 'CREATE', donnees: formData }); 
        setToast({ type: 'success', message: 'Demande de création de compte soumise avec succès.' });
      } else { 
        await axiosClient.post('/api/super-admin/utilisateurs', {
          email: formData.email,
          password: formData.password,
          roles: [formData.roles]
        }); 
        setToast({ type: 'success', message: 'Compte utilisateur créé avec succès.' });
      }
      setIsModalOpen(false);
      setFormData({ email: '', password: '', confirmPassword: '', roles: isSecretaire ? 'ROLE_SECRETAIRE' : 'ROLE_ADMIN' });
      fetchUsers();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || err.message;
      setToast({ type: 'error', message: "Erreur lors de la création: " + msg });
    }
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.nom && u.nom.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = {
    total: users.length,
    admins: users.filter(u => u.roles.includes('ROLE_ADMIN') || u.roles.includes('ROLE_SUPER_ADMIN')).length,
    enseignants: users.filter(u => u.roles.includes('ROLE_PROF')).length,
    inactifs: users.filter(u => !u.isActive).length,
  };

  return (
    <div className={styles.container}>
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          duration={5000} 
          onClose={() => setToast(null)} 
        />
      )}
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.breadcrumbs}>
            <span className={styles.breadcrumb}>Admin</span>
            <span className={styles.breadcrumb}>/</span>
            <span className={`${styles.breadcrumb} ${styles.active}`}>Gestion des Comptes</span>
          </div>
          <h1 className={styles.title}>Gestion des Comptes</h1>
          <p className={styles.subtitle}>
            Administration centralisée des accès utilisateurs pour le département. Gérez les rôles académiques et administratifs avec précision.
          </p>
        </div>
        <button className={styles.createBtn} onClick={() => setIsModalOpen(true)}>
          <UserPlus size={20} /> {isSecretaire ? 'Demander création' : 'Créer un compte'}
        </button>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Utilisateurs</span>
          <span className={styles.statValue}>{stats.total}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Administrateurs</span>
          <span className={styles.statValue}>{stats.admins}</span>
        </div>
        <div className={`${styles.statCard} ${styles.highlight}`}>
          <span className={styles.statLabel}>Enseignants</span>
          <span className={styles.statValue}>{stats.enseignants}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Comptes Inactifs</span>
          <span className={`${styles.statValue} ${styles.error}`}>{stats.inactifs}</span>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <div className={styles.tableToolbar}>
          <div className={styles.searchWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Rechercher par email ou nom..." 
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className={styles.tableActions}>
            <button className={styles.actionBtn}>
              <Filter size={16} /> Filtrer
            </button>
            <button className={styles.actionBtn} onClick={handleExport}>
              <Download size={16} /> Exporter
            </button>
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Type / Rôle Principal</th>
                <th>Statut</th>
                {!isSecretaire && <th style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" style={{ textAlign: 'center' }}>Chargement...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan="4" style={{ textAlign: 'center' }}>Aucun utilisateur trouvé.</td></tr>
              ) : (
                filteredUsers.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className={styles.userInfo}>
                        <div className={styles.avatar}>
                          {u.email.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          {u.nom ? (
                            <h4 className={styles.userName}>{u.prenom} {u.nom}</h4>
                          ) : (
                            <h4 className={styles.userName}>{u.email.split('@')[0]}</h4>
                          )}
                          <p className={styles.userEmail}>{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      {isSecretaire ? (
                        <div className={styles.roleBadge} style={{ border: 'none' }}>{u.roles[0] === 'ROLE_SUPER_ADMIN' ? 'Super Admin' : u.roles[0] === 'ROLE_ADMIN' ? 'Admin' : u.roles[0] === 'ROLE_SECRETAIRE' ? 'Secrétaire' : u.roles[0] === 'ROLE_PROF' ? 'Enseignant' : 'Utilisateur'}</div>
                      ) : (
                      <select 
                        value={u.roles[0] || 'ROLE_USER'} 
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className={styles.roleBadge}
                        style={{ border: 'none', outline: 'none', cursor: 'pointer' }}
                      >
                        <option value="ROLE_SUPER_ADMIN">Super Admin</option>
                        <option value="ROLE_ADMIN">Admin</option>
                        <option value="ROLE_SECRETAIRE">Secrétaire</option>
                        <option value="ROLE_PROF">Enseignant</option>
                        <option value="ROLE_USER">Utilisateur</option>
                      </select>
                      )}
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${u.isActive ? styles.statusActive : styles.statusInactive}`}>
                        {u.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    {!isSecretaire && <td>
                      <div className={styles.rowActions}>
                        <button 
                          className={`${styles.iconBtn} ${u.isActive ? styles.delete : ''}`} 
                          title={u.isActive ? "Désactiver" : "Activer"}
                          onClick={() => handleToggleStatus(u.id)}
                        >
                          {u.isActive ? <PowerOff size={18} /> : <Power size={18} />}
                        </button>
                      </div>
                    </td>}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{isSecretaire ? "Demander la création d'un compte" : "Créer un Utilisateur"}</h2>
              <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreateSubmit}>
              <div className={styles.modalBody}>
                <p style={{ fontSize: 13, color: '#53433e' }}>
                  {isSecretaire 
                    ? "En tant que secrétaire, vous pouvez soumettre une demande de création de compte pour un secrétaire ou un enseignant. Seul un administrateur peut créer des administrateurs."
                    : "Formulaire d'administration pour la création directe d'un compte utilisateur."
                  }
                </p>
                <div className={styles.formGroup}>
                  <label>Email</label>
                  <input className={styles.input} type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>

                <div className={styles.formGroup}>
                  <label>Mot de passe *</label>
                  <div className={styles.passwordWrap}>
                    <input 
                      className={styles.input} 
                      type={showPassword ? "text" : "password"} 
                      required 
                      value={formData.password} 
                      onChange={e => setFormData({...formData, password: e.target.value})} 
                      placeholder="Mot de passe (min 6 caractères)"
                    />
                    <button 
                      type="button" 
                      className={styles.eyeBtn}
                      onClick={() => setShowPassword(prev => !prev)}
                      title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                      aria-label="Afficher/masquer le mot de passe"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Confirmer le mot de passe *</label>
                  <div className={styles.passwordWrap}>
                    <input 
                      className={styles.input} 
                      type={showConfirmPassword ? "text" : "password"} 
                      required 
                      value={formData.confirmPassword} 
                      onChange={e => setFormData({...formData, confirmPassword: e.target.value})} 
                      placeholder="Retapez le mot de passe"
                    />
                    <button 
                      type="button" 
                      className={styles.eyeBtn}
                      onClick={() => setShowConfirmPassword(prev => !prev)}
                      title={showConfirmPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                      aria-label="Afficher/masquer le mot de passe"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Rôle</label>
                  <select className={styles.input} value={formData.roles} onChange={e => setFormData({...formData, roles: e.target.value})}>
                    {!isSecretaire && <option value="ROLE_ADMIN">Administrateur</option>}
                    <option value="ROLE_SECRETAIRE">Secrétaire</option>
                    <option value="ROLE_PROF">Enseignant</option>
                  </select>
                </div>
              </div>
              
              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>Annuler</button>
                <button type="submit" className={styles.saveBtn}>
                  {isSecretaire ? 'Soumettre la demande' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
