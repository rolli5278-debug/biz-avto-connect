import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Heart,
  BookOpen,
  Layers,
  Star,
  ChevronRight,
  Trophy,
  Flame,
  Sparkles,
  Filter,
  RefreshCcw,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { WordCard } from '@/components/vocabulary/WordCard';
import { FlashcardReview } from '@/components/vocabulary/FlashcardReview';
import type { VocabularyWord, FlashCard } from '@/types';

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_WORDS: VocabularyWord[] = [
  {
    id: '1',
    word: 'Serendipity',
    definition: 'The occurrence of events by chance in a happy or beneficial way.',
    example_sentence: 'Finding that job was pure serendipity — I wasn\'t even looking.',
    translation_uz: 'Baxtli tasodif',
    pronunciation: '/ˌser.ənˈdɪp.ɪ.ti/',
    audio_url: null,
    category: 'Academic',
    difficulty: 'hard',
    level: 'C1',
    synonyms: ['luck', 'chance', 'fortune'],
  },
  {
    id: '2',
    word: 'Negotiate',
    definition: 'To discuss something in order to reach an agreement.',
    example_sentence: 'She negotiated a higher salary with her new employer.',
    translation_uz: 'Muzokaralar olib bormoq',
    pronunciation: '/nɪˈɡəʊ.ʃi.eɪt/',
    audio_url: null,
    category: 'Business',
    difficulty: 'medium',
    level: 'B2',
  },
  {
    id: '3',
    word: 'Itinerary',
    definition: 'A planned route or journey; a travel plan.',
    example_sentence: 'Our travel agent prepared a detailed itinerary for the two-week trip.',
    translation_uz: 'Sayohat rejasi',
    pronunciation: '/aɪˈtɪn.ər.ər.i/',
    audio_url: null,
    category: 'Travel',
    difficulty: 'medium',
    level: 'B2',
  },
  {
    id: '4',
    word: 'Break the ice',
    definition: 'To do or say something to relieve tension or begin a conversation in an awkward situation.',
    example_sentence: 'He told a joke to break the ice at the beginning of the meeting.',
    translation_uz: 'Muloqotni boshlash, taranglikni kamaytirish',
    pronunciation: '/breɪk ðə aɪs/',
    audio_url: null,
    category: 'Idioms',
    difficulty: 'medium',
    level: 'B1',
  },
  {
    id: '5',
    word: 'Collaborate',
    definition: 'To work jointly on an activity or project.',
    example_sentence: 'The two companies decided to collaborate on developing the new software.',
    translation_uz: 'Hamkorlikda ishlash',
    pronunciation: '/kəˈlæb.ər.eɪt/',
    audio_url: null,
    category: 'Business',
    difficulty: 'medium',
    level: 'B2',
  },
  {
    id: '6',
    word: 'Articulate',
    definition: 'Having or showing the ability to speak fluently and coherently.',
    example_sentence: 'She was very articulate when explaining the complex concept.',
    translation_uz: 'Aniq va ravshan gapirmoq',
    pronunciation: '/ɑːˈtɪk.jʊ.lət/',
    audio_url: null,
    category: 'Academic',
    difficulty: 'hard',
    level: 'C1',
  },
  {
    id: '7',
    word: 'Commute',
    definition: 'To travel some distance between one\'s home and place of work on a regular basis.',
    example_sentence: 'My daily commute takes about 45 minutes each way.',
    translation_uz: 'Ish joyiga qatnash',
    pronunciation: '/kəˈmjuːt/',
    audio_url: null,
    category: 'Daily Life',
    difficulty: 'easy',
    level: 'A2',
  },
  {
    id: '8',
    word: 'Get the hang of',
    definition: 'To learn how to do something; to become good at something through practice.',
    example_sentence: 'It took a while, but I finally got the hang of riding a bicycle.',
    translation_uz: 'Ko\'nikmoq, o\'rganib ketmoq',
    pronunciation: '/ɡet ðə hæŋ ʌv/',
    audio_url: null,
    category: 'Phrasal Verbs',
    difficulty: 'medium',
    level: 'B1',
  },
  {
    id: '9',
    word: 'Ambiguous',
    definition: 'Open to more than one interpretation; not having one obvious meaning.',
    example_sentence: 'The contract contained several ambiguous clauses that caused disputes.',
    translation_uz: 'Noaniq, ikki ma\'noli',
    pronunciation: '/æmˈbɪɡ.ju.əs/',
    audio_url: null,
    category: 'Academic',
    difficulty: 'hard',
    level: 'C1',
  },
  {
    id: '10',
    word: 'Sustainable',
    definition: 'Able to be maintained at a certain rate or level; avoiding depletion of natural resources.',
    example_sentence: 'The company is committed to sustainable business practices.',
    translation_uz: 'Barqaror, davomli',
    pronunciation: '/səˈsteɪ.nə.bəl/',
    audio_url: null,
    category: 'Academic',
    difficulty: 'medium',
    level: 'B2',
  },
  {
    id: '11',
    word: 'Delegate',
    definition: 'To entrust a task or responsibility to another person.',
    example_sentence: 'A good manager knows how to delegate tasks effectively.',
    translation_uz: 'Topshiriq bermoq, vakolat bermoq',
    pronunciation: '/ˈdel.ɪ.ɡeɪt/',
    audio_url: null,
    category: 'Business',
    difficulty: 'medium',
    level: 'B2',
  },
  {
    id: '12',
    word: 'Accommodation',
    definition: 'A room, group of rooms, or building in which someone may live or stay.',
    example_sentence: 'We booked accommodation near the city centre for our holiday.',
    translation_uz: 'Turar joy, mehmonxona',
    pronunciation: '/əˌkɒm.əˈdeɪ.ʃən/',
    audio_url: null,
    category: 'Travel',
    difficulty: 'easy',
    level: 'B1',
  },
];

