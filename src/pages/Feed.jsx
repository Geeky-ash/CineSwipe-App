import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchTrendingMovies, fetchMovieTrailer, fetchMoviesByGenres } from '../services/tmdb';
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
  { quote: 'I am Groot.', film: 'Guardians of the Galaxy' },
  { quote: 'Just keep swimming.', film: 'Finding Nemo' },
  { quote: "I'll be back.", film: 'The Terminator' },
  { quote: 'My precious.', film: 'The Lord of the Rings' },
  { quote: 'Wakanda forever!', film: 'Black Panther' },
  { quote: 'With great power comes great responsibility.', film: 'Spider-Man' },
];

/* ─── Cycling icon loader ─────────────────────────────────────────────────── */
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
    <div className="h-[100dvh] w-full flex flex-col items-center justify-center bg-[#0e0e0e] text-on-surface">
      {/* Cycling icon */}
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

      {/* Loading label */}
      <p className="font-headline tracking-widest text-xs text-on-surface-variant uppercase mb-8">
        {vibeLabel || "Director's Cut Loading…"}
      </p>

      {/* Movie quote */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="max-w-xs text-center px-6"
      >
        <p className="text-on-surface/70 text-sm italic leading-relaxed">
          "{randomQuote.quote}"
        </p>
        <p className="text-on-surface-variant/50 text-[11px] mt-2 font-medium tracking-wide">
          — {randomQuote.film}
        </p>
      </motion.div>
    </div>
  );
}

/* ─── YouTube trailer background ────────────────────────────────────────── */
function TrailerBackground({ trailerKey }) {
  if (!trailerKey) return null;
  const src = `https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&loop=1&playlist=${trailerKey}&controls=0&disablekb=1&fs=0&rel=0&showinfo=0&playsinline=1&modestbranding=1`;
  return (
    <iframe
      className="absolute inset-0 w-full h-full pointer-events-none"
      src={src}
      title="Movie Trailer"
      allow="autoplay; fullscreen; picture-in-picture"
      allowFullScreen
      style={{ border: 'none', transform: 'scale(1.4)', transformOrigin: 'center center', opacity: 0.75 }}
    />
  );
}

