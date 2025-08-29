// components/layout/Header.tsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../ui/Button';
import navlogo from '../../assets/navlogo.png'; // Import your logo

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount] = useState(0); // This would come from cart context
  const location = useLocation();

  // Helper function to check if current route is active
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="shadow-sm border-b sticky top-0 z-40" style={{ backgroundColor: '#6C44B4' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/">
                <img 
                  src={navlogo} 
                  alt="SocialBoost Pro" 
                  className="h-12 w-auto hover:opacity-90 transition-opacity"
                />
              </Link>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              to="/" 
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'border-b-2' 
                  : 'text-white hover:text-gray-900'
              }`}
              style={isActive('/') ? { color: '#FFFFFF', borderBottomColor: '#6C44B4' } : {}}
            >
              Home
            </Link>
            
            <div className="relative group">
              <button 
                className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
                style={{ '--hover-color': '#6C44B4' } as React.CSSProperties}
                onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#FFFFFF'}
              >
                Services ↓
              </button>
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="py-1">
                  <Link 
                    to="/services/instagram" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
                    style={{ '--hover-bg': 'rgba(108, 68, 180, 0.1)' } as React.CSSProperties}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(108, 68, 180, 0.1)';
                      e.currentTarget.style.color = '#6C44B4';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#374151';
                    }}
                  >
                    Instagram Growth
                  </Link>
                  <Link 
                    to="/services/tiktok" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(108, 68, 180, 0.1)';
                      e.currentTarget.style.color = '#6C44B4';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#374151';
                    }}
                  >
                    TikTok Growth
                  </Link>
                  <Link 
                    to="/services/youtube" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(108, 68, 180, 0.1)';
                      e.currentTarget.style.color = '#6C44B4';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#374151';
                    }}
                  >
                    YouTube Growth
                  </Link>
                </div>
              </div>
            </div>
            
            <Link 
              to="/pricing" 
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                isActive('/pricing') 
                  ? 'border-b-2' 
                  : 'text-white hover:text-gray-900'
              }`}
              style={isActive('/pricing') ? { color: '#FFFFFF', borderBottomColor: '#6C44B4' } : {}}
              onMouseEnter={(e) => !isActive('/pricing') && (e.currentTarget.style.color = '#FFFFFF')}
              onMouseLeave={(e) => !isActive('/pricing') && (e.currentTarget.style.color = '#FFFFFF')}
            >
              Pricing
            </Link>
            
            <Link 
              to="/how-it-works" 
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                isActive('/how-it-works') 
                  ? 'border-b-2' 
                  : 'text-white hover:text-gray-900'
              }`}
              style={isActive('/how-it-works') ? { color: '#FFFFFF', borderBottomColor: '#6C44B4' } : {}}
              onMouseEnter={(e) => !isActive('/how-it-works') && (e.currentTarget.style.color = '#FFFFFF')}
              onMouseLeave={(e) => !isActive('/how-it-works') && (e.currentTarget.style.color = '#FFFFFF')}
            >
              How It Works
            </Link>
            
            <Link 
              to="/contact" 
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                isActive('/contact') 
                  ? 'border-b-2' 
                  : 'text-white hover:text-gray-900'
              }`}
              style={isActive('/contact') ? { color: '#FFFFFF', borderBottomColor: '#6C44B4' } : {}}
              onMouseEnter={(e) => !isActive('/contact') && (e.currentTarget.style.color = '#6C44B4')}
              onMouseLeave={(e) => !isActive('/contact') && (e.currentTarget.style.color = '#374151')}
            >
              Contact
            </Link>
          </nav>

          {/* Cart and CTA */}
          <div className="flex items-center space-x-4">
            {/* Cart Icon */}
            <Link 
              to="/cart"
              className="relative p-2 text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6.5-5a2 2 0 100 4 2 2 0 000-4zm-7 0a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            <Link to="/auth">
              <Button 
                size="sm"
                className="bg-white text-purple-800 hover:bg-gray-100 transition-colors border-white"
              >
                Get Started
              </Button>
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-purple-400" style={{ backgroundColor: '#6C44B4' }}>
              <Link 
                to="/" 
                className={`block px-3 py-2 text-sm font-medium transition-all duration-200 rounded-md text-white hover:bg-white hover:text-purple-800 ${
                  isActive('/') 
                    ? 'bg-white text-purple-800' 
                    : ''
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/services/instagram" 
                className="block px-3 py-2 text-sm font-medium text-white hover:bg-white hover:text-purple-800 transition-all duration-200 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Instagram Growth
              </Link>
              <Link 
                to="/services/tiktok" 
                className="block px-3 py-2 text-sm font-medium text-white hover:bg-white hover:text-purple-800 transition-all duration-200 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                TikTok Growth
              </Link>
              <Link 
                to="/services/youtube" 
                className="block px-3 py-2 text-sm font-medium text-white hover:bg-white hover:text-purple-800 transition-all duration-200 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                YouTube Growth
              </Link>
              <Link 
                to="/pricing" 
                className={`block px-3 py-2 text-sm font-medium transition-all duration-200 rounded-md text-white hover:bg-white hover:text-purple-800 ${
                  isActive('/pricing') 
                    ? 'bg-white text-purple-800' 
                    : ''
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link 
                to="/how-it-works" 
                className={`block px-3 py-2 text-sm font-medium transition-all duration-200 rounded-md text-white hover:bg-white hover:text-purple-800 ${
                  isActive('/how-it-works') 
                    ? 'bg-white text-purple-800' 
                    : ''
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </Link>
              <Link 
                to="/contact" 
                className={`block px-3 py-2 text-sm font-medium transition-all duration-200 rounded-md text-white hover:bg-white hover:text-purple-800 ${
                  isActive('/contact') 
                    ? 'bg-white text-purple-800' 
                    : ''
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};