import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sidebar } from './Sidebar';
import { XPBadge } from '@/components/shared/XPBadge';
import { StreakCounter } from '@/components/shared/StreakCounter';
import { useAuth } from '@/auth/AuthProvider';

// Suppress unused import warning — cn is used in the JSX below
void cn;

import type { User } from '@/types';

interface AppLayoutProps {
  children: React.ReactNode;
  /** Page title shown in the top bar. Derived from breadcrumbs if omitted. */
  title?: string;
  /** Override breadcrumb segments; defaults to path-based derivation */
  breadcrumbs?: { label: string; href?: string }[];
  /** Optional slot rendered in the top-bar right side (e.g. CTA buttons) */
  headerRight?: React.ReactNode;
  /** Optional user override (falls back to auth context) */
  user?: User | null;
}

/** Derive a human-readable label from a URL path segment */
function segmentToLabel(segment: string): string {
  return segment
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/** Build breadcrumb items from the current pathname */
function buildBreadcrumbs(pathname: string): { label: string; href: string }[] {
  const parts = pathname.split('/').filter(Boolean);
  const crumbs: { label: string; href: string }[] = [
    { label: 'Dashboard', href: '/dashboard' },
  ];
  if (parts.length <= 1) return crumbs;
  let accumulated = '';
  for (const part of parts) {
    accumulated += `/${part}`;
    crumbs.push({ label: segmentToLabel(part), href: accumulated });
  }
  return crumbs;
}

const pageTransition = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
};

export function AppLayout({
  children,
  title,
  breadcrumbs,
  headerRight,
  user: userProp,
}: AppLayoutProps) {
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user: authUser } = useAuth();
  const user = userProp ?? authUser;

  // Provide a safe fallback so layout renders even before profile loads
  const safeUser = user ?? {
    id: '',
    email: '',
    name: 'Learner',
    avatar_url: null,
    level: 'A1' as const,
    xp: 0,
    streak: 0,
    created_at: new Date().toISOString(),
    subscription_type: 'free' as const,
  };

  const crumbs = breadcrumbs ?? buildBreadcrumbs(location.pathname);
  const pageTitle = title ?? crumbs[crumbs.length - 1]?.label ?? 'Dashboard';
  const showBreadcrumb = crumbs.length > 1;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* ── Desktop Sidebar ── */}
      <Sidebar currentPath={location.pathname} user={user} />

      {/* ── Mobile Sidebar Drawer ── */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            {/* Scrim */}
            <motion.div
              key="scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
              onClick={() => setMobileSidebarOpen(false)}
              aria-hidden
            />

            {/* Slide-in panel */}
            <motion.div
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 left-0 z-50 md:hidden shadow-2xl"
            >
              <Sidebar
                currentPath={location.pathname}
                user={user}
                onSignOut={() => setMobileSidebarOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Content Column ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* ── Top Bar ── */}
        <header className="flex items-center gap-3 h-16 px-4 sm:px-6 border-b border-border/60 bg-background/80 backdrop-blur-sm shrink-0 z-30">

          {/* Mobile hamburger */}
          <button
            aria-label="Open navigation"
            aria-expanded={mobileSidebarOpen}
            aria-controls="mobile-sidebar"
            onClick={() => setMobileSidebarOpen(true)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb + Page title */}
          <div className="flex flex-col justify-center min-w-0 flex-1">
            {showBreadcrumb && (
              <nav
                aria-label="Breadcrumb"
                className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground mb-0.5"
              >
                <Link
                  to="/dashboard"
                  className="flex items-center hover:text-foreground transition-colors"
                  aria-label="Dashboard"
                >
                  <Home className="w-3 h-3" />
                </Link>
                {crumbs.slice(1).map((crumb, idx) => (
                  <span key={crumb.href} className="flex items-center gap-1">
                    <ChevronRight className="w-3 h-3 opacity-40" aria-hidden />
                    {idx === crumbs.length - 2 ? (
                      <span className="text-foreground/80 font-medium" aria-current="page">
                        {crumb.label}
                      </span>
                    ) : (
                      <Link
                        to={crumb.href}
                        className="hover:text-foreground transition-colors"
                      >
                        {crumb.label}
                      </Link>
                    )}
                  </span>
                ))}
              </nav>
            )}

            <h1 className="text-base sm:text-lg font-bold text-foreground leading-tight truncate">
              {pageTitle}
            </h1>
          </div>

          {/* Right slot */}
          <div className="ml-auto flex items-center gap-2 shrink-0">
            {/* Streak + XP visible on sm+ in top bar */}
            <div className="hidden sm:flex items-center gap-2">
              <StreakCounter streak={user.streak} size="sm" />
              <XPBadge xp={user.xp} size="sm" />
            </div>

            {/* Caller-injected right-side content (filters, CTAs, etc.) */}
            {headerRight}
          </div>
        </header>

        {/* ── Scrollable Page Content ── */}
        <main
          id="main-content"
          className="flex-1 overflow-y-auto overflow-x-hidden"
          tabIndex={-1}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              {...pageTransition}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
