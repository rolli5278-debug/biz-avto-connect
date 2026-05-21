import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CTASection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const navigate = useNavigate();

  return (
    <section className="relative py-28 overflow-hidden" ref={ref}>
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 via-indigo-900/80 to-blue-900/90" />

      {/* Deep dark base */}
      <div className="absolute inset-0 bg-[#080810] opacity-50" />

      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-10 left-10 w-[400px] h-[400px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] rounded-full"
          style={{
            background: 'radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 70%)',
          }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />

        {/* Floating orbs */}
        {[
          { x: '15%', y: '20%', size: 60, delay: 0 },
          { x: '80%', y: '15%', size: 40, delay: 1 },
          { x: '90%', y: '70%', size: 80, delay: 2 },
          { x: '10%', y: '80%', size: 50, delay: 1.5 },
          { x: '50%', y: '10%', size: 30, delay: 0.5 },
        ].map((orb, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-white/10"
            style={{
              left: orb.x,
              top: orb.y,
              width: orb.size,
              height: orb.size,
              background: 'rgba(255,255,255,0.03)',
            }}
            animate={{
              y: [-10, 10, -10],
              x: [-5, 5, -5],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              delay: orb.delay,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="inline-flex mb-8"
        >
          <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            <span className="text-purple-200 text-sm font-medium">No credit card required</span>
          </div>
        </motion.div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight mb-6"
        >
          Start Your{' '}
          <span className="bg-gradient-to-r from-purple-300 via-violet-300 to-blue-300 bg-clip-text text-transparent">
            English Journey
          </span>{' '}
          Today
        </motion.h2>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl text-blue-100/80 leading-relaxed mb-10 max-w-2xl mx-auto"
        >
          Join 50,000 learners who are already improving with EnglishAI. Start speaking with confidence in weeks, not years.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/register')}
            className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 rounded-2xl text-white font-bold text-lg overflow-hidden shadow-2xl shadow-purple-500/30"
          >
            {/* Background layers */}
            <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10" />
            <span className="absolute inset-0 border border-white/30 rounded-2xl" />
            <span className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-300" />

            {/* Content */}
            <span className="relative flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-purple-200" />
              Start Free – No Credit Card
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </motion.button>

          {/* Uzbek translation */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-blue-200/60 text-sm font-medium"
          >
            Bugun boshlaing – Kredit karta shart emas
          </motion.p>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-14 flex flex-wrap items-center justify-center gap-6 sm:gap-10"
        >
          {[
            { icon: '🔒', text: 'Secure & Private' },
            { icon: '🌍', text: 'Available in Uzbek' },
            { icon: '📱', text: 'iOS & Android' },
            { icon: '💬', text: '24/7 AI Support' },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-2 text-blue-200/60">
              <span className="text-base">{item.icon}</span>
              <span className="text-sm font-medium">{item.text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
