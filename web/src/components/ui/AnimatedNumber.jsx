import React, { useEffect, useState, useRef } from 'react';
import { useReducedMotion } from 'motion/react';

export function AnimatedNumber({ value = 0, duration = 650, className }) {
  const [displayValue, setDisplayValue] = useState(0);
  const shouldReduceMotion = useReducedMotion();
  const prevTargetRef = useRef(0);
  const animFrameRef = useRef(null);

  const target = Math.round(Number(value) || 0);

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayValue(target);
      prevTargetRef.current = target;
      return;
    }

    const startValue = prevTargetRef.current;
    if (startValue === target && displayValue === target) return;

    const startTime = performance.now();
    const diff = target - startValue;

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + diff * ease);

      setDisplayValue(current);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        setDisplayValue(target);
        prevTargetRef.current = target;
      }
    }

    animFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [target, duration, shouldReduceMotion]);

  return <span className={className}>{displayValue}</span>;
}
