
import { useToast } from '../../context/ToastContext';

export function ToastContainer() {
  const { toasts, hideToast } = useToast();

  if (toasts.length === 0) {
    return null;
  }

  const getBootstrapClass = (type: string) => {
    switch (type) {
      case 'success': return 'text-bg-success';
      case 'error': return 'text-bg-danger';
      case 'warning': return 'text-bg-warning';
      case 'info': return 'text-bg-info';
      default: return 'text-bg-primary';
    }
  };

  return (
    <div 
      className="toast-container position-fixed top-0 end-0 p-3" 
      style={{ zIndex: 1050 }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast show ${getBootstrapClass(toast.type)}`}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div className="d-flex">
            <div className="toast-body flex-grow-1">
              {toast.message}
            </div>
            <button
              type="button"
              className="btn-close btn-close-white me-2 m-auto"
              aria-label="Close"
              onClick={() => hideToast(toast.id)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
