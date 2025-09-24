import React, { useState, useEffect } from 'react';
import { fetchGenres } from '../services/api';
import LoadingSpinner from './LoadingSpinner';

const FilterBar = ({ onFilter }) => {
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [year, setYear] = useState('');
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGenres = async () => {
      try {
        setLoading(true);
        const genreList = await fetchGenres();
        setGenres(genreList);
      } catch (error) {
        console.error('Error loading genres:', error);
      } finally {
        setLoading(false);
      }
    };
    loadGenres();
  }, []);

  const handleApplyFilters = () => {
    onFilter({ genre: selectedGenre, year: year || '', sort: sortBy });
  };

  const handleClearFilters = () => {
    setSelectedGenre('');
    setYear('');
    setSortBy('popularity.desc');
    onFilter({ genre: '', year: '', sort: 'popularity.desc' });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="bg-gray-100 p-4 rounded-md my-4">
      <h3 className="font-semibold mb-4 text-center">Filters</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <label htmlFor="genre-select" className="sr-only">Select genre</label>
        <select
          id="genre-select"
          value={selectedGenre}
          onChange={(e) => setSelectedGenre(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Genres</option>
          {genres.map((genre) => (
            <option key={genre.id} value={genre.id}>{genre.name}</option>
          ))}
        </select>

        <label htmlFor="year-input" className="sr-only">Filter by year</label>
        <input
          id="year-input"
          type="number"
          min="1900"
          max={new Date().getFullYear()}
          placeholder="Year (e.g., 2023)"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <label htmlFor="sort-select" className="sr-only">Sort by</label>
        <select
          id="sort-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="popularity.desc">Popularity (Descending)</option>
          <option value="release_date.desc">Release Date (Newest)</option>
          <option value="vote_average.desc">Rating (Highest)</option>
          <option value="popularity.asc">Popularity (Ascending)</option>
        </select>
      </div>
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-4 justify-center">
        <button
          onClick={handleApplyFilters}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Apply Filters
        </button>
        <button
          onClick={handleClearFilters}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default FilterBar;