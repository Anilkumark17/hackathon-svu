import { useEffect } from 'react';
import { CheckCircle, XCircle, Info } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle size={20} />,
    error: <XCircle size={20} />,
    info: <Info size={20} />,
  };

  const toastClass = `toast toast-${type}`;

  return (
    <div className={toastClass} style={styles.toast}>
      <div style={styles.content}>
        {icons[type]}
        <span>{message}</span>
      </div>
    </div>
  );
};

const styles = {
  toast: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
};

export default Toast;
