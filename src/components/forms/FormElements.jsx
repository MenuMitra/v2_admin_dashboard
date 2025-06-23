import React, { useState } from 'react';
import DatePickerInput from '../common/DatePickerInput';
import TimePickerInput from '../common/TimePickerInput';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { validateInput } from '../../utils/validationPatterns';

// Base input styles
const baseInputStyles = `
  h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 
  text-sm text-gray-800 placeholder:text-gray-400 
  focus:ring-3 focus:outline-hidden focus:border-brand-300 focus:ring-brand-500/10
  dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 
  dark:placeholder:text-white/30 dark:focus:border-brand-800
`;

// Label styles
const labelStyles = `
  mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400
`;

// Update the Required Label component to show asterisk on the left
const RequiredLabel = ({ label }) => (
  <span>
    <span className="text-error-600 text-red-500 mr-1">*</span>
    {label}
  </span>
);

// Text Input Component
const TextInput = React.forwardRef(({ 
  label, 
  required,
  placeholder = '', 
  type = 'text',
  value,
  onChange,
  validationType = null,
  onValidation = () => {},
  isSubmitAttempted = false,
  className = '',
  ...props 
}, ref) => {
  const [error, setError] = useState('');
  
  const showError = (required && isSubmitAttempted && !value) || error;

  const handleChange = (e) => {
    const newValue = e.target.value;
    
    if (validationType) {
      const { isValid, message } = validateInput(newValue, validationType);
      setError(message);
      onValidation(isValid);
    }
    
    onChange?.(e);
  };

  return (
    <div className="relative">
      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
        {required && <span className="text-error-600">*</span>} {label}
      </label>
      <input
        ref={ref}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        required={required}
        className={`
          w-full px-3 py-2 border rounded-lg shadow-sm
          focus:outline-none focus:ring-2 focus:ring-brand-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${className}
          ${showError ? 'border-error-500 focus:border-error-500' : ''}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-error-500">
          {error}
        </p>
      )}
      {required && isSubmitAttempted && !value && (
        <p className="mt-1 text-sm text-error-500">
          This field is required
        </p>
      )}
    </div>
  );
});

// Password Input Component
const PasswordInput = React.forwardRef(({
  label,
  placeholder = 'Enter your password',
  value,
  onChange,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      {label && <label className={labelStyles}>{label}</label>}
      <div className="relative">
        <input
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`${baseInputStyles} pr-11`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <FontAwesomeIcon 
            icon={showPassword ? faEye : faEyeSlash} 
            className="w-5 h-5"
          />
        </button>
      </div>
    </div>
  );
});

// Select Input Component
const SelectInput = React.forwardRef(({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Select Option',
  ...props
}, ref) => {
  return (
    <div>
      {label && <label className={labelStyles}>{label}</label>}
      <div className="relative z-20">
        <select
          ref={ref}
          value={value}
          onChange={onChange}
          className={`
            ${baseInputStyles} 
            !appearance-none
            !select-none
            !pr-11
            !bg-transparent
            border-gray-300
            dark:border-gray-700
            [appearance:none]
            [-webkit-appearance:none]
            [-moz-appearance:none]
            [&::-ms-expand]{display:none}
            [&::-webkit-inner-spin-button]{display:none}
            [&::-webkit-calendar-picker-indicator]{display:none}
            [&::-webkit-dropdown-button]{display:none}
            [&::-webkit-select-arrow]{display:none}
            [&::-moz-select-arrow]{display:none}
            [&::-ms-select-arrow]{display:none}
            [&::-o-select-arrow]{display:none}
            [&::select-arrow]{display:none}
          `}
          style={{
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            appearance: 'none',
            backgroundImage: 'none'
          }}
          {...props}
        >
          <option value="" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">
            {placeholder}
          </option>
          {options.map((option, index) => (
            <option 
              key={index} 
              value={option.value}
              className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
            >
              {option.label}
            </option>
          ))}
        </select>
        <span className="absolute top-1/2 right-4 z-[31] -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none select-none">
          <svg 
            className="fill-none stroke-current" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24"
          >
            <path 
              d="M6 9L12 15L18 9" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
    </div>
  );
});

// Checkbox Component
const Checkbox = React.forwardRef(({
  label,
  checked,
  onChange,
  ...props
}, ref) => {
  return (
    <label className="inline-flex items-center">
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="form-checkbox h-5 w-5 rounded border-gray-300 text-brand-500 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900"
        {...props}
      />
      {label && (
        <span className="ml-2 text-sm text-gray-700 dark:text-gray-400">
          {label}
        </span>
      )}
    </label>
  );
});

// Date Input Component
const DateInput = React.forwardRef(({
  label,
  required,
  value,
  onChange,
  placeholder = "Select date",
  disabled = false,
  className = "",
  error = "",
  ...props
}, ref) => {
  // Function to format date to DD MMM YYYY
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return ''; // Invalid date
    
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).replace(/ /g, ' '); // Ensure proper spacing
  };

  // Custom onChange handler to format the date
  const handleDateChange = (e) => {
    const inputDate = e.target.value; // This will be in YYYY-MM-DD format from the date input
    
    // Create a synthetic event to match the standard onChange format
    const syntheticEvent = {
      target: {
        name: e.target.name,
        value: formatDate(inputDate) // Convert to DD MMM YYYY format
      }
    };

    onChange(syntheticEvent);
  };

  // Convert DD MMM YYYY to YYYY-MM-DD for the input value
  const getInputValue = () => {
    if (!value) return '';
    
    // If it's already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }

    // Try to parse DD MMM YYYY format
    const parts = value.split(' ');
    if (parts.length === 3) {
      const months = {
        'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
        'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
      };
      
      const day = parts[0].padStart(2, '0');
      const month = months[parts[1]] || '';
      const year = parts[2];

      if (day && month && year) {
        return `${year}-${month}-${day}`;
      }
    }

    return '';
  };

  return (
    <DatePickerInput
      ref={ref}
      label={required ? <RequiredLabel label={label} /> : label}
      value={getInputValue()}
      onChange={handleDateChange}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className={className}
      error={error}
      type="date" // Enforce date type
      max="2999-12-31" // Reasonable future date limit
      min="1900-01-01" // Reasonable past date limit
      {...props}
    />
  );
});

// Textarea Component
const Textarea = React.forwardRef(({
  label,
  required,
  value,
  onChange,
  rows = 4,
  ...props
}, ref) => {
  return (
    <div>
      {label && (
        <label className={labelStyles}>
          {required ? <RequiredLabel label={label} /> : label}
        </label>
      )}
      <textarea
        ref={ref}
        value={value}
        onChange={onChange}
        rows={rows}
        required={required}
        className={`${baseInputStyles} min-h-[100px] resize-y`}
        {...props}
      />
    </div>
  );
});

// Radio Button Component
const RadioButton = React.forwardRef(({
  label,
  checked,
  value,
  name,
  onChange,
  ...props
}, ref) => {
  return (
    <label className="inline-flex items-center">
      <input
        ref={ref}
        type="radio"
        checked={checked}
        value={value}
        name={name}
        onChange={onChange}
        className="form-radio h-5 w-5 border-gray-300 text-brand-500 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900"
        {...props}
      />
      {label && (
        <span className="ml-2 text-sm text-gray-700 dark:text-gray-400">
          {label}
        </span>
      )}
    </label>
  );
});

// Toggle Switch Component
const ToggleSwitch = React.forwardRef(({
  label,
  checked,
  onChange,
  ...props
}, ref) => {
  return (
    <label className="inline-flex items-center">
      <div className="relative inline-block">
        <input
          ref={ref}
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={onChange}
          {...props}
        />
        <div className={`
          h-6 w-11 rounded-full transition-colors duration-200 ease-in-out
          ${checked ? 'bg-brand-500' : 'bg-gray-200 dark:bg-gray-700'}
        `}>
          <div className={`
            h-5 w-5 rounded-full bg-white transition-transform duration-200 ease-in-out
            ${checked ? 'translate-x-6' : 'translate-x-1'}
          `}/>
        </div>
      </div>
      {label && (
        <span className="ml-2 text-sm text-gray-700 dark:text-gray-400">
          {label}
        </span>
      )}
    </label>
  );
});

// File Input Component
const FileInput = React.forwardRef(({
  label,
  onChange,
  accept,
  multiple = false,
  ...props
}, ref) => {
  return (
    <div>
      {label && <label className={labelStyles}>{label}</label>}
      <div className="relative">
        <input
          ref={ref}
          type="file"
          onChange={onChange}
          accept={accept}
          multiple={multiple}
          className={`
            file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0
            file:text-sm file:font-medium file:bg-brand-500 file:text-white
            hover:file:bg-brand-600 file:cursor-pointer
            text-sm text-gray-700 dark:text-gray-400
            ${baseInputStyles}
          `}
          {...props}
        />
      </div>
    </div>
  );
});

// Input Group Component
const InputGroup = React.forwardRef(({
  label,
  prefix,
  suffix,
  value,
  onChange,
  type = 'text',
  ...props
}, ref) => {
  return (
    <div>
      {label && <label className={labelStyles}>{label}</label>}
      <div className="relative flex">
        {prefix && (
          <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400">
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          type={type}
          value={value}
          onChange={onChange}
          className={`
            ${baseInputStyles}
            ${prefix ? 'rounded-l-none' : ''}
            ${suffix ? 'rounded-r-none' : ''}
          `}
          {...props}
        />
        {suffix && (
          <span className="inline-flex items-center px-3 rounded-r-lg border border-l-0 border-gray-300 bg-gray-50 text-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
});

// Add display names for all components
RadioButton.displayName = 'RadioButton';
ToggleSwitch.displayName = 'ToggleSwitch';
FileInput.displayName = 'FileInput';
InputGroup.displayName = 'InputGroup';

// Add display names for better debugging
TextInput.displayName = 'TextInput';
PasswordInput.displayName = 'PasswordInput';
SelectInput.displayName = 'SelectInput';
Checkbox.displayName = 'Checkbox';
DateInput.displayName = 'DateInput';
Textarea.displayName = 'Textarea';

// Single consolidated export at the end
export {
  // Styles
  baseInputStyles,
  labelStyles,
  RequiredLabel,
  
  // Components
  TextInput,
  PasswordInput,
  SelectInput,
  Checkbox,
  DateInput,
  Textarea,
  RadioButton,
  ToggleSwitch,
  FileInput,
  InputGroup,
  TimePickerInput
}; 