const WORD_OF_THE_DAY = MOCK_WORDS[0];

const CATEGORIES = ['All', 'Business', 'Travel', 'Academic', 'Daily Life', 'Phrasal Verbs', 'Idioms'];
const LEVELS = ['All', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const DIFFICULTIES = ['All', 'easy', 'medium', 'hard'];
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// ─── Build mock flashcards from saved words ───────────────────────────────────

function wordToFlashcard(word: VocabularyWord): FlashCard {
  return {
    id: word.id,
    user_id: 'demo',
    word_id: word.id,
    front: word.word,
    back: `${word.definition}\n\n"${word.example_sentence}"\n\n🇺🇿 ${word.translation_uz}`,
    next_review: new Date().toISOString(),
    ease_factor: 2.5,
    interval: 1,
    repetitions: 0,
  };
}

// ─── Word of the day banner ───────────────────────────────────────────────────

function WordOfTheDay({ word }: { word: VocabularyWord }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-violet-500 via-indigo-500 to-violet-600 rounded-2xl p-5 text-white shadow-lg"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span className="text-xs font-semibold uppercase tracking-widest text-violet-200">
              Word of the Day
            </span>
          </div>
          <h2 className="text-2xl font-bold mb-0.5">{word.word}</h2>
          <p className="text-sm text-violet-200 font-mono mb-2">{word.pronunciation}</p>
          <p className="text-sm text-white/90 leading-snug mb-2">{word.definition}</p>
          <p className="text-sm italic text-violet-200">"{word.example_sentence}"</p>
        </div>
        <div className="hidden sm:flex flex-col items-end gap-2">
          <Badge className="bg-white/20 text-white border-white/30 text-xs">{word.category}</Badge>
          <Badge className="bg-white/20 text-white border-white/30 text-xs">{word.level}</Badge>
          <div className="text-2xl mt-2">📖</div>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-white/20 flex items-center gap-2">
        <span className="text-base">🇺🇿</span>
        <span className="text-sm text-yellow-200 font-medium">{word.translation_uz}</span>
      </div>
    </motion.div>
  );
}

