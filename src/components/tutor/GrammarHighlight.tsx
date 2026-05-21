import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCheck, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { GrammarError } from '@/types';

// ─── Error type colour map ────────────────────────────────────────────────────

const ERROR_COLORS: Record<string, { badge: string; dot: string }> = {
  grammar:     { badge: 'bg-red-100 text-red-700 border-red-200',    dot: 'bg-red-400' },
  spelling:    { badge: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-400' },
  punctuation: { badge: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-400' },
  vocabulary:  { badge: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-400' },
  style:       { badge: 'bg-purple-100 text-purple-700 border-purple-200', dot: 'bg-purple-400' },
};

function getErrorColor(type: string) {
  const key = type.toLowerCase().split(' ')[0] as keyof typeof ERROR_COLORS;
  return ERROR_COLORS[key] ?? { badge: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-400' };
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface GrammarHighlightProps {
  original: string;
  corrected: string;
  errors: GrammarError[];
  onApply?: (corrected: string) => void;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function GrammarHighlight({
  original,
  corrected,
  errors,
  onApply,
  className,
}: GrammarHighlightProps) {
  const [expanded, setExpanded] = useState(true);
  const [applied, setApplied] = useState(false);

  const handleApply = () => {
    setApplied(true);
    onApply?.(corrected);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm', className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-semibold text-slate-700">Grammar Check</span>
          <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700 border-amber-200">
            {errors.length} {errors.length === 1 ? 'issue' : 'issues'}
          </Badge>
        </div>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            {/* Text diff */}
            <div className="px-4 py-3 space-y-2">
              {/* Original with errors struck out */}
              <div className="text-sm leading-relaxed">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-medium mr-1">
                  Before:
                </span>
                <span className="text-slate-600 line-through decoration-red-400 decoration-2">
                  {original}
                </span>
              </div>

              {/* Corrected */}
              <div className="text-sm leading-relaxed">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-medium mr-1">
                  After:
                </span>
                <span className="text-emerald-700 font-medium">{corrected}</span>
              </div>
            </div>

            {/* Error list */}
            {errors.length > 0 && (
              <div className="px-4 pb-3 space-y-2">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Details
                </div>
                {errors.map((err, i) => {
                  const colors = getErrorColor(err.type);
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-100"
                    >
                      <span className={cn('w-2 h-2 rounded-full mt-1.5 flex-shrink-0', colors.dot)} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                          <Badge
                            variant="outline"
                            className={cn('text-[10px] px-1.5 py-0 h-4 capitalize border', colors.badge)}
                          >
                            {err.type}
                          </Badge>
                          <span className="text-xs text-slate-500">
                            <span className="text-red-500 line-through">{err.original}</span>
                            {' → '}
                            <span className="text-emerald-600 font-medium">{err.corrected}</span>
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 leading-snug">{err.explanation}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Apply button */}
            {onApply && (
              <div className="px-4 pb-3">
                <Button
                  size="sm"
                  onClick={handleApply}
                  disabled={applied}
                  className={cn(
                    'w-full text-sm',
                    applied
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 cursor-default'
                      : 'bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white'
                  )}
                >
                  <CheckCheck className="w-3.5 h-3.5 mr-1.5" />
                  {applied ? 'Corrections Applied' : 'Apply Corrections'}
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
