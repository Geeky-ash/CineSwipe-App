import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchUpcomingMovies, fetchTrendingMovies, fetchTopRatedMovies, fetchMoviesByDirector, getGenreLabel, searchMovies } from '../services/tmdb';
import StitchLoader from '../components/StitchLoader';

const POSTER_BASE = 'https://image.tmdb.org/t/p/w500';

const FILTERS = ['All', 'Cyberpunk', 'Neo-Noir', 'Mumblecore', 'Surrealism'];

const MOCK_CLUBS = [
  { id: 'c1', club: 'Midnight Cinema', movie: 'Fight Club', members: '+1.2k active now' },
  { id: 'c2', club: 'A24 Cult', movie: 'Ex Machina', members: '+842 active now' },
  { id: 'c3', club: 'Anime Aesthetics', movie: 'Akira', members: '+2.1k active now' },
];

export default function Discover() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All');
  const [upcoming, setUpcoming] = useState([]);
  const [trending, setTrending] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [directorMovies, setDirectorMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search State
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

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

  useEffect(() => {
    Promise.all([
      fetchUpcomingMovies(), 
      fetchTrendingMovies(), 
      fetchTopRatedMovies(),
      fetchMoviesByDirector(12453) // 12453 = Wong Kar-Wai
    ])
      .then(([up, tr, top, wkw]) => {
        setUpcoming(up.slice(0, 10));
        setTrending(tr.slice(0, 12));
        setTopRated(top.slice(0, 6));
        setDirectorMovies(wkw.slice(0, 3));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <StitchLoader vibeLabel="Loading Discover…" />;

  return (
    <div className="bg-surface-container-lowest text-on-surface min-h-[100dvh] pb-0 overflow-x-hidden w-full">
      
      {/* ── 0. Discover Search ── */}
      <div className="pt-[84px] lg:pt-[100px] px-4 lg:px-12 max-w-[1800px] mx-auto w-full flex flex-col items-center">
        <div className="relative w-full max-w-2xl mb-6">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            {searching 
              ? <span className="material-symbols-outlined text-primary text-xl animate-spin">autorenew</span>
              : <span className="material-symbols-outlined text-on-surface-variant text-xl">search</span>
            }
          </div>
          <input
            className="w-full bg-surface-container-high text-on-surface text-lg pl-12 pr-12 py-4 rounded-full border border-outline-variant/10 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-body ghost-border"
            placeholder="Search films, directors, actors..."
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setSearchResults([]); }}
              className="absolute inset-y-0 right-4 flex items-center text-on-surface-variant hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          )}
        </div>
      </div>

      {query.trim().length > 0 ? (
        <div className="max-w-[1800px] mx-auto px-4 lg:px-12 pb-20 w-full min-h-[50vh]">
          <h2 className="font-headline text-lg font-bold mb-6 text-on-surface-variant">Search Results</h2>
          {searchResults.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {searchResults.slice(0, 20).map((movie) => (
                <div
                  key={movie.id}
                  onClick={() => navigate(`/movie/${movie.id}`)}
                  className="stitch-card cursor-pointer group shadow-lg"
                >
                  {movie.poster_path ? (
                    <img
                      alt={movie.title}
                      className="w-full aspect-[2/3] object-cover group-hover:scale-105 transition-transform duration-500"
                      src={`${POSTER_BASE}${movie.poster_path}`}
                    />
                  ) : (
                    <div className="w-full aspect-[2/3] bg-surface-container flex items-center justify-center">
                      <span className="material-symbols-outlined text-outline text-4xl">movie</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90 pointer-events-none" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="font-headline text-sm font-bold leading-tight line-clamp-2">{movie.title}</p>
                    <p className="text-on-surface-variant text-[11px] mt-1 font-body font-bold">{movie.release_date?.slice(0, 4) || ''}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : !searching ? (
            <div className="text-center py-20 text-on-surface-variant flex flex-col items-center">
              <span className="material-symbols-outlined text-5xl mb-4 opacity-50">search_off</span>
              <p className="text-lg font-body">No results found for "{query}"</p>
            </div>
          ) : null}
        </div>
      ) : (
        <>
          {/* ── 1. Top-Level Filters ── */}
          <div className="pb-8 px-4 lg:px-12 max-w-[1800px] mx-auto w-full flex items-center flex-wrap gap-2 lg:gap-4 overflow-x-auto hide-scrollbar">
            <span className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant mr-4">Filters</span>
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${
              activeFilter === f 
                ? 'bg-primary text-on-primary shadow-[0_0_15px_rgba(255,138,169,0.4)]' 
                : 'bg-surface-container-highest ghost-border text-on-surface hover:text-primary'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <main className="max-w-[1800px] mx-auto w-full pb-10">
        
        {/* ── 2. Late Night Thrills (Horizontal Scroll) ── */}
        <section className="px-4 lg:px-12 mb-20 w-full">
          <div className="flex items-end justify-between mb-8">
            <h2 className="font-headline text-3xl font-black tracking-tighter uppercase relative">
              Late Night Thrills
              <div className="absolute -bottom-2 left-0 w-16 h-1 bg-primary rounded-full" />
            </h2>
            <button className="text-primary text-xs font-label font-bold uppercase tracking-widest hover:text-white transition-colors">
              View All
            </button>
          </div>

          <div className="flex gap-4 lg:gap-6 overflow-x-auto hide-scrollbar pb-8 pt-4 -px-4 lg:px-0">
            {upcoming.map((movie) => (
              <div 
                key={movie.id} 
                onClick={() => navigate(`/movie/${movie.id}`)}
                className="flex-shrink-0 w-44 lg:w-56 aspect-[2/3] rounded-2xl overflow-hidden relative group cursor-pointer transition-transform duration-500 hover:-translate-y-2 stitch-card shadow-xl"
              >
                <img 
                  src={`${POSTER_BASE}${movie.poster_path}`} 
                  alt={movie.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Default Bottom Gradient & Title */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-100 group-hover:opacity-0 transition-opacity duration-300" />
                <div className="absolute bottom-4 left-4 right-4 group-hover:opacity-0 transition-opacity duration-300">
                  <h3 className="font-headline text-sm lg:text-base font-bold leading-tight line-clamp-2">{movie.title}</h3>
                </div>

                {/* 'SIGNAL LOST' Hover Overlay */}
                <div className="absolute inset-0 bg-error/80 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4 text-center z-10">
                  <div className="w-12 h-12 flex items-center justify-center rounded-full border border-white/30 mb-3 animate-[pulse_2s_infinite]">
                    <span className="material-symbols-outlined text-white text-2xl">sensors_off</span>
                  </div>
                  <h4 className="font-headline font-black text-xl text-white uppercase tracking-widest relative">
                    Signal Lost
                    <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white/50 -rotate-12 mix-blend-overlay" />
                  </h4>
                  <p className="text-[10px] font-label text-white/80 font-bold uppercase tracking-widest mt-2">{movie.title}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 3. Director Spotlight (Wong Kar-Wai) ── */}
        <section className="px-4 lg:px-12 mb-20 w-full relative">
          <div className="absolute inset-0 pointer-events-none rounded-[3rem] opacity-20" 
               style={{ background: 'radial-gradient(ellipse at center, rgba(171,159,255,0.4) 0%, transparent 60%)' }} />
               
          <div className="p-8 lg:p-16 rounded-[2rem] bg-surface-container-high/40 ghost-border backdrop-blur-3xl flex flex-col lg:flex-row gap-12 lg:gap-20 items-center relative z-10">
            
            {/* Left: Bio Info */}
            <div className="lg:w-1/3 flex flex-col justify-center">
              <span className="text-primary text-[10px] font-label font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[14px]">movie_edit</span>
                Director Spotlight
              </span>
              <h2 className="font-headline text-5xl lg:text-7xl font-black leading-none mb-6 text-on-surface">
                Wong<br />Kar-Wai
              </h2>
              <p className="text-on-surface-variant text-sm lg:text-base font-body leading-relaxed mb-8">
                Master of mood, lonely neon streets, and unrequited love. Dive into the cinematic universe of Hong Kong's most visually striking auteur.
              </p>
              <button className="neon-btn px-8 py-4 text-sm font-bold uppercase tracking-widest self-start rounded-full flex items-center gap-2">
                Explore Works
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>

            {/* Right: Dynamic 3-Poster Spread */}
            <div className="lg:w-2/3 flex flex-col lg:flex-row gap-6 lg:gap-8 justify-center items-center w-full">
              {directorMovies.map((movie, idx) => (
                <div 
                  key={movie.id}
                  onClick={() => navigate(`/movie/${movie.id}`)}
                  className={`relative w-48 lg:w-56 aspect-[2/3] rounded-2xl overflow-hidden cursor-pointer group stitch-card shadow-2xl transition-all duration-700 ${
                    idx === 1 ? 'lg:-translate-y-8 z-20 scale-105' : 'z-10'
                  }`}
                >
                  <img 
                    src={`${POSTER_BASE}${movie.poster_path}`} 
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5 pointer-events-none">
                    <p className="text-primary text-xs font-black font-label mb-1">
                      {movie.release_date?.slice(0, 4)}
                    </p>
                    <h3 className="font-headline text-lg font-bold leading-tight line-clamp-2">
                      {movie.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
            
          </div>
        </section>

        {/* ── 4. Bottom Grid (2-Column) ── */}
        <section className="px-4 lg:px-12 mb-20 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          
          {/* Left Column: Trending in Clubs */}
          <div className="flex flex-col gap-6">
            <h3 className="font-headline text-2xl font-black uppercase tracking-tighter mb-2">Trending in Clubs</h3>
            <div className="flex flex-col gap-4 relative">
              <div className="absolute left-6 top-0 bottom-0 w-[1px] bg-white/10" />
              {MOCK_CLUBS.map((clubData, idx) => (
                <div key={idx} className="flex gap-6 items-center p-4 rounded-2xl hover:bg-surface-container-high transition-colors cursor-pointer group z-10">
                  <div className="w-12 h-12 rounded-full bg-surface-container-highest ghost-border flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform relative">
                    <span className="material-symbols-outlined text-[20px] text-on-surface-variant group-hover:text-primary transition-colors">groups</span>
                    {/* Live green dot pulsing */}
                    <span className="absolute top-0 right-0 w-3 h-3 bg-success rounded-full animate-pulse border-2 border-surface-container-highest" />
                  </div>
                  <div>
                    <p className="font-body text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">{clubData.club}</p>
                    <p className="font-headline text-lg font-bold">Watching: {clubData.movie}</p>
                    <p className="font-label text-xs text-success/80 mt-1 flex items-center gap-1.5">
                      {clubData.members}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: New Arrivals */}
          <div className="flex flex-col gap-6">
            <h3 className="font-headline text-2xl font-black uppercase tracking-tighter mb-2">New Arrivals</h3>
            <div className="flex flex-col gap-5">
              {topRated.map((movie) => (
                <div key={movie.id} onClick={() => navigate(`/movie/${movie.id}`)} className="flex items-center gap-5 group cursor-pointer w-full p-2 rounded-xl hover:bg-surface-container/50 transition-colors">
                  <div className="w-16 h-[72px] shrink-0 rounded-lg overflow-hidden shadow-md">
                    <img src={`${POSTER_BASE}${movie.poster_path}`} alt={movie.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-2 py-0.5 rounded-sm bg-tertiary/20 text-tertiary text-[9px] font-black uppercase tracking-widest">Exclusive</span>
                      <span className="text-[10px] text-on-surface-variant font-bold">{getGenreLabel(movie.genre_ids)}</span>
                    </div>
                    <h4 className="font-headline text-base font-bold truncate group-hover:text-tertiary transition-colors">{movie.title}</h4>
                    {/* Progress Bar Graphic */}
                    <div className="w-full h-1 bg-surface-container-highest rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-tertiary rounded-full w-[85%]" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </section>

      </main>
      </>
      )}

      {/* ── 5. Minimalist Footer ── */}
      <footer className="w-full bg-surface-container-highest/20 border-t border-white/5 py-12 flex flex-col items-center justify-center text-center gap-6">
        <div className="flex items-center gap-6 lg:gap-12 flex-wrap justify-center font-label text-[10px] uppercase font-bold tracking-widest text-on-surface-variant/60">
          <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-primary transition-colors">Cookies</a>
          <a href="#" className="hover:text-primary transition-colors">Help Center</a>
          <a href="#" className="hover:text-primary transition-colors">Auteur Log</a>
        </div>
        <p className="text-on-surface-variant/40 font-body text-xs">© 2026 Indie_Flix. By CineSwipe & Stitch A.N.</p>
      </footer>

    </div>
  );
}
