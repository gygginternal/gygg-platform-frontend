import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback(
    (message, { type = 'info', duration = 4000 } = {}) => {
      const id = Date.now() + Math.random();
      setToasts(prev => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    },
    []
  );

  const removeToast = id => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>
        {toasts.map(toast => (
          <div
            key={toast.id}
            style={{
              marginBottom: 12,
              padding: '16px 24px',
              borderRadius: 8,
              background:
                toast.type === 'error'
                  ? '#ff3b30'
                  : toast.type === 'success'
                    ? '#22c55e'
                    : '#333',
              color: '#fff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              minWidth: 220,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onClick={() => removeToast(toast.id)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') removeToast(toast.id);
            }}
            role="button"
            tabIndex={0}
            aria-label={`Dismiss ${toast.type} notification`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx.showToast;
}
