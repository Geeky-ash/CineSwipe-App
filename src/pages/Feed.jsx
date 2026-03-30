import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform, useAnimation } from 'framer-motion';
import { fetchTrendingMovies, fetchTopRatedMovies, fetchMoviesByGenres, getGenreLabel } from '../services/tmdb';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useVibe } from '../contexts/VibeContext';

/* ─── Movie quotes for the Director's Cut loader ────────────────────────── */
const MOVIE_QUOTES = [
  { quote: "I'm gonna make him an offer he can't refuse.", film: 'The Godfather' },
  { quote: 'Here\'s looking at you, kid.', film: 'Casablanca' },
  { quote: 'May the Force be with you.', film: 'Star Wars' },
  { quote: 'After all, tomorrow is another day!', film: 'Gone with the Wind' },
  { quote: 'I see dead people.', film: 'The Sixth Sense' },
  { quote: 'Life is like a box of chocolates.', film: 'Forrest Gump' },
  { quote: 'Why so serious?', film: 'The Dark Knight' },
  { quote: 'To infinity and beyond!', film: 'Toy Story' },
  { quote: "You can't handle the truth!", film: 'A Few Good Men' },
];

const LOADER_ICONS = ['🎥', '🎞️', '🍿'];

function DirectorsCutLoader({ vibeLabel }) {
  const [iconIndex, setIconIndex] = useState(0);
  const randomQuote = useMemo(() => MOVIE_QUOTES[Math.floor(Math.random() * MOVIE_QUOTES.length)], []);

  useEffect(() => {
    const interval = setInterval(() => {
      setIconIndex(i => (i + 1) % LOADER_ICONS.length);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-[100dvh] w-full flex flex-col items-center justify-center bg-[#050505] text-on-surface">
      <AnimatePresence mode="wait">
        <motion.span
          key={iconIndex}
          initial={{ opacity: 0, scale: 0.5, rotateY: -90 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          exit={{ opacity: 0, scale: 0.5, rotateY: 90 }}
          transition={{ duration: 0.3 }}
          className="text-5xl mb-6 block"
        >
          {LOADER_ICONS[iconIndex]}
        </motion.span>
      </AnimatePresence>
      <p className="font-headline tracking-widest text-xs text-on-surface-variant uppercase mb-8">
        {vibeLabel || "Director's Cut Loading…"}
      </p>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="max-w-xs text-center px-6">
        <p className="text-on-surface/70 text-sm italic leading-relaxed">"{randomQuote.quote}"</p>
        <p className="text-on-surface-variant/50 text-[11px] mt-2 font-medium tracking-wide">— {randomQuote.film}</p>
      </motion.div>
    </div>
  );
}

/* ─── Mood chip strip ──────────────────────────────────────────── */
const MOOD_CHIPS = [
  { key: null,             label: '✨ All',        short: 'All' },
  { key: 'action-packed',  label: '🔥 Hype',       short: 'Hype' },
  { key: 'relaxed',        label: '🍿 Chill',      short: 'Chill' },
  { key: 'emotional',      label: '😭 Emotional',  short: 'Emotional' },
  { key: 'spooky',         label: '🌑 Dark',       short: 'Dark' },
  { key: 'feel-good',      label: '🌈 Feel-Good',  short: 'Feel-Good' },
];

function MoodChipStrip({ activeVibe, onSelect }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-40 pointer-events-none" style={{ height: '120px' }}>
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'linear-gradient(to bottom, rgba(5,5,5,0.95) 0%, rgba(5,5,5,0.7) 40%, transparent 100%)',
      }} />
      <div className="relative pt-6 pb-2 pointer-events-auto max-w-[1800px] mx-auto">
        <div className="flex gap-2.5 overflow-x-auto hide-scrollbar px-5 lg:px-12 snap-x snap-mandatory" style={{ WebkitOverflowScrolling: 'touch' }}>
          {MOOD_CHIPS.map((chip) => {
            const isActive = chip.key === activeVibe;
            return (
              <button
                key={chip.label}
                onClick={() => onSelect(chip.key)}
                className={`flex-shrink-0 snap-start px-4 py-2 rounded-full text-sm font-bold tracking-wide transition-all duration-200 active:scale-95 whitespace-nowrap ${
                  isActive ? 'bg-primary text-on-primary shadow-lg shadow-primary/25' : 'text-on-surface-variant border border-outline-variant/30 hover:border-primary/50'
                }`}
                style={isActive ? {} : { background: 'rgba(31,31,31,0.6)', backdropFilter: 'blur(16px)' }}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Hero Stack Card (Moctale Logic) ────────────────────────────────────── */
function HeroCard({ movie, isFront, isSecond, index, onSwipeRight, onSwipeLeft, color }) {
  const navigate = useNavigate();
  const x = useMotionValue(0);
  
  // Maps drag distance to opacity of tint overlays
  const greenOpacity = useTransform(x, [0, 150], [0, 0.8]);
  const redOpacity = useTransform(x, [0, -150], [0, 0.8]);
  
  // Scale and rotation based on drag
  const rotate = useTransform(x, [-200, 200], [-8, 8]);
  const scaleFront = useTransform(x, [-200, 0, 200], [0.95, 1, 0.95]);

  // Second card scales up as top card moves away
  const scaleSecond = useTransform(x, [-200, 0, 200], [1, 0.9, 1]);
  const opacitySecond = useTransform(x, [-200, 0, 200], [1, 0.5, 1]);

  const handleDragEnd = (_, info) => {
    if (info.offset.x > 100) onSwipeRight(movie);
    else if (info.offset.x < -100) onSwipeLeft();
  };

  const variants = {
    front: { scale: 1, y: 0, opacity: 1, zIndex: 10 },
    second: { scale: 0.9, y: 30, opacity: 0.5, zIndex: 5 },
    hidden: { scale: 0.8, y: 60, opacity: 0, zIndex: 0 }
  };

  let animationState = 'hidden';
  if (isFront) animationState = 'front';
  else if (isSecond) animationState = 'second';

  return (
    <motion.div
      className="absolute inset-0 origin-bottom"
      variants={variants}
      initial="hidden"
      animate={animationState}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      style={{
        zIndex: isFront ? 10 : isSecond ? 5 : 0,
        x: isFront ? x : 0,
        rotate: isFront ? rotate : 0,
        scale: isFront ? scaleFront : isSecond ? scaleSecond : 0.8,
        opacity: isSecond && !isFront ? opacitySecond : undefined,
        pointerEvents: isFront ? 'auto' : 'none',
      }}
      drag={isFront ? "x" : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={handleDragEnd}
      whileDrag={{ cursor: 'grabbing' }}
    >
      <div className="relative w-full h-full rounded-[2rem] overflow-hidden shadow-2xl bg-surface-container border border-white/5" style={{ boxShadow: `0 30px 60px -15px ${color}40` }}>
        <img
          src={`https://image.tmdb.org/t/p/w780${movie.poster_path}`}
          alt={movie.title}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
        
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent pointer-events-none" />
        
        {/* Tint Overlays tied to drag offset */}
        {isFront && (
          <>
            <motion.div className="absolute inset-0 bg-green-500 mix-blend-multiply pointer-events-none" style={{ opacity: greenOpacity }} />
            <motion.div className="absolute inset-0 bg-error mix-blend-multiply pointer-events-none" style={{ opacity: redOpacity }} />
            
            <motion.div className="absolute top-10 left-10 border-4 border-green-500 text-green-500 font-headline font-black text-4xl px-6 py-2 rounded-xl rotate-[-15deg] shadow-lg bg-black/20 backdrop-blur-sm" style={{ opacity: greenOpacity }}>LIKE</motion.div>
            <motion.div className="absolute top-10 right-10 border-4 border-error text-error font-headline font-black text-4xl px-6 py-2 rounded-xl rotate-[15deg] shadow-lg bg-black/20 backdrop-blur-sm" style={{ opacity: redOpacity }}>NOPE</motion.div>
          </>
        )}

        {/* Movie Info */}
        <div className="absolute bottom-8 left-8 right-8 pointer-events-none">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-3 py-1 rounded-md bg-tertiary/20 border border-tertiary/30 text-tertiary text-[10px] font-black uppercase tracking-widest backdrop-blur-md">{getGenreLabel(movie.genre_ids)}</span>
            <span className="text-white font-bold text-sm drop-shadow-md flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-tertiary filled">star</span>
              {movie.vote_average?.toFixed(1)}
            </span>
          </div>
          <h2 className="font-headline text-4xl lg:text-5xl font-bold leading-tight text-white drop-shadow-xl mb-2">{movie.title}</h2>
          <p className="text-on-surface text-sm lg:text-base line-clamp-2 max-w-[85%] drop-shadow-md font-medium text-white/80">{movie.overview}</p>
        </div>
        
        {/* Info Button for taps */}
        <button 
          onClick={() => navigate(`/movie/${movie.id}`)}
          className="absolute bottom-8 right-8 w-14 h-14 rounded-full glass-panel flex items-center justify-center pointer-events-auto border border-white/20 hover:bg-white/10 active:scale-90 transition-all shadow-xl"
        >
          <span className="material-symbols-outlined text-white text-3xl">info</span>
        </button>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function Feed() {
  const { session } = useAuth();
  const { currentVibe, activeVibe, selectVibe, resetVibe } = useVibe();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [heroMovies, setHeroMovies] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [topMovies, setTopMovies] = useState([]);
  const [saveStatus, setSaveStatus] = useState('');

  // Use the active vibe color for the background glow, fallback to primary
  const glowColor = currentVibe ? currentVibe.color : '#ff6b35';

  // Animation Controls for Desktop Rebound Sync
  const sidebarControls = useAnimation();
  const dividerControls = useAnimation();

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        const [trending, topRated, discover] = await Promise.all([
          fetchTrendingMovies(),
          fetchTopRatedMovies(),
          currentVibe ? fetchMoviesByGenres(currentVibe.genreIds) : fetchMoviesByGenres([28, 12, 878]) // fallback to Action/Adventure/SciFi for Discovery stack
        ]);

        setTrendingMovies(trending);
        setTopMovies(topRated.slice(0, 10)); // Top 10 for sidebar
        setHeroMovies(discover.filter((m) => m.poster_path)); 
      } catch (e) {
        console.error('Failed to load TMDB data:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [activeVibe, currentVibe]);

  const handleMoodSelect = (vibeKey) => {
    if (vibeKey === null) resetVibe();
    else selectVibe(vibeKey);
  };

  const saveToWatchlist = async (movie) => {
    setSaveStatus('Saving...');
    const userId = session?.user?.id ?? null;
    if (!userId) {
      setSaveStatus('Sign in required');
      setTimeout(() => setSaveStatus(''), 2000);
      return;
    }
    
    const { error } = await supabase.from('Watchlist').upsert({
      movie_id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      user_id: userId,
      created_at: new Date().toISOString(),
    });
    
    if (error) {
      console.error('[Watchlist]', error.message);
      setSaveStatus('Error');
    } else {
      setSaveStatus('Added to Watchlist!');
    }
    setTimeout(() => setSaveStatus(''), 2000);
  };

  // Rebound Animation for Sidebar and Divider
  const triggerRebound = () => {
    sidebarControls.start({
      scale: [1, 0.98, 1],
      transition: { type: 'spring', stiffness: 400, damping: 20 }
    });
    dividerControls.start({
      opacity: [0.3, 0.9, 0.3],
      boxShadow: [`0 0 5px ${glowColor}`, `0 0 25px ${glowColor}`, `0 0 5px ${glowColor}`],
      transition: { duration: 0.4 }
    });
  };

  const handleSwipeRight = (movie) => {
    triggerRebound();
    saveToWatchlist(movie);
    setHeroMovies(prev => prev.slice(1));
  };

  const handleSwipeLeft = () => {
    triggerRebound();
    setHeroMovies(prev => prev.slice(1));
  };

  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
          <DirectorsCutLoader vibeLabel={currentVibe ? `Loading ${currentVibe.label.split(' ')[0]} Hub…` : "Loading Cinematic Hub…"} />
        </motion.div>
      ) : (
        <motion.div
          key="feed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full bg-[#050505] text-on-surface overflow-x-hidden min-h-[100dvh]"
        >
          {/* Dynamic Radial Background Behind the whole page */}
          <div 
            className="fixed top-0 left-0 right-0 h-[80vh] pointer-events-none opacity-[0.15] transition-colors duration-1000 z-0"
            style={{ background: `radial-gradient(circle at 35% -10%, ${glowColor}, transparent 80%)` }}
          />

          <MoodChipStrip activeVibe={activeVibe} onSelect={handleMoodSelect} />

          {/* Toast Notification */}
          <AnimatePresence>
            {saveStatus && (
              <motion.div initial={{ opacity: 0, y: -20, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0 }} className="fixed top-24 left-1/2 z-50 px-5 py-2 rounded-full bg-surface-container-high border border-outline-variant/30 font-bold text-sm shadow-xl backdrop-blur-md">
                {saveStatus}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ════ RESPONSIVE 3:1 SPLIT GRID ════ */}
          <div className="lg:grid lg:grid-cols-4 max-w-[1800px] mx-auto relative lg:min-h-[100dvh]">
            
            {/* ─── LEFT COLUMN: 75% (3fr) ─── */}
            <div className="col-span-3 pb-32 lg:pb-20 relative z-10">
              
              {/* HERO STACK - Centered with negative space */}
              {/* Sticky on desktop, static on mobile */}
              <section className="relative w-full pt-28 px-4 lg:px-12 lg:sticky lg:top-14 h-[65vh] lg:h-[75vh] 2xl:h-[70vh] z-20 flex items-center justify-center">
                <div className="relative w-full h-full max-w-sm lg:max-w-md xl:max-w-lg mx-auto">
                  {heroMovies.length === 0 ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-surface-container rounded-3xl border border-outline-variant/10 text-center px-6 shadow-2xl">
                      <span className="text-5xl mb-4">🎬</span>
                      <h3 className="font-headline font-bold text-2xl text-on-surface mb-2">You're completely caught up!</h3>
                      <p className="text-on-surface-variant text-base">Change your vibe above or check the trending lists below.</p>
                    </div>
                  ) : (
                    <AnimatePresence>
                      {heroMovies.slice(0, 3).reverse().map((movie, idx, arr) => {
                        const isFront = idx === arr.length - 1;
                        const isSecond = idx === arr.length - 2;
                        return (
                          <HeroCard 
                            key={movie.id} 
                            movie={movie} 
                            isFront={isFront} 
                            isSecond={isSecond} 
                            index={idx}
                            onSwipeRight={handleSwipeRight}
                            onSwipeLeft={handleSwipeLeft}
                            color={glowColor}
                          />
                        );
                      })}
                    </AnimatePresence>
                  )}
                </div>
              </section>

              {/* Spacer on Desktop to decouple Hero sticky flow from Talk of the Town */}
              <div className="hidden lg:block h-[15vh] w-full" />

              {/* TALK OF THE TOWN - Horizontal Array */}
              <section className="mt-8 px-4 lg:px-12 lg:pt-16 max-w-5xl mx-auto z-10 relative">
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <h2 className="font-headline text-3xl font-black tracking-tight drop-shadow-md">Talk of the Town</h2>
                    <p className="text-on-surface-variant text-sm font-medium mt-1">Trending cinema near you</p>
                  </div>
                  <button onClick={() => navigate('/clubs')} className="text-primary text-xs font-black uppercase tracking-widest bg-primary/10 hover:bg-primary/20 transition-colors px-4 py-2 rounded-full border border-primary/20">
                    View All
                  </button>
                </div>
                
                <div className="flex overflow-x-auto gap-4 pb-8 pt-2 hide-scrollbar snap-x snap-mandatory -mx-4 px-4 lg:-mx-0 lg:px-0" style={{ WebkitOverflowScrolling: 'touch' }}>
                  {trendingMovies.slice(0, 10).map((movie) => (
                    <div 
                      key={movie.id} 
                      onClick={() => navigate(`/movie/${movie.id}`)}
                      className="snap-start flex-shrink-0 w-40 lg:w-48 relative group cursor-pointer"
                    >
                      {/* Live Glow Border */}
                      <div className="relative rounded-2xl overflow-hidden shadow-xl border border-transparent transition-all group-hover:border-primary group-active:scale-95 duration-300">
                        <div className="absolute inset-0 shadow-[0_0_15px_rgba(255,107,53,0)] group-hover:shadow-[0_0_20px_rgba(255,107,53,0.6)] transition-shadow duration-500 pointer-events-none z-10" />
                        <img 
                          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
                          alt={movie.title} 
                          className="w-full h-[60vw] lg:h-72 object-cover" 
                        />
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-error/90 backdrop-blur-sm text-white text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest shadow-lg">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Live
                        </div>
                      </div>
                      <h3 className="mt-3 text-sm lg:text-base font-bold leading-tight line-clamp-1 group-hover:text-primary transition-colors">{movie.title}</h3>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* ─── DESKTOP NEON DIVIDER (Hidden on Mobile) ─── */}
            <motion.div 
              animate={dividerControls}
              className="hidden lg:block absolute left-[75%] top-0 bottom-0 w-[1px] bg-primary/30 z-30 pointer-events-none"
              style={{ boxShadow: `0 0 10px ${glowColor}`, opacity: 0.3 }}
            >
              <div className="absolute top-0 bottom-0 left-0 w-[1px] bg-gradient-to-b from-transparent via-white/50 to-transparent" />
            </motion.div>

            {/* ─── RIGHT SIDEBAR: 25% (1fr) ─── */}
            <motion.div 
              animate={sidebarControls}
              className="col-span-1 lg:sticky lg:top-0 lg:h-[100dvh] lg:overflow-y-auto px-4 lg:px-8 pt-8 lg:pt-32 pb-32 bg-surface-container-lowest/30 backdrop-blur-xl lg:border-l lg:border-outline-variant/10 z-20"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // Independent scroll, hidden scrollbar
            >
              <style>{`
                /* Hide scrollbar for Chrome, Safari and Opera */
                .lg\\:overflow-y-auto::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-headline text-2xl lg:text-3xl font-black tracking-tight leading-tight">Most<br/>Interested<br/>This Week</h2>
              </div>
              
              <div className="flex flex-col gap-6">
                {topMovies.map((movie, idx) => (
                  <div 
                    key={movie.id} 
                    onClick={() => navigate(`/movie/${movie.id}`)}
                    className="flex lg:flex-col xl:flex-row items-center lg:items-start xl:items-center gap-4 bg-surface-container-low/50 hover:bg-surface-container p-3 rounded-2xl cursor-pointer active:scale-[0.98] transition-all border border-outline-variant/10 shadow-sm hover:shadow-xl"
                  >
                    {/* Big Thumbnail */}
                    <div className="relative w-24 h-32 lg:w-full lg:h-48 xl:w-24 xl:h-32 rounded-xl overflow-hidden shadow-md flex-shrink-0 bg-surface-container-high border border-white/5">
                      <img 
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
                        alt={movie.title} 
                        className="w-full h-full object-cover" 
                      />
                      {/* High contrast rank number overlay */}
                      <div className="absolute -bottom-2 -left-1">
                        <span className="text-7xl font-headline font-black text-transparent leading-none drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]" style={{ WebkitTextStroke: '1.5px rgba(255,255,255,0.9)' }}>
                          {idx + 1}
                        </span>
                      </div>
                    </div>
                    
                    {/* Meta */}
                    <div className="flex flex-col justify-center flex-1 py-1 pr-2 w-full">
                      <p className="text-[10px] font-black text-primary mb-1 uppercase tracking-widest">{getGenreLabel(movie.genre_ids)}</p>
                      <h3 className="font-headline text-lg xl:text-base font-bold leading-tight mb-2 line-clamp-2">{movie.title}</h3>
                      <div className="flex items-center gap-4 text-[11px] font-bold text-on-surface-variant/80">
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">star</span> {movie.vote_average?.toFixed(1)}</span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">calendar_today</span> {movie.release_date?.slice(0,4)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <button onClick={() => navigate('/clubs')} className="w-full mt-8 py-4 rounded-xl border border-outline-variant/20 font-black text-sm text-on-surface-variant hover:bg-surface-container hover:text-white transition-colors shadow-sm">
                JOIN THE COMMUNITY
              </button>
            </motion.div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
