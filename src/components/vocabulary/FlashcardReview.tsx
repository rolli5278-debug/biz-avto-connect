import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, CheckCircle2, XCircle, Minus, Trophy, Flame, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { FlashCard } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

type Difficulty = 'hard' | 'good' | 'easy';

interface CardResult {
  cardId: string;
  difficulty: Difficulty;
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface FlashcardReviewProps {
  cards: FlashCard[];
  onComplete: (score: number) => void;
  onExit?: () => void;
}

// ─── End screen ───────────────────────────────────────────────────────────────

function EndScreen({
  results,
  total,
  onRestart,
  onComplete,
}: {
  results: CardResult[];
  total: number;
  onRestart: () => void;
  onComplete: (score: number) => void;
}) {
  const easy = results.filter((r) => r.difficulty === 'easy').length;
  const good = results.filter((r) => r.difficulty === 'good').length;
  const hard = results.filter((r) => r.difficulty === 'hard').length;
  const mastered = easy + good;
  const accuracy = total > 0 ? Math.round((mastered / total) * 100) : 0;
  const score = accuracy;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center gap-8 py-12 px-6 max-w-md mx-auto text-center"
    >
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg">
        <Trophy className="w-12 h-12 text-white" />
      </div>

      <div>
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Session Complete!</h2>
        <p className="text-slate-500">You reviewed {total} cards</p>
      </div>

      <div className="w-full space-y-4">
        {/* Accuracy ring */}
        <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl p-6 border border-violet-100">
          <div className="text-5xl font-bold text-violet-600 mb-1">{accuracy}%</div>
          <div className="text-sm text-slate-500">Accuracy</div>
          <Progress value={accuracy} className="mt-3 h-2 bg-violet-100" />
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
            <div className="text-xl font-bold text-emerald-600">{easy}</div>
            <div className="text-xs text-slate-500">Easy</div>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
            <Minus className="w-5 h-5 text-amber-500 mx-auto mb-1" />
            <div className="text-xl font-bold text-amber-600">{good}</div>
            <div className="text-xs text-slate-500">Good</div>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-xl p-3">
            <XCircle className="w-5 h-5 text-red-400 mx-auto mb-1" />
            <div className="text-xl font-bold text-red-500">{hard}</div>
            <div className="text-xs text-slate-500">Hard</div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-slate-500 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
          <Flame className="w-4 h-4 text-amber-500" />
          <span>{mastered} words mastered this session</span>
        </div>
      </div>

      <div className="flex gap-3 w-full">
        <Button variant="outline" className="flex-1" onClick={onRestart}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Review Again
        </Button>
        <Button
          className="flex-1 bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white"
          onClick={() => onComplete(score)}
        >
          <Target className="w-4 h-4 mr-2" />
          Finish
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function FlashcardReview({ cards, onComplete, onExit }: FlashcardReviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [results, setResults] = useState<CardResult[]>([]);
  const [done, setDone] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);

  const currentCard = cards[currentIndex];
  const progress = cards.length > 0 ? ((currentIndex) / cards.length) * 100 : 0;

  const handleFlip = useCallback(() => setFlipped((v) => !v), []);

  const handleAnswer = useCallback(
    (difficulty: Difficulty) => {
      const result: CardResult = { cardId: currentCard.id, difficulty };
      const newResults = [...results, result];
      setResults(newResults);
      setDirection(1);

      if (currentIndex + 1 >= cards.length) {
        setDone(true);
      } else {
        setFlipped(false);
        setTimeout(() => setCurrentIndex((i) => i + 1), 50);
      }
    },
    [currentCard, currentIndex, cards.length, results]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (done) return;
      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      }
      if (flipped) {
        if (e.key === '1') handleAnswer('hard');
        if (e.key === '2') handleAnswer('good');
        if (e.key === '3') handleAnswer('easy');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [done, flipped, handleFlip, handleAnswer]);

  const handleRestart = () => {
    setCurrentIndex(0);
    setFlipped(false);
    setResults([]);
    setDone(false);
  };

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <div className="text-5xl">🃏</div>
        <h3 className="text-xl font-semibold text-slate-700">No cards to review</h3>
        <p className="text-slate-500 text-sm">Save some words first to start a flashcard session.</p>
      </div>
    );
  }

  if (done) {
    return (
      <EndScreen
        results={results}
        total={cards.length}
        onRestart={handleRestart}
        onComplete={onComplete}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-600">
            Card {currentIndex + 1} of {cards.length}
          </span>
          <Badge variant="secondary" className="text-xs bg-violet-100 text-violet-700 border-violet-200">
            Flashcard Review
          </Badge>
        </div>
        {onExit && (
          <button
            onClick={onExit}
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Progress bar */}
      <Progress value={progress} className="h-1.5 bg-slate-100" />

      {/* Card */}
      <div
        className="relative cursor-pointer select-none"
        style={{ perspective: '1000px', height: 280 }}
        onClick={handleFlip}
      >
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: direction * 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative w-full h-full"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <motion.div
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
            className="relative w-full h-full"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Front */}
            <div
              className="absolute inset-0 rounded-2xl border border-slate-200 bg-white shadow-md p-8 flex flex-col items-center justify-center gap-4"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <p className="text-xs text-slate-400 uppercase tracking-widest font-medium">Front</p>
              <h2 className="text-4xl font-bold text-slate-800 text-center">{currentCard.front}</h2>
              <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 rounded-full px-4 py-1.5 border border-slate-100">
                <span>Press</span>
                <kbd className="bg-white border border-slate-200 rounded px-1.5 py-0.5 font-mono font-semibold text-slate-600">Space</kbd>
                <span>to flip</span>
              </div>
            </div>

            {/* Back */}
            <div
              className="absolute inset-0 rounded-2xl border border-indigo-200 bg-gradient-to-br from-violet-50 to-indigo-50 shadow-md p-8 flex flex-col items-center justify-center gap-3"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <p className="text-xs text-slate-400 uppercase tracking-widest font-medium">Back</p>
              <p className="text-lg font-semibold text-slate-700 text-center leading-snug">{currentCard.back}</p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Answer buttons — shown after flip */}
      <AnimatePresence>
        {flipped && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="grid grid-cols-3 gap-3"
          >
            <Button
              variant="outline"
              onClick={() => handleAnswer('hard')}
              className="flex flex-col h-16 gap-1 border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
            >
              <XCircle className="w-5 h-5" />
              <span className="text-xs font-semibold">Hard</span>
              <span className="text-[10px] text-red-400 font-mono">1</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => handleAnswer('good')}
              className="flex flex-col h-16 gap-1 border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100 hover:text-amber-700"
            >
              <Minus className="w-5 h-5" />
              <span className="text-xs font-semibold">Good</span>
              <span className="text-[10px] text-amber-400 font-mono">2</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => handleAnswer('easy')}
              className="flex flex-col h-16 gap-1 border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-xs font-semibold">Easy</span>
              <span className="text-[10px] text-emerald-400 font-mono">3</span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard hint */}
      <p className="text-center text-xs text-slate-400">
        {flipped ? 'Rate difficulty: 1 = Hard · 2 = Good · 3 = Easy' : 'Space to flip card'}
      </p>
    </div>
  );
}
