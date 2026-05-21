import { useState, useRef, useEffect, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  CheckSquare,
  BookOpen,
  Mic,
  Users,
  GraduationCap,
  Send,
  Paperclip,
  Trash2,
  ChevronRight,
  Bot,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ChatMessage } from '@/components/tutor/ChatMessage';
import { TypingIndicator } from '@/components/tutor/TypingIndicator';
import type { ChatMessage as ChatMessageType, GrammarError } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

type ConversationMode =
  | 'free_chat'
  | 'grammar_check'
  | 'vocabulary_help'
  | 'roleplay'
  | 'ielts_speaking';

type RoleplayScenario =
  | 'job_interview'
  | 'travel'
  | 'shopping'
  | 'restaurant'
  | 'doctor'
  | 'hotel';

// ─── Mode definitions ─────────────────────────────────────────────────────────

interface ModeConfig {
  id: ConversationMode;
  label: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  inputPlaceholder: string;
  starters: string[];
}

const MODES: ModeConfig[] = [
  {
    id: 'free_chat',
    label: 'Free Chat',
    icon: <MessageSquare className="w-4 h-4" />,
    description: 'Practice general English conversation',
    color: 'text-violet-600 bg-violet-50 border-violet-200',
    inputPlaceholder: 'Chat freely in English...',
    starters: [
      'Tell me about your day',
      "What's your favorite hobby?",
      'Describe your ideal vacation',
      "What's a book you've read recently?",
    ],
  },
  {
    id: 'grammar_check',
    label: 'Grammar Check',
    icon: <CheckSquare className="w-4 h-4" />,
    description: 'Submit text for instant corrections',
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    inputPlaceholder: 'Paste or type text to check grammar...',
    starters: [
      'I have went to the market yesterday',
      'She don\'t like eating vegetables',
      'We was very tired after the trip',
      'He has less friends than his brother',
    ],
  },
  {
    id: 'vocabulary_help',
    label: 'Vocabulary Help',
    icon: <BookOpen className="w-4 h-4" />,
    description: 'Explain words and phrases in detail',
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    inputPlaceholder: 'Ask about a word or phrase...',
    starters: [
      "What does 'serendipity' mean?",
      "Explain 'to break the ice'",
      "Difference between 'affect' and 'effect'",
      "What is a 'red herring'?",
    ],
  },
  {
    id: 'roleplay',
    label: 'Roleplay',
    icon: <Users className="w-4 h-4" />,
    description: 'Practice real-life scenarios',
    color: 'text-orange-600 bg-orange-50 border-orange-200',
    inputPlaceholder: 'Respond to the scenario...',
    starters: [
      'Start a job interview roleplay',
      'Hotel check-in scenario',
      'Ordering food at a restaurant',
      'Asking for directions in a foreign city',
    ],
  },
  {
    id: 'ielts_speaking',
    label: 'IELTS Speaking',
    icon: <GraduationCap className="w-4 h-4" />,
    description: 'Practice IELTS-style questions',
    color: 'text-rose-600 bg-rose-50 border-rose-200',
    inputPlaceholder: 'Answer the IELTS question...',
    starters: [
      'Part 1: Describe your hometown',
      'Part 1: Do you prefer mornings or evenings?',
      'Part 2: Describe a memorable journey',
      'Part 3: How has technology changed education?',
    ],
  },
];

// ─── Roleplay scenario cards ──────────────────────────────────────────────────

const ROLEPLAY_SCENARIOS: { id: RoleplayScenario; emoji: string; label: string; description: string }[] = [
  { id: 'job_interview', emoji: '💼', label: 'Job Interview', description: 'Practice professional Q&A' },
  { id: 'travel', emoji: '✈️', label: 'Travel', description: 'Airport, directions & tourism' },
  { id: 'shopping', emoji: '🛍️', label: 'Shopping', description: 'Stores, bargaining & returns' },
  { id: 'restaurant', emoji: '🍽️', label: 'Restaurant', description: 'Ordering food and drinks' },
  { id: 'doctor', emoji: '🏥', label: 'Doctor Visit', description: 'Medical appointments & symptoms' },
  { id: 'hotel', emoji: '🏨', label: 'Hotel', description: 'Check-in, requests & services' },
];

