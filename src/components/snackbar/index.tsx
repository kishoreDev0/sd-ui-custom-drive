import { useEffect, useState } from 'react';
import { X, TriangleAlert, Ban, CircleCheckBig } from 'lucide-react';

export type SnackbarType = 'success' | 'error' | 'warning';

interface SnackbarProps {
  message: string;
  type: SnackbarType;
  duration?: number;
  onClose?: () => void;
}

const icons = {
  success: CircleCheckBig,
  error: Ban,
  warning: TriangleAlert,
};

const typeStyles = {
  success: {
    container: 'bg-[var(--success-bg1)] text-[var(--snackbar-text)]',
    icon: 'bg-[var(--success-bg)] text-[var(--success)]',
  },
  error: {
    container: 'bg-[var(--error-bg1)] text-[var(--snackbar-text)]',
    icon: 'bg-[var(--error-bg)] text-[var(--error)]',
  },
  warning: {
    container: 'bg-[var(--warning-bg1)] text-[var(--snackbar-text)]',
    icon: 'bg-[var(--warning-bg)] text-[var(--warning)]',
  },
};

export function Snackbar({
  message,
  type = 'success',
  duration = 2000,
  onClose,
}: SnackbarProps) {
  const [isVisible, setIsVisible] = useState(true);
  const Icon = icons[type];
  const styles = typeStyles[type];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose, message]);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-8 left-0 right-0 mx-auto min-w-xs max-w-lg rounded shadow-md overflow-hidden z-[1500] ${styles.container}`}
    >
      <div className="flex items-center gap-4 py-2 px-4 font-medium">
        <div
          className={`w-6 h-6 rounded flex items-center justify-center ${styles.icon}`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <span className="flex-1 break-words whitespace-pre-wrap max-h-20 overflow-y-auto">
          {message}
        </span>
        <button
          onClick={handleClose}
          className="ml-auto p-1 rounded flex items-center justify-center"
        >
          <X className="w-4 h-4 hover:text-[var(--gray-500)]" />
        </button>
      </div>
    </div>
  );
}
