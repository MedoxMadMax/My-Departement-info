import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X, AlertCircle } from 'lucide-react';
import styles from './ConfirmModal.module.css';

const ConfirmModal = ({
  isOpen,
  title = 'Confirmation requise',
  message = 'Êtes-vous sûr de vouloir effectuer cette action ? Cette action est irréversible.',
  confirmText = 'Supprimer',
  cancelText = 'Annuler',
  type = 'danger', // 'danger' | 'warning' | 'primary'
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  const isDanger = type === 'danger';

  return (
    <div className={styles.overlay} onClick={!isLoading ? onCancel : undefined}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button
          className={styles.closeBtn}
          onClick={onCancel}
          disabled={isLoading}
          title="Fermer"
        >
          <X size={18} />
        </button>

        <div className={styles.body}>
          <div className={`${styles.iconContainer} ${styles[type]}`}>
            {isDanger ? (
              <Trash2 size={24} />
            ) : type === 'warning' ? (
              <AlertTriangle size={24} />
            ) : (
              <AlertCircle size={24} />
            )}
          </div>

          <div className={styles.content}>
            <h3 className={styles.title}>{title}</h3>
            <p className={styles.message}>{message}</p>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`${styles.confirmBtn} ${styles['confirm_' + type]}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Traitement...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
