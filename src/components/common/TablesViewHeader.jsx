import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faChevronLeft, 
  faMagnifyingGlass,
  faPlus 
} from '@fortawesome/free-solid-svg-icons'

function TablesViewHeader({
  title = "",
  totalCount = 0,
  activeCount = 0,
  inactiveCount = 0,
  searchTerm = "",
  onSearchChange = () => {},
  onBackClick = () => {},
  onCreateClick = () => {},
  createButtonLabel = "Create",
  searchPlaceholder = "Search...",
  showBackButton = true,
  showCreateButton = true,
  showSearch = true,
  showStats = true,
  backButtonLabel = "Back"
}) {
  return (
    <div className="overflow-hidden rounded-t-2xl pt-4 dark:border-gray-800 dark:bg-white/[0.03] mb-4">
      <div className="flex flex-col gap-4 px-6 mb-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left Section - Back Button and Stats */}
        <div className="flex items-center gap-4">
          {showBackButton && (
            <button 
              onClick={onBackClick}
              className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-black transition rounded-full bg-transparent border-2 border-sky-500 shadow-theme-xs hover:bg-gray-600"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="w-5 h-5" />
              {backButtonLabel}
            </button>
          )}
          {showStats && (
            <div className="flex items-center gap-3">
              <div className="text-gray-800 dark:text-white/90">
                <span className="text-lg font-semibold">Total: {totalCount}</span>
                <div className="flex gap-3 mt-1 text-sm">
                  <span className="text-success-600">Active: {activeCount}</span>
                  <span className="text-error-500">Inactive: {inactiveCount}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Middle Section - Title */}
        {title && (
          <div className="text-xl font-semibold text-gray-800 dark:text-white/90">
            {title}
          </div>
        )}

        {/* Right Section - Search and Create Button */}
        <div className="flex items-center gap-2">
          {showSearch && (
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                <FontAwesomeIcon icon={faMagnifyingGlass} className="w-4 h-4" />
              </span>
              <input 
                placeholder={searchPlaceholder}
                className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-[250px] rounded-lg border border-gray-200 bg-transparent py-2.5 pr-14 pl-12 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30"
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          )}
          {showCreateButton && (
            <button 
              onClick={onCreateClick}
              className="text-theme-sm shadow-theme-xs inline-flex items-center gap-2 rounded-lg bg-success-500 px-4 py-3 font-medium text-white hover:bg-success-600"
            >
              <FontAwesomeIcon icon={faPlus} className="w-5 h-5" />
              {createButtonLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default TablesViewHeader