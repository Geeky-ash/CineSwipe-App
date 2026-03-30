import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useAuth } from '../contexts/AuthContext';

/* ─── Mock Data ─── */
const MOCK_CLUBS = [
  {
    id: 'c1',
    name: 'Sci-Fi Seekers',
    members: '12.4k',
    backdrop: 'https://image.tmdb.org/t/p/w780/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg',
    avatar: '🛸',
    activeUsers: 342,
    description: 'Discussing Interstellar, Dune, and the future of cinema.',
  },
  {
    id: 'c2',
    name: 'Horror Hounds',
    members: '8.1k',
    backdrop: 'https://image.tmdb.org/t/p/w780/5mzr6JZbrqnqD8rCEvPhuCE5Fw2.jpg',
    avatar: '🔪',
    activeUsers: 120,
    description: 'We watch scary movies so you don\'t have to.',
  },
  {
    id: 'c3',
    name: 'A24 Cult',
    members: '45.2k',
    backdrop: 'https://image.tmdb.org/t/p/w780/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg',
    avatar: '🌸',
    activeUsers: 1405,
    description: 'Midsommar, Hereditary, Everything Everywhere.',
  },
  {
    id: 'c4',
    name: 'Anime & Chill',
    members: '22.8k',
    backdrop: 'https://image.tmdb.org/t/p/w780/39wmItIWsg5sZMyRU84lIPhXmb.jpg',
    avatar: '🍜',
    activeUsers: 890,
    description: 'Studio Ghibli, Makoto Shinkai, and seasonal drops.',
  },
  {
    id: 'c5',
    name: 'Nolan Enthusiasts',
    members: '18.9k',
    backdrop: 'https://image.tmdb.org/t/p/w780/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg', // Inception/Interstellar vibe
    avatar: '⏳',
    activeUsers: 512,
    description: 'Time is relative, cinema is absolute.',
  },
  {
    id: 'c6',
    name: 'Rom-Com Revival',
    members: '5.2k',
    backdrop: 'https://image.tmdb.org/t/p/w780/aO6iEGWXXBuaSlaA4nInL9e8Z6U.jpg', // Anyone but you vibe
    avatar: '💌',
    activeUsers: 84,
    description: 'Bringing back the 2000s comfort movies.',
  },
];

const MOCK_CONVERSATIONS = [
  { id: 'msg1', text: '34 people are discussing the ending of Inception', icon: 'forum', color: 'text-tertiary' },
  { id: 'msg2', text: 'New weekly watchlist: "Underrated 90s Thrillers"', icon: 'movie', color: 'text-primary' },
  { id: 'msg3', text: '120 users joined "Dune Part 2 Hype Train"', icon: 'groups', color: 'text-success' },
  { id: 'msg4', text: 'Live Watch Party: Pulp Fiction starting in 10m', icon: 'play_circle', color: 'text-error' },
];

