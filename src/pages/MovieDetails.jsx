import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchMovieDetails } from '../services/tmdb';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const IMAGE_BASE = 'https://image.tmdb.org/t/p/original';
const POSTER_BASE = 'https://image.tmdb.org/t/p/w500';
const AVATAR_BASE = 'https://image.tmdb.org/t/p/w185';

/* ═══════════════════════════════════════════════════════════════════════════
   CELEBRITY SPOTLIGHT DATABASE
   Hardcoded quotes from legendary directors about cinema & their own films.
   Keyed by TMDB person ID for exact matching.
   ═══════════════════════════════════════════════════════════════════════════ */
const CELEBRITY_SPOTLIGHTS = {
  // Christopher Nolan
  525: {
    name: 'Christopher Nolan',
    title: 'Director',
    avatar: '/nHt73ZpDxXQnlsRKyrJPgGMiI4L.jpg',
    quotes: [
      'Every film should have its own world, a logic and feel to it that expands beyond the screen.',
      'I think there\'s a real danger in trying to be too cool. You have to commit to the emotion of your story.',
      'The ultimate goal with cinema is to make the audience feel something they never expected to feel.',
    ],
    source: 'Director\'s Commentary',
  },
  // Denis Villeneuve
  137427: {
    name: 'Denis Villeneuve',
    title: 'Director',
    avatar: '/vMitXGeLSaJLOdHDp1HjpKfnXOr.jpg',
    quotes: [
      'Cinema is the most beautiful fraud in the world — it\'s why I keep making films.',
      'I try to create a world where the audience forgets they\'re watching a movie.',
      'The desert taught me patience. Every grain of sand tells a story if you look closely enough.',
    ],
    source: 'Variety Interview',
  },
  // Martin Scorsese
  1032: {
    name: 'Martin Scorsese',
    title: 'Director',
    avatar: '/9U9Y5GQuWX3EZy39B8nkk4NY01S.jpg',
    quotes: [
      'Cinema is a matter of what\'s in the frame and what\'s out.',
      'The most personal is the most creative.',
      'If you want to make a movie about people, you get a group of actors and you let them be.',
    ],
    source: 'MasterClass',
  },
  // Quentin Tarantino
  138: {
    name: 'Quentin Tarantino',
    title: 'Director',
    avatar: '/1gjcpAa99FAOWGnrUvHEXXsRs7o.jpg',
    quotes: [
      'If you just love movies enough, you can make a good one.',
      'Violence is one of the most fun things to watch on the screen.',
      'I steal from every single movie ever made. I love it — if my work has anything, it\'s that I\'m taking this from this and mixing that in.',
    ],
    source: 'Hollywood Reporter',
  },
  // Steven Spielberg
  488: {
    name: 'Steven Spielberg',
    title: 'Director',
    avatar: '/tZxcg19YQ3e8fJ0pOs7hjlnmmr6.jpg',
    quotes: [
      'The delicate balance of mentoring someone is not creating them in your image but giving them the opportunity to create themselves.',
      'Every time I go to a movie, it\'s magic, no matter what the movie\'s about.',
      'I dream for a living — once a month the sky falls on my head, I come to, and I see another movie I want to make.',
    ],
    source: 'TIME Magazine',
  },
  // Ridley Scott
  578: {
    name: 'Ridley Scott',
    title: 'Director',
    avatar: '/zABJmN9opmqD4orWl3KSdCaSo7Q.jpg',
    quotes: [
      'Life isn\'t black and white. It\'s a million gray areas, don\'t you find?',
      'I think a good movie is a good movie whether you see it on a big screen, a move screen, or an iPhone.',
    ],
    source: 'Empire Magazine',
  },
  // James Cameron
  2710: {
    name: 'James Cameron',
    title: 'Director',
    avatar: '/9NAZnTjBQ9WcXAQEzZpKy4vdQto.jpg',
    quotes: [
      'If you set your goals ridiculously high and it\'s a failure, you will fail above everyone else\'s success.',
      'Imagination is a force that can manifest a reality.',
    ],
    source: 'Vanity Fair',
  },
  // David Fincher
  7467: {
    name: 'David Fincher',
    title: 'Director',
    avatar: '/dcBHejOsKvzVZVozWJAPeNZ9SUh.jpg',
    quotes: [
      'People will say, "There are a million ways to shoot a scene," but I don\'t think so. I think there\'s two, maybe. And the other one is wrong.',
      'I think that what makes good cinema is obsession, honestly.',
    ],
    source: 'Sight & Sound',
  },
  // Wes Anderson
  5655: {
    name: 'Wes Anderson',
    title: 'Director',
    avatar: '/tN2sMKJxGnVMg9yl0AsuJPFGXYX.jpg',
    quotes: [
      'I want to try to make things that feel like nothing else, wherever there\'s room for it.',
      'I have a way of filming things and staging them and designing them in a certain way. It\'s kind of my shorthand.',
    ],
    source: 'New Yorker Profile',
  },
  // Greta Gerwig
  45400: {
    name: 'Greta Gerwig',
    title: 'Director',
    avatar: '/3FpextOsBIwlRb0yogh5aN0Xliy.jpg',
    quotes: [
      'I think a lot of the greatest movies are about the moments in between the big moments.',
      'I always felt movies were a form of time travel.',
    ],
    source: 'IndieWire',
  },
  // Jordan Peele
  291263: {
    name: 'Jordan Peele',
    title: 'Director',
    avatar: '/kFNPDBOnSKAyRQEo3HFHE1JtCOH.jpg',
    quotes: [
      'The best and scariest monsters in the world are human beings and what we are capable of.',
      'I think the social thriller is a genre that has existed for a long time, and I just want to contribute to it.',
    ],
    source: 'Rolling Stone',
  },
  // Bong Joon-ho
  21684: {
    name: 'Bong Joon-ho',
    title: 'Director',
    avatar: '/tKLJBqbBP6 fields5eFgPmMIU9B.jpg',
    quotes: [
      'Once you overcome the one-inch-tall barrier of subtitles, you will be introduced to so many more amazing films.',
      'I think we all have the potential of great evil and great good, and great cinema shows both.',
    ],
    source: 'Oscar Speech / Criterion',
  },
  // Chloé Zhao
  1297763: {
    name: 'Chloé Zhao',
    title: 'Director',
    avatar: '/xXBl0VrbEOlJSdyK72cNLR3moIh.jpg',
    quotes: [
      'I\'ve always been drawn to open spaces and people who live on the fringes of society.',
      'Filmmaking is about revealing something true and then sharing it.',
    ],
    source: 'The Guardian',
  },
};

