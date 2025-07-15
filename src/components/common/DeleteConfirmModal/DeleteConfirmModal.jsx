import React from 'react';
import Modal from '../Modal';

const buttonBaseClasses = "flex-1 flex justify-center rounded-full px-4 py-3 text-theme-sm font-medium shadow-theme-xs sm:w-auto";
const cancelButtonClasses = `${buttonBaseClasses} border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200`;
const deleteButtonClasses = `${buttonBaseClasses} text-white bg-error-500 hover:bg-error-600`;

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
        <div className="flex justify-between w-full gap-4">
          <button
            type="button"
            onClick={onClose}
            className={cancelButtonClasses}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onDelete}
            className={deleteButtonClasses}
          >
            Delete
          </button>
        </div>
      }
    >
      <div className="flex items-start">
        <div className="text-left w-full">
          <p className="text-theme-sm text-gray-500 dark:text-gray-400">
            {message}
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmModal;
