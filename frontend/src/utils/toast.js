import toast from 'react-hot-toast';

// Success toast
export const showSuccess = (message) => {
  toast.success(message);
};

// Error toast
export const showError = (message) => {
  toast.error(message);
};

// Info toast
export const showInfo = (message) => {
  toast(message, {
    icon: 'ℹ️',
  });
};

// Loading toast
export const showLoading = (message) => {
  return toast.loading(message);
};

// Update loading toast
export const updateToast = (toastId, message, type = 'success') => {
  if (type === 'success') {
    toast.success(message, { id: toastId });
  } else if (type === 'error') {
    toast.error(message, { id: toastId });
  } else {
    toast(message, { id: toastId });
  }
};

// Dismiss toast
export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};