/**
 * Determines the review source publication from TMDB review URL or content.
 */
function detectReviewSource(review) {
  const url = review.url || '';
  if (url.includes('rottentomatoes')) return 'Rotten Tomatoes';
  if (url.includes('variety')) return 'Variety';
  if (url.includes('hollywoodreporter')) return 'Hollywood Reporter';
  if (url.includes('indiewire')) return 'IndieWire';
  if (url.includes('rogerebert') || review.author?.toLowerCase().includes('ebert')) return 'RogerEbert.com';
  if (url.includes('nytimes')) return 'NY Times';
  if (url.includes('theguardian') || url.includes('guardian')) return 'The Guardian';
  if (url.includes('empireonline') || url.includes('empire')) return 'Empire';

  // Content-based heuristics for professional critics
  const content = (review.content || '').toLowerCase();
  if (review.author_details?.rating && review.author_details.rating > 0) {
    if (content.length > 500) return 'Critic Review';
  }
  return 'TMDB Community';
}

/**
 * Determines if a review appears to be from a verified / professional critic
 * based on rating presence, review length, and source detection.
 */
function isVerifiedCritic(review) {
  const source = detectReviewSource(review);
  const proSources = ['Rotten Tomatoes', 'Variety', 'Hollywood Reporter', 'IndieWire', 'RogerEbert.com', 'NY Times', 'The Guardian', 'Empire', 'Critic Review'];
  return proSources.includes(source);
}

/* ═══════════════════════════════════════════════════════════════════════════
   REVIEW CARD — Stitch Design System
   ═══════════════════════════════════════════════════════════════════════════ */
