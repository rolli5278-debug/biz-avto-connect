import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, Play, Square, ChevronRight, Volume2, BookOpen, MessageSquare, Award, Timer, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const PRACTICE_MODES = [
  { id: 'pronunciation', label: 'Pronunciation', icon: Volume2, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-950/50', description: 'Practice individual words and sentences' },
  { id: 'conversation', label: 'Conversation', icon: MessageSquare, color: 'text-violet-500', bg: 'bg-violet-100 dark:bg-violet-950/50', description: 'Role-play real-life scenarios' },
  { id: 'ielts', label: 'IELTS Speaking', icon: Award, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-950/50', description: 'Practice Part 1, 2, and 3' },
  { id: 'read_aloud', label: 'Read Aloud', icon: BookOpen, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-950/50', description: 'Read passages for fluency' },
];

const TOPICS = [
  { id: '1', label: 'Job Interview', emoji: '💼', level: 'B1' },
  { id: '2', label: 'Hotel Check-in', emoji: '🏨', level: 'A2' },
  { id: '3', label: 'Doctor Visit', emoji: '🏥', level: 'B1' },
  { id: '4', label: 'Shopping', emoji: '🛍️', level: 'A2' },
  { id: '5', label: 'Airport', emoji: '✈️', level: 'A2' },
  { id: '6', label: 'Restaurant', emoji: '🍽️', level: 'A1' },
  { id: '7', label: 'Business Meeting', emoji: '📊', level: 'C1' },
  { id: '8', label: 'City Directions', emoji: '🗺️', level: 'A1' },
];

const PRONUNCIATION_WORDS = [
  { word: 'Entrepreneur', phonetic: '/ˌɒntrəprəˈnɜːr/', difficulty: 'hard' },
  { word: 'Comfortable', phonetic: '/ˈkʌmftəbəl/', difficulty: 'medium' },
  { word: 'Particularly', phonetic: '/pəˈtɪkjʊləli/', difficulty: 'hard' },
  { word: 'Necessary', phonetic: '/ˈnesəsəri/', difficulty: 'medium' },
  { word: 'Beautiful', phonetic: '/ˈbjuːtɪfʊl/', difficulty: 'easy' },
];

const IELTS_QUESTIONS = [
  { part: 1, question: 'Tell me about your hometown. What do you like most about it?' },
  { part: 1, question: 'Do you enjoy reading? What kind of books do you prefer?' },
  { part: 2, question: 'Describe a time when you helped someone. You should say: who you helped, what the situation was, how you helped them, and explain how you felt about it.' },
  { part: 3, question: 'Do you think people are more or less likely to help strangers today compared to the past? Why?' },
];

export default function Speaking() {
  const [activeMode, setActiveMode] = useState('pronunciation');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [score, setScore] = useState<number | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [wordIndex, setWordIndex] = useState(0);
  const [ieltsIndex, setIeltsIndex] = useState(0);
  const [totalMinutes] = useState(47);

  const startRecording = () => {
    setIsRecording(true);
    setScore(null);
    setRecordingTime(0);
    const interval = setInterval(() => setRecordingTime(t => t + 1), 1000);
    setTimeout(() => {
      clearInterval(interval);
      setIsRecording(false);
      setScore(Math.floor(Math.random() * 20) + 75);
    }, 4000);
  };

  const currentWord = PRONUNCIATION_WORDS[wordIndex];
  const currentIELTS = IELTS_QUESTIONS[ieltsIndex];

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center">
              <Mic className="w-4 h-4 text-rose-500" />
            </span>
            Speaking Room
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Practice speaking with AI-powered pronunciation feedback</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-violet-600">{totalMinutes}</div>
          <div className="text-xs text-muted-foreground">minutes practiced</div>
        </div>
      </motion.div>

      {/* Mode Selection */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {PRACTICE_MODES.map((mode, i) => (
          <motion.button
            key={mode.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => { setActiveMode(mode.id); setScore(null); setSelectedTopic(null); }}
            className={cn(
              'p-4 rounded-xl border-2 text-left transition-all duration-200',
              activeMode === mode.id
                ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30'
                : 'border-border bg-card hover:border-violet-300 hover:bg-violet-50/50 dark:hover:bg-violet-950/10'
            )}
          >
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-2', mode.bg)}>
              <mode.icon className={cn('w-4 h-4', mode.color)} />
            </div>
            <div className="font-semibold text-sm">{mode.label}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{mode.description}</div>
          </motion.button>
        ))}
      </div>

      {/* Active Practice Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">

          {/* Pronunciation Mode */}
          {activeMode === 'pronunciation' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Word Practice</CardTitle>
                  <Badge variant="outline">{wordIndex + 1} / {PRONUNCIATION_WORDS.length}</Badge>
                </div>
                <Progress value={((wordIndex + 1) / PRONUNCIATION_WORDS.length) * 100} className="h-1.5" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-4">
                  <div className="text-5xl font-bold mb-2">{currentWord.word}</div>
                  <div className="text-muted-foreground font-mono">{currentWord.phonetic}</div>
                  <Badge className="mt-2" variant={currentWord.difficulty === 'hard' ? 'destructive' : currentWord.difficulty === 'medium' ? 'default' : 'secondary'}>
                    {currentWord.difficulty}
                  </Badge>
                </div>
                <div className="flex justify-center gap-3">
                  <Button variant="outline" size="sm"><Volume2 className="w-4 h-4 mr-1.5" />Listen</Button>
                </div>
                <RecordingArea
                  isRecording={isRecording}
                  recordingTime={recordingTime}
                  score={score}
                  onStart={startRecording}
                />
                {score && (
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => { setScore(null); }}>Try Again</Button>
                    <Button className="flex-1 bg-gradient-to-r from-violet-600 to-blue-600 hover:opacity-90" onClick={() => { setWordIndex(i => (i + 1) % PRONUNCIATION_WORDS.length); setScore(null); }}>
                      Next Word <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Conversation Mode */}
          {activeMode === 'conversation' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Choose a Scenario</CardTitle>
              </CardHeader>
              <CardContent>
                {!selectedTopic ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {TOPICS.map(topic => (
                      <button key={topic.id} onClick={() => setSelectedTopic(topic.id)}
                        className="p-3 rounded-xl border border-border hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/20 text-center transition-all">
                        <div className="text-3xl mb-1.5">{topic.emoji}</div>
                        <div className="text-sm font-medium">{topic.label}</div>
                        <Badge variant="outline" className="mt-1 text-xs">{topic.level}</Badge>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl">{TOPICS.find(t => t.id === selectedTopic)?.emoji}</span>
                      <span className="font-semibold">{TOPICS.find(t => t.id === selectedTopic)?.label}</span>
                      <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setSelectedTopic(null)}>Change</Button>
                    </div>
                    <div className="bg-muted/50 rounded-xl p-4 border">
                      <p className="text-sm font-medium text-muted-foreground mb-1">AI says:</p>
                      <p className="text-sm">"Good morning! Welcome to the Grand Hotel. How can I assist you today?"</p>
                    </div>
                    <RecordingArea isRecording={isRecording} recordingTime={recordingTime} score={score} onStart={startRecording} />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* IELTS Mode */}
          {activeMode === 'ielts' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">IELTS Speaking</CardTitle>
                  <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Part {currentIELTS.part}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                  <p className="font-medium text-sm leading-relaxed">{currentIELTS.question}</p>
                  {currentIELTS.part === 2 && (
                    <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                      <Timer className="w-3 h-3" /> You have 1 minute to prepare, then speak for 1-2 minutes
                    </div>
                  )}
                </div>
                <RecordingArea isRecording={isRecording} recordingTime={recordingTime} score={score} onStart={startRecording} />
                {score && (
                  <Button className="w-full" variant="outline" onClick={() => { setIeltsIndex(i => (i + 1) % IELTS_QUESTIONS.length); setScore(null); }}>
                    Next Question <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Read Aloud Mode */}
          {activeMode === 'read_aloud' && (
            <Card>
              <CardHeader><CardTitle className="text-base">Read Aloud</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/40 rounded-xl p-5 border leading-relaxed text-sm">
                  The rapid advancement of technology has fundamentally changed the way people communicate. Social media platforms have created new ways for individuals to connect across borders, enabling conversations that would have been impossible just decades ago. However, this digital revolution has also raised important questions about privacy, mental health, and the quality of human relationships in an increasingly connected world.
                </div>
                <RecordingArea isRecording={isRecording} recordingTime={recordingTime} score={score} onStart={startRecording} />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar stats */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Today's Progress</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Sessions', value: '3', icon: Mic },
                { label: 'Best Score', value: '88%', icon: Star },
                { label: 'Minutes', value: '12', icon: Timer },
              ].map(stat => (
                <div key={stat.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <stat.icon className="w-3.5 h-3.5" /> {stat.label}
                  </div>
                  <span className="font-semibold text-sm">{stat.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Speaking Tips</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2 text-xs text-muted-foreground">
                {['Speak slowly and clearly', 'Focus on word stress', 'Use natural pauses', 'Record yourself daily', 'Mimic native speakers'].map(tip => (
                  <li key={tip} className="flex items-start gap-1.5">
                    <span className="text-violet-500 mt-0.5">•</span> {tip}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Weekly Goal</CardTitle></CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-violet-600">47<span className="text-sm font-normal text-muted-foreground">/60</span></div>
                <div className="text-xs text-muted-foreground mb-2">minutes this week</div>
                <Progress value={78} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">13 minutes to reach your goal!</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── Recording Area Component ───────────────────────────────────────────────────
function RecordingArea({ isRecording, recordingTime, score, onStart }: {
  isRecording: boolean;
  recordingTime: number;
  score: number | null;
  onStart: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-4">
      {/* Waveform visualizer */}
      {isRecording && (
        <div className="flex items-end gap-0.5 h-12">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-1.5 bg-gradient-to-t from-violet-600 to-blue-500 rounded-full"
              animate={{ height: [8, Math.random() * 40 + 8, 8] }}
              transition={{ duration: 0.4 + Math.random() * 0.4, repeat: Infinity, delay: i * 0.05 }}
            />
          ))}
        </div>
      )}

      {/* Score display */}
      {score !== null && !isRecording && (
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className={cn('text-center', score >= 85 ? 'text-emerald-600' : score >= 70 ? 'text-amber-600' : 'text-red-500')}>
          <div className="text-5xl font-bold">{score}%</div>
          <div className="text-sm font-medium mt-1">
            {score >= 85 ? '🎉 Excellent!' : score >= 70 ? '👍 Good job!' : '💪 Keep practicing!'}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {score >= 85 ? 'Pronunciation is clear and natural' : 'Focus on word stress and rhythm'}
          </div>
        </motion.div>
      )}

      {/* Record button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onStart}
        disabled={isRecording}
        className={cn(
          'relative w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg',
          isRecording
            ? 'bg-red-500 cursor-not-allowed'
            : 'bg-gradient-to-br from-violet-600 to-blue-600 hover:shadow-violet-500/30 hover:shadow-xl cursor-pointer'
        )}
      >
        {isRecording ? (
          <>
            <motion.div className="absolute inset-0 rounded-full bg-red-500/30"
              animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
            <Square className="w-6 h-6 text-white" fill="white" />
          </>
        ) : (
          <Mic className="w-7 h-7 text-white" />
        )}
      </motion.button>

      {isRecording && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-sm text-red-500 font-mono font-semibold">
          {String(Math.floor(recordingTime / 60)).padStart(2, '0')}:{String(recordingTime % 60).padStart(2, '0')}
        </motion.div>
      )}

      {!isRecording && score === null && (
        <p className="text-xs text-muted-foreground">Tap the mic to start recording</p>
      )}
    </div>
  );
}
