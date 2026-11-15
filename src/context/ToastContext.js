import React, { createContext, useContext, useState, useRef, useCallback } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);
  const idRef = useRef(0);

  const showToast = useCallback((mensaje, tipo = 'info') => {
    const id = ++idRef.current;
    setToast({ id, mensaje, tipo });
  }, []);

  const ocultarToast = useCallback((id) => {
    setToast((actual) => (actual?.id === id ? null : actual));
  }, []);

  return (
    <ToastContext.Provider value={{ toast, showToast, ocultarToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
