import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Eye, EyeOff, Mail, Lock, User, Globe, CheckCircle,
  Loader2, BookOpen, Brain, Trophy, MessageCircle, Send,
  Sparkles, Zap, Shield,
} from 'lucide-react';
import { toast } from 'sonner';

import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

// ── Schemas ────────────────────────────────────────────────────────────────────

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signUpSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    agreeToTerms: z.boolean().refine((v) => v === true, {
      message: 'You must agree to the Terms of Service',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type SignInValues = z.infer<typeof signInSchema>;
type SignUpValues = z.infer<typeof signUpSchema>;

// ── Sub-components ─────────────────────────────────────────────────────────────

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  error?: string;
}

function PasswordInput({ id, error, className, ...props }: PasswordInputProps) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        id={id}
        type={show ? 'text' : 'password'}
        className={cn('pl-9 pr-10', error && 'border-red-400 focus-visible:ring-red-300', className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShow((p) => !p)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        tabIndex={-1}
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

// ── Language labels ────────────────────────────────────────────────────────────

type Lang = 'en' | 'uz';
const LANG_LABELS: Record<Lang, { label: string; flag: string }> = {
  en: { label: 'English', flag: '🇬🇧' },
  uz: { label: "O'zbek", flag: '🇺🇿' },
};

const I18N: Record<Lang, {
  tagline: string; sub: string; features: { icon: typeof BookOpen; text: string }[];
  signIn: string; signUp: string; email: string; password: string;
  forgot: string; or: string; google: string; telegram: string;
  noAccount: string; haveAccount: string;
  name: string; confirmPwd: string; terms: string; termsLink: string;
  welcomeBack: string; welcomeSub: string; createAccount: string; createSub: string;
}> = {
  en: {
    tagline: 'Learn English with AI',
    sub: 'Your intelligent English tutor, available 24/7',
    features: [
      { icon: Sparkles, text: 'Personalised lessons powered by AI' },
      { icon: MessageCircle, text: 'Practice speaking with instant feedback' },
      { icon: Trophy, text: 'Track progress with daily streak & XP' },
    ],
    signIn: 'Sign In', signUp: 'Sign Up',
    email: 'Email address', password: 'Password',
    forgot: 'Forgot password?', or: 'or continue with',
    google: 'Continue with Google', telegram: 'Continue with Telegram',
    noAccount: "Don't have an account? Sign up",
    haveAccount: 'Already have an account? Sign in',
    name: 'Full name', confirmPwd: 'Confirm password',
    terms: 'I agree to the', termsLink: 'Terms of Service',
    welcomeBack: 'Welcome back',
    welcomeSub: 'Sign in to continue your learning journey',
    createAccount: 'Create account',
    createSub: 'Start your English learning journey today',
  },
  uz: {
    tagline: "AI bilan ingliz tili o'rganish",
    sub: "Aqlli ingliz tili o'qituvchingiz, 24/7 mavjud",
    features: [
      { icon: Sparkles, text: "AI yordamida shaxsiy darslar" },
      { icon: MessageCircle, text: "Tezkor fikr-mulohaza bilan gapirish amaliyoti" },
      { icon: Trophy, text: "Kunlik seriya va XP bilan rivojlanishni kuzatish" },
    ],
    signIn: 'Kirish', signUp: "Ro'yxatdan o'tish",
    email: 'Elektron pochta', password: 'Parol',
    forgot: 'Parolni unutdingizmi?', or: 'yoki davom eting',
    google: 'Google bilan davom etish', telegram: 'Telegram bilan davom etish',
    noAccount: "Hisobingiz yo'qmi? Ro'yxatdan o'ting",
    haveAccount: 'Hisobingiz bormi? Kiring',
    name: "To'liq ism", confirmPwd: 'Parolni tasdiqlang',
    terms: 'Men rozilik beraman', termsLink: 'Foydalanish shartlari',
    welcomeBack: 'Xush kelibsiz',
    welcomeSub: "O'rganish sayohatingizni davom ettirish uchun kiring",
    createAccount: 'Hisob yarating',
    createSub: "Bugun ingliz tilini o'rganishni boshlang",
  },
};

// ── Google SVG ─────────────────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

// ── Social Buttons ─────────────────────────────────────────────────────────────

function SocialButtons({ onGoogle, onTelegram, googleLabel, telegramLabel }: {
  onGoogle: () => void;
  onTelegram: () => void;
  googleLabel: string;
  telegramLabel: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Button variant="outline" type="button" onClick={onGoogle}
        className="gap-2 h-10 text-sm font-medium hover:bg-red-50/50 hover:border-red-200 dark:hover:bg-red-950/20 transition-colors">
        <GoogleIcon />
        Google
      </Button>
      <Button variant="outline" type="button" onClick={onTelegram}
        className="gap-2 h-10 text-sm font-medium hover:bg-sky-50/50 hover:border-sky-200 dark:hover:bg-sky-950/20 transition-colors">
        <Send className="h-4 w-4 text-sky-500" />
        Telegram
      </Button>
    </div>
  );
}

// ── Divider ────────────────────────────────────────────────────────────────────

function OrDivider({ label }: { label: string }) {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-border/60" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-background px-3 text-muted-foreground/70 font-medium tracking-wider">{label}</span>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function Auth() {
  const [lang, setLang] = useState<Lang>('en');
  const [activeTab, setActiveTab] = useState<'sign-in' | 'sign-up'>('sign-in');
  const navigate = useNavigate();
  const t = I18N[lang];

  // Sign-in form
  const {
    register: siReg,
    handleSubmit: siHandle,
    formState: { errors: siErrors, isSubmitting: siLoading },
  } = useForm<SignInValues>({ resolver: zodResolver(signInSchema) });

  // Sign-up form
  const {
    register: suReg,
    handleSubmit: suHandle,
    watch: suWatch,
    setValue: suSetValue,
    formState: { errors: suErrors, isSubmitting: suLoading },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { agreeToTerms: false },
  });
  const agreeToTerms = suWatch('agreeToTerms');

  const onSignIn = async (data: SignInValues) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Welcome back! Ready to learn?');
      navigate('/dashboard');
    }
  };

  const onSignUp = async (data: SignUpValues) => {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { name: data.name } },
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Account created! Check your email to confirm.');
      navigate('/dashboard');
    }
  };

  const handleGoogleAuth = () => toast.info('Google OAuth coming soon!');
  const handleTelegramAuth = () => toast.info('Telegram login coming soon!');

  return (
    <div className="min-h-screen flex bg-background">

      {/* ── Left panel ── */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col justify-between p-12 xl:p-16"
        style={{
          background: 'linear-gradient(145deg, #0f172a 0%, #1e1b4b 30%, #1e3a5f 65%, #0c4a6e 100%)',
        }}
      >
        {/* Decorative orbs */}
        <div className="absolute top-[-100px] left-[-100px] w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
        <div className="absolute bottom-[-80px] right-[-80px] w-[500px] h-[500px] rounded-full opacity-15 blur-3xl"
          style={{ background: 'radial-gradient(circle, #0ea5e9, transparent)' }} />
        <div className="absolute top-1/2 right-0 w-64 h-64 rounded-full opacity-10 blur-2xl"
          style={{ background: 'radial-gradient(circle, #a78bfa, transparent)' }} />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Logo top-left */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-lg leading-none block">LearnAI</span>
            <span className="text-white/40 text-xs">English Platform</span>
          </div>
        </div>

        {/* Middle content */}
        <div className="relative z-10 space-y-8 max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-6 backdrop-blur-sm">
              <Brain className="h-4 w-4 text-indigo-300" />
              <span className="text-indigo-200 text-sm font-medium">AI-Powered Learning</span>
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-3 tracking-tight">
              {t.tagline}
            </h1>
            <p className="text-blue-200/70 text-lg leading-relaxed">{t.sub}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="space-y-4"
          >
            {t.features.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                  className="flex items-start gap-3 group"
                >
                  <div className="mt-0.5 flex-shrink-0 w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center group-hover:bg-indigo-500/30 transition-colors">
                    <Icon className="h-4 w-4 text-indigo-300" />
                  </div>
                  <p className="text-white/80 leading-snug pt-1.5">{feat.text}</p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Stat chips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="flex gap-3 flex-wrap"
          >
            {[
              { label: 'Active learners', value: '50K+', icon: '👥' },
              { label: 'Lessons', value: '500+', icon: '📚' },
              { label: 'Avg. rating', value: '4.9★', icon: '⭐' },
            ].map((s) => (
              <div
                key={s.label}
                className="px-4 py-3 rounded-2xl bg-white/8 border border-white/12 backdrop-blur-sm hover:bg-white/12 transition-colors"
              >
                <div className="text-white font-bold text-lg tabular-nums">{s.value}</div>
                <div className="text-white/50 text-xs mt-0.5">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Bottom: trust badges + quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="relative z-10 space-y-3"
        >
          <div className="flex items-center gap-3 flex-wrap">
            {[
              { icon: Shield, text: 'Secure & private' },
              { icon: Zap, text: 'Fast learning' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 text-white/40 text-xs">
                <Icon className="h-3 w-3" />
                {text}
              </div>
            ))}
          </div>
          <p className="text-white/25 text-xs italic">
            "The limits of my language mean the limits of my world." — Wittgenstein
          </p>
        </motion.div>
      </motion.div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 bg-background relative overflow-y-auto">

        {/* Language selector — top right */}
        <div className="absolute top-5 right-5 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 h-9 text-sm">
                <Globe className="h-3.5 w-3.5" />
                <span>{LANG_LABELS[lang].flag} {LANG_LABELS[lang].label}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              {(Object.keys(LANG_LABELS) as Lang[]).map((l) => (
                <DropdownMenuItem
                  key={l}
                  onClick={() => setLang(l)}
                  className="cursor-pointer"
                >
                  <span className="mr-2">{LANG_LABELS[l].flag}</span>
                  {LANG_LABELS[l].label}
                  {lang === l && <CheckCircle className="ml-auto h-3.5 w-3.5 text-primary" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile logo */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:hidden flex items-center gap-2.5 mb-8"
        >
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-md">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <span className="font-bold text-xl leading-none block">LearnAI</span>
            <span className="text-muted-foreground text-xs">English Platform</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-[420px]"
        >
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as 'sign-in' | 'sign-up')}
          >
            <TabsList className="grid w-full grid-cols-2 mb-8 h-11">
              <TabsTrigger value="sign-in" className="text-sm font-medium">
                {t.signIn}
              </TabsTrigger>
              <TabsTrigger value="sign-up" className="text-sm font-medium">
                {t.signUp}
              </TabsTrigger>
            </TabsList>

            {/* ── Sign In ── */}
            <TabsContent value="sign-in" className="mt-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`sign-in-${lang}`}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.22 }}
                  className="space-y-5"
                >
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">{t.welcomeBack}</h2>
                    <p className="text-muted-foreground text-sm mt-1">{t.welcomeSub}</p>
                  </div>

                  <form onSubmit={siHandle(onSignIn)} className="space-y-4" noValidate>
                    {/* Email */}
                    <div className="space-y-1.5">
                      <Label htmlFor="si-email" className="text-sm font-medium">{t.email}</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                          id="si-email"
                          type="email"
                          className={cn('pl-9 h-10', siErrors.email && 'border-red-400 focus-visible:ring-red-300')}
                          placeholder="you@example.com"
                          autoComplete="email"
                          {...siReg('email')}
                        />
                      </div>
                      {siErrors.email && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-500 text-xs flex items-center gap-1"
                        >
                          {siErrors.email.message}
                        </motion.p>
                      )}
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="si-password" className="text-sm font-medium">{t.password}</Label>
                        <button
                          type="button"
                          className="text-xs text-primary hover:underline font-medium"
                          onClick={() => toast.info('Password reset email coming soon!')}
                        >
                          {t.forgot}
                        </button>
                      </div>
                      <PasswordInput
                        id="si-password"
                        placeholder="••••••••"
                        error={siErrors.password?.message}
                        autoComplete="current-password"
                        className="h-10"
                        {...siReg('password')}
                      />
                      {siErrors.password && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-500 text-xs"
                        >
                          {siErrors.password.message}
                        </motion.p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-10 font-semibold"
                      disabled={siLoading}
                    >
                      {siLoading ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</>
                      ) : t.signIn}
                    </Button>
                  </form>

                  <OrDivider label={t.or} />

                  <SocialButtons
                    onGoogle={handleGoogleAuth}
                    onTelegram={handleTelegramAuth}
                    googleLabel={t.google}
                    telegramLabel={t.telegram}
                  />

                  <p className="text-center text-sm text-muted-foreground pt-1">
                    <button
                      type="button"
                      className="text-primary hover:underline font-medium"
                      onClick={() => setActiveTab('sign-up')}
                    >
                      {t.noAccount}
                    </button>
                  </p>
                </motion.div>
              </AnimatePresence>
            </TabsContent>

            {/* ── Sign Up ── */}
            <TabsContent value="sign-up" className="mt-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`sign-up-${lang}`}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.22 }}
                  className="space-y-5"
                >
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">{t.createAccount}</h2>
                    <p className="text-muted-foreground text-sm mt-1">{t.createSub}</p>
                  </div>

                  <form onSubmit={suHandle(onSignUp)} className="space-y-3.5" noValidate>
                    {/* Name */}
                    <div className="space-y-1.5">
                      <Label htmlFor="su-name" className="text-sm font-medium">{t.name}</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                          id="su-name"
                          className={cn('pl-9 h-10', suErrors.name && 'border-red-400')}
                          placeholder="Alisher Navoi"
                          autoComplete="name"
                          {...suReg('name')}
                        />
                      </div>
                      {suErrors.name && (
                        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                          className="text-red-500 text-xs">{suErrors.name.message}</motion.p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <Label htmlFor="su-email" className="text-sm font-medium">{t.email}</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                          id="su-email"
                          type="email"
                          className={cn('pl-9 h-10', suErrors.email && 'border-red-400')}
                          placeholder="you@example.com"
                          autoComplete="email"
                          {...suReg('email')}
                        />
                      </div>
                      {suErrors.email && (
                        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                          className="text-red-500 text-xs">{suErrors.email.message}</motion.p>
                      )}
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                      <Label htmlFor="su-password" className="text-sm font-medium">{t.password}</Label>
                      <PasswordInput
                        id="su-password"
                        placeholder="Min. 8 characters"
                        error={suErrors.password?.message}
                        autoComplete="new-password"
                        className="h-10"
                        {...suReg('password')}
                      />
                      {suErrors.password && (
                        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                          className="text-red-500 text-xs">{suErrors.password.message}</motion.p>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1.5">
                      <Label htmlFor="su-confirm" className="text-sm font-medium">{t.confirmPwd}</Label>
                      <PasswordInput
                        id="su-confirm"
                        placeholder="Repeat password"
                        error={suErrors.confirmPassword?.message}
                        autoComplete="new-password"
                        className="h-10"
                        {...suReg('confirmPassword')}
                      />
                      {suErrors.confirmPassword && (
                        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                          className="text-red-500 text-xs">{suErrors.confirmPassword.message}</motion.p>
                      )}
                    </div>

                    {/* Terms */}
                    <div className="space-y-1">
                      <div className="flex items-start gap-2.5">
                        <Checkbox
                          id="terms"
                          checked={agreeToTerms}
                          onCheckedChange={(checked) =>
                            suSetValue('agreeToTerms', checked === true, { shouldValidate: true })
                          }
                          className="mt-0.5 flex-shrink-0"
                        />
                        <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer font-normal text-muted-foreground">
                          {t.terms}{' '}
                          <button
                            type="button"
                            className="text-primary hover:underline font-medium"
                            onClick={() => toast.info('Terms of Service — coming soon!')}
                          >
                            {t.termsLink}
                          </button>
                        </Label>
                      </div>
                      {suErrors.agreeToTerms && (
                        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                          className="text-red-500 text-xs pl-6">{suErrors.agreeToTerms.message}</motion.p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-10 font-semibold"
                      disabled={suLoading}
                    >
                      {suLoading ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Creating account…</>
                      ) : t.signUp}
                    </Button>
                  </form>

                  <OrDivider label={t.or} />

                  <SocialButtons
                    onGoogle={handleGoogleAuth}
                    onTelegram={handleTelegramAuth}
                    googleLabel={t.google}
                    telegramLabel={t.telegram}
                  />

                  <p className="text-center text-sm text-muted-foreground pt-1">
                    <button
                      type="button"
                      className="text-primary hover:underline font-medium"
                      onClick={() => setActiveTab('sign-in')}
                    >
                      {t.haveAccount}
                    </button>
                  </p>
                </motion.div>
              </AnimatePresence>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
