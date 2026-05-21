// ─── Lessons Service ───────────────────────────────────────────────────────────
// Provides lesson CRUD, completion tracking, and personalised recommendations.
// Uses Supabase for persistence and a rich mock-data set as a development
// fallback so the UI renders without a live database.

import { supabase } from '../lib/supabase';
import { addXP } from './user.service';
import type { CEFRLevel, Lesson, LessonContent, LessonType, UserLesson } from '../types';

// ── Internal helpers ──────────────────────────────────────────────────────────

function handleError(error: unknown, context: string): never {
  const message = error instanceof Error ? error.message : String(error);
  throw new Error(`[lessons.service] ${context}: ${message}`);
}

// ── Mock Lessons ──────────────────────────────────────────────────────────────

const MOCK_LESSONS: Lesson[] = [
  // ── Grammar ────────────────────────────────────────────────────────────────
  {
    id: 'l1',
    title: 'Present Simple vs Present Continuous',
    description:
      'Understand the difference between permanent states and actions happening right now.',
    level: 'A2',
    type: 'grammar',
    duration_minutes: 15,
    xp_reward: 50,
    created_at: '2024-01-10T08:00:00Z',
    thumbnail_url: undefined,
    is_premium: false,
    tags: ['present tense', 'verbs', 'basics'],
    content: {
      body: `## Present Simple vs Present Continuous

### Present Simple
Use the present simple for:
- **Habits and routines**: *She drinks coffee every morning.*
- **Permanent situations**: *He works in a hospital.*
- **General truths**: *Water boils at 100°C.*

**Structure**: Subject + base verb (+ *-s* for he/she/it)

### Present Continuous
Use the present continuous for:
- **Actions happening now**: *I am writing an email.*
- **Temporary situations**: *She is staying with friends this week.*
- **Future arrangements**: *We are meeting at 3 pm.*

**Structure**: Subject + am/is/are + verb *-ing*

### Key Signal Words
| Present Simple | Present Continuous |
|---|---|
| always, usually, often | now, at the moment |
| every day/week/year | currently, today |
| never, rarely | this week/month |
`,
      key_vocabulary: ['habit', 'routine', 'temporary', 'permanent', 'stative verb'],
      grammar_points: ['present simple structure', 'present continuous structure', 'stative verbs (know, believe, like)'],
    } satisfies LessonContent,
  },
  {
    id: 'l2',
    title: 'Past Simple and Past Continuous',
    description: 'Learn to talk about completed actions and ongoing situations in the past.',
    level: 'A2',
    type: 'grammar',
    duration_minutes: 20,
    xp_reward: 60,
    created_at: '2024-01-12T08:00:00Z',
    is_premium: false,
    tags: ['past tense', 'verbs', 'narrative'],
    content: {
      body: `## Past Simple and Past Continuous

### Past Simple
Used for **completed actions** at a specific time in the past.

- *I visited London last year.*
- *She didn't eat breakfast this morning.*
- *Did they finish the project?*

### Past Continuous
Used for **actions that were in progress** at a specific past moment.

- *I was reading when the phone rang.*
- *They were working all night.*

### Using Both Together
A common pattern is: **past continuous (background) + past simple (interruption)**

> *While she **was walking** home, it **started** to rain.*

### Irregular Verbs to Know
| Base | Past Simple |
|---|---|
| go | went |
| have | had |
| see | saw |
| take | took |
| come | came |
`,
      key_vocabulary: ['irregular verb', 'background action', 'interruption', 'while', 'when'],
      grammar_points: ['past simple regular/irregular', 'past continuous with while/when'],
    } satisfies LessonContent,
  },
  {
    id: 'l3',
    title: 'Conditional Sentences (Types 1 & 2)',
    description: 'Express real and hypothetical conditions with confidence.',
    level: 'B1',
    type: 'grammar',
    duration_minutes: 25,
    xp_reward: 80,
    created_at: '2024-01-15T08:00:00Z',
    is_premium: false,
    tags: ['conditionals', 'if clauses', 'intermediate'],
    content: {
      body: `## Conditional Sentences

### First Conditional (Real / Likely)
Used for situations that are **possible and likely** in the future.

**Structure**: If + present simple, **will** + base verb

> *If it **rains**, we **will** cancel the picnic.*
> *If she **studies** hard, she **will** pass the exam.*

### Second Conditional (Unreal / Unlikely)
Used for **hypothetical or unlikely** situations in the present or future.

**Structure**: If + past simple, **would** + base verb

> *If I **had** more money, I **would** travel the world.*
> *If he **were** the president, he **would** change many things.*

Note: Use **were** (not *was*) for all persons in formal writing.

### Common Mistakes to Avoid
❌ *If I will see her, I will tell her.*
✅ *If I see her, I will tell her.*

❌ *If I would be rich, I buy a car.*
✅ *If I were rich, I would buy a car.*
`,
      key_vocabulary: ['condition', 'hypothesis', 'likely', 'unlikely', 'result clause'],
      grammar_points: ['first conditional structure', 'second conditional structure', 'were vs was in conditionals'],
    } satisfies LessonContent,
  },
  {
    id: 'l4',
    title: 'Perfect Tenses: Present and Past',
    description: 'Master the perfect tenses that connect time frames elegantly.',
    level: 'B2',
    type: 'grammar',
    duration_minutes: 30,
    xp_reward: 100,
    created_at: '2024-01-18T08:00:00Z',
    is_premium: false,
    tags: ['perfect tense', 'advanced grammar', 'B2'],
    content: {
      body: `## Perfect Tenses

### Present Perfect
Use for actions **connected to the present** — the exact time doesn't matter.

- *I **have visited** Paris.* (life experience)
- *She **has just finished** her report.* (recently completed)
- *They **haven't seen** each other for years.* (duration up to now)

**Key words**: just, already, yet, ever, never, recently, for, since

### Past Perfect
Use to show that one past action happened **before another past action**.

- *By the time he arrived, she **had already left**.*
- *I realised I **had forgotten** my keys.*

**Structure**: had + past participle

### Present Perfect Continuous
Emphasises the **duration or ongoing nature** of a recent activity.

- *She **has been studying** for three hours.*
- *It **has been raining** all day.*

**Structure**: has/have + been + verb-ing
`,
      key_vocabulary: ['just', 'already', 'yet', 'since', 'for', 'duration'],
      grammar_points: ['present perfect vs past simple', 'past perfect for sequencing', 'continuous vs simple perfect'],
    } satisfies LessonContent,
  },
  // ── Vocabulary ─────────────────────────────────────────────────────────────
  {
    id: 'l5',
    title: 'Business English: Emails & Correspondence',
    description: 'Write professional emails that make a strong impression.',
    level: 'B2',
    type: 'vocabulary',
    duration_minutes: 20,
    xp_reward: 70,
    created_at: '2024-01-20T08:00:00Z',
    is_premium: false,
    tags: ['business English', 'email writing', 'professional'],
    content: {
      body: `## Business Email Vocabulary

### Opening Phrases
- *I hope this email finds you well.*
- *I am writing to enquire about…*
- *With reference to your email of [date]…*
- *Further to our conversation…*

### Making Requests
- *Could you please…?*
- *I would be grateful if you could…*
- *Would it be possible to…?*
- *I would appreciate it if…*

### Giving Information
- *Please find attached…*
- *I would like to inform you that…*
- *As discussed, I am sending you…*

### Closing Phrases
- *Please do not hesitate to contact me if you need any further information.*
- *I look forward to hearing from you.*
- *Thank you for your time and consideration.*
- *Kind regards / Best regards / Yours sincerely*

### Register Levels
| Informal | Formal |
|---|---|
| Hi John | Dear Mr Smith |
| Thanks | Thank you |
| Get back to me | Please respond at your earliest convenience |
| Sorry | I apologise |
`,
      key_vocabulary: ['enquire', 'attached', 'gratitude', 'correspondence', 'at your earliest convenience'],
      grammar_points: ['conditional politeness (Would you…)', 'passive voice in requests'],
    } satisfies LessonContent,
  },
  {
    id: 'l6',
    title: 'Phrasal Verbs in Everyday English',
    description: 'Learn the 30 most common phrasal verbs used in daily conversation.',
    level: 'B1',
    type: 'vocabulary',
    duration_minutes: 25,
    xp_reward: 75,
    created_at: '2024-01-22T08:00:00Z',
    is_premium: false,
    tags: ['phrasal verbs', 'conversation', 'idioms'],
    content: {
      body: `## Essential Phrasal Verbs

### Phrasal Verbs with GET
| Phrasal Verb | Meaning | Example |
|---|---|---|
| get up | rise from bed | *I get up at 7 every day.* |
| get on with | have a good relationship | *She gets on well with her colleagues.* |
| get over | recover from | *It took weeks to get over the cold.* |
| get away with | escape without punishment | *He got away with cheating on the test.* |

### Phrasal Verbs with TAKE
| Phrasal Verb | Meaning | Example |
|---|---|---|
| take off | leave the ground / remove | *The plane took off on time.* |
| take up | start a new hobby | *She took up photography last year.* |
| take over | assume control | *A new manager took over the department.* |
| take back | return / withdraw | *He took back what he said.* |

### Phrasal Verbs with TURN
| Phrasal Verb | Meaning | Example |
|---|---|---|
| turn up | arrive / increase volume | *She didn't turn up to the meeting.* |
| turn down | refuse / decrease | *They turned down my offer.* |
| turn out | result / attend | *It turned out to be a great day.* |
`,
      key_vocabulary: ['phrasal verb', 'separable', 'inseparable', 'particle', 'idiom'],
    } satisfies LessonContent,
  },
  // ── Speaking ───────────────────────────────────────────────────────────────
  {
    id: 'l7',
    title: 'Describing Trends and Changes',
    description: 'Express movement, growth, and decline clearly in speaking and writing.',
    level: 'B1',
    type: 'speaking',
    duration_minutes: 20,
    xp_reward: 80,
    created_at: '2024-01-25T08:00:00Z',
    is_premium: true,
    tags: ['trends', 'graphs', 'IELTS', 'speaking'],
    content: {
      body: `## Language for Describing Trends

### Verbs of Change
| Direction | Verbs |
|---|---|
| Increase | rise, grow, increase, climb, go up, surge, soar |
| Decrease | fall, drop, decline, decrease, go down, plummet |
| Stay same | remain stable, stay constant, level off, plateau |

### Adverbs of Degree
- **Dramatically / Significantly / Considerably** — large change
- **Slightly / Marginally** — small change
- **Steadily / Gradually** — slow, consistent change
- **Sharply / Steeply** — sudden, large change

### Example Sentences
- *Sales **rose dramatically** in the first quarter.*
- *The number of users **gradually declined** over the year.*
- *Prices **remained relatively stable** throughout the period.*
- *There was a **sharp drop** in temperature.*

### Spoken vs Written
In spoken English, prefer simpler forms:
> "The numbers went up quite a lot" vs "The figures increased significantly"
`,
      key_vocabulary: ['trend', 'peak', 'trough', 'plateau', 'fluctuate', 'significantly'],
      grammar_points: ['passive for impersonal descriptions', 'noun phrase: a sharp rise in...'],
    } satisfies LessonContent,
  },
  // ── Listening ─────────────────────────────────────────────────────────────
  {
    id: 'l8',
    title: 'Understanding British vs American English',
    description: 'Learn key pronunciation and vocabulary differences between the two main dialects.',
    level: 'B1',
    type: 'listening',
    duration_minutes: 30,
    xp_reward: 85,
    created_at: '2024-01-28T08:00:00Z',
    is_premium: false,
    tags: ['British English', 'American English', 'pronunciation', 'dialect'],
    content: {
      body: `## British vs American English

### Vocabulary Differences
| British English | American English |
|---|---|
| Flat | Apartment |
| Lift | Elevator |
| Autumn | Fall |
| Biscuit | Cookie |
| Mobile (phone) | Cell phone |
| Lorry | Truck |
| Pavement | Sidewalk |
| Queue | Line |
| Holiday | Vacation |
| Rubbish | Trash / Garbage |

### Spelling Differences
| British | American |
|---|---|
| colour | color |
| favourite | favorite |
| centre | center |
| organisation | organization |
| travelled | traveled |

### Pronunciation Highlights
- **Non-rhotic (UK)**: The "r" at the end of words is not pronounced: *car* → /kɑː/
- **Rhotic (US)**: The "r" IS pronounced: *car* → /kɑːr/
- **T-flapping (US)**: "t" between vowels sounds like "d": *butter* → "budder"
- **Received Pronunciation (UK RP)**: Clear, prestige accent used in broadcasting
`,
      key_vocabulary: ['dialect', 'accent', 'rhotic', 'non-rhotic', 'pronunciation', 'vocabulary difference'],
      transcript: 'Audio: comparison of British and American speakers discussing everyday topics.',
    } satisfies LessonContent,
  },
  // ── Reading ────────────────────────────────────────────────────────────────
  {
    id: 'l9',
    title: 'IELTS Reading Strategies',
    description: 'Learn the skimming, scanning, and detailed reading techniques for high IELTS scores.',
    level: 'B2',
    type: 'reading',
    duration_minutes: 35,
    xp_reward: 110,
    created_at: '2024-02-01T08:00:00Z',
    is_premium: true,
    tags: ['IELTS', 'reading skills', 'exam prep'],
    content: {
      body: `## IELTS Reading Strategies

### Three Core Techniques

#### 1. Skimming (read for gist)
Quickly read to understand the **main idea** of a passage or paragraph.
- Focus on: **title, headings, first/last sentences of each paragraph**
- Time: 2-3 minutes for a full passage
- Goal: Know what the text is broadly about

#### 2. Scanning (search for specific information)
Move your eyes quickly across the text to **locate a specific word or number**.
- Focus on: **names, dates, numbers, capital letters**
- Do NOT read every word
- Used for: matching names to paragraphs, True/False/Not Given

#### 3. Intensive Reading (read for detail)
Read carefully to understand **specific information** once you've located the area.

### Common Question Types
| Type | Strategy |
|---|---|
| True/False/Not Given | Scan for keywords → read carefully for paraphrase |
| Matching Headings | Skim each paragraph → match to heading list |
| Summary Completion | Locate section → read for surrounding context |
| Multiple Choice | Identify keywords → scan → eliminate wrong answers |

### Top Tips
1. Always read the questions **before** the passage
2. Answers follow the **order of the passage** (usually)
3. IELTS paraphrases heavily — know synonyms
4. Manage time strictly: 20 minutes per passage
`,
      key_vocabulary: ['skimming', 'scanning', 'paraphrase', 'inference', 'gist', 'locate'],
    } satisfies LessonContent,
  },
  // ── Writing ────────────────────────────────────────────────────────────────
  {
    id: 'l10',
    title: 'IELTS Writing Task 2: Argument Essay',
    description: 'Structure a Band 7+ argumentative essay step by step.',
    level: 'C1',
    type: 'writing',
    duration_minutes: 45,
    xp_reward: 150,
    created_at: '2024-02-05T08:00:00Z',
    is_premium: true,
    tags: ['IELTS', 'writing', 'essay', 'argument'],
    content: {
      body: `## IELTS Task 2 Argument Essay Structure

### Five-Paragraph Framework

**Paragraph 1 — Introduction (50–60 words)**
- Paraphrase the question (never copy it)
- State your opinion clearly
> *In recent decades, X has become increasingly prevalent. While some argue that [view A], I firmly believe that [view B].*

**Paragraph 2 — Main Body 1: Support your view**
- Topic sentence → supporting argument → example/evidence → explanation
> *The primary reason for this is… For instance,…*

**Paragraph 3 — Main Body 2: Address the opposing view**
- Concede a point → refute with stronger argument
> *Admittedly, proponents of [view A] argue that… However, this overlooks the fact that…*

**Paragraph 4 — Main Body 3 (optional for Band 7+)**
- Additional support or impact/consequence argument

**Paragraph 5 — Conclusion (40–50 words)**
- Summarise your position (do NOT introduce new ideas)
- Restate opinion in different words
> *In conclusion, although [concession], the evidence strongly suggests that [restatement of opinion].*

### High-Scoring Language Checklist
- [ ] Varied connectors: *furthermore, nevertheless, consequently, in contrast*
- [ ] Academic vocabulary: *substantial, fundamental, prevalent, facilitate*
- [ ] Complex sentence structures: relative clauses, participle phrases
- [ ] No contractions, no informal language
`,
      key_vocabulary: ['argumentative', 'thesis statement', 'cohesive device', 'concede', 'refute', 'paraphrase'],
      grammar_points: ['passive voice for objectivity', 'cleft sentences for emphasis', 'nominalization'],
    } satisfies LessonContent,
  },
];

