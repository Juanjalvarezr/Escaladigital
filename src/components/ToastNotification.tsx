import React, { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose: (id: string) => void;
  showRetry?: boolean;
  onRetry?: () => void;
}

const ToastNotification: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  action,
  onClose,
  showRetry = false,
  onRetry
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Animación de entrada
    setIsVisible(true);

    // Auto-cierre después de la duración
    if (duration > 0 && type !== 'loading') {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, type]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  const getIcon = () => {
    const iconClass = "w-5 h-5 flex-shrink-0";
    
    switch (type) {
      case 'success':
        return <div className={`${iconClass} text-green-500`}>✓</div>;
      case 'error':
        return <div className={`${iconClass} text-red-500`}>✕</div>;
      case 'warning':
        return <div className={`${iconClass} text-yellow-500`}>⚠</div>;
      case 'info':
        return <div className={`${iconClass} text-blue-500`}>ℹ</div>;
      case 'loading':
        return <div className={`${iconClass} text-blue-500 animate-spin`}>⟳</div>;
      default:
        return <div className={`${iconClass} text-gray-500`}>ℹ</div>;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'loading':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 max-w-sm w-full
        transform transition-all duration-300 ease-in-out
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className={`
        rounded-lg border shadow-lg p-4
        ${getColors()}
      `}>
        <div className="flex items-start space-x-3">
          {/* Icono */}
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>

          {/* Contenido */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm leading-tight">
              {title}
            </h4>
            
            {message && (
              <p className="mt-1 text-sm opacity-90 leading-relaxed">
                {message}
              </p>
            )}

            {/* Acciones */}
            <div className="mt-3 flex items-center space-x-2">
              {action && (
                <button
                  onClick={action.onClick}
                  className="text-sm font-medium underline hover:no-underline"
                >
                  {action.label}
                </button>
              )}
              
              {showRetry && onRetry && (
                <button
                  onClick={onRetry}
                  className="text-sm font-medium underline hover:no-underline flex items-center space-x-1"
                >
                  <span>⟳</span>
                  <span>Reintentar</span>
                </button>
              )}
            </div>
          </div>

          {/* Botón cerrar */}
          <button
            onClick={handleClose}
            className="flex-shrink-0 p-1 rounded-md hover:bg-black/10 transition-colors"
          >
            <span className="w-4 h-4 opacity-70">×</span>
          </button>
        </div>

        {/* Barra de progreso para loading */}
        {type === 'loading' && (
          <div className="mt-3">
            <div className="w-full bg-black/20 rounded-full h-1">
              <div className="bg-blue-500 h-1 rounded-full animate-pulse" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Hook para manejar toasts
export const useToast = () => {
  const [toasts, setToasts] = useState<Array<{
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
    action?: {
      label: string;
      onClick: () => void;
    };
    showRetry?: boolean;
    onRetry?: () => void;
  }>>([]);

  const addToast = (
    type: ToastType,
    title: string,
    message?: string,
    options?: {
      duration?: number;
      action?: {
        label: string;
        onClick: () => void;
      };
      showRetry?: boolean;
      onRetry?: () => void;
    }
  ) => {
    const id = Date.now().toString();
    const newToast = {
      id,
      type,
      title,
      message,
      ...options
    };

    setToasts(prev => [...prev, newToast]);
    return id;
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const success = (title: string, message?: string, options?: any) =>
    addToast('success', title, message, options);

  const error = (title: string, message?: string, options?: any) =>
    addToast('error', title, message, options);

  const warning = (title: string, message?: string, options?: any) =>
    addToast('warning', title, message, options);

  const info = (title: string, message?: string, options?: any) =>
    addToast('info', title, message, options);

  const loading = (title: string, message?: string) =>
    addToast('loading', title, message, { duration: 0 });

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
    loading
  };
};

// Contenedor de toasts
export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <>
      {toasts.map((toast) => (
        <ToastNotification
          key={toast.id}
          {...toast}
          onClose={removeToast}
        />
      ))}
    </>
  );
};

export default ToastNotification;
