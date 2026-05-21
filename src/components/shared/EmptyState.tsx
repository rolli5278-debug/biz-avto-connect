import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'ghost';
}

interface EmptyStateProps {
  /** Emoji or short text used as the illustration */
  icon: string;
  title: string;
  description: string;
  action?: EmptyStateAction;
  /** Optional secondary action */
  secondaryAction?: EmptyStateAction;
  className?: string;
  /** Size preset – affects icon and spacing */
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_MAP = {
  sm: {
    wrapper: 'py-8 gap-3',
    iconWrapper: 'w-14 h-14 text-3xl',
    title: 'text-base font-semibold',
    description: 'text-sm',
  },
  md: {
    wrapper: 'py-12 gap-4',
    iconWrapper: 'w-20 h-20 text-4xl',
    title: 'text-lg font-semibold',
    description: 'text-sm',
  },
  lg: {
    wrapper: 'py-16 gap-5',
    iconWrapper: 'w-24 h-24 text-5xl',
    title: 'text-xl font-bold',
    description: 'text-base',
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  size = 'md',
}: EmptyStateProps) {
  const sizes = SIZE_MAP[size];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        'flex flex-col items-center justify-center text-center px-6',
        sizes.wrapper,
        className
      )}
    >
      {/* Icon bubble */}
      <motion.div
        variants={itemVariants}
        className={cn(
          'flex items-center justify-center rounded-2xl',
          'bg-gradient-to-br from-muted/80 to-muted/40',
          'border border-border/60 shadow-sm',
          sizes.iconWrapper
        )}
      >
        <motion.span
          animate={{
            y: [0, -4, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          aria-hidden
        >
          {icon}
        </motion.span>
      </motion.div>

      {/* Title */}
      <motion.h3
        variants={itemVariants}
        className={cn('text-foreground mt-1', sizes.title)}
      >
        {title}
      </motion.h3>

      {/* Description */}
      <motion.p
        variants={itemVariants}
        className={cn('text-muted-foreground max-w-xs leading-relaxed', sizes.description)}
      >
        {description}
      </motion.p>

      {/* CTA Buttons */}
      {(action || secondaryAction) && (
        <motion.div variants={itemVariants} className="flex items-center gap-2 mt-1 flex-wrap justify-center">
          {action && (
            <Button
              onClick={action.onClick}
              variant={action.variant ?? 'default'}
              className={cn(
                action.variant === undefined &&
                  'bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:from-purple-700 hover:to-blue-600 shadow-md hover:shadow-lg'
              )}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant={secondaryAction.variant ?? 'outline'}
            >
              {secondaryAction.label}
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
