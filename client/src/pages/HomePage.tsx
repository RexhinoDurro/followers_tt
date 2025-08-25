// pages/HomePage.tsx - Updated with onGetStarted prop
import React, { useState, useEffect } from 'react';
import { Play, TrendingUp, Users, Star, ArrowRight, CheckCircle, Quote } from 'lucide-react';

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
      icon: '🎥',
      color: 'from-red-500 to-red-600',
      description: 'Grow your channel with targeted subscribers, views, and engagement that drives real results.',
      features: ['Real Subscribers', 'High-Retention Views', 'Monetization Ready', 'Algorithm Optimization'],
      stats: { followers: '2M+', engagement: '95%', clients: '1.2K' }
    },
    {
      platform: 'TikTok',
      icon: '🎵',
      color: 'from-black to-gray-800',
      description: 'Viral growth strategies that get your content on the For You Page and build authentic followings.',
      features: ['Viral Content Strategy', 'FYP Optimization', 'Trending Hashtags', 'Engagement Pods'],
      stats: { followers: '5M+', engagement: '88%', clients: '2.1K' }
    },
    {
      platform: 'Instagram',
      icon: '📸',
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
    { icon: '✅', title: 'Real Users Only', description: 'No bots or fake accounts. Every follower is a real person.' },
    { icon: '🚀', title: 'Fast Delivery', description: 'See results within 24-72 hours of starting your campaign.' },
    { icon: '🛡️', title: '100% Safe', description: 'Compliant with all platform guidelines. Your account stays secure.' },
    { icon: '💰', title: 'Money-Back Guarantee', description: '30-day guarantee. Not satisfied? Get your money back.' },
    { icon: '📈', title: 'Organic Growth', description: 'Natural growth patterns that look authentic to algorithms.' },
    { icon: '🎯', title: 'Targeted Audience', description: 'Reach people who are genuinely interested in your content.' }
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
      <section className="relative bg-gradient-to-br from-purple-50 via-white to-pink-50 py-20 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-purple-200 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-48 h-48 bg-pink-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-blue-200 rounded-full opacity-20 animate-pulse delay-2000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Trust Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-green-100 to-blue-100 text-green-800 text-sm font-medium mb-8 animate-bounce">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              Trusted by 25,000+ Creators Worldwide
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 leading-tight">
              Grow Your
              <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 bg-clip-text text-transparent block">
                Social Media
              </span>
              <span className="text-4xl md:text-6xl flex items-center justify-center gap-4">
                Empire <span className="animate-bounce">🚀</span>
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              Professional social media marketing services for 
              <span className="font-semibold text-red-600"> YouTube</span>,
              <span className="font-semibold text-black"> TikTok</span>, and
              <span className="font-semibold text-purple-600"> Instagram</span>.
              <br />
              <span className="text-lg font-medium text-purple-700">Real followers. Real engagement. Real results.</span>
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10 max-w-3xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-1">{stat.number}</div>
                  <div className="text-gray-600 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button 
                onClick={onGetStarted}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 min-w-64"
              >
                <TrendingUp className="w-5 h-5" />
                Start Growing Now
              </button>
              <button className="border-2 border-purple-600 text-purple-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-purple-600 hover:text-white transition-all duration-300 flex items-center gap-2 min-w-64">
                <Play className="w-5 h-5" />
                Watch Success Stories
              </button>
            </div>

            {/* Platform Icons */}
            <div className="flex justify-center items-center space-x-8 text-gray-500">
              <span className="text-sm font-medium">Available on:</span>
              <div className="flex space-x-6">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg transform hover:scale-110 transition-transform cursor-pointer">
                  🎥
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-black to-gray-800 rounded-2xl flex items-center justify-center text-2xl shadow-lg transform hover:scale-110 transition-transform cursor-pointer">
                  🎵
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg transform hover:scale-110 transition-transform cursor-pointer">
                  📸
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Choose Your Platform
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Specialized growth strategies tailored for each platform's unique algorithm and audience behavior.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group">
                {/* Header */}
                <div className={`bg-gradient-to-r ${service.color} p-6 text-white relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
                  <div className="relative z-10">
                    <div className="text-4xl mb-2">{service.icon}</div>
                    <h3 className="text-2xl font-bold mb-2">{service.platform}</h3>
                    <div className="flex space-x-4 text-sm opacity-90">
                      <span>{service.stats.followers} followers</span>
                      <span>{service.stats.engagement} engagement</span>
                      <span>{service.stats.clients} clients</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>
                  
                  <div className="space-y-3 mb-8">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center text-gray-700">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={onGetStarted}
                    className={`w-full bg-gradient-to-r ${service.color} text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 transform group-hover:scale-105 flex items-center justify-center gap-2`}
                  >
                    Get Started with {service.platform}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Choose SocialRise Pro?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're not just another growth service. We're your dedicated partner in building authentic, lasting social media success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 text-center group">
                <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-200">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Success Stories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real results from real creators who trusted us with their growth journey.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 lg:p-12 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-purple-200 rounded-full opacity-20 -translate-x-16 -translate-y-16"></div>
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-pink-200 rounded-full opacity-20 translate-x-20 translate-y-20"></div>
              
              <div className="relative z-10">
                <Quote className="w-12 h-12 text-purple-400 mb-6 mx-auto" />
                
                <div className="text-center">
                  <p className="text-xl lg:text-2xl text-gray-700 mb-8 leading-relaxed font-medium">
                    "{testimonials[activeTestimonial].content}"
                  </p>
                  
                  <div className="flex items-center justify-center mb-4">
                    <div className="text-5xl mr-4">
                      {testimonials[activeTestimonial].image}
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-gray-900 text-lg">
                        {testimonials[activeTestimonial].name}
                      </div>
                      <div className="text-purple-600 font-medium">
                        {testimonials[activeTestimonial].role}
                      </div>
                      <div className="text-sm text-gray-500">
                        {testimonials[activeTestimonial].platform}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold inline-block">
                    📈 {testimonials[activeTestimonial].stats}
                  </div>
                </div>

                {/* Testimonial Navigation */}
                <div className="flex justify-center space-x-2 mt-8">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveTestimonial(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-200 ${
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
      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Social Media?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Join thousands of creators who've accelerated their growth with our proven strategies. Your success story starts today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={onGetStarted}
              className="bg-white text-purple-600 font-bold py-4 px-8 rounded-full text-lg hover:shadow-2xl transition-all duration-200 transform hover:scale-105"
            >
              🚀 Start Your Growth Journey
            </button>
            <button className="border-2 border-white text-white font-semibold py-4 px-8 rounded-full text-lg hover:bg-white hover:text-purple-600 transition-all duration-200">
              💬 Speak with an Expert
            </button>
          </div>
          <p className="text-purple-200 text-sm mt-6">
            ✅ No contracts • ✅ 30-day guarantee • ✅ Results within 72 hours
          </p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;