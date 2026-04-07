import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const TABS = [
  { path: '/',         icon: 'swipe',        label: 'Swipe' },
  { path: '/discover', icon: 'explore',      label: 'Discover' },
  { path: '/clubs',    icon: 'movie_filter',  label: 'Film Clubs' },
  { path: '/profile',  icon: 'person',       label: 'Profile' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav
      className="fixed lg:hidden bottom-0 left-0 right-0 z-50"
      style={{
        /* Stitch tokens: #000000 @ 60%, blur 24px, tonal top edge */
        background: 'rgba(0, 0, 0, 0.60)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        boxShadow: '0 -1px 0 rgba(255, 138, 169, 0.06), 0 -8px 24px rgba(0, 0, 0, 0.5)',
      }}
    >
      <div
        className="flex justify-around items-end px-2 pt-2"
        style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
      >
        {TABS.map((tab) => {
          const active =
            tab.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(tab.path);

          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="relative flex flex-col items-center gap-0.5 min-w-[64px] py-1 transition-all active:scale-90"
            >
              {/* Active pill glow */}
              {active && (
                <motion.div
                  layoutId="bottomNavPill"
                  className="absolute -top-0.5 w-14 h-8 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,138,169,0.22), rgba(228,0,108,0.12))',
                    boxShadow: '0 0 18px rgba(255, 138, 169, 0.30)',
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                />
              )}

              {/* Icon */}
              <span
                className={`material-symbols-outlined relative z-10 transition-all duration-200 ${
                  active ? 'filled text-[24px]' : 'text-[22px]'
                }`}
                style={{
                  color: active
                    ? 'var(--color-primary)'         /* #ff8aa9 */
                    : 'var(--color-on-surface-variant)',
                  filter: active
                    ? 'drop-shadow(0 0 6px rgba(255,138,169,0.7))'
                    : 'none',
                }}
              >
                {tab.icon}
              </span>

              {/* Label */}
              <span
                className={`relative z-10 text-[10px] leading-tight tracking-wide font-semibold transition-colors duration-200 ${
                  active ? 'text-primary' : 'text-on-surface-variant'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
