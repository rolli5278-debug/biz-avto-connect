import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressRingProps {
  /** Value from 0 to 100 */
  value: number;
  size?: number;
  /** Stroke width in pixels */
  strokeWidth?: number;
  /** Tailwind or CSS color for the filled arc — e.g. "#8b5cf6" or "url(#gradient)" */
  color?: string;
  /** Optional label shown under the percentage */
  label?: string;
  /** Optional custom center content — if provided, percentage text is hidden */
  centerContent?: React.ReactNode;
  className?: string;
  /** Whether to animate when the value changes (default: true) */
  animated?: boolean;
  /** Duration for the fill animation in seconds */
  animationDuration?: number;
}

export function ProgressRing({
  value,
  size = 80,
  strokeWidth = 7,
  color = '#8b5cf6',
  label,
  centerContent,
  className,
  animated = true,
  animationDuration = 1.2,
}: ProgressRingProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const motionValue = useMotionValue(animated ? 0 : clampedValue);
  const strokeDashoffset = useTransform(
    motionValue,
    (v) => circumference - (v / 100) * circumference
  );
  // Integer display for the center text
  const displayValue = useTransform(motionValue, (v) => Math.round(v));

  const prevValueRef = useRef(animated ? 0 : clampedValue);

  useEffect(() => {
    if (!animated) {
      motionValue.set(clampedValue);
      prevValueRef.current = clampedValue;
      return;
    }
    const controls = animate(prevValueRef.current, clampedValue, {
      duration: animationDuration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => motionValue.set(v),
    });
    prevValueRef.current = clampedValue;
    return () => controls.stop();
  }, [clampedValue, animated, animationDuration, motionValue]);

  const gradientId = `ring-gradient-${color.replace(/[^a-z0-9]/gi, '')}`;
  const useGradient = color === 'purple' || color === 'default' || color === undefined;

  // Determine effective stroke color
  const strokeColor = useGradient ? `url(#${gradientId})` : color;

  const fontSize =
    size <= 48 ? size * 0.22 : size <= 80 ? size * 0.2 : size * 0.17;

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? `${clampedValue}% complete`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        overflow="visible"
      >
        <defs>
          {/* Default purple→blue gradient */}
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          {/* Subtle drop shadow */}
          <filter id="ring-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="2" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30 dark:text-muted/20"
        />

        {/* Filled arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset }}
          filter="url(#ring-shadow)"
        />
      </svg>

      {/* Center content */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none"
        aria-hidden
      >
        {centerContent ?? (
          <>
            <motion.span
              className="font-bold leading-none tabular-nums"
              style={{ fontSize }}
            >
              {displayValue}
              <span style={{ fontSize: fontSize * 0.65 }}>%</span>
            </motion.span>
            {label && (
              <span
                className="text-muted-foreground leading-tight mt-0.5"
                style={{ fontSize: fontSize * 0.65 }}
              >
                {label}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
