import { useTranslation } from 'react-i18next';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (limit: number) => void;
  showItemsPerPage?: boolean;
  itemsPerPageOptions?: number[];
  // Optional backend-provided navigation hints
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
  nextPage?: number | null;
  prevPage?: number | null;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  showItemsPerPage = true,
  itemsPerPageOptions = [5, 10, 20, 50],
  hasNextPage,
  hasPrevPage,
  nextPage,
  prevPage
}: PaginationProps) {
  const { t } = useTranslation();
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  // Always show pagination if there are items, even with just one page
  // This allows users to change items per page

  return (
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
      {/* Items per page selector */}
      {showItemsPerPage && onItemsPerPageChange && (
        <div className="d-flex align-items-center">
          <label htmlFor="itemsPerPage" className="form-label me-2 mb-0 small">
            {t('pagination.showing')}:
          </label>
          <select
            id="itemsPerPage"
            className="form-select form-select-sm"
            style={{ width: 'auto' }}
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            aria-label={t('pagination.itemsPerPage')}
          >
            {itemsPerPageOptions.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <span className="ms-2 text-muted small">{t('pagination.perPage')}</span>
        </div>
      )}

      {/* Pagination info */}
      <div className="text-muted small" aria-live="polite">
        {t('pagination.showingRange', { start: startItem, end: endItem, total: totalItems })}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <nav aria-label={t('pagination.navigation')}>
          <ul className="pagination pagination-sm mb-0">
            {/* Previous button */}
            <li className={`page-item ${hasPrevPage !== undefined ? (!hasPrevPage ? 'disabled' : '') : (currentPage === 1 ? 'disabled' : '')}`}>
              <button
                className="page-link"
                onClick={() => onPageChange(prevPage || currentPage - 1)}
                disabled={hasPrevPage !== undefined ? !hasPrevPage : currentPage === 1}
                aria-label={t('pagination.previous')}
              >
                <i className="bi bi-chevron-left" aria-hidden="true"></i>
              </button>
            </li>

            {/* Page numbers */}
            {getVisiblePages().map((page, index) => (
              <li key={index} className={`page-item ${page === currentPage ? 'active' : ''}`}>
                {page === '...' ? (
                  <span className="page-link">...</span>
                ) : (
                  <button
                    className="page-link"
                    onClick={() => onPageChange(page as number)}
                    aria-label={t('pagination.page', { page })}
                    aria-current={page === currentPage ? 'page' : undefined}
                  >
                    {page}
                  </button>
                )}
              </li>
            ))}

            {/* Next button */}
            <li className={`page-item ${hasNextPage !== undefined ? (!hasNextPage ? 'disabled' : '') : (currentPage === totalPages ? 'disabled' : '')}`}>
              <button
                className="page-link"
                onClick={() => onPageChange(nextPage || currentPage + 1)}
                disabled={hasNextPage !== undefined ? !hasNextPage : currentPage === totalPages}
                aria-label={t('pagination.next')}
              >
                <i className="bi bi-chevron-right" aria-hidden="true"></i>
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
