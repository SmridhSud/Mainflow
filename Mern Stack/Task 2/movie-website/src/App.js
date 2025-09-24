import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { fetchPopularMovies, searchMovies, fetchFilteredMovies } from './services/api';
import { debounce } from './utils/helpers';
import Navigation from './components/Navigation';
import SearchBar from './components/SearchBar';
import FilterBar from './components/FilterBar';
import MovieGrid from './components/MovieGrid';
import MovieDetails from './components/MovieDetails';

// Global Context for sharing app state (movies, loading, search, filters)
const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

// Home Page Component (Main listing with search, filters, pagination)
const Home = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ genre: '', year: '', sort: 'popularity.desc' });
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search function (prevents too many API calls during typing)
  const debouncedSearch = debounce(
    async (query) => {
      try {
        setLoading(true);
        setError(null);
        setPage(1);
        const { results, total_pages } = await searchMovies(query, 1);
        setMovies(results);
        setTotalPages(total_pages);
        setIsSearching(true);
      } catch (err) {
        setError(err.message);
        setMovies([]);
      } finally {
        setLoading(false);
      }
    },
    500
  );

  // Core function to fetch movies (handles popular, search, or filtered modes)
  const fetchMovies = useCallback(async (currentPage = 1, query = '', currentFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      let data;
      if (query.trim()) {
        data = await searchMovies(query, currentPage);
      } else if (Object.values(currentFilters).some(val => val && val !== 'popularity.desc')) {
        data = await fetchFilteredMovies(currentFilters, currentPage);
      } else {
        data = await fetchPopularMovies(currentPage);
      }
      setMovies(prev => currentPage === 1 ? data.results : [...prev, ...data.results]);
      setTotalPages(data.total_pages);
      setIsSearching(!!query.trim());
    } catch (err) {
      setError(err.message);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle search submission (resets filters, triggers debounced API call)
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    setFilters({ genre: '', year: '', sort: 'popularity.desc' }); // Reset filters on search
    if (query.trim()) {
      debouncedSearch(query);
    } else {
      setIsSearching(false);
      fetchMovies(1, '', {});
    }
  }, [debouncedSearch, fetchMovies]);

  // Handle filter changes (clears search if active, fetches filtered results)
  const handleFilters = useCallback((newFilters) => {
    if (searchQuery.trim()) {
      setSearchQuery('');
      setIsSearching(false);
    }
    setFilters(newFilters);
    fetchMovies(1, '', newFilters);
  }, [searchQuery, fetchMovies]);

  // Load more movies (pagination button handler)
  const loadMore = useCallback(() => {
    if (page < totalPages && !loading) {
      fetchMovies(page + 1, searchQuery, filters);
      setPage(prev => prev + 1);
    }
  }, [page, totalPages, loading, searchQuery, filters, fetchMovies]);

  // Initial load: Fetch popular movies on mount
  useEffect(() => {
    fetchMovies(1, '', {});
  }, [fetchMovies]);

  // Provide state to Context (for components like MovieGrid)
  const contextValue = { movies, loading, error, searchQuery, filters, isSearching, loadMore };

  return (
    <AppContext.Provider value={contextValue}>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
            {isSearching ? `Search Results for "${searchQuery}" (${movies.length} found)` : 'Popular Movies'}
          </h1>
          <SearchBar onSearch={handleSearch} />
          {!isSearching && <FilterBar onFilter={handleFilters} />}
          <MovieGrid 
            movies={movies} 
            isLoading={loading} 
            error={error} 
            onLoadMore={loadMore} 
          />
        </main>
      </div>
    </AppContext.Provider>
  );
};

// Bonus: Favorites Page (Placeholder - Add localStorage/auth later)
const Favorites = () => (
  <div className="min-h-screen bg-gray-50">
    <Navigation />
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Favorites (Bonus Feature)</h1>
      <p className="text-center text-gray-600">Implement favorites using localStorage or backend auth here.</p>
    </div>
  </div>
);

// Main App Component (Routing Setup)
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movie/:id" element={<MovieDetails />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="*" element={
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
              <Link to="/" className="text-blue-500 hover:underline">Go Home</Link>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
};

export default App;