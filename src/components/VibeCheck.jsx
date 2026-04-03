import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVibe } from '../contexts/VibeContext';

/* ─── Typewriter hook ───────────────────────────────────────────────────── */
function useTypewriter(text, speed = 40, startDelay = 300) {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayText('');
    setIsComplete(false);
    let i = 0;

    const startTimeout = setTimeout(() => {
      const interval = setInterval(() => {
        if (i < text.length) {
          setDisplayText(text.slice(0, i + 1));
          i++;
        } else {
          setIsComplete(true);
          clearInterval(interval);
        }
      }, speed);

      return () => clearInterval(interval);
    }, startDelay);

    return () => clearTimeout(startTimeout);
  }, [text, speed, startDelay]);

  return { displayText, isComplete };
}

/* ─── AI question flow ──────────────────────────────────────────────────── */
const QUESTIONS = [
  {
    text: "",
    options: [
      { label: '🔥 Pumped up!', value: 'energetic' },
      { label: '😌 Chill & Relaxed', value: 'relaxed' },
      { label: '🤔 Thoughtful', value: 'thoughtful' },
    ],
  },
  {
    text: "Nice! What's the vibe you're craving?",
    variants: {
      energetic: [
        { label: '💥 Action-Packed', vibe: 'action-packed' },
        { label: '🌑 Spooky & Dark', vibe: 'spooky' },
      ],
      relaxed: [
        { label: '🍃 Relaxed & Chill', vibe: 'relaxed' },
        { label: '🌈 Feel-Good', vibe: 'feel-good' },
      ],
      thoughtful: [
        { label: '🥺 Emotional', vibe: 'emotional' },
        { label: '🌑 Spooky & Dark', vibe: 'spooky' },
      ],
    },
  },
];

/* ─── Floating AI Mood-Ring bubble ───────────────────────────────────────── */
function FloatingBubble({ onClick }) {
  return (
    <motion.button
      id="vibe-check-bubble"
      onClick={onClick}
      className="fixed bottom-28 right-5 z-[60] w-14 h-14 rounded-full flex items-center justify-center shadow-2xl cursor-pointer"
      style={{
        background: 'linear-gradient(135deg, rgba(255,177,195,0.25), rgba(0,219,233,0.25))',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,177,195,0.3)',
        boxShadow: '0 0 30px rgba(255,177,195,0.15), 0 8px 32px rgba(0,0,0,0.3)',
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      animate={{
        boxShadow: [
          '0 0 20px rgba(255,177,195,0.15), 0 8px 32px rgba(0,0,0,0.3)',
          '0 0 40px rgba(0,219,233,0.25), 0 8px 32px rgba(0,0,0,0.3)',
          '0 0 20px rgba(255,177,195,0.15), 0 8px 32px rgba(0,0,0,0.3)',
        ],
      }}
      transition={{
        boxShadow: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
      }}
    >
      <span className="text-2xl">🎭</span>
    </motion.button>
  );
}

/* ─── Active vibe indicator (replaces bubble when vibe is set) ──────────── */
function ActiveVibeIndicator({ vibe, onReset, onTap }) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="fixed bottom-28 right-5 z-[60] flex items-center gap-2"
    >
      {/* Reset button */}
      <motion.button
        onClick={onReset}
        className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer"
        style={{
          background: 'rgba(31,31,31,0.7)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="Reset Vibe"
      >
        <span className="material-symbols-outlined text-on-surface-variant text-base">restart_alt</span>
      </motion.button>

      {/* Active vibe pill */}
      <motion.button
        onClick={onTap}
        className="h-11 rounded-full flex items-center gap-2 px-4 cursor-pointer"
        style={{
          background: 'linear-gradient(135deg, rgba(255,177,195,0.2), rgba(0,219,233,0.2))',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,177,195,0.25)',
          boxShadow: `0 0 20px ${vibe.color}22, 0 4px 16px rgba(0,0,0,0.3)`,
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          boxShadow: [
            `0 0 15px ${vibe.color}15, 0 4px 16px rgba(0,0,0,0.3)`,
            `0 0 30px ${vibe.color}30, 0 4px 16px rgba(0,0,0,0.3)`,
            `0 0 15px ${vibe.color}15, 0 4px 16px rgba(0,0,0,0.3)`,
          ],
        }}
        transition={{
          boxShadow: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
        }}
      >
        <span className="text-lg">{vibe.emoji}</span>
        <span className="text-xs font-bold text-on-surface tracking-wide">{vibe.label.split(' ')[0]}</span>
      </motion.button>
    </motion.div>
  );
}

