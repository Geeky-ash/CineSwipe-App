import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const POSTER_BASE = 'https://image.tmdb.org/t/p/w500';

export default function Profile() {
  const { session, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('movies');
  const [movies, setMovies] = useState([]);
  const [actors, setActors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock stats
  const stats = {
    moviesWatched: movies.length * 3 + 12,
    favoriteGenre: 'Sci-Fi',
    clubsJoined: 2,
    watchTime: `${Math.floor((movies.length * 120 + 450) / 60)}h`,
  };

  useEffect(() => {
    async function fetchLibrary() {
      if (!session?.user) return;
      setLoading(true);
      const [moviesRes, actorsRes] = await Promise.all([
        supabase.from('Watchlist').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }),
        supabase.from('SavedActors').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }),
      ]);
      if (moviesRes.data) setMovies(moviesRes.data);
      if (actorsRes.data) setActors(actorsRes.data);
      setLoading(false);
    }
    fetchLibrary();
  }, [session]);

  const handleUnlikeMovie = async (movieId) => {
    setMovies((prev) => prev.filter((m) => m.movie_id !== movieId));
    await supabase.from('Watchlist').delete().eq('movie_id', movieId).eq('user_id', session.user.id);
  };

  const handleUnlikeActor = async (actorId) => {
    setActors((prev) => prev.filter((a) => a.actor_id !== actorId));
    await supabase.from('SavedActors').delete().eq('actor_id', actorId).eq('user_id', session.user.id);
  };

  if (!session?.user) return null;

  return (
    <div className="bg-surface-container-lowest text-on-surface min-h-[100dvh] pb-28 relative overflow-x-hidden">

      {/* Cinematic Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-32 left-0 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-tertiary/8 rounded-full blur-[100px]" />
      </div>

      {/* ── 3:1 RESPONSIVE GRID ── */}
      <div className="lg:grid lg:grid-cols-4 max-w-[1800px] mx-auto relative lg:min-h-[100dvh] z-10">

        {/* ── MAIN COLUMN (75%) ── */}
        <div className="col-span-3 px-4 lg:px-12 pt-[84px] lg:pt-[100px] pb-10 w-full xl:max-w-5xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div className="flex items-center gap-4">
              {session.user.user_metadata?.avatar_url ? (
                <img
                  src={session.user.user_metadata.avatar_url}
                  alt="Profile"
                  className="w-20 h-20 rounded-full ghost-border object-cover"
                  style={{ boxShadow: '0 0 25px rgba(255,138,169,0.15)' }}
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-surface-container-highest flex items-center justify-center ghost-border shadow-2xl">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant">person</span>
                </div>
              )}
              <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">
                  {session.user.user_metadata?.full_name || 'My Profile'}
                </h1>
                <p className="text-primary text-sm font-label uppercase tracking-widest font-bold mt-1">
                  Cinephile
                </p>
              </div>
            </div>

            <button
              onClick={signOut}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-full glass-panel ghost-border hover:text-error hover:bg-error/10 transition-all font-bold text-sm"
              title="Sign Out"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Sign Out
            </button>
          </div>

          {/* Glassmorphic Tab Switcher */}
          <div className="mb-8 relative w-full max-w-sm">
            <div className="flex p-1 glass-panel rounded-2xl">
              {['movies', 'actors'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all relative ${
                    activeTab === tab ? 'text-on-surface' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {activeTab === tab && (
                    <motion.div
                      layoutId="profileTabBg"
                      className="absolute inset-0 bg-surface-container-lowest rounded-xl inner-glow"
                      style={{ boxShadow: 'inset 0 0 0 1px rgba(255,138,169,0.1), 0 4px 16px rgba(0,0,0,0.3)' }}
                    />
                  )}
                  <span className="relative z-10 capitalize font-label tracking-wider">{tab}</span>
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <span className="material-symbols-outlined animate-spin text-4xl text-primary">autorenew</span>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {activeTab === 'movies' ? (
                <motion.div
                  key="movies"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  {movies.length === 0 ? (
                    <EmptyState type="movies" onExplore={() => navigate('/')} />
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                      <AnimatePresence>
                        {movies.map((movie) => (
                          <motion.div
                            layout
                            initial={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            key={movie.movie_id}
                            className="relative aspect-[2/3] rounded-2xl overflow-hidden stitch-card group cursor-pointer"
                          >
                            <img
                              src={`${POSTER_BASE}${movie.poster_path}`}
                              alt={movie.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              onClick={() => navigate(`/movie/${movie.movie_id}`)}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                            <button
                              onClick={(e) => { e.stopPropagation(); handleUnlikeMovie(movie.movie_id); }}
                              className="absolute top-2 right-2 w-8 h-8 rounded-full glass-panel flex items-center justify-center hover:bg-error/80 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <span className="material-symbols-outlined text-[16px] text-on-surface">heart_broken</span>
                            </button>
                            <div className="absolute bottom-3 left-3 right-3 pointer-events-none">
                              <p className="font-headline text-sm font-bold leading-tight line-clamp-2">{movie.title}</p>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="actors"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  {actors.length === 0 ? (
                    <EmptyState type="actors" onExplore={() => navigate('/discover')} />
                  ) : (
                    <div className="grid grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
                      <AnimatePresence>
                        {actors.map((actor) => (
                          <motion.div
                            layout
                            initial={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            key={actor.actor_id}
                            className="flex flex-col items-center group relative"
                          >
                            <div className="w-24 h-24 rounded-full overflow-hidden glass-panel ghost-border mb-3 relative shadow-2xl">
                              {actor.profile_path ? (
                                <img
                                  src={`${POSTER_BASE}${actor.profile_path}`}
                                  alt={actor.name}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="material-symbols-outlined text-3xl">person</span>
                                </div>
                              )}
                              <button
                                onClick={(e) => { e.stopPropagation(); handleUnlikeActor(actor.actor_id); }}
                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                              >
                                <span className="material-symbols-outlined text-error text-3xl">heart_broken</span>
                              </button>
                            </div>
                            <p className="font-body font-medium text-sm text-center text-on-surface line-clamp-2 leading-tight">{actor.name}</p>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* ── NEON DIVIDER ── */}
        <div className="hidden lg:block absolute left-[75%] top-0 bottom-0 w-[1px] z-30 pointer-events-none"
          style={{ background: `linear-gradient(to bottom, transparent, rgba(255,138,169,0.3), transparent)` }}
        />

        {/* ── SIDEBAR COLUMN (25%) ── */}
        <aside className="col-span-1 lg:sticky lg:top-0 lg:h-[100dvh] lg:overflow-y-auto px-4 lg:px-8 pt-8 lg:pt-[100px] pb-32 z-20"
          style={{ background: 'rgba(19, 19, 19, 0.3)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', scrollbarWidth: 'none' }}
        >
          <h2 className="font-headline text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-6 hidden lg:flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">query_stats</span>
            User Stats
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 mb-8">
            <div className="p-5 rounded-2xl glass-panel ghost-border flex flex-col justify-center items-center text-center">
              <span className="material-symbols-outlined text-primary text-3xl mb-2">movie</span>
              <span className="font-headline text-3xl font-black">{stats.moviesWatched}</span>
              <span className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant mt-1">Films Logged</span>
            </div>
            
            <div className="p-5 rounded-2xl glass-panel ghost-border flex flex-col justify-center items-center text-center">
              <span className="material-symbols-outlined text-tertiary text-3xl mb-2">schedule</span>
              <span className="font-headline text-3xl font-black">{stats.watchTime}</span>
              <span className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant mt-1">Watch Time</span>
            </div>

            <div className="p-5 rounded-2xl glass-panel ghost-border flex flex-col justify-center items-center text-center">
              <span className="material-symbols-outlined text-error text-3xl mb-2">auto_awesome</span>
              <span className="font-headline text-2xl font-black">{stats.favoriteGenre}</span>
              <span className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant mt-1">Top Genre</span>
            </div>

            <div className="p-5 rounded-2xl glass-panel ghost-border flex flex-col justify-center items-center text-center">
              <span className="material-symbols-outlined text-success text-3xl mb-2">groups</span>
              <span className="font-headline text-3xl font-black">{stats.clubsJoined}</span>
              <span className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant mt-1">Clubs Joined</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-primary/10 ghost-border relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[40px] rounded-full" />
            <h3 className="font-headline text-sm font-bold uppercase tracking-widest text-primary mb-2 relative z-10">Director's Cut Pro</h3>
            <p className="text-xs font-body text-on-surface-variant mb-4 relative z-10">Unlock extended stats, seamless watch party hosting, and custom profile vibes.</p>
            <button className="w-full py-2.5 rounded-full neon-btn text-xs relative z-10">Upgrade</button>
          </div>
        </aside>

      </div>
    </div>
  );
}

function EmptyState({ type, onExplore }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center glass-panel rounded-2xl ghost-border overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-tertiary/5 pointer-events-none" />
      <div className="w-20 h-20 rounded-full bg-surface-container-highest flex items-center justify-center mb-6 neon-glow relative z-10">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant">
          {type === 'movies' ? 'movie' : 'recent_actors'}
        </span>
      </div>
      <h2 className="font-headline text-2xl font-bold mb-3 relative z-10">
        No {type === 'movies' ? 'Movies' : 'Actors'} Saved
      </h2>
      <p className="text-on-surface-variant mb-8 max-w-[260px] leading-relaxed font-body relative z-10">
        Your library is empty. Start exploring to find {type === 'movies' ? 'films' : 'artists'} you love.
      </p>
      <button onClick={onExplore} className="relative overflow-hidden neon-btn px-8 py-4 text-sm flex items-center gap-2 z-10 hover:scale-105 transition-transform">
        <motion.div
          animate={{ x: ['-200%', '200%'] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }}
        />
        <span className="material-symbols-outlined text-[20px] filled relative z-10">explore</span>
        <span className="relative z-10 font-bold tracking-wide">Explore Discover</span>
      </button>
    </div>
  );
}
