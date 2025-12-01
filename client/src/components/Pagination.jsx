import React, { useMemo } from "react";

const Pagination = ({
  totalPages = 1,
  currentPage = 1,
  onPageChange,
  isLoading = false,
  className = "",
}) => {
  const safeTotalPages = Math.max(Number(totalPages) || 1, 1);
  const safeCurrentPage = Math.min(
    Math.max(Number(currentPage) || 1, 1),
    safeTotalPages
  );

  const pagesToRender = useMemo(() => {
    if (safeTotalPages <= 7) {
      return Array.from({ length: safeTotalPages }, (_, index) => index + 1);
    }

    const range = [];
    const start = Math.max(1, safeCurrentPage - 2);
    const end = Math.min(safeTotalPages, safeCurrentPage + 2);

    if (start > 1) {
      range.push(1);
      if (start > 2) range.push("ellipsis-start");
    }

    for (let page = start; page <= end; page += 1) {
      range.push(page);
    }

    if (end < safeTotalPages) {
      if (end < safeTotalPages - 1) range.push("ellipsis-end");
      range.push(safeTotalPages);
    }

    return range;
  }, [safeCurrentPage, safeTotalPages]);

  if (safeTotalPages <= 1) {
    return null;
  }

  const handleChange = (page) => {
    if (isLoading || !onPageChange || page === safeCurrentPage) return;
    onPageChange(page);
  };

  return (
    <div className={`pagination ${className}`}>
      <button
        type="button"
        className="pagination-btn"
        onClick={() => handleChange(Math.max(safeCurrentPage - 1, 1))}
        disabled={safeCurrentPage === 1 || isLoading}
      >
        Prev
      </button>

      {pagesToRender.map((item) => {
        if (typeof item !== "number") {
          return <span key={item} className="pagination-ellipsis">...</span>;
        }

        const isActive = item === safeCurrentPage;
        return (
          <button
            key={item}
            type="button"
            className={`pagination-btn${isActive ? " active" : ""}`}
            onClick={() => handleChange(item)}
            disabled={isLoading}
          >
            {item}
          </button>
        );
      })}

      <button
        type="button"
        className="pagination-btn"
        onClick={() => handleChange(Math.min(safeCurrentPage + 1, safeTotalPages))}
        disabled={safeCurrentPage === safeTotalPages || isLoading}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
