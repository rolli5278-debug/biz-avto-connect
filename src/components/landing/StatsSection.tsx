import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Users, BookOpen, ThumbsUp, Star } from 'lucide-react';

interface StatItem {
  icon: React.ElementType;
  value: number;
  suffix: string;
  label: string;
  description: string;
  gradient: string;
  iconColor: string;
}

const stats: StatItem[] = [
  {
    icon: Users,
    value: 50000,
    suffix: '+',
    label: 'Active Learners',
    description: 'Students improving their English every day',
    gradient: 'from-purple-400 to-violet-300',
    iconColor: 'text-purple-400',
  },
  {
    icon: BookOpen,
    value: 2000000,
    suffix: '+',
    label: 'Lessons Completed',
    description: 'Practice sessions delivered by AI',
    gradient: 'from-blue-400 to-cyan-300',
    iconColor: 'text-blue-400',
  },
  {
    icon: ThumbsUp,
    value: 95,
    suffix: '%',
    label: 'Satisfaction Rate',
    description: 'Students recommend us to friends',
    gradient: 'from-emerald-400 to-green-300',
    iconColor: 'text-emerald-400',
  },
  {
    icon: Star,
    value: 4.9,
    suffix: '/5',
    label: 'App Rating',
    description: 'Average rating across all platforms',
    gradient: 'from-amber-400 to-yellow-300',
    iconColor: 'text-amber-400',
  },
];

function formatNumber(val: number, original: number): string {
  if (original >= 1000000) {
    return (val / 1000000).toFixed(1) + 'M';
  }
  if (original >= 1000) {
    return (val / 1000).toFixed(0) + 'K';
  }
  if (Number.isInteger(original)) {
    return Math.round(val).toString();
  }
  return val.toFixed(1);
}

function AnimatedNumber({ value, suffix, inView }: { value: number; suffix: string; inView: boolean }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(eased * value);
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [inView, value]);

  return (
    <span>
      {formatNumber(display, value)}
      {suffix}
    </span>
  );
}

export default function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="relative py-24 overflow-hidden" ref={ref}>
      {/* Dark background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0d0d18] via-[#0f0f1e] to-[#0a0a15]" />

      {/* Glowing orbs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[300px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] bg-blue-600/8 rounded-full blur-[100px] pointer-events-none" />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block text-purple-400 text-sm font-semibold tracking-widest uppercase mb-4">
            By The Numbers
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
            Results That{' '}
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Speak for Themselves
            </span>
          </h2>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                className="group relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 text-center hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300 cursor-default"
              >
                {/* Glow on hover */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-b from-white/[0.03] to-transparent" />

                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/[0.05] border border-white/[0.08] mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>

                {/* Number */}
                <div
                  className={`text-4xl sm:text-5xl font-extrabold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-2 tabular-nums`}
                >
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} inView={inView} />
                </div>

                {/* Label */}
                <p className="text-white font-semibold text-base mb-1">{stat.label}</p>
                <p className="text-gray-500 text-xs leading-relaxed">{stat.description}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-14 text-center"
        >
          <p className="text-gray-600 text-sm">
            Join thousands of Uzbek learners already on their path to fluency
          </p>
        </motion.div>
      </div>
    </section>
  );
}
