import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './ImageSlider.module.css';

const ImageSlider = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const handlePrevious = (e) => {
    e.preventDefault();
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const handleNext = (e) => {
    e.preventDefault();
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  return (
    <div className={styles.sliderContainer}>
      <img
        src={images[currentIndex]}
        alt={`Slide ${currentIndex + 1}`}
        className={styles.image}
      />
      
      {images.length > 1 && (
        <>
          <button className={styles.leftArrow} onClick={handlePrevious}>
            <ChevronLeft size={24} />
          </button>
          <button className={styles.rightArrow} onClick={handleNext}>
            <ChevronRight size={24} />
          </button>
          
          <div className={styles.dotsContainer}>
            {images.map((_, idx) => (
              <div
                key={idx}
                className={`${styles.dot} ${idx === currentIndex ? styles.activeDot : ''}`}
                onClick={(e) => { e.preventDefault(); setCurrentIndex(idx); }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ImageSlider;