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
}) => {
  const [isOpen, setIsOpen] = useState(false);
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
                   focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer rounded-3xl ${className}`}
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
        <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-300 rounded-2xl shadow-xl z-[99999] overflow-hidden" style={{ zIndex: 99999 }}>
          {/* Options List */}
          <div className="max-h-60 overflow-y-auto">
            {options.map((option) => (
              <div
                key={option.value}
                className={`
                  px-2 py-0.5 text-sm cursor-pointer transition-colors flex items-center leading-tight
                  ${(value === option.value || String(value) === String(option.value)) ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-blue-500 hover:text-white'}
                `}
                onClick={() => handleSelect(option.value)}
                onMouseEnter={(e) => {
                  if (!(value === option.value || String(value) === String(option.value))) {
                    e.target.style.backgroundColor = '#3b82f6';
                    e.target.style.color = '#ffffff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!(value === option.value || String(value) === String(option.value))) {
                    e.target.style.backgroundColor = '';
                    e.target.style.color = '#4b5563';
                  }
                }}
              >
                {option.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;