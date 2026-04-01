import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchMovieDetails } from '../services/tmdb';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const IMAGE_BASE = 'https://image.tmdb.org/t/p/original';
const POSTER_BASE = 'https://image.tmdb.org/t/p/w500';

export default function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedActors, setSavedActors] = useState([]);

  useEffect(() => {
    async function init() {
      const data = await fetchMovieDetails(id);
      setMovie(data);
      setLoading(false);
      if (session?.user && data) {
        const { data: watchData } = await supabase
          .from('Watchlist').select('id').eq('movie_id', data.id).eq('user_id', session.user.id).maybeSingle();
        if (watchData) setSaved(true);
        const { data: actorData } = await supabase
          .from('SavedActors').select('actor_id').eq('user_id', session.user.id);
        if (actorData) setSavedActors(actorData.map((a) => a.actor_id));
      }
    }
    init();
  }, [id, session]);

  const handleSave = async () => {
    if (!session?.user) {
      if (confirm('Sign in to save movies to your watchlist. Go to login?')) navigate('/login');
      return;
    }
    setSaving(true);
    if (saved) {
      await supabase.from('Watchlist').delete().eq('movie_id', movie.id).eq('user_id', session.user.id);
      setSaved(false);
    } else {
      await supabase.from('Watchlist').insert({
        movie_id: movie.id, user_id: session.user.id, title: movie.title, poster_path: movie.poster_path,
      });
      setSaved(true);
    }
    setSaving(false);
  };

  const handleSaveActor = async (person) => {
    if (!session?.user) {
      if (confirm('Sign in to save actors. Go to login?')) navigate('/login');
      return;
    }
    const isSaved = savedActors.includes(person.id);
    if (isSaved) {
      setSavedActors((prev) => prev.filter((aid) => aid !== person.id));
      await supabase.from('SavedActors').delete().eq('actor_id', person.id).eq('user_id', session.user.id);
    } else {
      setSavedActors((prev) => [...prev, person.id]);
      await supabase.from('SavedActors').insert({
        actor_id: person.id, user_id: session.user.id, name: person.name, profile_path: person.profile_path,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-surface-container-lowest text-on-surface">
        <span className="material-symbols-outlined animate-spin text-4xl mb-4 text-primary">autorenew</span>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center text-on-surface-variant px-6 text-center">
        <h2 className="font-headline text-2xl font-bold mb-2">Movie Not Found</h2>
        <button onClick={() => navigate(-1)} className="text-primary mt-4 font-body font-medium">Go Back</button>
      </div>
    );
  }

  const director = movie.credits?.crew?.find((c) => c.job === 'Director');
  const cast = movie.credits?.cast?.slice(0, 10) || [];
  const reviews = movie.reviews?.results?.slice(0, 3) || [];

  return (
    <div className="bg-surface-container-lowest text-on-surface min-h-[100dvh] pb-24 relative">

      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 pt-4 pb-12 px-4 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)' }}
      >
        <div className="max-w-3xl mx-auto flex items-center justify-between pointer-events-auto">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full glass-panel flex items-center justify-center ghost-border hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-on-surface">arrow_back</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`w-10 h-10 rounded-full glass-panel flex items-center justify-center transition-all ${
              saved ? 'bg-tertiary/20 ghost-border' : 'ghost-border hover:bg-surface-container-high'
            }`}
            style={saved ? { boxShadow: '0 0 15px rgba(171,159,255,0.4)' } : {}}
          >
            <span className={`material-symbols-outlined ${saved ? 'text-tertiary filled' : 'text-on-surface'}`}>
              {saved ? 'bookmark_added' : 'bookmark_add'}
            </span>
          </button>
        </div>
      </header>

      {/* Hero Backdrop */}
      <div className="relative w-full h-[50vh] min-h-[400px]">
        {movie.backdrop_path ? (
          <img src={`${IMAGE_BASE}${movie.backdrop_path}`} alt={movie.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-surface-container-highest" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/60 to-transparent" />
      </div>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Poster */}
          <div className="w-32 md:w-48 shrink-0 rounded-xl overflow-hidden inner-glow hidden sm:block"
            style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}
          >
            <img src={`${POSTER_BASE}${movie.poster_path}`} alt={movie.title} className="w-full h-auto" />
          </div>

          <div className="flex-1">
            <h1 className="font-headline text-4xl font-black leading-tight tracking-tight mb-1">
              {movie.title}{' '}
              <span className="font-normal text-on-surface-variant/80 text-2xl">({movie.release_date?.substring(0, 4)})</span>
            </h1>

            {director && (
              <p className="text-on-surface-variant text-sm mb-4 font-label font-medium uppercase tracking-widest">
                Directed by <span className="text-on-surface font-bold">{director.name}</span>
              </p>
            )}

            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-2 py-1 bg-surface-container-high rounded-md text-xs font-bold text-on-surface flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-tertiary filled">star</span>
                {movie.vote_average?.toFixed(1)}
              </span>
              <span className="px-2 py-1 bg-surface-container-high rounded-md text-xs font-semibold text-on-surface-variant">
                {movie.runtime} min
              </span>
              {movie.genres?.map((g) => (
                <span key={g.id} className="stitch-chip text-xs !px-2 !py-1 !rounded-md">{g.name}</span>
              ))}
            </div>

            <h3 className="text-sm font-label text-on-surface font-bold uppercase tracking-wider mb-2">Overview</h3>
            <p className="text-on-surface-variant text-sm md:text-base leading-relaxed mb-8 font-body">{movie.overview}</p>
          </div>
        </div>

        {/* Section spacing — No-Line Rule: use vertical space instead of dividers */}
        <div className="h-8" />

        {/* Cast */}
        {cast.length > 0 && (
          <section className="mb-10">
            <h3 className="text-sm font-label text-on-surface font-bold uppercase tracking-wider mb-4">Cast</h3>
            <div className="flex overflow-x-auto gap-4 hide-scrollbar pb-2 -mx-6 px-6 sm:mx-0 sm:px-0">
              {cast.map((person) => {
                const isSavedActor = savedActors.includes(person.id);
                return (
                  <div key={person.id} className="flex-shrink-0 w-24 flex flex-col items-center relative">
                    <div className="w-20 h-20 rounded-full overflow-hidden mb-2 bg-surface-container-high ghost-border relative">
                      {person.profile_path ? (
                        <img src={`${POSTER_BASE}${person.profile_path}`} className="w-full h-full object-cover" alt={person.name} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-outline">person</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleSaveActor(person)}
                      className={`absolute top-0 right-1 w-7 h-7 rounded-full flex items-center justify-center glass-panel z-10 transition-colors ${
                        isSavedActor ? 'bg-primary/90' : 'hover:bg-surface-container-high'
                      }`}
                      style={isSavedActor ? { boxShadow: '0 0 10px rgba(255,138,169,0.4)' } : {}}
                    >
                      <span className={`material-symbols-outlined text-[14px] ${isSavedActor ? 'text-on-surface filled' : 'text-on-surface'}`}>
                        favorite
                      </span>
                    </button>
                    <p className="text-xs font-body font-medium text-on-surface text-center line-clamp-1">{person.name}</p>
                    <p className="text-[10px] text-on-surface-variant text-center line-clamp-1 font-body">{person.character}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Reviews */}
        {reviews.length > 0 && (
          <section className="mb-10">
            <h3 className="text-sm font-label text-on-surface font-bold uppercase tracking-wider mb-4">Recent Reviews</h3>
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="glass-panel p-5 rounded-xl ghost-border">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-xs">
                      {review.author.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-on-surface font-body">A review by {review.author}</p>
                      {review.author_details?.rating && (
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px] text-tertiary filled">star</span>
                          <span className="text-[10px] text-on-surface-variant font-label">{review.author_details.rating}/10</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-on-surface-variant line-clamp-4 leading-relaxed font-body">{review.content}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
