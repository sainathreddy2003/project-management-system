import React, { useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils.js';

export function Modal({ isOpen, onClose, title, description, children, maxWidth = 'max-w-md' }) {
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Dim backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.18 }}
            className="fixed inset-0 bg-graphite-900/40 backdrop-blur-xs"
            onClick={onClose}
          />

          {/* Modal Dialog container */}
          <motion.div
            key="modal-dialog"
            initial={
              shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.96, y: 8 }
            }
            animate={
              shouldReduceMotion
                ? { opacity: 1 }
                : { opacity: 1, scale: 1, y: 0 }
            }
            exit={
              shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.96, y: 6 }
            }
            transition={{
              duration: shouldReduceMotion ? 0 : 0.22,
              ease: [0.16, 1, 0.3, 1],
            }}
            className={cn(
              'relative w-full bg-white border border-surface-border rounded-lg shadow-xl overflow-hidden z-10',
              maxWidth
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border bg-surface-muted/50">
              <div>
                <h3 className="text-sm font-semibold text-graphite-900">{title}</h3>
                {description && <p className="text-xs text-graphite-500 mt-0.5">{description}</p>}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded text-graphite-400 hover:text-graphite-700 hover:bg-zinc-200/50 transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content body - form inputs remain stable */}
            <div className="p-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
