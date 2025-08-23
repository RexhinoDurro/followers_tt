import React, { useState } from 'react';

// Types
interface Service {
  id: string;
  name: string;
  platform: 'instagram' | 'tiktok' | 'youtube';
  type: 'followers' | 'likes' | 'comments' | 'views' | 'shares' | 'subscribers';
  description: string;
  icon: string;
  minQuantity: number;
  maxQuantity: number;
  basePrice: number;
  features: string[];
}

interface ServiceCategory {
  platform: 'instagram' | 'tiktok' | 'youtube';
  name: string;
  icon: string;
  color: string;
  gradient: string;
  services: Service[];
}

interface Package {
  id: string;
  serviceId: string;
  name: string;
  quantity: number;
  price: number;
  originalPrice?: number;
  discount?: number;
  popular?: boolean;
  features: string[];
  deliveryTime: string;
  guarantee: string;
}

interface Testimonial {
  id: string;
  name: string;
  username: string;
  platform: string;
  avatar: string;
  rating: number;
  comment: string;
  verified: boolean;
  beforeFollowers: number;
  afterFollowers: number;
}

// Sample Data
const serviceCategories: ServiceCategory[] = [
  {
    platform: 'instagram',
    name: 'Instagram Growth',
    icon: '📸',
    color: 'bg-gradient-to-r from-purple-600 to-pink-600',
    gradient: 'from-purple-600 to-pink-600',
    services: [
      {
        id: 'ig-followers',
        name: 'Instagram Followers',
        platform: 'instagram',
        type: 'followers',
        description: 'Grow your Instagram following with real, active followers',
        icon: '👥',
        minQuantity: 100,
        maxQuantity: 100000,
        basePrice: 15,
        features: ['Real followers', 'Gradual delivery', '90-day guarantee', '24/7 support']
      },
      {
        id: 'ig-likes',
        name: 'Instagram Likes',
        platform: 'instagram',
        type: 'likes',
        description: 'Boost engagement with authentic Instagram likes',
        icon: '❤️',
        minQuantity: 50,
        maxQuantity: 50000,
        basePrice: 8,
        features: ['Instant delivery', 'High quality', '30-day refill', 'Safe & secure']
      },
      {
        id: 'ig-comments',
        name: 'Instagram Comments',
        platform: 'instagram',
        type: 'comments',
        description: 'Get meaningful comments from real users',
        icon: '💬',
        minQuantity: 10,
        maxQuantity: 5000,
        basePrice: 25,
        features: ['Custom comments', 'Native language', 'Real profiles', 'Manual review']
      }
    ]
  },
  {
    platform: 'tiktok',
    name: 'TikTok Growth',
    icon: '🎵',
    color: 'bg-gradient-to-r from-black to-red-600',
    gradient: 'from-black to-red-600',
    services: [
      {
        id: 'tt-followers',
        name: 'TikTok Followers',
        platform: 'tiktok',
        type: 'followers',
        description: 'Build your TikTok audience with engaged followers',
        icon: '👥',
        minQuantity: 100,
        maxQuantity: 100000,
        basePrice: 12,
        features: ['Active followers', 'Gradual growth', '60-day guarantee', 'Algorithm boost']
      },
      {
        id: 'tt-likes',
        name: 'TikTok Likes',
        platform: 'tiktok',
        type: 'likes',
        description: 'Increase your video likes for better reach',
        icon: '❤️',
        minQuantity: 50,
        maxQuantity: 100000,
        basePrice: 6,
        features: ['Instant likes', 'Viral potential', '30-day refill', 'FYP boost']
      }
    ]
  },
  {
    platform: 'youtube',
    name: 'YouTube Growth',
    icon: '📺',
    color: 'bg-gradient-to-r from-red-600 to-red-700',
    gradient: 'from-red-600 to-red-700',
    services: [
      {
        id: 'yt-subscribers',
        name: 'YouTube Subscribers',
        platform: 'youtube',
        type: 'subscribers',
        description: 'Grow your YouTube channel with real subscribers',
        icon: '👥',
        minQuantity: 100,
        maxQuantity: 100000,
        basePrice: 18,
        features: ['Real subscribers', 'Monetization boost', '120-day guarantee', 'Channel growth']
      },
      {
        id: 'yt-views',
        name: 'YouTube Views',
        platform: 'youtube',
        type: 'views',
        description: 'Increase video views and watch time',
        icon: '👁️',
        minQuantity: 1000,
        maxQuantity: 10000000,
        basePrice: 7,
        features: ['High retention', 'Watch time boost', 'SEO benefits', 'Monetization eligible']
      }
    ]
  }
];

