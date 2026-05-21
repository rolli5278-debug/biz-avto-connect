import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';

// ── Auth & Layout ─────────────────────────────────────────────────────────────
import { AuthProvider, useAuth } from '@/auth/AuthProvider';

// ── Eagerly-loaded public pages ───────────────────────────────────────────────
import Landing from '@/pages/Landing';

// ── Lazy-loaded pages (code split) ────────────────────────────────────────────
const Auth        = lazy(() => import('@/pages/Auth'));
const Dashboard   = lazy(() => import('@/pages/Dashboard'));
const AITutor     = lazy(() => import('@/pages/AITutor'));
const Vocabulary  = lazy(() => import('@/pages/Vocabulary'));
const Speaking    = lazy(() => import('@/pages/Speaking'));
const Lessons     = lazy(() => import('@/pages/Lessons'));
const LessonPage  = lazy(() => import('@/pages/Lesson'));
const IELTSPrep   = lazy(() => import('@/pages/IELTSPrep'));
const Leaderboard = lazy(() => import('@/pages/Leaderboard'));
const Profile     = lazy(() => import('@/pages/Profile'));
const Pricing     = lazy(() => import('@/pages/Pricing'));
const Admin       = lazy(() => import('@/pages/Admin'));
const NotFound    = lazy(() => import('@/pages/NotFound'));

// ── React Query client ────────────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 1 },
  },
});

// ── Page-level loading fallback ───────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-white text-xl font-bold animate-pulse">
          E
        </div>
        <p className="text-sm text-muted-foreground animate-pulse">Loading EnglishAI…</p>
      </div>
    </div>
  );
}

// ── Route guards ──────────────────────────────────────────────────────────────
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user)   return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function RequireGuest({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (user)    return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

// ── AppLayout wrapper (lazy) ──────────────────────────────────────────────────
const AppLayout = lazy(() =>
  import('@/components/layout/AppLayout').then(m => ({ default: m.AppLayout }))
);

function AuthedPage({ title, children }: { title: string; children: React.ReactNode }) {
  const { user } = useAuth();
  return (
    <RequireAuth>
      <Suspense fallback={<PageLoader />}>
        <AppLayout title={title} user={user!}>{children}</AppLayout>
      </Suspense>
    </RequireAuth>
  );
}

// ── Root app ──────────────────────────────────────────────────────────────────
const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner richColors position="top-right" />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public */}
              <Route path="/"        element={<Landing />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route
                path="/auth"
                element={
                  <RequireGuest>
                    <Auth />
                  </RequireGuest>
                }
              />

              {/* Authenticated */}
              <Route path="/dashboard"    element={<AuthedPage title="Dashboard"><Dashboard /></AuthedPage>} />
              <Route path="/tutor"        element={<AuthedPage title="AI Tutor"><AITutor /></AuthedPage>} />
              <Route path="/vocabulary"   element={<AuthedPage title="Vocabulary Builder"><Vocabulary /></AuthedPage>} />
              <Route path="/speaking"     element={<AuthedPage title="Speaking Room"><Speaking /></AuthedPage>} />
              <Route path="/lessons"      element={<AuthedPage title="Lessons"><Lessons /></AuthedPage>} />
              <Route path="/lessons/:id"  element={<AuthedPage title="Lesson"><LessonPage /></AuthedPage>} />
              <Route path="/ielts"        element={<AuthedPage title="IELTS Preparation"><IELTSPrep /></AuthedPage>} />
              <Route path="/leaderboard"  element={<AuthedPage title="Leaderboard"><Leaderboard /></AuthedPage>} />
              <Route path="/profile"      element={<AuthedPage title="Profile Settings"><Profile /></AuthedPage>} />
              <Route path="/admin"        element={<AuthedPage title="Admin Panel"><Admin /></AuthedPage>} />

              {/* Legacy redirects */}
              <Route path="/login"    element={<Navigate to="/auth" replace />} />
              <Route path="/register" element={<Navigate to="/auth?tab=signup" replace />} />
              <Route path="/app"      element={<Navigate to="/dashboard" replace />} />
              <Route path="/app/*"    element={<Navigate to="/dashboard" replace />} />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
