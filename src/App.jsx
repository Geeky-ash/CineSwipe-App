import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { VibeProvider } from './contexts/VibeContext';
import Feed from './pages/Feed';
import Clubs from './pages/Clubs';
import Login from './pages/Login';
import MovieDetails from './pages/MovieDetails';
import BottomNav from './components/BottomNav';
import VibeCheck from './components/VibeCheck';
import StitchLoader from './components/StitchLoader';

const Discover = lazy(() => import('./pages/Discover'));
const Profile = lazy(() => import('./pages/Profile'));

/* ── Spring-Bounce Page Transition ── */
const pageVariants = {
  initial: { opacity: 0, y: 16, scale: 0.99 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit:    { opacity: 0, y: -16, scale: 0.99 },
};
const pageTransition = {
  type: 'spring',
  stiffness: 300,
  damping: 25,
};

function PageWrapper({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
      className="w-full min-h-[100dvh]"
    >
      {children}
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  const { session } = useAuth();

  if (session === undefined) {
    return <StitchLoader vibeLabel="Initializing…" />;
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={
          session ? <Navigate to="/" replace /> : <PageWrapper><Login /></PageWrapper>
        } />
        <Route path="/" element={<PageWrapper><Feed /></PageWrapper>} />
        <Route path="/discover" element={
          <Suspense fallback={<StitchLoader vibeLabel="Loading Discover…" />}>
            <PageWrapper><Discover /></PageWrapper>
          </Suspense>
        } />
        <Route path="/clubs" element={<PageWrapper><Clubs /></PageWrapper>} />
        <Route path="/movie/:id" element={<PageWrapper><MovieDetails /></PageWrapper>} />
        <Route path="/profile" element={
          session ? (
            <Suspense fallback={<StitchLoader vibeLabel="Loading Profile…" />}>
              <PageWrapper><Profile /></PageWrapper>
            </Suspense>
          ) : <Navigate to="/login" replace />
        } />
        <Route path="/cinesnaps" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <VibeProvider>
          <div className="w-full min-h-[100dvh] bg-surface-container-lowest text-on-surface">
            <AnimatedRoutes />
            <VibeCheck />
            <BottomNav />
          </div>
        </VibeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
