import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { UserPlus, Zap, Map, TrendingUp } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: UserPlus,
    title: 'Create Your Account',
    description: 'Sign up free in 30 seconds. No credit card required. Start your learning journey instantly.',
    color: 'text-purple-400',
    glow: 'bg-purple-500/10 border-purple-500/20',
    iconGlow: 'shadow-purple-500/30',
  },
  {
    number: '02',
    icon: Zap,
    title: 'Take Level Assessment',
    description: 'Our AI determines your current English level in under 5 minutes with an adaptive placement test.',
    color: 'text-blue-400',
    glow: 'bg-blue-500/10 border-blue-500/20',
    iconGlow: 'shadow-blue-500/30',
  },
  {
    number: '03',
    icon: Map,
    title: 'Get Personalized Plan',
    description: 'Receive a custom curriculum built just for you — your goals, schedule, and learning style.',
    color: 'text-emerald-400',
    glow: 'bg-emerald-500/10 border-emerald-500/20',
    iconGlow: 'shadow-emerald-500/30',
  },
  {
    number: '04',
    icon: TrendingUp,
    title: 'Track Your Progress',
    description: 'See real improvements every day with detailed analytics, streaks, and milestone achievements.',
    color: 'text-amber-400',
    glow: 'bg-amber-500/10 border-amber-500/20',
    iconGlow: 'shadow-amber-500/30',
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const stepVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export default function HowItWorksSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="relative py-28 bg-[#0d0d14] overflow-hidden" ref={ref}>
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <motion.span
            className="inline-block text-purple-400 text-sm font-semibold tracking-widest uppercase mb-4"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            How It Works
          </motion.span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-5 leading-tight">
            How{' '}
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              EnglishAI
            </span>{' '}
            Works
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Getting started takes less than a minute. Your personalized learning plan awaits.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Steps list */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="space-y-6"
          >
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  variants={stepVariants}
                  className={`group flex gap-5 p-5 rounded-2xl border ${step.glow} hover:bg-white/[0.03] transition-all duration-300 cursor-default`}
                >
                  {/* Icon */}
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-xl ${step.glow} border flex items-center justify-center shadow-lg ${step.iconGlow}`}
                  >
                    <Icon className={`w-6 h-6 ${step.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="text-xs font-bold text-gray-600 tracking-widest">{step.number}</span>
                      <h3 className={`text-white font-semibold text-base group-hover:${step.color} transition-colors`}>
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
                  </div>

                  {/* Connector line (except last) */}
                  {index < steps.length - 1 && (
                    <div className="absolute left-[2.85rem] mt-16 w-px h-6 bg-gradient-to-b from-white/10 to-transparent hidden lg:block" />
                  )}
                </motion.div>
              );
            })}
          </motion.div>

          {/* Visual: Phone mockup / progress card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative flex items-center justify-center"
          >
            <div className="relative w-full max-w-xs">
              {/* Main card */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="bg-[#13131e] border border-white/10 rounded-3xl p-6 shadow-2xl shadow-purple-500/10"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Your Progress</p>
                    <p className="text-white font-bold text-xl">Week 4 of 12</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                </div>

                {/* Progress bars */}
                {[
                  { label: 'Grammar', value: 78, color: 'from-purple-500 to-violet-400' },
                  { label: 'Vocabulary', value: 65, color: 'from-blue-500 to-cyan-400' },
                  { label: 'Speaking', value: 52, color: 'from-emerald-500 to-green-400' },
                  { label: 'IELTS Prep', value: 40, color: 'from-amber-500 to-orange-400' },
                ].map((item) => (
                  <div key={item.label} className="mb-4">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-gray-400">{item.label}</span>
                      <span className="text-gray-300 font-medium">{item.value}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full bg-gradient-to-r ${item.color}`}
                        initial={{ width: 0 }}
                        animate={inView ? { width: `${item.value}%` } : { width: 0 }}
                        transition={{ duration: 1.2, delay: 0.6, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                ))}

                {/* Level badge */}
                <div className="mt-5 pt-5 border-t border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-xs">Current Level</p>
                    <p className="text-white font-bold mt-0.5">B2 Upper-Intermediate</p>
                  </div>
                  <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-xl px-3 py-1.5">
                    <p className="text-purple-300 text-xs font-semibold">+340 XP this week</p>
                  </div>
                </div>
              </motion.div>

              {/* Floating achievement */}
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute -top-5 -right-5 bg-[#1a1a28] border border-white/10 rounded-2xl px-4 py-3 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">🎯</span>
                  <div>
                    <p className="text-white text-xs font-semibold">Goal: IELTS 7.0</p>
                    <p className="text-gray-500 text-[10px]">On track — 8 weeks left</p>
                  </div>
                </div>
              </motion.div>

              {/* Floating streak */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute -bottom-5 -left-5 bg-[#1a1a28] border border-white/10 rounded-2xl px-4 py-3 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">🔥</span>
                  <div>
                    <p className="text-white text-xs font-semibold">21-Day Streak</p>
                    <p className="text-gray-500 text-[10px]">Consistency is key!</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
