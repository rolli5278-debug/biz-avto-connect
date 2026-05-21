import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Crown, Sparkles, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

const PLANS = [
  {
    name: 'Free',
    slug: 'free',
    icon: Sparkles,
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: 'Perfect for getting started',
    color: 'from-gray-400 to-slate-500',
    features: [
      '5 lessons per day',
      '10 AI chat messages/day',
      'Basic vocabulary (500 words)',
      'Streak tracking',
      'Basic progress tracking',
      'Leaderboard access',
    ],
    missing: ['Speaking practice', 'IELTS prep', 'Pronunciation scoring', 'Unlimited AI', 'Offline access'],
    cta: 'Get Started Free',
    ctaVariant: 'outline' as const,
  },
  {
    name: 'Pro',
    slug: 'pro',
    icon: Zap,
    monthlyPrice: 9.99,
    yearlyPrice: 7.99,
    description: 'Most popular for serious learners',
    color: 'from-violet-600 to-blue-600',
    popular: true,
    features: [
      'Unlimited lessons',
      'Unlimited AI chat',
      'Full vocabulary (5,000+ words)',
      'Speaking practice + feedback',
      'IELTS preparation modules',
      'Advanced progress analytics',
      'Pronunciation feedback',
      'Priority support',
    ],
    missing: ['Pronunciation scoring', 'Custom AI learning path', 'Offline access'],
    cta: 'Start Pro Free Trial',
    ctaVariant: 'default' as const,
  },
  {
    name: 'Premium',
    slug: 'premium',
    icon: Crown,
    monthlyPrice: 19.99,
    yearlyPrice: 15.99,
    description: 'The ultimate English mastery',
    color: 'from-amber-500 to-orange-500',
    features: [
      'Everything in Pro',
      'AI pronunciation scoring',
      'Custom AI learning path',
      'Offline access',
      'Custom flashcard decks',
      'Live group sessions',
      'Certificate of completion',
      '1-on-1 AI tutor sessions',
    ],
    missing: [],
    cta: 'Go Premium',
    ctaVariant: 'default' as const,
  },
];

const COMPARISON_FEATURES = [
  { feature: 'Daily lessons',          free: '5/day',     pro: 'Unlimited', premium: 'Unlimited' },
  { feature: 'AI chat messages',        free: '10/day',    pro: 'Unlimited', premium: 'Unlimited' },
  { feature: 'Vocabulary words',        free: '500',       pro: '5,000+',    premium: '5,000+' },
  { feature: 'Speaking practice',       free: false,       pro: true,        premium: true },
  { feature: 'IELTS preparation',       free: false,       pro: true,        premium: true },
  { feature: 'Pronunciation scoring',   free: false,       pro: false,       premium: true },
  { feature: 'Custom learning path',    free: false,       pro: false,       premium: true },
  { feature: 'Offline access',          free: false,       pro: false,       premium: true },
  { feature: 'Progress analytics',      free: 'Basic',     pro: 'Advanced',  premium: 'Advanced' },
  { feature: 'Certificate',             free: false,       pro: false,       premium: true },
];

const FAQS = [
  { q: 'Can I cancel my subscription anytime?', a: 'Yes, you can cancel at any time. Your access continues until the end of the billing period.' },
  { q: 'Is there a free trial for Pro/Premium?', a: 'Yes! Pro comes with a 7-day free trial. No credit card required to start.' },
  { q: 'What payment methods do you accept?', a: 'We accept Visa, Mastercard, Payme (Click), and bank transfers for users in Uzbekistan.' },
  { q: 'Will I lose my progress if I downgrade?', a: 'No. Your streak, XP, and vocabulary progress are always saved regardless of your plan.' },
  { q: 'Is the content available in Uzbek?', a: 'Yes! All vocabulary includes Uzbek translations, and AI explanations can be requested in Uzbek.' },
  { q: 'How is the AI tutor different from ChatGPT?', a: 'Our AI tutor is specialized for English learning — it understands your level, tracks your mistakes, and provides structured lessons.' },
];

