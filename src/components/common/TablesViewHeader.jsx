import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faChevronLeft, 
  faMagnifyingGlass,
  faPlus 
} from '@fortawesome/free-solid-svg-icons'

function TablesViewHeader({
  title = "",
  counts = {
    total: 0,
    active: 0,
    inactive: 0
  },
  searchTerm = "",
  onSearchChange = () => {},
  onBackClick = () => {},
  onCreateClick = () => {},
  createButtonLabel = "Create Restaurant",
  searchPlaceholder = "Search...",
  showBackButton = true,
  showCreateButton = true,
  showSearch = true,
  backButtonLabel = "Back"
}) {
  return (
    <div className="overflow-hidden pt-4 dark:border-gray-800 dark:bg-white/[0.03] mb-4">
      {/* Top Row - Back, Title with Stats, Create */}
      <div className="flex items-center justify-between px-6 mb-6">
        {/* Left - Back Button */}
        {showBackButton && (
          <button 
            onClick={onBackClick}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-black transition rounded-full bg-transparent border-2 border-sky-500 shadow-theme-xs hover:bg-gray-600"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="w-4 h-4" />
            {backButtonLabel}
          </button>
        )}

        {/* Center - Title and Stats */}
        <div className="flex flex-col items-center gap-2">
          <div className="text-xl font-semibold text-gray-800 dark:text-white/90">
            {title}
          </div>
          <div className="flex items-center gap-6 text-sm">
            <span className="font-medium text-gray-800 dark:text-white/90">
              Total: {counts.total}
            </span>
            <span className="text-success-600">
              Active: {counts.active}
            </span>
            <span className="text-error-500">
              Inactive: {counts.inactive}
            </span>
          </div>
        </div>

        {/* Right - Create Button */}
        {showCreateButton && (
          <button 
            onClick={onCreateClick}
            className="text-theme-sm shadow-theme-xs inline-flex items-center gap-2 rounded-lg bg-success-500 px-4 py-2 font-medium text-white hover:bg-success-600"
          >
            <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
            {createButtonLabel}
          </button>
        )}
      </div>

      {/* Bottom Row - Search */}
      <div className="flex items-center justify-end px-6 mb-4">
        {showSearch && (
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
              <FontAwesomeIcon icon={faMagnifyingGlass} className="w-4 h-4" />
            </span>
            <input 
              placeholder={searchPlaceholder}
              className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-10 w-[250px] rounded-lg border border-gray-200 bg-transparent py-2 pr-4 pl-12 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30"
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default TablesViewHeader