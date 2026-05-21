import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Star } from 'lucide-react';

interface Testimonial {
  name: string;
  age: number;
  role: string;
  location: string;
  text: string;
  rating: number;
  initials: string;
  avatarGradient: string;
  highlight: string;
}

const testimonials: Testimonial[] = [
  {
    name: 'Jasur Toshmatov',
    age: 23,
    role: 'University Graduate',
    location: 'Tashkent',
    text: 'I used EnglishAI for 3 months and got IELTS 7.5! The AI tutor explained everything so clearly. I highly recommend it to anyone serious about English.',
    rating: 5,
    initials: 'JT',
    avatarGradient: 'from-purple-500 to-violet-600',
    highlight: 'Got IELTS 7.5 in 3 months!',
  },
  {
    name: 'Malika Yusupova',
    age: 28,
    role: 'English Teacher',
    location: 'Samarkand',
    text: "My speaking improved dramatically after just 6 weeks. The pronunciation feedback is incredibly accurate — better than any app I've tried before.",
    rating: 5,
    initials: 'MY',
    avatarGradient: 'from-pink-500 to-rose-600',
    highlight: 'Speaking improved dramatically',
  },
  {
    name: 'Bobur Karimov',
    age: 19,
    role: 'Student',
    location: 'Fergana',
    text: "Best English app I've ever used. The daily lessons are short but effective. I learn without even feeling like I'm studying. My grades improved at school.",
    rating: 5,
    initials: 'BK',
    avatarGradient: 'from-blue-500 to-cyan-600',
    highlight: 'Best English app I\'ve ever used',
  },
  {
    name: 'Nilufar Rahimova',
    age: 31,
    role: 'School Teacher',
    location: 'Namangan',
    text: 'I recommend EnglishAI to all my students now. The structured curriculum is excellent and the AI feedback actually helps build confidence.',
    rating: 5,
    initials: 'NR',
    avatarGradient: 'from-emerald-500 to-teal-600',
    highlight: 'I recommend it to all my students',
  },
  {
    name: 'Sardor Mirzayev',
    age: 25,
    role: 'IT Professional',
    location: 'Tashkent',
    text: 'Perfect for business English! The vocabulary builder helped me prepare for international meetings. My colleagues noticed my improvement immediately.',
    rating: 5,
    initials: 'SM',
    avatarGradient: 'from-orange-500 to-amber-600',
    highlight: 'Perfect for business English',
  },
  {
    name: 'Zulfiya Nazarova',
    age: 22,
    role: 'University Student',
    location: 'Bukhara',
    text: "The AI tutor is like having a native speaker available 24/7. It corrects me kindly and explains the 'why' behind grammar rules. Absolutely love it!",
    rating: 5,
    initials: 'ZN',
    avatarGradient: 'from-indigo-500 to-purple-600',
    highlight: 'Like having a native speaker 24/7',
  },
];

// Duplicate for seamless loop
const row1 = [...testimonials.slice(0, 3), ...testimonials.slice(0, 3)];
const row2 = [...testimonials.slice(3), ...testimonials.slice(3)];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(rating)].map((_, i) => (
        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
      ))}
    </div>
  );
}

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <div className="flex-shrink-0 w-72 bg-[#12121c] border border-white/[0.07] rounded-2xl p-5 mx-3 hover:border-white/[0.15] transition-colors duration-300">
      {/* Quote mark */}
      <div className="text-4xl text-purple-500/30 font-serif leading-none mb-3">"</div>

      {/* Highlight */}
      <p className="text-purple-300 text-xs font-semibold mb-2 uppercase tracking-wide">{t.highlight}</p>

      {/* Text */}
      <p className="text-gray-300 text-sm leading-relaxed mb-5">{t.text}</p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div
            className={`w-9 h-9 rounded-full bg-gradient-to-br ${t.avatarGradient} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
          >
            {t.initials}
          </div>
          <div>
            <p className="text-white text-xs font-semibold">{t.name}</p>
            <p className="text-gray-500 text-[10px]">
              {t.age} · {t.role} · {t.location}
            </p>
          </div>
        </div>
        <StarRating rating={t.rating} />
      </div>
    </div>
  );
}

export default function TestimonialsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="relative py-28 bg-[#0a0a0f] overflow-hidden" ref={ref}>
      {/* Background glows */}
      <div className="absolute top-1/2 -translate-y-1/2 left-0 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 -translate-y-1/2 right-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Fade edges */}
      <div className="absolute top-0 left-0 bottom-0 w-32 bg-gradient-to-r from-[#0a0a0f] to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 right-0 bottom-0 w-32 bg-gradient-to-l from-[#0a0a0f] to-transparent z-10 pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-16 px-4"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block text-purple-400 text-sm font-semibold tracking-widest uppercase mb-4">
            Testimonials
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-5 leading-tight">
            What Our{' '}
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Learners Say
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Real results from real students across Uzbekistan
          </p>
        </motion.div>

        {/* Row 1 — scrolls left */}
        <div className="mb-5 overflow-hidden">
          <motion.div
            className="flex"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          >
            {row1.map((t, i) => (
              <TestimonialCard key={`r1-${i}`} t={t} />
            ))}
          </motion.div>
        </div>

        {/* Row 2 — scrolls right */}
        <div className="overflow-hidden">
          <motion.div
            className="flex"
            animate={{ x: ['-50%', '0%'] }}
            transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
          >
            {row2.map((t, i) => (
              <TestimonialCard key={`r2-${i}`} t={t} />
            ))}
          </motion.div>
        </div>

        {/* Bottom rating summary */}
        <motion.div
          className="text-center mt-14 px-4"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="inline-flex items-center gap-3 bg-white/[0.03] border border-white/[0.07] rounded-2xl px-6 py-3">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-white font-semibold">4.9/5</span>
            <span className="text-gray-500 text-sm">from 12,000+ reviews</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
