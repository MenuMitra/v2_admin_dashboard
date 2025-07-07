import React from 'react';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';

// Add custom styles for the Flatpickr dropdown
const customStyles = `
  <style>
    .flatpickr-calendar {
      z-index: 999 !important;
    }
    .flatpickr-calendar.open {
      display: inline-block;
      z-index: 999 !important;
    }
    /* Add styles for the formatted date display */
    .formatted-date {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      pointer-events: none;
      color: #1F2937;
      font-size: 0.875rem;
    }
    .flatpickr-input::placeholder {
      color: transparent !important;
    }
    .flatpickr-input:not([value=""]) {
      color: transparent !important;
    }
  </style>
`;

const DatePickerInput = ({ 
  label, 
  value, 
  onChange, 
  name, 
  placeholder = "Select date",
  required = false,
  disabled = false,
  className = "",
  error = ""
}) => {
  // Insert custom styles once when component mounts
  React.useEffect(() => {
    if (!document.getElementById('flatpickr-custom-styles')) {
      const styleElement = document.createElement('div');
      styleElement.id = 'flatpickr-custom-styles';
      styleElement.innerHTML = customStyles;
      document.head.appendChild(styleElement);
    }
  }, []);

  const formatDisplayDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = d.toLocaleString('default', { month: 'short' });
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const handleDateChange = (selectedDates) => {
    const event = {
      target: {
        name,
        value: selectedDates[0]
      }
    };
    onChange(event);
  };

  return (
    <div className={`${className} relative`}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <Flatpickr
          value={value}
          onChange={handleDateChange}
          options={{
            dateFormat: 'Y-m-d', // Keep this format for form value
            static: true,
            disableMobile: true,
            allowInput: true,
            disabled,
            position: 'auto',
          }}
          placeholder={placeholder}
          className={`
            dark:bg-dark-900 shadow-theme-xs 
            focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 
            h-11 w-full appearance-none rounded-lg border border-gray-300 
            bg-transparent px-4 py-2.5 pr-11 pl-4 text-sm 
            text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden 
            dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30
            ${error ? 'border-red-500' : ''}
            ${disabled ? 'cursor-not-allowed opacity-50' : ''}
          `}
        />
        {/* Display formatted date */}
        {value && (
          <div className="formatted-date">
            {formatDisplayDate(value)}
          </div>
        )}
        <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
          <svg
            className="fill-current"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M6.66659 1.5415C7.0808 1.5415 7.41658 1.87729 7.41658 2.2915V2.99984H12.5833V2.2915C12.5833 1.87729 12.919 1.5415 13.3333 1.5415C13.7475 1.5415 14.0833 1.87729 14.0833 2.2915V2.99984L15.4166 2.99984C16.5212 2.99984 17.4166 3.89527 17.4166 4.99984V7.49984V15.8332C17.4166 16.9377 16.5212 17.8332 15.4166 17.8332H4.58325C3.47868 17.8332 2.58325 16.9377 2.58325 15.8332V7.49984V4.99984C2.58325 3.89527 3.47868 2.99984 4.58325 2.99984L5.91659 2.99984V2.2915C5.91659 1.87729 6.25237 1.5415 6.66659 1.5415ZM6.66659 4.49984H4.58325C4.30711 4.49984 4.08325 4.7237 4.08325 4.99984V6.74984H15.9166V4.99984C15.9166 4.7237 15.6927 4.49984 15.4166 4.49984H13.3333H6.66659ZM15.9166 8.24984H4.08325V15.8332C4.08325 16.1093 4.30711 16.3332 4.58325 16.3332H15.4166C15.6927 16.3332 15.9166 16.1093 15.9166 15.8332V8.24984Z"
            />
          </svg>
        </span>
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
};

export default DatePickerInput; 