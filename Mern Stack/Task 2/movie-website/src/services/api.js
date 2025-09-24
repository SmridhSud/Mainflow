import axios from 'axios';

const API_KEY = process.env.REACT_APP_TMDB_API_KEY;
const BASE_URL = process.env.REACT_APP_TMDB_BASE_URL;

if (!API_KEY) {
  console.error('TMDb API key not found! Add REACT_APP_TMDB_API_KEY to .env');
}

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  params: {
    api_key: API_KEY,
    language: 'en-US',
  },
});

api.interceptors.request.use((config) => {
  console.log('API Request:', config.method?.toUpperCase(), config.url);
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status >= 500 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log('Retrying request...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      return api(originalRequest);
    }
    if (error.response?.status === 429) {
      console.error('Rate limit hit. Waiting 10s...');
      await new Promise(resolve => setTimeout(resolve, 10000));
      return api(originalRequest);
    }
    console.error('API Error:', error.response?.data?.status_message || error.message);
    return Promise.reject(error);
  }
);

export const fetchPopularMovies = async (page = 1) => {
  try {
    const response = await api.get('/movie/popular', { params: { page } });
    return { results: response.data.results || [], total_pages: response.data.total_pages || 0 };
  } catch (error) {
    throw new Error('Failed to fetch popular movies: ' + (error.response?.data?.status_message || error.message));
  }
};

export const searchMovies = async (query, page = 1) => {
  if (!query?.trim()) throw new Error('Search query is required');
  try {
    const response = await api.get('/search/movie', { params: { query, page, include_adult: false } });
    return { results: response.data.results || [], total_pages: response.data.total_pages || 0 };
  } catch (error) {
    throw new Error('Failed to search movies: ' + (error.response?.data?.status_message || error.message));
  }
};

export const fetchFilteredMovies = async (filters = {}, page = 1) => {
  try {
    const params = { page, include_adult: false };
    if (filters.genre) params.with_genres = filters.genre;
    if (filters.year) params.primary_release_year = filters.year;
    if (filters.sort) params.sort_by = filters.sort;
    const response = await api.get('/discover/movie', { params });
    return { results: response.data.results || [], total_pages: response.data.total_pages || 0 };
  } catch (error) {
    throw new Error('Failed to fetch filtered movies: ' + (error.response?.data?.status_message || error.message));
  }
};

export const fetchMovieDetails = async (id) => {
  if (!id) throw new Error('Movie ID is required');
  try {
    const response = await api.get(`/movie/${id}?append_to_response=credits,videos,images`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch movie details: ' + (error.response?.data?.status_message || error.message));
  }
};

export const fetchGenres = async () => {
  try {
    const response = await api.get('/genre/movie/list');
    return response.data.genres || [];
  } catch (error) {
    throw new Error('Failed to fetch genres: ' + (error.response?.data?.status_message || error.message));
  }
};