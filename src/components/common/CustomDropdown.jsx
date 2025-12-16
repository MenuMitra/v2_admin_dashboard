import React, { useState, useRef, useEffect } from 'react';
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
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const dropdownRef = useRef(null);

  // Find selected option
  useEffect(() => {
    const option = options.find(opt => opt.value === value);
    setSelectedOption(option);
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
    setSelectedOption(option);
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
    <div className={`relative ${className}`} ref={dropdownRef}>
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
          w-full px-2 py-1.5 pr-10 border rounded-3xl shadow-sm text-left text-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          bg-white hover:bg-gray-50 transition-all duration-200
          flex items-center justify-between h-10
          ${error ? "border-red-500" : "border-gray-300"}
          ${isOpen ? "ring-2 ring-blue-500 border-blue-500" : ""}
        `}
        {...props}
      >
        <span className={selectedOption ? "text-gray-900" : "text-gray-400"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        
        {/* Dropdown Arrow - Pure Tailwind */}
        <FontAwesomeIcon 
          icon={faChevronDown} 
          className={`w-4 ml-2 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
        />
      </button> 

      {/* Dropdown Options Container - vertical list with scrolling */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-3xl shadow-lg max-h-10 overflow-y-auto flex flex-col">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-gray-500 text-sm">No options available</div>
          ) : (
            options.map((option, index) => (
              <button
                key={option.value || index}
                type="button"
                onClick={() => handleSelect(option)}
                className={`
                  w-full text-left px-3 py-2 text-sm transition-colors duration-150
                  hover:bg-gray-100 focus:outline-none focus:bg-gray-100
                  first:rounded-t-3xl last:rounded-b-3xl
                  ${selectedOption?.value === option.value 
                    ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' 
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