import React, { useState, useEffect, useRef } from 'react';

const CustomSelect = ({
  label,
  options,
  value,
  onChange,
  name,
  required = false,
  placeholder = "Select an option",
  className = "",
  isSearchable = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [hoveredOption, setHoveredOption] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && isSearchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
    if (!isOpen) {
      setSearchTerm("");
    }
  }, [isOpen, isSearchable]);

  const handleSelect = (optionValue) => {
    onChange({
      target: {
        name,
        value: optionValue,
      },
    });
    setIsOpen(false);
  };

  const getSelectedText = () => {
    const selectedOption = options.find(option =>
      option.value === value || String(option.value) === String(value)
    );
    return selectedOption ? selectedOption.label : placeholder;
  };

  const filteredOptions = isSearchable
    ? options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : options;

  return (
    <div className={`relative w-full ${isOpen ? 'z-[9999]' : 'z-auto'}`} ref={dropdownRef}>
      {/* Label */}
      {label && (
        <label className="block text-sm text-gray-500 mb-1">
          {label}
          {required && <span className="text-error-600"> *</span>}
        </label>
      )}

      {/* Main Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 text-left border border-gray-300 bg-white hover:bg-gray-50 
                   focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer rounded-lg ${className}`}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="flex items-center justify-between">
          <span className={`${!value ? 'text-gray-500' : 'text-gray-600'} truncate`}>
            {getSelectedText()}
          </span>
          <svg
            className={`w-4 h-4 ml-3 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'transform rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-xl z-[99999] overflow-hidden" style={{ zIndex: 99999 }}>
          {isSearchable && (
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  className="w-full pl-3 pr-8 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
                {searchTerm && (
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchTerm("");
                      searchInputRef.current?.focus();
                    }}
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
          )}
          {/* Options List */}
          <div
            className="max-h-60 overflow-y-auto"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => {
              setIsHovering(false);
              setHoveredOption(null);
            }}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = (value === option.value || String(value) === String(option.value));
                const isCurrentlyHovered = (hoveredOption === option.value);

                let backgroundColor, textColor;

                if (isHovering) {
                  if (isCurrentlyHovered) {
                    backgroundColor = '#3b82f6';
                    textColor = '#ffffff';
                  } else {
                    backgroundColor = 'transparent';
                    textColor = '#4b5563';
                  }
                } else {
                  if (isSelected) {
                    backgroundColor = '#3b82f6';
                    textColor = '#ffffff';
                  } else {
                    backgroundColor = 'transparent';
                    textColor = '#4b5563';
                  }
                }

                return (
                  <div
                    key={option.value}
                    className="px-2 py-1.5 text-sm cursor-pointer transition-colors flex items-center leading-tight"
                    style={{
                      backgroundColor: backgroundColor,
                      color: textColor
                    }}
                    onClick={() => handleSelect(option.value)}
                    onMouseEnter={() => setHoveredOption(option.value)}
                    onMouseLeave={() => setHoveredOption(null)}
                  >
                    {option.label}
                  </div>
                );
              })
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                No options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;