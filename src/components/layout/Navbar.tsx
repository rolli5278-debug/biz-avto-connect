import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  Settings,
  User as UserIcon,
  ChevronDown,
  Sparkles,
  BookOpen,
  LayoutDashboard,
  ExternalLink,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { User } from '@/types';
import { StreakCounter } from '@/components/shared/StreakCounter';
import { XPBadge } from '@/components/shared/XPBadge';

interface NavbarProps {
  user?: User | null;
}

const GUEST_NAV = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'About', href: '#about' },
];

// Fake notification data – replace with real data source
const MOCK_NOTIFICATIONS = [
  { id: '1', text: 'You completed a 7-day streak!', time: '2m ago', unread: true },
  { id: '2', text: 'New IELTS lesson available', time: '1h ago', unread: true },
  { id: '3', text: "AI Tutor: 'Great progress!'", time: '3h ago', unread: false },
];

function getUserInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function Navbar({ user }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() =>
    typeof document !== 'undefined'
      ? document.documentElement.classList.contains('dark')
      : false
  );
  const [notifOpen, setNotifOpen] = useState(false);
  const navigate = useNavigate();

  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => n.unread).length;

  // Sticky scroll shadow + blur
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
  };

  const userInitials = user?.name ? getUserInitials(user.name) : 'U';

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-background/85 backdrop-blur-xl border-b border-border/60 shadow-sm'
            : 'bg-transparent'
        )}
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">

            {/* ── Logo ── */}
            <Link
              to={user ? '/app' : '/'}
              className="flex items-center gap-2 shrink-0 group"
              aria-label="EnglishAI home"
            >
              <motion.div
                whileHover={{ scale: 1.08, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center shadow-lg"
              >
                <Sparkles className="w-4 h-4 text-white" />
              </motion.div>
              <span className="text-xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent tracking-tight select-none">
                EnglishAI
              </span>
            </Link>

            {/* ── Guest centre nav (md+) ── */}
            {!user && (
              <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
                {GUEST_NAV.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            )}

            {/* ── Right side ── */}
            <div className="flex items-center gap-1.5 sm:gap-2">

              {/* Dark-mode toggle */}
              <button
                onClick={toggleDark}
                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={darkMode ? 'moon' : 'sun'}
                    initial={{ rotate: -90, opacity: 0, scale: 0.7 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: 90, opacity: 0, scale: 0.7 }}
                    transition={{ duration: 0.18 }}
                    className="flex"
                    aria-hidden
                  >
                    {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </motion.span>
                </AnimatePresence>
              </button>

              {user ? (
                <>
                  {/* Streak – hide on very small screens */}
                  <div className="hidden xs:flex sm:flex">
                    <StreakCounter streak={user.streak} size="sm" />
                  </div>

                  {/* XP – hide on very small screens */}
                  <div className="hidden xs:flex sm:flex">
                    <XPBadge xp={user.xp} size="sm" />
                  </div>

                  {/* Notification bell */}
                  <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
                    <DropdownMenuTrigger asChild>
                      <button
                        aria-label={`${unreadCount} unread notifications`}
                        className="relative w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
                      >
                        <Bell className="w-4 h-4" />
                        <AnimatePresence>
                          {unreadCount > 0 && (
                            <motion.span
                              key="badge"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              className="absolute top-1 right-1 w-4 h-4 rounded-full bg-purple-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-background"
                            >
                              {unreadCount}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-72 p-0 overflow-hidden">
                      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/60">
                        <span className="font-semibold text-sm">Notifications</span>
                        {unreadCount > 0 && (
                          <button className="text-xs text-purple-500 hover:text-purple-600 font-medium transition-colors">
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {MOCK_NOTIFICATIONS.map((notif) => (
                          <div
                            key={notif.id}
                            className={cn(
                              'flex items-start gap-3 px-3 py-2.5 hover:bg-accent/60 cursor-pointer transition-colors',
                              notif.unread && 'bg-purple-50/50 dark:bg-purple-950/20'
                            )}
                          >
                            <span className={cn('w-2 h-2 rounded-full mt-1.5 shrink-0', notif.unread ? 'bg-purple-500' : 'bg-transparent border border-muted-foreground/30')} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-foreground leading-snug">{notif.text}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">{notif.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-border/60 px-3 py-2">
                        <button className="text-xs text-muted-foreground hover:text-foreground w-full text-center transition-colors">
                          View all notifications
                        </button>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Avatar dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-xl hover:bg-accent/60 transition-colors group"
                        aria-label="Account menu"
                      >
                        <Avatar className="w-7 h-7 ring-2 ring-purple-500/30 group-hover:ring-purple-500/60 transition-all">
                          <AvatarImage src={user.avatar_url ?? undefined} alt={user.name} />
                          <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                            {userInitials}
                          </AvatarFallback>
                        </Avatar>
                        <ChevronDown className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-all group-data-[state=open]:rotate-180 duration-200" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel className="font-normal py-2.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={user.avatar_url ?? undefined} />
                            <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                              {userInitials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <span className="font-semibold text-sm leading-none truncate">{user.name}</span>
                            <span className="text-xs text-muted-foreground leading-none truncate mt-0.5">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate('/app')}>
                        <LayoutDashboard className="w-4 h-4 mr-2 text-muted-foreground" />
                        Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/app/profile')}>
                        <UserIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/app/settings')}>
                        <Settings className="w-4 h-4 mr-2 text-muted-foreground" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive focus:bg-destructive/10"
                        onClick={() => navigate('/logout')}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden sm:flex"
                    onClick={() => navigate('/login')}
                  >
                    Sign In
                  </Button>
                  <Button
                    size="sm"
                    className="hidden sm:flex bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:from-purple-700 hover:to-blue-600 shadow-md hover:shadow-lg transition-all"
                    onClick={() => navigate('/register')}
                  >
                    Get Started
                  </Button>
                </>
              )}

              {/* Mobile hamburger */}
              <button
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen((v) => !v)}
                className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={mobileOpen ? 'x' : 'menu'}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex"
                    aria-hidden
                  >
                    {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </motion.span>
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease: 'easeInOut' }}
              className="overflow-hidden border-t border-border/60 bg-background/95 backdrop-blur-xl md:hidden"
            >
              <nav
                className="container mx-auto px-4 py-4 flex flex-col gap-1"
                aria-label="Mobile navigation"
              >
                {/* Guest links */}
                {!user &&
                  GUEST_NAV.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
                    >
                      {link.label}
                    </a>
                  ))}

                {/* Guest CTA buttons */}
                {!user && (
                  <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-border/60">
                    <Button
                      variant="outline"
                      onClick={() => { navigate('/login'); setMobileOpen(false); }}
                    >
                      Sign In
                    </Button>
                    <Button
                      className="bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:from-purple-700 hover:to-blue-600"
                      onClick={() => { navigate('/register'); setMobileOpen(false); }}
                    >
                      Get Started
                    </Button>
                  </div>
                )}

                {/* Authenticated user: mini-profile + quick actions */}
                {user && (
                  <>
                    <div className="flex items-center gap-3 px-2 py-2 mb-1">
                      <Avatar className="w-10 h-10 ring-2 ring-purple-500/30">
                        <AvatarImage src={user.avatar_url ?? undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-sm font-bold">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm leading-tight truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>

                    {/* Streak + XP inline */}
                    <div className="flex items-center gap-2 px-2 pb-2">
                      <StreakCounter streak={user.streak} size="sm" />
                      <XPBadge xp={user.xp} size="sm" />
                    </div>

                    <div className="border-t border-border/60 pt-2 space-y-0.5">
                      {[
                        { label: 'Dashboard', href: '/app', icon: <LayoutDashboard className="w-4 h-4" /> },
                        { label: 'Lessons', href: '/app/lessons', icon: <BookOpen className="w-4 h-4" /> },
                        { label: 'Profile', href: '/app/profile', icon: <UserIcon className="w-4 h-4" /> },
                        { label: 'Settings', href: '/app/settings', icon: <Settings className="w-4 h-4" /> },
                      ].map((item) => (
                        <button
                          key={item.href}
                          onClick={() => { navigate(item.href); setMobileOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
                        >
                          <span className="text-muted-foreground">{item.icon}</span>
                          {item.label}
                        </button>
                      ))}
                    </div>

                    <div className="border-t border-border/60 pt-2 mt-1">
                      <button
                        onClick={() => { navigate('/logout'); setMobileOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Spacer – only on pages that use the landing navbar (not inside AppLayout) */}
      {!user && <div className="h-16" />}
    </>
  );
}
