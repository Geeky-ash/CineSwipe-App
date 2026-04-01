import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

/* ── 4-Tab Navigation (Stitch Layout) ──
   Swipe · Discover · Clubs · Profile
   Floating pill — glass-nav (surface-container-low 70% + 24px blur)
   Active icon sits on a neon glow, not a solid bg. */

const NAV_ITEMS = [
  { path: '/',          icon: 'swipe',    label: 'Swipe'    },
  { path: '/discover',  icon: 'explore',  label: 'Discover' },
  { path: '/clubs',     icon: 'groups',   label: 'Clubs'    },
  { path: '/profile',   icon: 'person',   label: 'Profile'  },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[92%] max-w-md glass-nav rounded-full px-4 py-3 z-50 flex justify-around items-center"
      style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}
    >
      {NAV_ITEMS.map(({ path, icon, label }) => {
        const isActive = location.pathname === path ||
          (path === '/' && location.pathname === '/') ||
          (path !== '/' && location.pathname.startsWith(path));

        return (
          <Link
            key={path}
            to={path}
            className="flex flex-col items-center gap-0.5 group relative min-w-[52px]"
          >
            {/* Active: neon glow dot */}
            {isActive && (
              <motion.span
                layoutId="navGlow"
                className="absolute -top-1.5 w-1.5 h-1.5 bg-primary rounded-full"
                style={{ boxShadow: '0 0 10px rgba(255,138,169,0.8)' }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              />
            )}

            <span
              className={`material-symbols-outlined transition-all duration-200 text-[22px] ${
                isActive
                  ? 'text-primary scale-110'
                  : 'text-on-surface-variant group-hover:text-primary'
              }`}
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {icon}
            </span>
            <span
              className={`text-[9px] font-label font-bold tracking-wider uppercase transition-colors ${
                isActive ? 'text-primary' : 'text-on-surface-variant group-hover:text-primary'
              }`}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
