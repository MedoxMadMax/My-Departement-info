import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './Pagination.module.css';

const Pagination = ({
  currentPage = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  className = '',
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);

  if (totalPages <= 1) {
    return null;
  }

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const delta = 1;
    const pages = [];
    
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (
        (i === currentPage - delta - 1 && i > 1) ||
        (i === currentPage + delta + 1 && i < totalPages)
      ) {
        pages.push('...');
      }
    }

    return pages.filter((page, index, arr) => {
      return page !== '...' || arr[index - 1] !== '...';
    });
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className={`${styles.paginationContainer} ${className}`}>
      <div className={styles.info}>
        Affichage de <strong>{startItem}</strong> à <strong>{endItem}</strong> sur <strong>{totalItems}</strong> éléments
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          className={`${styles.pageBtn} ${styles.navBtn}`}
          onClick={handlePrev}
          disabled={currentPage === 1}
          aria-label="Page précédente"
        >
          <ChevronLeft size={16} />
          <span>Précédent</span>
        </button>

        <div className={styles.pageNumbers}>
          {getPageNumbers().map((page, index) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${index}`} className={styles.ellipsis}>
                  ...
                </span>
              );
            }
            const isCurrent = page === currentPage;
            return (
              <button
                key={page}
                type="button"
                className={`${styles.pageBtn} ${styles.numberBtn} ${
                  isCurrent ? styles.active : ''
                }`}
                onClick={() => onPageChange(page)}
                aria-current={isCurrent ? 'page' : undefined}
              >
                {page}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className={`${styles.pageBtn} ${styles.navBtn}`}
          onClick={handleNext}
          disabled={currentPage === totalPages}
          aria-label="Page suivante"
        >
          <span>Suivant</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
