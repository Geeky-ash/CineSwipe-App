import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { VibeProvider } from './contexts/VibeContext';
import Feed from './pages/Feed';
import Clubs from './pages/Clubs';
import Login from './pages/Login';
import MovieDetails from './pages/MovieDetails';
import BottomNav from './components/BottomNav';
import VibeCheck from './components/VibeCheck';

const CineSnaps = lazy(() => import('./pages/CineSnaps'));
const Profile = lazy(() => import('./pages/Profile'));

function AppRoutes() {
  const { session } = useAuth();

  if (session === undefined) {
    return (
      <div className="h-[100dvh] w-full flex items-center justify-center bg-surface-container-lowest">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">autorenew</span>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[100dvh] bg-surface-container-lowest text-on-surface">
      <Suspense fallback={
        <div className="h-[100dvh] w-full flex flex-col items-center justify-center bg-surface-container-lowest text-on-surface">
          <span className="material-symbols-outlined animate-spin text-4xl mb-4 text-primary">autorenew</span>
        </div>
      }>
        <Routes>
          <Route path="/login"      element={session ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/"           element={<Feed />} />
          <Route path="/cinesnaps"  element={<CineSnaps />} />
          <Route path="/clubs"      element={<Clubs />} />
          <Route path="/discover"   element={<Navigate to="/clubs" replace />} />
          <Route path="/movie/:id"  element={<MovieDetails />} />
          <Route path="/profile"    element={session ? <Profile /> : <Navigate to="/login" replace />} />
          <Route path="*"           element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <VibeCheck />
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <VibeProvider>
          <AppRoutes />
        </VibeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
