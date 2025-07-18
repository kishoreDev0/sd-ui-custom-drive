import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from 'react';
import { Snackbar, SnackbarType } from './index';

type SnackbarContextType = {
  showSnackbar: (
    message: string,
    type?: SnackbarType,
    duration?: number,
  ) => void;
};

const SnackbarContext = createContext<SnackbarContextType | undefined>(
  undefined,
);

export const SnackbarProvider = ({ children }: { children: ReactNode }) => {
  const [snackbar, setSnackbar] = useState<{
    message: string;
    type: SnackbarType;
    duration?: number;
  } | null>(null);

  const showSnackbar = useCallback(
    (message: string, type: SnackbarType = 'success', duration = 2000) => {
      setSnackbar({ message, type, duration });
    },
    [],
  );

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      {snackbar && (
        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          duration={snackbar.duration}
          onClose={() => setSnackbar(null)}
        />
      )}
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => {
  const ctx = useContext(SnackbarContext);
  if (!ctx)
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  return ctx;
};
