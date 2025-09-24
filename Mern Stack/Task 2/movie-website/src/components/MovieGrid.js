import React from 'react';
import MovieCard from './MovieCard';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const MovieGrid = ({ movies, isLoading, error, onLoadMore }) => {
  if (isLoading && movies.length === 0) {
    return <LoadingSpinner />;
  }
  if (error) {
    return <ErrorMessage message={error} onRetry={onLoadMore} />;
  }

  if (!movies || movies.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 text-lg">No movies found. Try adjusting your search or filters.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
      {onLoadMore && (
        <div className="flex justify-center">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {isLoading ? 'Loading More...' : 'Load More Movies'}
          </button>
        </div>
      )}
    </>
  );
};

export default MovieGrid;