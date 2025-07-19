// src/components/common/MultiSelectDropdown.jsx
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const MultiSelectDropdown = ({
  label,
  options,
  selectedValues,
  onChange,
  displayKey,
  valueKey,
  searchKeys = [],
  required,
  placeholder = "Select items",
  searchPlaceholder = "Search...",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options based on search term
  const filteredOptions = options.filter(option => {
    return searchKeys.some(key => 
      option[key]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Handle selection
  const handleSelect = (value) => {
    const newSelectedValues = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value];
    onChange(newSelectedValues);
  };

  // Get display text for selected items
  const getSelectedText = () => {
    if (selectedValues.length === 0) return placeholder;
    return `${selectedValues.length} Item${selectedValues.length > 1 ? 's' : ''} Selected`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Label */}
      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
        {required && <span className="text-error-600 text-red-500 mr-1">*</span>}
        {label}
      </label>

      {/* Main Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-2 text-left border rounded-lg shadow-sm bg-white hover:bg-gray-50 
                   focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="flex items-center justify-between">
          <span className={`${selectedValues.length === 0 ? 'text-gray-500' : 'text-gray-900'}`}>
            {getSelectedText()}
          </span>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Selected Items Tags */}
      {selectedValues.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedValues.map(value => {
            const option = options.find(opt => opt[valueKey] === value);
            return option ? (
              <span
                key={value}
                className="inline-flex items-center gap-1 px-2 py-1 bg-brand-100 text-brand-700 rounded-full text-sm"
              >
                <span>{option[displayKey]}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(value);
                  }}
                  className="ml-1 text-brand-500 hover:text-brand-700"
                >
                  ×
                </button>
              </span>
            ) : null;
          })}
        </div>
      )}

      {/* Dropdown Panel */}
      {isOpen && (
        <div 
          className="absolute left-0 right-0 mt-1 bg-white border rounded-lg shadow-xl z-50"
          style={{
            width: '100%',
            minWidth: '300px',
            maxHeight: '350px',
            overflowY: 'auto',
          }}
        >
          {/* Search Bar */}
          <div className="sticky top-0 p-2 border-b bg-white">
            <input
              type="text"
              className="w-full px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>

          {/* Options List */}
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(350px - 60px)' }}>
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
                    ${selectedValues.includes(option[valueKey]) 
                      ? 'bg-brand-50 border-l-4 border-brand-500' 
                      : 'border-l-4 border-transparent'}
                  `}
                  onClick={() => handleSelect(option[valueKey])}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedValues.includes(option[valueKey])}
                      onChange={() => handleSelect(option[valueKey])}
                      onClick={(e) => e.stopPropagation()}
                      className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {option[displayKey]}
                      </div>
                      {option.secondary && (
                        <div className="text-sm text-gray-500">
                          {option.secondary}
                        </div>
                      )}
                    </div>
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

MultiSelectDropdown.propTypes = {
  label: PropTypes.string.required,
  options: PropTypes.arrayOf(PropTypes.object).required,
  selectedValues: PropTypes.array.required,
  onChange: PropTypes.func.required,
  displayKey: PropTypes.string.required,
  valueKey: PropTypes.string.required,
  searchKeys: PropTypes.arrayOf(PropTypes.string),
  required: PropTypes.bool,
  placeholder: PropTypes.string,
  searchPlaceholder: PropTypes.string,
};

export default MultiSelectDropdown;
