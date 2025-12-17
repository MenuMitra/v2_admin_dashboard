import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faToggleOff, faToggleOn } from "@fortawesome/free-solid-svg-icons";

/**
 * Compact status toggle button, modeled on the AdminDetails Account Status toggle.
 *
 * Props:
 * - isActive: boolean - current active state
 * - onToggle: function - click handler
 * - disabled: boolean - disable toggle
 * - activeLabel: string - text when active (default "Active")
 * - inactiveLabel: string - text when inactive (default "Inactive")
 * - className: string - extra classes for the button
 */
const StatusToggleButton = ({
  isActive,
  onToggle,
  disabled = false,
  activeLabel = "Active",
  inactiveLabel = "Inactive",
  className = "",
}) => {
  const label = isActive ? activeLabel : inactiveLabel;

  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`
        rounded-full font-medium cursor-pointer hover:opacity-80 transition-opacity
        flex items-center justify-center gap-1.5
        px-3 py-1.5 text-sm
        min-w-[72px] min-h-8
        ${isActive ? "text-brand-500" : ""}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `}
    >
{isActive ? (
        <FontAwesomeIcon
          icon={faToggleOn}
          size="lg"
          className="text-brand-500"
          style={{ fontSize: '28px' }}
        />
      ) : (
        <div 
          className="relative inline-flex items-center justify-center" 
          style={{ 
            width:"32px",
            height: '28px'
          }}
        >
          <div 
            className="bg-gray-300 rounded-full relative" 
            style={{ 
              width: '32px', 
              height: '20px'
            }}
          >
            <div 
              className="absolute bg-white rounded-full" 
              style={{ 
                width: '12px', 
                height: '12px', 
                left: '2px', 
                top: '50%', 
                transform: 'translateY(-50%)'
              }}
            ></div>
          </div>
        </div>
      )}
      <span 
        className={`${isActive ? "text-brand-500" : ""}`}
        style={!isActive ? { color: '#921f1fff' } : {}}
      >
        {label}
      </span>
    </button>
  );
};

export default StatusToggleButton;


