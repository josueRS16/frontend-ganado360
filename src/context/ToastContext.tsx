import React, { createContext, useContext, useState, useCallback } from 'react';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type: Toast['type'], duration?: number) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  // Guardar temporizadores por id
  // Eliminar lógica de temporizadores individuales

  const showToast = useCallback((message: string, type: Toast['type'], duration = 5000) => {
    setToasts(prev => {
      // Evitar duplicados: si ya hay un toast igual activo, no agregar otro
      if (prev.some(t => t.message === message && t.type === type)) {
        return prev;
      }
      const id = Math.random().toString(36).substr(2, 9);
      const toast: Toast = { id, message, type, duration };
      // Auto-hide toast después de duration
      if (duration > 0) {
        setTimeout(() => {
          hideToast(id);
        }, duration);
      }
      return [...prev, toast];
    });
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, hideToast }}>
      {children}
      {/* Toast visual container */}
      <div style={{
        position: 'fixed',
        top: 24,
        right: 24,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        pointerEvents: 'none',
      }}>
        {toasts.map(toast => (
          <div
            key={toast.id}
            style={{
              minWidth: 280,
              maxWidth: 400,
              background: toast.type === 'error' ? '#f44336' : toast.type === 'success' ? '#4caf50' : toast.type === 'warning' ? '#ff9800' : '#2196f3',
              color: '#fff',
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              padding: '16px 24px',
              fontSize: 16,
              fontWeight: 500,
              pointerEvents: 'auto',
              opacity: 0.97,
              transition: 'opacity 0.2s',
            }}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
