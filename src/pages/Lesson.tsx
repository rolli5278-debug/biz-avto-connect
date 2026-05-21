import { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, BookOpen, Clock, Zap, CheckCircle2, Brain, Mic, Volume2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Lesson } from '@/types';

// Mock lessons data
const MOCK_LESSONS: Record<string, Lesson & { questions: { q: string; options: string[]; correct: number; explanation: string }[] }> = {
  '1': {
    id: '1', title: 'Present Perfect vs Simple Past', level: 'B1', type: 'grammar',
    duration_minutes: 15, xp_reward: 80, created_at: new Date().toISOString(),
    description: 'Master the difference between present perfect and simple past tenses',
    content: {
      body: `## Present Perfect vs Simple Past

The **Present Perfect** and **Simple Past** are both used to talk about past events, but they have different uses.

### Simple Past
Use the simple past for:
- **Completed actions** at a specific time in the past
- Actions that are clearly finished

> "I **visited** London in 2019."
> "She **finished** her homework an hour ago."

### Present Perfect
Use the present perfect for:
- **Life experiences** (without a specific time)
- **Recent events** that still affect the present
- Actions that happened at an **unspecified time**

> "I **have visited** London." (at some point in my life)
> "She **has finished** her homework." (it's done now)

### Key Time Expressions

| Simple Past | Present Perfect |
|------------|-----------------|
| yesterday, ago, last year | just, already, yet, ever, never |
| in 2019, on Monday | recently, so far, up to now |

### Common Mistake
❌ "I have seen him yesterday."
✅ "I **saw** him yesterday." (specific time → simple past)`,
      key_vocabulary: ['experience', 'completed', 'unspecified', 'recently'],
    },
    questions: [
      { q: 'Choose the correct form: "I ___ to Paris last year."', options: ['have been', 'went', 'have gone', 'go'], correct: 1, explanation: '"Last year" is a specific past time, so we use simple past "went".' },
      { q: 'Which sentence is correct?', options: ['Have you eaten sushi ever?', 'Did you ever eat sushi?', 'Have you ever eaten sushi?', 'You have ever eaten sushi?'], correct: 2, explanation: '"Have you ever eaten?" uses present perfect for life experiences.' },
      { q: '"She ___ just ___ the report." Fill in the blanks.', options: ['did / finish', 'has / finished', 'had / finish', 'did / finished'], correct: 1, explanation: '"Just" is a present perfect signal word, so we use "has finished".' },
      { q: 'Choose: "I ___ this movie three times this month."', options: ['watched', 'have watched', 'watch', 'had watched'], correct: 1, explanation: '"This month" is an ongoing time period, so present perfect is correct.' },
      { q: 'Which is a present perfect signal word?', options: ['yesterday', 'ago', 'already', 'last week'], correct: 2, explanation: '"Already" is a present perfect signal. The others indicate specific past times.' },
    ],
  },
  '2': {
    id: '2', title: 'Academic Vocabulary: Cause & Effect', level: 'B2', type: 'vocabulary',
    duration_minutes: 12, xp_reward: 60, created_at: new Date().toISOString(),
    description: 'Learn essential academic phrases for expressing cause and effect',
    content: {
      body: `## Academic Vocabulary: Cause & Effect

Academic writing requires precise language to show how ideas relate. Here are the most important **cause and effect** phrases.

### Cause Expressions
- **Due to** / **Owing to** + noun phrase
- **Because of** + noun phrase
- **As a result of** + noun phrase
- **Since** / **Because** + clause

> "**Due to** the heavy rain, the match was cancelled."
> "**Because of** the shortage, prices rose sharply."

### Effect Expressions
- **Therefore** / **Thus** / **Hence** (formal)
- **As a result** / **Consequently**
- **This led to** / **This resulted in**

> "The factory closed. **Consequently**, 200 workers lost their jobs."
> "Demand fell sharply, **which led to** a price reduction."

### Contrast Expressions
- **However** / **Nevertheless** / **Nonetheless**
- **Despite** / **In spite of** + noun
- **Although** / **Even though** + clause`,
      key_vocabulary: ['consequently', 'nevertheless', 'despite', 'whereas', 'furthermore'],
    },
    questions: [
      { q: 'Choose the correct linker: "___ the bad weather, we enjoyed the trip."', options: ['Because of', 'Despite', 'Therefore', 'Since'], correct: 1, explanation: '"Despite" + noun phrase shows contrast between bad weather and enjoyment.' },
      { q: 'Which word is NOT a cause expression?', options: ['due to', 'because of', 'consequently', 'owing to'], correct: 2, explanation: '"Consequently" is an effect expression, not a cause expression.' },
      { q: '"Prices rose. ___, consumers bought less." Choose the best linker.', options: ['Despite', 'Because', 'As a result', 'Although'], correct: 2, explanation: '"As a result" introduces an effect/consequence.' },
      { q: 'Which is more FORMAL?', options: ['so', 'therefore', 'because', 'but'], correct: 1, explanation: '"Therefore" is the most formal option — preferred in academic writing.' },
      { q: '"___ studying hard, she passed the exam." Choose correctly.', options: ['Therefore', 'Due to', 'Despite', 'However'], correct: 2, explanation: '"Due to studying hard" is a cause. But "Despite studying hard, she passed" would show unexpected success — context matters.' },
    ],
  },
};

