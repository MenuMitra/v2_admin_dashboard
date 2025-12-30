// src/components/common/SingleSelectDropdown.jsx
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const SingleSelectDropdown = ({
  label,
  options,
  selectedValue,
  onChange,
  displayKey,
  valueKey,
  searchKeys = [],
  required,
  placeholder = "Select item",
  searchPlaceholder = "Search...",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option => {
    if (!searchTerm) return true;
    return searchKeys.some(key =>
      option[key]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleSelect = (value) => {
    onChange(value);
    setIsOpen(false);
    setSearchTerm(''); // Clear search when selecting
  };

  const getSelectedText = () => {
    if (!selectedValue) return placeholder;
    const selectedOption = options.find(opt => opt[valueKey] === selectedValue);
    return selectedOption ? selectedOption[displayKey] : placeholder;
  };

  const selectedOption = options.find(opt => opt[valueKey] === selectedValue);

  return (
    <div className="relative w-full h-full flex flex-col single-select-dropdown" ref={dropdownRef}>
      {/* Label */}
      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
        {required && <span className="text-error-600 text-red-500 mr-1">*</span>}
        {label}
      </label>

      {/* Main Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-2 text-left border shadow-sm bg-white hover:bg-gray-50 
                   focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer min-h-[42px] ${className || 'rounded-lg'}`}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="flex items-center justify-between">
          <span className={`${!selectedValue ? 'text-gray-500' : 'text-gray-900'} truncate`}>
            {getSelectedText()}
          </span>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'transform rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Selected Item Display */}
      {selectedValue && selectedOption && (
        <div className="mt-2">
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-brand-100 text-brand-700 rounded-full text-sm">
            <span className="truncate max-w-[200px]" style={{ textTransform: 'capitalize' }}>
              {selectedOption[displayKey]}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSelect('');
              }}
              className="ml-1 text-brand-500 hover:text-brand-700 flex-shrink-0"
              title="Clear selection"
            >
              ×
            </button>
          </span>
        </div>
      )}

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-[17px] bg-white border rounded-lg shadow-xl z-50 w-full min-w-[250px]">
          {/* Search Bar */}
          <div className="p-2 border-b bg-white">
            <div className="relative">
              <input
                type="text"
                className="w-full px-3 py-2 pr-8 text-sm border rounded-3xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSearchTerm("");
                    // Keep focus on the search input
                    const searchInput = e.target.closest(".relative").querySelector("input");
                    if (searchInput) {
                      searchInput.focus();
                    }
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Options List with Fixed Height and Scrolling */}
          <div 
            style={{
              height: '250px',
              maxHeight: '250px',
              overflowY: 'auto',
              overflowX: 'hidden'
            }}
          >
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-gray-500">
                No results found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option[valueKey]}
                  className={`
                    p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0
                    ${selectedValue === option[valueKey]
                      ? 'bg-brand-50 border-l-4 border-brand-500'
                      : 'border-l-4 border-transparent'}
                  `}
                  onClick={() => handleSelect(option[valueKey])}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate" style={{ textTransform: 'capitalize' }}>
                        {option[displayKey]}
                      </div>
                      {option.secondary && (
                        <div className="text-sm text-gray-500 truncate">
                          {option.secondary}
                        </div>
                      )}
                    </div>
                    {selectedValue === option[valueKey] && (
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-brand-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

SingleSelectDropdown.propTypes = {
  label: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectedValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  displayKey: PropTypes.string.isRequired,
  valueKey: PropTypes.string.isRequired,
  searchKeys: PropTypes.arrayOf(PropTypes.string),
  required: PropTypes.bool,
  placeholder: PropTypes.string,
  searchPlaceholder: PropTypes.string,
  className: PropTypes.string,
};

export default SingleSelectDropdown;