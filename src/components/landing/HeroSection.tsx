import { motion } from 'framer-motion';
import { ArrowRight, Play, Star, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
};

const floatVariants = {
  initial: { y: 0 },
  animate: {
    y: [-8, 8, -8],
    transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
  },
};

const chatMessages = [
  { id: 1, sender: 'ai', text: 'Hello! Ready to practice English today? 👋', delay: 0 },
  { id: 2, sender: 'user', text: 'Yes! Can you help me with grammar?', delay: 0.4 },
  { id: 3, sender: 'ai', text: 'Of course! Let\'s start with present perfect...', delay: 0.8 },
  { id: 4, sender: 'user', text: 'I has gone to school. Is that right?', delay: 1.2 },
  {
    id: 5,
    sender: 'ai',
    text: '✅ Almost! It should be "I have gone to school." Great effort!',
    delay: 1.6,
  },
];

const stats = [
  { icon: Users, value: '50K+', label: 'Active Users', color: 'text-purple-400' },
  { icon: TrendingUp, value: '95%', label: 'Success Rate', color: 'text-green-400' },
  { icon: Star, value: '4.9/5', label: 'App Rating', color: 'text-yellow-400' },
];

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#0a0a0f] pt-20">
      {/* Gradient mesh background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-500/10 rounded-full blur-[80px]" />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center lg:text-left"
          >
            {/* Trust badge */}
            <motion.div variants={itemVariants} className="inline-flex mb-6">
              <Badge className="bg-purple-500/10 text-purple-300 border border-purple-500/30 px-4 py-1.5 text-sm font-medium rounded-full backdrop-blur-sm">
                🎯 Trusted by 50,000+ learners in Uzbekistan
              </Badge>
            </motion.div>

            {/* Main heading */}
            <motion.h1
              variants={itemVariants}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.08] tracking-tight mb-6"
            >
              Master English with{' '}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-blue-400 bg-clip-text text-transparent">
                  AI
                </span>
                <motion.span
                  className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-xl rounded-lg"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                />
              </span>
              , Faster Than Ever
            </motion.h1>

            {/* Subheading */}
            <motion.p
              variants={itemVariants}
              className="text-lg sm:text-xl text-gray-400 leading-relaxed mb-10 max-w-xl mx-auto lg:mx-0"
            >
              Learn English naturally with your personal AI tutor. Grammar, vocabulary, speaking,
              and IELTS prep — all in one place.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-white font-semibold text-base overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600" />
                <span className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center gap-2">
                  Start Free Today
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-white font-semibold text-base border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
              >
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors">
                  <Play className="w-3 h-3 fill-white ml-0.5" />
                </span>
                Watch Demo
              </motion.button>
            </motion.div>

            {/* Stats row */}
            <motion.div
              variants={itemVariants}
              className="mt-14 flex gap-8 justify-center lg:justify-start"
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="text-center lg:text-left"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
                >
                  <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: Chat illustration */}
          <motion.div
            className="relative flex justify-center items-center"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <motion.div
              variants={floatVariants}
              initial="initial"
              animate="animate"
              className="relative w-full max-w-sm"
            >
              {/* Phone frame */}
              <div className="relative bg-[#13131a] border border-white/10 rounded-3xl shadow-2xl shadow-purple-500/10 overflow-hidden">
                {/* Phone header */}
                <div className="bg-[#1a1a25] px-5 py-4 flex items-center gap-3 border-b border-white/5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white">
                    AI
                  </div>
                  <div>
                    <div className="text-white text-sm font-semibold">EnglishAI Tutor</div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-gray-400 text-xs">Online now</span>
                    </div>
                  </div>
                  <div className="ml-auto flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-400/60" />
                    <div className="w-2 h-2 rounded-full bg-yellow-400/60" />
                    <div className="w-2 h-2 rounded-full bg-green-400/60" />
                  </div>
                </div>

                {/* Chat messages */}
                <div className="px-4 py-5 space-y-3 min-h-[320px]">
                  {chatMessages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: 0.6 + msg.delay, duration: 0.4 }}
                    >
                      <div
                        className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          msg.sender === 'ai'
                            ? 'bg-[#1f1f2e] text-gray-200 rounded-tl-sm border border-white/5'
                            : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-tr-sm'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </motion.div>
                  ))}

                  {/* Typing indicator */}
                  <motion.div
                    className="flex justify-start"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.8 }}
                  >
                    <div className="bg-[#1f1f2e] border border-white/5 px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-gray-400"
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                        />
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* Input bar */}
                <div className="px-4 pb-4">
                  <div className="bg-[#1a1a25] border border-white/10 rounded-xl px-4 py-2.5 flex items-center gap-2">
                    <span className="text-gray-500 text-sm flex-1">Type your message…</span>
                    <div className="w-7 h-7 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                      <ArrowRight className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badges around the phone */}
              <motion.div
                className="absolute -top-4 -right-6 bg-[#1a1a25] border border-white/10 rounded-2xl px-3 py-2 flex items-center gap-2 shadow-lg"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
              >
                <span className="text-lg">🏆</span>
                <div>
                  <div className="text-white text-xs font-semibold">IELTS 7.5</div>
                  <div className="text-gray-500 text-[10px]">Achieved!</div>
                </div>
              </motion.div>

              <motion.div
                className="absolute -bottom-4 -left-6 bg-[#1a1a25] border border-white/10 rounded-2xl px-3 py-2 flex items-center gap-2 shadow-lg"
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
              >
                <span className="text-lg">🔥</span>
                <div>
                  <div className="text-white text-xs font-semibold">30-day streak</div>
                  <div className="text-gray-500 text-[10px]">Keep it up!</div>
                </div>
              </motion.div>

              <motion.div
                className="absolute top-1/2 -left-10 -translate-y-1/2 bg-[#1a1a25] border border-white/10 rounded-2xl px-3 py-2 shadow-lg"
                animate={{ x: [0, -4, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: 0.2 }}
              >
                <div className="flex items-center gap-1.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <div className="text-gray-400 text-[10px] mt-0.5">4.9/5 Rating</div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0f] to-transparent pointer-events-none" />
    </section>
  );
}