// ─── Saved word row ───────────────────────────────────────────────────────────

function SavedWordRow({ word, mastery, onRemove }: { word: VocabularyWord; mastery: number; onRemove: () => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className="flex items-center gap-4 px-4 py-3 bg-white rounded-xl border border-slate-100 hover:border-slate-200 transition-all"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800">{word.word}</span>
          <span className="text-xs text-slate-400 font-mono">{word.pronunciation}</span>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize bg-slate-50">{word.category}</Badge>
        </div>
        <p className="text-xs text-slate-500 truncate mt-0.5">{word.definition}</p>
      </div>
      <div className="flex items-center gap-2">
        {/* Mastery bar */}
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'w-2 h-2 rounded-full',
                i < mastery ? 'bg-amber-400' : 'bg-slate-100'
              )}
            />
          ))}
        </div>
        <button
          onClick={onRemove}
          className="w-7 h-7 rounded-full flex items-center justify-center text-rose-400 hover:bg-rose-50 transition-colors"
        >
          <Heart className="w-3.5 h-3.5 fill-rose-400" />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Vocabulary() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [level, setLevel] = useState('All');
  const [difficulty, setDifficulty] = useState('All');
  const [letterFilter, setLetterFilter] = useState('');
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set(['3', '4', '7', '8']));
  const [masteryMap, setMasteryMap] = useState<Record<string, number>>({ '3': 3, '4': 2, '7': 4, '8': 1 });
  const [reviewingFlashcards, setReviewingFlashcards] = useState(false);
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('browse');

  const filteredWords = useMemo(() => {
    return MOCK_WORDS.filter((w) => {
      if (search && !w.word.toLowerCase().includes(search.toLowerCase()) && !w.definition.toLowerCase().includes(search.toLowerCase())) return false;
      if (category !== 'All' && w.category !== category) return false;
      if (level !== 'All' && w.level !== level) return false;
      if (difficulty !== 'All' && w.difficulty !== difficulty) return false;
      if (letterFilter && !w.word.toUpperCase().startsWith(letterFilter)) return false;
      return true;
    });
  }, [search, category, level, difficulty, letterFilter]);

  const savedWords = MOCK_WORDS.filter((w) => savedIds.has(w.id));
  const flashcards = savedWords.map(wordToFlashcard);

  const toggleSave = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        setMasteryMap((m) => ({ ...m, [id]: 0 }));
      }
      return next;
    });
  };

  const handleFlashcardComplete = (score: number) => {
    setLastScore(score);
    setReviewingFlashcards(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Vocabulary Builder</h1>
            <p className="text-slate-500 mt-1">Expand your English vocabulary with spaced repetition</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-center bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm">
              <div className="flex items-center gap-1.5 text-amber-500 text-sm font-bold">
                <Flame className="w-4 h-4" />
                <span>{savedIds.size}</span>
              </div>
              <p className="text-[10px] text-slate-400">Saved words</p>
            </div>
            <div className="text-center bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm">
              <div className="flex items-center gap-1.5 text-violet-500 text-sm font-bold">
                <Trophy className="w-4 h-4" />
                <span>{Object.values(masteryMap).filter((v) => v >= 4).length}</span>
              </div>
              <p className="text-[10px] text-slate-400">Mastered</p>
            </div>
          </div>
        </div>

        {/* Word of the Day */}
        <WordOfTheDay word={WORD_OF_THE_DAY} />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border border-slate-200 p-1 rounded-xl h-auto gap-1">
            <TabsTrigger value="browse" className="rounded-lg data-[state=active]:bg-violet-500 data-[state=active]:text-white">
              <BookOpen className="w-4 h-4 mr-2" />
              Browse
            </TabsTrigger>
            <TabsTrigger value="my-words" className="rounded-lg data-[state=active]:bg-violet-500 data-[state=active]:text-white">
              <Heart className="w-4 h-4 mr-2" />
              My Words
              {savedIds.size > 0 && (
                <Badge className="ml-2 bg-violet-100 text-violet-700 text-[10px] px-1.5 py-0 h-4 border-0">
                  {savedIds.size}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="flashcards" className="rounded-lg data-[state=active]:bg-violet-500 data-[state=active]:text-white">
              <Layers className="w-4 h-4 mr-2" />
              Flashcards
            </TabsTrigger>
          </TabsList>

          {/* ── Browse ─────────────────────────────────────── */}
          <TabsContent value="browse" className="mt-6 space-y-5">
            {/* Category chips */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={cn(
                    'px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all',
                    category === cat
                      ? 'bg-violet-500 text-white border-violet-500 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300 hover:text-violet-600'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search + filters row */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search words or definitions..."
                  className="pl-9 bg-white border-slate-200 rounded-xl"
                />
              </div>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger className="w-32 bg-white border-slate-200 rounded-xl">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  {LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger className="w-36 bg-white border-slate-200 rounded-xl capitalize">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTIES.map((d) => <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>)}
                </SelectContent>
              </Select>
              {(search || category !== 'All' || level !== 'All' || difficulty !== 'All' || letterFilter) && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSearch('');
                    setCategory('All');
                    setLevel('All');
                    setDifficulty('All');
                    setLetterFilter('');
                  }}
                  className="rounded-xl"
                >
                  <RefreshCcw className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Alphabet filter */}
            <div className="flex flex-wrap gap-1">
              {ALPHABET.map((letter) => (
                <button
                  key={letter}
                  onClick={() => setLetterFilter((v) => (v === letter ? '' : letter))}
                  className={cn(
                    'w-7 h-7 rounded-lg text-xs font-semibold transition-all',
                    letterFilter === letter
                      ? 'bg-violet-500 text-white shadow-sm'
                      : 'bg-white text-slate-500 border border-slate-200 hover:border-violet-300 hover:text-violet-600'
                  )}
                >
                  {letter}
                </button>
              ))}
            </div>

            {/* Results count */}
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-sm text-slate-500">
                {filteredWords.length} word{filteredWords.length !== 1 ? 's' : ''} found
              </span>
            </div>

            {/* Word grid */}
            {filteredWords.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="font-medium">No words found</p>
                <p className="text-sm mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                <AnimatePresence mode="popLayout">
                  {filteredWords.map((word) => (
                    <motion.div
                      key={word.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      <WordCard
                        word={word}
                        isSaved={savedIds.has(word.id)}
                        mastery={masteryMap[word.id] ?? 0}
                        onSave={() => toggleSave(word.id)}
                      />
                      {/* Learn button below card */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2 rounded-xl text-violet-600 border-violet-200 hover:bg-violet-50"
                        onClick={() => setActiveTab('flashcards')}
                      >
                        <ChevronRight className="w-3.5 h-3.5 mr-1.5" />
                        Learn with flashcards
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </TabsContent>

          {/* ── My Words ───────────────────────────────────── */}
          <TabsContent value="my-words" className="mt-6 space-y-4">
            {savedWords.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 text-slate-400"
              >
                <Heart className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="font-medium text-slate-600">No saved words yet</p>
                <p className="text-sm mt-1">Tap the heart icon on any word card to save it here</p>
                <Button
                  variant="outline"
                  className="mt-4 rounded-xl"
                  onClick={() => setActiveTab('browse')}
                >
                  Browse Words
                </Button>
              </motion.div>
            ) : (
              <>
                {/* Stats bar */}
                <div className="grid grid-cols-3 gap-3">
                  <Card className="border-slate-100">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-violet-600">{savedWords.length}</div>
                      <p className="text-xs text-slate-500 mt-0.5">Total words</p>
                    </CardContent>
                  </Card>
                  <Card className="border-slate-100">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-emerald-600">
                        {Object.values(masteryMap).filter((v) => v >= 4).length}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">Mastered</p>
                    </CardContent>
                  </Card>
                  <Card className="border-slate-100">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-amber-500">
                        {savedWords.length > 0
                          ? Math.round(
                              (Object.values(masteryMap).reduce((s, v) => s + v, 0) /
                                (savedWords.length * 5)) *
                                100
                            )
                          : 0}%
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">Avg mastery</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Overall progress */}
                <div className="bg-white rounded-xl border border-slate-100 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-700">Overall Progress</span>
                    <span className="text-sm text-slate-500">
                      {Object.values(masteryMap).filter((v) => v >= 4).length} / {savedWords.length} mastered
                    </span>
                  </div>
                  <Progress
                    value={savedWords.length > 0
                      ? (Object.values(masteryMap).filter((v) => v >= 4).length / savedWords.length) * 100
                      : 0}
                    className="h-2 bg-slate-100"
                  />
                </div>

                {/* Word list */}
                <AnimatePresence mode="popLayout">
                  {savedWords.map((word) => (
                    <SavedWordRow
                      key={word.id}
                      word={word}
                      mastery={masteryMap[word.id] ?? 0}
                      onRemove={() => toggleSave(word.id)}
                    />
                  ))}
                </AnimatePresence>
              </>
            )}
          </TabsContent>

          {/* ── Flashcards ─────────────────────────────────── */}
          <TabsContent value="flashcards" className="mt-6">
            {reviewingFlashcards ? (
              <FlashcardReview
                cards={flashcards}
                onComplete={handleFlashcardComplete}
                onExit={() => setReviewingFlashcards(false)}
              />
            ) : (
              <div className="max-w-lg mx-auto space-y-6">
                {/* Last score */}
                {lastScore !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3"
                  >
                    <Trophy className="w-6 h-6 text-emerald-500" />
                    <div>
                      <p className="text-sm font-semibold text-emerald-700">Last session: {lastScore}% accuracy</p>
                      <p className="text-xs text-emerald-600">Great job! Keep up the practice.</p>
                    </div>
                  </motion.div>
                )}

                <Card className="border-slate-100 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Layers className="w-5 h-5 text-violet-500" />
                      Flashcard Review
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Cards ready to review</span>
                      <Badge variant="secondary" className="bg-violet-100 text-violet-700 border-violet-200">
                        {flashcards.length} cards
                      </Badge>
                    </div>
                    <Progress value={flashcards.length > 0 ? 100 : 0} className="h-2 bg-slate-100" />

                    {flashcards.length === 0 ? (
                      <div className="text-center py-8 text-slate-400">
                        <Layers className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p className="text-sm">Save words first to create flashcards</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3 rounded-xl"
                          onClick={() => setActiveTab('browse')}
                        >
                          Browse Words
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-3 text-center">
                          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                            <div className="text-xl font-bold text-slate-700">{flashcards.length}</div>
                            <div className="text-xs text-slate-500">Total cards</div>
                          </div>
                          <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                            <div className="text-xl font-bold text-amber-600">
                              {flashcards.length}
                            </div>
                            <div className="text-xs text-slate-500">Due today</div>
                          </div>
                        </div>

                        <Button
                          onClick={() => setReviewingFlashcards(true)}
                          className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white h-12 text-base font-semibold shadow-md"
                        >
                          <Star className="w-5 h-5 mr-2" />
                          Start Review Session
                        </Button>

                        <p className="text-center text-xs text-slate-400">
                          Use keyboard shortcuts: Space to flip · 1/2/3 to rate
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Category breakdown */}
                {flashcards.length > 0 && (
                  <Card className="border-slate-100 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-slate-600">Cards by Category</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {Object.entries(
                        savedWords.reduce((acc, w) => {
                          acc[w.category] = (acc[w.category] ?? 0) + 1;
                          return acc;
                        }, {} as Record<string, number>)
                      ).map(([cat, count]) => (
                        <div key={cat} className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">{cat}</span>
                          <Badge variant="outline" className="text-xs bg-slate-50">{count}</Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
