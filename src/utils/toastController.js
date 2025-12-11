import toast from 'react-hot-toast';

// Toast configuration using Tailwind-compatible values
export const TOAST_CONFIG = {
  duration: 3000,
  position: 'top-right',
  style: {
    background: '#FFFFFF',
    borderRadius: '0.5rem', // Tailwind rounded-lg
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', // Tailwind shadow-md
    zIndex: 9999999,
  },
  success: {
    style: {
      background: '#FFFFFF',
      color: '#10B981', // Tailwind green-500
      padding: '1rem', // Tailwind p-4
      fontWeight: '500', // Tailwind font-medium
    }
  },
  error: {
    style: {
      background: '#FFFFFF',
      color: '#EF4444', // Tailwind red-500
      padding: '1rem', // Tailwind p-4
      fontWeight: '500', // Tailwind font-medium
    }
  },
  warning: {
    icon: '⚠️',
    style: {
      background: '#FFFFFF',
      color: '#F59E0B', // Tailwind amber-500
      padding: '1rem', // Tailwind p-4
      fontWeight: '500', // Tailwind font-medium
    }
  },
  info: {
    icon: 'ℹ️',
    style: {
      background: '#FFFFFF',
      color: '#3B82F6', // Tailwind blue-500
      padding: '1rem', // Tailwind p-4
      fontWeight: '500', // Tailwind font-medium
    }
  }
};

export const toastController = {
  success: (message) => {
    return toast.success(message, {
      ...TOAST_CONFIG,
      ...TOAST_CONFIG.success
    });
  },
  
  error: (message) => {
    return toast.error(message, {
      ...TOAST_CONFIG,
      ...TOAST_CONFIG.error
    });
  },

  warning: (message) => {
    return toast(message, {
      ...TOAST_CONFIG,
      ...TOAST_CONFIG.warning
    });
  },

  info: (message) => {
    return toast(message, {
      ...TOAST_CONFIG,
      ...TOAST_CONFIG.info
    });
  },

  promise: async (promise, messages) => {
    return toast.promise(promise, {
      loading: messages.loading || 'Loading...',
      success: messages.success || 'Success!',
      error: messages.error || 'Error occurred',
    }, {
      ...TOAST_CONFIG,
    });
  },

  dismiss: (toastId) => {
    toast.dismiss(toastId);
  },

  dismissAll: () => {
    toast.dismiss();
  }
}; 