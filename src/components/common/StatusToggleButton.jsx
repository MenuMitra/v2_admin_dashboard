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

  // Improved check for isActive as requested
  const isReallyActive = [1, "1", true].includes(isActive);

  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`
        rounded-full font-medium transition-all duration-200
        flex items-center gap-2
        px-2 py-1 text-sm
        ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"}
        ${className}
      `}
    >
      <div
        className={`
          relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none 
          ${isReallyActive ? 'bg-brand-500' : 'bg-gray-300'}
        `}
      >
        <span
          className={`
            pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
          `}
          style={{
            transform: isReallyActive ? "translateX(1.25rem)" : "translateX(0)",
          }}
        />
      </div>
      {label && (
        <span
          className={`transition-colors duration-200 ${isReallyActive ? "text-brand-500" : "text-error-500"}`}
        >
          {label}
        </span>
      )}
    </button>
  );
};

export default StatusToggleButton;


