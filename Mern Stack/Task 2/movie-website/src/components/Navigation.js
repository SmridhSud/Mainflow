import React from 'react';
import { Link } from 'react-router-dom';

const Navigation = () => (
  <nav className="bg-blue-600 text-white p-4 shadow-md" role="navigation" aria-label="Main navigation">
    <div className="container mx-auto flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold hover:text-blue-200 transition-colors">MovieHub</Link>
      <ul className="flex space-x-6">
        <li><Link to="/" className="hover:underline focus:outline-none focus:ring-2 focus:ring-white rounded">Home</Link></li>
        <li><Link to="/favorites" className="hover:underline focus:outline-none focus:ring-2 focus:ring-white rounded">Favorites (Bonus)</Link></li>
      </ul>
    </div>
  </nav>
);

export default Navigation;