const DEFAULT_LESSON = MOCK_LESSONS['1'];

type Stage = 'reading' | 'quiz' | 'complete';

export default function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const lesson = MOCK_LESSONS[id ?? '1'] ?? DEFAULT_LESSON;

  const [stage, setStage] = useState<Stage>('reading');
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);

  const question = lesson.questions[currentQ];
  const totalQ = lesson.questions.length;
  const score = answers.filter((a, i) => a === lesson.questions[i]?.correct).length;

  const handleAnswer = (idx: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(idx);
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    setAnswers(prev => { const n = [...prev]; n[currentQ] = selectedAnswer; return n; });
    setSelectedAnswer(null);
    setShowExplanation(false);
    if (currentQ + 1 < totalQ) {
      setCurrentQ(q => q + 1);
    } else {
      setStage('complete');
    }
  };

  const levelColors: Record<string, string> = {
    A1: 'bg-emerald-100 text-emerald-700', A2: 'bg-green-100 text-green-700',
    B1: 'bg-blue-100 text-blue-700', B2: 'bg-indigo-100 text-indigo-700',
    C1: 'bg-purple-100 text-purple-700', C2: 'bg-amber-100 text-amber-700',
  };

  const typeIcon = { grammar: Brain, vocabulary: BookOpen, speaking: Mic, listening: Volume2 }[lesson.type] ?? BookOpen;
  const TypeIcon = typeIcon;

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 pb-20">
      {/* Back button */}
      <Button variant="ghost" size="sm" onClick={() => navigate('/lessons')} className="mb-4 -ml-2">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Lessons
      </Button>

      {/* Lesson header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Badge className={cn('text-xs', levelColors[lesson.level] ?? 'bg-gray-100 text-gray-700')}>{lesson.level}</Badge>
          <Badge variant="outline" className="text-xs capitalize">{lesson.type}</Badge>
          <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
            <Clock className="w-3 h-3" /> {lesson.duration_minutes} min
            <Zap className="w-3 h-3 ml-2 text-amber-500" /> {lesson.xp_reward} XP
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold">{lesson.title}</h1>
        <p className="text-muted-foreground mt-1">{lesson.description}</p>
      </motion.div>

      {/* Stage: Reading */}
      {stage === 'reading' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="lesson-content prose prose-sm dark:prose-invert max-w-none">
                {lesson.content.body.split('\n').map((line, i) => {
                  if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold mb-3 mt-4">{line.slice(3)}</h2>;
                  if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-semibold mb-2 mt-4">{line.slice(4)}</h3>;
                  if (line.startsWith('> ')) return <blockquote key={i} className="border-l-4 border-violet-400 pl-4 italic text-muted-foreground my-2">{line.slice(2)}</blockquote>;
                  if (line.startsWith('- ')) return <li key={i} className="ml-4 text-muted-foreground">{line.slice(2)}</li>;
                  if (line.startsWith('❌') || line.startsWith('✅')) return <p key={i} className="font-mono text-sm my-1">{line}</p>;
                  if (line.trim() === '') return <br key={i} />;
                  return <p key={i} className="text-sm leading-relaxed mb-2 text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground">$1</strong>') }} />;
                })}
              </div>
            </CardContent>
          </Card>

          {/* Key vocabulary */}
          {lesson.content.key_vocabulary && lesson.content.key_vocabulary.length > 0 && (
            <Card>
              <CardContent className="pt-4">
                <div className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-violet-500" /> Key Vocabulary
                </div>
                <div className="flex flex-wrap gap-2">
                  {lesson.content.key_vocabulary.map(word => (
                    <Badge key={word} variant="secondary" className="font-mono">{word}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Button className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:opacity-90 h-12 text-base"
            onClick={() => setStage('quiz')}>
            Start Quiz ({totalQ} questions) <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </motion.div>
      )}

      {/* Stage: Quiz */}
      {stage === 'quiz' && (
        <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <Progress value={((currentQ) / totalQ) * 100} className="flex-1 h-2" />
            <span className="text-sm text-muted-foreground shrink-0">{currentQ + 1}/{totalQ}</span>
          </div>

          <Card>
            <CardContent className="pt-6 pb-4">
              <div className="flex items-start gap-3 mb-5">
                <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-950/50 flex items-center justify-center shrink-0 mt-0.5">
                  <TypeIcon className="w-4 h-4 text-violet-600" />
                </div>
                <p className="font-semibold text-base leading-relaxed">{question.q}</p>
              </div>

              <div className="space-y-2.5">
                {question.options.map((opt, i) => {
                  const state = selectedAnswer === null ? 'idle'
                    : i === question.correct ? 'correct'
                    : i === selectedAnswer ? 'wrong'
                    : 'idle';
                  return (
                    <button key={i} onClick={() => handleAnswer(i)} disabled={selectedAnswer !== null}
                      className={cn(
                        'w-full text-left p-3.5 rounded-xl border-2 text-sm font-medium transition-all',
                        state === 'correct' && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300',
                        state === 'wrong' && 'border-red-400 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300',
                        state === 'idle' && selectedAnswer === null && 'border-border hover:border-violet-400 hover:bg-violet-50/50 dark:hover:bg-violet-950/20',
                        state === 'idle' && selectedAnswer !== null && 'border-border opacity-50',
                      )}>
                      <span className="mr-2 opacity-60">{String.fromCharCode(65 + i)}.</span> {opt}
                      {state === 'correct' && <CheckCircle2 className="inline w-4 h-4 ml-2 text-emerald-500" />}
                      {state === 'wrong' && <X className="inline w-4 h-4 ml-2 text-red-500" />}
                    </button>
                  );
                })}
              </div>

              {showExplanation && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={cn('mt-4 p-3.5 rounded-xl text-sm',
                    selectedAnswer === question.correct
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800')}>
                  <div className="font-semibold mb-1">{selectedAnswer === question.correct ? '✅ Correct!' : '❌ Not quite.'}</div>
                  <div className="text-muted-foreground">{question.explanation}</div>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {selectedAnswer !== null && (
            <Button className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:opacity-90 h-11" onClick={nextQuestion}>
              {currentQ + 1 < totalQ ? 'Next Question' : 'See Results'} <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </motion.div>
      )}

      {/* Stage: Complete */}
      {stage === 'complete' && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6">
          <div className="text-6xl mb-2">{score >= totalQ * 0.8 ? '🎉' : score >= totalQ * 0.6 ? '👍' : '💪'}</div>
          <div>
            <h2 className="text-2xl font-bold mb-1">Lesson Complete!</h2>
            <p className="text-muted-foreground">You scored {score} out of {totalQ}</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Score', value: `${Math.round((score / totalQ) * 100)}%`, icon: '🎯' },
              { label: 'XP Earned', value: `+${Math.round(lesson.xp_reward * (score / totalQ))}`, icon: '⚡' },
              { label: 'Questions', value: `${score}/${totalQ}`, icon: '✅' },
            ].map(stat => (
              <Card key={stat.label}>
                <CardContent className="pt-4 pb-3 text-center">
                  <div className="text-2xl mb-1">{stat.icon}</div>
                  <div className="font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => { setStage('reading'); setCurrentQ(0); setAnswers([]); setSelectedAnswer(null); }}>
              Try Again
            </Button>
            <Button className="flex-1 bg-gradient-to-r from-violet-600 to-blue-600 hover:opacity-90" onClick={() => navigate('/lessons')}>
              Next Lesson <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
