import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useVibe } from '../contexts/VibeContext';
import {
  fetchTrendingMovies,
  fetchTopRatedMovies,
  fetchMovieTrailer,
  fetchMoviesByGenres,
  getGenreLabel,
} from '../services/tmdb';

/* ─── Muted YouTube iframe backdrop ─────────────────────────────────────── */
function ReelVideo({ trailerKey, muted, posterPath }) {
  const POSTER = `https://image.tmdb.org/t/p/original${posterPath}`;

  if (!trailerKey) {
    return (
      <img
        src={POSTER}
        alt="poster"
        className="absolute inset-0 w-full h-full object-cover"
      />
    );
  }

  const src = `https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=${muted ? 1 : 0}&loop=1&playlist=${trailerKey}&controls=0&disablekb=1&fs=0&rel=0&showinfo=0&playsinline=1&modestbranding=1&enablejsapi=0`;

  return (
    <iframe
      key={`${trailerKey}-${muted}`} /* remount on mute toggle */
      className="absolute inset-0 w-full h-full pointer-events-none"
      src={src}
      title="reel"
      allow="autoplay; fullscreen"
      style={{
        border: 'none',
        transform: 'scale(1.35)',
        transformOrigin: 'center center',
      }}
    />
  );
}

/* ─── Single reel card ───────────────────────────────────────────────────── */
function ReelCard({ movie, isActive, onSave, onToggleMute, muted }) {
  const navigate = useNavigate();
  const genre = getGenreLabel(movie.genre_ids);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaved(true);
    await onSave(movie);
  };

  const handleLike = () => setLiked(l => !l);

  return (
    <div className="relative w-full h-[100dvh] flex-shrink-0 overflow-hidden snap-start bg-black">
      {/* Background video / poster */}
      <ReelVideo
        trailerKey={movie.trailer_key}
        muted={!isActive || muted}
        posterPath={movie.backdrop_path || movie.poster_path}
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-black/40 to-transparent pointer-events-none" />

      {/* Tap-to-unmute overlay — only show on active card */}
      {isActive && (
        <button
          onClick={onToggleMute}
          className="absolute top-16 right-4 z-30 glass-panel rounded-full px-3 py-1.5 flex items-center gap-1.5 border border-outline-variant/20 transition-opacity hover:opacity-80"
        >
          <span className="material-symbols-outlined text-sm text-on-surface">
            {muted ? 'volume_off' : 'volume_up'}
          </span>
          <span className="text-[10px] font-medium text-on-surface-variant">
            {muted ? 'Tap to Unmute' : 'Muted'}
          </span>
        </button>
      )}

      {/* ── Bottom-left: movie info (slide-up on mount) ── */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            key={movie.id}
            className="absolute bottom-28 left-5 right-20 z-20 space-y-3"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          >
            {/* Pulsing genre badge */}
            <motion.div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-container/40 border border-tertiary/30 backdrop-blur-sm"
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
              <span className="text-[10px] font-bold tracking-widest text-tertiary uppercase">
                {genre}
              </span>
            </motion.div>

            {/* Title */}
            <h2 className="font-headline text-3xl font-bold leading-tight text-white drop-shadow-2xl line-clamp-2">
              {movie.title}
            </h2>

            {/* Overview */}
            <p className="text-on-surface-variant text-sm leading-relaxed line-clamp-2 max-w-xs">
              {movie.overview}
            </p>

            {/* CTA */}
            <button 
              onClick={() => navigate(`/movie/${movie.id}`)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold text-sm neon-glow transition-transform active:scale-95 shadow-xl shadow-primary/20"
            >
              <span className="material-symbols-outlined text-base filled">info</span>
              View Movie Details
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Right action bar ── */}
      <div className="absolute right-3 bottom-32 z-20 flex flex-col items-center gap-5">
        {/* Like */}
        <motion.button
          onClick={handleLike}
          whileTap={{ scale: 0.85 }}
          className="flex flex-col items-center gap-1"
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all ${liked ? 'bg-primary/30 border-primary' : 'glass-panel border-outline-variant/20'}`}>
            <span className={`material-symbols-outlined text-2xl ${liked ? 'text-primary filled' : 'text-on-surface'}`}>
              favorite
            </span>
          </div>
          <span className="text-[10px] font-medium text-on-surface-variant">Like</span>
        </motion.button>

        {/* Share */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          className="flex flex-col items-center gap-1"
        >
          <div className="glass-panel w-12 h-12 rounded-full flex items-center justify-center border border-outline-variant/20">
            <span className="material-symbols-outlined text-2xl text-on-surface">share</span>
          </div>
          <span className="text-[10px] font-medium text-on-surface-variant">Share</span>
        </motion.button>

        {/* Add to Watchlist */}
        <motion.button
          onClick={handleSave}
          whileTap={{ scale: 0.85 }}
          className="flex flex-col items-center gap-1"
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all ${saved ? 'bg-tertiary/30 border-tertiary' : 'glass-panel border-outline-variant/20'}`}>
            <span className={`material-symbols-outlined text-2xl ${saved ? 'text-tertiary filled' : 'text-on-surface'}`}>
              {saved ? 'bookmark_added' : 'bookmark_add'}
            </span>
          </div>
          <span className="text-[10px] font-medium text-on-surface-variant">
            {saved ? 'Saved!' : 'Watchlist'}
          </span>
        </motion.button>

        {/* Poster thumbnail */}
        <div className="w-12 h-16 rounded-lg overflow-hidden border-2 border-on-surface/20 shadow-xl mt-1">
          <img
            src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}

