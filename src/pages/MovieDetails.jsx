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
          .from('Watchlist')
          .select('id')
          .eq('movie_id', data.id)
          .eq('user_id', session.user.id)
          .maybeSingle();
        if (watchData) setSaved(true);

        const { data: actorData } = await supabase
          .from('SavedActors')
          .select('actor_id')
          .eq('user_id', session.user.id);
        if (actorData) setSavedActors(actorData.map(a => a.actor_id));
      }
    }
    init();
  }, [id, session]);

  const handleSave = async () => {
    if (!session?.user) {
      if (confirm('Sign in to save movies to your watchlist. Go to login?')) {
        navigate('/login');
      }
      return;
    }
    setSaving(true);
    if (saved) {
      // Remove from watchlist
      await supabase.from('Watchlist').delete().eq('movie_id', movie.id).eq('user_id', session.user.id);
      setSaved(false);
    } else {
      // Add to watchlist
      await supabase.from('Watchlist').insert({
        movie_id: movie.id,
        user_id: session.user.id,
        title: movie.title,
        poster_path: movie.poster_path
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
      setSavedActors(prev => prev.filter(id => id !== person.id));
      await supabase.from('SavedActors').delete().eq('actor_id', person.id).eq('user_id', session.user.id);
    } else {
      setSavedActors(prev => [...prev, person.id]);
      await supabase.from('SavedActors').insert({
        actor_id: person.id,
        user_id: session.user.id,
        name: person.name,
        profile_path: person.profile_path
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-surface-container-lowest text-on-surface">
        <span className="material-symbols-outlined animate-spin text-4xl mb-4 text-primary">autorenew</span>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-on-surface-variant px-6 text-center">
        <h2 className="font-headline text-2xl font-bold mb-2">Movie Not Found</h2>
        <button onClick={() => navigate(-1)} className="text-primary mt-4 font-medium">Go Back</button>
      </div>
    );
  }

  const director = movie.credits?.crew?.find(c => c.job === 'Director');
  const cast = movie.credits?.cast?.slice(0, 10) || [];
  const reviews = movie.reviews?.results?.slice(0, 3) || [];

  return (
    <div className="bg-surface-container-lowest text-on-surface min-h-screen pb-24 font-body antialiased relative">
      {/* Header / Back Button */}
      <header className="fixed top-0 inset-x-0 z-50 bg-gradient-to-b from-black/80 to-transparent pt-6 pb-12 px-4 pointer-events-none">
        <div className="max-w-3xl mx-auto flex items-center justify-between pointer-events-auto">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-black/60 transition-colors"
          >
            <span className="material-symbols-outlined text-white">arrow_back</span>
          </button>
          
          <button 
            onClick={handleSave}
            disabled={saving}
            className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center border transition-colors ${saved ? 'bg-tertiary/80 border-tertiary shadow-[0_0_15px_rgba(var(--color-tertiary),0.5)]' : 'bg-black/40 border-white/10 hover:bg-black/60'}`}
          >
            <span className={`material-symbols-outlined ${saved ? 'text-on-tertiary filled' : 'text-white'}`}>
              {saved ? 'bookmark_added' : 'bookmark_add'}
            </span>
          </button>
        </div>
      </header>

      {/* Hero Backdrop */}
      <div className="relative w-full h-[50vh] min-h-[400px]">
        {movie.backdrop_path ? (
          <img 
            src={`${IMAGE_BASE}${movie.backdrop_path}`} 
            alt={movie.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-surface-container-highest"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/60 to-transparent" />
      </div>

      {/* Main Content Info */}
      <main className="max-w-3xl mx-auto px-6 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Poster */}
          <div className="w-32 md:w-48 shrink-0 rounded-xl overflow-hidden shadow-2xl border border-outline-variant/10 hidden sm:block">
            <img 
              src={`${POSTER_BASE}${movie.poster_path}`} 
              alt={movie.title}
              className="w-full h-auto"
            />
          </div>

          <div className="flex-1 drop-shadow-md">
            <h1 className="font-headline text-4xl font-black leading-tight tracking-tight text-white mb-1">
              {movie.title} <span className="font-normal text-on-surface-variant/80 text-2xl">({movie.release_date?.substring(0,4)})</span>
            </h1>
            
            {director && <p className="text-on-surface-variant text-sm mb-4 font-medium uppercase tracking-widest">Directed by <span className="text-on-surface font-bold">{director.name}</span></p>}

            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-2 py-1 bg-surface-container-high rounded-md text-xs font-bold text-on-surface flex items-center gap-1">
                 <span className="material-symbols-outlined text-[14px] text-tertiary filled">star</span>
                 {movie.vote_average?.toFixed(1)}
              </span>
              <span className="px-2 py-1 bg-surface-container-high rounded-md text-xs font-semibold text-on-surface-variant">
                 {movie.runtime} min
              </span>
              {movie.genres?.map(g => (
                <span key={g.id} className="px-2 py-1 border border-outline-variant/30 rounded-md text-xs font-medium text-on-surface-variant">
                  {g.name}
                </span>
              ))}
            </div>

            <h3 className="text-sm font-headline text-on-surface font-bold uppercase tracking-wider mb-2">Overview</h3>
            <p className="text-on-surface-variant text-sm md:text-base leading-relaxed mb-8">
              {movie.overview}
            </p>
          </div>
        </div>

        <div className="w-full h-px bg-outline-variant/10 my-8"></div>

        {/* Cast Section */}
        {cast.length > 0 && (
          <section className="mb-10">
             <h3 className="text-sm font-headline text-on-surface font-bold uppercase tracking-wider mb-4">Cast</h3>
             <div className="flex overflow-x-auto gap-4 hide-scrollbar pb-2 -mx-6 px-6 sm:mx-0 sm:px-0">
               {cast.map(person => {
                 const isSavedActor = savedActors.includes(person.id);
                 return (
                 <div key={person.id} className="flex-shrink-0 w-24 flex flex-col items-center relative">
                   <div className="w-20 h-20 rounded-full overflow-hidden mb-2 bg-surface-container-high border border-outline-variant/10 relative">
                     {person.profile_path ? (
                       <img src={`${POSTER_BASE}${person.profile_path}`} className="w-full h-full object-cover" alt={person.name} />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-outline">person</span></div>
                     )}
                   </div>
                   <button 
                     onClick={() => handleSaveActor(person)}
                     className={`absolute top-0 right-1 w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-md shadow-lg border transition-colors z-10 ${isSavedActor ? 'bg-primary/90 border-primary' : 'bg-black/60 border-white/20 hover:bg-black/80'}`}
                   >
                     <span className={`material-symbols-outlined text-[14px] ${isSavedActor ? 'text-white filled' : 'text-white'}`}>
                       {isSavedActor ? 'favorite' : 'favorite'}
                     </span>
                   </button>
                   <p className="text-xs font-medium text-on-surface text-center line-clamp-1">{person.name}</p>
                   <p className="text-[10px] text-on-surface-variant text-center line-clamp-1">{person.character}</p>
                 </div>
                 );
               })}
             </div>
          </section>
        )}

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <section className="mb-10">
             <h3 className="text-sm font-headline text-on-surface font-bold uppercase tracking-wider mb-4">Recent Reviews</h3>
             <div className="space-y-4">
               {reviews.map(review => (
                 <div key={review.id} className="glass-panel p-5 rounded-xl border border-outline-variant/10">
                   <div className="flex items-center gap-3 mb-3">
                     <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-xs">
                       {review.author.charAt(0).toUpperCase()}
                     </div>
                     <div>
                       <p className="text-sm font-bold text-on-surface">A review by {review.author}</p>
                       {review.author_details?.rating && (
                         <div className="flex items-center gap-1">
                           <span className="material-symbols-outlined text-[12px] text-tertiary filled">star</span>
                           <span className="text-[10px] text-on-surface-variant">{review.author_details.rating}/10</span>
                         </div>
                       )}
                     </div>
                   </div>
                   <p className="text-sm text-on-surface-variant line-clamp-4 leading-relaxed">{review.content}</p>
                 </div>
               ))}
             </div>
          </section>
        )}
      </main>
    </div>
  );
}
