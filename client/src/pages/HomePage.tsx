// pages/HomePage.tsx - Fully Responsive Version
import React, { useState, useEffect } from 'react';
import { Play, TrendingUp, ArrowRight, CheckCircle, Quote, Users, Clock, Shield, CreditCard, TrendingUp as Growth, Target } from 'lucide-react';

interface HomePageProps {
  onGetStarted?: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onGetStarted }) => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const services = [
    {
      platform: 'YouTube',
      icon: '/src/assets/youtube.png',
      color: 'from-red-100 to-red-200',
      description: 'Grow your channel with targeted subscribers, views, and engagement that drives real results.',
      features: ['Real Subscribers', 'High-Retention Views', 'Monetization Ready', 'Algorithm Optimization'],
      stats: { followers: '2M+', engagement: '95%', clients: '1.2K' }
    },
    {
      platform: 'TikTok',
      icon: '/src/assets/tiktok.png',
      color: 'from-gray-200 to-gray-300',
      description: 'Viral growth strategies that get your content on the For You Page and build authentic followings.',
      features: ['Viral Content Strategy', 'FYP Optimization', 'Trending Hashtags', 'Engagement Pods'],
      stats: { followers: '5M+', engagement: '88%', clients: '2.1K' }
    },
    {
      platform: 'Instagram',
      icon: '/src/assets/instagram.png',
      color: 'from-purple-500 to-pink-500',
      description: 'Build a stunning Instagram presence with real followers, engagement, and brand partnerships.',
      features: ['Story Strategies', 'Reels Optimization', 'Brand Partnerships', 'Shopping Integration'],
      stats: { followers: '3M+', engagement: '92%', clients: '1.8K' }
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Fashion Influencer",
      platform: "Instagram",
      image: "👩‍💼",
      content: "In just 3 months, my Instagram grew from 5K to 50K followers. The engagement is incredible and all followers are real people who actually care about my content.",
      stats: "5K → 50K followers in 3 months"
    },
    {
      name: "Mike Rodriguez",
      role: "Gaming Content Creator",
      platform: "YouTube",
      image: "👨‍💻",
      content: "My YouTube channel finally hit monetization requirements! The subscribers are genuine gamers who actually watch my content. Revenue has increased 10x.",
      stats: "Hit 4K watch hours + 1K subs"
    },
    {
      name: "Emma Chen",
      role: "Dance Creator",
      platform: "TikTok",
      image: "👩‍🎨",
      content: "Three of my videos went viral after working with this team. They understand the TikTok algorithm better than anyone. My follower count exploded overnight.",
      stats: "3 viral videos, 500K+ followers"
    }
  ];

  const features = [
    { icon: Users, title: 'Real Users Only', description: 'No bots or fake accounts. Every follower is a real person.' },
    { icon: Clock, title: 'Fast Delivery', description: 'See results within 24-72 hours of starting your campaign.' },
    { icon: Shield, title: '100% Safe', description: 'Compliant with all platform guidelines. Your account stays secure.' },
    { icon: CreditCard, title: 'Money-Back Guarantee', description: '30-day guarantee. Not satisfied? Get your money back.' },
    { icon: Growth, title: 'Organic Growth', description: 'Natural growth patterns that look authentic to algorithms.' },
    { icon: Target, title: 'Targeted Audience', description: 'Reach people who are genuinely interested in your content.' }
  ];

  const stats = [
    { number: '10M+', label: 'Followers Delivered' },
    { number: '25K+', label: 'Happy Clients' },
    { number: '99.8%', label: 'Success Rate' },
    { number: '24/7', label: 'Expert Support' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-50 via-white to-pink-50 py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-16 h-16 sm:w-32 sm:h-32 bg-purple-200 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-20 sm:top-40 right-10 sm:right-20 w-24 h-24 sm:w-48 sm:h-48 bg-pink-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute bottom-10 sm:bottom-20 left-1/4 sm:left-1/3 w-12 h-12 sm:w-24 sm:h-24 bg-blue-200 rounded-full opacity-20 animate-pulse delay-2000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Trust Badge */}
            <div className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 rounded-full bg-gradient-to-r from-green-100 to-blue-100 text-green-800 text-xs sm:text-sm font-medium mb-6 sm:mb-8 animate-bounce">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              <span className="hidden sm:inline">Trusted by 25,000+ Creators Worldwide</span>
              <span className="sm:hidden">Trusted by 25K+ Creators</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-gray-900 mb-4 sm:mb-6 leading-tight">
              <span className="block">Grow Your</span>
              <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 bg-clip-text text-transparent block">
                Social Media
              </span>
              <span className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl flex items-center justify-center gap-2 sm:gap-4 mt-2">
                <span>Empire</span>
                <span className="animate-bounce text-lg sm:text-2xl md:text-3xl lg:text-4xl">🚀</span>
              </span>
            </h1>

            {/* Subtitle */}
            <div className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 mb-6 sm:mb-8 max-w-4xl mx-auto leading-relaxed px-2">
              <p className="mb-2">
                Professional social media marketing services for 
                <span className="font-semibold text-red-600"> YouTube</span>,
                <span className="font-semibold text-black"> TikTok</span>, and
                <span className="font-semibold text-purple-600"> Instagram</span>.
              </p>
              <p className="text-sm sm:text-base md:text-lg font-medium text-purple-700">
                Real followers. Real engagement. Real results.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10 max-w-3xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-600 mb-1">{stat.number}</div>
                  <div className="text-gray-600 text-xs sm:text-sm">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-12 px-4">
              <button 
                onClick={onGetStarted}
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 min-w-0 sm:min-w-64"
              >
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Start Growing Now</span>
              </button>
              <button className="w-full sm:w-auto border-2 border-purple-600 text-purple-600 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-purple-600 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 min-w-0 sm:min-w-64">
                <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Watch Success Stories</span>
                <span className="sm:hidden">Success Stories</span>
              </button>
            </div>

            {/* Platform Icons */}
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8 text-gray-500">
              <span className="text-xs sm:text-sm font-medium">Available on:</span>
              <div className="flex space-x-6 sm:space-x-8 items-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center transform hover:scale-110 transition-transform cursor-pointer">
                  <img src="/src/assets/youtube.png" alt="YouTube" className="w-full h-full object-contain" />
                </div>
                <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center transform hover:scale-110 transition-transform cursor-pointer">
                  <img src="/src/assets/tiktok.png" alt="TikTok" className="w-full h-full object-contain" />
                </div>
                <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center transform hover:scale-110 transition-transform cursor-pointer">
                  <img src="/src/assets/instagram.png" alt="Instagram" className="w-full h-full object-contain" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              Choose Your Platform
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Specialized growth strategies tailored for each platform's unique algorithm and audience behavior.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-white rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group">
                {/* Header */}
                <div className={`bg-gradient-to-r ${service.color} p-4 sm:p-6 ${service.platform === 'Instagram' ? 'text-white' : 'text-gray-800'} relative overflow-hidden`}>
                  <div className={`absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 ${service.platform === 'Instagram' ? 'bg-white' : 'bg-gray-300'} opacity-10 rounded-full -translate-y-12 sm:-translate-y-16 translate-x-12 sm:translate-x-16`}></div>
                  <div className="relative z-10">
                    <div className={`${service.platform === 'TikTok' ? 'w-20 h-20 sm:w-24 sm:h-24' : 'w-10 h-10 sm:w-12 sm:h-12'} mb-2`}>
                      <img src={service.icon} alt={service.platform} className="w-full h-full object-contain" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-2">{service.platform}</h3>
                    <div className="flex flex-col sm:flex-row sm:space-x-4 text-xs sm:text-sm opacity-90">
                      <span>{service.stats.followers} followers</span>
                      <span>{service.stats.engagement} engagement</span>
                      <span>{service.stats.clients} clients</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6">
                  <p className="text-gray-600 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">{service.description}</p>
                  
                  <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center text-gray-700">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                        <span className="text-xs sm:text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={onGetStarted}
                    className={`w-full bg-gradient-to-r ${service.color} text-white py-2.5 sm:py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 transform group-hover:scale-105 flex items-center justify-center gap-2 text-sm sm:text-base`}
                  >
                    <span className="hidden sm:inline">Get Started with {service.platform}</span>
                    <span className="sm:hidden">Get Started</span>
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              Why Choose VISIONBOOST Agency?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              We're not just another growth service. We're your dedicated partner in building authentic, lasting social media success.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="bg-white p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 text-center group">
                  <div className="flex justify-center mb-3 sm:mb-4 transform group-hover:scale-110 transition-transform duration-200">
                    <IconComponent className="w-10 h-10 sm:w-12 sm:h-12 text-purple-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              Success Stories
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Real results from real creators who trusted us with their growth journey.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-12 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-24 h-24 sm:w-32 sm:h-32 bg-purple-200 rounded-full opacity-20 -translate-x-12 sm:-translate-x-16 -translate-y-12 sm:-translate-y-16"></div>
              <div className="absolute bottom-0 right-0 w-32 h-32 sm:w-40 sm:h-40 bg-pink-200 rounded-full opacity-20 translate-x-16 sm:translate-x-20 translate-y-16 sm:translate-y-20"></div>
              
              <div className="relative z-10">
                <Quote className="w-8 h-8 sm:w-12 sm:h-12 text-purple-400 mb-4 sm:mb-6 mx-auto" />
                
                <div className="text-center">
                  <p className="text-lg sm:text-xl lg:text-2xl text-gray-700 mb-6 sm:mb-8 leading-relaxed font-medium px-2">
                    "{testimonials[activeTestimonial].content}"
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-center mb-4 space-y-2 sm:space-y-0 sm:space-x-4">
                    <div className="text-3xl sm:text-4xl lg:text-5xl">
                      {testimonials[activeTestimonial].image}
                    </div>
                    <div className="text-center sm:text-left">
                      <div className="font-bold text-gray-900 text-base sm:text-lg">
                        {testimonials[activeTestimonial].name}
                      </div>
                      <div className="text-purple-600 font-medium text-sm sm:text-base">
                        {testimonials[activeTestimonial].role}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        {testimonials[activeTestimonial].platform}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-100 text-green-800 px-3 py-2 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold inline-block">
                    📈 {testimonials[activeTestimonial].stats}
                  </div>
                </div>

                {/* Testimonial Navigation */}
                <div className="flex justify-center space-x-2 mt-6 sm:mt-8">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveTestimonial(index)}
                      className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-200 ${
                        index === activeTestimonial ? 'bg-purple-600' : 'bg-purple-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
            Ready to Transform Your Social Media?
          </h2>
          <p className="text-lg sm:text-xl text-purple-100 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Join thousands of creators who've accelerated their growth with our proven strategies. Your success story starts today.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <button 
              onClick={onGetStarted}
              className="w-full sm:w-auto bg-white text-purple-600 font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-full text-base sm:text-lg hover:shadow-2xl transition-all duration-200 transform hover:scale-105"
            >
              🚀 Start Your Growth Journey
            </button>
            <button className="w-full sm:w-auto border-2 border-white text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-full text-base sm:text-lg hover:bg-white hover:text-purple-600 transition-all duration-200">
              💬 Speak with an Expert
            </button>
          </div>
          <p className="text-purple-200 text-xs sm:text-sm mt-4 sm:mt-6 space-y-1 sm:space-y-0">
            <span className="block sm:inline">✅ No contracts</span>
            <span className="hidden sm:inline"> • </span>
            <span className="block sm:inline">✅ 30-day guarantee</span>
            <span className="hidden sm:inline"> • </span>
            <span className="block sm:inline">✅ Results within 72 hours</span>
          </p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;