import React from "react";
import PropTypes from "prop-types";

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  type = "default",
  size = "default",
  showCloseButton = true,
  customIcon,
  actionButtons,
}) => {
  if (!isOpen) return null;

  // Modal size classes
  const sizeClasses = {
    default: "max-w-[600px]",
    large: "max-w-[800px]",
    small: "max-w-[400px]",
    fullScreen: "w-full h-full m-0",
  };

  // Alert type icons and colors
  const alertStyles = {
    success: {
      bgColor: "bg-success-500",
      hoverBg: "hover:bg-success-600",
      iconBg: "fill-success-50 dark:fill-success-500/15",
      iconColor: "fill-success-600 dark:fill-success-500",
    },
    info: {
      bgColor: "bg-blue-light-500",
      hoverBg: "hover:bg-blue-light-600",
      iconBg: "fill-blue-light-50 dark:fill-blue-light-500/15",
      iconColor: "fill-blue-light-500",
    },
    warning: {
      bgColor: "bg-warning-500",
      hoverBg: "hover:bg-warning-600",
      iconBg: "fill-warning-50 dark:fill-warning-500/15",
      iconColor: "fill-warning-600 dark:fill-orange-400",
    },
    error: {
      bgColor: "bg-error-500",
      hoverBg: "hover:bg-error-600",
      iconBg: "fill-error-50 dark:fill-error-500/15",
      iconColor: "fill-error-600 dark:fill-error-500",
    },
    default: {
      bgColor: "bg-brand-500",
      hoverBg: "hover:bg-brand-600",
      iconBg: "",
      iconColor: "",
    },
  };

  const currentStyle = alertStyles[type] || alertStyles.default;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-5 overflow-y-auto modal z-99999">
      {/* Backdrop */}
      <div
        className="fixed inset-0 h-full w-full bg-gray-400/50"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className={`relative ${sizeClasses[size]} rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-10`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Title and Close Button */}
        <div className="flex items-center justify-between mb-4 gap-3">
          {title && (
            <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90 ">
              {title}
            </h4>
          )}
          {showCloseButton && (
            <button
              onClick={onClose}
              className="flex h-9.5 w-9.5 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white sm:h-11 sm:w-11"
            >
              <svg
                className="fill-current"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z"
                />
              </svg>
            </button>
          )}
        </div>

        <div className="text-center">
          {/* Content */}
          <div
            className={
              type === "default"
                ? ""
                : "text-sm leading-6 text-gray-500 dark:text-gray-400"
            }
          >
            {children}
          </div>

          {/* Action Buttons */}
          {actionButtons && (
            <div className="flex items-center justify-between w-full gap-3 mt-7">
              {actionButtons}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  type: PropTypes.oneOf(["default", "success", "info", "warning", "error"]),
  size: PropTypes.oneOf(["default", "small", "large", "fullScreen"]),
  showCloseButton: PropTypes.bool,
  customIcon: PropTypes.node,
  actionButtons: PropTypes.node,
};

export default Modal;