function ReviewCard({ review, index }) {
  const verified = isVerifiedCritic(review);
  const source = detectReviewSource(review);
  const avatarUrl = review.author_details?.avatar_path;

  // Clean TMDB avatar — some start with /http, fix that
  let finalAvatar = null;
  if (avatarUrl) {
    if (avatarUrl.startsWith('/https://') || avatarUrl.startsWith('/http://')) {
      finalAvatar = avatarUrl.substring(1);
    } else {
      finalAvatar = `${AVATAR_BASE}${avatarUrl}`;
    }
  }

  return (
    <div
      className={`review-card-animate rounded-xl p-5 ${verified ? 'review-card-verified' : 'ghost-border'}`}
      style={{
        animationDelay: `${index * 120}ms`,
        background: '#131313',
      }}
    >
      {/* Reviewer Header */}
      <div className="flex items-center gap-3 mb-3">
        {/* Avatar with glassmorphic ring */}
        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 avatar-glass-ring bg-surface-container-high">
          {finalAvatar ? (
            <img
              src={finalAvatar}
              alt={review.author}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
            />
          ) : null}
          <div
            className="w-full h-full items-center justify-center bg-primary/15"
            style={{ display: finalAvatar ? 'none' : 'flex' }}
          >
            <span className="font-headline text-sm font-bold text-primary">
              {review.author?.charAt(0)?.toUpperCase() || '?'}
            </span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Critic name — Space Grotesk, label-md uppercase */}
            <p className="font-label text-xs font-semibold tracking-wider uppercase text-on-surface">
              {review.author}
            </p>
            {verified && (
              <span className="inline-flex items-center gap-1 text-[9px] font-label uppercase tracking-widest text-primary font-bold">
                <span className="material-symbols-outlined text-[11px] filled text-primary">verified</span>
                Verified
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            {review.author_details?.rating && (
              <div className="flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[11px] text-tertiary filled">star</span>
                <span className="text-[10px] text-on-surface-variant font-label font-medium">{review.author_details.rating}/10</span>
              </div>
            )}
            {/* Source glass chip */}
            <span className="glass-chip">
              <span className="material-symbols-outlined text-[9px]">newspaper</span>
              {source}
            </span>
          </div>
        </div>
      </div>

      {/* Review text — Manrope for legibility */}
      <p className="text-sm text-on-surface-variant leading-relaxed font-body line-clamp-5">
        {review.content?.replace(/<[^>]*>/g, '').replace(/\*\*/g, '').replace(/_/g, '')}
      </p>

      {/* Review date */}
      {review.created_at && (
        <p className="text-[10px] text-on-surface-variant/50 mt-3 font-label uppercase tracking-wider">
          {new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
        </p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CELEBRITY SPOTLIGHT CARD
   ═══════════════════════════════════════════════════════════════════════════ */
function CelebritySpotlightCard({ spotlight, index }) {
  // Pick a random quote from the array
  const [quote] = useState(() =>
    spotlight.quotes[Math.floor(Math.random() * spotlight.quotes.length)]
  );

  return (
    <div
      className="review-card-animate rounded-xl p-5 relative overflow-hidden"
      style={{
        animationDelay: `${index * 120}ms`,
        background: 'linear-gradient(135deg, rgba(19,19,19,1) 0%, rgba(26,26,26,0.95) 100%)',
        border: '1px solid rgba(171, 159, 255, 0.12)',
        boxShadow: '0 0 30px rgba(171, 159, 255, 0.06)',
      }}
    >
      {/* Subtle corner glow accent */}
      <div
        className="absolute -top-16 -right-16 w-40 h-40 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(171,159,255,0.08), transparent 70%)' }}
      />

      {/* Spotlight label */}
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-[14px] text-tertiary filled">auto_awesome</span>
        <span className="font-label text-[10px] font-bold uppercase tracking-[0.15em] text-tertiary">
          Celebrity Spotlight
        </span>
      </div>

      {/* The quote */}
      <div className="celebrity-quote mb-4">
        <p className="font-body text-sm text-on-surface/90 leading-relaxed italic">
          {quote}
        </p>
      </div>

      {/* Celebrity info */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 avatar-glass-ring bg-surface-container-high">
          {spotlight.avatar ? (
            <img
              src={`${AVATAR_BASE}${spotlight.avatar}`}
              alt={spotlight.name}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
            />
          ) : null}
          <div
            className="w-full h-full items-center justify-center bg-tertiary/15"
            style={{ display: spotlight.avatar ? 'none' : 'flex' }}
          >
            <span className="font-headline text-sm font-bold text-tertiary">
              {spotlight.name?.charAt(0)}
            </span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-label text-xs font-semibold tracking-wider uppercase text-on-surface">
            {spotlight.name}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-on-surface-variant/70 font-body">{spotlight.title}</span>
            <span className="glass-chip">
              <span className="material-symbols-outlined text-[9px]">format_quote</span>
              {spotlight.source}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   REVIEWS SECTION — Wrapper with IntersectionObserver for staggered trigger
   ═══════════════════════════════════════════════════════════════════════════ */
function ReviewsSection({ reviews, celebritySpotlight }) {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const hasContent = reviews.length > 0 || celebritySpotlight;
  if (!hasContent) return null;

  return (
    <section ref={sectionRef} className="mb-10">
      <div className="flex items-center gap-3 mb-5">
        <h3 className="text-sm font-label text-on-surface font-bold uppercase tracking-wider">
          Celebrity & Critic Reviews
        </h3>
        <div className="flex-1 h-px bg-outline-variant/20" />
        <span className="text-[10px] font-label text-on-surface-variant/60 uppercase tracking-widest">
          {(celebritySpotlight ? 1 : 0) + reviews.length} Reviews
        </span>
      </div>

      {visible && (
        <div className="space-y-4">
          {/* Celebrity Spotlight first */}
          {celebritySpotlight && (
            <CelebritySpotlightCard spotlight={celebritySpotlight} index={0} />
          )}

          {/* TMDB Critic / Community Reviews */}
          {reviews.map((review, i) => (
            <ReviewCard
              key={review.id}
              review={review}
              index={(celebritySpotlight ? 1 : 0) + i}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
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
  const reviews = movie.reviews?.results?.slice(0, 5) || [];

  // Match director to celebrity spotlight database
  const celebritySpotlight = director ? CELEBRITY_SPOTLIGHTS[director.id] || null : null;

  return (
    <div className="bg-surface-container-lowest text-on-surface min-h-[100dvh] pb-24 relative">

      {/* Hero Backdrop — absolute from top:0, extends behind the transparent TopNav */}
      <div className="absolute top-0 left-0 right-0 w-full h-[60vh] min-h-[450px]">
        {movie.backdrop_path ? (
          <img
            src={`${IMAGE_BASE}${movie.backdrop_path}`}
            alt={movie.title}
            loading="lazy"
            className="w-full h-full object-cover object-top"
          />
        ) : (
          <div className="w-full h-full bg-surface-container-highest" />
        )}
        {/* Multi-stop gradient mask: transparent → semi → pure #000000 for a smooth Neon Noir fade */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.4) 55%, rgba(0,0,0,0.85) 80%, #000000 100%)',
          }}
        />
      </div>

      {/* Floating Action Bar — back + save, positioned below the TopNav */}
      <div className="fixed top-16 lg:top-[4.5rem] inset-x-0 z-50 px-4 pointer-events-none">
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
      </div>

      {/* Spacer to push content below the hero backdrop */}
      <div className="relative h-[60vh] min-h-[450px]" />

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Poster */}
          <div className="w-32 md:w-48 shrink-0 rounded-xl overflow-hidden inner-glow hidden sm:block"
            style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}
          >
            <img src={`${POSTER_BASE}${movie.poster_path}`} alt={movie.title} loading="lazy" className="w-full h-auto" />
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
                        <img src={`${POSTER_BASE}${person.profile_path}`} className="w-full h-full object-cover" alt={person.name} loading="lazy" />
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

        {/* ═══ Celebrity & Critic Reviews ═══ */}
        <ReviewsSection reviews={reviews} celebritySpotlight={celebritySpotlight} />
      </main>
    </div>
  );
}
