import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchMovieDetails } from '../services/api';
import { formatReleaseDate } from '../utils/helpers';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const MovieDetails = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDetails = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const data = await fetchMovieDetails(id);
        setMovie(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!movie) return (
    <div className="container mx-auto px-4 py-8 text-center">
      <p className="text-gray-500">Movie not found.</p>
      <Link to="/" className="text-blue-500 hover:underline mt-4 inline-block">← Back to Home</Link>
    </div>
  );

  const trailer = movie.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');
  const trailerUrl = trailer ? `https://www.youtube.com/embed/${trailer.key}` : null;
  const topCast = movie.credits?.cast?.slice(0, 5) || [];

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-gray-50">
      <Link 
        to="/" 
        className="text-blue-500 hover:underline mb-6 inline-block font-medium"
      >
        ← Back to Movies
      </Link>
      <div className="flex flex-col lg:flex-row gap-8">
        <img
          src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Image'}
          alt={`${movie.title} poster`}
          className="w-full lg:w-80 rounded-lg shadow-xl object-cover"
          onError={(e) => e.target.src = 'https://via.placeholder.com/500x750?text=No+Image'}
        />
        <div className="flex-1">
          <h1 className="text-4xl font-bold mb-4">{movie.title}</h1>
          <div className="flex flex-wrap items-center gap-4 mb-6 text-gray-600">
            <span>{formatReleaseDate(movie.release_date)}</span>
            <span>•</span>
            <span>{movie.runtime} min</span>
            <span>•</span>
            <span className="text-yellow-500 font-semibold">⭐ {movie.vote_average?.toFixed(1)}</span>
          </div>
          <p className="text-gray-700 mb-6 leading-relaxed">{movie.overview}</p>
          {movie.genres?.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Genres</h3>
              <div className="flex flex-wrap gap-2">
                {movie.genres.map(genre => (
                  <span key={genre.id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          {trailerUrl && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Trailer</h3>
              <iframe
                width="100%"
                height="315"
                src={trailerUrl}
                title={`${movie.title} trailer`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-lg"
              ></iframe>
            </div>
          )}
          {topCast.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Top Cast</h3>
              <div className="flex flex-wrap gap-4">
                {topCast.map(actor => (
                  <div key={actor.id} className="text-center">
                    <img
                      src={actor.profile_path ? `https://image.tmdb.org/t/p/w200${actor.profile_path}` : 'https://via.placeholder.com/200x300?text=Actor'}
                      alt={actor.name}
                      className="w-20 h-20 rounded-full object-cover mb-2"
                      onError={(e) => e.target.src = 'https://via.placeholder.com/200x300?text=Actor'}
                    />
                    <p className="text-sm font-medium">{actor.name}</p>
                    <p className="text-xs text-gray-500">as {actor.character}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;