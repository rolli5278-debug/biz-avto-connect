import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

const DOT_VARIANTS = {
  initial: { y: 0 },
  animate: { y: [-4, 0, -4] },
};

const DOT_TRANSITION = (delay: number) => ({
  duration: 0.6,
  repeat: Infinity,
  ease: 'easeInOut' as const,
  delay,
});

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.2 }}
      className="flex items-end gap-3 max-w-xs"
    >
      {/* AI Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md">
        <Bot className="w-4 h-4 text-white" />
      </div>

      {/* Bubble */}
      <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex flex-col gap-1">
        <span className="text-xs text-slate-400 font-medium">EnglishAI is typing…</span>
        <div className="flex items-center gap-1.5 h-4">
          {[0, 0.15, 0.3].map((delay, i) => (
            <motion.span
              key={i}
              className="w-2 h-2 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 block"
              variants={DOT_VARIANTS}
              initial="initial"
              animate="animate"
              transition={DOT_TRANSITION(delay)}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
