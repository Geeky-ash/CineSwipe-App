const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

export async function fetchTrendingMovies() {
  const res = await fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`);
  const data = await res.json();
  return data.results;
}

export async function fetchUpcomingMovies() {
  const res = await fetch(`${BASE_URL}/movie/upcoming?api_key=${API_KEY}`);
  const data = await res.json();
  return data.results;
}

export async function fetchMovieTrailer(movieId) {
  const res = await fetch(`${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}`);
  if (!res.ok) return null;
  const data = await res.json();
  const trailer = data.results?.find((vid) => vid.type === 'Trailer' && vid.site === 'YouTube');
  if (!trailer && data.results?.length > 0) return data.results[0].key;
  return trailer ? trailer.key : null;
}

// Fix #3: Search TMDB directly — never touches the Supabase database
export async function searchMovies(query) {
  if (!query || query.trim().length < 2) return [];
  const encoded = encodeURIComponent(query.trim());
  // Use /search/multi to match both movies and actors/people
  const res = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encoded}&include_adult=false`);
  if (!res.ok) return [];
  const data = await res.json();
  if (!data.results) return [];

  const movies = [];
  const seenIds = new Set();

  for (const item of data.results) {
    if (item.media_type === 'movie' && !seenIds.has(item.id)) {
      seenIds.add(item.id);
      movies.push(item);
    } else if (item.media_type === 'person' && item.known_for) {
      // If result is an actor, pull their known movies into the search results
      for (const kf of item.known_for) {
        if (kf.media_type === 'movie' && !seenIds.has(kf.id)) {
          seenIds.add(kf.id);
          movies.push(kf);
        }
      }
    }
  }
  return movies;
}

export async function fetchTopRatedMovies() {
  const res = await fetch(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}`);
  const data = await res.json();
  return data.results || [];
}

/**
 * Fetch movies by a specific director (or person ID).
 */
export async function fetchMoviesByDirector(personId) {
  const res = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_people=${personId}&sort_by=popularity.desc`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.results || [];
}

/**
 * Fetch movies filtered by genre IDs (for Vibe-Check mood filtering).
 * Uses TMDB /discover/movie with with_genres parameter.
 */
export async function fetchMoviesByGenres(genreIds = [], page = 1) {
  if (!genreIds.length) return [];
  const genres = genreIds.join(',');
  const res = await fetch(
    `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genres}&sort_by=popularity.desc&vote_count.gte=100&page=${page}&include_adult=false`
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.results || [];
}

// Genre ID → label map (TMDB standard)
const GENRE_MAP = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
  80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
  14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
  9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 10770: 'TV Movie',
  53: 'Thriller', 10752: 'War', 37: 'Western',
};
export function getGenreLabel(genreIds = []) {
  return GENRE_MAP[genreIds[0]] ?? 'Cinema';
}

export async function fetchMovieDetails(movieId) {
  const res = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&append_to_response=credits,reviews,videos`);
  if (!res.ok) return null;
  return await res.json();
}
