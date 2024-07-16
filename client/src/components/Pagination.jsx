import React from "react";

const Pagination = ({
  currentPage,
  lastPage,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
}) => {
  const handlePageClick = (page) => {
    onPageChange(page);
  };

  const renderPageNumbers = () => {
    const pages = [];

    if (lastPage <= 5) {
      // If total pages are 5 or less, display all pages
      for (let i = 1; i <= lastPage; i++) {
        pages.push(
          <a
            key={i}
            href={`?page=${i}`}
            onClick={(e) => {
              e.preventDefault();
              handlePageClick(i);
            }}
            className={currentPage === i ? "active" : ""}>
            {i}
          </a>
        );
      }
    } else {
      // Display logic for more than 5 pages
      if (currentPage <= 2) {
        // Display first few pages and dots if applicable
        for (let i = 1; i <= 3; i++) {
          pages.push(
            <a
              key={i}
              href={`?page=${i}`}
              onClick={(e) => {
                e.preventDefault();
                handlePageClick(i);
              }}
              className={currentPage === i ? "active" : ""}>
              {i}
            </a>
          );
        }
        if (lastPage > 5) {
          pages.push(
            <span key="dots1" className="dots">
              ...
            </span>
          );
        }
        pages.push(
          <a
            key={lastPage}
            href={`?page=${lastPage}`}
            onClick={(e) => {
              e.preventDefault();
              handlePageClick(lastPage);
            }}
            className={currentPage === lastPage ? "active" : ""}>
            {lastPage}
          </a>
        );
      } else if (currentPage >= lastPage - 2) {
        // Display last few pages and dots if applicable
        pages.push(
          <a
            key={1}
            href={`?page=${1}`}
            onClick={(e) => {
              e.preventDefault();
              handlePageClick(1);
            }}
            className={currentPage === 1 ? "active" : ""}>
            1
          </a>
        );
        if (lastPage > 5) {
          pages.push(
            <span key="dots2" className="dots">
              ...
            </span>
          );
        }
        for (let i = lastPage - 2; i <= lastPage; i++) {
          pages.push(
            <a
              key={i}
              href={`?page=${i}`}
              onClick={(e) => {
                e.preventDefault();
                handlePageClick(i);
              }}
              className={currentPage === i ? "active" : ""}>
              {i}
            </a>
          );
        }
      } else {
        // Display pages around the current page and dots if applicable
        pages.push(
          <a
            key={1}
            href={`?page=${1}`}
            onClick={(e) => {
              e.preventDefault();
              handlePageClick(1);
            }}
            className={currentPage === 1 ? "active" : ""}>
            1
          </a>
        );
        if (currentPage > 3) {
          pages.push(
            <span key="dots3" className="dots">
              ...
            </span>
          );
        }
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(
            <a
              key={i}
              href={`?page=${i}`}
              onClick={(e) => {
                e.preventDefault();
                handlePageClick(i);
              }}
              className={currentPage === i ? "active" : ""}>
              {i}
            </a>
          );
        }
        if (currentPage < lastPage - 2) {
          pages.push(
            <span key="dots4" className="dots">
              ...
            </span>
          );
        }
        pages.push(
          <a
            key={lastPage}
            href={`?page=${lastPage}`}
            onClick={(e) => {
              e.preventDefault();
              handlePageClick(lastPage);
            }}
            className={currentPage === lastPage ? "active" : ""}>
            {lastPage}
          </a>
        );
      }
    }

    return pages;
  };

  return <section className="pagination">{renderPageNumbers()}</section>;
};

export default Pagination;
