import { useNavigate, useLocation } from 'react-router-dom';

const ICONS = [
  { path: '/', icon: 'style', label: 'Swipe' },
  { path: '/discover', icon: 'local_fire_department', label: 'Trending' },
  { path: '/clubs', icon: 'groups', label: 'Clubs' },
  { path: '/profile', icon: 'bookmark', label: 'Saved' },
  { path: '/settings', icon: 'settings', label: 'Settings' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  // Hidden on desktop
  return (
    <nav className="fixed lg:hidden bottom-0 left-0 right-0 z-50 px-4 pb-safe pb-4 pt-2 glass-panel ghost-border rounded-t-3xl shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
      <div className="flex justify-around items-center h-14">
        {ICONS.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="group relative flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all"
            >
              <div className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
                active ? 'bg-primary/20 scale-100' : 'bg-transparent scale-50 opacity-0 opacity-100'
              }`} />
              <span className={`material-symbols-outlined relative z-10 transition-colors duration-300 ${
                active ? 'text-primary filled drop-shadow-[0_0_8px_rgba(255,138,169,0.8)]' : 'text-on-surface-variant'
              }`}>
                {item.icon}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
