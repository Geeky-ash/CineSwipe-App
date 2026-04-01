import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MOVIE_QUOTES = [
  { quote: "I'm gonna make him an offer he can't refuse.", film: 'The Godfather' },
  { quote: "Here's looking at you, kid.", film: 'Casablanca' },
  { quote: 'May the Force be with you.', film: 'Star Wars' },
  { quote: 'After all, tomorrow is another day!', film: 'Gone with the Wind' },
  { quote: 'I see dead people.', film: 'The Sixth Sense' },
  { quote: 'Life is like a box of chocolates.', film: 'Forrest Gump' },
  { quote: 'Why so serious?', film: 'The Dark Knight' },
  { quote: 'To infinity and beyond!', film: 'Toy Story' },
  { quote: "You can't handle the truth!", film: 'A Few Good Men' },
  { quote: "Just keep swimming.", film: 'Finding Nemo' },
  { quote: "I'll be back.", film: 'The Terminator' },
  { quote: 'My precious.', film: 'The Lord of the Rings' },
  { quote: 'Wakanda forever!', film: 'Black Panther' },
  { quote: 'With great power comes great responsibility.', film: 'Spider-Man' },
];

const LOADER_ICONS = ['🎥', '🎞️', '🍿'];

export default function StitchLoader({ vibeLabel }) {
  const [iconIndex, setIconIndex] = useState(0);
  const randomQuote = useMemo(
    () => MOVIE_QUOTES[Math.floor(Math.random() * MOVIE_QUOTES.length)],
    []
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setIconIndex((i) => (i + 1) % LOADER_ICONS.length);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-[100dvh] w-full flex flex-col items-center justify-center bg-surface-container-lowest text-on-surface">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      {/* Cycling icon */}
      <AnimatePresence mode="wait">
        <motion.span
          key={iconIndex}
          initial={{ opacity: 0, scale: 0.5, rotateY: -90 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          exit={{ opacity: 0, scale: 0.5, rotateY: 90 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="text-6xl mb-8 block relative z-10"
        >
          {LOADER_ICONS[iconIndex]}
        </motion.span>
      </AnimatePresence>

      {/* Label */}
      <p className="font-label tracking-[0.25em] text-xs text-on-surface-variant uppercase mb-8 relative z-10">
        {vibeLabel || "Director's Cut Loading…"}
      </p>

      {/* Quote */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="max-w-xs text-center px-6 relative z-10"
      >
        <p className="text-on-surface-variant/70 text-sm italic leading-relaxed font-body">
          "{randomQuote.quote}"
        </p>
        <p className="text-on-surface-variant/40 text-[11px] mt-2 font-label tracking-wide uppercase">
          — {randomQuote.film}
        </p>
      </motion.div>
    </div>
  );
}
