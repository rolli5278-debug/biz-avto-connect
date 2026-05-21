// ─── AI Service (mock implementation) ─────────────────────────────────────────
// All methods simulate realistic API latency with setTimeout and return
// plausible mock data. Swap the bodies for real API calls (e.g. OpenAI,
// Anthropic) once you have credentials.

import type { ChatMessage, GrammarError, QuizQuestion } from '../types';
import { sleep, randomInt, randomPick } from '../lib/utils';

// ── Internal helpers ──────────────────────────────────────────────────────────

function uuid(): string {
  return Math.random().toString(36).slice(2, 11);
}

// ── Grammar Correction ────────────────────────────────────────────────────────

export interface GrammarCorrectionResult {
  corrected: string;
  errors: GrammarError[];
  explanation: string;
}

/**
 * Analyses the provided text, returns a corrected version and a list of
 * grammar errors with explanations.
 */
export async function generateGrammarCorrection(
  text: string
): Promise<GrammarCorrectionResult> {
  await sleep(randomInt(600, 1200));

  // Build realistic mock errors based on text length
  const errors: GrammarError[] = [];
  let corrected = text;

  const mockErrorTemplates: Array<{
    find: RegExp;
    replacement: string;
    type: string;
    explanation: string;
  }> = [
    {
      find: /\bi go\b/gi,
      replacement: 'I go',
      type: 'capitalisation',
      explanation: 'The first-person pronoun "I" must always be capitalised.',
    },
    {
      find: /\bhe go\b/gi,
      replacement: 'he goes',
      type: 'subject-verb agreement',
      explanation:
        'Third-person singular subjects (he/she/it) require the verb to end in -s in the present simple.',
    },
    {
      find: /\bshe have\b/gi,
      replacement: 'she has',
      type: 'subject-verb agreement',
      explanation:
        '"She" is a third-person singular subject; use "has" instead of "have".',
    },
    {
      find: /\bmore better\b/gi,
      replacement: 'better',
      type: 'double comparative',
      explanation:
        '"Better" is already the comparative form of "good". Do not add "more".',
    },
    {
      find: /\bdid not went\b/gi,
      replacement: 'did not go',
      type: 'past tense after auxiliary',
      explanation:
        'After the auxiliary "did", use the base form of the verb, not the past tense.',
    },
    {
      find: /\bI am agree\b/gi,
      replacement: 'I agree',
      type: 'verb form',
      explanation:
        '"Agree" is a stative verb and should not be used with a continuous auxiliary.',
    },
  ];

  for (const template of mockErrorTemplates) {
    const match = template.find.exec(text);
    if (match) {
      errors.push({
        original: match[0],
        corrected: template.replacement,
        type: template.type,
        explanation: template.explanation,
        offset: match.index,
        length: match[0].length,
      });
      corrected = corrected.replace(template.find, template.replacement);
    }
  }

  // If no pattern matched, synthesise a generic response
  if (errors.length === 0) {
    const explanation =
      text.length < 20
        ? 'Your sentence looks correct! Try writing something longer for a fuller analysis.'
        : 'Your text looks grammatically correct. Well done! Consider varying your sentence structure to sound more natural.';
    return { corrected: text, errors: [], explanation };
  }

  const explanation =
    `Found ${errors.length} issue${errors.length > 1 ? 's' : ''} in your text. ` +
    errors.map((e) => `${e.type}: "${e.original}" → "${e.corrected}"`).join('; ') +
    '. Review the corrections above to improve your writing.';

  return { corrected, errors, explanation };
}

// ── Chat Response ─────────────────────────────────────────────────────────────

const GREETING_RESPONSES = [
  "Hello! I'm your AI English tutor. How can I help you today?",
  "Hi there! Ready to practise your English? What would you like to work on?",
  "Welcome back! Great to see you continuing your learning journey. What shall we focus on today?",
];

const GENERIC_RESPONSES = [
  "That's a great question! In English, context matters a lot. Could you give me a bit more detail so I can give you the most accurate answer?",
  "Excellent! Let me help you with that. This is a common area where learners make mistakes, so it's great that you're asking.",
  "Good thinking! Here's how native speakers typically approach this: focus on the natural rhythm of the sentence and don't be afraid to pause between clauses.",
  "I see what you mean. Let me explain this with an example: imagine you're in a business meeting and you want to politely disagree — you might say 'I see your point, however…'",
  "Perfect question for your level! The key difference here is about formality. In informal speech we often contract words ('I'm', 'don't'), but in formal writing you'd write them out in full.",
];

