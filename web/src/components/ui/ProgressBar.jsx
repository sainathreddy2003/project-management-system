import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '../../lib/utils.js';

export function ProgressBar({ progress = 0, className, barClassName, height = 'h-1.5' }) {
  const shouldReduceMotion = useReducedMotion();
  const clamped = Math.min(100, Math.max(0, Math.round(Number(progress) || 0)));

  return (
    <div className={cn('w-full bg-zinc-200 rounded-full overflow-hidden', height, className)}>
      <motion.div
        className={cn('h-full bg-accent rounded-full', barClassName)}
        initial={shouldReduceMotion ? false : { width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { duration: 0.65, ease: [0.16, 1, 0.3, 1] }
        }
      />
    </div>
  );
}
