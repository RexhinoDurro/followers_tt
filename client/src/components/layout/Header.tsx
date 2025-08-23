// components/layout/Header.tsx
import React, { useState } from 'react';
import { Button } from '../ui/Button';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount] = useState(0); // This would come from cart context

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                SocialBoost Pro
              </h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-gray-700 hover:text-purple-600 px-3 py-2 text-sm font-medium transition-colors">
              Home
            </a>
            <div className="relative group">
              <button className="text-gray-700 hover:text-purple-600 px-3 py-2 text-sm font-medium transition-colors">
                Services ↓
              </button>
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="py-1">
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50">Instagram Growth</a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50">TikTok Growth</a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50">YouTube Growth</a>
                </div>
              </div>
            </div>
            <a href="#" className="text-gray-700 hover:text-purple-600 px-3 py-2 text-sm font-medium transition-colors">
              Pricing
            </a>
            <a href="#" className="text-gray-700 hover:text-purple-600 px-3 py-2 text-sm font-medium transition-colors">
              How It Works
            </a>
            <a href="#" className="text-gray-700 hover:text-purple-600 px-3 py-2 text-sm font-medium transition-colors">
              Contact
            </a>
          </nav>

          {/* Cart and CTA */}
          <div className="flex items-center space-x-4">
            {/* Cart Icon */}
            <button className="relative p-2 text-gray-700 hover:text-purple-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6.5-5a2 2 0 100 4 2 2 0 000-4zm-7 0a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            <Button size="sm">Get Started</Button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-purple-600 transition-colors"
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
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t">
              <a href="#" className="block px-3 py-2 text-gray-700 hover:text-purple-600 transition-colors">Home</a>
              <a href="#" className="block px-3 py-2 text-gray-700 hover:text-purple-600 transition-colors">Instagram Growth</a>
              <a href="#" className="block px-3 py-2 text-gray-700 hover:text-purple-600 transition-colors">TikTok Growth</a>
              <a href="#" className="block px-3 py-2 text-gray-700 hover:text-purple-600 transition-colors">YouTube Growth</a>
              <a href="#" className="block px-3 py-2 text-gray-700 hover:text-purple-600 transition-colors">Pricing</a>
              <a href="#" className="block px-3 py-2 text-gray-700 hover:text-purple-600 transition-colors">How It Works</a>
              <a href="#" className="block px-3 py-2 text-gray-700 hover:text-purple-600 transition-colors">Contact</a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