// ─── Mock AI responses ────────────────────────────────────────────────────────

function makeId() {
  return Math.random().toString(36).slice(2);
}

function isoNow() {
  return new Date().toISOString();
}

function getMockResponse(
  mode: ConversationMode,
  userText: string
): Omit<ChatMessageType, 'id' | 'created_at'> {
  switch (mode) {
    case 'grammar_check': {
      const hasError =
        /went|don't|was very|less friends/i.test(userText) ||
        userText.length > 20;
      if (hasError) {
        const errors: GrammarError[] = [
          {
            original: 'I have went',
            corrected: 'I went',
            type: 'grammar',
            explanation: '"Have went" is incorrect. Use simple past "went" or present perfect "have gone".',
          },
          {
            original: 'to the market yesterday',
            corrected: 'to the market yesterday',
            type: 'style',
            explanation: 'Sentence structure is good. Add more detail for richer expression.',
          },
        ];
        return {
          role: 'assistant',
          type: 'grammar_correction',
          content: 'I found some issues in your text. Here are the corrections:',
          metadata: {
            corrected: userText
              .replace(/have went/gi, 'went')
              .replace(/don't/gi, "doesn't")
              .replace(/\bwas\b/gi, 'were'),
            errors,
          },
        };
      }
      return {
        role: 'assistant',
        type: 'text',
        content:
          '✅ Great job! Your text looks grammatically correct. The sentence structure is clear and your vocabulary choice is appropriate for the context.',
      };
    }

    case 'vocabulary_help': {
      const word = userText.match(/['"]([^'"]+)['"]/)?.[1] ?? userText.split(' ').pop() ?? 'serendipity';
      return {
        role: 'assistant',
        type: 'vocab_tip',
        content: `Here's a detailed explanation of "${word}":`,
        metadata: {
          vocab: {
            word,
            partOfSpeech: 'noun',
            definition: `The occurrence of events by chance in a happy or beneficial way. Finding something good without looking for it.`,
            example: `It was pure serendipity that I found my lost wallet while cleaning the park.`,
            translation_uz: `Baxtli tasodif, kutilmagan yoqimli hodisa`,
          },
        },
      };
    }

    case 'ielts_speaking': {
      return {
        role: 'assistant',
        type: 'text',
        content: `Good attempt! Here's my IELTS feedback:\n\n**Fluency & Coherence (6.5/9):** Your ideas flow logically. Try using more discourse markers like "Furthermore," "In contrast," and "To elaborate."\n\n**Lexical Resource (7/9):** Solid vocabulary. Consider using more topic-specific terms.\n\n**Grammatical Range (6.5/9):** Good use of complex sentences. Watch for consistent tense usage.\n\n**Pronunciation (7/9):** Clear delivery. Slow down slightly for better clarity.\n\n**Overall Band: 6.8** — Keep practicing!`,
      };
    }

    case 'roleplay': {
      const scenarios: Record<string, string> = {
        interview: `Interviewer: "Thank you for coming in today. Could you start by telling me a little about yourself and why you're interested in this position?"`,
        hotel: `Receptionist: "Good evening! Welcome to the Grand Palace Hotel. Do you have a reservation with us, or would you like to check for available rooms?"`,
        restaurant: `Waiter: "Good evening and welcome! I'm Marco, and I'll be your server tonight. Can I start you off with something to drink while you look over our menu?"`,
        default: `Let's begin the roleplay! I'll play the other character. Please respond naturally to start the conversation. Remember to use polite phrases and formal language where appropriate.`,
      };
      const key = Object.keys(scenarios).find((k) => userText.toLowerCase().includes(k)) ?? 'default';
      return { role: 'assistant', type: 'text', content: scenarios[key] };
    }

    default: {
      const responses = [
        "That's a great topic! Let me share some thoughts. English has so many fascinating nuances — the key is to practice consistently. What specifically would you like to focus on today?",
        "Interesting! I love discussing that. One tip for improving your English fluency is to think in English rather than translating from your native language. It takes practice but makes a huge difference!",
        "I understand what you mean. In English, we often use phrasal verbs and idioms to express ideas more naturally. For example, instead of saying 'I am very tired', a native speaker might say 'I'm absolutely exhausted' or 'I'm running on empty'.",
        "Great question! Let's explore that further. The best way to build English fluency is through regular exposure — reading, listening, and most importantly, speaking without fear of making mistakes.",
      ];
      return {
        role: 'assistant',
        type: 'text',
        content: responses[Math.floor(Math.random() * responses.length)],
      };
    }
  }
}

// ─── Starter prompt pill ─────────────────────────────────────────────────────

function StarterPill({ text, onClick }: { text: string; onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="text-left px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:border-violet-300 hover:bg-violet-50 text-sm text-slate-600 hover:text-violet-700 transition-all shadow-sm flex items-center gap-2"
    >
      <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
      {text}
    </motion.button>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AITutor() {
  const [activeMode, setActiveMode] = useState<ConversationMode>('free_chat');
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<RoleplayScenario | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formId = useId();

  const modeConfig = MODES.find((m) => m.id === activeMode)!;

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (text?: string) => {
    const content = (text ?? inputText).trim();
    if (!content) return;

    const userMsg: ChatMessageType = {
      id: makeId(),
      role: 'user',
      content,
      type: 'text',
      created_at: isoNow(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI response delay
    const delay = 900 + Math.random() * 800;
    setTimeout(() => {
      const response = getMockResponse(activeMode, content);
      const aiMsg: ChatMessageType = {
        id: makeId(),
        ...response,
        created_at: isoNow(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, delay);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearConversation = () => {
    setMessages([]);
    setIsTyping(false);
  };

  const switchMode = (mode: ConversationMode) => {
    setActiveMode(mode);
    clearConversation();
    setSelectedScenario(null);
    textareaRef.current?.focus();
  };

  const startRoleplay = (scenario: RoleplayScenario) => {
    setSelectedScenario(scenario);
    const label = ROLEPLAY_SCENARIOS.find((s) => s.id === scenario)?.label ?? 'scenario';
    sendMessage(`Start a ${label} roleplay with me`);
  };

  const showWelcome = messages.length === 0;
  const charCount = inputText.length;
  const MAX_CHARS = 2000;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* ── Sidebar ─────────────────────────────────────── */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="w-72 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col overflow-hidden"
          >
            {/* Logo */}
            <div className="p-5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-slate-800 leading-none">EnglishAI</h1>
                  <p className="text-xs text-slate-400 mt-0.5">AI Tutor</p>
                </div>
              </div>
            </div>

            {/* Mode list */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-2 mb-2">
                Conversation Mode
              </p>
              {MODES.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => switchMode(mode.id)}
                  className={cn(
                    'w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-all',
                    activeMode === mode.id
                      ? 'bg-violet-50 border border-violet-200 text-violet-700'
                      : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                  )}
                >
                  <span className={cn('mt-0.5', activeMode === mode.id ? 'text-violet-600' : 'text-slate-400')}>
                    {mode.icon}
                  </span>
                  <div>
                    <div className="text-sm font-semibold leading-none mb-0.5">{mode.label}</div>
                    <div className="text-xs text-slate-400 leading-snug">{mode.description}</div>
                  </div>
                </button>
              ))}

              {/* Roleplay scenarios */}
              <AnimatePresence>
                {activeMode === 'roleplay' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-2 mt-4 mb-2">
                      Scenarios
                    </p>
                    <div className="space-y-1">
                      {ROLEPLAY_SCENARIOS.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => startRoleplay(s.id)}
                          className={cn(
                            'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all text-sm',
                            selectedScenario === s.id
                              ? 'bg-orange-50 border border-orange-200 text-orange-700'
                              : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                          )}
                        >
                          <span className="text-base">{s.emoji}</span>
                          <span className="font-medium">{s.label}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Clear button */}
            {messages.length > 0 && (
              <div className="p-3 border-t border-slate-100">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearConversation}
                  className="w-full text-slate-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-2" />
                  Clear conversation
                </Button>
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Main chat area ───────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-5 py-3.5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <ChevronRight className={cn('w-4 h-4 transition-transform', sidebarOpen && 'rotate-180')} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-slate-800">{modeConfig.label}</h2>
                <Badge
                  variant="outline"
                  className={cn('text-[10px] px-2 py-0.5', modeConfig.color)}
                >
                  Active
                </Badge>
              </div>
              <p className="text-xs text-slate-400">{modeConfig.description}</p>
            </div>
          </div>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearConversation}
              className="text-slate-400 hover:text-red-500 hover:bg-red-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </header>

        {/* Messages area */}
        <ScrollArea className="flex-1 px-4 py-4">
          {showWelcome ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto flex flex-col items-center gap-8 pt-12"
            >
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    {activeMode === 'free_chat' && 'Start a Conversation'}
                    {activeMode === 'grammar_check' && 'Check Your Grammar'}
                    {activeMode === 'vocabulary_help' && 'Explore Vocabulary'}
                    {activeMode === 'roleplay' && 'Choose a Roleplay Scenario'}
                    {activeMode === 'ielts_speaking' && 'IELTS Speaking Practice'}
                  </h2>
                  <p className="text-slate-500 mt-1 text-sm max-w-sm">
                    {modeConfig.description}. Pick a suggestion below or type your own message.
                  </p>
                </div>
              </div>

              {/* Roleplay scenario grid */}
              {activeMode === 'roleplay' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
                  {ROLEPLAY_SCENARIOS.map((s) => (
                    <motion.button
                      key={s.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => startRoleplay(s.id)}
                      className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50 transition-all shadow-sm text-center"
                    >
                      <span className="text-3xl">{s.emoji}</span>
                      <span className="font-semibold text-sm text-slate-700">{s.label}</span>
                      <span className="text-xs text-slate-400 leading-snug">{s.description}</span>
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Starter prompts */}
              {activeMode !== 'roleplay' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                  {modeConfig.starters.map((s, i) => (
                    <StarterPill key={i} text={s} onClick={() => sendMessage(s)} />
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-4 pb-4">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              <AnimatePresence>
                {isTyping && (
                  <motion.div key="typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <TypingIndicator />
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={bottomRef} />
            </div>
          )}
        </ScrollArea>

        {/* Input area */}
        <div className="bg-white border-t border-slate-200 p-4 flex-shrink-0">
          <form
            id={formId}
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="max-w-2xl mx-auto"
          >
            <div className="relative flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-2 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100 transition-all">
              {/* Attach button */}
              <button
                type="button"
                className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-white transition-colors mb-0.5"
                title="Attach file"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              {/* Textarea */}
              <Textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={modeConfig.inputPlaceholder}
                maxLength={MAX_CHARS}
                rows={1}
                className="flex-1 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0 p-1.5 text-sm placeholder:text-slate-400 min-h-[36px] max-h-36"
                style={{ fieldSizing: 'content' } as React.CSSProperties}
              />

              {/* Mic button */}
              <button
                type="button"
                className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-colors mb-0.5"
                title="Voice input"
              >
                <Mic className="w-4 h-4" />
              </button>

              {/* Send button */}
              <Button
                type="submit"
                size="sm"
                disabled={!inputText.trim() || isTyping}
                className="flex-shrink-0 w-9 h-9 rounded-xl p-0 bg-gradient-to-br from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white disabled:opacity-40 shadow-sm mb-0.5"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>

            {/* Footer row */}
            <div className="flex items-center justify-between mt-2 px-1">
              <p className="text-[10px] text-slate-400">
                Enter to send · Shift+Enter for new line
              </p>
              {activeMode === 'grammar_check' && (
                <span className={cn('text-[10px]', charCount > MAX_CHARS * 0.9 ? 'text-red-500' : 'text-slate-400')}>
                  {charCount}/{MAX_CHARS}
                </span>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
