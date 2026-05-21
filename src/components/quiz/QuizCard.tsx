import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  ChevronRight,
  Trophy,
  RotateCcw,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { QuizQuestion } from '@/types';

// ─── Props ────────────────────────────────────────────────────────────────────

interface QuizCardProps {
  questions: QuizQuestion[];
  onComplete: (score: number) => void;
  xpReward?: number;
}

// ─── End Screen ───────────────────────────────────────────────────────────────

interface EndScreenProps {
  score: number;
  total: number;
  xpReward: number;
  wrongAnswers: { question: QuizQuestion; given: string }[];
  onRetry: () => void;
}

function EndScreen({ score, total, xpReward, wrongAnswers, onRetry }: EndScreenProps) {
  const [showWrong, setShowWrong] = useState(false);
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const xpEarned = Math.round(xpReward * Math.max(0.5, score / total));

  const rating =
    percentage >= 90 ? { label: 'Excellent!', emoji: '🏆', color: 'text-amber-500' }
    : percentage >= 70 ? { label: 'Great job!', emoji: '🌟', color: 'text-emerald-500' }
    : percentage >= 50 ? { label: 'Good effort!', emoji: '💪', color: 'text-blue-500' }
    : { label: 'Keep practising!', emoji: '📚', color: 'text-orange-500' };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center gap-6 py-6 px-4 text-center"
    >
      {/* Trophy */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 18 }}
        className="text-6xl"
      >
        {rating.emoji}
      </motion.div>

      <div className="space-y-1">
        <h3 className={cn('text-2xl font-bold', rating.color)}>{rating.label}</h3>
        <p className="text-muted-foreground text-sm">Quiz complete</p>
      </div>

      {/* Score ring */}
      <div className="relative flex items-center justify-center w-32 h-32">
        <svg className="absolute inset-0 -rotate-90" width="128" height="128">
          <circle cx="64" cy="64" r="54" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/40" />
          <motion.circle
            cx="64"
            cy="64"
            r="54"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 54}`}
            strokeDashoffset={`${2 * Math.PI * 54 * (1 - percentage / 100)}`}
            className={percentage >= 70 ? 'text-emerald-500' : percentage >= 50 ? 'text-blue-500' : 'text-orange-500'}
            initial={{ strokeDashoffset: `${2 * Math.PI * 54}` }}
            animate={{ strokeDashoffset: `${2 * Math.PI * 54 * (1 - percentage / 100)}` }}
            transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
          />
        </svg>
        <div className="flex flex-col items-center">
          <span className="text-3xl font-bold tabular-nums">{percentage}%</span>
          <span className="text-xs text-muted-foreground">{score}/{total} correct</span>
        </div>
      </div>

      {/* XP earned */}
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
        <Trophy className="w-4 h-4 text-amber-500" />
        <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">+{xpEarned} XP earned</span>
      </div>

      {/* Wrong answers review */}
      {wrongAnswers.length > 0 && (
        <div className="w-full">
          <button
            onClick={() => setShowWrong(!showWrong)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
          >
            {showWrong ? 'Hide' : 'Review'} {wrongAnswers.length} wrong answer{wrongAnswers.length !== 1 ? 's' : ''}
          </button>
          <AnimatePresence>
            {showWrong && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="space-y-3 mt-3 text-left">
                  {wrongAnswers.map(({ question, given }) => (
                    <div key={question.id} className="p-3 rounded-xl border border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-950/20">
                      <p className="text-sm font-medium text-foreground mb-1">{question.question}</p>
                      <p className="text-xs text-red-600 dark:text-red-400">Your answer: {given || '(blank)'}</p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">Correct: {question.correct_answer}</p>
                      {question.explanation && (
                        <p className="text-xs text-muted-foreground mt-1 border-t border-border/40 pt-1">{question.explanation}</p>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <Button onClick={onRetry} variant="outline" className="gap-2">
        <RotateCcw className="w-4 h-4" />
        Try Again
      </Button>
    </motion.div>
  );
}

// ─── Main QuizCard ─────────────────────────────────────────────────────────────

export function QuizCard({ questions, onComplete, xpReward = 100 }: QuizCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [fillAnswer, setFillAnswer] = useState('');
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState<{ question: QuizQuestion; given: string }[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [direction, setDirection] = useState(1);

  const currentQuestion = questions[currentIndex];
  const progressPct = ((currentIndex) / questions.length) * 100;
  const isFillBlank = !currentQuestion?.options || currentQuestion.options.length === 0;

  const handleAnswer = (answer: string) => {
    if (hasAnswered) return;
    const correct = answer.trim().toLowerCase() === currentQuestion.correct_answer.trim().toLowerCase();
    setSelectedAnswer(answer);
    setHasAnswered(true);
    setIsCorrect(correct);
    if (correct) {
      setScore((s) => s + 1);
    } else {
      setWrongAnswers((prev) => [...prev, { question: currentQuestion, given: answer }]);
    }
  };

  const handleSubmitFill = () => {
    if (!fillAnswer.trim()) return;
    handleAnswer(fillAnswer.trim());
  };

  const handleNext = () => {
    const nextIndex = currentIndex + 1;
    setDirection(1);
    if (nextIndex >= questions.length) {
      setIsComplete(true);
      onComplete(score + (isCorrect ? 1 : 0));
    } else {
      setCurrentIndex(nextIndex);
      setSelectedAnswer('');
      setFillAnswer('');
      setHasAnswered(false);
      setIsCorrect(false);
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setSelectedAnswer('');
    setFillAnswer('');
    setHasAnswered(false);
    setIsCorrect(false);
    setScore(0);
    setWrongAnswers([]);
    setIsComplete(false);
    setDirection(1);
  };

  if (isComplete) {
    return (
      <EndScreen
        score={score}
        total={questions.length}
        xpReward={xpReward}
        wrongAnswers={wrongAnswers}
        onRetry={handleRetry}
      />
    );
  }

  if (!currentQuestion) return null;

  const slideVariants = {
    enter: (d: number) => ({ opacity: 0, x: d * 40 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: d * -40 }),
  };

  return (
    <div className="space-y-5">
      {/* Progress header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground font-medium">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">{score}</span>
          </div>
        </div>
        <Progress value={progressPct} className="h-2" />
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="p-5 rounded-2xl border border-border/60 bg-card shadow-sm space-y-4">
            {/* Question type badge */}
            <Badge variant="secondary" className="text-xs">
              {isFillBlank ? 'Fill in the blank' : 'Multiple choice'}
            </Badge>

            {/* Question text */}
            <h3 className="text-base font-semibold leading-relaxed">{currentQuestion.question}</h3>

            {/* Multiple choice options */}
            {!isFillBlank && currentQuestion.options && (
              <div className="space-y-2">
                {currentQuestion.options.map((option, i) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrectOption = option.trim().toLowerCase() === currentQuestion.correct_answer.trim().toLowerCase();
                  let optionStyle = 'border-border/60 bg-card hover:bg-accent/40 hover:border-border cursor-pointer';
                  if (hasAnswered) {
                    if (isCorrectOption) {
                      optionStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-200 cursor-default';
                    } else if (isSelected && !isCorrectOption) {
                      optionStyle = 'border-red-400 bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-200 cursor-default';
                    } else {
                      optionStyle = 'border-border/40 bg-muted/20 opacity-60 cursor-default';
                    }
                  }

                  return (
                    <motion.button
                      key={i}
                      whileHover={!hasAnswered ? { scale: 1.01 } : {}}
                      whileTap={!hasAnswered ? { scale: 0.99 } : {}}
                      onClick={() => handleAnswer(option)}
                      disabled={hasAnswered}
                      className={cn(
                        'w-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-200 flex items-center gap-3',
                        optionStyle
                      )}
                    >
                      <span className="flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold border-current opacity-60">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="text-sm font-medium">{option}</span>
                      {hasAnswered && isCorrectOption && (
                        <CheckCircle2 className="w-4 h-4 ml-auto text-emerald-500" />
                      )}
                      {hasAnswered && isSelected && !isCorrectOption && (
                        <XCircle className="w-4 h-4 ml-auto text-red-500" />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            )}

            {/* Fill in blank */}
            {isFillBlank && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={fillAnswer}
                    onChange={(e) => setFillAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !hasAnswered && handleSubmitFill()}
                    disabled={hasAnswered}
                    placeholder="Type your answer..."
                    className={cn(
                      'transition-colors',
                      hasAnswered && isCorrect && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20',
                      hasAnswered && !isCorrect && 'border-red-400 bg-red-50 dark:bg-red-950/20',
                    )}
                  />
                  {!hasAnswered && (
                    <Button onClick={handleSubmitFill} disabled={!fillAnswer.trim()}>
                      Check
                    </Button>
                  )}
                </div>
                {hasAnswered && !isCorrect && (
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    Correct answer: <span className="font-semibold">{currentQuestion.correct_answer}</span>
                  </p>
                )}
              </div>
            )}

            {/* Feedback */}
            <AnimatePresence>
              {hasAnswered && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className={cn(
                    'flex gap-3 p-3 rounded-xl text-sm',
                    isCorrect
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800'
                  )}
                >
                  {isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <p className={cn('font-semibold', isCorrect ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300')}>
                      {isCorrect ? 'Correct!' : 'Not quite'}
                    </p>
                    {currentQuestion.explanation && (
                      <p className="text-muted-foreground leading-relaxed">{currentQuestion.explanation}</p>
                    )}
                    {!isCorrect && currentQuestion.hint && (
                      <p className="flex items-center gap-1 text-amber-600 dark:text-amber-400 text-xs mt-1">
                        <Lightbulb className="w-3 h-3" />
                        Tip: {currentQuestion.hint}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Next button */}
      <AnimatePresence>
        {hasAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              onClick={handleNext}
              className="w-full gap-2 bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-700 hover:to-blue-600 text-white shadow-md"
            >
              {currentIndex + 1 >= questions.length ? (
                <>
                  <Trophy className="w-4 h-4" />
                  Finish Quiz
                </>
              ) : (
                <>
                  Next Question
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Points indicator */}
      {!hasAnswered && (
        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <AlertCircle className="w-3 h-3" />
          <span>{currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''} for this question</span>
        </div>
      )}
    </div>
  );
}

export default QuizCard;
