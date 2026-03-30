import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
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
    <div className="absolute top-0 left-0 right-0 z-40 pointer-events-none" style={{ height: '120px' }}>
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'linear-gradient(to bottom, rgba(5,5,5,0.9) 0%, rgba(5,5,5,0.4) 60%, transparent 100%)',
      }} />
      <div className="relative pt-6 pb-2 pointer-events-auto">
        <div className="flex gap-2.5 overflow-x-auto hide-scrollbar px-5 snap-x snap-mandatory" style={{ WebkitOverflowScrolling: 'touch' }}>
          {MOOD_CHIPS.map((chip) => {
            const isActive = chip.key === activeVibe;
            return (
              <button
                key={chip.label}
                onClick={() => onSelect(chip.key)}
                className={`flex-shrink-0 snap-start px-4 py-2 rounded-full text-sm font-bold tracking-wide transition-all duration-200 active:scale-95 whitespace-nowrap ${
                  isActive ? 'bg-primary text-on-primary shadow-lg shadow-primary/25' : 'text-on-surface-variant border border-outline-variant/25 hover:border-primary/40'
                }`}
                style={isActive ? {} : { background: 'rgba(31,31,31,0.5)', backdropFilter: 'blur(12px)' }}
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

  // Base animation properties based on position in stack
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
      <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl bg-surface-container" style={{ boxShadow: `0 20px 50px -12px ${color}55` }}>
        <img
          src={`https://image.tmdb.org/t/p/w780${movie.poster_path}`}
          alt={movie.title}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
        
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
        
        {/* Tint Overlays tied to drag offset */}
        {isFront && (
          <>
            <motion.div className="absolute inset-0 bg-green-500 mix-blend-multiply pointer-events-none" style={{ opacity: greenOpacity }} />
            <motion.div className="absolute inset-0 bg-error mix-blend-multiply pointer-events-none" style={{ opacity: redOpacity }} />
            
            {/* Stamp icons */}
            <motion.div className="absolute top-8 left-8 border-4 border-green-500 text-green-500 font-headline font-bold text-4xl px-4 py-2 rounded-xl rotate-[-15deg]" style={{ opacity: greenOpacity }}>LIKE</motion.div>
            <motion.div className="absolute top-8 right-8 border-4 border-error text-error font-headline font-bold text-4xl px-4 py-2 rounded-xl rotate-[15deg]" style={{ opacity: redOpacity }}>NOPE</motion.div>
          </>
        )}

        {/* Movie Info */}
        <div className="absolute bottom-6 left-6 right-6 pointer-events-none">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded bg-tertiary-container text-on-tertiary-container text-xs font-bold uppercase tracking-wider">{getGenreLabel(movie.genre_ids)}</span>
            <span className="text-on-surface-variant font-medium text-xs shadow-sm">⭐ {movie.vote_average?.toFixed(1)}</span>
          </div>
          <h2 className="font-headline text-3xl font-bold leading-tight text-white drop-shadow-lg mb-1">{movie.title}</h2>
          <p className="text-on-surface-variant text-sm line-clamp-2 max-w-[90%] shadow-sm">{movie.overview}</p>
        </div>
        
        {/* Info Button for taps */}
        <button 
          onClick={() => navigate(`/movie/${movie.id}`)}
          className="absolute bottom-6 right-6 w-12 h-12 rounded-full glass-panel flex items-center justify-center pointer-events-auto border border-white/20 active:scale-90"
        >
          <span className="material-symbols-outlined text-white">info</span>
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
        setTopMovies(topRated.slice(0, 10)); // Just top 10
        // Use discover for stack, skip first few if they overlap heavily
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

  const handleSwipeRight = (movie) => {
    saveToWatchlist(movie);
    setHeroMovies(prev => prev.slice(1));
  };

  const handleSwipeLeft = () => {
    setHeroMovies(prev => prev.slice(1));
  };

  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
          <DirectorsCutLoader vibeLabel={currentVibe ? `Loading ${currentVibe.label.split(' ')[0]} Hub…` : "Loading Moctale Feed…"} />
        </motion.div>
      ) : (
        <motion.div
          key="feed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative w-full min-h-[100dvh] bg-[#050505] text-on-surface overflow-x-hidden pb-32" // deep cinematic black
        >
          {/* Dynamic Radial Background Behind Stack */}
          <div 
            className="absolute top-0 left-0 right-0 h-[80vh] pointer-events-none opacity-20 transition-colors duration-1000"
            style={{ background: `radial-gradient(circle at 50% -10%, ${glowColor}, transparent 70%)` }}
          />

          <MoodChipStrip activeVibe={activeVibe} onSelect={handleMoodSelect} />

          {/* Toast Notification */}
          <AnimatePresence>
            {saveStatus && (
              <motion.div initial={{ opacity: 0, y: -20, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0 }} className="fixed top-24 left-1/2 z-50 px-5 py-2 rounded-full bg-surface-container-high border border-outline-variant/30 font-bold text-sm shadow-xl">
                {saveStatus}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── SECTION 1: Stacked Card Swipe (Hero) ─── */}
          {/* Height is locked to 65vh to ensure scroll safe zone below */}
          <section className="relative w-full pt-20 px-4" style={{ height: '65vh' }}>
            <div className="relative w-full h-full max-w-sm mx-auto">
              {heroMovies.length === 0 ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-surface-container rounded-2xl border border-outline-variant/10 text-center px-6">
                  <span className="text-4xl mb-2">🎬</span>
                  <h3 className="font-headline font-bold text-lg text-on-surface">You caught up!</h3>
                  <p className="text-on-surface-variant text-sm mt-1">Change your vibe or check the trending lists below.</p>
                </div>
              ) : (
                <AnimatePresence>
                  {heroMovies.slice(0, 3).reverse().map((movie, idx, arr) => {
                    // Logic handles top 3 items in reversed array
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

          {/* Spacer block to provide safe swipe vs scroll zone */}
          <div className="h-4 w-full" />

          {/* ─── SECTION 2: Talk of the Town (Horizontal) ─── */}
          <section className="mt-8 px-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-headline text-2xl font-bold tracking-tight">Talk of the Town</h2>
                <p className="text-on-surface-variant text-xs">Trending near you</p>
              </div>
              <button onClick={() => navigate('/discover')} className="text-primary text-xs font-bold uppercase tracking-wider bg-primary/10 px-3 py-1.5 rounded-full">
                View All
              </button>
            </div>
            
            <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar snap-x snap-mandatory -mx-4 px-4" style={{ WebkitOverflowScrolling: 'touch' }}>
              {trendingMovies.slice(0, 10).map((movie) => (
                <div 
                  key={movie.id} 
                  onClick={() => navigate(`/movie/${movie.id}`)}
                  className="snap-start flex-shrink-0 w-36 relative group cursor-pointer"
                >
                  {/* Live Glow Border using custom Tailwind classes setup */}
                  <div className="relative rounded-xl overflow-hidden shadow-lg border-2 border-transparent transition-all group-hover:border-primary">
                    {/* The animated glow is simulated with shadow on hover in this implementation for performance, or we can use a direct glow shadow */}
                    <div className="absolute inset-0 shadow-[0_0_15px_rgba(255,107,53,0)] group-hover:shadow-[0_0_15px_rgba(255,107,53,0.5)] transition-shadow duration-300 pointer-events-none z-10" />
                    <img 
                      src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
                      alt={movie.title} 
                      className="w-full h-[52vw] max-h-56 object-cover" 
                    />
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-error text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider shadow-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Live
                    </div>
                  </div>
                  <h3 className="mt-2 text-sm font-bold leading-tight line-clamp-1 group-hover:text-primary transition-colors">{movie.title}</h3>
                </div>
              ))}
            </div>
          </section>

          {/* ─── SECTION 3: Most Interested This Week (Vertical) ─── */}
          <section className="mt-8 px-4 max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-headline text-2xl font-bold tracking-tight">Most Interested This Week</h2>
            </div>
            
            <div className="flex flex-col gap-5">
              {topMovies.map((movie, idx) => (
                <div 
                  key={movie.id} 
                  onClick={() => navigate(`/movie/${movie.id}`)}
                  className="flex items-center gap-4 bg-surface-container-low p-3 rounded-2xl cursor-pointer hover:bg-surface-container active:scale-[0.98] transition-all border border-outline-variant/5"
                >
                  <div className="relative w-24 h-32 rounded-xl overflow-hidden shadow-md flex-shrink-0">
                    <img 
                      src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
                      alt={movie.title} 
                      className="w-full h-full object-cover" 
                    />
                    {/* High contrast rank number overlay */}
                    <div className="absolute -bottom-2 -left-1">
                      <span className="text-7xl font-headline font-black text-transparent leading-none" style={{ WebkitTextStroke: '1.5px rgba(255,255,255,0.9)' }}>
                        {idx + 1}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col justify-center flex-1 py-1 pr-2">
                    <p className="text-[10px] font-bold text-primary mb-1 uppercase tracking-widest">{getGenreLabel(movie.genre_ids)}</p>
                    <h3 className="font-headline text-lg font-bold leading-tight mb-2 line-clamp-2">{movie.title}</h3>
                    <div className="flex items-center gap-4 text-xs font-medium text-on-surface-variant">
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">star</span> {movie.vote_average?.toFixed(1)}</span>
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">calendar_today</span> {movie.release_date?.slice(0,4)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button onClick={() => navigate('/discover')} className="w-full mt-6 py-4 rounded-xl border border-outline-variant/20 font-bold text-on-surface-variant hover:bg-surface-container hover:text-white transition-colors">
              See Full Top 100
            </button>
          </section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
