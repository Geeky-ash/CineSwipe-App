import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUpcomingMovies, fetchTrendingMovies, fetchTopRatedMovies, getGenreLabel } from '../services/tmdb';
import StitchLoader from '../components/StitchLoader';

const POSTER_BASE = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_BASE = 'https://image.tmdb.org/t/p/original';

const CURATED_MOODS = [
  { label: 'Cyberpunk Visuals', blur: 'bg-primary/20', icon: 'settings_system_daydream' },
  { label: '90s Nostalgia', blur: 'bg-tertiary/20', icon: 'animation' },
  { label: 'Neon Underworld', blur: 'bg-error/20', icon: 'local_fire_department' },
  { label: 'Quiet Contemplation', blur: 'bg-on-surface/20', icon: 'self_improvement' },
];

export default function Discover() {
  const navigate = useNavigate();
  const [upcoming, setUpcoming] = useState([]);
  const [trending, setTrending] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <StitchLoader vibeLabel="Loading Discover…" />;

  const heroMovie = upcoming[0];

  return (
    <div className="bg-surface-container-lowest text-on-surface min-h-[100dvh] pb-28 overflow-x-hidden">
      
      {/* ── 3:1 RESPONSIVE GRID ── */}
      <div className="lg:grid lg:grid-cols-4 max-w-[1800px] mx-auto relative lg:min-h-[100dvh]">
        
        {/* ── MAIN COLUMN (75%) ── */}
        <main className="col-span-3 px-4 lg:px-12 pt-[84px] lg:pt-[100px] pb-10 relative z-10 w-full">
          
          <h1 className="font-headline text-3xl font-bold tracking-tight mb-6">Discover</h1>

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
                    Featured Collection
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

          {/* ── Late Night Thrills — Asymmetric Bento ── */}
          <section className="mb-10">
            <div className="flex items-end justify-between mb-5">
              <h2 className="font-headline text-2xl font-black tracking-tight">Late Night Thrills</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Large card */}
              {upcoming[1] && (
                <div
                  onClick={() => navigate(`/movie/${upcoming[1].id}`)}
                  className="col-span-1 lg:col-span-2 relative rounded-2xl overflow-hidden cursor-pointer group h-[280px] bento-cell"
                >
                  <img
                    alt={upcoming[1].title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    src={`${BACKDROP_BASE}${upcoming[1].backdrop_path || upcoming[1].poster_path}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent pointer-events-none" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <p className="text-primary text-[10px] font-label font-bold uppercase tracking-widest mb-1.5">Neo-Noir</p>
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

          {/* ── Trending Now Grid ── */}
          <section className="mb-10">
            <div className="flex items-end justify-between mb-5">
              <h2 className="font-headline text-2xl font-black tracking-tight">Trending Now</h2>
              <button className="text-primary text-xs font-label font-bold uppercase tracking-widest">See All</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {trending.slice(0, 8).map((movie) => (
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
                      <span className="text-tertiary text-[10px] font-label font-bold tracking-widest uppercase">{getGenreLabel(movie.genre_ids)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Footer ── */}
          <footer className="flex items-center justify-start gap-6 py-8 text-on-surface-variant/40 text-xs font-label">
            <span className="cursor-pointer hover:text-on-surface-variant transition-colors">Privacy</span>
            <span className="cursor-pointer hover:text-on-surface-variant transition-colors">Terms</span>
            <span className="cursor-pointer hover:text-on-surface-variant transition-colors">Studio Access</span>
          </footer>
        </main>

        {/* ── NEON DIVIDER ── */}
        <div className="hidden lg:block absolute left-[75%] top-0 bottom-0 w-[1px] z-30 pointer-events-none"
          style={{
            background: `linear-gradient(to bottom, transparent, rgba(255,138,169,0.3), transparent)`,
          }}
        />

        {/* ── SIDEBAR COLUMN (25%) ── */}
        <aside className="col-span-1 lg:sticky lg:top-0 lg:h-[100dvh] lg:overflow-y-auto px-4 lg:px-8 pt-8 lg:pt-[100px] pb-32 z-20"
          style={{
            background: 'rgba(19, 19, 19, 0.3)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            scrollbarWidth: 'none',
          }}
        >
          {/* Trending Collections */}
          <div className="mb-10">
            <h2 className="font-headline text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-6">
              Trending Collections
            </h2>
            
            <div className="flex flex-col gap-4">
              {['A24 Masterpieces', 'Cannes Winners', '90s Hacker Films', 'French New Wave'].map((col, idx) => (
                <div key={idx} className="group cursor-pointer flex items-center justify-between p-3 rounded-xl hover:bg-surface-container-high transition-all">
                  <div className="flex items-center gap-3">
                    <span className="text-xl opacity-60 group-hover:opacity-100 transition-opacity">
                      {idx === 0 ? '📽️' : idx === 1 ? '🏆' : idx === 2 ? '💻' : '🚬'}
                    </span>
                    <span className="font-body font-bold text-sm text-on-surface group-hover:text-primary transition-colors">
                      {col}
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-[16px] text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">
                    arrow_forward
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Curated Moods */}
          <div className="mb-10">
            <h2 className="font-headline text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">auto_awesome</span>
              Curated Moods
            </h2>
            
            <div className="grid grid-cols-1 gap-3">
              {CURATED_MOODS.map((mood, idx) => (
                <div key={idx} className="relative p-4 rounded-2xl glass-panel ghost-border cursor-pointer group overflow-hidden bg-surface-container-highest">
                  {/* Blur effect blob */}
                  <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-[30px] ${mood.blur} opacity-50 group-hover:opacity-100 transition-opacity`} />
                  
                  <div className="relative z-10 flex items-center gap-3">
                    <span className="material-symbols-outlined text-on-surface text-[20px]">{mood.icon}</span>
                    <span className="font-headline font-bold text-sm tracking-wide">{mood.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
