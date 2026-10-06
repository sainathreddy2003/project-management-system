import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../lib/utils.js';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const shouldReduceMotion = useReducedMotion();

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ title, description, variant = 'success', duration = 3500 }) => {
      const id = Date.now() + Math.random().toString(36).substring(2, 6);
      const newToast = { id, title, description, variant };

      setToasts((prev) => [...prev.slice(-3), newToast]); // Keep max 4 toasts

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  const toast = {
    success: (title, description) => addToast({ title, description, variant: 'success' }),
    error: (title, description) => addToast({ title, description, variant: 'error' }),
    info: (title, description) => addToast({ title, description, variant: 'info' }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Fixed Toast Container */}
      <div
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4 sm:px-0"
        aria-live="polite"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => {
            const isSuccess = t.variant === 'success';
            const isError = t.variant === 'error';

            return (
              <motion.div
                key={t.id}
                layout={!shouldReduceMotion}
                initial={
                  shouldReduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: 12, scale: 0.96 }
                }
                animate={
                  shouldReduceMotion
                    ? { opacity: 1 }
                    : { opacity: 1, y: 0, scale: 1 }
                }
                exit={
                  shouldReduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: 8, scale: 0.96 }
                }
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  'pointer-events-auto flex items-start gap-3 p-3 rounded border shadow-sm bg-white text-xs',
                  isSuccess && 'border-emerald-200 bg-white',
                  isError && 'border-rose-200 bg-white',
                  !isSuccess && !isError && 'border-surface-border bg-white'
                )}
              >
                <div className="shrink-0 mt-0.5">
                  {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[2.2]" />}
                  {isError && <AlertCircle className="w-4 h-4 text-rose-600 stroke-[2.2]" />}
                  {!isSuccess && !isError && <Info className="w-4 h-4 text-accent stroke-[2.2]" />}
                </div>

                <div className="flex-1 overflow-hidden">
                  <p className="font-semibold text-graphite-900 leading-tight">{t.title}</p>
                  {t.description && (
                    <p className="text-graphite-500 text-[11px] mt-0.5 truncate leading-tight">
                      {t.description}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => removeToast(t.id)}
                  className="shrink-0 p-0.5 text-graphite-400 hover:text-graphite-700 rounded transition-colors"
                  aria-label="Close notification"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      success: () => {},
      error: () => {},
      info: () => {},
    };
  }
  return context;
}
