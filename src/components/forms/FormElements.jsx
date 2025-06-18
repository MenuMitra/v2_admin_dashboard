import React, { useState } from 'react';

// Base input styles
export const baseInputStyles = `
  h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 
  text-sm text-gray-800 placeholder:text-gray-400 
  focus:ring-3 focus:outline-hidden focus:border-brand-300 focus:ring-brand-500/10
  dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 
  dark:placeholder:text-white/30 dark:focus:border-brand-800
`;

// Label styles
export const labelStyles = `
  mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400
`;

// Text Input Component
export const TextInput = React.forwardRef(({ 
  label, 
  placeholder = '', 
  type = 'text',
  value,
  onChange,
  ...props 
}, ref) => {
  return (
    <div>
      {label && <label className={labelStyles}>{label}</label>}
      <input
        ref={ref}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={baseInputStyles}
        {...props}
      />
    </div>
  );
});

// Password Input Component
export const PasswordInput = React.forwardRef(({
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
        <span
          onClick={() => setShowPassword(!showPassword)}
          className="absolute top-1/2 right-4 z-30 -translate-y-1/2 cursor-pointer"
        >
          {showPassword ? (
            <svg className="fill-gray-500 dark:fill-gray-400" width="20" height="20" viewBox="0 0 20 20">
              <path fillRule="evenodd" clipRule="evenodd" d="M10.0002 13.8619C7.23361 13.8619 4.86803 12.1372 3.92328 9.70241C4.86804 7.26761 7.23361 5.54297 10.0002 5.54297C12.7667 5.54297 15.1323 7.26762 16.0771 9.70243C15.1323 12.1372 12.7667 13.8619 10.0002 13.8619Z"/>
            </svg>
          ) : (
            <svg className="fill-gray-500 dark:fill-gray-400" width="20" height="20" viewBox="0 0 20 20">
              <path fillRule="evenodd" clipRule="evenodd" d="M10.0002 4.04297C6.48191 4.04297 3.49489 6.30917 2.4155 9.4593C2.3615 9.61687 2.3615 9.78794 2.41549 9.94552C3.49488 13.0957 6.48191 15.3619 10.0002 15.3619Z"/>
            </svg>
          )}
        </span>
      </div>
    </div>
  );
});

// Select Input Component
export const SelectInput = React.forwardRef(({
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
      <div className="relative z-20 bg-transparent">
        <select
          ref={ref}
          value={value}
          onChange={onChange}
          className={`${baseInputStyles} appearance-none pr-11`}
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
        <span className="pointer-events-none absolute top-1/2 right-4 z-30 -translate-y-1/2 text-gray-500 dark:text-gray-400">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4.79175 7.396L10.0001 12.6043L15.2084 7.396" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </div>
    </div>
  );
});

// Checkbox Component
export const Checkbox = React.forwardRef(({
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
export const DateInput = React.forwardRef(({
  label,
  value,
  onChange,
  ...props
}, ref) => {
  return (
    <div>
      {label && <label className={labelStyles}>{label}</label>}
      <input
        ref={ref}
        type="date"
        value={value}
        onChange={onChange}
        className={baseInputStyles}
        {...props}
      />
    </div>
  );
});

// Textarea Component
export const Textarea = React.forwardRef(({
  label,
  value,
  onChange,
  rows = 4,
  ...props
}, ref) => {
  return (
    <div>
      {label && <label className={labelStyles}>{label}</label>}
      <textarea
        ref={ref}
        value={value}
        onChange={onChange}
        rows={rows}
        className={`${baseInputStyles} min-h-[100px] resize-y`}
        {...props}
      />
    </div>
  );
});

// Radio Button Component
export const RadioButton = React.forwardRef(({
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
export const ToggleSwitch = React.forwardRef(({
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
export const FileInput = React.forwardRef(({
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
export const InputGroup = React.forwardRef(({
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