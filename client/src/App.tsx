// client/src/App.tsx - Updated with Backend Integration and Auth Context
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DashboardLayout } from './dashboard/DashboardLayout';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';

// Import pages
import { AuthForm } from './pages/auth/AuthForm';
import AdminOverview from './dashboard/admin/AdminOverview';
import ClientOverview from './dashboard/client/ClientOverview';
import HomePage from './pages/HomePage';
import AboutUs from './pages/AboutUs';
import Contact from './pages/Contact';
import HowItWorksPage from './pages/HowItWorksPage';
import PricingPage from './pages/PricingPage';
import CartPage from './pages/CartPage';
import InstagramGrowth from './pages/services/InstagramGrowth';
import TikTokGrowth from './pages/services/TikTokGrowth';
import YouTubeGrowth from './pages/services/YouTubeGrowth';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirect to dashboard if already authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Dashboard Route Component
const DashboardRoute: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <DashboardLayout user={user} onLogout={logout}>
      {user.role === 'admin' ? <AdminOverview /> : <ClientOverview />}
    </DashboardLayout>
  );
};

// Auth Form Page Component
const AuthFormPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { user } = useAuth();

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSuccess = () => {
    // The AuthContext will handle the user state update
    // Navigation will happen automatically via the ProtectedRoute logic
    window.location.href = '/dashboard';
  };

  return (
    <AuthForm 
      isLogin={isLogin}
      onToggle={() => setIsLogin(!isLogin)}
      onSuccess={handleSuccess}
    />
  );
};

// Main App Component
const AppContent: React.FC = () => {
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      window.location.href = '/dashboard';
    } else {
      window.location.href = '/auth';
    }
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes with Header/Footer */}
        <Route path="/" element={
          <div className="min-h-screen bg-gray-50">
            <Header />
            <main>
              <HomePage onGetStarted={handleGetStarted} />
            </main>
            <Footer />
          </div>
        } />
        
        <Route path="/pricing" element={
          <div className="min-h-screen bg-gray-50">
            <Header />
            <main>
              <PricingPage />
            </main>
            <Footer />
          </div>
        } />
        
        <Route path="/how-it-works" element={
          <div className="min-h-screen bg-gray-50">
            <Header />
            <main>
              <HowItWorksPage />
            </main>
            <Footer />
          </div>
        } />
        
        <Route path="/contact" element={
          <div className="min-h-screen bg-gray-50">
            <Header />
            <main>
              <Contact />
            </main>
            <Footer />
          </div>
        } />
        
        <Route path="/about" element={
          <div className="min-h-screen bg-gray-50">
            <Header />
            <main>
              <AboutUs />
            </main>
            <Footer />
          </div>
        } />
        
        {/* Service Routes */}
        <Route path="/services/instagram" element={
          <div className="min-h-screen bg-gray-50">
            <Header />
            <main>
              <InstagramGrowth />
            </main>
            <Footer />
          </div>
        } />
        
        <Route path="/services/tiktok" element={
          <div className="min-h-screen bg-gray-50">
            <Header />
            <main>
              <TikTokGrowth />
            </main>
            <Footer />
          </div>
        } />
        
        <Route path="/services/youtube" element={
          <div className="min-h-screen bg-gray-50">
            <Header />
            <main>
              <YouTubeGrowth />
            </main>
            <Footer />
          </div>
        } />
        
        {/* Cart & Checkout Routes */}
        <Route path="/cart" element={
          <div className="min-h-screen bg-gray-50">
            <Header />
            <main>
              <CartPage />
            </main>
            <Footer />
          </div>
        } />
        
        <Route path="/checkout" element={
          <div className="min-h-screen bg-gray-50">
            <Header />
            <main>
              <PlaceholderPage title="Checkout" description="Complete your purchase" />
            </main>
            <Footer />
          </div>
        } />
        
        <Route path="/order-confirmation" element={
          <div className="min-h-screen bg-gray-50">
            <Header />
            <main>
              <PlaceholderPage title="Order Confirmed" description="Thank you for your purchase!" />
            </main>
            <Footer />
          </div>
        } />
        
        {/* Blog and FAQ Routes */}
        <Route path="/blog" element={
          <div className="min-h-screen bg-gray-50">
            <Header />
            <main>
              <PlaceholderPage title="Blog" description="Social media tips and insights coming soon" />
            </main>
            <Footer />
          </div>
        } />
        
        <Route path="/faq" element={
          <div className="min-h-screen bg-gray-50">
            <Header />
            <main>
              <PlaceholderPage title="FAQ" description="Frequently asked questions" />
            </main>
            <Footer />
          </div>
        } />
        
        {/* Auth Route - Public only */}
        <Route path="/auth" element={
          <PublicRoute>
            <AuthFormPage />
          </PublicRoute>
        } />
        
        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardRoute />
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/admin" element={
          <ProtectedRoute>
            <DashboardLayout user={user} onLogout={() => {}}>
              <AdminOverview />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/client" element={
          <ProtectedRoute>
            <DashboardLayout user={user} onLogout={() => {}}>
              <ClientOverview />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

// Main App with Auth Provider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

// Placeholder component for unfinished pages
const PlaceholderPage: React.FC<{ title: string; description?: string }> = ({ 
  title, 
  description = "This page is coming soon!" 
}) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 py-20">
    <div className="text-center max-w-md mx-auto p-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
      <p className="text-xl text-gray-600 mb-8">{description}</p>
      <div className="flex justify-center space-x-4">
        <button 
          onClick={() => window.history.back()}
          className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Go Back
        </button>
        <a 
          href="/"
          className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
        >
          Go Home
        </a>
      </div>
    </div>
  </div>
);

// 404 component
const NotFound: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">Page not found</p>
      <a 
        href="/"
        className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
      >
        Go Home
      </a>
    </div>
  </div>
);

export default App;