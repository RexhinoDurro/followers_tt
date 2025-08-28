// App.tsx - Simple working version
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';

// Import only the components that exist
import { AuthForm } from './pages/auth/AuthForm';
import AdminOverview from './pages/admin/AdminOverview';
import ClientOverview from './pages/client/ClientOverview';
import AboutUs from './pages/AboutUs';
import Contact from './pages/Contact';
import HowItWorksPage from './pages/HowItWorksPage';
import PricingPage from './pages/PricingPage';
import CartPage from './pages/CartPage';
import InstagramGrowth from './pages/services/InstagramGrowth';
import TikTokGrowth from './pages/services/TikTokGrowth';
import YouTubeGrowth from './pages/services/YouTubeGrowth';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main>
          <Routes>
            {/* Home Route */}
            <Route path="/" element={<HomePage />} />
            
            {/* Pages with placeholder components */}
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/blog" element={<PlaceholderPage title="Blog" />} />
            <Route path="/faq" element={<PlaceholderPage title="FAQ" />} />
            
            {/* Service Routes */}
            <Route path="/services/instagram" element={<InstagramGrowth />} />
            <Route path="/services/tiktok" element={<TikTokGrowth />} />
            <Route path="/services/youtube" element={<YouTubeGrowth />} />
            
            {/* Cart & Checkout */}
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<PlaceholderPage title="Checkout" />} />
            <Route path="/order-confirmation" element={<PlaceholderPage title="Order Confirmed" />} />
            
            {/* Auth Routes */}
            <Route path="/auth" element={<AuthFormPage />} />
            
            {/* Dashboard Routes - using existing components */}
            <Route path="/dashboard/admin" element={<AdminOverview />} />
            <Route path="/dashboard/client" element={<ClientOverview />} />
            <Route path="/dashboard" element={<DashboardRedirect />} />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

// Simple placeholder component for pages that don't exist yet
const PlaceholderPage: React.FC<{ title: string; description?: string }> = ({ 
  title, 
  description = "This page is coming soon!" 
}) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
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

// Home page component
const HomePage: React.FC = () => (
  <div className="min-h-screen">
    {/* Hero Section */}
    <section className="bg-gradient-to-br from-purple-600 to-pink-600 text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Grow Your Social Media
            <span className="block text-yellow-300">Effortlessly</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Professional social media management services to boost your online presence and engagement
          </p>
          <div className="flex justify-center space-x-4">
            <a 
              href="/auth"
              className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              Get Started
            </a>
            <a 
              href="/how-it-works"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-purple-600 transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
    </section>

    {/* Features Section */}
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
          <p className="text-xl text-gray-600">Choose the platform that matters most to your business</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <ServiceCard 
            title="Instagram Growth"
            description="Increase your followers, engagement, and reach on Instagram"
            link="/services/instagram"
            color="bg-pink-500"
          />
          <ServiceCard 
            title="TikTok Growth"
            description="Go viral and build a massive TikTok following"
            link="/services/tiktok"
            color="bg-black"
          />
          <ServiceCard 
            title="YouTube Growth"
            description="Scale your YouTube channel with more subscribers and views"
            link="/services/youtube"
            color="bg-red-500"
          />
        </div>
      </div>
    </section>
  </div>
);

// Service card component
const ServiceCard: React.FC<{
  title: string;
  description: string;
  link: string;
  color: string;
}> = ({ title, description, link, color }) => (
  <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
    <div className={`${color} w-12 h-12 rounded-lg mb-6 flex items-center justify-center`}>
      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
      </svg>
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-600 mb-6">{description}</p>
    <a 
      href={link}
      className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
    >
      Learn More
    </a>
  </div>
);

// Service page component
const ServicePage: React.FC<{ service: string }> = ({ service }) => (
  <div className="min-h-screen bg-gray-50 py-20">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-8">{service}</h1>
        <p className="text-xl text-gray-600 mb-12">
          Professional {service.toLowerCase()} services to boost your online presence
        </p>
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Coming Soon!</h2>
          <p className="text-gray-600 mb-8">
            We're working hard to bring you the best {service.toLowerCase()} experience. 
            Sign up to be notified when we launch!
          </p>
          <a 
            href="/auth"
            className="bg-purple-600 text-white px-8 py-4 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Get Notified
          </a>
        </div>
      </div>
    </div>
  </div>
);

// Auth Form wrapper component
const AuthFormPage: React.FC = () => {
  const [isLogin, setIsLogin] = React.useState(true);
  const navigate = useNavigate();

  const handleSuccess = () => {
    // Get user data from localStorage (set by AuthForm)
    const userData = localStorage.getItem('user');
    
    if (userData) {
      const user = JSON.parse(userData);
      // Redirect based on user role
      if (user.role === 'admin') {
        navigate('/dashboard/admin');
      } else {
        navigate('/dashboard/client');
      }
    } else {
      // Fallback to client dashboard
      navigate('/dashboard/client');
    }
  };

  return (
    <AuthForm 
      isLogin={isLogin}
      onToggle={() => setIsLogin(!isLogin)}
      onSuccess={handleSuccess}
    />
  );
};

// Dashboard redirect based on user role
const DashboardRedirect: React.FC = () => {
  // This would use your auth context to determine user role
  // For now, redirecting to client dashboard
  React.useEffect(() => {
    window.location.href = '/dashboard/client';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p>Redirecting to dashboard...</p>
      </div>
    </div>
  );
};

// Simple 404 component
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