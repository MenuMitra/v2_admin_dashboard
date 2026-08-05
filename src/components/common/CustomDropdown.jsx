import React, { useState, useRef, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';

const CustomDropdown = ({
  label,
  options = [],
  value,
  onChange,
  placeholder = "Select Option",
  required = false,
  error = false,
  errorMessage = "",
  className = "",
  buttonClassName = "",
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Derive selection during render — avoid useEffect + options[] deps
  // (inline options arrays are new every render and caused update loops).
  const selectedOption = useMemo(() => {
    if (value === null || value === undefined || value === "") return null;
    const str = String(value);
    return (
      options.find((opt) => String(opt.value) === str) ||
      options.find(
        (opt) => String(opt.value).toLowerCase() === str.toLowerCase()
      ) ||
      null
    );
  }, [value, options]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    setIsOpen(false);

    // Create synthetic event for compatibility
    const syntheticEvent = {
      target: {
        value: option.value,
        name: props.name
      }
    };

    onChange?.(syntheticEvent);
  };

  return (
    <div className={`relative ${isOpen ? 'z-[9999]' : 'z-auto'} ${className}`} ref={dropdownRef}>
      {/* Label */}
      {label && (
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
          {required && <span className="text-red-500">*</span>} {label}
        </label>
      )}

      {/* Dropdown Button - Pure Tailwind */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full px-2 py-1.5 pr-4 border rounded-lg shadow-sm text-left text-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          bg-white hover:bg-gray-50 transition-all duration-200
          flex items-center justify-between h-10
          ${error ? "border-red-500" : "border-gray-300"}
          ${isOpen ? "ring-2 ring-blue-500 border-blue-500" : ""}
          ${buttonClassName}
        `}
        {...props}
      >
        <span className={selectedOption ? "text-gray-900" : "text-gray-400"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        {/* Dropdown Arrow - Pure Tailwind */}
        <FontAwesomeIcon
          icon={faChevronDown}
          className={`w-4 ml-2 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : 'rotate-0'
            }`}
        />
      </button>

      {/* Dropdown Options Container - vertical list with scrolling */}
      {isOpen && (
        <div className="absolute z-[99999] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-60 overflow-y-auto flex flex-col" style={{ zIndex: 99999 }}>
          {options.length === 0 ? (
            <div className="px-3 py-2 text-gray-500 text-sm">No options available</div>
          ) : (
            options.map((option, index) => (
              <button
                key={option.value || index}
                type="button"
                onClick={() => handleSelect(option)}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#3b82f6';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  if (selectedOption?.value === option.value) {
                    e.target.style.backgroundColor = '#eff6ff';
                    e.target.style.color = '#1d4ed8';
                  } else {
                    e.target.style.backgroundColor = '';
                    e.target.style.color = '#111827';
                  }
                }}
                className={`
                  w-full text-left px-3 py-1 text-sm transition-colors duration-150
                  hover:bg-blue-500 hover:text-white focus:outline-none focus:bg-blue-500 focus:text-white
                  first:rounded-t-lg last:rounded-b-lg
                  ${selectedOption?.value === option.value
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-900'
                  }
                `}
              >
                {option.label}
              </button>
            ))
          )}
        </div>
      )}

      {/* Error Message */}
      {error && errorMessage && (
        <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
      )}
    </div>
  );
};

export default CustomDropdown;
