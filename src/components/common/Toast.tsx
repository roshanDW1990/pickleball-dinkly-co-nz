import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const ICONS: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />,
  error: <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />,
  warning: <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />,
  info: <Info className="h-5 w-5 text-blue-500 flex-shrink-0" />,
};

const STYLES: Record<ToastVariant, string> = {
  success: 'bg-white border-green-200 shadow-green-100',
  error: 'bg-white border-red-200 shadow-red-100',
  warning: 'bg-white border-amber-200 shadow-amber-100',
  info: 'bg-white border-blue-200 shadow-blue-100',
};

const PROGRESS_STYLES: Record<ToastVariant, string> = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  warning: 'bg-amber-500',
  info: 'bg-blue-500',
};

const DURATION = 4500;

function ToastItem({ toast: t, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  return (
    <div
      className={`relative flex items-start gap-3 w-full max-w-sm px-4 py-3 rounded-xl border shadow-lg overflow-hidden
        animate-in slide-in-from-right-4 fade-in duration-300 ${STYLES[t.variant]}`}
    >
      {ICONS[t.variant]}
      <p className="flex-1 text-sm font-medium text-slate-800 leading-snug pt-0.5">{t.message}</p>
      <button
        onClick={() => onRemove(t.id)}
        className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors mt-0.5"
      >
        <X className="h-4 w-4" />
      </button>
      <div
        className={`absolute bottom-0 left-0 h-0.5 ${PROGRESS_STYLES[t.variant]} animate-shrink`}
        style={{ animationDuration: `${DURATION}ms` }}
      />
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);

  const remove = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = `toast-${++counterRef.current}`;
    setToasts(prev => [...prev, { id, message, variant }]);
    setTimeout(() => remove(id), DURATION);
  }, [remove]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 items-end pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onRemove={remove} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
