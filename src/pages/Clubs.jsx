import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { searchMovies } from '../services/tmdb';

/* ═══════════════════════════════════════════════════════════════════════════
   FILM CLUBS — STITCH "AURA NOIR" DESIGN
   ✦ No-Line Rule — tonal shifts only, NEVER 1px solid borders
   ✦ Immersive Cards — glass + tonal layering + inner-glow
   ✦ Neon gradient CTAs — #ff8aa9 → #e4006c at 135°
   ✦ Tertiary (#ab9fff) for success/join states
   ✦ Ghost border fallback — outline-variant (#484847) at 15%
   ═══════════════════════════════════════════════════════════════════════════ */

const MOCK_CLUBS = [
  { id: 'c1', name: 'Sci-Fi Seekers', members: '12.4k', backdrop: 'https://image.tmdb.org/t/p/w780/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg', avatar: '🛸', activeUsers: 342, description: 'Discussing Interstellar, Dune, and the future of cinema.' },
  { id: 'c2', name: 'Horror Hounds', members: '8.1k', backdrop: 'https://image.tmdb.org/t/p/w780/5mzr6JZbrqnqD8rCEvPhuCE5Fw2.jpg', avatar: '🔪', activeUsers: 120, description: "We watch scary movies so you don't have to." },
  { id: 'c3', name: 'A24 Cult', members: '45.2k', backdrop: 'https://image.tmdb.org/t/p/w780/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg', avatar: '🌸', activeUsers: 1405, description: 'Midsommar, Hereditary, Everything Everywhere.' },
  { id: 'c4', name: 'Anime & Chill', members: '22.8k', backdrop: 'https://image.tmdb.org/t/p/w780/39wmItIWsg5sZMyRU84lIPhXmb.jpg', avatar: '🍜', activeUsers: 890, description: 'Studio Ghibli, Makoto Shinkai, and seasonal drops.' },
  { id: 'c5', name: 'Nolan Enthusiasts', members: '18.9k', backdrop: 'https://image.tmdb.org/t/p/w780/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg', avatar: '⏳', activeUsers: 512, description: 'Time is relative, cinema is absolute.' },
  { id: 'c6', name: 'Rom-Com Revival', members: '5.2k', backdrop: 'https://image.tmdb.org/t/p/w780/aO6iEGWXXBuaSlaA4nInL9e8Z6U.jpg', avatar: '💌', activeUsers: 84, description: 'Bringing back the 2000s comfort movies.' },
];

const MOCK_CONVERSATIONS = [
  { id: 'msg1', text: '34 people are discussing the ending of Inception', icon: 'forum', color: 'text-tertiary' },
  { id: 'msg2', text: 'New weekly watchlist: "Underrated 90s Thrillers"', icon: 'movie', color: 'text-primary' },
  { id: 'msg3', text: '120 users joined "Dune Part 2 Hype Train"', icon: 'groups', color: 'text-tertiary' },
  { id: 'msg4', text: 'Live Watch Party: Pulp Fiction starting in 10m', icon: 'play_circle', color: 'text-error' },
];

