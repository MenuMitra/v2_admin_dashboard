import React from 'react';
import { Link } from 'react-router-dom';

const ChevronIcon = () => (
  <svg 
    className="stroke-current" 
    width="16" 
    height="16" 
    viewBox="0 0 16 16" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      d="M5.83333 12.6665L10 8.49984L5.83333 4.33317" 
      stroke="" 
      strokeWidth="1.2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

const Breadcrumb = ({ items }) => {
  return (
    <ol className="flex flex-wrap items-center gap-1.5 mb-5">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        if (isLast) {
          return (
            <li 
              key={index} 
              className="flex items-center gap-1.5 text-sm text-gray-800 dark:text-white/90"
            >
              <span className="text-gray-500 dark:text-gray-400">
                <ChevronIcon />
              </span>
              <span>{item.label}</span>
            </li>
          );
        }

        return (
          <li key={index}>
            <Link
              to={item.path}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
            >
              {index !== 0 && (
                <span>
                  <ChevronIcon />
                </span>
              )}
              <span>{item.label}</span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
};

export default Breadcrumb; 