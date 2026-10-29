import React from 'react';
import styles from './Loader.module.css';

const Loader = ({ center = false }) => {
  return (
    <div className={`${styles.loaderWrapper} ${center ? styles.center : ''}`}>
      <div className={styles.spinner}></div>
    </div>
  );
};

export default Loader;
