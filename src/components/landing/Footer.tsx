import { motion } from 'framer-motion';
import { Send, Twitter, Youtube, Instagram, MessageCircle, BookOpen, ArrowRight } from 'lucide-react';
import { useState } from 'react';

const footerLinks = {
  Product: [
    { label: 'AI Tutor', href: '#' },
    { label: 'Grammar Checker', href: '#' },
    { label: 'Vocabulary Builder', href: '#' },
    { label: 'IELTS Prep', href: '#' },
    { label: 'Speaking Practice', href: '#' },
    { label: 'Flashcards', href: '#' },
  ],
  Resources: [
    { label: 'Blog', href: '#' },
    { label: 'Study Guides', href: '#' },
    { label: 'IELTS Tips', href: '#' },
    { label: 'Grammar Guide', href: '#' },
    { label: 'Vocabulary Lists', href: '#' },
    { label: 'Help Center', href: '#' },
  ],
  Company: [
    { label: 'About Us', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Press', href: '#' },
    { label: 'Partners', href: '#' },
    { label: 'Contact', href: '#' },
    { label: 'Community', href: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Cookie Policy', href: '#' },
    { label: 'Data Processing', href: '#' },
    { label: 'Refund Policy', href: '#' },
  ],
};

const socials = [
  { icon: Twitter, label: 'Twitter', href: '#', color: 'hover:text-sky-400' },
  { icon: Youtube, label: 'YouTube', href: '#', color: 'hover:text-red-400' },
  { icon: MessageCircle, label: 'Telegram', href: '#', color: 'hover:text-blue-400' },
  { icon: Instagram, label: 'Instagram', href: '#', color: 'hover:text-pink-400' },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="relative bg-[#080810] border-t border-white/[0.06] overflow-hidden">
      {/* Top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-purple-600/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-16 grid grid-cols-2 md:grid-cols-6 gap-10">
          {/* Brand column */}
          <div className="col-span-2">
            {/* Logo */}
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                <BookOpen className="w-4.5 h-4.5 text-white w-5 h-5" />
              </div>
              <span className="text-white font-bold text-xl tracking-tight">
                English
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  AI
                </span>
              </span>
            </div>

            <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-xs">
              The AI-powered English learning platform built for Uzbekistan. Master English faster than ever.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-3 mb-8">
              {socials.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className={`w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-gray-500 ${social.color} hover:bg-white/[0.08] hover:border-white/[0.12] transition-all duration-200`}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>

            {/* Newsletter */}
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-3">
                Weekly English Tips
              </p>
              {subscribed ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 text-emerald-400 text-sm"
                >
                  <span className="text-lg">✅</span>
                  <span>You're subscribed!</span>
                </motion.div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 min-w-0 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                  />
                  <button
                    type="submit"
                    className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center hover:opacity-90 transition-opacity"
                  >
                    <ArrowRight className="w-4 h-4 text-white" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Links columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-white font-semibold text-sm mb-5">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-gray-500 hover:text-gray-300 text-sm transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6">
            <p className="text-gray-600 text-xs">
              © {new Date().getFullYear()} EnglishAI. All rights reserved.
            </p>
            <div className="flex items-center gap-1.5">
              <Send className="w-3 h-3 text-gray-600" />
              <span className="text-gray-600 text-xs">
                Made with{' '}
                <span className="text-red-500">❤️</span>{' '}
                for Uzbekistan{' '}
                <span>🇺🇿</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">Privacy</a>
            <a href="#" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">Terms</a>
            <a href="#" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
