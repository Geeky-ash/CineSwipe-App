import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const POSTER_BASE = 'https://image.tmdb.org/t/p/w500';

export default function Profile() {
  const { session, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('movies'); // 'movies' | 'actors'
  
  const [movies, setMovies] = useState([]);
  const [actors, setActors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLibrary() {
      if (!session?.user) return;
      setLoading(true);
      
      const [moviesRes, actorsRes] = await Promise.all([
        supabase.from('Watchlist').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }),
        supabase.from('SavedActors').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false })
      ]);

      if (moviesRes.data) setMovies(moviesRes.data);
      if (actorsRes.data) setActors(actorsRes.data);
      
      setLoading(false);
    }
    fetchLibrary();
  }, [session]);

  const handleUnlikeMovie = async (movieId) => {
    setMovies(prev => prev.filter(m => m.movie_id !== movieId));
    await supabase.from('Watchlist').delete().eq('movie_id', movieId).eq('user_id', session.user.id);
  };

  const handleUnlikeActor = async (actorId) => {
    setActors(prev => prev.filter(a => a.actor_id !== actorId));
    await supabase.from('SavedActors').delete().eq('actor_id', actorId).eq('user_id', session.user.id);
  };

  // Prevent flicker before auth kicks in / redirects
  if (!session?.user) return null;

  return (
    <div className="bg-surface-container-lowest text-on-surface min-h-screen pb-28 font-body antialiased relative overflow-x-hidden">
      
      {/* Cinematic Background Glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-32 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-tertiary/10 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative pt-12 pb-6 px-6 max-w-2xl mx-auto flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          {session.user.user_metadata?.avatar_url ? (
            <img src={session.user.user_metadata.avatar_url} alt="Profile" className="w-14 h-14 rounded-full border-2 border-primary/40 shadow-xl" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-surface-container-highest flex items-center justify-center border-2 border-outline-variant/20 shadow-xl">
              <span className="material-symbols-outlined text-2xl">person</span>
            </div>
          )}
          <div>
            <h1 className="font-headline text-2xl font-bold tracking-tight">
              {session.user.user_metadata?.full_name || 'My Profile'}
            </h1>
            <p className="text-on-surface-variant text-sm font-medium">Library Collection</p>
          </div>
        </div>
        
        <button
          onClick={signOut}
          className="flex items-center justify-center w-10 h-10 rounded-full glass-panel border border-outline-variant/20 hover:text-error hover:border-error/30 transition-all shadow-md"
          title="Sign Out"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
        </button>
      </header>

      {/* Glassmorphic Tabs */}
      <div className="max-w-2xl mx-auto px-6 mb-8 relative z-10">
        <div className="flex p-1 bg-surface-container-high/60 backdrop-blur-md rounded-2xl border border-outline-variant/10 shadow-inner">
          <button
            onClick={() => setActiveTab('movies')}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all relative ${activeTab === 'movies' ? 'text-on-surface shadow-md' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            {activeTab === 'movies' && (
              <motion.div layoutId="profileTabBg" className="absolute inset-0 bg-surface-container-lowest rounded-xl border border-outline-variant/5" />
            )}
            <span className="relative z-10">Movies</span>
          </button>
          <button
            onClick={() => setActiveTab('actors')}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all relative ${activeTab === 'actors' ? 'text-on-surface shadow-md' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            {activeTab === 'actors' && (
              <motion.div layoutId="profileTabBg" className="absolute inset-0 bg-surface-container-lowest rounded-xl border border-outline-variant/5" />
            )}
            <span className="relative z-10">Actors</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">autorenew</span>
        </div>
      ) : (
        <main className="max-w-2xl mx-auto px-6 relative z-10 min-h-[50vh]">
          <AnimatePresence mode="wait">
            {activeTab === 'movies' ? (
              <motion.div
                key="movies"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {movies.length === 0 ? (
                  <EmptyState type="movies" onExplore={() => navigate('/')} />
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <AnimatePresence>
                      {movies.map(movie => (
                        <motion.div
                          layout
                          initial={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          key={movie.movie_id} 
                          className="relative aspect-[2/3] rounded-2xl overflow-hidden glass-panel border border-outline-variant/10 shadow-lg group cursor-pointer"
                        >
                          {/* Image explicitly links to details */}
                          <img 
                            src={`${POSTER_BASE}${movie.poster_path}`} 
                            alt={movie.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onClick={() => navigate(`/movie/${movie.movie_id}`)}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 pointer-events-none" />
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleUnlikeMovie(movie.movie_id); }}
                            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-error/80 hover:border-error transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px] text-white">heart_broken</span>
                          </button>
                          <div className="absolute bottom-3 left-3 right-3 pointer-events-none">
                            <p className="font-headline text-sm font-bold leading-tight line-clamp-2 text-white">{movie.title}</p>
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
                transition={{ duration: 0.2 }}
              >
                {actors.length === 0 ? (
                  <EmptyState type="actors" onExplore={() => navigate('/discover')} />
                ) : (
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-6">
                    <AnimatePresence>
                      {actors.map(actor => (
                        <motion.div
                          layout
                          initial={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          key={actor.actor_id} 
                          className="flex flex-col items-center group relative"
                        >
                          <div className="w-24 h-24 rounded-full overflow-hidden glass-panel border border-outline-variant/20 shadow-lg mb-3 relative">
                            {actor.profile_path ? (
                              <img 
                                src={`${POSTER_BASE}${actor.profile_path}`} 
                                alt={actor.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-3xl">person</span></div>
                            )}
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleUnlikeActor(actor.actor_id); }}
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            >
                              <span className="material-symbols-outlined text-error text-3xl">heart_broken</span>
                            </button>
                          </div>
                          <p className="font-medium text-sm text-center text-on-surface line-clamp-2 leading-tight">{actor.name}</p>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      )}
    </div>
  );
}

function EmptyState({ type, onExplore }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center glass-panel rounded-3xl border border-outline-variant/10">
      <div className="w-20 h-20 rounded-full bg-surface-container-highest flex items-center justify-center mb-6 neon-glow">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant">
          {type === 'movies' ? 'movie' : 'recent_actors'}
        </span>
      </div>
      <h2 className="font-headline text-2xl font-bold mb-3">
        No {type === 'movies' ? 'Movies' : 'Actors'} Saved
      </h2>
      <p className="text-on-surface-variant mb-8 max-w-[260px] leading-relaxed">
        Your library is empty. Start exploring to find {type === 'movies' ? 'films' : 'artists'} you love.
      </p>
      <button 
        onClick={onExplore}
        className="relative overflow-hidden px-8 py-4 rounded-full bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
      >
        <motion.div
          animate={{ x: ['-200%', '200%'] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)' }}
        />
        <span className="material-symbols-outlined text-[20px] filled relative z-10">explore</span>
        <span className="relative z-10">Explore {type === 'movies' ? 'Movies' : 'Discover'}</span>
      </button>
    </div>
  );
}
