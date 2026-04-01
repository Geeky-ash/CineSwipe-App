import { useNavigate, useLocation } from 'react-router-dom';

const ICONS = [
  { path: '/', icon: 'style', label: 'Swipe' },
  { path: '/discover', icon: 'local_fire_department', label: 'Trending' },
  { path: '/profile', icon: 'bookmark', label: 'Saved' },
  { path: '/settings', icon: 'settings', label: 'Settings' },
];

export default function IconSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="hidden lg:flex flex-col items-center py-8 w-[80px] fixed left-0 top-0 bottom-0 z-50 bg-surface-container-lowest border-r border-white/5">
      
      {/* Spacer for TopNav height if needed, but mockup shows icons starting below logo */}
      <div className="flex flex-col gap-8 mt-24">
        {ICONS.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="group relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all"
            >
              <div className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
                active ? 'bg-primary/20 scale-100' : 'bg-transparent scale-50 opacity-0 group-hover:scale-100 group-hover:bg-white/5 opacity-100'
              }`} />
              <span className={`material-symbols-outlined relative z-10 transition-colors duration-300 ${
                active ? 'text-primary filled drop-shadow-[0_0_8px_rgba(255,138,169,0.8)]' : 'text-on-surface-variant group-hover:text-on-surface'
              }`}>
                {item.icon}
              </span>
            </button>
          );
        })}
      </div>
      
      <div className="mt-auto pointer-events-none">
        <span className="text-[10px] font-label font-bold tracking-[0.2em] text-on-surface-variant/30 rotate-180" style={{ writingMode: 'vertical-rl' }}>
          UPGRADE TO PRO
        </span>
      </div>
    </aside>
  );
}
