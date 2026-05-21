import { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, BookOpen, Headphones, Mic, PenTool, ChevronRight, Target, TrendingUp, Clock, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const SECTIONS = [
  { id: 'reading',   label: 'Reading',   icon: BookOpen,  color: 'text-blue-500',   bg: 'bg-blue-100 dark:bg-blue-950/50',    tasks: 40, done: 18, score: 6.5 },
  { id: 'writing',   label: 'Writing',   icon: PenTool,   color: 'text-violet-500', bg: 'bg-violet-100 dark:bg-violet-950/50', tasks: 20, done: 7,  score: 6.0 },
  { id: 'listening', label: 'Listening', icon: Headphones,color: 'text-emerald-500',bg: 'bg-emerald-100 dark:bg-emerald-950/50',tasks: 40, done: 22, score: 6.5 },
  { id: 'speaking',  label: 'Speaking',  icon: Mic,       color: 'text-rose-500',   bg: 'bg-rose-100 dark:bg-rose-950/50',    tasks: 30, done: 10, score: 5.5 },
];

const BAND_SCORES = [
  { week: 'W1', score: 5.0 }, { week: 'W2', score: 5.5 }, { week: 'W3', score: 5.5 },
  { week: 'W4', score: 6.0 }, { week: 'W5', score: 6.0 }, { week: 'W6', score: 6.5 },
];

const WRITING_TASKS = [
  { id: 't1', type: 'Task 1', prompt: 'The graph below shows the number of tourists visiting three different countries between 2000 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.', minWords: 150, timeLimit: 20 },
  { id: 't2', type: 'Task 2', prompt: 'Some people believe that technology has made it easier for people to work from home, while others argue that it has created new challenges. Discuss both views and give your own opinion. Write at least 250 words.', minWords: 250, timeLimit: 40 },
];

const READING_PASSAGE = `The History of Coffee\n\nCoffee, now one of the world's most traded commodities, has a fascinating history spanning centuries and continents. According to legend, an Ethiopian goat herder named Kaldi first discovered the potential of coffee beans when he noticed his goats were unusually energetic after eating berries from certain trees.\n\nKaldi reported his findings to the local monastery, where monks made a drink from the berries and found it kept them alert during long evening prayers. Coffee cultivation and trade began on the Arabian Peninsula. By the 15th century, coffee was being grown in Yemen, and by the 16th century it had reached Persia, Egypt, Syria, and Turkey.`;

const READING_QUESTIONS = [
  { q: 'Where did coffee originally come from?', options: ['Yemen', 'Ethiopia', 'Turkey', 'Egypt'], correct: 1 },
  { q: "What was Kaldi's occupation?", options: ['A monk', 'A trader', 'A goat herder', 'A farmer'], correct: 2 },
  { q: 'By what century was coffee grown in Yemen?', options: ['13th', '14th', '15th', '16th'], correct: 2 },
];

export default function IELTSPrep() {
  const [targetScore, setTargetScore] = useState(7.0);
  const [activeTask, setActiveTask] = useState<string | null>(null);
  const [writingText, setWritingText] = useState('');
  const [aiFeedback, setAiFeedback] = useState<{ score: number; feedback: string; tips: string[] } | null>(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [readingAnswers, setReadingAnswers] = useState<Record<number, number>>({});
  const [readingSubmitted, setReadingSubmitted] = useState(false);

  const overallScore = (SECTIONS.reduce((s, x) => s + x.score, 0) / SECTIONS.length).toFixed(1);
  const wordCount = writingText.trim().split(/\s+/).filter(Boolean).length;

  const getFeedback = async () => {
    setLoadingFeedback(true);
    await new Promise(r => setTimeout(r, 2000));
    const score = parseFloat((Math.random() * 1.5 + 5.5).toFixed(1));
    setAiFeedback({
      score,
      feedback: `Your response demonstrates ${score >= 6.5 ? 'good' : 'developing'} task achievement. You have addressed the main points, though some ideas could be developed further. Your vocabulary use is ${score >= 6.5 ? 'varied and appropriate' : 'adequate but could be more sophisticated'}.`,
      tips: ['Use more discourse markers (Furthermore, In contrast, Nevertheless)', 'Develop body paragraphs with specific examples', score < 6.5 ? 'Try more complex sentence structures' : 'Great structure — now focus on vocabulary range', 'Check subject-verb agreement in complex sentences'],
    });
    setLoadingFeedback(false);
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center"><Award className="w-4 h-4 text-amber-500" /></span>
            IELTS Preparation
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Structured practice for all four IELTS skills</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Target:</span>
          {[5.5, 6.0, 6.5, 7.0, 7.5, 8.0].map(s => (
            <button key={s} onClick={() => setTargetScore(s)} className={`px-2 py-0.5 rounded text-xs font-semibold border transition-all ${targetScore === s ? 'bg-amber-500 text-white border-amber-500' : 'border-border hover:border-amber-400'}`}>{s}</button>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card className="col-span-1 bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0">
          <CardContent className="pt-4 pb-3">
            <div className="text-xs opacity-80 mb-1">Current Band</div>
            <div className="text-4xl font-black">{overallScore}</div>
            <div className="text-xs opacity-80 mt-1 flex items-center gap-1"><Target className="w-3 h-3" /> Target: {targetScore}</div>
          </CardContent>
        </Card>
        {SECTIONS.map((s, i) => (
          <motion.div key={s.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="h-full">
              <CardContent className="pt-3 pb-3">
                <div className="flex items-center gap-1.5 mb-2"><div className={`w-6 h-6 rounded-md flex items-center justify-center ${s.bg}`}><s.icon className={`w-3.5 h-3.5 ${s.color}`} /></div><span className="text-xs font-medium">{s.label}</span></div>
                <div className="text-2xl font-bold">{s.score}</div>
                <Progress value={(s.done / s.tasks) * 100} className="h-1 mt-2" />
                <div className="text-xs text-muted-foreground mt-1">{s.done}/{s.tasks}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="practice">
        <TabsList className="grid grid-cols-4 w-full sm:w-auto">
          <TabsTrigger value="practice">Practice</TabsTrigger>
          <TabsTrigger value="writing">Writing</TabsTrigger>
          <TabsTrigger value="reading">Reading</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="practice" className="space-y-4 mt-4">
          <div className="grid sm:grid-cols-2 gap-4">
            {SECTIONS.map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-5 pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg}`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
                      <Badge variant="outline" className="text-xs">{s.score} band</Badge>
                    </div>
                    <h3 className="font-semibold mb-0.5">{s.label}</h3>
                    <p className="text-xs text-muted-foreground mb-3">
                      {s.id === 'reading' && '3 passages · 40 questions · 60 min'}
                      {s.id === 'writing' && 'Task 1 (150w) + Task 2 (250w)'}
                      {s.id === 'listening' && '4 sections · 40 questions · 30 min'}
                      {s.id === 'speaking' && 'Parts 1, 2, 3 · 11–14 min'}
                    </p>
                    <Progress value={(s.done / s.tasks) * 100} className="h-1.5 mb-2" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{s.done}/{s.tasks} done</span>
                      <Button size="sm" variant="ghost" className="h-7 text-xs gap-1">Practice <ChevronRight className="w-3 h-3" /></Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          <Card className="bg-gradient-to-r from-violet-600 to-blue-600 text-white border-0">
            <CardContent className="pt-5 pb-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-lg">Full Mock Test</h3>
                <p className="text-sm opacity-90">Complete all 4 sections — 2 hours 45 minutes</p>
                <div className="flex items-center gap-3 mt-1.5 text-sm opacity-80">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> 2h 45m</span>
                  <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5" /> +500 XP</span>
                </div>
              </div>
              <Button size="lg" className="bg-white text-violet-700 hover:bg-white/90 shrink-0">Start Test</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="writing" className="space-y-4 mt-4">
          {!activeTask ? (
            <div className="space-y-3">
              {WRITING_TASKS.map(task => (
                <Card key={task.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setActiveTask(task.id); setWritingText(''); setAiFeedback(null); }}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start gap-3">
                      <Badge className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 shrink-0">{task.type}</Badge>
                      <div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{task.prompt}</p>
                        <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {task.timeLimit} min</span>
                          <span>{task.minWords}+ words</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setActiveTask(null)} className="-ml-2">← Back</Button>
                <Badge className="bg-violet-100 text-violet-700 dark:bg-violet-900/30">{WRITING_TASKS.find(t => t.id === activeTask)?.type}</Badge>
              </div>
              <Card>
                <CardContent className="pt-4">
                  <p className="text-sm mb-4 leading-relaxed">{WRITING_TASKS.find(t => t.id === activeTask)?.prompt}</p>
                  <Textarea value={writingText} onChange={e => setWritingText(e.target.value)} placeholder="Start writing your response here..." className="min-h-[200px] resize-none" />
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-xs ${wordCount >= (WRITING_TASKS.find(t => t.id === activeTask)?.minWords ?? 0) ? 'text-emerald-600' : 'text-muted-foreground'}`}>{wordCount} words</span>
                    <Button onClick={getFeedback} disabled={loadingFeedback || wordCount < 50} className="bg-gradient-to-r from-violet-600 to-blue-600 hover:opacity-90">{loadingFeedback ? 'Analyzing...' : 'Get AI Feedback'}</Button>
                  </div>
                </CardContent>
              </Card>
              {aiFeedback && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="border-violet-200 dark:border-violet-800">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">AI Feedback</CardTitle>
                        <span className="text-2xl font-bold text-violet-600">{aiFeedback.score}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">{aiFeedback.feedback}</p>
                      <ul className="space-y-1">{aiFeedback.tips.map(tip => <li key={tip} className="text-xs text-muted-foreground flex items-start gap-1.5"><span className="text-violet-500 mt-0.5">•</span>{tip}</li>)}</ul>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reading" className="space-y-4 mt-4">
          <Card>
            <CardContent className="pt-5">
              <h3 className="font-semibold mb-3">Reading Passage</h3>
              <div className="text-sm text-muted-foreground leading-relaxed border rounded-lg p-4 bg-muted/30 mb-5 max-h-48 overflow-y-auto whitespace-pre-wrap">{READING_PASSAGE}</div>
              <h3 className="font-semibold mb-3">Questions</h3>
              <div className="space-y-4">
                {READING_QUESTIONS.map((q, qi) => (
                  <div key={qi}>
                    <p className="text-sm font-medium mb-2">{qi + 1}. {q.q}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {q.options.map((opt, oi) => {
                        const isSelected = readingAnswers[qi] === oi;
                        const isCorrect = oi === q.correct;
                        return (
                          <button key={oi} disabled={readingSubmitted} onClick={() => !readingSubmitted && setReadingAnswers(a => ({ ...a, [qi]: oi }))}
                            className={`text-left text-xs p-2.5 rounded-lg border transition-all ${readingSubmitted && isCorrect ? 'bg-emerald-50 border-emerald-400 text-emerald-700 dark:bg-emerald-950/30' : readingSubmitted && isSelected && !isCorrect ? 'bg-red-50 border-red-400 text-red-700 dark:bg-red-950/30' : isSelected ? 'bg-violet-50 border-violet-400 dark:bg-violet-950/30' : 'border-border hover:border-violet-300'}`}>
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              {!readingSubmitted ? (
                <Button className="w-full mt-4 bg-gradient-to-r from-violet-600 to-blue-600 hover:opacity-90" disabled={Object.keys(readingAnswers).length < READING_QUESTIONS.length} onClick={() => setReadingSubmitted(true)}>Submit Answers</Button>
              ) : (
                <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-center">
                  <div className="font-bold text-emerald-700 dark:text-emerald-300">Score: {READING_QUESTIONS.filter((q, i) => readingAnswers[i] === q.correct).length}/{READING_QUESTIONS.length}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Band Score History</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={BAND_SCORES}>
                  <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                  <YAxis domain={[4.5, 8]} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => [`Band ${v}`, 'Score']} />
                  <Line type="monotone" dataKey="score" stroke="#7c3aed" strokeWidth={2} dot={{ fill: '#7c3aed', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <div className="grid sm:grid-cols-2 gap-4">
            {SECTIONS.map(s => (
              <Card key={s.id}>
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${s.bg}`}><s.icon className={`w-3.5 h-3.5 ${s.color}`} /></div>
                    <span className="font-medium text-sm">{s.label}</span>
                    <span className="ml-auto font-bold">{s.score}</span>
                  </div>
                  <Progress value={((s.score - 4) / 5) * 100} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1.5"><span>Band 4.0</span><span>Band 9.0</span></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
