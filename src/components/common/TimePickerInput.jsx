import React from 'react';

const TimePickerInput = ({ 
  label, 
  value, 
  onChange, 
  name, 
  placeholder = "Select time",
  required = false,
  disabled = false,
  className = "",
  error = ""
}) => {
  // Generate time options in 30-minute intervals
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute of ['00', '30']) {
        const time = `${hour.toString().padStart(2, '0')}:${minute}`;
        const formattedHour = hour % 12 || 12;
        const ampm = hour < 12 ? 'AM' : 'PM';
        const label = `${formattedHour}:${minute} ${ampm}`;
        options.push({ value: time, label });
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  const formatTimeForAPI = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `2024-01-01 ${formattedHour.toString().padStart(2, '0')}:${minutes}:00 ${ampm}`;
  };

  const handleTimeChange = (e) => {
    const selectedTime = e.target.value;
    const formattedTime = formatTimeForAPI(selectedTime);
    
    // Create a synthetic event to match the standard onChange format
    const syntheticEvent = {
      target: {
        name,
        value: formattedTime
      }
    };
    onChange(syntheticEvent);
  };

  // Extract time from the datetime string for display in the select
  const getDisplayTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    try {
      const timePart = dateTimeString.split(' ')[1];
      const [hours, minutes] = timePart.split(':');
      return `${hours}:${minutes}`;
    } catch (error) {
      return '';
    }
  };

  return (
    <div className={`${className}`}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          value={getDisplayTime(value)}
          onChange={handleTimeChange}
          disabled={disabled}
          required={required}
          className={`
            h-11 w-full appearance-none rounded-lg border border-gray-300 
            bg-transparent px-4 py-2.5 pr-11 pl-4 text-sm 
            text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden 
            focus:border-brand-300 focus:ring-brand-500/10 
            dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 
            dark:placeholder:text-white/30 dark:focus:border-brand-800
            select-none
            [-webkit-appearance:none]
            [-moz-appearance:none]
            [&::-ms-expand]{display:none}
            [&::-webkit-inner-spin-button]{display:none}
            [&::-webkit-calendar-picker-indicator]{display:none}
            [&::-webkit-dropdown-button]{display:none}
            bg-none
            ${error ? 'border-red-500' : ''}
            ${disabled ? 'cursor-not-allowed opacity-50' : ''}
          `}
          style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
        >
          <option value="">{placeholder}</option>
          {timeOptions.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <span className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">
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
              d="M10.0002 1.5415C5.32867 1.5415 1.54175 5.32843 1.54175 9.99984C1.54175 14.6712 5.32867 18.4582 10.0001 18.4582C14.6715 18.4582 18.4584 14.6712 18.4584 9.99984C18.4584 5.32843 14.6715 1.5415 10.0001 1.5415ZM9.99998 10.7498C9.58577 10.7498 9.24998 10.4141 9.24998 9.99984V5.4165C9.24998 5.00229 9.58577 4.6665 9.99998 4.6665C10.4142 4.6665 10.75 5.00229 10.75 5.4165V9.24984H13.3334C13.7476 9.24984 14.0834 9.58562 14.0834 9.99984C14.0834 10.4141 13.7476 10.7498 13.3334 10.7498H10.0001H9.99998Z" 
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

export default TimePickerInput; 