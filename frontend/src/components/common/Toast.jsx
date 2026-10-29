import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import styles from './Toast.module.css';

const Toast = ({ message, type = 'success', duration = 5000, onClose }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!message) return;
    const interval = 50;
    const step = (100 / (duration / interval));
    
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          if (onClose) onClose();
          return 0;
        }
        return prev - step;
      });
    }, interval);

    const closeTimeout = setTimeout(() => {
      if (onClose) onClose();
    }, duration);

    return () => {
      clearInterval(timer);
      clearTimeout(closeTimeout);
    };
  }, [message, duration, onClose]);

  if (!message) return null;

  const getIcon = () => {
    if (type === 'error') return <AlertCircle size={20} />;
    if (type === 'info') return <Info size={20} />;
    return <CheckCircle2 size={20} />;
  };

  return (
    <div className={`${styles.toast} ${styles[type] || styles.success}`}>
      <div className={styles.icon}>{getIcon()}</div>
      <div className={styles.message}>{message}</div>
      <button className={styles.closeBtn} onClick={onClose} aria-label="Fermer">
        <X size={16} />
      </button>
      <div className={styles.progressBar} style={{ width: `${progress}%` }} />
    </div>
  );
};

export default Toast;