const GRAMMAR_RESPONSES = [
  "Great grammar question! The rule here is called subject-verb agreement: the verb must match the number and person of the subject. For example: 'She *goes* to school' (not 'She *go*').",
  "This is the present perfect tense in action. We use it to talk about past actions that still have relevance now. Compare: 'I *ate* lunch' (past simple, finished) vs 'I *have eaten* lunch' (still full!).",
  "You're asking about conditional sentences. The second conditional describes hypothetical or unlikely situations: 'If I *were* rich, I *would* travel the world.'",
];

const VOCAB_RESPONSES = [
  "Great word choice! 'Ubiquitous' means present, appearing, or found everywhere. Example: 'Smartphones have become ubiquitous in modern life.'",
  "An excellent word to learn! 'Perseverance' is a noun meaning continued effort to do or achieve something despite difficulties. Synonyms include: persistence, tenacity, determination.",
  "This word has an interesting etymology! 'Serendipity' was coined by Horace Walpole in 1754 from a Persian fairy tale. It means the occurrence of events by chance in a happy or beneficial way.",
];

/**
 * Generates a context-aware chat response from the AI tutor.
 */
export async function generateChatResponse(
  messages: ChatMessage[],
  context?: string
): Promise<string> {
  await sleep(randomInt(800, 1500));

  const lastMessage = messages[messages.length - 1];
  if (!lastMessage) return GREETING_RESPONSES[0];

  const content = lastMessage.content.toLowerCase();

  if (content.includes('hello') || content.includes('hi ') || content.includes('hey')) {
    return randomPick(GREETING_RESPONSES);
  }

  if (
    content.includes('grammar') ||
    content.includes('tense') ||
    content.includes('verb') ||
    content.includes('noun') ||
    content.includes('adjective')
  ) {
    return randomPick(GRAMMAR_RESPONSES);
  }

  if (
    content.includes('word') ||
    content.includes('mean') ||
    content.includes('vocabulary') ||
    content.includes('synonym') ||
    content.includes('definition')
  ) {
    return randomPick(VOCAB_RESPONSES);
  }

  if (context) {
    return `Based on our current lesson context (${context}), I'd say: ${randomPick(GENERIC_RESPONSES)}`;
  }

  return randomPick(GENERIC_RESPONSES);
}

// ── Vocabulary Explanation ────────────────────────────────────────────────────

export interface VocabularyExplanation {
  definition: string;
  examples: string[];
  tips: string;
  collocations?: string[];
  register?: string;
}

const WORD_EXPLANATIONS: Record<string, VocabularyExplanation> = {
  serendipity: {
    definition: 'The occurrence and development of events by chance in a happy or beneficial way.',
    examples: [
      'Finding my best friend in a foreign city was pure serendipity.',
      'The discovery of penicillin was a famous moment of serendipity in science.',
      'It was serendipity that we happened to meet at the conference.',
    ],
    tips: 'Remember: serendipity is always positive! It describes a lucky, unexpected discovery. The adjective form is "serendipitous".',
    collocations: ['pure serendipity', 'happy serendipity', 'by serendipity'],
    register: 'formal / literary',
  },
  perseverance: {
    definition: 'Continued effort to do or achieve something despite difficulties, failure, or opposition.',
    examples: [
      'Her perseverance in learning English finally paid off when she got the job.',
      'Success often requires years of perseverance.',
      'The athlete\'s perseverance through injury inspired everyone.',
    ],
    tips: 'Collocates well with: "show perseverance", "need perseverance", "with perseverance". Do not confuse with "persistence" — both mean continuing despite difficulty, but perseverance implies nobler or longer-term effort.',
    collocations: ['show perseverance', 'with perseverance', 'remarkable perseverance'],
    register: 'formal',
  },
};

/**
 * Returns a detailed vocabulary explanation including examples and learning tips.
 */