// ── Filters ───────────────────────────────────────────────────────────────────

export interface LessonFilters {
  type?: LessonType;
  level?: CEFRLevel;
  is_premium?: boolean;
  search?: string;
}

// ── Lessons ───────────────────────────────────────────────────────────────────

/**
 * Fetches lessons from Supabase, with optional type/level filters.
 * Falls back to MOCK_LESSONS when the DB returns no rows.
 */
export async function getLessons(filters: LessonFilters = {}): Promise<Lesson[]> {
  let query = supabase
    .from('lessons')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters.type) {
    query = query.eq('type', filters.type);
  }
  if (filters.level) {
    query = query.eq('level', filters.level);
  }
  if (typeof filters.is_premium === 'boolean') {
    query = query.eq('is_premium', filters.is_premium);
  }
  if (filters.search?.trim()) {
    const term = `%${filters.search.trim()}%`;
    query = query.or(`title.ilike.${term},description.ilike.${term}`);
  }

  const { data, error } = await query;

  if (error || !data || data.length === 0) {
    let mock = [...MOCK_LESSONS];
    if (filters.type)  mock = mock.filter((l) => l.type  === filters.type);
    if (filters.level) mock = mock.filter((l) => l.level === filters.level);
    if (typeof filters.is_premium === 'boolean') {
      mock = mock.filter((l) => (l.is_premium ?? false) === filters.is_premium);
    }
    if (filters.search) {
      const term = filters.search.toLowerCase();
      mock = mock.filter(
        (l) =>
          l.title.toLowerCase().includes(term) ||
          l.description.toLowerCase().includes(term)
      );
    }
    return mock;
  }

  return data as unknown as Lesson[];
}

