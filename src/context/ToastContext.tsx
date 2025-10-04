import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import type { Toast } from '../types/toast';
import { ToastContext as ToastContextInstance } from './ToastContextInstance';

interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type: Toast['type'], duration?: number) => void;
  hideToast: (key: string) => void;
}

export const ToastContext = createContext<ToastContextType | null>(null);

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
  const timers = useRef<{ [key: string]: number }>({});

  const normalize = (str: string) => str.trim().replace(/\s+/g, ' ').toLowerCase();

  const hideToast = useCallback((key: string) => {
    setToasts(prev => prev.filter(toast => toast.key !== key));
    if (timers.current[key]) {
      clearTimeout(timers.current[key]);
      delete timers.current[key];
    }
  }, []);

  const showToast = useCallback((message: string, type: Toast['type'], duration = 5000) => {
    const key = `${type}::${normalize(message)}`;
    setToasts(prev => {
      const idx = prev.findIndex(t => t.key === key);
      if (idx !== -1) {
        // Ya existe: actualizar y reiniciar temporizador
        if (timers.current[key]) {
          clearTimeout(timers.current[key]);
        }
        if (duration > 0) {
          timers.current[key] = window.setTimeout(() => {
            hideToast(key);
          }, duration);
        }
        // Actualizar el toast (por si cambia duración)
        const updated = [...prev];
        updated[idx] = { ...updated[idx], duration };
        return updated;
      }
      // Nuevo toast
      if (duration > 0) {
        timers.current[key] = window.setTimeout(() => {
          hideToast(key);
        }, duration);
      }
      return [...prev, { key, message, type, duration }];
    });
  }, [hideToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, hideToast }}>
      {children}
      {/* Toast visual container */}
      <div
        style={{
          position: 'fixed',
          top: 24,
          right: 24,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          pointerEvents: 'none',
        }}
      >
        {[...new Map(toasts.map(t => [t.key, t])).values()].map(toast => (
          <div
            key={toast.key}
            style={{
              minWidth: 280,
              maxWidth: 400,
              background:
                toast.type === 'error'
                  ? '#f44336'
                  : toast.type === 'success'
                  ? '#1F691B'
                  : toast.type === 'warning'
                  ? '#ff9800'
                  : '#2196f3',
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