/* ─── Movie quotes for the Director's Cut loader ────────────────────────── */
const MOVIE_QUOTES = [
  { quote: "I'm gonna make him an offer he can't refuse.", film: 'The Godfather' },
  { quote: 'Here\'s looking at you, kid.', film: 'Casablanca' },
  { quote: 'May the Force be with you.', film: 'Star Wars' },
  { quote: 'After all, tomorrow is another day!', film: 'Gone with the Wind' },
  { quote: 'Why so serious?', film: 'The Dark Knight' },
  { quote: 'To infinity and beyond!', film: 'Toy Story' },
  { quote: 'Just keep swimming.', film: 'Finding Nemo' },
  { quote: "I'll be back.", film: 'The Terminator' },
  { quote: 'My precious.', film: 'The Lord of the Rings' },
  { quote: 'Wakanda forever!', film: 'Black Panther' },
  { quote: 'Life is like a box of chocolates.', film: 'Forrest Gump' },
  { quote: 'With great power comes great responsibility.', film: 'Spider-Man' },
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
    <div className="h-[100dvh] w-full flex flex-col items-center justify-center bg-[#0e0e0e]">
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

/* ─── CineSnaps container ────────────────────────────────────────────────── */
export default function CineSnaps() {
  const { session } = useAuth();
  const { currentVibe, activeVibe } = useVibe();
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const containerRef = useRef(null);
  const observerRef = useRef(null);

  /* Fetch and interleave trending + top-rated, or genre-filtered if vibe active */
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setActiveIndex(0);

        let mixed;
        if (currentVibe) {
          // Vibe mode: fetch genre-filtered movies
          mixed = await fetchMoviesByGenres(currentVibe.genreIds);
        } else {
          // Default: interleave trending + top-rated
          const [trending, topRated] = await Promise.all([
            fetchTrendingMovies(),
            fetchTopRatedMovies(),
          ]);
          mixed = [];
          const limit = Math.min(trending.length, topRated.length, 8);
          for (let i = 0; i < limit; i++) {
            mixed.push(trending[i]);
            mixed.push(topRated[i]);
          }
        }

        const withTrailers = await Promise.all(
          mixed.slice(0, 12).map(async (movie) => {
            const key = await fetchMovieTrailer(movie.id);
            return { ...movie, trailer_key: key };
          })
        );

        setReels(withTrailers);
      } catch (e) {
        console.error('CineSnaps load error:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [activeVibe, currentVibe]);

  /* IntersectionObserver to track active reel */
  useEffect(() => {
    if (!reels.length) return;
    observerRef.current?.disconnect();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.dataset.index);
            setActiveIndex(idx);
          }
        });
      },
      { root: containerRef.current, threshold: 0.6 }
    );

    const cards = containerRef.current?.querySelectorAll('[data-index]');
    cards?.forEach((el) => observer.observe(el));
    observerRef.current = observer;

    return () => observer.disconnect();
  }, [reels]);

  const saveToWatchlist = useCallback(async (movie) => {
    const { error } = await supabase.from('Watchlist').upsert({
      movie_id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      user_id: session?.user?.id ?? null,
      created_at: new Date().toISOString(),
    });
    if (error) console.error('[CineSnaps Watchlist]', error.message);
    else console.log('[CineSnaps] ✅ Saved:', movie.title);
  }, [session]);

  /* ─── Cross-dissolve wrapper ──────────────────────────────────────────── */
  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <motion.div
          key="loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <DirectorsCutLoader
            vibeLabel={currentVibe ? `Loading ${currentVibe.label.split(' ')[0]} CineSnaps…` : null}
          />
        </motion.div>
      ) : (
        <motion.div
          key="reels"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          ref={containerRef}
          className="w-full h-[100dvh] overflow-y-scroll snap-y snap-mandatory touch-pan-y"
          style={{ scrollSnapType: 'y mandatory', overscrollBehavior: 'contain' }}
        >
          {reels.map((movie, i) => (
            <div key={movie.id} data-index={i} className="snap-start snap-always">
              <ReelCard
                movie={movie}
                isActive={i === activeIndex}
                muted={muted}
                onToggleMute={() => setMuted(m => !m)}
                onSave={saveToWatchlist}
              />
            </div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
