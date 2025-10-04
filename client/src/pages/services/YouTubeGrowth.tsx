// pages/services/YouTubeGrowth.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Play,
  Heart,
  Users,
  TrendingUp,
  BarChart3,
  MessageCircle,
  Eye,
  Star,
  CheckCircle,
  Zap,
  Target,
  Calendar,
  Video,
  Hash,
  Award,
  Shield,
  Clock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ShoppingCart
} from 'lucide-react';

const YouTubeGrowthPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'features' | 'process' | 'results'>('features');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const followerPackages = [
    { followers: '1K', price: 20 },
    { followers: '3K', price: 50 },
    { followers: '5K', price: 80 },
    { followers: '10K', price: 140 },
    { followers: '15K', price: 190 },
    { followers: '20K', price: 250 }
  ];

  const plans = [
    {
      name: 'Starter',
      price: 100,
      features: [
        '12 posts per month',
        '12 interactive stories',
        'Hashtag research',
        'Monthly reports',
        'ideal for small businesses',
      ]
    },
    {
      name: 'Pro',
      price: 250,
      features: [
        '20 posts + reels',
        'Monthly promotional areas',
        'boost strategies',
        'Bio optimization',
        'report + recommendations',
        'Story engagement boost',
        'aggressive boosting',
      ],
      popular: true
    },
    {
      name: 'Premium',
      price: 400,
      features: [
        'YouTube + Instagram + Facebook',
        '30 posts(design,reels carousel)',
        'Advertising on a budget',
        'Influencer outreach assistance',
        'full and professional management',
      ]
    }
  ];

  const growthMetrics = [
    { icon: Users, label: 'Subscribers', value: '50K+', description: 'Real subscribers gained' },
    { icon: Heart, label: 'Engagement', value: '300%', description: 'Average increase' },
    { icon: Eye, label: 'Views', value: '2M+', description: 'Monthly video views' },
    { icon: BarChart3, label: 'Growth Rate', value: '150%', description: 'Faster than average' }
  ];

  const features = [
    {
      icon: Target,
      title: 'Targeted Subscriber Growth',
      description: 'We attract real, engaged subscribers who are genuinely interested in your content and niche.',
      details: ['Audience research and targeting', 'Interest-based subscriber acquisition', 'Geographic targeting options']
    },
    {
      icon: Hash,
      title: 'Advanced SEO Strategy',
      description: 'Our AI-powered keyword research ensures maximum discoverability for your videos.',
      details: ['Custom keyword sets for each video', 'Trending topic identification', 'Competitor keyword analysis']
    },
    {
      icon: Video,
      title: 'Content Optimization',
      description: 'Get expert guidance on creating videos that drive engagement and growth.',
      details: ['Upload timing optimization', 'Title and description writing guidance', 'Thumbnail design advice']
    },
    {
      icon: MessageCircle,
      title: 'Engagement Management',
      description: 'We help manage and boost your engagement to increase visibility and reach.',
      details: ['Strategic commenting and community posts', 'Audience engagement tactics', 'Community interaction']
    },
    {
      icon: BarChart3,
      title: 'Analytics & Reporting',
      description: 'Track your growth with detailed analytics and actionable insights.',
      details: ['Weekly growth reports', 'Engagement rate analysis', 'Audience insights dashboard']
    },
    {
      icon: Shield,
      title: '100% Safe & Compliant',
      description: 'All our methods are organic and comply with YouTube\'s terms of service.',
      details: ['No bots or fake accounts', 'Organic growth methods only', 'Account safety guaranteed']
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      handle: '@sarahjcreates',
      image: '👩‍🎨',
      text: 'Grew from 2K to 25K subscribers in 3 months! The engagement quality is incredible.',
      followers: '25K subscribers',
      growth: '+2300% growth'
    },
    {
      name: 'Mike Rodriguez',
      handle: '@mikefit',
      image: '💪',
      text: 'Best investment for my fitness channel. Real subscribers who actually engage with my content.',
      followers: '45K subscribers',
      growth: '+1800% growth'
    },
    {
      name: 'Emma Thompson',
      handle: '@emmastyle',
      image: '👗',
      text: 'Amazing results! My fashion channel exploded and brands started reaching out.',
      followers: '85K subscribers',
      growth: '+4200% growth'
    }
  ];

  const faqs = [
    {
      question: 'How quickly will I see results?',
      answer: 'Most clients see initial growth within 7-14 days. Significant results typically appear within the first month, with exponential growth continuing over time.'
    },
    {
      question: 'Are the subscribers real people?',
      answer: 'Yes! We only use organic methods to attract real, active YouTube users who are genuinely interested in your content and niche.'
    },
    {
      question: 'Is this safe for my YouTube account?',
      answer: 'Absolutely. All our methods are 100% compliant with YouTube\'s terms of service. We use only organic growth strategies to protect your account.'
    },
    {
      question: 'What information do you need from me?',
      answer: 'We only need your YouTube channel URL and basic information about your target audience and goals. We never ask for passwords or sensitive information.'
    },
    {
      question: 'Can I target specific demographics?',
      answer: 'Yes! We can target subscribers based on location, interests, age, gender, and similar channels to ensure you get the most relevant audience.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-red-600 to-red-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center mb-6">
                <Play className="w-12 h-12 mr-4" />
                <span className="text-2xl font-bold">YouTube Growth</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Grow Your YouTube
                <span className="block text-yellow-300">Organically</span>
              </h1>
              <p className="text-xl mb-8 leading-relaxed">
                Get real, engaged subscribers who love your content. Our proven strategies help you build 
                an authentic YouTube presence that converts.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link 
                  to="/auth"
                  className="bg-white text-red-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors flex items-center justify-center"
                >
                  Start Growing Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <a 
                  href="#pricing"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-red-600 transition-colors text-center"
                >
                  View Pricing
                </a>
              </div>
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  <span>100% Safe</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  <span>Real Subscribers</span>
                </div>
                <div className="flex items-center">
                  <Award className="w-4 h-4 mr-2" />
                  <span>Proven Results</span>
                </div>
              </div>
            </div>
            
            {/* Stats Dashboard Mockup */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-6">Live Growth Dashboard</h3>
              <div className="grid grid-cols-2 gap-4">
                {growthMetrics.map((metric, index) => (
                  <div key={index} className="bg-white/20 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <metric.icon className="w-5 h-5 mr-2" />
                      <span className="text-sm font-medium">{metric.label}</span>
                    </div>
                    <div className="text-2xl font-bold mb-1">{metric.value}</div>
                    <div className="text-xs opacity-80">{metric.description}</div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-between text-sm">
                <span>Growth Rate</span>
                <div className="flex items-center text-green-300">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>+23% this week</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      

      {/* Features Tabs Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How We Grow Your YouTube</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive approach combines proven strategies with cutting-edge technology
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-12">
            <div className="bg-gray-100 p-1 rounded-lg inline-flex">
              {[
                { id: 'features' as const, label: 'Features', icon: Zap },
                { id: 'process' as const, label: 'Process', icon: Calendar },
                { id: 'results' as const, label: 'Results', icon: BarChart3 }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-md font-medium transition-all duration-200 flex items-center ${
                    activeTab === tab.id
                      ? 'bg-white shadow-md text-red-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === 'features' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <div key={index} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div className="bg-red-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600 mb-4">{feature.description}</p>
                    <ul className="space-y-2">
                      {feature.details.map((detail, idx) => (
                        <li key={idx} className="flex items-center text-sm text-gray-500">
                          <CheckCircle className="w-3 h-3 text-green-500 mr-2" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'process' && (
              <div className="max-w-4xl mx-auto">
                <div className="space-y-8">
                  {[
                    {
                      step: 1,
                      title: 'Account Analysis',
                      description: 'We analyze your current YouTube channel and identify growth opportunities.',
                      duration: '1-2 days'
                    },
                    {
                      step: 2,
                      title: 'Strategy Development',
                      description: 'Create a custom growth plan tailored to your niche and target audience.',
                      duration: '2-3 days'
                    },
                    {
                      step: 3,
                      title: 'Growth Implementation',
                      description: 'Execute the strategy using our proven organic growth methods.',
                      duration: 'Ongoing'
                    },
                    {
                      step: 4,
                      title: 'Monitor & Optimize',
                      description: 'Continuously track performance and optimize for maximum growth.',
                      duration: 'Weekly'
                    }
                  ].map((step) => (
                    <div key={step.step} className="flex items-start">
                      <div className="bg-red-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold mr-6 flex-shrink-0">
                        {step.step}
                      </div>
                      <div className="flex-1 bg-white rounded-lg p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                            {step.duration}
                          </span>
                        </div>
                        <p className="text-gray-600">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'results' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-6">Proven Results</h3>
                  <div className="space-y-6">
                    <div className="flex items-center">
                      <div className="bg-green-100 p-3 rounded-full mr-4">
                        <TrendingUp className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">500% Average Growth</div>
                        <div className="text-gray-600">In subscribers within 90 days</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-3 rounded-full mr-4">
                        <Heart className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">300% Engagement Boost</div>
                        <div className="text-gray-600">Higher likes, comments, and shares</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="bg-purple-100 p-3 rounded-full mr-4">
                        <Eye className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">10x Reach Increase</div>
                        <div className="text-gray-600">More people discovering your content</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-2xl p-8 text-white">
                  <h4 className="text-xl font-bold mb-6">Success Stories</h4>
                  <div className="space-y-4">
                    {testimonials.slice(0, 2).map((testimonial, index) => (
                      <div key={index} className="bg-white/20 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <span className="text-2xl mr-3">{testimonial.image}</span>
                          <div>
                            <div className="font-semibold">{testimonial.name}</div>
                            <div className="text-sm opacity-80">{testimonial.handle}</div>
                          </div>
                        </div>
                        <p className="text-sm mb-2">"{testimonial.text}"</p>
                        <div className="flex justify-between text-xs">
                          <span>{testimonial.followers}</span>
                          <span className="text-green-300">{testimonial.growth}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Growth Plan</h2>
            <p className="text-xl text-gray-600">Start growing your YouTube today with our proven strategies</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-white rounded-2xl shadow-lg ${
                  plan.popular ? 'ring-2 ring-red-600 transform scale-105' : ''
                } transition-all duration-300 hover:shadow-xl`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-red-600 to-red-800 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center">
                      <Star className="w-4 h-4 mr-1" />
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <div className="text-4xl font-bold text-gray-900 mb-2">${plan.price}</div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    to="/auth"
                    className={`w-full py-3 px-4 rounded-lg font-semibold text-center transition-colors duration-200 block ${
                      plan.popular
                        ? 'bg-gradient-to-r from-red-600 to-red-800 text-white hover:from-red-700 hover:to-red-900'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Follower Packages Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Subscriber Packages</h2>
            <p className="text-xl text-gray-600">Choose the perfect package to boost your YouTube channel</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {followerPackages.map((pkg, index) => (
              <div
                key={index}
                className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-red-600 hover:shadow-xl transition-all duration-300"
              >
                <div className="text-center">
                  <div className="bg-gradient-to-br from-red-600 to-red-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">{pkg.followers}</h3>
                  <p className="text-gray-600 mb-4">Subscribers</p>
                  <div className="text-4xl font-bold text-red-600 mb-6">${pkg.price}</div>
                  <Link
                    to="/auth"
                    className="w-full bg-gradient-to-r from-red-600 to-red-800 text-white py-3 px-6 rounded-lg font-semibold hover:from-red-700 hover:to-red-900 transition-colors flex items-center justify-center"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Get Started
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Success Stories</h2>
            <p className="text-xl text-gray-600">See how our clients transformed their YouTube channel</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center mb-4">
                  <span className="text-4xl mr-4">{testimonial.image}</span>
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-red-600">{testimonial.handle}</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">"{testimonial.text}"</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{testimonial.followers}</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    {testimonial.growth}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Everything you need to know about our YouTube growth service</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-gray-50 rounded-lg">
                <button
                  className="w-full text-left p-6 focus:outline-none focus:ring-2 focus:ring-red-600"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                    {openFaq === index ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-red-600 to-red-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Grow Your YouTube?
          </h2>
          <p className="text-xl text-white mb-8 max-w-3xl mx-auto">
            Join thousands of successful creators and businesses who have transformed their YouTube presence
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/auth"
              className="bg-white text-red-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors flex items-center justify-center"
            >
              Start Growing Today
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link
              to="/contact"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-red-600 transition-colors"
            >
              Get Custom Quote
            </Link>
          </div>
          <div className="mt-8 flex items-center justify-center space-x-8 text-sm text-white/80">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              <span>Results in 7-14 days</span>
            </div>
            <div className="flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              <span>100% safe methods</span>
            </div>
            <div className="flex items-center">
              <Award className="w-4 h-4 mr-2" />
              <span>Money-back guarantee</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default YouTubeGrowthPage;