export async function generateVocabularyExplanation(
  word: string
): Promise<VocabularyExplanation> {
  await sleep(randomInt(500, 1000));

  const key = word.toLowerCase().trim();
  if (WORD_EXPLANATIONS[key]) {
    return WORD_EXPLANATIONS[key];
  }

  // Generic fallback
  return {
    definition: `"${word}" is a word used in everyday English. Look it up in a dictionary for a precise definition, then create your own example sentences to memorise it effectively.`,
    examples: [
      `I learned the word "${word}" while studying English.`,
      `Can you use "${word}" in a sentence?`,
      `The teacher explained what "${word}" means.`,
    ],
    tips: `To remember "${word}", try associating it with a vivid image or a situation you have experienced. Writing example sentences is one of the most effective memorisation strategies.`,
    collocations: [`use ${word}`, `learn ${word}`],
    register: 'general',
  };
}

// ── Quiz Generation ───────────────────────────────────────────────────────────

const QUIZ_TEMPLATES: Record<string, QuizQuestion[]> = {
  grammar: [
    {
      id: 'q_g1',
      question: 'Choose the correct form: "She ___ to the gym every morning."',
      options: ['go', 'goes', 'going', 'gone'],
      correct_answer: 'goes',
      explanation:
        'With third-person singular subjects (he/she/it), we add -s or -es to the verb in the present simple.',
      points: 10,
    },
    {
      id: 'q_g2',
      question: 'Which sentence is in the past perfect tense?',
      options: [
        'She was eating when I arrived.',
        'She had eaten before I arrived.',
        'She ate and then I arrived.',
        'She will eat when I arrive.',
      ],
      correct_answer: 'She had eaten before I arrived.',
      explanation:
        'The past perfect uses "had + past participle". It describes an action completed before another past action.',
      points: 10,
    },
    {
      id: 'q_g3',
      question: 'Fill in the blank: "If I ___ more time, I would study harder."',
      options: ['have', 'had', 'has', 'having'],
      correct_answer: 'had',
      explanation:
        'Second conditional sentences use "if + past simple" in the if-clause to talk about hypothetical or unlikely present/future situations.',
      points: 15,
    },
    {
      id: 'q_g4',
      question: 'Which word correctly completes the sentence? "The news ___ surprising."',
      options: ['were', 'are', 'was', 'been'],
      correct_answer: 'was',
      explanation:
        '"News" is an uncountable noun in English and takes a singular verb, even though it ends in -s.',
      points: 10,
    },
    {
      id: 'q_g5',
      question: 'Choose the correct option: "Neither of the students ___ present."',
      options: ['were', 'was', 'are', 'been'],
      correct_answer: 'was',
      explanation:
        '"Neither" is treated as singular in formal English, so we use "was" (singular past).',
      points: 15,
    },
  ],
  vocabulary: [
    {
      id: 'q_v1',
      question: 'What does "meticulous" mean?',
      options: [
        'Very careful and precise',
        'Extremely fast',
        'Completely useless',
        'Surprisingly loud',
      ],
      correct_answer: 'Very careful and precise',
      explanation:
        '"Meticulous" describes someone who pays great attention to detail. Example: "She did a meticulous job checking every figure."',
      points: 10,
    },
    {
      id: 'q_v2',
      question: 'Choose the best synonym for "eloquent".',
      options: ['Quiet', 'Well-spoken', 'Angry', 'Confused'],
      correct_answer: 'Well-spoken',
      explanation:
        '"Eloquent" means fluent or persuasive in speaking or writing. An eloquent speaker expresses ideas clearly and effectively.',
      points: 10,
    },
    {
      id: 'q_v3',
      question: 'Fill in the blank: "The scientist made a ___ discovery that changed medicine."',
      options: ['mundane', 'groundbreaking', 'tedious', 'reluctant'],
      correct_answer: 'groundbreaking',
      explanation:
        '"Groundbreaking" means innovative, pioneering, or revolutionary — well-suited to describing an important scientific discovery.',
      points: 10,
    },
    {
      id: 'q_v4',
      question: 'What is the meaning of "resilient"?',
      options: [
        'Unable to recover from setbacks',
        'Able to recover quickly from difficulties',
        'Easily distracted',
        'Highly intelligent',
      ],
      correct_answer: 'Able to recover quickly from difficulties',
      explanation:
        '"Resilient" describes a person or thing that can spring back after hardship. It comes from Latin "resilire" (to spring back).',
      points: 10,
    },
    {
      id: 'q_v5',
      question: 'Which sentence uses "albeit" correctly?',
      options: [
        'He ran albeit he could.',
        'She passed the exam, albeit with a low score.',
        'Albeit they left early.',
        'I albeit enjoy reading.',
      ],
      correct_answer: 'She passed the exam, albeit with a low score.',
      explanation:
        '"Albeit" is a conjunction meaning "although" or "even though". It is always used mid-sentence, never at the start.',
      points: 15,
    },
  ],
  ielts: [
    {
      id: 'q_i1',
      question: 'In IELTS Writing Task 2, how many words should you write?',
      options: ['At least 150 words', 'At least 250 words', 'Exactly 300 words', 'At least 200 words'],
      correct_answer: 'At least 250 words',
      explanation:
        'IELTS Writing Task 2 requires a minimum of 250 words. Writing fewer will result in a penalty. Aim for 260–290 words.',
      points: 10,
    },
    {
      id: 'q_i2',
      question: 'Which band score represents a "Good User" in IELTS?',
      options: ['Band 5', 'Band 6', 'Band 7', 'Band 8'],
      correct_answer: 'Band 7',
      explanation:
        'Band 7 = Good User. The candidate has operational command of the language, though with occasional inaccuracies.',
      points: 10,
    },
  ],
};

