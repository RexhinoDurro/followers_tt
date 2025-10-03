// pages/services/YouTubeGrowth.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Play,
 
  Users,
  TrendingUp,
  BarChart3,
  Eye,
  Star,
  CheckCircle,
  Zap,
  Calendar,
  Search,
  Award,
  Shield,
  Clock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Camera,
  Edit3,
  DollarSign,
  Monitor,
} from 'lucide-react';

const YouTubeGrowthPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'features' | 'process' | 'results'>('features');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const plans = [
    {
      name: 'Creator Starter',
      price: 49,
      subscribers: '200-500',
      features: [
        'Video SEO optimization',
        'Thumbnail design tips',
        'Title optimization',
        'Basic keyword research',
        'Weekly performance reports',
        'Email support'
      ]
    },
    {
      name: 'Creator Growth',
      price: 99,
      subscribers: '500-1,500',
      features: [
        'Advanced SEO strategies',
        'Custom thumbnail designs',
        'Video script optimization',
        'Playlist organization',
        'Community tab management',
        'Analytics deep dives',
        'Priority support',
        'Bi-weekly strategy calls'
      ],
      popular: true
    },
    {
      name: 'Creator Pro',
      price: 199,
      subscribers: '1,500-5,000',
      features: [
        'Full channel management',
        'Professional video editing',
        'Brand deal facilitation',
        'Monetization optimization',
        'Live streaming setup',
        'YouTube Shorts strategy',
        '24/7 priority support',
        'Weekly video calls',
        'Custom analytics dashboard'
      ]
    }
  ];

  const growthMetrics = [
    { icon: Users, label: 'Subscribers', value: '50K+', description: 'Real subscribers gained' },
    { icon: Eye, label: 'Views', value: '10M+', description: 'Monthly video views' },
    { icon: Clock, label: 'Watch Time', value: '500K+', description: 'Hours watched' },
    { icon: DollarSign, label: 'Revenue', value: '$25K+', description: 'Monthly earnings' }
  ];

  const features = [
    {
      icon: Search,
      title: 'YouTube SEO Mastery',
      description: 'Dominate YouTube search with advanced SEO strategies and keyword optimization.',
      details: ['Keyword research and analysis', 'Video tags optimization', 'Description writing that converts']
    },
    {
      icon: Camera,
      title: 'Thumbnail Design',
      description: 'Create eye-catching thumbnails that boost click-through rates and views.',
      details: ['A/B testing different designs', 'Psychology-based thumbnail creation', 'Brand consistency guidelines']
    },
    {
      icon: Edit3,
      title: 'Content Strategy',
      description: 'Develop a winning content strategy that keeps viewers coming back for more.',
      details: ['Content calendar planning', 'Series and playlist strategy', 'Trending topic identification']
    },
    {
      icon: Monitor,
      title: 'Channel Optimization',
      description: 'Optimize every aspect of your channel for maximum growth and engagement.',
      details: ['Channel art and branding', 'About section optimization', 'Channel trailer creation']
    },
    {
      icon: DollarSign,
      title: 'Monetization Support',
      description: 'Maximize your YouTube revenue through multiple monetization strategies.',
      details: ['AdSense optimization', 'Sponsorship opportunities', 'Merchandise integration']
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Track your growth with detailed YouTube Analytics and actionable insights.',
      details: ['Performance tracking dashboard', 'Audience retention analysis', 'Revenue optimization reports']
    }
  ];

  const testimonials = [
    {
      name: 'Marcus Johnson',
      handle: '@TechReviewsWithMarcus',
      image: '👨‍💻',
      text: 'Went from 10K to 250K subscribers in 8 months! My tech reviews are now getting millions of views.',
      subscribers: '250K subscribers',
      growth: '+2,400% growth'
    },
    {
      name: 'Sarah Williams',
      handle: '@CookingWithSarah',
      image: '👩‍🍳',
      text: 'The SEO strategies are incredible! My cooking videos rank #1 for competitive keywords.',
      subscribers: '180K subscribers',
      growth: '+1,700% growth'
    },
    {
      name: 'David Chen',
      handle: '@FitnessWithDavid',
      image: '💪',
      text: 'Amazing results! My fitness channel is now monetized and generating $15K+ per month.',
      subscribers: '320K subscribers',
      growth: '+3,100% growth'
    }
  ];

  const faqs = [
    {
      question: 'How long does it take to see results on YouTube?',
      answer: 'YouTube growth typically takes longer than other platforms, but most clients see initial improvements within 2-4 weeks. Significant subscriber growth usually happens within 2-3 months with consistent implementation of our strategies.'
    },
    {
      question: 'Do you help with video editing and production?',
      answer: 'Yes! Our higher-tier plans include video editing assistance, thumbnail creation, and production guidance to help you create professional-quality content that performs well.'
    },
    {
      question: 'Will you help me get monetized on YouTube?',
      answer: 'Absolutely! We help you reach the 1,000 subscriber and 4,000 watch hour requirements for monetization, and then optimize your revenue streams including AdSense, sponsorships, and merchandise.'
    },
    {
      question: 'Do you provide thumbnail design services?',
      answer: 'Yes! We create custom, high-converting thumbnails for your videos. Our thumbnails are designed using psychology-based principles to maximize click-through rates and views.'
    },
    {
      question: 'Can you help with YouTube Shorts strategy?',
      answer: 'Definitely! YouTube Shorts is a powerful tool for growth. We develop comprehensive Shorts strategies that complement your long-form content and drive subscribers to your main videos.'
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
                <Play className="w-12 h-12 mr-4 bg-white text-red-600 rounded-lg p-2" />
                <span className="text-2xl font-bold">YouTube Growth</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Scale Your
                <span className="block text-yellow-300">YouTube Channel</span>
              </h1>
              <p className="text-xl mb-8 leading-relaxed">
                Transform your YouTube channel into a thriving business. Our proven strategies help you gain 
                subscribers, increase views, and maximize revenue.
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
                  <DollarSign className="w-4 h-4 mr-2" />
                  <span>Monetization Focus</span>
                </div>
                <div className="flex items-center">
                  <Award className="w-4 h-4 mr-2" />
                  <span>Proven Results</span>
                </div>
              </div>
            </div>
            
            {/* YouTube Stats Dashboard Mockup */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold mb-6 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-yellow-400" />
                Channel Analytics Dashboard
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {growthMetrics.map((metric, index) => (
                  <div key={index} className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
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
                <span>Revenue This Month</span>
                <div className="flex items-center text-green-300">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>+45% vs last month</span>
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
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How We Scale Your YouTube Channel</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive YouTube growth strategy focuses on sustainable growth and monetization
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
                      title: 'Channel Audit & Analysis',
                      description: 'Comprehensive analysis of your channel, content performance, and growth opportunities.',
                      duration: '2-3 days'
                    },
                    {
                      step: 2,
                      title: 'SEO & Content Strategy',
                      description: 'Develop keyword-optimized content strategy and SEO plan for maximum discoverability.',
                      duration: '3-5 days'
                    },
                    {
                      step: 3,
                      title: 'Content Creation & Optimization',
                      description: 'Implement optimized titles, thumbnails, descriptions, and content structure.',
                      duration: 'Ongoing'
                    },
                    {
                      step: 4,
                      title: 'Growth Tracking & Scaling',
                      description: 'Monitor performance, optimize based on analytics, and scale successful strategies.',
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
                  <h3 className="text-3xl font-bold text-gray-900 mb-6">YouTube Success Metrics</h3>
                  <div className="space-y-6">
                    <div className="flex items-center">
                      <div className="bg-red-100 p-3 rounded-full mr-4">
                        <Users className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">800% Average Growth</div>
                        <div className="text-gray-600">In subscribers within 6 months</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="bg-yellow-100 p-3 rounded-full mr-4">
                        <Eye className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">1,000% View Increase</div>
                        <div className="text-gray-600">Monthly video views growth</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="bg-green-100 p-3 rounded-full mr-4">
                        <DollarSign className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">$25K+ Monthly Revenue</div>
                        <div className="text-gray-600">Average monetization success</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-2xl p-8 text-white">
                  <h4 className="text-xl font-bold mb-6 flex items-center">
                    <Award className="w-5 h-5 mr-2 text-yellow-400" />
                    Creator Success Stories
                  </h4>
                  <div className="space-y-4">
                    {testimonials.slice(0, 2).map((testimonial, index) => (
                      <div key={index} className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                        <div className="flex items-center mb-2">
                          <span className="text-2xl mr-3">{testimonial.image}</span>
                          <div>
                            <div className="font-semibold">{testimonial.name}</div>
                            <div className="text-sm opacity-80">{testimonial.handle}</div>
                          </div>
                        </div>
                        <p className="text-sm mb-2">"{testimonial.text}"</p>
                        <div className="flex justify-between text-xs">
                          <span>{testimonial.subscribers}</span>
                          <span className="text-yellow-300">{testimonial.growth}</span>
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
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your YouTube Growth Plan</h2>
            <p className="text-xl text-gray-600">Start scaling your channel and maximizing revenue today</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-white rounded-2xl shadow-lg ${
                  plan.popular ? 'ring-2 ring-red-500 transform scale-105' : ''
                } transition-all duration-300 hover:shadow-xl`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-red-500 to-red-700 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center">
                      <Star className="w-4 h-4 mr-1" />
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="p-8">
                  <div className="text-center mb-8">
                    <div className="bg-red-600 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Play className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <div className="text-4xl font-bold text-gray-900 mb-2">${plan.price}</div>
                    <div className="text-gray-600 mb-4">{plan.subscribers} subscribers/month</div>
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
                        ? 'bg-gradient-to-r from-red-500 to-red-700 text-white hover:from-red-600 hover:to-red-800'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    Start Growing
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
            <h2 className="text-4xl font-bold text-gray-900 mb-4">YouTube Success Stories</h2>
            <p className="text-xl text-gray-600">See how our creators achieved massive growth and monetization</p>
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
                  <span className="text-sm text-gray-500">{testimonial.subscribers}</span>
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
            <p className="text-xl text-gray-600">Everything you need to know about YouTube channel growth</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-gray-50 rounded-lg">
                <button
                  className="w-full text-left p-6 focus:outline-none focus:ring-2 focus:ring-red-500"
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
            Ready to Scale Your YouTube Channel?
          </h2>
          <p className="text-xl text-white mb-8 max-w-3xl mx-auto">
            Join thousands of successful YouTube creators who have transformed their channels into thriving businesses
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
              Get Custom Strategy
            </Link>
          </div>
          <div className="mt-8 flex items-center justify-center space-x-8 text-sm text-white/80">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              <span>Results in 2-4 weeks</span>
            </div>
            <div className="flex items-center">
              <DollarSign className="w-4 h-4 mr-2" />
              <span>Monetization focused</span>
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