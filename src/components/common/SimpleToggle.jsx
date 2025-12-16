import React from 'react';

const SimpleToggle = ({
  isOn,
  onToggle,
  disabled = false,
  onText = "Active",
  offText = "Inactive",
  label,
  className = ""
}) => {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-2">
        <div>
          <h4 className="text-lg font-normal text-gray-800 dark:text-white/90">
            {isOn ? onText : offText}
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        </div>
      </div>
      <div className="flex items-center ml-4">
        <button
          onClick={onToggle}
          disabled={disabled}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
            isOn ? "bg-blue-500" : "bg-gray-300"
          }`}
          role="switch"
          aria-checked={isOn}
          aria-label={label}
        >
          <span
            className={`absolute h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${
              isOn ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </div>
  );
};

export default SimpleToggle;