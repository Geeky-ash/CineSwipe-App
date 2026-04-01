import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform, useAnimation } from 'framer-motion';
import { fetchTrendingMovies, fetchTopRatedMovies, fetchMoviesByGenres, getGenreLabel } from '../services/tmdb';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useVibe } from '../contexts/VibeContext';
import StitchLoader from '../components/StitchLoader';

/* ─── Mood chip strip ──────────────────────────────────────────── */
const MOOD_CHIPS = [
  { key: null,            label: '✨ All',       short: 'All' },
  { key: 'action-packed', label: '🔥 Hype',      short: 'Hype' },
  { key: 'relaxed',       label: '🍿 Chill',     short: 'Chill' },
  { key: 'emotional',     label: '😭 Emotional', short: 'Emotional' },
  { key: 'spooky',        label: '🌑 Dark',      short: 'Dark' },
  { key: 'feel-good',     label: '🌈 Feel-Good', short: 'Feel-Good' },
];

function MoodChipStrip({ activeVibe, onSelect }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-40 pointer-events-none" style={{ height: '110px' }}>
      {/* Tonal gradient fade — No-Line Rule */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, #000000 0%, rgba(0,0,0,0.85) 40%, transparent 100%)' }}
      />
      <div className="relative pt-5 pb-2 pointer-events-auto max-w-[1800px] mx-auto">
        <div className="flex gap-2.5 overflow-x-auto hide-scrollbar px-5 lg:px-12 snap-x snap-mandatory">
          {MOOD_CHIPS.map((chip) => {
            const isActive = chip.key === activeVibe;
            return (
              <button
                key={chip.label}
                onClick={() => onSelect(chip.key)}
                className={`flex-shrink-0 snap-start px-4 py-2 rounded-full text-sm font-bold tracking-wide transition-all duration-200 active:scale-95 whitespace-nowrap ${
                  isActive
                    ? 'neon-gradient text-on-primary-fixed shadow-lg'
                    : 'text-on-surface-variant ghost-btn'
                }`}
                style={isActive ? { boxShadow: '0 0 20px rgba(255,138,169,0.25)' } : {}}
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

/* ─── Hero Stack Card ────────────────────────────────────────────────── */
function HeroCard({ movie, isFront, isSecond, onSwipeRight, onSwipeLeft, color }) {
  const navigate = useNavigate();
  const x = useMotionValue(0);

  const greenOpacity = useTransform(x, [0, 150], [0, 0.8]);
  const redOpacity = useTransform(x, [0, -150], [0, 0.8]);
  const rotate = useTransform(x, [-200, 200], [-8, 8]);
  const scaleFront = useTransform(x, [-200, 0, 200], [0.95, 1, 0.95]);
  const scaleSecond = useTransform(x, [-200, 0, 200], [1, 0.9, 1]);
  const opacitySecond = useTransform(x, [-200, 0, 200], [1, 0.5, 1]);

  const handleDragEnd = (_, info) => {
    if (info.offset.x > 100) onSwipeRight(movie);
    else if (info.offset.x < -100) onSwipeLeft();
  };

  const variants = {
    front:  { scale: 1, y: 0, opacity: 1, zIndex: 10 },
    second: { scale: 0.9, y: 30, opacity: 0.5, zIndex: 5 },
    hidden: { scale: 0.8, y: 60, opacity: 0, zIndex: 0 },
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
      drag={isFront ? 'x' : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={handleDragEnd}
      whileDrag={{ cursor: 'grabbing' }}
    >
      {/* Card — No-Line Rule: no border. Inner-glow only. */}
      <div className="relative w-full h-full rounded-2xl overflow-hidden stitch-card"
        style={{ boxShadow: `inset 0 0 0 1px rgba(255,138,169,0.08), 0 30px 60px -15px ${color}40` }}
      >
        <img
          src={`https://image.tmdb.org/t/p/w780${movie.poster_path}`}
          alt={movie.title}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent pointer-events-none" />

        {/* Swipe tint overlays */}
        {isFront && (
          <>
            <motion.div className="absolute inset-0 bg-green-500 mix-blend-multiply pointer-events-none" style={{ opacity: greenOpacity }} />
            <motion.div className="absolute inset-0 bg-error mix-blend-multiply pointer-events-none" style={{ opacity: redOpacity }} />
            <motion.div
              className="absolute top-10 left-10 text-green-400 font-headline font-black text-4xl px-6 py-2 rounded-xl rotate-[-15deg] glass-panel"
              style={{ opacity: greenOpacity }}
            >LIKE</motion.div>
            <motion.div
              className="absolute top-10 right-10 text-error font-headline font-black text-4xl px-6 py-2 rounded-xl rotate-[15deg] glass-panel"
              style={{ opacity: redOpacity }}
            >NOPE</motion.div>
          </>
        )}

        {/* Movie Info */}
        <div className="absolute bottom-8 left-8 right-8 pointer-events-none">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-3 py-1 rounded-md bg-tertiary/15 text-tertiary text-[10px] font-label font-black uppercase tracking-widest backdrop-blur-md">
              {getGenreLabel(movie.genre_ids)}
            </span>
            <span className="text-on-surface font-bold text-sm flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-tertiary filled">star</span>
              {movie.vote_average?.toFixed(1)}
            </span>
          </div>
          <h2 className="font-headline text-4xl lg:text-5xl font-bold leading-tight text-on-surface drop-shadow-xl mb-2">
            {movie.title}
          </h2>
          <p className="text-on-surface-variant text-sm lg:text-base line-clamp-2 max-w-[85%] font-body">
            {movie.overview}
          </p>
        </div>

        {/* Info Button */}
        <button
          onClick={() => navigate(`/movie/${movie.id}`)}
          className="absolute bottom-8 right-8 w-14 h-14 rounded-full glass-panel flex items-center justify-center pointer-events-auto ghost-border hover:bg-primary/10 active:scale-90 transition-all"
        >
          <span className="material-symbols-outlined text-on-surface text-3xl">info</span>
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

  const glowColor = currentVibe ? currentVibe.color : '#ff8aa9';
  const sidebarControls = useAnimation();
  const dividerControls = useAnimation();

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [trending, topRated, discover] = await Promise.all([
          fetchTrendingMovies(),
          fetchTopRatedMovies(),
          currentVibe
            ? fetchMoviesByGenres(currentVibe.genreIds)
            : fetchMoviesByGenres([28, 12, 878]),
        ]);
        setTrendingMovies(trending);
        setTopMovies(topRated.slice(0, 10));
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

  const triggerRebound = () => {
    sidebarControls.start({
      scale: [1, 0.98, 1],
      transition: { type: 'spring', stiffness: 400, damping: 20 },
    });
    dividerControls.start({
      opacity: [0.3, 0.9, 0.3],
      boxShadow: [`0 0 5px ${glowColor}`, `0 0 25px ${glowColor}`, `0 0 5px ${glowColor}`],
      transition: { duration: 0.4 },
    });
  };

  const handleSwipeRight = (movie) => {
    triggerRebound();
    saveToWatchlist(movie);
    setHeroMovies((prev) => prev.slice(1));
  };

  const handleSwipeLeft = () => {
    triggerRebound();
    setHeroMovies((prev) => prev.slice(1));
  };

  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
          <StitchLoader vibeLabel={currentVibe ? `Loading ${currentVibe.label.split(' ')[0]} Hub…` : 'Loading Cinematic Hub…'} />
        </motion.div>
      ) : (
        <motion.div
          key="feed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full bg-surface-container-lowest text-on-surface overflow-x-hidden min-h-[100dvh]"
        >
          {/* Dynamic Radial Background */}
          <div
            className="fixed top-0 left-0 right-0 h-[80vh] pointer-events-none opacity-[0.12] transition-colors duration-1000 z-0"
            style={{ background: `radial-gradient(circle at 35% -10%, ${glowColor}, transparent 80%)` }}
          />

          <MoodChipStrip activeVibe={activeVibe} onSelect={handleMoodSelect} />

          {/* Toast */}
          <AnimatePresence>
            {saveStatus && (
              <motion.div
                initial={{ opacity: 0, y: -20, x: '-50%' }}
                animate={{ opacity: 1, y: 0, x: '-50%' }}
                exit={{ opacity: 0 }}
                className="fixed top-24 left-1/2 z-50 px-5 py-2 rounded-full glass-panel font-bold text-sm neon-bloom"
              >
                {saveStatus}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ════ RESPONSIVE 3:1 SPLIT GRID ════ */}
          <div className="lg:grid lg:grid-cols-4 max-w-[1800px] mx-auto relative lg:min-h-[100dvh]">

            {/* ─── LEFT COLUMN: 75% (3fr) ─── */}
            <div className="col-span-3 pb-32 lg:pb-20 relative z-10">

              {/* HERO STACK */}
              <section className="relative w-full pt-28 px-4 lg:px-12 lg:sticky lg:top-14 h-[65vh] lg:h-[75vh] 2xl:h-[70vh] z-20 flex items-center justify-center">
                <div className="relative w-full h-full max-w-sm lg:max-w-md xl:max-w-lg mx-auto">
                  {heroMovies.length === 0 ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-surface-container rounded-2xl text-center px-6 inner-glow">
                      <span className="text-5xl mb-4">🎬</span>
                      <h3 className="font-headline font-bold text-2xl mb-2">You're completely caught up!</h3>
                      <p className="text-on-surface-variant text-base font-body">Change your vibe above or check the trending lists below.</p>
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

              {/* Spacer for Desktop */}
              <div className="hidden lg:block h-[15vh] w-full" />

              {/* TALK OF THE TOWN */}
              <section className="mt-8 px-4 lg:px-12 lg:pt-16 max-w-5xl mx-auto z-10 relative">
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <h2 className="font-headline text-3xl font-black tracking-tight">Talk of the Town</h2>
                    <p className="text-on-surface-variant text-sm font-body mt-1">Trending cinema near you</p>
                  </div>
                  <button
                    onClick={() => navigate('/discover')}
                    className="text-primary text-xs font-label font-black uppercase tracking-widest bg-primary/10 hover:bg-primary/20 transition-colors px-4 py-2 rounded-full"
                  >
                    View All
                  </button>
                </div>

                <div className="flex overflow-x-auto gap-4 pb-8 pt-2 hide-scrollbar snap-x snap-mandatory -mx-4 px-4 lg:-mx-0 lg:px-0">
                  {trendingMovies.slice(0, 10).map((movie) => (
                    <div
                      key={movie.id}
                      onClick={() => navigate(`/movie/${movie.id}`)}
                      className="snap-start flex-shrink-0 w-40 lg:w-48 relative group cursor-pointer"
                    >
                      <div className="relative rounded-2xl overflow-hidden stitch-card">
                        <img
                          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                          alt={movie.title}
                          className="w-full h-[60vw] lg:h-72 object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-error/90 backdrop-blur-sm text-on-surface text-[10px] font-label font-black px-2 py-1 rounded-md uppercase tracking-widest">
                          <span className="w-1.5 h-1.5 rounded-full bg-on-surface animate-pulse" /> Live
                        </div>
                      </div>
                      <h3 className="mt-3 text-sm lg:text-base font-bold leading-tight line-clamp-1 group-hover:text-primary transition-colors font-body">
                        {movie.title}
                      </h3>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* ─── DESKTOP NEON DIVIDER ─── */}
            <motion.div
              animate={dividerControls}
              className="hidden lg:block absolute left-[75%] top-0 bottom-0 w-[1px] z-30 pointer-events-none"
              style={{
                background: `linear-gradient(to bottom, transparent, ${glowColor}40, transparent)`,
                boxShadow: `0 0 10px ${glowColor}`,
                opacity: 0.3,
              }}
            />

            {/* ─── RIGHT SIDEBAR: 25% (1fr) — Glassmorphic ─── */}
            <motion.div
              animate={sidebarControls}
              className="col-span-1 lg:sticky lg:top-0 lg:h-[100dvh] lg:overflow-y-auto px-4 lg:px-8 pt-8 lg:pt-28 pb-32 z-20"
              style={{
                background: 'rgba(19, 19, 19, 0.3)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-headline text-2xl lg:text-3xl font-black tracking-tight leading-tight">
                  Most<br />Interested<br />This Week
                </h2>
              </div>

              <div className="flex flex-col gap-5">
                {topMovies.map((movie, idx) => (
                  <div
                    key={movie.id}
                    onClick={() => navigate(`/movie/${movie.id}`)}
                    className="flex lg:flex-col xl:flex-row items-center lg:items-start xl:items-center gap-4 bg-surface-container/50 hover:bg-surface-container-high p-3 rounded-2xl cursor-pointer active:scale-[0.98] transition-all inner-glow"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-24 h-32 lg:w-full lg:h-48 xl:w-24 xl:h-32 rounded-xl overflow-hidden flex-shrink-0 bg-surface-container-high">
                      <img
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute -bottom-2 -left-1">
                        <span
                          className="text-7xl font-headline font-black text-transparent leading-none"
                          style={{ WebkitTextStroke: '1.5px rgba(255,255,255,0.9)', filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.8))' }}
                        >
                          {idx + 1}
                        </span>
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="flex flex-col justify-center flex-1 py-1 pr-2 w-full">
                      <p className="text-[10px] font-label font-black text-primary mb-1 uppercase tracking-widest">
                        {getGenreLabel(movie.genre_ids)}
                      </p>
                      <h3 className="font-headline text-lg xl:text-base font-bold leading-tight mb-2 line-clamp-2">
                        {movie.title}
                      </h3>
                      <div className="flex items-center gap-4 text-[11px] font-bold text-on-surface-variant/80">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">star</span> {movie.vote_average?.toFixed(1)}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">calendar_today</span> {movie.release_date?.slice(0, 4)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate('/clubs')}
                className="w-full mt-8 py-4 rounded-xl ghost-btn font-black text-sm"
              >
                JOIN THE COMMUNITY
              </button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
