import { Link, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/',           icon: 'play_circle', label: 'Feed'      },
  { path: '/cinesnaps',  icon: 'theaters',    label: 'CineSnaps' },
  { path: '/clubs',      icon: 'groups',      label: 'Clubs'     },
  { path: '/profile',    icon: 'person',      label: 'Profile'   },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-lg bg-surface-container-low/70 backdrop-blur-2xl border border-outline-variant/20 rounded-full px-6 py-3 z-50 shadow-2xl flex justify-between items-center">
      {NAV_ITEMS.map(({ path, icon, label }) => {
        const isActive = location.pathname === path;
        return (
          <Link
            key={path}
            to={path}
            className="flex flex-col items-center gap-0.5 group relative min-w-[56px]"
          >
            {isActive && (
              <span className="absolute -top-1 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_#ffb1c3]" />
            )}
            <span
              className={`material-symbols-outlined transition-all duration-200 ${
                isActive
                  ? 'text-primary scale-110'
                  : 'text-on-surface-variant group-hover:text-primary'
              }`}
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {icon}
            </span>
            <span
              className={`text-[9px] font-bold tracking-wide transition-colors ${
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
