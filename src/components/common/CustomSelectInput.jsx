import React from 'react';
import Select from 'react-select';

const CustomSelectInput = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select Option',
  required,
  error,
  errorMessage,
  ...props
}) => {
  // Find the selected option object
  const selectedOption = options.find(opt => opt.value === value) || null;

  return (
    <div>
      {label && (
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
          {required && <span className="text-error-600">*</span>} {label}
        </label>
      )}
      <Select
        value={selectedOption}
        onChange={option => onChange({ target: { name: props.name, value: option ? option.value : '' } })}
        options={options}
        placeholder={placeholder}
        menuPlacement="bottom"
        classNamePrefix="react-select"
        styles={{
          menu: provided => ({ ...provided, zIndex: 9999 }),
          control: provided => ({
            ...provided,
            borderColor: error ? '#f87171' : '#d1d5db', // Tailwind error or gray
            minHeight: '44px'
          }),
        }}
        {...props}
      />
      {error && (
        <p className="text-error-500 text-sm mt-1">
          {errorMessage || `Please select a ${label?.toLowerCase()}`}
        </p>
      )}
    </div>
  );
};

export default CustomSelectInput; 