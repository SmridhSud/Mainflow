import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex justify-center my-4" role="search">
      <label htmlFor="search-input" className="sr-only">Search for movies</label>
      <input
        id="search-input"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for movies..."
        className="px-4 py-2 border border-gray-300 rounded-l-md w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        aria-label="Movie search query"
      />
      <button
        type="submit"
        className="bg-blue-500 text-white px-6 py-2 rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Submit search"
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;