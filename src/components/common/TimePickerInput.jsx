import React from 'react';

const TimePickerInput = ({ 
  label, 
  value, 
  onChange, 
  name, 
  placeholder = "12:00 AM",
  required = false,
  disabled = false,
  className = "",
  error = ""
}) => {
  const handleTimeChange = (e) => {
    const selectedTime = e.target.value;
    if (!selectedTime) return;

    // Convert 24h time to 12h format with AM/PM
    const [hours, minutes] = selectedTime.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = (hour % 12) || 12;
    
    // Just send the time and AM/PM without the date
    const formattedTime = `${formattedHour.toString().padStart(2, '0')}:${minutes} ${ampm}`;
    
    const syntheticEvent = {
      target: {
        name,
        value: formattedTime // Now just "HH:MM AM/PM"
      }
    };
    onChange(syntheticEvent);
  };

  // Convert API time format back to 24h format for input
  const getInputValue = () => {
    if (!value) return '';
    try {
      // Extract just the time part, ignoring the date portion
      const parts = value.split(' ');
      const timePart = parts.length > 2 ? `${parts[1]} ${parts[2]}` : value;
      const [time, period] = timePart.split(' ');
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const isPM = period === 'PM';
      
      // Convert to 24h format
      let hour24 = hour;
      if (isPM && hour !== 12) hour24 += 12;
      if (!isPM && hour === 12) hour24 = 0;
      
      return `${hour24.toString().padStart(2, '0')}:${minutes}`;
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
        <input
          type="time"
          value={getInputValue()}
          onChange={handleTimeChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          onClick={(e) => e.target.showPicker()}
          className={`
            dark:bg-dark-900 shadow-theme-xs 
            focus:border-brand-300 focus:ring-brand-500/10 
            dark:focus:border-brand-800 
            h-11 w-full appearance-none rounded-lg 
            border border-gray-300 bg-transparent 
            px-4 py-2.5 pr-11 pl-4 text-sm 
            text-gray-800 placeholder:text-gray-400 
            focus:ring-3 focus:outline-hidden 
            dark:border-gray-700 dark:bg-gray-900 
            dark:text-white/90 dark:placeholder:text-white/30
            bg-none
            ${error ? 'border-red-500' : ''}
            ${disabled ? 'cursor-not-allowed opacity-50' : ''}
          `}
        />
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