/**
 * Generates a set of quiz questions for a given topic and CEFR level.
 */
export async function generateQuiz(
  topic: string,
  level: string,
  count: number
): Promise<QuizQuestion[]> {
  await sleep(randomInt(700, 1300));

  const pool: QuizQuestion[] =
    QUIZ_TEMPLATES[topic.toLowerCase()] ??
    QUIZ_TEMPLATES['grammar'];

  // Shuffle pool and take `count` items, repeating with new IDs if needed
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const result: QuizQuestion[] = [];

  for (let i = 0; i < count; i++) {
    const template = shuffled[i % shuffled.length];
    result.push({
      ...template,
      id: `${topic}_${level}_${uuid()}_${i}`,
    });
  }

  return result;
}

// ── Pronunciation Scoring ─────────────────────────────────────────────────────

export interface PronunciationScore {
  score: number;      // 0-100
  feedback: string;
  phonemeBreakdown?: Array<{ phoneme: string; accuracy: number }>;
}

/**
 * Compares expected and actual pronunciations and returns a score with feedback.
 * In production, replace with a speech-recognition API result.
 */
export async function scorePronunciation(
  expected: string,
  actual: string
): Promise<PronunciationScore> {
  await sleep(randomInt(500, 900));

  // Simple character-level similarity as mock scoring
  const normalize = (s: string) => s.toLowerCase().trim();
  const exp = normalize(expected);
  const act = normalize(actual);

  let matchCount = 0;
  const minLen = Math.min(exp.length, act.length);
  for (let i = 0; i < minLen; i++) {
    if (exp[i] === act[i]) matchCount++;
  }

  const rawScore = minLen === 0 ? 0 : Math.round((matchCount / Math.max(exp.length, act.length)) * 100);
  const score = Math.max(10, Math.min(100, rawScore + randomInt(-5, 15)));

  let feedback: string;
  if (score >= 90) {
    feedback = 'Excellent pronunciation! You sound very natural. Keep practising to maintain this level.';
  } else if (score >= 75) {
    feedback = `Good effort! Your pronunciation of "${expected}" is mostly correct. Focus on the stressed syllable and the vowel sounds.`;
  } else if (score >= 55) {
    feedback = `Decent attempt. The word "${expected}" can be tricky. Try breaking it into syllables and practise each part separately.`;
  } else {
    feedback = `Keep practising! "${expected}" has some challenging sounds. Listen to the model pronunciation several times before trying again.`;
  }

  return { score, feedback };
}

// ── IELTS Feedback ────────────────────────────────────────────────────────────

export interface IELTSFeedbackResult {
  score: number;        // 0-100 normalised
  band: number;         // 1-9
  feedback: string;
  suggestions: string[];
  criteria?: {
    task_achievement: number;
    coherence_cohesion: number;
    lexical_resource: number;
    grammatical_range: number;
  };
}