const SUGGESTED_FRIENDS = [
  { id: 'u1', name: 'Alex M.', sharedTaste: '89% Match', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
  { id: 'u2', name: 'Sarah J.', sharedTaste: '82% Match', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
  { id: 'u3', name: 'David K.', sharedTaste: '75% Match', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David' },
];

/* ── Immersive Club Card ── */
function ImmersiveCard({ club }) {
  const [joined, setJoined] = useState(false);

  const handleJoin = (e) => {
    e.stopPropagation();
    if (joined) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { x, y },
      colors: ['#ff8aa9', '#ab9fff', '#e4006c'],
      disableForReducedMotion: true,
      zIndex: 100,
    });
    setJoined(true);
  };

  return (
    <div className="relative group rounded-2xl overflow-hidden stitch-card cursor-pointer min-h-[220px]">
      {/* Background Image */}
      <img src={club.backdrop} alt={club.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-70" />

      {/* Tonal gradient — surface-container-lowest fade */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />

      {/* Glass layer — surface-variant 40% + 24px blur */}
      <div className="absolute inset-0" style={{
        background: 'rgba(38, 38, 38, 0.4)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }} />

      {/* Content */}
      <div className="relative p-6 h-full flex flex-col justify-end">
        {/* Top Header */}
        <div className="absolute top-5 left-5 right-5 flex justify-between items-start">
          <div className="w-12 h-12 rounded-full bg-surface-variant/30 backdrop-blur-xl flex items-center justify-center text-2xl">
            {club.avatar}
          </div>
          <div className="flex items-center gap-1.5 glass-nav px-2.5 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
            <span className="text-[10px] font-label font-bold text-on-surface tracking-wider">{club.activeUsers} online</span>
          </div>
        </div>

        {/* Info & Action */}
        <div className="mt-14">
          <h3 className="font-headline text-2xl font-black text-on-surface leading-tight">{club.name}</h3>
          <p className="text-on-surface-variant text-sm mt-1 line-clamp-2 max-w-[85%] font-body">{club.description}</p>

          <div className="flex items-center justify-between mt-5">
            <div className="flex items-center gap-4 text-xs font-label font-bold text-on-surface/70 tracking-widest uppercase">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">group</span> {club.members}
              </span>
            </div>

            {/* Primary-Glow Join Button */}
            <button
              onClick={handleJoin}
              className={`relative overflow-hidden px-5 py-2 rounded-full font-bold text-sm transition-all duration-300 ${
                joined
                  ? 'bg-tertiary/20 text-tertiary ghost-border'
                  : 'neon-btn hover:scale-105'
              }`}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                {joined ? (
                  <motion.div key="joined" initial={{ opacity: 0, scale: 0.5, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.5, y: -10 }} className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">check</span> Joined
                  </motion.div>
                ) : (
                  <motion.div key="join" initial={{ opacity: 0, scale: 0.5, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.5, y: -10 }}>
                    Join Club
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function Clubs() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Discover');
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  /* Search handler */
  const handleSearch = async (value) => {
    setQuery(value);
    if (!value.trim()) { setSearchResults([]); return; }
    setSearching(true);
    const results = await searchMovies(value);
    setSearchResults(results);
    setSearching(false);
  };

  return (
    <div className="w-full min-h-[100dvh] bg-surface-container-lowest text-on-surface overflow-x-hidden pb-32 lg:pb-0">

      {/* ── Top Nav ── */}
      <header className="sticky top-0 z-50 pt-4 pb-3"
        style={{
          background: 'linear-gradient(to bottom, #000000 0%, rgba(0,0,0,0.9) 60%, transparent 100%)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <div className="max-w-[1800px] mx-auto px-4 lg:px-12 flex flex-col items-center">
          {/* Title */}
          <h1 className="font-headline text-2xl font-bold tracking-tight mb-4 self-start">Film Clubs</h1>

          {/* Search Bar */}
          <div className="relative w-full mb-4">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              {searching
                ? <span className="material-symbols-outlined text-primary text-sm animate-spin">autorenew</span>
                : <span className="material-symbols-outlined text-on-surface-variant/50 text-[20px]">search</span>
              }
            </div>
            <input
              className="stitch-input"
              placeholder="Search clubs, movies..."
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          {/* Sub-Tabs — NO border-b (No-Line Rule) */}
          <div className="flex gap-8 w-full overflow-x-auto hide-scrollbar px-2 pb-1">
            {['Discover', 'Joined', 'Trending'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative pb-3 text-sm font-bold transition-colors whitespace-nowrap ${
                  activeTab === tab ? 'text-on-surface' : 'text-on-surface-variant hover:text-on-surface/80'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="clubTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 neon-gradient rounded-t-full"
                    style={{ boxShadow: '0 0 8px rgba(255,138,169,0.8)' }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Conversation Pills ── */}
      <div className="mt-2 mb-8 max-w-[1800px] mx-auto px-4 lg:px-12 w-full overflow-hidden">
        <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar py-2">
          {MOCK_CONVERSATIONS.map((msg) => (
            <div key={msg.id} className="flex-shrink-0 flex items-center gap-2.5 bg-surface-container/40 rounded-full px-4 py-2 hover:bg-surface-container-high transition-colors cursor-pointer backdrop-blur-sm">
              <span className={`material-symbols-outlined text-[16px] ${msg.color}`}>{msg.icon}</span>
              <span className="text-xs font-semibold text-on-surface/90 whitespace-nowrap font-body">{msg.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3:1 RESPONSIVE GRID ── */}
      <div className="lg:grid lg:grid-cols-4 max-w-[1800px] mx-auto relative lg:min-h-[70dvh] gap-8 xl:gap-12 px-4 lg:px-12">

        {/* ── Immersive Cards Grid (3fr) ── */}
        <div className="lg:col-span-3 pb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline text-2xl lg:text-3xl font-black tracking-tight">Featured Clubs</h2>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {activeTab === 'Discover' && MOCK_CLUBS.map((club) => <ImmersiveCard key={club.id} club={club} />)}
              {activeTab === 'Trending' && [...MOCK_CLUBS].reverse().map((club) => <ImmersiveCard key={club.id} club={club} />)}
              {activeTab === 'Joined' && (
                <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-surface-container/20 rounded-2xl ghost-border">
                  <span className="text-5xl mb-4">✨</span>
                  <h3 className="font-headline text-xl font-bold">No Clubs Joined</h3>
                  <p className="text-on-surface-variant text-sm mt-2 max-w-sm font-body">
                    Join a community above to see it listed here and unlock member-exclusive movie discussions.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Right Sidebar (1fr) — No border-l (No-Line Rule) ── */}
        <div className="lg:col-span-1 lg:sticky lg:top-32 lg:h-max pt-8 lg:pt-0 lg:pl-8">
          <h2 className="font-headline text-xl font-black tracking-tight mb-6 hidden lg:block">Discover Peers</h2>

          {/* Suggested Friends */}
          <div className="bg-gradient-to-br from-surface-container-high to-surface-container p-6 rounded-2xl inner-glow relative overflow-hidden"
            style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/8 rounded-full blur-[30px] pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-tertiary/8 rounded-full blur-[30px] pointer-events-none" />

            <h3 className="font-headline font-bold text-on-surface mb-5 relative z-10 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">person_add</span>
              Suggested Friends
            </h3>

            <div className="flex flex-col gap-4 relative z-10">
              {SUGGESTED_FRIENDS.map((user) => (
                <div key={user.id} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full bg-surface-container-highest ghost-border group-hover:shadow-[inset_0_0_0_1px_rgba(255,138,169,0.5)] transition-all" />
                    <div>
                      <p className="font-bold text-sm text-on-surface font-body">{user.name}</p>
                      <p className="text-[10px] font-label font-bold text-tertiary uppercase tracking-wider">{user.sharedTaste}</p>
                    </div>
                  </div>
                  <button className="w-8 h-8 rounded-full glass-panel flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-all active:scale-90">
                    <span className="material-symbols-outlined text-[16px]">add</span>
                  </button>
                </div>
              ))}
            </div>

            <button className="w-full mt-6 py-3 rounded-full ghost-btn font-bold text-xs relative z-10">
              Find More Contacts
            </button>
          </div>

          {/* Create Club */}
          <div className="mt-6 p-6 rounded-2xl ghost-border bg-surface-container/30 hover:bg-surface-container transition-colors hidden lg:block cursor-pointer">
            <h3 className="font-headline font-bold text-sm text-on-surface-variant mb-2">Create your own Club?</h3>
            <p className="text-xs text-on-surface-variant/70 leading-relaxed max-w-[90%] font-body">
              Launch a community, host watch parties, and dictate the vibe.
            </p>
            <div className="mt-4 text-primary text-xs font-label font-bold uppercase tracking-widest flex items-center gap-1">
              Start Building <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
