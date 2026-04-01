import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { searchMovies } from '../services/tmdb';

const TABS = [
  { path: '/', label: 'Swipe' },
  { path: '/discover', label: 'Discover' },
  { path: '/clubs', label: 'Film Clubs' },
  { path: '/profile', label: 'Profile' },
];

export default function TopNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  /* Debounced search */
  useEffect(() => {
    if (!query.trim()) { setSearchResults([]); return; }
    const timeout = setTimeout(async () => {
      setSearching(true);
      const results = await searchMovies(query);
      setSearchResults(results);
      setSearching(false);
    }, 400);
    return () => clearTimeout(timeout);
  }, [query]);

  const showSearchOverlay = searchFocused && (query.trim().length > 0 || searchResults.length > 0);

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

          {/* Navigation Tabs */}
          <div className="flex-1 flex gap-2 lg:gap-8 overflow-x-auto hide-scrollbar">
            {TABS.map((tab) => {
              const active = location.pathname === tab.path || (tab.path !== '/' && location.pathname.startsWith(tab.path));
              return (
                <button
                  key={tab.path}
                  onClick={() => navigate(tab.path)}
                  className={`relative py-2 px-3 lg:px-0 text-sm font-headline tracking-wide uppercase transition-colors whitespace-nowrap ${
                    active ? 'text-on-surface font-bold text-shadow-glow' : 'text-on-surface-variant hover:text-on-surface/80 font-medium'
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

          {/* Global Search Input */}
          <div className="relative w-48 lg:w-72 flex-shrink-0">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              {searching
                ? <span className="material-symbols-outlined text-primary text-sm animate-spin">autorenew</span>
                : <span className="material-symbols-outlined text-on-surface-variant/50 text-[18px]">search</span>
              }
            </div>
            <input
              className="w-full bg-surface-container-lowest text-on-surface text-sm pl-9 pr-8 py-2 rounded-full border border-outline-variant/15 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-body"
              placeholder="Search films..."
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
            />
            {query && (
              <button
                onClick={() => { setQuery(''); setSearchResults([]); }}
                className="absolute inset-y-0 right-3 flex items-center text-on-surface-variant/60 hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ── Search Overlay ── */}
      <AnimatePresence>
        {showSearchOverlay && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-0 z-[90] bg-surface-container-lowest/95 backdrop-blur-xl pt-[80px] pb-28 overflow-y-auto"
          >
            <div className="max-w-[1800px] mx-auto px-4 lg:px-12 mt-6">
              {searchResults.length > 0 ? (
                <>
                  <h2 className="font-headline text-lg font-bold mb-4">Results for "{query}"</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {searchResults.slice(0, 15).map((movie) => (
                      <div
                        key={movie.id}
                        onClick={() => { navigate(`/movie/${movie.id}`); setQuery(''); }}
                        className="stitch-card cursor-pointer group"
                      >
                        {movie.poster_path ? (
                          <img
                            alt={movie.title}
                            className="w-full aspect-[2/3] object-cover group-hover:scale-105 transition-transform duration-500"
                            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                          />
                        ) : (
                          <div className="w-full aspect-[2/3] bg-surface-container-high flex items-center justify-center">
                            <span className="material-symbols-outlined text-outline text-4xl">movie</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90 pointer-events-none" />
                        <div className="absolute bottom-3 left-3 right-3">
                          <p className="font-headline text-sm font-bold leading-tight line-clamp-2">{movie.title}</p>
                          <p className="text-on-surface-variant text-[11px] mt-0.5 font-body">{movie.release_date?.slice(0, 4) || ''}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : query.trim().length >= 2 && !searching ? (
                <div className="text-center py-20 text-on-surface-variant">
                  <span className="material-symbols-outlined text-4xl mb-3 block">search_off</span>
                  <p className="text-sm font-body">No results for "{query}"</p>
                </div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
