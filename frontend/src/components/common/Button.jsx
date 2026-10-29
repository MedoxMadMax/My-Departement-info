import React from 'react';
import styles from './Button.module.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon = null, 
  fullWidth = false, 
  disabled = false, 
  onClick, 
  type = 'button',
  className = ''
}) => {
  const baseClass = `${styles.btn} ${styles[variant]} ${styles[size]} ${fullWidth ? styles.fullWidth : ''} ${className}`;

  return (
    <button 
      type={type} 
      className={baseClass} 
      disabled={disabled} 
      onClick={onClick}
    >
      {children}
      {icon && <span className={styles.icon}>{icon}</span>}
    </button>
  );
};

export default Button;