const packages: Package[] = [
  {
    id: 'ig-followers-growth',
    serviceId: 'ig-followers',
    name: 'Growth',
    quantity: 5000,
    price: 65,
    originalPrice: 75,
    discount: 13,
    popular: true,
    features: ['5K Real Followers', '5-7 day delivery', '90-day guarantee', 'Priority support'],
    deliveryTime: '5-7 days',
    guarantee: '90 days'
  },
  {
    id: 'tt-followers-viral',
    serviceId: 'tt-followers',
    name: 'Viral',
    quantity: 10000,
    price: 100,
    originalPrice: 120,
    discount: 17,
    popular: true,
    features: ['10K Active Followers', '5-8 day delivery', '60-day guarantee', 'Algorithm boost'],
    deliveryTime: '5-8 days',
    guarantee: '60 days'
  },
  {
    id: 'yt-subs-monetize',
    serviceId: 'yt-subscribers',
    name: 'Monetization',
    quantity: 4000,
    price: 65,
    originalPrice: 72,
    discount: 10,
    popular: true,
    features: ['4K Real Subscribers', 'Monetization ready', '7-10 day delivery', '120-day guarantee'],
    deliveryTime: '7-10 days',
    guarantee: '120 days'
  }
];

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    username: '@sarahcreates',
    platform: 'Instagram',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    comment: 'Amazing service! My followers grew from 2K to 15K in just 2 weeks. The quality is incredible and they\'re all real, active users.',
    verified: true,
    beforeFollowers: 2000,
    afterFollowers: 15000
  },
  {
    id: '2',
    name: 'Marcus Chen',
    username: '@marcustech',
    platform: 'TikTok',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    comment: 'SocialBoost helped me hit 100K followers! My videos are now getting on the FYP regularly. Best investment I\'ve made.',
    verified: true,
    beforeFollowers: 15000,
    afterFollowers: 100000
  },
  {
    id: '3',
    name: 'Emma Rodriguez',
    username: '@emmalifestyle',
    platform: 'YouTube',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    comment: 'Finally hit the monetization threshold! The subscribers are real and engaged. My watch time has increased dramatically.',
    verified: true,
    beforeFollowers: 800,
    afterFollowers: 4200
  }
];

// UI Components
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}

const Button = ({ variant = 'primary', size = 'md', children, className = '', ...props }: ButtonProps) => {
  const baseClasses = 'font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants: Record<string, string> = {
    primary: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    outline: 'border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white',
    ghost: 'text-purple-600 hover:bg-purple-50'
  };
  
  const sizes: Record<string, string> = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
}

const Card = ({ children, className = '', hover = false, gradient = false }: CardProps) => {
  const baseClasses = 'bg-white rounded-xl shadow-lg p-6';
  const hoverClasses = hover ? 'hover:shadow-2xl hover:-translate-y-1 transition-all duration-300' : '';
  const gradientClasses = gradient ? 'bg-gradient-to-br from-white to-purple-50' : '';
  
  return (
    <div className={`${baseClasses} ${hoverClasses} ${gradientClasses} ${className}`}>
      {children}
    </div>
  );
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md';
}

