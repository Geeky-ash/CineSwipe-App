import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  const { session, signOut } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════════
          MOBILE: Minimalist Status Header (< lg)
          Transparent / subtle blur — logo left, actions right
          ═══════════════════════════════════════════════════════════════════ */}
      <nav
        className="fixed top-0 left-0 right-0 z-[100] lg:hidden flex items-center justify-between px-4 py-3"
        style={{
          background: 'rgba(0, 0, 0, 0.15)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        {/* Logo */}
        <div
          onClick={() => navigate('/')}
          className="cursor-pointer flex items-center gap-2"
        >
          <div className="w-8 h-8 rounded-lg neon-gradient flex items-center justify-center neon-glow">
            <span className="material-symbols-outlined text-on-primary-fixed text-[18px] filled">movie</span>
          </div>
          <span className="font-headline font-bold text-lg tracking-tight text-on-surface">CineSwipe</span>
        </div>

        {/* Actions: Notification + Profile */}
        <div className="flex items-center gap-1" ref={dropdownRef}>
          <button className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/5 transition-colors text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
          </button>

          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center justify-center w-10 h-10 rounded-full glass-panel ghost-border hover:bg-surface-container-highest transition-all relative"
          >
            {session?.user?.user_metadata?.avatar_url ? (
              <img src={session.user.user_metadata.avatar_url} alt="Profile" className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-[20px] text-on-surface-variant">person</span>
            )}
          </button>

          {/* Shared Dropdown Menu */}
          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute top-14 right-0 w-48 bg-surface-container-lowest/90 glass-panel ghost-border rounded-xl overflow-hidden shadow-2xl flex flex-col py-2 backdrop-blur-xl z-[200]"
              >
                <button
                  onClick={() => { setShowDropdown(false); navigate('/profile'); }}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-sm text-on-surface w-full text-left font-medium"
                >
                  <span className="material-symbols-outlined text-[18px]">person</span>
                  My Profile
                </button>
                <button
                  onClick={() => { setShowDropdown(false); }}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-sm text-on-surface w-full text-left font-medium"
                >
                  <span className="material-symbols-outlined text-[18px]">edit_square</span>
                  My Reviews
                </button>
                <button
                  onClick={() => { setShowDropdown(false); navigate('/profile'); }}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-sm text-on-surface w-full text-left font-medium"
                >
                  <span className="material-symbols-outlined text-[18px]">settings</span>
                  Settings
                </button>

                <div className="h-[1px] bg-white/5 my-1 mx-2" />

                <button
                  onClick={() => { setShowDropdown(false); if (signOut) signOut(); }}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-error/10 text-error transition-colors text-sm w-full text-left font-bold"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════════════
          DESKTOP: Full Navigation Bar (≥ lg)
          Glassmorphic with tab pills + actions
          ═══════════════════════════════════════════════════════════════════ */}
      <nav
        className="fixed top-0 left-0 right-0 z-[100] hidden lg:block px-4 py-3"
        style={{
          background: 'rgba(38, 38, 38, 0.4)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
        }}
      >
        <div className="max-w-[1800px] w-full mx-auto flex items-center gap-12">

          {/* Logo */}
          <div
            onClick={() => navigate('/')}
            className="cursor-pointer flex-shrink-0 flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg neon-gradient flex items-center justify-center neon-glow">
              <span className="material-symbols-outlined text-on-primary-fixed text-[18px] filled">movie</span>
            </div>
            <span className="font-headline font-bold text-xl tracking-tight">CineSwipe</span>
          </div>

          {/* Navigation Tabs */}
          <div className="flex-1 flex gap-8">
            {TABS.map((tab) => {
              const active = location.pathname === tab.path || (tab.path !== '/' && location.pathname.startsWith(tab.path));
              return (
                <button
                  key={tab.path}
                  onClick={() => navigate(tab.path)}
                  className={`relative py-2 text-sm font-headline tracking-wide uppercase transition-colors whitespace-nowrap ${
                    active
                      ? 'text-on-surface font-bold text-shadow-glow'
                      : 'text-on-surface-variant hover:text-on-surface/80 font-medium'
                  }`}
                >
                  {tab.label}
                  {active && (
                    <motion.div
                      layoutId="topNavIndicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 neon-gradient rounded-full"
                      style={{ boxShadow: '0 0 10px rgba(255,138,169,0.8)' }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Action Icons & User Profile */}
          <div className="flex items-center gap-4 flex-shrink-0 relative" ref={dropdownRef}>
            <button className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/5 transition-colors text-on-surface-variant hover:text-on-surface">
              <span className="material-symbols-outlined text-[22px]">notifications</span>
            </button>

            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center justify-center w-10 h-10 rounded-full glass-panel ghost-border hover:bg-surface-container-highest transition-all relative"
            >
              {session?.user?.user_metadata?.avatar_url ? (
                <img src={session.user.user_metadata.avatar_url} alt="Profile" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-[20px] text-on-surface-variant">person</span>
              )}
            </button>

            {/* Desktop Dropdown — reuses same markup */}
            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-14 right-0 w-48 bg-surface-container-lowest/90 glass-panel ghost-border rounded-xl overflow-hidden shadow-2xl flex flex-col py-2 backdrop-blur-xl z-[200]"
                >
                  <button
                    onClick={() => { setShowDropdown(false); navigate('/profile'); }}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-sm text-on-surface w-full text-left font-medium"
                  >
                    <span className="material-symbols-outlined text-[18px]">person</span>
                    My Profile
                  </button>
                  <button
                    onClick={() => { setShowDropdown(false); }}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-sm text-on-surface w-full text-left font-medium"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit_square</span>
                    My Reviews
                  </button>
                  <button
                    onClick={() => { setShowDropdown(false); navigate('/profile'); }}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-sm text-on-surface w-full text-left font-medium"
                  >
                    <span className="material-symbols-outlined text-[18px]">settings</span>
                    Settings
                  </button>

                  <div className="h-[1px] bg-white/5 my-1 mx-2" />

                  <button
                    onClick={() => { setShowDropdown(false); if (signOut) signOut(); }}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-error/10 text-error transition-colors text-sm w-full text-left font-bold"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>
    </>
  );
}