export default function Pricing() {
  const [yearly, setYearly] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Simple nav */}
      <nav className="border-b border-border/50 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <div className="flex items-center gap-1.5 font-bold text-lg">
          <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-white text-sm">E</span>
          EnglishAI
        </div>
        <Link to="/auth">
          <Button size="sm" variant="outline">Sign In</Button>
        </Link>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-16 space-y-20">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
          <Badge className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">Transparent Pricing</Badge>
          <h1 className="text-4xl sm:text-5xl font-black">
            Choose Your<br />
            <span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">Learning Plan</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Start free, upgrade anytime. All plans include access to our AI-powered English learning platform.
          </p>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <span className={cn('text-sm', !yearly && 'font-semibold')}>Monthly</span>
            <button onClick={() => setYearly(y => !y)}
              className={cn('relative w-12 h-6 rounded-full transition-colors', yearly ? 'bg-violet-600' : 'bg-muted')}>
              <motion.div animate={{ x: yearly ? 24 : 2 }} className="absolute top-1 w-4 h-4 bg-white rounded-full shadow" />
            </button>
            <span className={cn('text-sm', yearly && 'font-semibold')}>
              Yearly <Badge className="ml-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs">Save 20%</Badge>
            </span>
          </div>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid sm:grid-cols-3 gap-6">
          {PLANS.map((plan, i) => {
            const price = yearly ? plan.yearlyPrice : plan.monthlyPrice;
            const Icon = plan.icon;
            return (
              <motion.div key={plan.slug} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className={cn('h-full relative', plan.popular && 'border-2 border-violet-500 shadow-xl shadow-violet-500/10')}>
                  {plan.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-violet-600 to-blue-600 text-white px-4">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader className="pb-4 pt-6">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-3`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="font-bold text-xl">{plan.name}</div>
                    <div className="text-muted-foreground text-sm">{plan.description}</div>
                    <div className="mt-3">
                      {price === 0 ? (
                        <span className="text-4xl font-black">Free</span>
                      ) : (
                        <>
                          <span className="text-4xl font-black">${price}</span>
                          <span className="text-muted-foreground text-sm">/mo{yearly && ' (billed yearly)'}</span>
                        </>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      className={cn('w-full', plan.popular ? 'bg-gradient-to-r from-violet-600 to-blue-600 hover:opacity-90 text-white' : '')}
                      variant={plan.popular ? 'default' : 'outline'}
                      asChild
                    >
                      <Link to="/auth">{plan.cta}</Link>
                    </Button>
                    <div className="space-y-2">
                      {plan.features.map(f => (
                        <div key={f} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> {f}
                        </div>
                      ))}
                      {plan.missing.map(f => (
                        <div key={f} className="flex items-start gap-2 text-sm text-muted-foreground line-through">
                          <div className="w-4 h-4 shrink-0 mt-0.5 flex items-center justify-center text-muted-foreground/40">—</div> {f}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Feature comparison table */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="space-y-4">
          <h2 className="text-2xl font-bold text-center">Full Feature Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 pr-4 font-semibold">Feature</th>
                  <th className="text-center py-3 px-4 font-semibold">Free</th>
                  <th className="text-center py-3 px-4 font-semibold text-violet-600">Pro</th>
                  <th className="text-center py-3 px-4 font-semibold text-amber-600">Premium</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {COMPARISON_FEATURES.map(row => (
                  <tr key={row.feature} className="hover:bg-muted/30">
                    <td className="py-3 pr-4 text-muted-foreground">{row.feature}</td>
                    {(['free', 'pro', 'premium'] as const).map(p => (
                      <td key={p} className="py-3 px-4 text-center">
                        {typeof row[p] === 'boolean'
                          ? row[p] ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <span className="text-muted-foreground/40">—</span>
                          : <span className={p === 'free' ? 'text-muted-foreground' : 'font-medium'}>{String(row[p])}</span>
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Payment methods */}
        <div className="text-center space-y-3">
          <p className="text-sm text-muted-foreground">Secure payment via</p>
          <div className="flex items-center justify-center gap-4 text-muted-foreground/60 font-mono text-sm">
            {['VISA', 'Mastercard', 'Payme', 'Click'].map(p => (
              <div key={p} className="border border-border rounded-md px-3 py-1.5 text-xs font-semibold">{p}</div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">🔒 30-day money-back guarantee · Cancel anytime · No hidden fees</p>
        </div>

        {/* FAQ */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="max-w-2xl mx-auto space-y-3">
          <h2 className="text-2xl font-bold text-center mb-6">Frequently Asked Questions</h2>
          {FAQS.map((faq, i) => (
            <Collapsible key={i} open={openFAQ === i} onOpenChange={open => setOpenFAQ(open ? i : null)}>
              <CollapsibleTrigger className="w-full flex items-center justify-between p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors text-left">
                <span className="font-medium text-sm">{faq.q}</span>
                {openFAQ === i ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 pb-4 text-sm text-muted-foreground">{faq.a}</CollapsibleContent>
            </Collapsible>
          ))}
        </motion.div>

        {/* Final CTA */}
        <div className="text-center bg-gradient-to-r from-violet-600 to-blue-600 rounded-3xl p-12 text-white space-y-4">
          <h2 className="text-3xl font-black">Ready to Master English?</h2>
          <p className="opacity-90">Join 50,000+ learners. Start free — upgrade when you're ready.</p>
          <Button size="lg" className="bg-white text-violet-700 hover:bg-white/90 font-bold px-8 mt-2" asChild>
            <Link to="/auth">Start Free Today</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
