import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface XPBadgeProps {
  xp: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

// XP thresholds → color tier
function getXPTier(xp: number): {
  bg: string;
  text: string;
  ring: string;
  glow: string;
  starColor: string;
} {
  if (xp >= 25000)
    return {
      bg: 'bg-gradient-to-r from-amber-400/20 to-yellow-300/20',
      text: 'text-amber-500 dark:text-amber-400',
      ring: 'ring-amber-400/40',
      glow: 'shadow-amber-400/25',
      starColor: 'text-amber-400',
    };
  if (xp >= 14000)
    return {
      bg: 'bg-gradient-to-r from-purple-500/20 to-violet-400/20',
      text: 'text-purple-600 dark:text-purple-400',
      ring: 'ring-purple-400/40',
      glow: 'shadow-purple-400/25',
      starColor: 'text-purple-500',
    };
  if (xp >= 7000)
    return {
      bg: 'bg-gradient-to-r from-indigo-500/20 to-blue-400/20',
      text: 'text-indigo-600 dark:text-indigo-400',
      ring: 'ring-indigo-400/40',
      glow: 'shadow-indigo-400/25',
      starColor: 'text-indigo-500',
    };
  if (xp >= 3000)
    return {
      bg: 'bg-gradient-to-r from-blue-500/20 to-sky-400/20',
      text: 'text-blue-600 dark:text-blue-400',
      ring: 'ring-blue-400/40',
      glow: 'shadow-blue-400/25',
      starColor: 'text-blue-500',
    };
  return {
    bg: 'bg-gradient-to-r from-emerald-500/20 to-green-400/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    ring: 'ring-emerald-400/40',
    glow: 'shadow-emerald-400/25',
    starColor: 'text-emerald-500',
  };
}

const SIZE_MAP = {
  sm: {
    container: 'h-7 px-2 gap-1 text-xs rounded-lg',
    icon: 'w-3 h-3',
    popup: 'text-[10px] -top-6',
  },
  md: {
    container: 'h-9 px-3 gap-1.5 text-sm rounded-xl',
    icon: 'w-4 h-4',
    popup: 'text-xs -top-7',
  },
  lg: {
    container: 'h-11 px-4 gap-2 text-base rounded-xl',
    icon: 'w-5 h-5',
    popup: 'text-sm -top-8',
  },
};

export function XPBadge({ xp, size = 'md', showLabel = false, className }: XPBadgeProps) {
  const prevXpRef = useRef(xp);
  const [delta, setDelta] = useState<number | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const prev = prevXpRef.current;
    if (xp > prev) {
      setDelta(xp - prev);
      setShowPopup(true);
      const timer = setTimeout(() => {
        setShowPopup(false);
        setDelta(null);
      }, 2200);
      prevXpRef.current = xp;
      return () => clearTimeout(timer);
    }
    prevXpRef.current = xp;
  }, [xp]);

  const tier = getXPTier(xp);
  const sizes = SIZE_MAP[size];

  const formatted =
    xp >= 1_000_000
      ? `${(xp / 1_000_000).toFixed(1)}M`
      : xp >= 10_000
      ? `${(xp / 1_000).toFixed(1)}k`
      : xp.toLocaleString('en-US');

  return (
    <div className={cn('relative inline-flex items-center', className)}>
      {/* +XP popup */}
      <AnimatePresence>
        {showPopup && delta !== null && (
          <motion.span
            key="xp-popup"
            initial={{ opacity: 0, y: 0, scale: 0.7 }}
            animate={{ opacity: 1, y: -4, scale: 1 }}
            exit={{ opacity: 0, y: -14, scale: 0.8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              'absolute right-0 pointer-events-none z-10 font-bold whitespace-nowrap',
              'text-emerald-500 drop-shadow',
              sizes.popup
            )}
          >
            +{delta} XP
          </motion.span>
        )}
      </AnimatePresence>

      {/* Badge */}
      <motion.div
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className={cn(
          'inline-flex items-center font-semibold ring-1 shadow-sm select-none',
          tier.bg,
          tier.text,
          tier.ring,
          tier.glow,
          sizes.container
        )}
      >
        <Star className={cn('shrink-0 fill-current', tier.starColor, sizes.icon)} />
        <span>{formatted}</span>
        {showLabel && <span className="opacity-70 ml-0.5">XP</span>}
      </motion.div>
    </div>
  );
}
