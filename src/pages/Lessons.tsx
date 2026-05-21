import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search, SlidersHorizontal, BookOpen, Mic, Headphones,
  PenLine, AlignLeft, Layers, Star, Flame, ChevronRight,
  GraduationCap, Zap, Filter, TrendingUp, Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { LessonCard } from '@/components/dashboard/LessonCard';
import { LessonCardSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { cn } from '@/lib/utils';
import type { Lesson, LessonType, CEFRLevel } from '@/types';

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_LESSONS: Lesson[] = [
  {
    id: '1', title: 'Present Perfect vs Simple Past', description: 'Master the key differences between these two essential tenses with real-world examples and practice.',
    level: 'B1', type: 'grammar', duration_minutes: 20, xp_reward: 50,
    content: { body: '', grammar_points: ['Present Perfect', 'Simple Past'] },
    created_at: '2024-01-15', tags: ['tenses', 'verbs'],
  },
  {
    id: '2', title: 'IELTS Academic Vocabulary: Technology', description: 'Expand your academic vocabulary with 30 high-frequency technology words used in IELTS writing and reading.',
    level: 'B2', type: 'vocabulary', duration_minutes: 15, xp_reward: 40,
    content: { body: '', key_vocabulary: ['innovation', 'automation', 'infrastructure'] },
    created_at: '2024-01-18', is_premium: true, tags: ['IELTS', 'technology'],
  },
  {
    id: '3', title: 'Describing Graphs & Charts', description: 'Learn how to accurately describe trends, comparisons, and data in graphs for IELTS Task 1.',
    level: 'B2', type: 'writing', duration_minutes: 25, xp_reward: 60,
    content: { body: '' },
    created_at: '2024-01-20', is_premium: true, tags: ['IELTS', 'writing'],
  },
  {
    id: '4', title: 'BBC News Listening: Climate Change', description: 'Improve your listening comprehension with an authentic BBC news segment on climate policy.',
    level: 'B1', type: 'listening', duration_minutes: 18, xp_reward: 45,
    content: { body: '', media_url: 'https://example.com/audio.mp3' },
    created_at: '2024-01-22', tags: ['news', 'environment'],
  },
  {
    id: '5', title: 'Job Interview Phrases', description: 'Practice essential phrases and confident responses for common job interview questions.',
    level: 'B2', type: 'speaking', duration_minutes: 30, xp_reward: 70,
    content: { body: '' },
    created_at: '2024-01-25', tags: ['business', 'career'],
  },
  {
    id: '6', title: 'Short Story: The Last Letter', description: 'Read a gripping short story and test your comprehension with vocabulary and inference questions.',
    level: 'B1', type: 'reading', duration_minutes: 22, xp_reward: 55,
    content: { body: '' },
    created_at: '2024-01-28', tags: ['story', 'fiction'],
  },
  {
    id: '7', title: 'Conditional Sentences (Types 1-3)', description: 'Understand and use all three types of conditionals to express real, hypothetical, and impossible situations.',
    level: 'B2', type: 'grammar', duration_minutes: 25, xp_reward: 60,
    content: { body: '' },
    created_at: '2024-02-01', tags: ['conditionals', 'grammar'],
  },
  {
    id: '8', title: 'Phrasal Verbs: Business English', description: 'Learn 20 essential phrasal verbs used in professional and business communication.',
    level: 'C1', type: 'vocabulary', duration_minutes: 20, xp_reward: 50,
    content: { body: '' },
    created_at: '2024-02-05', is_premium: true, tags: ['business', 'phrasal-verbs'],
  },
  {
    id: '9', title: 'Introductions & Small Talk', description: 'Build confidence in everyday conversations with natural opening phrases and small talk strategies.',
    level: 'A2', type: 'speaking', duration_minutes: 15, xp_reward: 35,
    content: { body: '' },
    created_at: '2024-02-08', tags: ['conversation', 'beginner'],
  },
  {
    id: '10', title: 'Passive Voice Mastery', description: 'From basic to advanced passive constructions used in academic and professional English.',
    level: 'B2', type: 'grammar', duration_minutes: 20, xp_reward: 50,
    content: { body: '' },
    created_at: '2024-02-10', tags: ['grammar', 'passive'],
  },
  {
    id: '11', title: 'IELTS Listening: Section 3 Strategy', description: 'Tackle the hardest IELTS listening section with proven strategies and full practice audio.',
    level: 'C1', type: 'listening', duration_minutes: 35, xp_reward: 80,
    content: { body: '' },
    created_at: '2024-02-12', is_premium: true, tags: ['IELTS', 'listening'],
  },
  {
    id: '12', title: 'Beginner Vocabulary: Daily Life', description: 'Learn your first 100 essential English words for everyday situations like shopping, greetings and transport.',
    level: 'A1', type: 'vocabulary', duration_minutes: 12, xp_reward: 30,
    content: { body: '' },
    created_at: '2024-02-14', tags: ['beginner', 'daily'],
  },
];

const IELTS_PATH: { id: string; step: number }[] = [
  { id: '2', step: 1 }, { id: '3', step: 2 }, { id: '11', step: 3 },
  { id: '8', step: 4 }, { id: '5', step: 5 }, { id: '4', step: 6 },
  { id: '10', step: 7 }, { id: '7', step: 8 },
];

const IN_PROGRESS: { id: string; progress: number }[] = [
  { id: '1', progress: 60 },
  { id: '4', progress: 30 },
];

// ─── Types ─────────────────────────────────────────────────────────────────────

type FilterType = 'all' | LessonType;
type SortOption = 'featured' | 'newest' | 'difficulty' | 'popular';

const TYPE_FILTERS: { value: FilterType; label: string; icon: typeof BookOpen | null }[] = [
  { value: 'all', label: 'All', icon: null },
  { value: 'grammar', label: 'Grammar', icon: AlignLeft },
  { value: 'vocabulary', label: 'Vocabulary', icon: Layers },
  { value: 'speaking', label: 'Speaking', icon: Mic },
  { value: 'listening', label: 'Listening', icon: Headphones },
  { value: 'reading', label: 'Reading', icon: BookOpen },
  { value: 'writing', label: 'Writing', icon: PenLine },
];

const LEVEL_ORDER: Record<CEFRLevel, number> = { A1: 0, A2: 1, B1: 2, B2: 3, C1: 4, C2: 5 };

const FEATURED_ID = '3';

// ─── Component ────────────────────────────────────────────────────────────────

export default function Lessons() {
  const navigate = useNavigate();
  const [loading] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [sort, setSort] = useState<SortOption>('featured');
  const [showFilters, setShowFilters] = useState(false);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: MOCK_LESSONS.length };
    MOCK_LESSONS.forEach((l) => {
      counts[l.type] = (counts[l.type] ?? 0) + 1;
    });
    return counts;
  }, []);

  const filtered = useMemo(() => {
    let list = [...MOCK_LESSONS];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (l) => l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q) || l.tags?.some((t) => t.toLowerCase().includes(q)),
      );
    }
    if (typeFilter !== 'all') list = list.filter((l) => l.type === typeFilter);
    if (levelFilter !== 'all') list = list.filter((l) => l.level === levelFilter);
    if (sort === 'newest') list.sort((a, b) => b.created_at.localeCompare(a.created_at));
    if (sort === 'difficulty') list.sort((a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level]);
    if (sort === 'popular') list.sort((a, b) => b.xp_reward - a.xp_reward);
    if (sort === 'featured') {
      const featIdx = list.findIndex((l) => l.id === FEATURED_ID);
      if (featIdx > 0) { const [f] = list.splice(featIdx, 1); list.unshift(f); }
    }
    return list;
  }, [search, typeFilter, levelFilter, sort]);

  const featuredLesson = MOCK_LESSONS.find((l) => l.id === FEATURED_ID);

  const inProgressLessons = IN_PROGRESS.map(({ id, progress }) => ({
    lesson: MOCK_LESSONS.find((l) => l.id === id)!,
    progress,
  })).filter((x) => x.lesson);

  const ieltPathLessons = IELTS_PATH.map(({ id, step }) => ({
    lesson: MOCK_LESSONS.find((l) => l.id === id)!,
    step,
  })).filter((x) => x.lesson);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">

        {/* ── Page Header ── */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-3xl font-bold tracking-tight">Lessons</h1>
          <p className="text-muted-foreground mt-1">Explore {MOCK_LESSONS.length} lessons across all skill areas</p>
        </motion.div>

        {/* ── Featured Banner ── */}
        {featuredLesson && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <div
              className="relative rounded-2xl overflow-hidden border border-border/60 cursor-pointer group"
              onClick={() => navigate(`/lessons/${featuredLesson.id}`)}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600/90 via-blue-600/80 to-indigo-700/90" />
              <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }}
              />
              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 sm:p-8">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  ✍️
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge className="bg-white/20 text-white border-white/30 text-xs backdrop-blur-sm">Featured</Badge>
                    <Badge className="bg-white/20 text-white border-white/30 text-xs backdrop-blur-sm">{featuredLesson.level}</Badge>
                    <Badge className="bg-white/20 text-white border-white/30 text-xs backdrop-blur-sm">{featuredLesson.type}</Badge>
                    {featuredLesson.is_premium && <Badge className="bg-amber-400/80 text-amber-900 border-0 text-xs">PRO</Badge>}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">{featuredLesson.title}</h2>
                  <p className="text-white/80 text-sm mt-1 line-clamp-2">{featuredLesson.description}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="flex items-center gap-1 text-white/70 text-sm"><Clock className="h-4 w-4" />{featuredLesson.duration_minutes} min</span>
                    <span className="flex items-center gap-1 text-amber-300 text-sm"><Star className="h-4 w-4 fill-current" />+{featuredLesson.xp_reward} XP</span>
                  </div>
                </div>
                <Button className="bg-white text-violet-700 hover:bg-white/90 font-semibold shadow-lg flex-shrink-0 gap-2" onClick={(e) => { e.stopPropagation(); navigate(`/lessons/${featuredLesson.id}`); }}>
                  Start Lesson <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Continue Learning ── */}
        {inProgressLessons.length > 0 && (
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <div className="flex items-center gap-2 mb-4">
              <Flame className="h-5 w-5 text-orange-500" />
              <h2 className="text-lg font-semibold">Continue Learning</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {inProgressLessons.map(({ lesson, progress }, i) => (
                <motion.div key={lesson.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * i }}>
                  <LessonCard lesson={lesson} progress={progress} onClick={() => navigate(`/lessons/${lesson.id}`)} />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* ── Search & Filters ── */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search lessons, topics, tags..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as CEFRLevel[]).map((l) => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="difficulty">Easy to Hard</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)} className={cn(showFilters && 'bg-accent')}>
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Type filter pills */}
          <div className="flex flex-wrap gap-2">
            {TYPE_FILTERS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setTypeFilter(value)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border',
                  typeFilter === value
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-card border-border/60 text-muted-foreground hover:text-foreground hover:border-border',
                )}
              >
                {Icon && <Icon className="h-3.5 w-3.5" />}
                {label}
                <span className={cn(
                  'ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold',
                  typeFilter === value ? 'bg-white/20' : 'bg-muted text-muted-foreground',
                )}>
                  {typeCounts[value] ?? 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── IELTS Path ── */}
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="h-5 w-5 text-blue-500" />
            <h2 className="text-lg font-semibold">IELTS Preparation Path</h2>
            <Badge variant="secondary" className="text-xs">8 Lessons</Badge>
          </div>
          <Card className="border-border/60 overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-hide">
                {ieltPathLessons.map(({ lesson, step }, i) => (
                  <div key={lesson.id} className="flex items-center gap-1 flex-shrink-0">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.06 }}
                      onClick={() => navigate(`/lessons/${lesson.id}`)}
                      className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-accent cursor-pointer transition-colors group w-24"
                    >
                      <div className="relative">
                        <div className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2',
                          step <= 2 ? 'bg-emerald-100 border-emerald-300 text-emerald-700' : 'bg-muted border-border/60 text-muted-foreground',
                        )}>
                          {step <= 2 ? '✓' : step}
                        </div>
                      </div>
                      <p className="text-[10px] text-center leading-tight line-clamp-2 text-muted-foreground group-hover:text-foreground transition-colors">{lesson.title}</p>
                    </motion.div>
                    {i < ieltPathLessons.length - 1 && (
                      <div className={cn('w-6 h-0.5 flex-shrink-0', step <= 2 ? 'bg-emerald-300' : 'bg-border/60')} />
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">2 of 8 lessons completed</p>
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => navigate('/ielts')}>
                  <TrendingUp className="h-3 w-3" /> View Full Path
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* ── Main Lesson Grid ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {typeFilter === 'all' ? 'All Lessons' : TYPE_FILTERS.find((f) => f.value === typeFilter)?.label}
              {search && <span className="text-muted-foreground font-normal text-sm ml-2">· "{search}"</span>}
            </h2>
            <span className="text-sm text-muted-foreground">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => <LessonCardSkeleton key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon="🔍"
              title="No lessons found"
              description={search ? `No lessons match "${search}". Try different keywords or clear the filters.` : 'No lessons available for this filter. Try another category.'}
              action={{ label: 'Clear Filters', onClick: () => { setSearch(''); setTypeFilter('all'); setLevelFilter('all'); } }}
            />
          ) : (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <AnimatePresence mode="popLayout">
                {filtered.map((lesson, i) => (
                  <motion.div
                    key={lesson.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.4) }}
                  >
                    <LessonCard
                      lesson={lesson}
                      progress={IN_PROGRESS.find((p) => p.id === lesson.id)?.progress}
                      onClick={() => navigate(`/lessons/${lesson.id}`)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </section>

        {/* ── Load More ── */}
        {filtered.length >= 8 && (
          <div className="flex justify-center pt-2">
            <Button variant="outline" className="gap-2">
              <Zap className="h-4 w-4" /> Load More Lessons
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
