import React from 'react';
import Modal from '../Modal';

const DeleteConfirmModal = ({ 
  isOpen, 
  onClose, 
  onDelete,
  title = "Confirm Delete",
  message = "Are you sure ?"
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      type="error"
      title={title}
      size="small"
      actionButtons={
        <div className="flex justify-between w-full">
          <button
            type="button"
            onClick={onClose}
            className="flex justify-center rounded-full border border-gray-300 bg-white px-4 py-3 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 sm:w-auto"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="flex justify-center px-4 py-3 text-theme-sm font-medium text-white rounded-full bg-error-500 shadow-theme-xs hover:bg-error-600 sm:w-auto"
          >
            Delete
          </button>
        </div>
      }
    >
      <div className="flex items-start">
        <p className="text-theme-sm text-gray-500 dark:text-gray-400">
          {message}
        </p>
      </div>
    </Modal>
  );
};

export default DeleteConfirmModal;
