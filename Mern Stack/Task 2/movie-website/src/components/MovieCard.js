import React from 'react';
import { Link } from 'react-router-dom';
import { formatReleaseDate, truncateText } from '../utils/helpers';

const MovieCard = React.memo(({ movie }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
    <Link to={`/movie/${movie.id}`} aria-label={`View details for ${movie.title}`}>
      <img
        src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Image'}
        alt={`${movie.title} movie poster`}
        className="w-full h-64 object-cover"
        loading="lazy"
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/500x750?text=No+Image';
        }}
      />
      <div className="p-4">
        <h3 className="text-lg font-bold mb-2 line-clamp-2">{movie.title}</h3>
        <p className="text-gray-600 mb-1 text-sm">{formatReleaseDate(movie.release_date)}</p>
        <p className="text-yellow-500 font-semibold text-sm mb-2">⭐ {movie.vote_average?.toFixed(1) || 'N/A'}</p>
        <p className="text-gray-500 text-xs line-clamp-3">{truncateText(movie.overview)}</p>
      </div>
    </Link>
  </div>
));

MovieCard.displayName = 'MovieCard';

export default MovieCard;