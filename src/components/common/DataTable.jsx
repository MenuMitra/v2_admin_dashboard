import React, { useState, useEffect, useRef } from "react";
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
  faSpinner,
  faCircleCheck,
  faCircleXmark,
  faGear,
  faRotate,
  faTimes,
  faCheck,
  faXmark,
  faToggleOn,
  faToggleOff,
  faEye,
  faEyeSlash,
  faPlay,
  faPause,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import PropTypes from "prop-types";

const defaultGetRowId = (item) => {
  if (!item || typeof item !== "object") return null;
  const possibleKeys = [
    "id",
    "user_id",
    "outlet_id",
    "menu_id",
    "role_id",
    "notification_id",
    "enquiry_id",
    "uuid",
    "_id",
  ];
  for (const key of possibleKeys) {
    if (item[key] !== undefined && item[key] !== null) {
      return item[key];
    }
  }
  return null;
};

function DataTable({
  data = [],
  columns,
  itemsPerPage = 50,
  itemsPerPageOptions = [50, 100, 200],
  enableSort = true,
  enablePagination = true,
  enableSearch = true,
  searchTerm = "",
  onSearchChange,
  customRowRender,
  darkMode = false,

  title = "",
  dashboardTitle = "",
  counts = {
    total: 0,
    active: 0,
    inactive: 0,
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
  searchPlaceholder = "Search",
  showBackButton = true,
  showCreateButton = true,
  showSearch = true,
  backButtonLabel = "Back",
  showHeader = true,
  showOutletSelect = false,
  outlets = [],
  selectedOutlet = "",
  onOutletChange = () => {},
  outletSelectPosition = "controls",
  onShowData = () => {},
  isLoading = false,
  enableSelection = false,
  onSelectionChange = () => {},
  onBulkAction = () => {},
  enableStatusFilter = true,
  onStatusFilterChange = () => {},
  statusFilter = "all",
  isItemSelectable = () => true,
  bulkActionOptions,
  onItemsPerPageChange = () => {},
  emptyStateMessage = "No data found.",
  emptyStateMessageByStatus = {
    all: "No data found.",
    active: "No active items found.",
    inactive: "No inactive items found.",
  },
  statusField = "is_active",
  showRoleSelect = false,
  roles = [],
  selectedRole = "",
  onRoleChange = () => {},
  customFilters = [],
  onReload = null,
  accountType = "all",
  onAccountTypeChange = () => {},
  openCloseStatus = "all",
  onOpenCloseStatusChange = () => {},
  enableAccountTypeFilter = false,
  enableOpenCloseStatusFilter = false,
  enableEnquiry = false,
  enquiryFilter = "all",
  onEnquiryFilterChange = () => {},
  enableActiveSessionFilter = false,
  activeSessionFilter = "all",
  onActiveSessionFilterChange = () => {},
  enableOutletCountFilter = false,
  outletCountFilter = "all",
  onOutletCountFilterChange = () => {},
  defaultSortField,
  defaultSortOrder,
  enableOutletTypeFilter = false,
  outletTypeFilter = "all",
  onOutletTypeFilterChange = () => {},
  enableOutletModeFilter = false,
  outletModeFilter = "all",
  onOutletModeFilterChange = () => {},
  enableOwnerCountFilter = false,
  ownerCountFilter = "all",
  onOwnerCountFilterChange = () => {},
  enableExecutionTimeFilter = false,
  executionTimeFilter = "all",
  onExecutionTimeFilterChange = () => {},
  forceTopControls = false,
  getRowId = defaultGetRowId,
}) {
  // Add data validation at the start of the component
  const safeData = Array.isArray(data) ? data : [];

  // Ensure columns always has 6 items
  // Center align columns by default unless specified
  const paddedColumns =
    columns.length < 6
      ? [
          ...columns.map((col) => ({
            ...col,
            textAlign: col.textAlign || "center",
          })),
          ...Array(6 - columns.length).fill({
            field: "",
            header: "",
            sortable: false,
            textAlign: "center",
          }),
        ]
      : columns.map((col) => ({
          ...col,
          textAlign: col.textAlign || "center",
        }));

  // Set default sortField and sortOrder using props if provided
  const hasCreatedAt = safeData.length > 0 && safeData[0].created_at;
  const [sortField, setSortField] = useState(
    defaultSortField || (hasCreatedAt ? "created_at" : null)
  );
  const [sortOrder, setSortOrder] = useState(defaultSortOrder || "desc");
  const [sortCount, setSortCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isActionDropdownOpen, setIsActionDropdownOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [internalItemsPerPage, setInternalItemsPerPage] = useState(itemsPerPage);
  const actionDropdownRef = useRef(null);

  /* ------------------------------------------------------------
    Make sure we're on a valid page after every filter / data change
    ------------------------------------------------------------ */
  useEffect(() => {
    // Go back to page-1 whenever the search term changes
    // or the number of items changes (avoid resetting when parent
    // passes a new array reference with same contents).
    setCurrentPage(1);
  }, [searchTerm, safeData.length]);

  // Sync internal itemsPerPage with prop changes
  useEffect(() => {
    setInternalItemsPerPage(itemsPerPage);
  }, [itemsPerPage]);

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
        // Reset to created_at/desc if available, otherwise clear sort
        if (hasCreatedAt) {
          setSortField("created_at");
          setSortOrder("desc");
          setSortCount(0);
        } else {
          setSortField(null);
          setSortOrder("asc");
          setSortCount(0);
        }
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

    // Always show a sort icon for sortable columns
    let icon = faSort;
    let iconClass = "text-gray-400 w-4 h-4";
    let style = {};

    if (sortField === field) {
      icon = sortOrder === "asc" ? faSortUp : faSortDown;
      iconClass = "text-brand-500 w-4 h-4";
      style = {
        transform: sortOrder === "asc" ? "translateY(2px)" : "translateY(-2px)",
      };
    }

    return (
      <span className="inline-flex justify-center items-center ml-1 w-4">
        <FontAwesomeIcon 
          icon={icon} 
          className={`${iconClass} ${sortField === field && sortOrder === "asc" ? "translate-y-0.5" : sortField === field && sortOrder === "desc" ? "-translate-y-0.5" : ""}`} 
        />
      </span>
    );
  };

  // Add normalizeStatus utility function
  const normalizeStatus = (value) => {
    if (value === null || value === undefined) return false;
    return value === true || value === 1 || value === "1";
  };

  // Data Processing
  const getSortedAndFilteredData = () => {
    // Use safeData instead of data directly
    let processedData = [...safeData];

    // Sort by sortField and sortOrder, or by created_at/desc by default
    if (enableSort && sortField) {
      processedData.sort((a, b) => {
        if (!a || !b) return 0;
        let aValue = a[sortField];
        let bValue = b[sortField];
        // Special handling for status field
        if (sortField === statusField) {
          aValue = normalizeStatus(aValue);
          bValue = normalizeStatus(bValue);
        }
        // Date sort for created_at
        if (sortField === "created_at") {
          const dateA = new Date(aValue);
          const dateB = new Date(bValue);
          return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
        }
        if (typeof aValue === "number") {
          return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
        }
        aValue = String(aValue ?? "");
        bValue = String(bValue ?? "");
        if (sortOrder === "asc") {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      });
    } else if (hasCreatedAt) {
      processedData.sort((a, b) => {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return dateB - dateA; // Newest first
      });
    }

    // Update status filtering with normalized values
    if (enableStatusFilter && statusFilter !== "all") {
      processedData = processedData.filter((item) => {
        const isActive = normalizeStatus(item[statusField]);
        return statusFilter === "active" ? isActive : !isActive;
      });
    }

    // Update execution time filtering
    if (enableExecutionTimeFilter && executionTimeFilter !== "all") {
      processedData = processedData.filter((item) => {
        const executionTimeStr = item.avg_execution_time || "";
        // Extract numeric value from strings like "46 milli sec"
        const match = executionTimeStr.match(/(\d+)/);
        if (!match) return false;

        const executionTimeMs = parseInt(match[1], 10);
        const filterThreshold = parseInt(executionTimeFilter, 10);

        return executionTimeMs > filterThreshold;
      });
    }

    // Update search with null/undefined handling
    if (enableSearch && searchTerm) {
      processedData = processedData.filter((item) => {
        if (!item) return false; // Add null check for items
        return Object.values(item).some(
          (value) =>
            value !== null &&
            value !== undefined &&
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    return processedData;
  };

  // Pagination Logic
  const processedData = getSortedAndFilteredData();
  const totalPages = Math.ceil(processedData.length / internalItemsPerPage);
  const indexOfLastItem = currentPage * internalItemsPerPage;
  const indexOfFirstItem = indexOfLastItem - internalItemsPerPage;
  const currentItems = processedData.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Replace renderPaginationNumbers with a version that shows only 3 page numbers at a time (current, previous, next), with ellipsis if needed
  const renderPaginationNumbers = () => {
    const pages = [];
    if (totalPages <= 3) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <li key={i}>
            <button
              onClick={() => handlePageChange(i)}
              className={`flex h-10 w-10 items-center justify-center rounded-3xl text-sm font-medium ${
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
    } else {
      // Show ellipsis if needed
      if (currentPage > 2) {
        pages.push(
          <li key="start-ellipsis">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium text-gray-700">
              ...
            </span>
          </li>
        );
      }
      // Show previous page if not on first page
      if (currentPage > 1) {
        pages.push(
          <li key={currentPage - 1}>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              className={`flex h-10 w-10 items-center justify-center rounded-3xl text-sm font-medium text-gray-700 hover:bg-brand-500 hover:text-white ${
                darkMode ? "dark:text-gray-400 dark:hover:text-white" : ""
              }`}
            >
              {currentPage - 1}
            </button>
          </li>
        );
      }
      // Show current page
      pages.push(
        <li key={currentPage}>
          <button
            onClick={() => handlePageChange(currentPage)}
            className="flex h-10 w-10 items-center justify-center rounded-3xl text-sm font-medium bg-brand-500 text-white"
          >
            {currentPage}
          </button>
        </li>
      );
      // Show next page if not on last page
      if (currentPage < totalPages) {
        pages.push(
          <li key={currentPage + 1}>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              className={`flex h-10 w-10 items-center justify-center rounded-3xl text-sm font-medium text-gray-700 hover:bg-brand-500 hover:text-white ${
                darkMode ? "dark:text-gray-400 dark:hover:text-white" : ""
              }`}
            >
              {currentPage + 1}
            </button>
          </li>
        );
      }
      if (currentPage < totalPages - 1) {
        pages.push(
          <li key="end-ellipsis">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium text-gray-700">
              ...
            </span>
          </li>
        );
      }
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
    ...createButton,
  };

  const renderCreateButton = () => {
    if (!mergedCreateButton.show) return null;

    const buttonClasses = `
      inline-flex items-center gap-2 
      px-3 py-1.5 sm:px-4 sm:py-2 
      text-sm font-medium text-white 
      transition rounded-full 
      shadow-theme-xs
      ${mergedCreateButton.disabled ? "opacity-50 cursor-not-allowed" : ""}
      ${mergedCreateButton.className}
    `;

    return (
      <button
        onClick={mergedCreateButton.onClick}
        disabled={mergedCreateButton.disabled}
        className={buttonClasses}
        title={mergedCreateButton.tooltip}
      >
        <FontAwesomeIcon icon={mergedCreateButton.icon} className="w-4 h-4" />
        {!mergedCreateButton.showIconOnly && (
          <span className="hidden sm:inline">{mergedCreateButton.label}</span>
        )}
      </button>
    );
  };

  // Add selection handling functions
  const resolveRowId = (item) => {
    if (!item) return null;
    try {
      const value = getRowId(item);
      return value !== undefined ? value : null;
    } catch {
      return null;
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const selectableIds = currentItems
        .filter((item) => isItemSelectable(item))
        .map((item) => resolveRowId(item))
        .filter((id) => id !== null && id !== undefined);
      setSelectedItems(selectableIds);
      onSelectionChange(selectableIds);
    } else {
      setSelectedItems([]);
      onSelectionChange([]);
    }
  };

  const handleSelectItem = (id) => {
    if (id === null || id === undefined) return;
    setSelectedItems((prev) => {
      const newSelection = prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id];
      onSelectionChange(newSelection);
      return newSelection;
    });
  };

  // Update the renderOutletSelect function
  const renderOutletSelect = () => {
    if (!showOutletSelect) return null;

    return (
      <div className="relative flex-1 sm:flex-initial">
        <select
          className={`w-full sm:w-64 px-4 pr-10 py-2 border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm text-gray-700 ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          value={selectedOutlet}
          onChange={(e) => onOutletChange(e.target.value)}
          disabled={isLoading}
        >
          <option value="">Outlets</option>
          {outlets.map((outlet) => (
            <option key={outlet.outlet_id} value={outlet.outlet_id}>
              {outlet.outlet_name}
              {/* ({outlet.outlet_code}) */}
            </option>
          ))}
        </select>
        {isLoading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            <FontAwesomeIcon
              icon={faSpinner}
              className="h-4 w-4 animate-spin text-gray-400"
            />
          </span>
        )}
      </div>
    );
  };

  // Add renderRoleSelect function
  const renderRoleSelect = () => {
    if (!showRoleSelect) return null;

    return (
      <div className="relative flex-1 sm:flex-initial">
        <select
          className={`w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm text-gray-700 ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          value={selectedRole}
          onChange={(e) => onRoleChange(e.target.value)}
          disabled={isLoading}
        >
          <option value="">Roles</option>
          {roles.map((role) => (
            <option key={role.role_id} value={role.role_id}>
              {role.role_name}
              {/* ({role.count}) */}
            </option>
          ))}
        </select>
        {isLoading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            <FontAwesomeIcon
              icon={faSpinner}
              className="h-4 w-4 animate-spin text-gray-400"
            />
          </span>
        )}
      </div>
    );
  };

  // Add these helper functions near the top of the component
  const shouldShowPagination = () => processedData.length > internalItemsPerPage;
  const shouldShowNavigationButtons = () => totalPages > 1;
  const currentPageInfo = `Page ${currentPage} of ${Math.max(totalPages, 1)}`;

  // Update the helper functions
  const shouldDisableNavigation = {
    prev: () => currentPage === 1,
    next: () => currentPage === totalPages,
  }; 

  // Add this helper function
  const isAllCurrentItemsSelected = () => {
    const selectableItems = currentItems.filter((item) =>
      isItemSelectable(item)
    );
    if (selectableItems.length === 0) return false;
    return selectableItems.every((item) => {
      const rowId = resolveRowId(item);
      if (rowId === null || rowId === undefined) return false;
      return selectedItems.includes(rowId);
    });
  };

  useEffect(() => {
    if (!isActionDropdownOpen) return;

    const handleClickOutside = (event) => {
      if (
        actionDropdownRef.current &&
        !actionDropdownRef.current.contains(event.target)
      ) {
        setIsActionDropdownOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsActionDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isActionDropdownOpen]);

  // Update renderStatus to use normalized values
  const renderStatus = (value) => (
    <div className="flex items-center justify-center gap-2">
      <FontAwesomeIcon
        icon={normalizeStatus(value) ? faCircleCheck : faCircleXmark}
        className={`w-5 h-5 ${
          normalizeStatus(value) ? "text-success-500" : "text-error-500"
        }`}
      />
    </div>
  );

  // Add this new function to render custom filters
  const renderCustomFilters = () => {
    if (!customFilters || customFilters.length === 0) return null;

    return (
      <div className="flex flex-wrap items-center gap-4">
        {customFilters.map((filter, index) => (
          <React.Fragment key={index}>
            {filter.type === "custom" && (
              <div className="relative z-[3]">
                {filter.component}
              </div>
            )}
            {filter.type === "select" && (
              <div className="relative">
                <select
                  className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm text-gray-700"
                  value={filter.value}
                  onChange={(e) => filter.onChange(e.target.value)}
                >
                  <option value="">
                    {filter.placeholder || `Select ${filter.label}`}
                  </option>
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderReloadButton = (extraClasses = "") => {
    if (!onReload) return null;

    return (
      <button
        onClick={onReload}
        disabled={isLoading}
        className={`inline-flex items-center justify-center w-10 h-10 mr-2 rounded-3xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-300 disabled:opacity-50 disabled:cursor-not-allowed ${extraClasses}`}
        title="Reload data"
      >
        <FontAwesomeIcon
          icon={faRotate}
          className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
        />
      </button>
    );
  };

  const renderSearchInput = (extraWrapperClasses = "") => {
    if (!showSearch) return null;

    return (
      <div className={`relative ${extraWrapperClasses}`}>
        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="w-4 h-4" />
        </span>
        <input
          placeholder={searchPlaceholder}
          className="sm:w-[250px] h-10 rounded-lg border border-gray-300 bg-transparent py-2 pr-4 pl-12 text-sm text-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-300 focus:outline-none"
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          ref={(input) => {
            if (input) {
              input.searchInputRef = input;
            }
          }}
        />

        {searchTerm && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onSearchChange("");
              const searchInput = e.target.closest(".relative").querySelector("input");
              if (searchInput) {
                searchInput.focus();
              }
            }}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  };

  const shouldShowTopSearchAndReload = enableExecutionTimeFilter || forceTopControls;
  const shouldShowBottomSearch = !shouldShowTopSearchAndReload && showSearch;
  const shouldShowBottomReload = !shouldShowTopSearchAndReload && !!onReload;

  // Add error boundary wrapper
  try {
    // Set default bulk actions if not provided
    const defaultBulkActionOptions = [
      {
        key: "active",
        label: "Active",
        icon: faCheck,
        className: "text-success-700 hover:bg-gray-100",
      },
      {
        key: "inactive",
        label: "Inactive",
        icon: faXmark,
        className: "text-error-600 hover:bg-gray-100",
      },
      {
        key: "delete",
        label: "Delete",
        icon: faTrash,
        className: "text-error-600 hover:bg-error-50",
      },
    ];
    const defaultOptionIcons = {
      active: faCheck,
      inactive: faXmark,
      delete: faTrash,
    };
    const resolvedBulkActionOptions = (bulkActionOptions || defaultBulkActionOptions).map(
      (option) => ({
        ...option,
        // Ensure icons appear for standard actions even when parent omits them
        icon: option.icon || defaultOptionIcons[option.key] || null,
      })
    );

    return (
      <div
        className={`rounded-2xl border border-gray-200 bg-white ${
          darkMode ? "dark:border-gray-800 dark:bg-white/[0.03]" : ""
        }`}
      >
        {/* Header Section */}
        {showHeader && (
          <div className="pt-4 dark:border-gray-800 dark:bg-white/[0.03]">
            {/* Top Row - Back, Title, Create */}
            <div className="flex items-center px-6 mb-3">
              {/* Left Side */}
              <div
                className={`flex items-center gap-2 ${
                  mergedCreateButton.position === "left" ? "order-2" : "order-1"
                }`}
              >
                {showBackButton && (
                  <button
                    onClick={onBackClick}
                    className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-gray-700 transition rounded-full border border-gray-300 bg-white hover:bg-gray-50 shadow-theme-xs"
                  >
                    <FontAwesomeIcon icon={faBack} className="w-4 h-4" />
                    <span className="hidden sm:inline">{backButtonLabel}</span>
                  </button>
                )}
                {mergedCreateButton.position === "left" && renderCreateButton()}
              </div>

              {/* Center - Title */}
              <div
                className={`text-lg sm:text-xl font-semibold text-gray-800 dark:text-white/90 ${
                  mergedCreateButton.position === "center"
                    ? "flex items-center gap-4"
                    : "flex-1 text-center"
                }`}
              >
                {title}
                {mergedCreateButton.position === "center" &&
                  renderCreateButton()}
              </div>

              {/* Right Side */}
              <div
                className={`flex items-center justify-end ${
                  mergedCreateButton.position === "right"
                    ? "order-3"
                    : "order-2"
                }`}
              >
                {mergedCreateButton.position === "right" &&
                  renderCreateButton()}
              </div>
            </div>

            {/* Stats Row */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-0 sm:items-center justify-between px-0 pl-2 mb-2">
              {/* Left: Stats as badges */}
              {counts && (
                <div className="flex items-center gap-2 text-sm flex-wrap">
                  <span className="font-medium text-gray-800 dark:text-white/90">
                    Total: {processedData.length}
                  </span>
                  {typeof counts.enquiry === "number" && (
                    <span className="font-medium bg-warning-100 text-warning-500 px-2 py-0.5 rounded">
                      Enquiry: {counts.enquiry}
                    </span>
                  )}
                  {typeof counts.positive === "number" && (
                    <span className="font-medium  text-brand-500 px-2 py-0.5 rounded">
                      Positive: {counts.positive}
                    </span>
                  )}
                  {typeof counts.onboard === "number" && (
                    <span className="font-medium bg-success-100 text-success-700 px-2 py-0.5 rounded">
                      Onboard: {counts.onboard}
                    </span>
                  )}
                  {typeof counts.active === "number" && (
                    <span className="font-medium bg-success-100 text-success-700 dark:text-white/90">
                      Active:{" "}
                      {
                        processedData.filter((item) =>
                          normalizeStatus(item[statusField])
                        ).length
                      }
                    </span>
                  )}
                  {typeof counts.inactive === "number" && (
                    <span className="font-medium bg-error-100 text-error-700 dark:text-white/90">
                      Inactive:{" "}
                      {
                        processedData.filter(
                          (item) => !normalizeStatus(item[statusField])
                        ).length
                      }
                    </span>
                  )}
                  {/* Custom count properties for Stats */}
                  {typeof counts.total_api_calls === "number" && (
                    <span className="font-medium  text-brand-500 px-2 py-0.5 rounded">
                      Total API Calls: {counts.total_api_calls}
                    </span>
                  )}
                  {counts.average_execution_time && (
                    <span className="font-medium bg-warning-100 text-warning-700 px-2 py-0.5 rounded">
                      Avg Execution Time: {counts.average_execution_time}
                    </span>
                  )}
                  {typeof counts.tables_with_data === "number" && (
                    <span className="font-medium bg-success-100 text-success-700 px-2 py-0.5 rounded">
                      Tables With Data: {counts.tables_with_data}
                    </span>
                  )}
                  {typeof counts.empty_tables === "number" && (
                    <span className="font-medium bg-error-100 text-error-700 px-2 py-0.5 rounded">
                      Empty Tables: {counts.empty_tables}
                    </span>
                  )}
                </div>
              )}
              {/* Right: Controls */}
              <div className="flex flex-1 justify-end items-center gap-4 w-full sm:w-auto flex-wrap">
                {/* Reload, Search, etc. */}
                {dashboardTitle && (
                  <span className="font-medium text-gray-800 dark:text-white/90 shrink-0">
                    {dashboardTitle}
                  </span>
                )}

                <div className="flex flex-wrap items-center gap-3 justify-end">
                  {/* Execution Time Filter - Independent of Status Filter */}
                  {enableExecutionTimeFilter && (
                    <div className="relative w-56">
                      <select
                        value={executionTimeFilter || "all"}
                        onChange={(e) => {
                          onExecutionTimeFilterChange(e.target.value);
                        }}
                        className="w-full px-3 pr-10 py-2 border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm text-gray-700 appearance-none bg-[url('data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20fill=%27none%27%20viewBox=%270%200%2020%2020%27%3e%3cpath%20stroke=%27%236b7280%27%20stroke-linecap=%27round%27%20stroke-linejoin=%27round%27%20stroke-width=%271.5%27%20d=%27m6%208%204%204%204-4%27/%3e%3c/svg%3e')] bg-[right_0.75rem_center] bg-no-repeat bg-[length:1.5em_1.5em]"
                      >
                        <option value="all">All Execution Time</option>
                        <option value="5">&gt;5ms</option>
                        <option value="10">&gt;10ms</option>
                        <option value="50">&gt;50ms</option>
                        <option value="100">&gt;100ms</option>
                        <option value="200">&gt;200ms</option>
                        <option value="500">&gt;500ms</option>
                      </select>
                    </div>
                  )}
                  {shouldShowTopSearchAndReload && (
                    <>
                      {renderSearchInput("")}
                      {renderReloadButton("")}
                    </>
                  )}
                </div>

                {/* Custom Filters */}
                {customFilters && customFilters.length > 0 && (
                  <div className="flex flex-nowrap items-center gap-4">
                    {customFilters.map((filter, index) => (
                      <React.Fragment key={index}>
                        {filter.type === "custom" && (
                          <div className="relative z-[3]">
                            {filter.component}
                          </div>
                        )}
                        {filter.type === "select" && (
                          <div className="relative">
                            <select
                              className="w-full sm:w-64 px-4 pr-10 py-2 border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm text-gray-700"
                              value={filter.value}
                              onChange={(e) => filter.onChange(e.target.value)}
                            >
                              <option value="">
                                {filter.placeholder || `Select ${filter.label}`}
                              </option>
                              {filter.options.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                )}

              </div>
            </div>

            {/* Filters Row - Below Stats */}
            {(enableStatusFilter || enableAccountTypeFilter || enableOpenCloseStatusFilter || enableOutletTypeFilter || enableOutletModeFilter || enableOwnerCountFilter || enableEnquiry || showSearch || onReload) && (
              <div className="flex items-center gap-2 px-0 pl-2 mb-4">
                <div className="flex flex-1 flex-wrap items-center gap-2">
                {enableStatusFilter && (
                  <div className="relative w-36 mr-2">
                    <select
                      value={statusFilter}
                      onChange={(e) => onStatusFilterChange(e.target.value)}
                      className="w-full px-3 pr-8 py-2 border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm text-gray-700"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                )}
                {/* Enquiry Filter */}
                {enableEnquiry && (
                  <div className="relative w-36 mr-2">
                    <select
                      value={enquiryFilter || "all"}
                      onChange={onEnquiryFilterChange || (() => {})}
                      className="w-full px-3 pr-8 py-2 border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm text-gray-700"
                    >
                      <option value="all">Enquiry Type</option>
                      <option value="enquiry">Enquiry</option>
                      <option value="positive">Positive</option>
                      <option value="onboard">Onboard</option>
                    </select>
                  </div>
                )}
                {/* Account Type Filter */}
                {enableAccountTypeFilter && (
                  <div className="relative w-36 mr-2">
                    <select
                      value={accountType || "all"}
                      onChange={onAccountTypeChange || (() => {})}
                      className="w-full px-3 pr-8 py-2 border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm text-gray-700"
                    >
                      <option value="all">Account Type</option>
                      <option value="live">Live</option>
                      <option value="test">Test</option>
                    </select>
                  </div>
                )}
                {/* Open/Close Filter */}
                {enableOpenCloseStatusFilter && (
                  <div className="relative w-36 mr-2">
                    <select
                      value={openCloseStatus || "all"}
                      onChange={onOpenCloseStatusChange || (() => {})}
                      className="w-full px-3 pr-8 py-2 border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm text-gray-700"
                    >
                      <option value="all">Open/Close</option>
                      <option value="open">Open</option>
                      <option value="close">Close</option>
                    </select>
                  </div>
                )}
                {/* Active Session Filter */}
                {enableActiveSessionFilter && (
                  <div className="relative w-36 mr-2">
                    <select
                      value={activeSessionFilter || "all"}
                      onChange={(e) => {
                        onActiveSessionFilterChange(e.target.value);
                      }}
                      className="w-full px-3 pr-8 py-2 border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm text-gray-700"
                    >
                      <option value="all">All Sessions</option>
                      <option value="0">0</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                      <option value="10">10+</option>
                    </select>
                  </div>
                )}
                {/* Outlet Count Filter */}
                {enableOutletCountFilter && (
                  <div className="relative w-36 mr-2">
                    <select
                      value={outletCountFilter || "all"}
                      onChange={(e) => {
                        onOutletCountFilterChange(e.target.value);
                      }}
                      className="w-full px-3 pr-8 py-2 border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm text-gray-700"
                    >
                      <option value="all">All Outlets</option>
                      <option value="0">0</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                      <option value="10">10+</option>
                    </select>
                  </div>
                )}
                {/* Outlet Type Filter */}
                {enableOutletTypeFilter && (
                  <div className="relative w-36 mr-2">
                    <select
                      value={outletTypeFilter || "all"}
                      onChange={(e) => {
                        onOutletTypeFilterChange(e.target.value);
                      }}
                      className="w-full px-3 pr-8 py-2 border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm text-gray-700"
                    >
                      <option value="all">All Types</option>
                      <option value="outlet">Outlet</option>
                    </select>
                  </div>
                )}
                {/* Outlet Mode Filter */}
                {enableOutletModeFilter && (
                  <div className="relative w-36 mr-2">
                    <select
                      value={outletModeFilter || "all"}
                      onChange={(e) => {
                        onOutletModeFilterChange(e.target.value);
                      }}
                      className="w-full px-3 pr-8 py-2 border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm text-gray-700"
                    >
                      <option value="all">All Modes</option>
                      <option value="online">Online</option>
                      <option value="offline">Offline</option>
                    </select>
                  </div>
                )}
                {/* Owner Count Filter */}
                {enableOwnerCountFilter && (
                  <div className="relative w-32 mr-2">
                    <select
                      value={ownerCountFilter || "all"}
                      onChange={(e) => {
                        onOwnerCountFilterChange(e.target.value);
                      }}
                      className="w-full px-3 pr-10 py-2 border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm text-gray-700"
                    >
                      <option value="all">All Owners</option>
                      <option value="0">0</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                      <option value="10">10+</option>
                    </select>
                  </div>
                )}
                </div>
                <div className="ml-auto flex items-center gap-2">
                  {/* Reload Button */}
                  {shouldShowBottomReload && renderReloadButton("mr-2")}
                  {/* Search Input */}
                  {shouldShowBottomSearch && renderSearchInput("mr-2")}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Table Section */}
        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <table className="w-full">
            <thead>
              <tr
                className={`border-t border-gray-100 ${
                  darkMode ? "dark:border-gray-800" : ""
                }`}
              >
                {/* Checkbox column */}
                {enableSelection && (
                  <th className="px-2 py-2.5 text-center">
                    <input
                      type="checkbox"
                      checked={isAllCurrentItemsSelected()}
                      onChange={handleSelectAll}
                      className="h-4 w-4 rounded-3xl border-gray-300 text-brand-500 focus:ring-brand-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </th>
                )}

                {/* Bulk Actions column - Only visible when items are selected */}
                {enableSelection && selectedItems.length > 0 && (
                  <th className="px-0 py-2.5">
                    <div className="relative" ref={actionDropdownRef}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsActionDropdownOpen(!isActionDropdownOpen);
                        }}
                        className="inline-flex items-center gap-2 rounded-3xl border border-gray-200  px-3 py-1.5 text-sm font-medium  hover:bg-brand-600 hover:text-white outline outline-offset-2"
                      >
                        {/* Actions */}
                        {/* <svg
                          className={`stroke-current duration-200 ease-in-out ${
                            isActionDropdownOpen ? "rotate-180" : ""
                          }`}
                          width="16"
                          height="16"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M4.79199 7.396L10.0003 12.6043L15.2087 7.396"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg> */}
                        <FontAwesomeIcon icon={faGear} />
                      </button>

                      {/* Dropdown Menu */}
                      {isActionDropdownOpen && (
                        <div className="absolute left-0 top-full z-40 mt-2 w-48 rounded-3xl border border-gray-200 bg-white p-2 shadow-lg">
                          <ul className="flex flex-col gap-1">
                            {resolvedBulkActionOptions.map((option) => (
                              <li key={option.key}>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const sanitizedSelection = selectedItems.filter(
                                      (id) =>
                                        id !== null &&
                                        id !== undefined &&
                                        id !== ""
                                    );
                                    if (sanitizedSelection.length === 0) {
                                      setIsActionDropdownOpen(false);
                                      return;
                                    }
                                    onBulkAction(option.key, sanitizedSelection);
                                    setSelectedItems([]);
                                    onSelectionChange([]);
                                    setIsActionDropdownOpen(false);
                                  }}
                                  className={`w-full text-left flex items-center gap-2 rounded-3xl px-3 py-2 text-sm font-medium ${option.className}`}
                                >
                                  {option.customIcon ? (
                                    option.customIcon
                                  ) : (
                                    <>
                                      {option.icon && (
                                        <FontAwesomeIcon
                                          icon={option.icon}
                                          className="w-4 h-4"
                                        />
                                      )}
                                      {option.label}
                                    </>
                                  )}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </th>
                )}

                {/* Regular columns */}
                {paddedColumns.map((column, idx) => (
                  <th
                    key={column.field || idx}
                    className={`
                      ${column.field === "selection" ? "px-2" : "px-6"}
                      py-2.5
                      text-center
                      ${
                        enableSort && column.sortable
                          ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                          : ""
                      }
                    `}
                    onClick={() =>
                      column.sortable ? handleSort(column.field) : null
                    }
                  >
                    <div className="flex items-center justify-center w-full">
                      <p
                        className={`font-semibold text-gray-700 text-theme-xs text-center ${
                          darkMode ? "dark:text-white/90" : ""
                        }`}
                      >
                        {column.header}
                      </p>
                      {column.sortable && renderSortIcon(column.field)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((item, index) => {
                  const rowId = resolveRowId(item);
                  return (
                    <tr
                      key={index}
                      className={`border-t border-gray-100 ${
                        darkMode ? "dark:border-gray-800" : ""
                      }`}
                    >
                    {/* Checkbox cell */}
                    {enableSelection &&
                      isItemSelectable(item) &&
                      rowId !== null &&
                      rowId !== undefined && (
                      <td className="px-2 py-2.5 text-center">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(rowId)}
                          onChange={() => handleSelectItem(rowId)}
                          className="h-4 w-4 rounded-3xl border-gray-300 text-brand-500 focus:ring-brand-500"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                    )}
                    {/* Add empty cell for non-selectable items when selection is enabled */}
                    {enableSelection &&
                      (!isItemSelectable(item) ||
                        rowId === null ||
                        rowId === undefined) && (
                      <td className="px-2 py-2.5"></td>
                    )}

                    {/* Empty cell for bulk actions column when items are selected */}
                    {enableSelection && selectedItems.length > 0 && (
                      <td className="px-6 py-2.5"></td>
                    )}

                    {/* Regular cells */}
                    {paddedColumns.map((column, idx) => (
                      <td
                        key={column.field || idx}
                        className={`
                          ${column.field === "selection" ? "px-2" : "px-6"}
                          py-2.5
                          text-center
                          ${
                            column.field === "name" ||
                            column.field === "outlet_name"
                              ? "whitespace-nowrap"
                              : ""
                          }
                        `}
                      >
                        {column.render && column.field ? (
                          column.render(item[column.field], item)
                        ) : column.field === statusField && column.field ? (
                          <div className="flex items-center justify-center">
                            {renderStatus(item[column.field])}
                          </div>
                        ) : column.field ? (
                          <p
                            className={`text-gray-500 text-theme-sm ${
                              darkMode ? "dark:text-gray-400" : ""
                            } ${
                              column.field === "name" ||
                              column.field === "outlet_name"
                                ? "whitespace-nowrap"
                                : ""
                            }`}
                          >
                            {item[column.field]}
                          </p>
                        ) : null}
                      </td>
                    ))}
                  </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={paddedColumns.length + (enableSelection ? 1 : 0)}
                    className="p-6 text-center text-gray-500"
                  >
                    {statusFilter && emptyStateMessageByStatus
                      ? emptyStateMessageByStatus[statusFilter] ||
                        emptyStateMessage
                      : emptyStateMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        {enablePagination && processedData.length > 0 && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800">
            {/* Keep the entries dropdown */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span
                  className={`text-gray-500 text-theme-sm ${
                    darkMode ? "dark:text-gray-400" : ""
                  }`}
                >
                  Show
                </span>
                <select
                  value={internalItemsPerPage}
                  onChange={(e) => {
                    const newItemsPerPage = Number(e.target.value);
                    setInternalItemsPerPage(newItemsPerPage);
                    setCurrentPage(1); // Reset to first page when changing items per page
                    if (onItemsPerPageChange) {
                      onItemsPerPageChange(newItemsPerPage);
                    }
                  }}
                  className="w-20 px-2 py-1 border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm text-gray-700 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                >
                  {itemsPerPageOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <span
                  className={`text-gray-500 text-theme-sm ${
                    darkMode ? "dark:text-gray-400" : ""
                  }`}
                >
                  entries
                </span>
              </div>

              {/* Showing entries text */}
              <div
                className={`text-gray-500 text-theme-sm ${
                  darkMode ? "dark:text-gray-400" : ""
                }`}
              >
                Showing {indexOfFirstItem + 1} to{" "}
                {Math.min(indexOfLastItem, processedData.length)} of{" "}
                {processedData.length} entries
              </div>
            </div>

            {/* Pagination controls */}
            <div className="flex items-center justify-between gap-2 sm:justify-normal">
              <button
                onClick={() =>
                  !shouldDisableNavigation.prev() &&
                  handlePageChange(currentPage - 1)
                }
                disabled={shouldDisableNavigation.prev()}
                className={`flex items-center gap-2 rounded-3xl border border-gray-300 bg-white p-2 sm:p-2.5 text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 ${
                  darkMode
                    ? "dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                    : ""
                } ${
                  shouldDisableNavigation.prev()
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <FontAwesomeIcon icon={faChevronLeft} className="w-5 h-5" />
              </button>

              <span
                className={`block text-sm font-medium text-gray-700 ${
                  darkMode ? "dark:text-gray-400" : ""
                } sm:hidden`}
              >
                Page {currentPage} of {totalPages}
              </span>

              <ul className="hidden items-center gap-0.5 sm:flex">
                {renderPaginationNumbers()}
              </ul>

              <button
                onClick={() =>
                  !shouldDisableNavigation.next() &&
                  handlePageChange(currentPage + 1)
                }
                disabled={shouldDisableNavigation.next()}
                className={`flex items-center gap-2 rounded-3xl border border-gray-300 bg-white p-2 sm:p-2.5 text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 ${
                  darkMode
                    ? "dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                    : ""
                } ${
                  shouldDisableNavigation.next()
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <FontAwesomeIcon icon={faChevronRight} className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  } catch {
    
    // Return a fallback UI
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <p className="text-gray-500 text-center">
          Unable to display data at this moment. Please try again later.
        </p>
      </div>
    );
  }
}

// Add PropTypes validation
DataTable.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      field: PropTypes.string.isRequired,
      header: PropTypes.string.isRequired,
      sortable: PropTypes.bool,
      textAlign: PropTypes.oneOf(["left", "center", "right"]), // New prop
      render: PropTypes.func,
    })
  ).isRequired,
  itemsPerPage: PropTypes.number,
  itemsPerPageOptions: PropTypes.arrayOf(PropTypes.number),
  enableSort: PropTypes.bool,
  enablePagination: PropTypes.bool,
  enableSearch: PropTypes.bool,
  searchTerm: PropTypes.string,
  onSearchChange: PropTypes.func,
  customRowRender: PropTypes.func,
  darkMode: PropTypes.bool,
  title: PropTypes.string,
  dashboardTitle: PropTypes.string,
  counts: PropTypes.shape({
    total: PropTypes.number,
    active: PropTypes.number,
    inactive: PropTypes.number,
  }),
  onBackClick: PropTypes.func,
  createButton: PropTypes.shape({
    show: PropTypes.bool,
    label: PropTypes.string,
    icon: PropTypes.object,
    onClick: PropTypes.func,
    className: PropTypes.string,
    position: PropTypes.oneOf(["left", "center", "right"]),
    showIconOnly: PropTypes.bool,
    disabled: PropTypes.bool,
    tooltip: PropTypes.string,
  }),
  searchPlaceholder: PropTypes.string,
  showBackButton: PropTypes.bool,
  showCreateButton: PropTypes.bool,
  showSearch: PropTypes.bool,
  backButtonLabel: PropTypes.string,
  showHeader: PropTypes.bool,
  showOutletSelect: PropTypes.bool,
  outlets: PropTypes.arrayOf(
    PropTypes.shape({
      outlet_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      outlet_name: PropTypes.string,
      outlet_code: PropTypes.string,
    })
  ),
  selectedOutlet: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onOutletChange: PropTypes.func,
  outletSelectPosition: PropTypes.oneOf(["controls", "left", "right"]),
  onShowData: PropTypes.func,
  isLoading: PropTypes.bool,
  enableSelection: PropTypes.bool,
  onSelectionChange: PropTypes.func,
  onBulkAction: PropTypes.func,

  enableStatusFilter: PropTypes.bool,
  onStatusFilterChange: PropTypes.func,
  statusFilter: PropTypes.oneOf(["all", "active", "inactive"]),
  isItemSelectable: PropTypes.func,
  bulkActionOptions: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      className: PropTypes.string,
    })
  ),
  onItemsPerPageChange: PropTypes.func,
  emptyStateMessage: PropTypes.string,
  emptyStateMessageByStatus: PropTypes.object,
  statusField: PropTypes.string,
  showRoleSelect: PropTypes.bool,
  roles: PropTypes.arrayOf(
    PropTypes.shape({
      role_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      role_name: PropTypes.string,
      count: PropTypes.number,
    })
  ),
  selectedRole: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onRoleChange: PropTypes.func,
  customFilters: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.oneOf(["custom", "select"]).isRequired,
      label: PropTypes.string.isRequired,
      placeholder: PropTypes.string,
      value: PropTypes.any,
      onChange: PropTypes.func.isRequired,
      component: PropTypes.node,
      options: PropTypes.arrayOf(
        PropTypes.shape({
          value: PropTypes.any.isRequired,
          label: PropTypes.string.isRequired,
        })
      ),
    })
  ),
  onReload: PropTypes.func,
  accountType: PropTypes.oneOf(["all", "live", "test"]),
  onAccountTypeChange: PropTypes.func,
  openCloseStatus: PropTypes.oneOf(["all", "open", "close"]),
  onOpenCloseStatusChange: PropTypes.func,
  enableAccountTypeFilter: PropTypes.bool,
  enableOpenCloseStatusFilter: PropTypes.bool,
  defaultSortField: PropTypes.string,
  defaultSortOrder: PropTypes.oneOf(["asc", "desc"]),
  enableEnquiry: PropTypes.bool,
  enableOutletCountFilter: PropTypes.bool,
  outletCountFilter: PropTypes.oneOf([
    "all",
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "10",
  ]),
  onOutletCountFilterChange: PropTypes.func,
  enableOutletTypeFilter: PropTypes.bool,
  outletTypeFilter: PropTypes.oneOf(["all", "outlet"]),
  onOutletTypeFilterChange: PropTypes.func,
  enableOutletModeFilter: PropTypes.bool,
  outletModeFilter: PropTypes.oneOf(["all", "online", "offline"]),
  onOutletModeFilterChange: PropTypes.func,
  enableOwnerCountFilter: PropTypes.bool,
  ownerCountFilter: PropTypes.oneOf([
    "all",
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "10",
  ]),
  onOwnerCountFilterChange: PropTypes.func,
  enableExecutionTimeFilter: PropTypes.bool,
  executionTimeFilter: PropTypes.oneOf([
    "all",
    "5",
    "10",
    "50",
    "100",
    "200",
    "500",
  ]),
  onExecutionTimeFilterChange: PropTypes.func,
  forceTopControls: PropTypes.bool,
  getRowId: PropTypes.func,
};

DataTable.defaultProps = {
  data: [],
  columns: [],
  itemsPerPage: 50,
  itemsPerPageOptions: [50, 100, 200],
  enableSort: true,
  enablePagination: true,
  enableSearch: true,
  searchTerm: "",
  onSearchChange: () => {},
  customRowRender: null,
  darkMode: false,
  title: "",
  dashboardTitle: "",
  counts: {
    total: 0,
    active: 0,
    inactive: 0,
  },
  onBackClick: () => {},
  createButton: {
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
  searchPlaceholder: "Search",
  showBackButton: true,
  showCreateButton: true,
  showSearch: true,
  backButtonLabel: "Back",
  showHeader: true,
  showOutletSelect: false,
  outlets: [],
  selectedOutlet: "",
  onOutletChange: () => {},
  outletSelectPosition: "controls",
  onShowData: () => {},
  isLoading: false,
  enableSelection: false,
  onSelectionChange: () => {},
  onBulkAction: () => {},
  enableStatusFilter: true,
  onStatusFilterChange: () => {},
  statusFilter: "all",
  isItemSelectable: () => true,
  bulkActionOptions: [
    {
      key: "active",
      label: "Active",
      className: "text-gray-700 hover:bg-gray-100",
    },
    {
      key: "inactive",
      label: "Inactive",
      className: "text-gray-700 hover:bg-gray-100",
    },
    {
      key: "delete",
      label: "Delete",
      className: "text-error-600 hover:bg-error-50",
    },
  ],
  onItemsPerPageChange: () => {},
  emptyStateMessage: "No data found.",
  emptyStateMessageByStatus: {
    all: "No data found.",
    active: "No active items found.",
    inactive: "No inactive items found.",
  },
  statusField: "is_active",
  showRoleSelect: false,
  roles: [],
  selectedRole: "",
  onRoleChange: () => {},
  customFilters: [],
  onReload: null,
  accountType: "all",
  onAccountTypeChange: () => {},
  openCloseStatus: "all",
  onOpenCloseStatusChange: () => {},
  enableAccountTypeFilter: false,
  enableOpenCloseStatusFilter: false,
  defaultSortField: "created_at",
  defaultSortOrder: "desc",
  enableEnquiry: false,
  enableOutletCountFilter: false,
  outletCountFilter: "all",
  onOutletCountFilterChange: () => {},
  enableOutletTypeFilter: false,
  outletTypeFilter: "all",
  onOutletTypeFilterChange: () => {},
  enableOutletModeFilter: false,
  outletModeFilter: "all",
  onOutletModeFilterChange: () => {},
  enableOwnerCountFilter: false,
  ownerCountFilter: "all",
  onOwnerCountFilterChange: () => {},
  enableExecutionTimeFilter: false,
  executionTimeFilter: "all",
  onExecutionTimeFilterChange: () => {},
  forceTopControls: false,
  getRowId: defaultGetRowId,
};

export default DataTable;