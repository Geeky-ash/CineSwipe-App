import { createContext, useContext, useState, useCallback } from 'react';

/**
 * Vibe definitions — each mood maps to TMDB genre IDs and a visual theme.
 * These are used to filter Feed + CineSnaps content by mood.
 */
const VIBE_PRESETS = {
  'action-packed': {
    label: 'Action-Packed 💥',
    emoji: '💥',
    genreIds: [28, 12, 878, 53], // Action, Adventure, Sci-Fi, Thriller
    gradient: 'from-red-500/30 to-orange-500/30',
    color: '#ff6b35',
    description: 'Explosions, car chases & edge-of-your-seat thrills',
  },
  'emotional': {
    label: 'Emotional 🥺',
    emoji: '🥺',
    genreIds: [18, 10749, 36], // Drama, Romance, History
    gradient: 'from-pink-500/30 to-purple-500/30',
    color: '#e879f9',
    description: 'Heart-wrenching stories that hit deep',
  },
  'relaxed': {
    label: 'Relaxed & Chill 🍃',
    emoji: '🍃',
    genreIds: [16, 10751, 35, 14], // Animation, Family, Comedy, Fantasy
    gradient: 'from-emerald-500/30 to-cyan-500/30',
    color: '#34d399',
    description: 'Studio Ghibli vibes & chill indie films',
  },
  'spooky': {
    label: 'Spooky & Dark 🌑',
    emoji: '🌑',
    genreIds: [27, 9648, 80, 53], // Horror, Mystery, Crime, Thriller
    gradient: 'from-violet-600/30 to-slate-800/30',
    color: '#8b5cf6',
    description: 'Mysteries, horror & psychological thrills',
  },
  'feel-good': {
    label: 'Feel-Good 🌈',
    emoji: '🌈',
    genreIds: [35, 10402, 10751, 16], // Comedy, Music, Family, Animation
    gradient: 'from-yellow-400/30 to-amber-500/30',
    color: '#fbbf24',
    description: 'Wholesome comedies & musical delights',
  },
};

const VibeContext = createContext(null);

export function VibeProvider({ children }) {
  const [activeVibe, setActiveVibe] = useState(null); // key from VIBE_PRESETS or null
  const [hasCompletedVibeCheck, setHasCompletedVibeCheck] = useState(false);
  const [showVibeOverlay, setShowVibeOverlay] = useState(false);

  const selectVibe = useCallback((vibeKey) => {
    setActiveVibe(vibeKey);
    setHasCompletedVibeCheck(true);
    setShowVibeOverlay(false);
  }, []);

  const resetVibe = useCallback(() => {
    setActiveVibe(null);
    setHasCompletedVibeCheck(false);
  }, []);

  const openVibeCheck = useCallback(() => {
    setShowVibeOverlay(true);
  }, []);

  const closeVibeCheck = useCallback(() => {
    setShowVibeOverlay(false);
  }, []);

  const currentVibe = activeVibe ? VIBE_PRESETS[activeVibe] : null;

  return (
    <VibeContext.Provider
      value={{
        activeVibe,
        currentVibe,
        vibePresets: VIBE_PRESETS,
        hasCompletedVibeCheck,
        showVibeOverlay,
        selectVibe,
        resetVibe,
        openVibeCheck,
        closeVibeCheck,
      }}
    >
      {children}
    </VibeContext.Provider>
  );
}

export function useVibe() {
  const ctx = useContext(VibeContext);
  if (!ctx) throw new Error('useVibe must be inside <VibeProvider>');
  return ctx;
}
