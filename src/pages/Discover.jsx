import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUpcomingMovies, searchMovies } from '../services/tmdb';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const POSTER_BASE = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_BASE = 'https://image.tmdb.org/t/p/original';

export default function Discover() {
  const { session, signOut } = useAuth();
  const navigate = useNavigate();
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchUpcomingMovies()
      .then(data => setUpcoming(data.slice(0, 10)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Fix #3: Debounced TMDB search
  useEffect(() => {
    if (!query.trim()) { setSearchResults([]); return; }
    const timeout = setTimeout(async () => {
      setSearching(true);
      const results = await searchMovies(query);
      setSearchResults(results);
      setSearching(false);
    }, 400);
    return () => clearTimeout(timeout);
  }, [query]);

  if (loading) {
    return (
      <div className="h-[100dvh] w-full flex flex-col items-center justify-center bg-surface-container-lowest text-on-surface">
        <span className="material-symbols-outlined animate-spin text-4xl mb-4 text-primary">autorenew</span>
        <p className="font-headline tracking-widest text-sm text-on-surface-variant">LOADING DISCOVER</p>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest text-on-surface font-body antialiased min-h-screen pb-28 h-[100dvh] overflow-y-auto overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface/60 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="flex items-center justify-between px-6 py-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary filled">movie</span>
            <h1 className="font-headline text-2xl font-bold tracking-tight">CineSwipe</h1>
          </div>
          <div className="flex items-center gap-3">
            {session ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {session.user?.user_metadata?.avatar_url ? (
                    <img src={session.user.user_metadata.avatar_url} alt="Profile" className="w-8 h-8 rounded-full border border-primary/30 shadow-sm" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center border border-outline-variant/20">
                      <span className="material-symbols-outlined text-[16px]">person</span>
                    </div>
                  )}
                  {session.user?.user_metadata?.full_name && (
                    <span className="text-sm font-medium hidden sm:block">
                      {session.user.user_metadata.full_name.split(' ')[0]}
                    </span>
                  )}
                </div>
                <button
                  onClick={signOut}
                  title="Sign Out"
                  className="w-8 h-8 flex items-center justify-center rounded-full glass-panel border border-outline-variant/20 hover:text-error transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="text-xs text-primary px-3 py-1 rounded-full glass-panel border border-primary/30 transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 pt-6">
        {/* Search bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            {searching
              ? <span className="material-symbols-outlined text-primary text-sm animate-spin">autorenew</span>
              : <span className="material-symbols-outlined text-on-surface-variant/60">search</span>
            }
          </div>
          <input
            className="w-full bg-surface-container-high border-none rounded-full py-4 pl-12 pr-6 text-on-surface placeholder-on-surface-variant/40 focus:ring-2 focus:ring-primary/30 transition-all outline-none"
            placeholder="Search movies, actors, moods..."
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setSearchResults([]); }}
              className="absolute inset-y-0 right-4 flex items-center text-on-surface-variant/60 hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>

        {/* Search results */}
        {searchResults.length > 0 && (
          <section className="mb-10">
            <h2 className="font-headline text-lg font-semibold text-on-surface mb-4">
              Results for "{query}"
            </h2>
            <div className="masonry-grid">
              {searchResults.slice(0, 8).map(movie => (
                <div key={movie.id} onClick={() => navigate(`/movie/${movie.id}`)} className="masonry-item relative group rounded-lg overflow-hidden bg-surface-container shadow-2xl cursor-pointer">
                  {movie.poster_path ? (
                    <img
                      alt={movie.title}
                      className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      src={`${POSTER_BASE}${movie.poster_path}`}
                    />
                  ) : (
                    <div className="w-full h-48 bg-surface-container-high flex items-center justify-center">
                      <span className="material-symbols-outlined text-outline text-4xl">movie</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-transparent to-transparent opacity-90 pointer-events-none" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="font-headline text-sm font-bold leading-tight line-clamp-2">{movie.title}</p>
                    <p className="text-on-surface-variant text-[11px] mt-0.5">
                      {movie.release_date?.slice(0, 4) || ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* No results state */}
        {query.trim().length >= 2 && searchResults.length === 0 && !searching && (
          <div className="text-center py-12 text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-3 block">search_off</span>
            <p className="text-sm">No results for "{query}"</p>
          </div>
        )}

        {/* Genre tags */}
        {!query && (
          <>
            <div className="flex overflow-x-auto gap-3 mb-10 hide-scrollbar -mx-6 px-6">
              {['All', 'Cyberpunk', 'Neo-Noir', 'Psychological', 'Space Opera', 'Retro-Future'].map((tag, i) => (
                <button
                  key={tag}
                  className={`flex-shrink-0 px-6 py-2 rounded-full font-medium text-sm transition-all active:scale-95 ${
                    i === 0
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-variant'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Upcoming movies masonry */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-headline text-2xl font-semibold">Upcoming Thrills</h2>
                <button className="text-primary text-sm font-medium hover:underline">See All</button>
              </div>
              <div className="masonry-grid">
                {upcoming.slice(0, 4).map(movie => (
                  <div key={movie.id} onClick={() => navigate(`/movie/${movie.id}`)} className="masonry-item relative group rounded-lg overflow-hidden bg-surface-container shadow-2xl cursor-pointer">
                    <img
                      alt={movie.title}
                      className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      src={`${POSTER_BASE}${movie.poster_path}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-transparent to-transparent opacity-90 pointer-events-none" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="font-headline text-lg font-bold leading-tight line-clamp-2">{movie.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Featured film */}
            {upcoming[4] && (
              <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-headline text-2xl font-semibold">Featured Discovery</h2>
                </div>
                <div onClick={() => navigate(`/movie/${upcoming[4].id}`)} className="relative h-64 rounded-lg overflow-hidden group cursor-pointer">
                  <img
                    alt={upcoming[4].title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms]"
                    src={`${BACKDROP_BASE}${upcoming[4].backdrop_path}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-surface-container-lowest via-surface-container-lowest/40 to-transparent pointer-events-none" />
                  <div className="absolute inset-0 flex flex-col justify-center p-8">
                    <span className="text-tertiary text-xs font-bold uppercase tracking-widest mb-2">Curated Collection</span>
                    <h3 className="font-headline text-3xl font-bold max-w-[200px] leading-tight mb-4 text-white line-clamp-3">
                      {upcoming[4].title}
                    </h3>
                    <button className="w-fit px-6 py-2 rounded-full bg-primary-container text-white font-medium text-sm flex items-center gap-2 hover:bg-primary transition-colors">
                      <span className="material-symbols-outlined text-sm filled">play_arrow</span>
                      Watch Now
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-surface-container-high p-4 rounded-lg flex flex-col items-center text-center hover:bg-surface-variant transition-colors cursor-pointer">
                    <div className="w-12 h-12 rounded-full bg-tertiary/20 flex items-center justify-center mb-3">
                      <span className="material-symbols-outlined text-tertiary">coffee</span>
                    </div>
                    <p className="font-headline font-bold">Feel Good</p>
                    <p className="text-on-surface-variant text-xs mt-1">12 Movies</p>
                  </div>
                  <div className="bg-surface-container-high p-4 rounded-lg flex flex-col items-center text-center hover:bg-surface-variant transition-colors cursor-pointer">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-3">
                      <span className="material-symbols-outlined text-primary">auto_awesome</span>
                    </div>
                    <p className="font-headline font-bold">Indie Gold</p>
                    <p className="text-on-surface-variant text-xs mt-1">8 Movies</p>
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
