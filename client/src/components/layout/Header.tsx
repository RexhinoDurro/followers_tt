// components/layout/Header.tsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../ui/Button';
import navlogo from '../../assets/navlogo.png';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [, setIsServicesOpen] = useState(false);
  const [cartCount] = useState(0);
  const location = useLocation();

  // Helper function to check if current route is active
  const isActive = (path: string) => location.pathname === path;

  // Close mobile menu when clicking on a link
  const handleMobileMenuClose = () => {
    setIsMenuOpen(false);
    setIsServicesOpen(false);
  };

  return (
    <header className="shadow-sm border-b sticky top-0 z-50" style={{ backgroundColor: '#6C44B4' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/" onClick={handleMobileMenuClose}>
                <img 
                  src={navlogo} 
                  alt="SocialBoost Pro" 
                  className="h-10 w-auto sm:h-12 hover:opacity-90 transition-opacity"
                />
              </Link>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-8">
            <Link 
              to="/" 
              className={`px-3 py-2 text-sm font-medium transition-colors text-white hover:text-gray-200 ${
                isActive('/') 
                  ? 'border-b-2 border-white' 
                  : ''
              }`}
            >
              Home
            </Link>
            
            <Link 
              to="/services/instagram" 
              className={`px-3 py-2 text-sm font-medium transition-colors text-white hover:text-gray-200 ${
                isActive('/services/instagram') 
                  ? 'border-b-2 border-white' 
                  : ''
              }`}
            >
              Services
            </Link>
            
           
            
            <Link 
              to="/how-it-works" 
              className={`px-3 py-2 text-sm font-medium transition-colors text-white hover:text-gray-200 ${
                isActive('/how-it-works') 
                  ? 'border-b-2 border-white' 
                  : ''
              }`}
            >
              How It Works
            </Link>
            
            <Link 
              to="/contact" 
              className={`px-3 py-2 text-sm font-medium transition-colors text-white hover:text-gray-200 ${
                isActive('/contact') 
                  ? 'border-b-2 border-white' 
                  : ''
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* Right side items */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Cart Icon */}
            <Link 
              to="/cart"
              className="relative p-2 text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6.5-5a2 2 0 100 4 2 2 0 000-4zm-7 0a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Get Started Button - Hidden on small screens, shown on medium+ */}
            <div className="hidden md:block">
              <Link to="/auth">
                <Button 
                  size="sm"
                  className="bg-white text-purple-800 hover:bg-gray-100 transition-colors border-white"
                >
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-white hover:text-gray-200 transition-colors focus:outline-none"
              aria-label="Toggle mobile menu"
            >
              {isMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`lg:hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          <div className="px-2 pt-2 pb-3 space-y-1 border-t border-purple-400">
            <Link 
              to="/" 
              className={`block px-3 py-2 text-sm font-medium transition-all duration-200 rounded-md ${
                isActive('/') 
                  ? 'bg-white text-purple-800' 
                  : 'text-white hover:bg-white hover:text-purple-800'
              }`}
              onClick={handleMobileMenuClose}
            >
              Home
            </Link>
            
            <Link 
              to="/services/instagram" 
              className={`block px-3 py-2 text-sm font-medium transition-all duration-200 rounded-md ${
                isActive('/services/instagram') 
                  ? 'bg-white text-purple-800' 
                  : 'text-white hover:bg-white hover:text-purple-800'
              }`}
              onClick={handleMobileMenuClose}
            >
              Services
            </Link>
            
            
            <Link 
              to="/how-it-works" 
              className={`block px-3 py-2 text-sm font-medium transition-all duration-200 rounded-md ${
                isActive('/how-it-works') 
                  ? 'bg-white text-purple-800' 
                  : 'text-white hover:bg-white hover:text-purple-800'
              }`}
              onClick={handleMobileMenuClose}
            >
              How It Works
            </Link>
            
            <Link 
              to="/contact" 
              className={`block px-3 py-2 text-sm font-medium transition-all duration-200 rounded-md ${
                isActive('/contact') 
                  ? 'bg-white text-purple-800' 
                  : 'text-white hover:bg-white hover:text-purple-800'
              }`}
              onClick={handleMobileMenuClose}
            >
              Contact
            </Link>

            {/* Mobile Get Started Button */}
            <div className="pt-2">
              <Link to="/auth" onClick={handleMobileMenuClose}>
                <Button 
                  size="sm"
                  className="w-full bg-white text-purple-800 hover:bg-gray-100 transition-colors border-white"
                >
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};