/**
 * Fetches a single lesson by ID.
 * Falls back to MOCK_LESSONS.
 */
export async function getLessonById(id: string): Promise<Lesson> {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    const mock = MOCK_LESSONS.find((l) => l.id === id);
    if (mock) return mock;
    handleError(error ?? new Error('Lesson not found'), `getLessonById(${id})`);
  }

  return data as unknown as Lesson;
}

/**
 * Records a lesson completion for the user.
 * - Upserts a user_lessons row
 * - Adds XP to the user
 * - Increments lessons_completed in user_progress
 * - Increments minutes_practiced in user_progress
 */
export async function completeLesson(
  userId: string,
  lessonId: string,
  score: number
): Promise<void> {
  const lesson = await getLessonById(lessonId);

  // Upsert completion record
  const { error: upsertError } = await supabase
    .from('user_lessons')
    .upsert(
      {
        user_id: userId,
        lesson_id: lessonId,
        completed: true,
        score,
        completed_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,lesson_id' }
    );

  if (upsertError) {
    // Log but don't throw — allow XP to still be granted
    console.warn('[lessons.service] completeLesson upsert error:', upsertError.message);
  }

  // Grant XP proportional to score (minimum 50%)
  const xpMultiplier = Math.max(0.5, score / 100);
  const xpEarned = Math.round(lesson.xp_reward * xpMultiplier);
  await addXP(userId, xpEarned);

  // Update aggregated progress
  const { data: progress } = await supabase
    .from('user_progress')
    .select('lessons_completed, minutes_practiced')
    .eq('user_id', userId)
    .single();

  const currentCompleted = (progress as { lessons_completed?: number } | null)?.lessons_completed ?? 0;
  const currentMinutes  = (progress as { minutes_practiced?: number } | null)?.minutes_practiced ?? 0;

  await supabase
    .from('user_progress')
    .update({
      lessons_completed: currentCompleted + 1,
      minutes_practiced: currentMinutes + lesson.duration_minutes,
    })
    .eq('user_id', userId);
}

/**
 * Returns all lessons the user has interacted with, annotated with completion
 * status and score.  Un-started lessons from the catalogue are also included,
 * marked incomplete.
 */
export async function getUserLessons(userId: string): Promise<UserLesson[]> {
  const [allLessons, completionRows] = await Promise.all([
    getLessons(),
    supabase
      .from('user_lessons')
      .select('lesson_id, completed, score, completed_at')
      .eq('user_id', userId),
  ]);

  const completionMap = new Map<
    string,
    { completed: boolean; score?: number; completed_at?: string }
  >();

  for (const row of (completionRows.data ?? []) as Array<{
    lesson_id: string;
    completed: boolean;
    score: number | null;
    completed_at: string | null;
  }>) {
    completionMap.set(row.lesson_id, {
      completed: row.completed,
      score: row.score ?? undefined,
      completed_at: row.completed_at ?? undefined,
    });
  }

  return allLessons.map((lesson) => {
    const status = completionMap.get(lesson.id);
    return {
      lesson,
      completed: status?.completed ?? false,
      score: status?.score,
      completed_at: status?.completed_at,
    };
  });
}

/**
 * Returns a personalised list of recommended lessons for the user.
 * Strategy:
 *  1. Find user's current level from the users table
 *  2. Return up to 5 incomplete lessons at the user's level (or one level above)
 *  3. Prioritise shorter lessons and those with the highest XP reward
 */
export async function getRecommendedLessons(userId: string): Promise<Lesson[]> {
  // Get user level
  const { data: user } = await supabase
    .from('users')
    .select('level')
    .eq('id', userId)
    .single();

  const userLevel = (user as { level?: string } | null)?.level ?? 'A2';

  // Get completed lesson IDs
  const { data: completed } = await supabase
    .from('user_lessons')
    .select('lesson_id')
    .eq('user_id', userId)
    .eq('completed', true);

  const completedIds = new Set(
    ((completed ?? []) as Array<{ lesson_id: string }>).map((r) => r.lesson_id)
  );

  // Fetch all lessons for the user's level and one level above
  const LEVEL_ORDER: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const levelIndex = LEVEL_ORDER.indexOf(userLevel as CEFRLevel);
  const targetLevels: CEFRLevel[] = [
    userLevel as CEFRLevel,
    ...(levelIndex < LEVEL_ORDER.length - 1 ? [LEVEL_ORDER[levelIndex + 1]] : []),
  ];

  const all = await getLessons();

  const candidates = all
    .filter((l) => targetLevels.includes(l.level) && !completedIds.has(l.id))
    .sort((a, b) => {
      // Sort by XP reward (desc), then duration (asc)
      if (b.xp_reward !== a.xp_reward) return b.xp_reward - a.xp_reward;
      return a.duration_minutes - b.duration_minutes;
    });

  // Return up to 5 recommendations
  return candidates.slice(0, 5);
}
