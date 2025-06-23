import toast from 'react-hot-toast';

export const TOAST_CONFIG = {
  duration: 3000,
  position: 'top-right',
  style: {
    background: '#FFFFFF',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    zIndex: 9999999,
  },
  success: {
    style: {
      background: '#FFFFFF',
      color: '#10B981',
      padding: '16px',
      fontWeight: '500',
    }
  },
  error: {
    style: {
      background: '#FFFFFF',
      color: '#EF4444',
      padding: '16px',
      fontWeight: '500',
    }
  },
  warning: {
    icon: '⚠️',
    style: {
      background: '#FFFFFF',
      color: '#F59E0B',
      padding: '16px',
      fontWeight: '500',
    }
  },
  info: {
    icon: 'ℹ️',
    style: {
      background: '#FFFFFF',
      color: '#3B82F6',
      padding: '16px',
      fontWeight: '500',
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