const SUGGESTED_FRIENDS = [
  { id: 'u1', name: 'Alex M.', sharedTaste: '89% Match', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
  { id: 'u2', name: 'Sarah J.', sharedTaste: '82% Match', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
  { id: 'u3', name: 'David K.', sharedTaste: '75% Match', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David' },
];

/* ─── Components ─── */

function BentoCard({ club }) {
  const [joined, setJoined] = useState(false);

  const handleJoin = (e) => {
    e.stopPropagation();
    if (joined) return;
    
    // Confetti explosion from button coordinates
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;
    
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { x, y },
      colors: ['#ffb1c3', '#00dbe9', '#ffffff'],
      disableForReducedMotion: true,
      zIndex: 100,
    });
    
    setJoined(true);
  };

  return (
    <div className="relative group rounded-[2rem] overflow-hidden bg-surface-container-high border border-white/10 shadow-xl cursor-pointer hover:border-white/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
      {/* Background Image & Blur */}
      <img src={club.backdrop} alt={club.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-[#0e0e0e]/70 to-transparent" />
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[12px]" />

      {/* Content */}
      <div className="relative p-6 h-full flex flex-col justify-end min-h-[220px]">
        {/* Top Header */}
        <div className="absolute top-5 left-5 right-5 flex justify-between items-start">
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl shadow-lg">
            {club.avatar}
          </div>
          <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-[10px] font-bold text-white tracking-wider">{club.activeUsers} online</span>
          </div>
        </div>

        {/* Info & Action */}
        <div className="mt-14">
          <h3 className="font-headline text-2xl font-black text-white leading-tight drop-shadow-md">{club.name}</h3>
          <p className="text-on-surface-variant text-sm mt-1 line-clamp-2 max-w-[85%]">{club.description}</p>
          
          <div className="flex items-center justify-between mt-5">
            <div className="flex items-center gap-4 text-xs font-bold text-white/70 tracking-widest uppercase">
              <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">group</span> {club.members}</span>
            </div>
            
            <button 
              onClick={handleJoin}
              className={`relative overflow-hidden px-5 py-2 rounded-full font-bold text-sm transition-all duration-300 ${
                joined 
                  ? 'bg-success/20 text-success border border-success/30' 
                  : 'bg-primary text-on-primary hover:scale-105 shadow-[0_0_15px_rgba(255,177,195,0.4)]'
              }`}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                {joined ? (
                  <motion.div key="joined" initial={{ opacity: 0, scale: 0.5, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.5, y: -10 }} className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">check</span> Joined
                  </motion.div>
                ) : (
                  <motion.div key="join" initial={{ opacity: 0, scale: 0.5, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.5, y: -10 }} className="flex items-center gap-1">
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

export default function Clubs() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Discover');

  return (
    <div className="w-full min-h-[100dvh] bg-[#050505] text-on-surface overflow-x-hidden pb-32 lg:pb-0">
      
      {/* ─── Global Top Nav (Explore vs Clubs) ─── */}
      <header className="sticky top-0 z-50 pt-6 pb-4 bg-gradient-to-b from-[#050505]/95 via-[#050505]/80 to-transparent backdrop-blur-xl">
        <div className="max-w-[1800px] mx-auto px-4 lg:px-12 flex flex-col items-center">
          
          {/* Nav Pills */}
          <div className="flex items-center bg-surface-container-high/50 backdrop-blur-md border border-white/5 rounded-full p-1.5 mb-6 shadow-xl">
            <button onClick={() => navigate('/')} className="px-6 py-2 rounded-full text-sm font-bold tracking-wide text-on-surface-variant hover:text-white transition-colors">
              Explore
            </button>
            <button className="px-6 py-2 rounded-full text-sm font-bold tracking-wide bg-surface-container-highest text-white shadow-md border border-white/10">
              Clubs
            </button>
          </div>
          
          {/* Sub-Tabs */}
          <div className="flex gap-8 w-full border-b border-outline-variant/10 overflow-x-auto hide-scrollbar px-2" style={{ WebkitOverflowScrolling: 'touch' }}>
            {['Discover', 'Joined', 'Trending'].map((tab) => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={`relative pb-3 text-sm font-bold transition-colors whitespace-nowrap ${
                  activeTab === tab ? 'text-white' : 'text-on-surface-variant hover:text-white/80'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div layoutId="clubTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_rgba(255,177,195,0.8)] rounded-t-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ─── Talk of the Town Row ─── */}
      <div className="mt-2 mb-8 max-w-[1800px] mx-auto px-4 lg:px-12 w-full overflow-hidden">
        <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar py-2" style={{ WebkitOverflowScrolling: 'touch' }}>
          {MOCK_CONVERSATIONS.map((msg) => (
            <div key={msg.id} className="flex-shrink-0 flex items-center gap-2.5 bg-surface-container-high/30 border border-white/5 rounded-full px-4 py-2 hover:bg-surface-container-high transition-colors cursor-pointer backdrop-blur-sm">
              <span className={`material-symbols-outlined text-[16px] ${msg.color}`}>{msg.icon}</span>
              <span className="text-xs font-semibold text-white/90 whitespace-nowrap">{msg.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 3:1 RESPONSIVE GRID ─── */}
      <div className="lg:grid lg:grid-cols-4 max-w-[1800px] mx-auto relative lg:min-h-[70dvh] gap-8 xl:gap-12 px-4 lg:px-12">
        
        {/* ─── LEFT COLUMN: BENTO GRID (3fr) ─── */}
        <div className="lg:col-span-3 pb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline text-2xl lg:text-3xl font-black tracking-tight drop-shadow-md">Featured Clubs</h2>
          </div>
          
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab} // Animates grid when tab changes
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {activeTab === 'Discover' && MOCK_CLUBS.map((club) => <BentoCard key={club.id} club={club} />)}
              {activeTab === 'Trending' && [...MOCK_CLUBS].reverse().map((club) => <BentoCard key={club.id} club={club} />)}
              {activeTab === 'Joined' && (
                <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-surface-container-low/30 rounded-3xl border border-white/5 border-dashed">
                  <span className="text-5xl mb-4">✨</span>
                  <h3 className="font-headline text-xl font-bold">No Clubs Joined</h3>
                  <p className="text-on-surface-variant text-sm mt-2 max-w-sm">Join a community above to see it listed here and unlock member-exclusive movie discussions.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ─── RIGHT SIDEBAR: SUGGESTED (1fr) ─── */}
        <div className="lg:col-span-1 lg:sticky lg:top-32 lg:h-max pt-8 lg:pt-0 lg:border-l lg:border-outline-variant/10 lg:pl-8">
          <h2 className="font-headline text-xl font-black tracking-tight mb-6 hidden lg:block">Discover Peers</h2>
          
          <div className="bg-gradient-to-br from-surface-container-high to-surface-container-low p-6 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-[30px] pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-tertiary/10 rounded-full blur-[30px] pointer-events-none" />
            
            <h3 className="font-headline font-bold text-white mb-5 relative z-10 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">person_add</span>
              Suggested Friends
            </h3>
            
            <div className="flex flex-col gap-4 relative z-10">
              {SUGGESTED_FRIENDS.map((user) => (
                <div key={user.id} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full bg-surface-container-highest border border-white/10 group-hover:border-primary/50 transition-colors" />
                    <div>
                      <p className="font-bold text-sm text-white">{user.name}</p>
                      <p className="text-[10px] font-bold text-tertiary uppercase tracking-wider">{user.sharedTaste}</p>
                    </div>
                  </div>
                  <button className="w-8 h-8 rounded-full glass-panel flex items-center justify-center border border-white/10 group-hover:bg-primary group-hover:text-on-primary transition-all active:scale-90">
                    <span className="material-symbols-outlined text-[16px]">add</span>
                  </button>
                </div>
              ))}
            </div>
            
            <button className="w-full mt-6 py-3 rounded-full border border-white/10 font-bold text-xs text-on-surface hover:bg-white/5 transition-colors relative z-10">
              Find More Contacts
            </button>
          </div>
          
          {/* Quick Stats or Promo Space (Desktop Only) */}
          <div className="mt-6 p-6 rounded-[2rem] border border-white/5 bg-black hover:border-white/10 transition-colors hidden lg:block cursor-pointer">
            <h3 className="font-headline font-bold text-sm text-on-surface-variant mb-2">Create your own Club?</h3>
            <p className="text-xs text-on-surface-variant/70 leading-relaxed max-w-[90%]">Launch a community, host watch parties, and dictate the vibe.</p>
            <div className="mt-4 text-primary text-xs font-bold uppercase tracking-widest flex items-center gap-1">
              Start Building <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