/* ─── Full-screen vibe-check overlay ────────────────────────────────────── */
function VibeOverlay() {
  const { vibePresets, selectVibe, closeVibeCheck } = useVibe();
  const [step, setStep] = useState(0);
  const [mood, setMood] = useState(null);

  const question = QUESTIONS[step];
  const questionText = step === 1 && mood
    ? `${question.text}`
    : question.text;

  const { displayText, isComplete } = useTypewriter(questionText, 35, 200);

  const handleFirstAnswer = (value) => {
    setMood(value);
    setStep(1);
  };

  const handleVibeSelect = (vibeKey) => {
    selectVibe(vibeKey);
  };

  const options = step === 0
    ? question.options
    : question.variants[mood] || question.variants.energetic;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center p-6"
      style={{
        background: 'rgba(8,8,8,0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}
    >
      {/* Close button */}
      <button
        onClick={closeVibeCheck}
        className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center bg-surface-container/60 border border-outline-variant/20 hover:bg-surface-container-high transition-colors z-10"
      >
        <span className="material-symbols-outlined text-on-surface-variant">close</span>
      </button>

      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 20 }}
        className="w-full max-w-sm"
      >
        {/* AI avatar */}
        <motion.div
          className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-8"
          style={{
            background: 'linear-gradient(135deg, rgba(255,177,195,0.2), rgba(0,219,233,0.2))',
            border: '2px solid rgba(255,177,195,0.3)',
            boxShadow: '0 0 40px rgba(255,177,195,0.15), 0 0 80px rgba(0,219,233,0.1)',
          }}
          animate={{
            boxShadow: [
              '0 0 30px rgba(255,177,195,0.1), 0 0 60px rgba(0,219,233,0.05)',
              '0 0 50px rgba(255,177,195,0.25), 0 0 100px rgba(0,219,233,0.15)',
              '0 0 30px rgba(255,177,195,0.1), 0 0 60px rgba(0,219,233,0.05)',
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="text-4xl">🎭</span>
        </motion.div>

        {/* Question with typewriter */}
        <div className="text-center mb-10">
          <p className="font-headline text-xl font-bold text-on-surface leading-relaxed min-h-[3.5rem]">
            {displayText}
            {!isComplete && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="inline-block w-0.5 h-5 bg-primary ml-0.5 align-middle"
              />
            )}
          </p>
        </div>

        {/* Options — only show after typewriter completes */}
        <AnimatePresence mode="wait">
          {isComplete && (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ staggerChildren: 0.1 }}
              className="space-y-3"
            >
              {options.map((opt, i) => (
                <motion.button
                  key={opt.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.12 }}
                  onClick={() =>
                    step === 0
                      ? handleFirstAnswer(opt.value)
                      : handleVibeSelect(opt.vibe)
                  }
                  className="w-full py-4 px-6 rounded-2xl font-bold text-left text-on-surface transition-all duration-200 active:scale-[0.97] cursor-pointer group"
                  style={{
                    background: 'rgba(31,31,31,0.6)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                  whileHover={{
                    borderColor: 'rgba(255,177,195,0.4)',
                    boxShadow: '0 0 20px rgba(255,177,195,0.1)',
                  }}
                >
                  <span className="text-base group-hover:translate-x-1 transition-transform inline-block">
                    {opt.label}
                  </span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step indicator */}
        <div className="flex justify-center gap-2 mt-8">
          {QUESTIONS.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i <= step ? 'w-8 bg-primary' : 'w-4 bg-surface-container-highest'
              }`}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Main VibeCheck export ──────────────────────────────────────────────── */
export default function VibeCheck() {
  const {
    currentVibe,
    hasCompletedVibeCheck,
    showVibeOverlay,
    openVibeCheck,
    resetVibe,
  } = useVibe();

  // Auto-open on first load (only once per session)
  const hasAutoOpened = useRef(false);
  useEffect(() => {
    if (!hasAutoOpened.current && !hasCompletedVibeCheck) {
      hasAutoOpened.current = true;
      const timer = setTimeout(() => openVibeCheck(), 1200);
      return () => clearTimeout(timer);
    }
  }, [hasCompletedVibeCheck, openVibeCheck]);

  return (
    <>
      {/* Floating bubble or active indicator */}
      {currentVibe ? (
        <ActiveVibeIndicator
          vibe={currentVibe}
          onReset={resetVibe}
          onTap={openVibeCheck}
        />
      ) : (
        <FloatingBubble onClick={openVibeCheck} />
      )}

      {/* Full-screen overlay */}
      <AnimatePresence>
        {showVibeOverlay && <VibeOverlay />}
      </AnimatePresence>
    </>
  );
}
