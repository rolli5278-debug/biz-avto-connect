import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Copy, Check, BookOpen, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { GrammarHighlight } from './GrammarHighlight';
import type { ChatMessage as ChatMessageType, GrammarError } from '@/types';

// ─── Vocab tip card ───────────────────────────────────────────────────────────

interface VocabCardData {
  word: string;
  partOfSpeech: string;
  definition: string;
  example: string;
  translation_uz: string;
}

function VocabTipCard({ data }: { data: VocabCardData }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mt-2 rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50 p-3 max-w-xs"
    >
      <div className="flex items-center gap-1.5 mb-1">
        <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
        <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
          Vocabulary Tip
        </span>
      </div>
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-base font-bold text-slate-800">{data.word}</span>
        <Badge variant="secondary" className="text-[10px] bg-indigo-100 text-indigo-700 border-indigo-200 px-1.5 py-0">
          {data.partOfSpeech}
        </Badge>
      </div>
      <p className="text-xs text-slate-600 mb-1 leading-snug">{data.definition}</p>
      <p className="text-xs text-slate-500 italic mb-1">"{data.example}"</p>
      <p className="text-xs text-amber-700 font-medium">🇺🇿 {data.translation_uz}</p>
    </motion.div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ChatMessageProps {
  message: ChatMessageType;
  isTyping?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const meta = message.metadata as Record<string, unknown> | undefined;
  const vocabData = meta?.vocab as VocabCardData | undefined;
  const grammarErrors = meta?.errors as GrammarError[] | undefined;
  const correctedText = meta?.corrected as string | undefined;

  const timestamp = new Date(message.created_at).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={cn('flex gap-3 group', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 mt-0.5">
        {isUser ? (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow">
            <User className="w-4 h-4 text-white" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md">
            <Bot className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      {/* Message body */}
      <div className={cn('flex flex-col max-w-[75%]', isUser ? 'items-end' : 'items-start')}>
        {/* Bubble */}
        <div className="relative">
          <div
            className={cn(
              'px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm',
              isUser
                ? 'bg-gradient-to-br from-violet-500 to-indigo-600 text-white rounded-tr-sm'
                : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
            )}
          >
            {message.content}
          </div>

          {/* Copy button — appears on hover */}
          <motion.button
            initial={{ opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            onClick={handleCopy}
            className={cn(
              'absolute -top-2 opacity-0 group-hover:opacity-100 transition-opacity',
              'w-6 h-6 rounded-full bg-white border border-slate-200 shadow-sm',
              'flex items-center justify-center text-slate-500 hover:text-slate-700',
              isUser ? 'left-0 -translate-x-2' : 'right-0 translate-x-2'
            )}
            title="Copy message"
          >
            {copied ? (
              <Check className="w-3 h-3 text-emerald-500" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </motion.button>
        </div>

        {/* Grammar correction block */}
        {message.type === 'grammar_correction' && grammarErrors && correctedText && (
          <div className={cn('mt-2 w-full max-w-lg', isUser ? 'self-end' : 'self-start')}>
            <GrammarHighlight
              original={message.content}
              corrected={correctedText}
              errors={grammarErrors}
            />
          </div>
        )}

        {/* Vocabulary tip card */}
        {message.type === 'vocab_tip' && vocabData && (
          <VocabTipCard data={vocabData} />
        )}

        {/* Timestamp */}
        <span className="text-[10px] text-slate-400 mt-1 px-1">{timestamp}</span>
      </div>
    </motion.div>
  );
}
