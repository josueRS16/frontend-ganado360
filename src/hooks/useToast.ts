import { useContext } from 'react';
import { ToastContext } from '../context/ToastContext';
import type { ToastContextType } from '../types/toast';

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
