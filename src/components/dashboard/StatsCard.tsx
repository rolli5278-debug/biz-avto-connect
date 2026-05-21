import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface StatsCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  trend?: number;
  color?: string;
  /** Delay the entrance animation by this many seconds */
  delay?: number;
}

export function StatsCard({
  icon: Icon,
  title,
  value,
  trend,
  color = 'text-primary',
  delay = 0,
}: StatsCardProps) {
  const hasTrend = trend !== undefined && trend !== null;
  const isPositive = (trend ?? 0) >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
    >
      <Card className="relative overflow-hidden border-border/60 shadow-sm hover:shadow-md transition-shadow duration-300">
        {/* Subtle gradient glow */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at top left, currentColor 0%, transparent 70%)`,
          }}
        />
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider truncate">
                {title}
              </p>
              <p className="text-2xl font-bold mt-1 tabular-nums">{value}</p>
              {hasTrend && (
                <div
                  className={cn(
                    'inline-flex items-center gap-0.5 mt-1.5 text-xs font-medium',
                    isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400',
                  )}
                >
                  {isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <span>
                    {isPositive ? '+' : ''}
                    {trend}% this week
                  </span>
                </div>
              )}
            </div>

            <div
              className={cn(
                'flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center',
                'bg-primary/8 border border-primary/12',
              )}
            >
              <Icon className={cn('h-5 w-5', color)} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default StatsCard;
