import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Check, Zap, Crown, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  icon: React.ElementType;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  features: PlanFeature[];
  cta: string;
  popular: boolean;
  gradient: string;
  iconGradient: string;
  borderColor: string;
  glowColor: string;
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    icon: Zap,
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: 'Perfect for getting started',
    features: [
      { text: 'Basic grammar lessons', included: true },
      { text: '10 AI chat messages/day', included: true },
      { text: 'Basic vocabulary lists', included: true },
      { text: '5 flashcards/day', included: true },
      { text: 'Speaking practice', included: false },
      { text: 'IELTS preparation', included: false },
      { text: 'Personal AI tutor', included: false },
      { text: 'Pronunciation scoring', included: false },
    ],
    cta: 'Get Started Free',
    popular: false,
    gradient: 'from-gray-700 to-gray-600',
    iconGradient: 'from-gray-500 to-gray-400',
    borderColor: 'border-white/[0.08]',
    glowColor: '',
  },
  {
    id: 'pro',
    name: 'Pro',
    icon: Sparkles,
    monthlyPrice: 9.99,
    yearlyPrice: 7.99,
    description: 'Most popular for serious learners',
    features: [
      { text: 'Unlimited lessons', included: true },
      { text: 'Unlimited AI chats', included: true },
      { text: 'Full vocabulary builder', included: true },
      { text: 'Unlimited flashcards', included: true },
      { text: 'Speaking practice', included: true },
      { text: 'IELTS preparation', included: true },
      { text: 'Personal AI tutor', included: false },
      { text: 'Pronunciation scoring', included: false },
    ],
    cta: 'Start Pro Trial',
    popular: true,
    gradient: 'from-purple-600 to-blue-600',
    iconGradient: 'from-purple-400 to-blue-400',
    borderColor: 'border-purple-500/40',
    glowColor: 'shadow-purple-500/20',
  },
  {
    id: 'premium',
    name: 'Premium',
    icon: Crown,
    monthlyPrice: 19.99,
    yearlyPrice: 15.99,
    description: 'For those who want the best',
    features: [
      { text: 'Unlimited lessons', included: true },
      { text: 'Unlimited AI chats', included: true },
      { text: 'Full vocabulary builder', included: true },
      { text: 'Unlimited flashcards', included: true },
      { text: 'Speaking practice', included: true },
      { text: 'IELTS preparation', included: true },
      { text: 'Personal AI tutor', included: true },
      { text: 'Pronunciation scoring', included: true },
    ],
    cta: 'Go Premium',
    popular: false,
    gradient: 'from-amber-500 to-orange-600',
    iconGradient: 'from-amber-400 to-orange-400',
    borderColor: 'border-amber-500/20',
    glowColor: 'shadow-amber-500/10',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.15, ease: [0.25, 0.1, 0.25, 1] },
  }),
};

export default function PricingPreviewSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section className="relative py-28 bg-[#0d0d14] overflow-hidden" ref={ref}>
      {/* Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block text-purple-400 text-sm font-semibold tracking-widest uppercase mb-4">
            Pricing
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-5 leading-tight">
            Simple,{' '}
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Transparent
            </span>{' '}
            Pricing
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
            Start free, upgrade when you're ready. No hidden fees.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 bg-white/[0.04] border border-white/[0.08] rounded-full p-1.5">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                !isYearly
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                isYearly
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Yearly
              <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded-full">
                -20%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan, i) => {
            const Icon = plan.icon;
            const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
            const isFree = plan.monthlyPrice === 0;

            return (
              <motion.div
                key={plan.id}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate={inView ? 'visible' : 'hidden'}
                className={`relative ${plan.popular ? 'md:-mt-4 md:mb-4' : ''}`}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center z-20">
                    <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0 px-4 py-1 text-xs font-semibold shadow-lg shadow-purple-500/30">
                      ✨ Most Popular
                    </Badge>
                  </div>
                )}

                <Card
                  className={`bg-[#12121c] border ${plan.borderColor} rounded-2xl overflow-hidden ${
                    plan.popular ? `shadow-2xl ${plan.glowColor}` : ''
                  } hover:border-white/20 transition-all duration-300 group`}
                >
                  {/* Top gradient bar */}
                  {plan.popular && (
                    <div className={`h-1 w-full bg-gradient-to-r ${plan.gradient}`} />
                  )}

                  <CardHeader className="p-6 pb-4">
                    {/* Icon + Name */}
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.gradient} bg-opacity-20 flex items-center justify-center`}
                        style={{ background: `linear-gradient(135deg, rgba(139,92,246,0.2), rgba(59,130,246,0.2))` }}
                      >
                        <Icon
                          className={`w-5 h-5 bg-gradient-to-r ${plan.iconGradient} bg-clip-text`}
                          style={{ color: plan.popular ? '#a78bfa' : plan.id === 'premium' ? '#fbbf24' : '#9ca3af' }}
                        />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg">{plan.name}</h3>
                        <p className="text-gray-500 text-xs">{plan.description}</p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-1 mb-1">
                      {!isFree && (
                        <span className="text-gray-500 text-lg font-medium">$</span>
                      )}
                      <span
                        className={`text-4xl font-extrabold bg-gradient-to-r ${plan.gradient} bg-clip-text text-transparent`}
                      >
                        {isFree ? 'Free' : price.toFixed(2)}
                      </span>
                      {!isFree && (
                        <span className="text-gray-500 text-sm">/mo</span>
                      )}
                    </div>
                    {!isFree && isYearly && (
                      <p className="text-emerald-400 text-xs font-medium">
                        Billed ${(price * 12).toFixed(0)}/year · Save 20%
                      </p>
                    )}
                    {!isFree && !isYearly && (
                      <p className="text-gray-600 text-xs">
                        or ${plan.yearlyPrice.toFixed(2)}/mo billed yearly
                      </p>
                    )}
                  </CardHeader>

                  <CardContent className="px-6 pb-6">
                    {/* Features */}
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, fi) => (
                        <li key={fi} className="flex items-center gap-3">
                          <div
                            className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                              feature.included
                                ? plan.popular
                                  ? 'bg-purple-500/20'
                                  : 'bg-white/10'
                                : 'bg-transparent'
                            }`}
                          >
                            {feature.included ? (
                              <Check
                                className={`w-2.5 h-2.5 ${
                                  plan.popular
                                    ? 'text-purple-400'
                                    : plan.id === 'premium'
                                    ? 'text-amber-400'
                                    : 'text-gray-400'
                                }`}
                              />
                            ) : (
                              <span className="w-1.5 h-0.5 bg-gray-700 rounded-full" />
                            )}
                          </div>
                          <span
                            className={`text-sm ${
                              feature.included ? 'text-gray-300' : 'text-gray-600 line-through'
                            }`}
                          >
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    {plan.popular ? (
                      <button
                        className={`w-full py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r ${plan.gradient} hover:opacity-90 transition-opacity duration-200 shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50`}
                      >
                        {plan.cta}
                      </button>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full border-white/10 text-gray-300 bg-white/[0.03] hover:bg-white/[0.08] hover:text-white hover:border-white/20 rounded-xl py-5 text-sm font-semibold transition-all duration-200"
                      >
                        {plan.cta}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Footer note */}
        <motion.div
          className="text-center mt-10"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <p className="text-gray-600 text-sm">
            All plans include a 7-day free trial · Cancel anytime · Secure payment
          </p>
        </motion.div>
      </div>
    </section>
  );
}
