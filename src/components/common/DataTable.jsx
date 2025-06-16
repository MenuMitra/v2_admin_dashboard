import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSort,
  faSortUp,
  faSortDown,
  faChevronLeft,
  faChevronRight,
  faChevronLeft as faBack,
  faMagnifyingGlass,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";

function DataTable({
  data,
  columns,
  itemsPerPage = 10,
  enableSort = true,
  enablePagination = true,
  enableSearch = true,
  searchTerm = "",
  onSearchChange,
  customRowRender,
  darkMode = false,

  title = "",
  counts = {
    total: 0,
    active: 0,
    inactive: 0
  },
  onBackClick = () => {},
  createButton = {
    show: true,
    label: "Create",
    icon: faPlus,
    onClick: () => {},
    className: "bg-success-500 hover:bg-success-600",
    position: "right",
    showIconOnly: false,
    disabled: false,
    tooltip: "",
  },
  searchPlaceholder = "Search...",
  showBackButton = true,
  showCreateButton = true,
  showSearch = true,
  backButtonLabel = "Back",
  showHeader = true
}) {
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortCount, setSortCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Sorting Logic
  const handleSort = (field) => {
    if (!enableSort) return;

    if (sortField === field) {
      if (sortCount === 0) {
        setSortOrder("asc");
        setSortCount(1);
      } else if (sortCount === 1) {
        setSortOrder("desc");
        setSortCount(2);
      } else {
        setSortField(null);
        setSortOrder("asc");
        setSortCount(0);
      }
    } else {
      setSortField(field);
      setSortOrder("asc");
      setSortCount(1);
    }
  };

  // Sort Icon Renderer
  const renderSortIcon = (field) => {
    if (!enableSort) return null;
    
    if (sortField !== field) {
      return (
        <FontAwesomeIcon icon={faSort} className="ml-1 text-gray-400 w-4 h-4" />
      );
    }
    return sortOrder === "asc" ? (
      <FontAwesomeIcon icon={faSortUp} className="ml-1 text-brand-500 w-4 h-4" />
    ) : (
      <FontAwesomeIcon icon={faSortDown} className="ml-1 text-brand-500 w-4 h-4" />
    );
  };

  // Data Processing
  const getSortedAndFilteredData = () => {
    let processedData = [...data];

    // Apply search if enabled
    if (enableSearch && searchTerm) {
      processedData = processedData.filter((item) =>
        Object.values(item).some(
          (value) =>
            value &&
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply sorting if enabled and sortField is set
    if (enableSort && sortField) {
      processedData.sort((a, b) => {
        let aValue = a[sortField] || "";
        let bValue = b[sortField] || "";

        if (typeof aValue === "number") {
          return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
        }

        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();

        if (sortOrder === "asc") {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }

    return processedData;
  };

  // Pagination Logic
  const processedData = getSortedAndFilteredData();
  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = processedData.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Pagination Numbers Renderer
  const renderPaginationNumbers = () => {
    const pages = [];
    const maxVisiblePages = 7;
    let startPage = 1;
    let endPage = totalPages;

    if (totalPages > maxVisiblePages) {
      const middlePage = Math.floor(maxVisiblePages / 2);
      if (currentPage <= middlePage) {
        endPage = maxVisiblePages;
      } else if (currentPage + middlePage >= totalPages) {
        startPage = totalPages - maxVisiblePages + 1;
      } else {
        startPage = currentPage - middlePage;
        endPage = currentPage + middlePage;
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <li key={i}>
          <button
            onClick={() => handlePageChange(i)}
            className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium ${
              currentPage === i
                ? "bg-brand-500 text-white"
                : `text-gray-700 hover:bg-brand-500 hover:text-white ${
                    darkMode ? "dark:text-gray-400 dark:hover:text-white" : ""
                  }`
            }`}
          >
            {i}
          </button>
        </li>
      );
    }

    if (startPage > 1) {
      pages.unshift(
        <li key="start-ellipsis">
          <span className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium text-gray-700 ${darkMode ? "dark:text-gray-400" : ""}`}>
            ...
          </span>
        </li>
      );
    }
    if (endPage < totalPages) {
      pages.push(
        <li key="end-ellipsis">
          <span className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium text-gray-700 ${darkMode ? "dark:text-gray-400" : ""}`}>
            ...
          </span>
        </li>
      );
    }

    return pages;
  };

  // Merge legacy props with new createButton object for backward compatibility
  const mergedCreateButton = {
    ...{
      show: showCreateButton,
      label: createButton.label,
      onClick: createButton.onClick,
      icon: createButton.icon,
      className: createButton.className,
      position: createButton.position,
      showIconOnly: createButton.showIconOnly,
      disabled: createButton.disabled,
      tooltip: createButton.tooltip,
    },
    ...createButton
  };

  const renderCreateButton = () => {
    if (!mergedCreateButton.show) return null;

    const buttonClasses = `
      inline-flex items-center gap-2 
      px-3 py-1.5 sm:px-4 sm:py-2 
      text-sm font-medium text-white 
      transition rounded-full 
      shadow-theme-xs
      ${mergedCreateButton.disabled ? 'opacity-50 cursor-not-allowed' : ''}
      ${mergedCreateButton.className}
    `;

    return (
      <button 
        onClick={mergedCreateButton.onClick}
        disabled={mergedCreateButton.disabled}
        className={buttonClasses}
        title={mergedCreateButton.tooltip}
      >
        <FontAwesomeIcon 
          icon={mergedCreateButton.icon} 
          className="w-4 h-4" 
        />
        {!mergedCreateButton.showIconOnly && (
          <span className="hidden sm:inline">
            {mergedCreateButton.label}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className={`rounded-2xl border border-gray-200 bg-white ${darkMode ? "dark:border-gray-800 dark:bg-white/[0.03]" : ""}`}>
      {/* Header Section */}
      {showHeader && (
        <div className="overflow-hidden pt-4 dark:border-gray-800 dark:bg-white/[0.03]">
          {/* Top Row - Back, Title, Create */}
          <div className="flex items-center px-6 mb-3">
            {/* Left Side */}
            <div className={`flex items-center gap-2 ${
              mergedCreateButton.position === 'left' ? 'order-2' : 'order-1'
            }`}>
              {showBackButton && (
                <button 
                  onClick={onBackClick}
                  className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white transition rounded-full bg-brand-500 hover:bg-brand-600 shadow-theme-xs"
                >
                  <FontAwesomeIcon icon={faBack} className="w-4 h-4" />
                  <span className="hidden sm:inline">{backButtonLabel}</span>
                </button>
              )}
              {mergedCreateButton.position === 'left' && renderCreateButton()}
            </div>

            {/* Center - Title */}
            <div className={`text-lg sm:text-xl font-semibold text-gray-800 dark:text-white/90 ${
              mergedCreateButton.position === 'center' ? 'flex items-center gap-4' : 'flex-1 text-center'
            }`}>
              {title}
              {mergedCreateButton.position === 'center' && renderCreateButton()}
            </div>

            {/* Right Side */}
            <div className={`flex items-center justify-end ${
              mergedCreateButton.position === 'right' ? 'order-3' : 'order-2'
            }`}>
              {mergedCreateButton.position === 'right' && renderCreateButton()}
            </div>
          </div>

          {/* Stats and Search - Responsive Layout */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 sm:items-center justify-between px-6 mb-4">
            {/* Stats - Scrollable on Mobile */}
            <div className="flex items-center gap-4 sm:gap-6 text-sm overflow-x-auto whitespace-nowrap pb-2 sm:pb-0">
              <span className="font-medium text-gray-800 dark:text-white/90 shrink-0">
                Total: {counts.total}
              </span>
              <span className="text-success-600 shrink-0">
                Active: {counts.active}
              </span>
              <span className="text-error-500 shrink-0">
                Inactive: {counts.inactive}
              </span>
            </div>

            {/* Search - Full Width on Mobile */}
            {showSearch && (
              <div className="relative w-full sm:w-auto">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                  <FontAwesomeIcon icon={faMagnifyingGlass} className="w-4 h-4" />
                </span>
                <input 
                  placeholder={searchPlaceholder}
                  className="w-full sm:w-[250px] h-10 rounded-lg border border-gray-200 bg-transparent py-2 pr-4 pl-12 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:ring-brand-500/10 focus:border-brand-300 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 shadow-theme-xs"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <table className="w-full">
          <thead>
            <tr className={`border-t border-gray-100 ${darkMode ? "dark:border-gray-800" : ""}`}>
              {columns.map((column) => (
                <th
                  key={column.field}
                  className={`px-6 py-3 text-center ${
                    enableSort && column.sortable
                      ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                      : ""
                  }`}
                  onClick={() =>
                    column.sortable ? handleSort(column.field) : null
                  }
                >
                  <div className="flex items-center justify-center">
                    <p className={`font-medium text-gray-500 text-theme-xs ${darkMode ? "dark:text-gray-400" : ""}`}>
                      {column.header}
                    </p>
                    {column.sortable && renderSortIcon(column.field)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item, index) => (
              customRowRender ? (
                customRowRender(item, index)
              ) : (
                <tr key={index} className={`border-t border-gray-100 ${darkMode ? "dark:border-gray-800" : ""}`}>
                  {columns.map((column) => (
                    <td key={column.field} className="px-6 py-3.5 text-center">
                      {column.render ? (
                        column.render(item[column.field], item)
                      ) : (
                        <p className={`text-gray-500 text-theme-sm ${darkMode ? "dark:text-gray-400" : ""}`}>
                          {item[column.field]}
                        </p>
                      )}
                    </td>
                  ))}
                </tr>
              )
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Section */}
      {enablePagination && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800">
          <div className={`text-gray-500 text-theme-sm ${darkMode ? "dark:text-gray-400" : ""}`}>
            Showing {indexOfFirstItem + 1} to{" "}
            {Math.min(indexOfLastItem, processedData.length)} of{" "}
            {processedData.length} entries
          </div>

          <div className="flex items-center justify-between gap-2 sm:justify-normal">
            <button
              onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`flex items-center gap-2 rounded-lg border border-gray-300 bg-white p-2 sm:p-2.5 text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 ${
                darkMode ? "dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200" : ""
              } ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <FontAwesomeIcon icon={faChevronLeft} className="w-5 h-5" />
            </button>

            <span className={`block text-sm font-medium text-gray-700 ${darkMode ? "dark:text-gray-400" : ""} sm:hidden`}>
              Page {currentPage} of {totalPages}
            </span>

            <ul className="hidden items-center gap-0.5 sm:flex">
              {renderPaginationNumbers()}
            </ul>

            <button
              onClick={() =>
                currentPage < totalPages && handlePageChange(currentPage + 1)
              }
              disabled={currentPage === totalPages}
              className={`flex items-center gap-2 rounded-lg border border-gray-300 bg-white p-2 sm:p-2.5 text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 ${
                darkMode ? "dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200" : ""
              } ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <FontAwesomeIcon icon={faChevronRight} className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable; 