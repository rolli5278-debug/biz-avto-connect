import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, BookOpen, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import StatsSection from '@/components/landing/StatsSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import PricingPreviewSection from '@/components/landing/PricingPreviewSection';
import CTASection from '@/components/landing/CTASection';
import Footer from '@/components/landing/Footer';

// ─── Navbar ───────────────────────────────────────────────────────────────────

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Testimonials', href: '#testimonials' },
];

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMenuOpen(false);
    const id = href.replace('#', '');
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/[0.06] shadow-lg shadow-black/20'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-shadow">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-bold text-lg tracking-tight">
                English
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  AI
                </span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.href)}
                  className="px-4 py-2 text-gray-400 hover:text-white text-sm font-medium rounded-lg hover:bg-white/[0.06] transition-all duration-200"
                >
                  {link.label}
                </button>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => navigate('/login')}
                className="text-gray-400 hover:text-white hover:bg-white/[0.06] text-sm font-medium"
              >
                Sign In
              </Button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/register')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/20"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Start Free
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/[0.06]"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 z-40 bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-white/[0.06] shadow-2xl md:hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col gap-2">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.href)}
                  className="text-left px-4 py-3 text-gray-300 hover:text-white text-sm font-medium rounded-xl hover:bg-white/[0.06] transition-all"
                >
                  {link.label}
                </button>
              ))}
              <div className="pt-3 border-t border-white/[0.06] flex flex-col gap-3 mt-2">
                <Button
                  variant="outline"
                  onClick={() => { navigate('/login'); setMenuOpen(false); }}
                  className="border-white/10 text-gray-300 bg-white/[0.03] hover:bg-white/[0.08] hover:text-white"
                >
                  Sign In
                </Button>
                <button
                  onClick={() => { navigate('/register'); setMenuOpen(false); }}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm bg-gradient-to-r from-purple-600 to-blue-600"
                >
                  <Sparkles className="w-4 h-4" />
                  Start Free Today
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Section Wrapper with scroll reveal ───────────────────────────────────────

function SectionWrapper({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-16">
      {children}
    </section>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 via-violet-500 to-blue-600 origin-left z-[60]"
      style={{ scaleX }}
    />
  );
}

// ─── Landing Page ──────────────────────────────────────────────────────────────

export default function Landing() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0f]">
      {/* Scroll progress indicator */}
      <ScrollProgressBar />

      {/* Fixed navigation */}
      <Navbar />

      {/* Hero - full screen */}
      <SectionWrapper id="hero">
        <HeroSection />
      </SectionWrapper>

      {/* Features */}
      <SectionWrapper id="features">
        <FeaturesSection />
      </SectionWrapper>

      {/* How it works */}
      <SectionWrapper id="how-it-works">
        <HowItWorksSection />
      </SectionWrapper>

      {/* Stats - full width dark */}
      <SectionWrapper id="stats">
        <StatsSection />
      </SectionWrapper>

      {/* Testimonials */}
      <SectionWrapper id="testimonials">
        <TestimonialsSection />
      </SectionWrapper>

      {/* Pricing */}
      <SectionWrapper id="pricing">
        <PricingPreviewSection />
      </SectionWrapper>

      {/* Final CTA */}
      <SectionWrapper id="cta">
        <CTASection />
      </SectionWrapper>

      {/* Footer */}
      <Footer />
    </div>
  );
}
