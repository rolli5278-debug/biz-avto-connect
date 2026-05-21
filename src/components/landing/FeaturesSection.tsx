import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Bot, CheckCircle, BookOpen, Mic, Award, CreditCard } from 'lucide-react';

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  gradient: string;
  bgGlow: string;
}

const features: Feature[] = [
  {
    icon: Bot,
    title: 'AI Tutor Chat',
    description:
      'Chat with your AI tutor 24/7. Get instant answers, explanations, and personalized lessons any time of day.',
    color: 'text-purple-400',
    gradient: 'from-purple-500/20 to-violet-500/10',
    bgGlow: 'bg-purple-500/10',
  },
  {
    icon: CheckCircle,
    title: 'Grammar Correction',
    description:
      'Instant grammar fixes with clear explanations. Understand why you were wrong, not just what was wrong.',
    color: 'text-green-400',
    gradient: 'from-green-500/20 to-emerald-500/10',
    bgGlow: 'bg-green-500/10',
  },
  {
    icon: BookOpen,
    title: 'Vocabulary Builder',
    description:
      'Learn 10+ words daily with scientifically proven spaced repetition. Words stick for life, not just for the test.',
    color: 'text-blue-400',
    gradient: 'from-blue-500/20 to-cyan-500/10',
    bgGlow: 'bg-blue-500/10',
  },
  {
    icon: Mic,
    title: 'Speaking Practice',
    description:
      'Practice pronunciation with real-time AI feedback. Sound like a native speaker with guided exercises.',
    color: 'text-orange-400',
    gradient: 'from-orange-500/20 to-amber-500/10',
    bgGlow: 'bg-orange-500/10',
  },
  {
    icon: Award,
    title: 'IELTS Preparation',
    description:
      'Structured IELTS prep with full mock tests, writing task reviews, and speaking simulations.',
    color: 'text-red-400',
    gradient: 'from-red-500/20 to-rose-500/10',
    bgGlow: 'bg-red-500/10',
  },
  {
    icon: CreditCard,
    title: 'Flashcard System',
    description:
      'Smart flashcards that adapt to your learning pace. The system knows exactly when to review each card.',
    color: 'text-teal-400',
    gradient: 'from-teal-500/20 to-cyan-500/10',
    bgGlow: 'bg-teal-500/10',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
  },
};

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const Icon = feature.icon;
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      className="group relative rounded-2xl border border-white/5 bg-[#111118] p-6 cursor-default overflow-hidden"
    >
      {/* Hover gradient border */}
      <div
        className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${feature.gradient}`}
      />
      <div className="absolute inset-[1px] rounded-2xl bg-[#111118] group-hover:bg-[#13131c] transition-colors duration-300" />

      {/* Glow on hover */}
      <motion.div
        className={`absolute top-0 left-0 right-0 h-px ${feature.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
        style={{ background: `linear-gradient(90deg, transparent, currentColor, transparent)` }}
      />

      <div className="relative z-10">
        {/* Icon */}
        <div
          className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${feature.bgGlow} border border-white/5 mb-5 group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className={`w-6 h-6 ${feature.color}`} />
        </div>

        {/* Number badge */}
        <div className="absolute top-0 right-0 w-6 h-6 rounded-full bg-white/5 flex items-center justify-center">
          <span className="text-[10px] text-gray-500 font-medium">{String(index + 1).padStart(2, '0')}</span>
        </div>

        <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-white transition-colors">
          {feature.title}
        </h3>
        <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors">
          {feature.description}
        </p>

        {/* Bottom accent */}
        <div
          className={`mt-5 h-0.5 w-0 group-hover:w-12 bg-gradient-to-r ${feature.gradient} rounded-full transition-all duration-500`}
        />
      </div>
    </motion.div>
  );
}

export default function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="relative py-28 bg-[#0a0a0f] overflow-hidden" ref={ref}>
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] bg-purple-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
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
            Features
          </motion.span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-5 leading-tight">
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Master English
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            One platform with all the tools you need — from daily grammar drills to full IELTS preparation.
          </p>
        </motion.div>

        {/* Feature grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </motion.div>

        {/* Bottom CTA hint */}
        <motion.div
          className="text-center mt-14"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <p className="text-gray-500 text-sm">
            All features available with a free account.{' '}
            <span className="text-purple-400 cursor-pointer hover:text-purple-300 transition-colors underline underline-offset-4">
              See full comparison →
            </span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