const Badge = ({ children, variant = 'primary', size = 'sm' }: BadgeProps) => {
  const variants: Record<string, string> = {
    primary: 'bg-purple-100 text-purple-800',
    secondary: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800'
  };
  
  const sizes: Record<string, string> = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm'
  };
  
  return (
    <span className={`inline-flex items-center font-medium rounded-full ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
};

// Main Components
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount] = useState(0);

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              SocialBoost Pro
            </h1>
          </div>

          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-gray-700 hover:text-purple-600 px-3 py-2 text-sm font-medium transition-colors">Home</a>
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
            <a href="#" className="text-gray-700 hover:text-purple-600 px-3 py-2 text-sm font-medium transition-colors">Pricing</a>
            <a href="#" className="text-gray-700 hover:text-purple-600 px-3 py-2 text-sm font-medium transition-colors">How It Works</a>
            <a href="#" className="text-gray-700 hover:text-purple-600 px-3 py-2 text-sm font-medium transition-colors">Contact</a>
          </nav>

          <div className="flex items-center space-x-4">
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

const Hero = () => {
  return (
    <section className="relative bg-gradient-to-br from-purple-50 via-white to-pink-50 py-20 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-20 h-20 bg-purple-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-pink-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            Trusted by 50,000+ Creators Worldwide
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Grow Your
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent block">
              Social Media
            </span>
            <span className="text-4xl md:text-6xl">Instantly 🚀</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Get real followers, likes, and engagement from authentic users. 
            <span className="font-semibold text-purple-600"> Safe, fast, and guaranteed.</span>
          </p>

          <div className="flex flex-wrap justify-center gap-8 mb-10 text-center">
            <div>
              <div className="text-3xl font-bold text-purple-600">2M+</div>
              <div className="text-gray-600">Followers Delivered</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-pink-600">50K+</div>
              <div className="text-gray-600">Happy Clients</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">98%</div>
              <div className="text-gray-600">Success Rate</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button size="lg" className="min-w-48">
              🎯 Start Growing Now
            </Button>
            <Button variant="outline" size="lg" className="min-w-48">
              📊 View Pricing
            </Button>
          </div>

          <div className="flex justify-center items-center space-x-8 text-gray-400">
            <span className="text-sm">Works with:</span>
            <div className="flex space-x-6">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">IG</div>
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold text-sm">TT</div>
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">YT</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const ServiceOverview = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose Your Platform
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Grow your presence on the world's biggest social media platforms. 
            Real users, instant results, guaranteed quality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {serviceCategories.map((category) => (
            <Card key={category.platform} hover className="text-center group">
              <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${category.color} flex items-center justify-center text-4xl transform group-hover:scale-110 transition-transform duration-300`}>
                {category.icon}
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {category.name}
              </h3>

              <div className="space-y-3 mb-8">
                {category.services.map((service) => (
                  <div key={service.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{service.icon}</span>
                      <span className="font-medium text-gray-700">{service.name}</span>
                    </div>
                    <span className="text-sm text-purple-600 font-semibold">
                      ${service.basePrice}/1K
                    </span>
                  </div>
                ))}
              </div>

              <Button 
                variant="outline" 
                className="w-full group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600"
              >
                View {category.name} Packages
              </Button>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-4 bg-gradient-to-r from-purple-50 to-pink-50 px-8 py-4 rounded-2xl">
            <span className="text-lg">🔥</span>
            <span className="text-gray-700">
              <span className="font-semibold">Limited Time:</span> Get 20% off your first order
            </span>
            <Button size="sm">
              Claim Discount
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

const PricingPreview = () => {
  const featuredPackages = packages.filter(pkg => pkg.popular).slice(0, 3);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            No hidden fees, no contracts. Choose the package that fits your goals 
            and start growing today.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {featuredPackages.map((pkg) => (
            <Card key={pkg.id} hover className="relative text-center">
              {pkg.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge variant="primary" size="md">
                    🔥 Most Popular
                  </Badge>
                </div>
              )}

              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {pkg.name}
              </h3>

              <div className="mb-6">
                {pkg.originalPrice && (
                  <div className="text-lg text-gray-500 line-through">
                    ${pkg.originalPrice}
                  </div>
                )}
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  ${pkg.price}
                </div>
                {pkg.discount && (
                  <div className="text-green-600 font-semibold">
                    Save {pkg.discount}%
                  </div>
                )}
              </div>

              <div className="text-xl font-semibold text-gray-700 mb-6">
                {pkg.quantity.toLocaleString()} {pkg.serviceId.includes('followers') ? 'Followers' : 
                 pkg.serviceId.includes('likes') ? 'Likes' : 
                 pkg.serviceId.includes('subscribers') ? 'Subscribers' : 'Items'}
              </div>

              <ul className="space-y-3 mb-8">
                {pkg.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                className="w-full"
                variant={pkg.popular ? "primary" : "outline"}
              >
                Get Started
              </Button>

              <p className="text-sm text-gray-500 mt-4">
                {pkg.guarantee} guarantee
              </p>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button variant="outline" size="lg">
            View All Pricing Plans
          </Button>
        </div>

        <div className="mt-16 bg-gradient-to-r from-green-50 to-blue-50 rounded-3xl p-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-2xl">
                🛡️
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  30-Day Money Back Guarantee
                </h3>
                <p className="text-gray-600">
                  Not satisfied? Get your money back, no questions asked.
                </p>
              </div>
            </div>
            <Button>
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

const Testimonials = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Success Stories
          </h2>
          <p className="text-xl text-gray-600">
            Real results from real creators who trusted us with their growth
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    {testimonial.verified && (
                      <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{testimonial.username} • {testimonial.platform}</p>
                </div>
              </div>

              <div className="flex items-center mb-3">
                {[...Array(5)].map((_, i) => (
                  <svg 
                    key={i} 
                    className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <p className="text-gray-700 mb-4 italic">"{testimonial.comment}"</p>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">{testimonial.beforeFollowers.toLocaleString()}</div>
                    <div className="text-gray-500">Before</div>
                  </div>
                  <div className="text-2xl">📈</div>
                  <div className="text-center">
                    <div className="font-semibold text-purple-600">{testimonial.afterFollowers.toLocaleString()}</div>
                    <div className="text-gray-500">After</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center bg-white rounded-3xl p-12 shadow-xl">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Join Them?
          </h3>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Start your growth journey today and see why thousands of creators trust SocialBoost Pro
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="min-w-48">
              🚀 Get Started Now
            </Button>
            <Button variant="outline" size="lg" className="min-w-48">
              💬 Talk to an Expert
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              SocialBoost Pro
            </h3>
            <p className="text-gray-400 text-sm">
              Your trusted partner for authentic social media growth. Real followers, real engagement, real results.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.097.118.112.221.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-purple-400 transition-colors">Instagram Growth</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">TikTok Growth</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">YouTube Growth</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Custom Packages</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-purple-400 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Live Chat</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-purple-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Refund Policy</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 SocialBoost Pro. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>SSL Secured</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Safe & Secure</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Main App Component
const SocialBoostPro = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <ServiceOverview />
        <PricingPreview />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
};

export default SocialBoostPro;