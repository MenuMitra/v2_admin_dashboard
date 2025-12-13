import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

const SaveButton = ({
  onClick,
  children = "Save",
  type = "submit",
  className = "",
  disabled = false,
  isLoading = false,
  icon = null,
}) => {
  const renderIcon = icon || (
    <span className="flex items-center justify-center w-6 h-5 rounded-full border-2 transition-all duration-200"
          style={{ borderColor: '#3bdde3' }}>
      <FontAwesomeIcon 
        icon={faCheck} 
        className="w-3 h-3 transition-all duration-200" 
        style={{ color: '#3bdde3' }}
        size="xs" 
      />
    </span>
  );

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        px-4 py-2 border-2 rounded-full
        text-sm font-medium bg-white 
        hover:shadow-md hover:scale-105 transform
        focus:outline-none focus:ring-2 focus:ring-offset-2
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      style={{
        borderColor: '#3bdde3',
        color: '#3bdde3',
        backgroundColor: 'white'
      }}
      onMouseEnter={(e) => {
        if (!disabled && !isLoading) {
          const button = e.currentTarget;
          const iconContainer = button.querySelector('span');
          const icon = button.querySelector('svg');
          
          button.style.backgroundColor = '#e6ffffff';
          button.style.color = '#3bdde3';
          if (iconContainer) iconContainer.style.borderColor = '#3bdde3';
          if (icon) icon.style.color = '#3bdde3';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !isLoading) {
          const button = e.currentTarget;
          const iconContainer = button.querySelector('span');
          const icon = button.querySelector('svg');
          
          button.style.backgroundColor = 'white';
          button.style.color = '#3bdde3';
          if (iconContainer) iconContainer.style.borderColor = '#3bdde3';
          if (icon) icon.style.color = '#3bdde3';
        }
      }}
    >
      <div className="flex items-center justify-center gap-3">
        {renderIcon}
        {children}
      </div>
    </button>
  );
};

export default SaveButton;