/* ─── Mood chip strip (top 15%) ──────────────────────────────────────────── */
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
    <div className="absolute top-0 left-0 right-0 z-40 pointer-events-none" style={{ height: '15%' }}>
      {/* Radial gradient overlay — merges seamlessly with the trailer behind */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 120% 100% at 50% 0%, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 55%, transparent 100%)',
        }}
      />

      {/* Chip strip */}
      <div className="relative h-full flex items-end pb-3 pointer-events-auto">
        <div
          className="flex gap-2.5 overflow-x-auto hide-scrollbar px-5 snap-x snap-mandatory"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {MOOD_CHIPS.map((chip) => {
            const isActive = chip.key === activeVibe;
            return (
              <button
                key={chip.label}
                onClick={() => onSelect(chip.key)}
                className={`flex-shrink-0 snap-start px-4 py-2 rounded-full text-sm font-bold tracking-wide transition-all duration-200 active:scale-95 whitespace-nowrap ${
                  isActive
                    ? 'bg-primary text-on-primary shadow-lg shadow-primary/25'
                    : 'text-on-surface-variant border border-outline-variant/25 hover:border-primary/40'
                }`}
                style={
                  isActive
                    ? {}
                    : {
                        background: 'rgba(31,31,31,0.5)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                      }
                }
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

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function Feed() {
  const { session } = useAuth();
  const { currentVibe, activeVibe, selectVibe, resetVibe } = useVibe();
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setIndex(0);

        let data;
        if (currentVibe) {
          data = await fetchMoviesByGenres(currentVibe.genreIds);
        } else {
          data = await fetchTrendingMovies();
        }

        const withTrailers = await Promise.all(
          data.slice(0, 10).map(async (movie) => {
            const key = await fetchMovieTrailer(movie.id);
            return { ...movie, trailer_key: key };
          })
        );
        setMovies(withTrailers);
      } catch (e) {
        console.error('Failed to load TMDB data:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [activeVibe, currentVibe]);

  const handleMoodSelect = (vibeKey) => {
    if (vibeKey === null) {
      resetVibe();
    } else {
      selectVibe(vibeKey);
    }
  };

  const saveToWatchlist = async (movie) => {
    setSaveStatus('');
    const userId = session?.user?.id ?? null;
    const { error } = await supabase.from('Watchlist').upsert({
      movie_id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      user_id: userId,
      created_at: new Date().toISOString(),
    });
    if (error) {
      console.error('[Watchlist] Insert error:', error.message, error.code);
      setSaveStatus('error');
    } else {
      setSaveStatus('saved');
    }
    setTimeout(() => setSaveStatus(''), 2000);
  };

  const nextCard = () => {
    if (index < movies.length - 1) setIndex(i => i + 1);
  };

  const handleDragEnd = (e, { offset }) => {
    if (offset.y < -60) {
      nextCard();
    } else if (offset.y > 60 && index > 0) {
      setIndex(i => i - 1);
    } else if (offset.x > 100) {
      saveToWatchlist(movies[index]);
      nextCard();
    } else if (offset.x < -100) {
      nextCard();
    }
  };

  /* ─── Cross-dissolve wrapper ──────────────────────────────────────────── */
  return (
    <AnimatePresence mode="wait">
      {loading || movies.length === 0 ? (
        <motion.div
          key="loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <DirectorsCutLoader
            vibeLabel={currentVibe ? `Loading ${currentVibe.label.split(' ')[0]} Vibes…` : null}
          />
        </motion.div>
      ) : (
        <motion.div
          key="feed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative w-full h-[100dvh] overflow-hidden bg-black touch-none"
        >
          {/* ── Mood chip strip (top 15%) ── */}
          <MoodChipStrip activeVibe={activeVibe} onSelect={handleMoodSelect} />

          <AnimatePresence initial={false}>
            <motion.div
              key={index}
              className="absolute inset-0 w-full h-full overflow-hidden"
              initial={{ y: '100%', x: 0 }}
              animate={{ y: 0, x: 0 }}
              exit={{ y: '-100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              drag
              dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
              dragElastic={0.35}
              onDragEnd={handleDragEnd}
            >
              {/* Trailer iframe or poster fallback */}
              {movies[index].trailer_key ? (
                <TrailerBackground trailerKey={movies[index].trailer_key} />
              ) : (
                <img
                  src={`https://image.tmdb.org/t/p/original${movies[index].backdrop_path || movies[index].poster_path}`}
                  alt={movies[index].title}
                  className="w-full h-full object-cover pointer-events-none opacity-75"
                />
              )}

              {/* Gradient overlays */}
              <div className="absolute inset-0 vertical-gradient-overlay opacity-90 pointer-events-none" />
              <div className="absolute inset-y-0 right-0 w-32 side-gradient-overlay opacity-80 pointer-events-none" />

              {/* Save status toast */}
              <AnimatePresence>
                {saveStatus && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`absolute top-20 left-1/2 -translate-x-1/2 px-5 py-2 rounded-full text-sm font-bold z-50 ${
                      saveStatus === 'saved'
                        ? 'bg-tertiary text-on-tertiary'
                        : 'bg-error text-on-error'
                    }`}
                  >
                    {saveStatus === 'saved' ? '❤️ Saved to Watchlist!' : '❌ Save failed — check console'}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Side actions */}
              <div className="absolute right-4 bottom-48 flex flex-col items-center gap-6 z-20 pointer-events-auto">
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={() => saveToWatchlist(movies[index])}
                    className="glass-panel w-14 h-14 rounded-full flex items-center justify-center border border-outline-variant/20 transition-transform active:scale-90 hover:border-primary/40"
                  >
                    <span className="material-symbols-outlined text-on-surface text-3xl">favorite</span>
                  </button>
                  <span className="text-[11px] font-medium tracking-wider text-on-surface-variant">Save</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <button className="glass-panel w-14 h-14 rounded-full flex items-center justify-center border border-outline-variant/20 transition-transform active:scale-90">
                    <span className="material-symbols-outlined text-on-surface text-3xl">share</span>
                  </button>
                  <span className="text-[11px] font-medium tracking-wider text-on-surface-variant">Share</span>
                </div>
              </div>

              {/* Movie info */}
              <main className="relative z-10 h-full flex flex-col justify-end px-6 pb-32 pointer-events-none">
                <div className="max-w-md space-y-4 pointer-events-auto">
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-tertiary-container/30 border border-tertiary/20">
                    <span className="text-[10px] font-bold tracking-widest text-tertiary uppercase">
                      {currentVibe ? `${currentVibe.emoji} ${currentVibe.label.split(' ')[0]}` : `TRENDING #${index + 1}`}
                    </span>
                  </div>
                  <h1 className="font-headline text-5xl font-bold leading-none tracking-tight text-white drop-shadow-2xl">
                    {movies[index].title}
                  </h1>
                  <p className="text-on-surface-variant text-base leading-relaxed max-w-[85%] line-clamp-3">
                    {movies[index].overview}
                  </p>
                  <div className="pt-4 flex items-center gap-4 hover:opacity-90">
                    <button
                      onClick={() => navigate(`/movie/${movies[index].id}`)}
                      className="bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold px-8 py-4 rounded-full neon-glow transition-transform active:scale-95 flex items-center gap-2 shadow-xl shadow-primary/20"
                    >
                      <span className="material-symbols-outlined text-xl filled">info</span>
                      Movie Details
                    </button>
                  </div>
                </div>
              </main>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
