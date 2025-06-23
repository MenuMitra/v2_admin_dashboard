import { Toaster } from 'react-hot-toast';
import { TOAST_CONFIG } from '../../utils/toastController';

export const ToastProvider = ({ children }) => {
  return (
    <>
      {children}
      <Toaster
        position={TOAST_CONFIG.position}
        containerStyle={{
          zIndex: 9999999
        }}
        toastOptions={{
          duration: TOAST_CONFIG.duration,
          style: TOAST_CONFIG.style,
        }}
      />
    </>
  );
}; 