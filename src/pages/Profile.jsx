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
  const [showSettings, setShowSettings] = useState(false);

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

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSettings(true)}
                className="w-12 h-12 rounded-full glass-panel ghost-border flex items-center justify-center hover:bg-surface-container-high transition-colors shadow-lg"
                title="Settings"
              >
                <span className="material-symbols-outlined text-[20px]">settings</span>
              </button>
              <button
                onClick={signOut}
                className="hidden md:flex items-center justify-center gap-2 px-6 py-3 rounded-full glass-panel ghost-border hover:text-error hover:bg-error/10 transition-all font-bold text-sm shadow-lg"
                title="Sign Out"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                Sign Out
              </button>
            </div>
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

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <SettingsModal 
            onClose={() => setShowSettings(false)} 
            signOut={signOut} 
          />
        )}
      </AnimatePresence>
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

function SettingsModal({ onClose, signOut }) {
  const [view, setView] = useState('main'); // 'main' or 'edit'
  const [pushEnabled, setPushEnabled] = useState(true);
  const [privateEnabled, setPrivateEnabled] = useState(false);
  const [dataSaver, setDataSaver] = useState(false);

  const [profileForm, setProfileForm] = useState({
    username: 'cinephile',
    firstName: '',
    lastName: '',
    dob: '',
    bio: ''
  });

  const Toggle = ({ isOn, onToggle }) => (
    <div 
      onClick={onToggle}
      className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-300 ${isOn ? 'bg-primary' : 'bg-surface-container-highest border border-white/10'}`}
    >
      <motion.div 
        layout 
        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
        style={{ left: isOn ? '28px' : '4px' }}
      />
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${view === 'edit' ? 'max-w-lg' : 'max-w-sm'} bg-surface-container-lowest glass-panel ghost-border rounded-3xl overflow-hidden relative shadow-2xl transition-all duration-300`}
      >
        {view === 'main' ? (
          <>
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-surface-container/30">
              <h2 className="font-headline text-lg font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">settings</span>
                Settings
              </h2>
              <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Edit Profile Link */}
              <div 
                onClick={() => setView('edit')}
                className="flex justify-between items-center gap-4 cursor-pointer hover:bg-white/5 p-3 -mx-3 rounded-xl transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-colors">
                    <span className="material-symbols-outlined">edit</span>
                  </div>
                  <div>
                    <p className="font-bold text-on-surface text-sm">Edit Profile</p>
                    <p className="text-xs text-on-surface-variant font-body mt-1">Change your name, username, and bio.</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">chevron_right</span>
              </div>

              <hr className="border-white/5 my-2" />

              {/* Setting Item */}
              <div className="flex justify-between items-center gap-4">
                <div>
                  <p className="font-bold text-on-surface text-sm">Push Notifications</p>
                  <p className="text-xs text-on-surface-variant font-body mt-1">Alerts for matches and messages.</p>
                </div>
                <Toggle isOn={pushEnabled} onToggle={() => setPushEnabled(!pushEnabled)} />
              </div>
              
              {/* Setting Item */}
              <div className="flex justify-between items-center gap-4">
                <div>
                  <p className="font-bold text-on-surface text-sm">Private Account</p>
                  <p className="text-xs text-on-surface-variant font-body mt-1">Hide your library from public view.</p>
                </div>
                <Toggle isOn={privateEnabled} onToggle={() => setPrivateEnabled(!privateEnabled)} />
              </div>

              {/* Setting Item */}
              <div className="flex justify-between items-center gap-4">
                <div>
                  <p className="font-bold text-on-surface text-sm">Data Saver</p>
                  <p className="text-xs text-on-surface-variant font-body mt-1">Use lower quality images to save data.</p>
                </div>
                <Toggle isOn={dataSaver} onToggle={() => setDataSaver(!dataSaver)} />
              </div>

              <hr className="border-white/5 my-4" />

              {/* Action Area */}
              <button
                 onClick={signOut}
                 className="w-full py-3.5 rounded-xl bg-error/10 text-error hover:bg-error/20 transition-colors font-bold flex items-center justify-center gap-2 border border-error/20"
              >
                 <span className="material-symbols-outlined text-[18px]">logout</span>
                 Log Out of Account
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-surface-container/30">
              <div className="flex items-center gap-3">
                <button onClick={() => setView('main')} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                  <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                </button>
                <h2 className="font-headline text-lg font-bold">Edit Profile</h2>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {/* Profile Photo */}
              <div className="flex items-center gap-5 mb-8">
                <div className="w-16 h-16 rounded-full bg-surface-container-high border border-white/10 flex items-center justify-center shadow-lg">
                  <span className="font-headline text-xl font-bold">AS</span>
                </div>
                <div>
                  <p className="font-bold text-sm text-on-surface">Profile photo</p>
                  <button className="text-xs text-primary mt-1 hover:underline font-medium">Upload a new profile photo</button>
                </div>
              </div>

              <div className="space-y-5">
                {/* Username */}
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1.5 ml-1">Username</label>
                  <input 
                    type="text" 
                    value={profileForm.username}
                    onChange={(e) => setProfileForm({...profileForm, username: e.target.value})}
                    className="w-full bg-surface-container/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary/50 focus:bg-surface-container focus:ring-1 focus:ring-primary/50 transition-all font-body" 
                    placeholder="Username" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* First Name */}
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant mb-1.5 ml-1">First name</label>
                    <input 
                      type="text" 
                      value={profileForm.firstName}
                      onChange={(e) => setProfileForm({...profileForm, firstName: e.target.value})}
                      className="w-full bg-surface-container/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary/50 focus:bg-surface-container focus:ring-1 focus:ring-primary/50 transition-all font-body" 
                      placeholder="First name" 
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant mb-1.5 ml-1">Last name</label>
                    <input 
                      type="text" 
                      value={profileForm.lastName}
                      onChange={(e) => setProfileForm({...profileForm, lastName: e.target.value})}
                      className="w-full bg-surface-container/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary/50 focus:bg-surface-container focus:ring-1 focus:ring-primary/50 transition-all font-body" 
                      placeholder="Last name" 
                    />
                  </div>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1.5 ml-1">Date of birth</label>
                  <input 
                    type="text" 
                    value={profileForm.dob}
                    onChange={(e) => setProfileForm({...profileForm, dob: e.target.value})}
                    className="w-full bg-surface-container/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary/50 focus:bg-surface-container focus:ring-1 focus:ring-primary/50 transition-all font-body" 
                    placeholder="DD/MM/YYYY" 
                  />
                  <p className="text-[10px] text-on-surface-variant mt-1.5 ml-1">This won't be shown publicly. Enter in DD/MM/YYYY format.</p>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1.5 ml-1">Bio</label>
                  <textarea 
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                    className="w-full bg-surface-container/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary/50 focus:bg-surface-container focus:ring-1 focus:ring-primary/50 transition-all min-h-[100px] resize-none font-body" 
                    placeholder="Tell us about yourself"
                  ></textarea>
                  <p className="text-[10px] text-on-surface-variant mt-1.5 ml-1">Write a short bio to tell people more about yourself.</p>
                </div>
              </div>

              <button 
                onClick={() => setView('main')}
                className="w-full mt-6 py-3.5 rounded-xl neon-btn font-bold text-sm shadow-[0_0_20px_rgba(255,138,169,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Save Changes
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
