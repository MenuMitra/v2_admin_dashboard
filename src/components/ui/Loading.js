"use client";

/**
 * Loading component for indicating loading state
 * @param {Object} props - Component props
 * @param {string} props.size - Size of the spinner (sm, md, lg)
 * @param {string} props.message - Optional loading message
 * @param {boolean} props.fullScreen - Whether to display fullscreen
 * @returns {JSX.Element} - Loading component
 */
const Loading = ({ size = 'md', message = 'Loading...', fullScreen = false }) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const spinnerSize = sizeClasses[size] || sizeClasses.md;

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
        <div className="flex flex-col items-center">
          <div className={`${spinnerSize} rounded-full border-4 border-gray-200 border-t-indigo-600 animate-spin`}></div>
          {message && <p className="mt-4 text-gray-700">{message}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4">
      <div className="flex flex-col items-center">
        <div className={`${spinnerSize} rounded-full border-4 border-gray-200 border-t-indigo-600 animate-spin`}></div>
        {message && <p className="mt-2 text-sm text-gray-700">{message}</p>}
      </div>
    </div>
  );
};

export default Loading; 