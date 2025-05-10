"use client";

import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';
import { useState, useEffect } from 'react';

/**
 * Alert types and their corresponding classes
 */
const ALERT_TYPES = {
  success: {
    icon: <CheckCircle size={20} />,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-500',
    textColor: 'text-green-800',
    iconColor: 'text-green-500',
  },
  error: {
    icon: <XCircle size={20} />,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-500',
    textColor: 'text-red-800',
    iconColor: 'text-red-500',
  },
  warning: {
    icon: <AlertCircle size={20} />,
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-500',
    textColor: 'text-amber-800',
    iconColor: 'text-amber-500',
  },
  info: {
    icon: <Info size={20} />,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-800',
    iconColor: 'text-blue-500',
  },
};

/**
 * Alert component for displaying messages
 * @param {Object} props - Component props
 * @param {string} props.type - Type of alert (success, error, warning, info)
 * @param {string} props.message - Alert message
 * @param {boolean} props.dismissible - Whether the alert can be dismissed
 * @param {number} props.autoHideDuration - Duration after which to auto-hide (in ms)
 * @param {Function} props.onClose - Function to call when alert is closed
 * @returns {JSX.Element|null} - Alert component or null if dismissed
 */
const Alert = ({
  type = 'info',
  message,
  dismissible = true,
  autoHideDuration = 0,
  onClose,
}) => {
  const [visible, setVisible] = useState(true);
  
  const alertStyle = ALERT_TYPES[type] || ALERT_TYPES.info;
  
  // Handle auto-hide functionality
  useEffect(() => {
    if (autoHideDuration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, autoHideDuration);
      
      return () => clearTimeout(timer);
    }
  }, [autoHideDuration, onClose]);
  
  // Handle dismiss action
  const handleDismiss = () => {
    setVisible(false);
    if (onClose) onClose();
  };
  
  if (!visible || !message) return null;
  
  return (
    <div
      className={`rounded-md border-l-4 p-4 ${alertStyle.bgColor} ${alertStyle.borderColor} transition-all duration-300 animate-fadeIn`}
      role="alert"
    >
      <div className="flex items-start">
        <div className={`mr-3 flex-shrink-0 ${alertStyle.iconColor}`}>
          {alertStyle.icon}
        </div>
        <div className="flex-1">
          <div className={`text-sm ${alertStyle.textColor}`}>
            {message}
          </div>
        </div>
        {dismissible && (
          <button
            type="button"
            className={`ml-auto -mx-1.5 -my-1.5 ${alertStyle.bgColor} ${alertStyle.textColor} rounded-lg p-1.5 inline-flex h-8 w-8 hover:bg-opacity-80 focus:ring-2 focus:ring-offset-2 ${alertStyle.borderColor}`}
            onClick={handleDismiss}
            aria-label="Dismiss"
          >
            <span className="sr-only">Dismiss</span>
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert; 