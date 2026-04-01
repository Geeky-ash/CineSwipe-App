import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchUpcomingMovies, fetchTrendingMovies, fetchTopRatedMovies, searchMovies, getGenreLabel } from '../services/tmdb';
import StitchLoader from '../components/StitchLoader';

const POSTER_BASE = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_BASE = 'https://image.tmdb.org/t/p/original';

/* ── Collection Chips ── */
const COLLECTIONS = [
  { key: 'trending',  label: 'Trending',  icon: 'trending_up' },
  { key: 'oscars',    label: 'Oscars',    icon: 'military_tech' },
  { key: 'noir',      label: 'Noir',      icon: 'dark_mode' },
  { key: 'scifi',     label: 'Sci-Fi',    icon: 'rocket_launch' },
  { key: 'indie',     label: 'Indie',     icon: 'movie_edit' },
];

export default function Discover() {
  const navigate = useNavigate();
  const [upcoming, setUpcoming] = useState([]);
  const [trending, setTrending] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeCollection, setActiveCollection] = useState('trending');

  useEffect(() => {
    Promise.all([fetchUpcomingMovies(), fetchTrendingMovies(), fetchTopRatedMovies()])
      .then(([up, tr, top]) => {
        setUpcoming(up.slice(0, 10));
        setTrending(tr.slice(0, 12));
        setTopRated(top.slice(0, 8));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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

  if (loading) return <StitchLoader vibeLabel="Loading Discover…" />;

  const heroMovie = upcoming[0];
  const showSearchOverlay = searchFocused && (query.trim().length > 0 || searchResults.length > 0);

  return (
    <div className="bg-surface-container-lowest text-on-surface min-h-[100dvh] pb-28 overflow-x-hidden">

      {/* ── Sticky Header with Global Search ── */}
      <header className="sticky top-0 z-50 pt-4 pb-3"
        style={{
          background: 'linear-gradient(to bottom, #000000 0%, rgba(0,0,0,0.9) 60%, transparent 100%)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <div className="max-w-[1800px] mx-auto px-4 lg:px-12">
          {/* Top Row */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-headline text-2xl font-bold tracking-tight">Discover</h1>
            <button
              onClick={() => navigate('/profile')}
              className="w-9 h-9 rounded-full glass-panel flex items-center justify-center ghost-border"
            >
              <span className="material-symbols-outlined text-on-surface-variant text-[18px]">person</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              {searching
                ? <span className="material-symbols-outlined text-primary text-sm animate-spin">autorenew</span>
                : <span className="material-symbols-outlined text-on-surface-variant/50 text-[20px]">search</span>
              }
            </div>
            <input
              className="stitch-input"
              placeholder="Search movies, actors, moods..."
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
            />
            {query && (
              <button
                onClick={() => { setQuery(''); setSearchResults([]); }}
                className="absolute inset-y-0 right-4 flex items-center text-on-surface-variant/60 hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Search Results Overlay ── */}
      <AnimatePresence>
        {showSearchOverlay && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-0 z-40 bg-surface-container-lowest/95 backdrop-blur-xl pt-32 pb-28 overflow-y-auto"
          >
            <div className="max-w-[1800px] mx-auto px-4 lg:px-12">
              {searchResults.length > 0 ? (
                <>
                  <h2 className="font-headline text-lg font-bold mb-4">Results for "{query}"</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {searchResults.slice(0, 15).map((movie) => (
                      <div
                        key={movie.id}
                        onClick={() => navigate(`/movie/${movie.id}`)}
                        className="stitch-card cursor-pointer group"
                      >
                        {movie.poster_path ? (
                          <img
                            alt={movie.title}
                            className="w-full aspect-[2/3] object-cover group-hover:scale-105 transition-transform duration-500"
                            src={`${POSTER_BASE}${movie.poster_path}`}
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

      {/* ── Main Bento Grid Content ── */}
      <main className="max-w-[1800px] mx-auto px-4 lg:px-12 pt-4">

        {/* Collections Row */}
        <section className="mb-8">
          <div className="flex items-end justify-between mb-4">
            <div>
              <h3 className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Collections</h3>
              <p className="text-on-surface-variant/60 text-xs font-body">Curated by Auteurs</p>
            </div>
          </div>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
            {COLLECTIONS.map((col) => (
              <button
                key={col.key}
                onClick={() => setActiveCollection(col.key)}
                className={`flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all active:scale-95 ${
                  activeCollection === col.key
                    ? 'neon-gradient text-on-primary-fixed shadow-lg'
                    : 'stitch-chip'
                }`}
                style={activeCollection === col.key ? { boxShadow: '0 0 15px rgba(255,138,169,0.3)' } : {}}
              >
                <span className="material-symbols-outlined text-[18px]">{col.icon}</span>
                {col.label}
              </button>
            ))}
          </div>
        </section>

        {/* ── Hero Feature Card ── */}
        {heroMovie && (
          <section className="mb-8">
            <div
              onClick={() => navigate(`/movie/${heroMovie.id}`)}
              className="relative rounded-2xl overflow-hidden cursor-pointer group h-[320px] lg:h-[420px]"
              style={{
                background: `url(${BACKDROP_BASE}${heroMovie.backdrop_path}) center/cover no-repeat`,
              }}
            >
              {/* Gradient overlays */}
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

              <div className="absolute bottom-8 left-8 right-8 max-w-xl">
                <span className="text-tertiary text-xs font-label font-bold uppercase tracking-widest mb-2 block">
                  Featured Discovery
                </span>
                <h2 className="font-headline text-4xl lg:text-5xl font-black leading-tight mb-3 text-on-surface">
                  {heroMovie.title}
                </h2>
                <p className="text-on-surface-variant text-sm font-body line-clamp-2 mb-5 max-w-md">
                  {heroMovie.overview}
                </p>
                <button className="neon-btn px-6 py-3 text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm filled">play_arrow</span>
                  Watch Now
                </button>
              </div>

              {/* Inner glow */}
              <div className="absolute inset-0 pointer-events-none inner-glow rounded-2xl" />
            </div>
          </section>
        )}

        {/* ── Trending Now Grid ── */}
        <section className="mb-10">
          <div className="flex items-end justify-between mb-5">
            <h2 className="font-headline text-2xl font-black tracking-tight">Trending Now</h2>
            <button className="text-primary text-xs font-label font-bold uppercase tracking-widest">See All</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {trending.slice(0, 10).map((movie) => (
              <div
                key={movie.id}
                onClick={() => navigate(`/movie/${movie.id}`)}
                className="stitch-card cursor-pointer group aspect-[2/3]"
              >
                <img
                  alt={movie.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src={`${POSTER_BASE}${movie.poster_path}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 pointer-events-none" />
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="font-headline text-sm font-bold leading-tight line-clamp-2">{movie.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-tertiary text-[10px] font-label font-bold">{getGenreLabel(movie.genre_ids)}</span>
                    <span className="text-on-surface-variant text-[10px] flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[12px] text-tertiary filled">star</span>
                      {movie.vote_average?.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Late Night Thrills — Asymmetric Bento ── */}
        <section className="mb-10">
          <h2 className="font-headline text-2xl font-black tracking-tight mb-5">Late Night Thrills</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Large card */}
            {upcoming[1] && (
              <div
                onClick={() => navigate(`/movie/${upcoming[1].id}`)}
                className="lg:col-span-2 relative rounded-2xl overflow-hidden cursor-pointer group h-[280px] bento-cell"
              >
                <img
                  alt={upcoming[1].title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  src={`${BACKDROP_BASE}${upcoming[1].backdrop_path || upcoming[1].poster_path}`}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent pointer-events-none" />
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="font-headline text-2xl font-black mb-1">{upcoming[1].title}</h3>
                  <p className="text-on-surface-variant text-sm font-body line-clamp-2 max-w-sm">{upcoming[1].overview}</p>
                </div>
              </div>
            )}

            {/* Two stacked small cards */}
            <div className="flex flex-col gap-4">
              {upcoming.slice(2, 4).map((movie) => (
                <div
                  key={movie.id}
                  onClick={() => navigate(`/movie/${movie.id}`)}
                  className="relative rounded-2xl overflow-hidden cursor-pointer group h-[134px] bento-cell"
                >
                  <img
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src={`${POSTER_BASE}${movie.poster_path}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="font-headline text-sm font-bold leading-tight line-clamp-1">{movie.title}</p>
                    <p className="text-on-surface-variant text-[10px] font-label uppercase tracking-wider mt-0.5">
                      {movie.release_date?.slice(0, 4)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Award Winners ── */}
        <section className="mb-10">
          <div className="flex items-end justify-between mb-5">
            <div>
              <h2 className="font-headline text-2xl font-black tracking-tight">Award Winners</h2>
              <p className="text-on-surface-variant text-xs font-body mt-1">Academy Award & Cannes Selections</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {topRated.slice(0, 8).map((movie) => (
              <div
                key={movie.id}
                onClick={() => navigate(`/movie/${movie.id}`)}
                className="stitch-card cursor-pointer group aspect-[2/3]"
              >
                <img
                  alt={movie.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src={`${POSTER_BASE}${movie.poster_path}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-85 pointer-events-none" />
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="font-headline text-sm font-bold leading-tight line-clamp-2">{movie.title}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Pro Access Banner ── */}
        <section className="mb-10">
          <div className="glass-panel rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-[40px] pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-tertiary/10 rounded-full blur-[40px] pointer-events-none" />
            <div className="relative z-10">
              <span className="text-tertiary text-xs font-label font-bold uppercase tracking-widest">Pro Access</span>
              <h3 className="font-headline text-xl font-black mt-2 mb-2">Unlock Curated Film Essays</h3>
              <p className="text-on-surface-variant text-sm font-body max-w-md mb-5">
                High-fidelity streaming, exclusive reviews by cinematography masters, and early access to festival selections.
              </p>
              <button className="neon-btn px-6 py-3 text-sm">Upgrade Now</button>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="flex items-center justify-center gap-6 py-8 text-on-surface-variant/40 text-xs font-label">
          <span className="cursor-pointer hover:text-on-surface-variant transition-colors">Privacy</span>
          <span className="cursor-pointer hover:text-on-surface-variant transition-colors">Terms</span>
          <span className="cursor-pointer hover:text-on-surface-variant transition-colors">Studio Access</span>
        </footer>
      </main>
    </div>
  );
}