const IELTS_WRITING_SUGGESTIONS = [
  'Use a wider range of cohesive devices (e.g., "furthermore", "nevertheless", "as a result").',
  'Vary your sentence structure — mix simple, compound, and complex sentences.',
  'Aim for a higher lexical range by replacing common words with more precise vocabulary.',
  'Ensure each paragraph has a clear topic sentence.',
  'Address all parts of the task question to maximise your Task Achievement score.',
  'Avoid repeating the same vocabulary — use paraphrasing and synonyms.',
  'Check subject-verb agreement throughout your essay.',
  'Use formal language; avoid contractions (e.g., write "do not" instead of "don\'t").',
];

const IELTS_SPEAKING_SUGGESTIONS = [
  'Speak at a natural pace — neither too fast nor too slow.',
  'Use discourse markers to organise your speech (e.g., "to begin with", "on the other hand").',
  'Expand your answers with reasons and examples rather than giving one-word responses.',
  'Practise connected speech to sound more fluent (linking words together).',
  'Record yourself speaking and listen back for pronunciation issues.',
];

const IELTS_READING_SUGGESTIONS = [
  'Practise skimming to find the main idea of each paragraph quickly.',
  'Use scanning to locate specific information without reading every word.',
  'Pay attention to paraphrasings — the passage rarely uses the same words as the question.',
  'Manage your time: aim for about 20 minutes per section.',
];

const IELTS_LISTENING_SUGGESTIONS = [
  'Predict the type of answer before listening (number, name, adjective, etc.).',
  'Focus on keywords and signal words that indicate the answer is coming.',
  'Check your spelling carefully when writing answers.',
  'Practise with a variety of accents (British, Australian, American, etc.).',
];

/**
 * Returns a simulated IELTS band score and actionable feedback for the given
 * skill type and submitted content.
 */
export async function generateIELTSFeedback(
  type: string,
  content: string
): Promise<IELTSFeedbackResult> {
  await sleep(randomInt(1000, 1500));

  // Heuristic band based on content length (crude mock)
  const wordCount = content.trim().split(/\s+/).length;
  let baseBand: number;
  if (type === 'writing') {
    baseBand = wordCount < 100 ? 4 : wordCount < 200 ? 5 : wordCount < 280 ? 6 : 7;
  } else {
    baseBand = randomInt(5, 8);
  }

  // Add a small random variance
  const band = Math.max(1, Math.min(9, baseBand + (Math.random() > 0.5 ? 0.5 : 0)));
  const score = Math.round((band / 9) * 100);

  const suggestionPool =
    type === 'writing'
      ? IELTS_WRITING_SUGGESTIONS
      : type === 'speaking'
      ? IELTS_SPEAKING_SUGGESTIONS
      : type === 'reading'
      ? IELTS_READING_SUGGESTIONS
      : IELTS_LISTENING_SUGGESTIONS;

  // Pick 3 relevant suggestions
  const shuffled = [...suggestionPool].sort(() => Math.random() - 0.5);
  const suggestions = shuffled.slice(0, 3);

  let feedback: string;
  if (band >= 8) {
    feedback = `Outstanding performance! Your ${type} demonstrates an excellent command of English. Band ${band} reflects near-native proficiency.`;
  } else if (band >= 7) {
    feedback = `Great work! Band ${band} is a strong score. Your ${type} shows good language command with only occasional errors. A few more refinements will push you to Band 8+.`;
  } else if (band >= 6) {
    feedback = `Good effort — Band ${band} shows competent English use. There are some inaccuracies, but communication is generally effective. Focus on the suggestions below to improve.`;
  } else if (band >= 5) {
    feedback = `You're making progress! Band ${band} means you can handle basic communication, but there are noticeable errors. Regular practice and the suggestions below will help you reach Band 6+.`;
  } else {
    feedback = `Keep practising! Band ${band} indicates you are still developing your English skills. Focus on the fundamentals: grammar, vocabulary, and sentence structure.`;
  }

  const criteria =
    type === 'writing'
      ? {
          task_achievement: Math.min(9, band + randomInt(-1, 1)),
          coherence_cohesion: Math.min(9, band + randomInt(-1, 1)),
          lexical_resource: Math.min(9, band + randomInt(-1, 1)),
          grammatical_range: Math.min(9, band + randomInt(-1, 1)),
        }
      : undefined;

  return { score, band, feedback, suggestions, criteria };
}
