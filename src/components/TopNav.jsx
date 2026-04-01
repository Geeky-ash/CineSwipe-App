import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const TABS = [
  { path: '/', label: 'Swipe' },
  { path: '/discover', label: 'Discover' },
  { path: '/clubs', label: 'Film Clubs' },
  { path: '/profile', label: 'Profile' },
];

export default function TopNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { session } = useAuth();

  return (
    <>
      {/* ── Floating Top Nav ── */}
      <nav 
        className="fixed top-0 left-0 right-0 z-[100] px-4 py-3 flex items-center justify-between transition-all"
        style={{
          background: 'rgba(38, 38, 38, 0.4)', // 40% surface_variant
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
        }}
      >
        <div className="max-w-[1800px] w-full mx-auto flex items-center gap-6 lg:gap-12">
          
          {/* Logo */}
          <div 
            onClick={() => navigate('/')}
            className="cursor-pointer flex-shrink-0 flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg neon-gradient flex items-center justify-center neon-glow">
              <span className="material-symbols-outlined text-on-primary-fixed text-[18px] filled">movie</span>
            </div>
            <span className="font-headline font-bold text-xl tracking-tight hidden sm:block">CineSwipe</span>
          </div>

          {/* Navigation Tabs - Pill List on Mobile, standard on Desktop */}
          <div className="flex-1 flex gap-2 lg:gap-8 overflow-x-auto hide-scrollbar pb-1 lg:pb-0">
            {TABS.map((tab) => {
              const active = location.pathname === tab.path || (tab.path !== '/' && location.pathname.startsWith(tab.path));
              return (
                <button
                  key={tab.path}
                  onClick={() => navigate(tab.path)}
                  className={`relative py-1.5 lg:py-2 px-4 lg:px-0 rounded-full lg:rounded-none text-xs lg:text-sm font-headline tracking-wide uppercase transition-colors whitespace-nowrap ${
                    active 
                      ? 'bg-primary/20 lg:bg-transparent text-primary lg:text-on-surface font-bold text-shadow-glow' 
                      : 'bg-surface-container/50 lg:bg-transparent text-on-surface-variant hover:text-on-surface/80 font-medium'
                  }`}
                >
                  {tab.label}
                  {active && (
                    <motion.div
                      layoutId="topNavIndicator"
                      className="hidden lg:block absolute -bottom-1 left-0 right-0 h-0.5 neon-gradient rounded-full"
                      style={{ boxShadow: '0 0 10px rgba(255,138,169,0.8)' }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* User Profile */}
          <div className="flex-shrink-0">
            <button 
              onClick={() => navigate('/profile')}
              className="flex items-center justify-center w-10 h-10 rounded-full glass-panel ghost-border hover:bg-surface-container-highest transition-all"
            >
              {session?.user?.user_metadata?.avatar_url ? (
                <img src={session.user.user_metadata.avatar_url} alt="Profile" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-[20px] text-on-surface-variant">person</span>
              )}
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
