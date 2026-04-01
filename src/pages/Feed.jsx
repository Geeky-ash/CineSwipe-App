import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform, useAnimation } from 'framer-motion';
import { fetchTrendingMovies, fetchTopRatedMovies, fetchMoviesByGenres } from '../services/tmdb';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useVibe } from '../contexts/VibeContext';
import StitchLoader from '../components/StitchLoader';

const MOOD_CHIPS = [
  { key: null,            label: '✨ All' },
  { key: 'action-packed', label: '🔥 Hype' },
  { key: 'relaxed',       label: '🍿 Chill' },
  { key: 'emotional',     label: '😭 Emotional' },
  { key: 'spooky',        label: '🌑 Dark' },
  { key: 'feel-good',     label: '🌈 Feel-Good' },
];

function MoodChipStrip({ activeVibe, onSelect }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-40 pointer-events-none lg:pl-[80px]" style={{ height: '110px' }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, transparent 100%)' }} />
      <div className="relative pt-[84px] pb-2 pointer-events-auto max-w-[1800px] mx-auto">
        <div className="flex gap-2.5 overflow-x-auto hide-scrollbar px-5 lg:px-12 snap-x snap-mandatory">
          {MOOD_CHIPS.map((chip) => {
            const isActive = chip.key === activeVibe;
            return (
              <button
                key={chip.label}
                onClick={() => onSelect(chip.key)}
                className={`flex-shrink-0 snap-start px-4 py-2 rounded-full text-sm font-bold tracking-wide transition-all duration-200 active:scale-95 whitespace-nowrap ${
                  isActive ? 'neon-gradient text-on-primary-fixed shadow-lg' : 'text-on-surface-variant bg-surface-container-highest/50 ghost-border hover:text-on-surface'
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

function HeroCard({ movie, isFront, isSecond, onSwipeRight, onSwipeLeft, color }) {
  const navigate = useNavigate();
  const x = useMotionValue(0);

  // Background adaptive blur
  const bgBlur = useTransform(x, [-200, 0, 200], ['blur(15px)', 'blur(40px)', 'blur(15px)']);
  const bgOpacity = useTransform(x, [-200, 0, 200], [0.4, 0.8, 0.4]);

  const greenOpacity = useTransform(x, [0, 150], [0, 0.8]);
  const redOpacity = useTransform(x, [0, -150], [0, 0.8]);
  const rotate = useTransform(x, [-200, 200], [-8, 8]);
  const scaleFront = useTransform(x, [-200, 0, 200], [0.95, 1, 0.95]);
  const scaleSecond = useTransform(x, [-200, 0, 200], [1, 0.95, 1]);
  const opacitySecond = useTransform(x, [-200, 0, 200], [1, 0.5, 1]);

  const handleDragEnd = (_, info) => {
    if (info.offset.x > 100) onSwipeRight(movie);
    else if (info.offset.x < -100) onSwipeLeft();
  };

  const variants = {
    front:  { scale: 1, y: 0, opacity: 1, zIndex: 10 },
    second: { scale: 0.95, y: 20, opacity: 0.5, zIndex: 5 },
    hidden: { scale: 0.9, y: 40, opacity: 0, zIndex: 0 },
  };

  let animationState = 'hidden';
  if (isFront) animationState = 'front';
  else if (isSecond) animationState = 'second';

  return (
    <>
      {isFront && (
        <motion.div 
          className="fixed inset-0 z-[-1] pointer-events-none bg-cover bg-center transition-all duration-300"
          style={{ 
            backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.poster_path})`,
            filter: bgBlur,
            opacity: bgOpacity,
          }}
        />
      )}
      
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
          scale: isFront ? scaleFront : isSecond ? scaleSecond : 0.9,
          opacity: isSecond && !isFront ? opacitySecond : undefined,
          pointerEvents: isFront ? 'auto' : 'none',
        }}
        drag={isFront ? 'x' : false}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        onDragEnd={handleDragEnd}
        whileDrag={{ cursor: 'grabbing' }}
      >
        <div className="relative w-full h-full rounded-[32px] overflow-hidden stitch-card shadow-2xl"
          style={{ boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.1), 0 30px 60px -15px ${color}50` }}
        >
          <img
            src={`https://image.tmdb.org/t/p/w780${movie.backdrop_path || movie.poster_path}`}
            alt={movie.title}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10 pointer-events-none" />

          {isFront && (
            <>
              <motion.div className="absolute inset-0 bg-green-500 mix-blend-multiply pointer-events-none" style={{ opacity: greenOpacity }} />
              <motion.div className="absolute inset-0 bg-error mix-blend-multiply pointer-events-none" style={{ opacity: redOpacity }} />
            </>
          )}

          {/* Neon Auteur Overlay */}
          <div className="absolute bottom-8 left-6 right-6 pointer-events-none">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-0.5 rounded bg-white/10 text-white text-[10px] font-headline font-bold uppercase tracking-widest backdrop-blur-md ghost-border">
                4K ULTRA HD
              </span>
              <span className="px-2 py-0.5 rounded bg-white/10 text-primary text-[10px] font-headline font-bold uppercase tracking-widest backdrop-blur-md ghost-border">
                HDR
              </span>
            </div>
            
            <h2 className="font-headline text-4xl lg:text-5xl font-black leading-tight text-white mb-2 tracking-tighter uppercase whitespace-normal break-words">
              {movie.title}
            </h2>
            
            <p className="text-primary text-[10px] font-headline font-bold uppercase tracking-[0.2em] mb-4">
              {movie.release_date?.slice(0, 4)} • SCI-FI NOIR • 142 MIN
            </p>
            
            <p className="text-on-surface-variant text-sm line-clamp-2 max-w-[90%] font-body leading-relaxed mb-6">
              {movie.overview}
            </p>
            
            {/* Gesture Buttons */}
            <div className="flex items-center gap-4 pointer-events-auto">
              <button
                onClick={(e) => { e.stopPropagation(); onSwipeLeft(); }}
                className="w-14 h-14 rounded-2xl glass-panel flex items-center justify-center ghost-border hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-on-surface-variant text-2xl">close</span>
              </button>
              
              <button
                onClick={(e) => { e.stopPropagation(); onSwipeRight(movie); }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center bg-primary transition-transform active:scale-95"
                style={{
                  boxShadow: '0 0 40px rgba(255,138,169,0.5)',
                }}
              >
                <span className="material-symbols-outlined text-on-primary-fixed text-3xl filled">favorite</span>
              </button>
              
              <button
                onClick={(e) => { e.stopPropagation(); navigate(`/movie/${movie.id}`); }}
                className="w-14 h-14 rounded-2xl glass-panel flex items-center justify-center ghost-border hover:bg-surface-container-high transition-colors ml-auto"
              >
                <span className="material-symbols-outlined text-on-surface-variant text-2xl">info</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

export default function Feed() {
  const { session } = useAuth();
  const { currentVibe, activeVibe, selectVibe, resetVibe } = useVibe();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [heroMovies, setHeroMovies] = useState([]);
  const [saveStatus, setSaveStatus] = useState('');

  const glowColor = currentVibe ? currentVibe.color : '#ff8aa9';
  const dividerControls = useAnimation();

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const discover = currentVibe ? await fetchMoviesByGenres(currentVibe.genreIds) : await fetchMoviesByGenres([28, 12, 878]);
        setHeroMovies(discover.filter((m) => m.poster_path));
      } catch (e) {
        console.error('Failed to load TMDB data:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [activeVibe, currentVibe]);

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
    if (!error) {
      setSaveStatus('Added to Watchlist!');
    }
    setTimeout(() => setSaveStatus(''), 2000);
  };

  const triggerRebound = () => {
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
          className="w-full text-on-surface overflow-x-hidden min-h-[100dvh] relative"
        >
          {/* Base Fallback Color */}
          <div className="fixed inset-0 bg-surface-container-lowest z-[-2]" />

          <MoodChipStrip activeVibe={activeVibe} onSelect={(v) => v === null ? resetVibe() : selectVibe(v)} />

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

          <div className="lg:grid lg:grid-cols-4 max-w-[1800px] mx-auto relative lg:min-h-[100dvh]">
            
            {/* ─── LEFT COLUMN: 75% (3fr) Swipe Area ─── */}
            {/* On Mobile: Pure swipe (100vw, 24px margins) using absolute positioning or flex container */}
            <div className="col-span-3 lg:pb-20 relative z-10 w-full lg:w-auto h-[100dvh] lg:h-auto flex flex-col justify-center">
              
              <section className="relative w-[calc(100vw-48px)] lg:w-full h-[65vh] lg:h-[75vh] 2xl:h-[70vh] mx-auto z-20 flex items-center justify-center mt-12 lg:mt-0 lg:sticky lg:top-14">
                <div className="relative w-full h-full lg:max-w-md xl:max-w-2xl mx-auto">
                  {heroMovies.length === 0 ? (
                    <div className="w-full h-full flex flex-col items-center justify-center glass-panel rounded-[32px] text-center px-6 ghost-border">
                      <span className="text-5xl mb-4">🎬</span>
                      <h3 className="font-headline font-bold text-2xl mb-2">Caught up!</h3>
                      <p className="text-on-surface-variant text-base font-body">Change your vibe above.</p>
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

            {/* ─── RIGHT SIDEBAR: 25% Sub-Navigation (Hidden on Mobile) ─── */}
            <motion.div
              className="hidden lg:block col-span-1 sticky top-0 h-[100dvh] overflow-y-auto px-8 pt-32 pb-32 z-20"
              style={{
                background: 'rgba(19, 19, 19, 0.4)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                scrollbarWidth: 'none',
              }}
            >
              <h2 className="font-headline text-3xl font-black tracking-tight leading-tight mb-8">
                Your<br />Library
              </h2>

              <div className="flex flex-col gap-3">
                <button onClick={() => navigate('/profile')} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-surface-container-high transition-colors text-left group">
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">favorite</span>
                  <div>
                    <h3 className="font-headline font-bold text-lg">My Watchlist</h3>
                    <p className="font-body text-xs text-on-surface-variant">Saved for later</p>
                  </div>
                </button>

                <button onClick={() => navigate('/profile')} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-surface-container-high transition-colors text-left group">
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">history</span>
                  <div>
                    <h3 className="font-headline font-bold text-lg">Watch History</h3>
                    <p className="font-body text-xs text-on-surface-variant">Films you've rated</p>
                  </div>
                </button>
                
                <button onClick={() => navigate('/profile')} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-surface-container-high transition-colors text-left group">
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">person_play</span>
                  <div>
                    <h3 className="font-headline font-bold text-lg">Saved Actors</h3>
                    <p className="font-body text-xs text-on-surface-variant">Your favorites</p>
                  </div>
                </button>

                <div className="h-px w-full bg-white/5 my-4" />

                <button className="flex items-center gap-4 p-4 rounded-2xl hover:bg-surface-container-high transition-colors text-left group">
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">settings</span>
                  <div>
                    <h3 className="font-headline font-bold text-lg">Settings</h3>
                    <p className="font-body text-xs text-on-surface-variant">Preferences & Account</p>
                  </div>
                </button>
              </div>
            </motion.div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
