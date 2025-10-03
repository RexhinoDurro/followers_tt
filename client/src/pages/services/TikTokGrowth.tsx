// pages/services/TikTokGrowth.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Play,
  Heart,
  Users,
  BarChart3,
  Eye,
  Star,
  CheckCircle,
  Zap,
  Target,
  Calendar,
  Video,
  Hash,
  Music,
  Award,
  Shield,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Flame,
  Sparkles,

} from 'lucide-react';

const TikTokGrowthPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'features' | 'process' | 'results'>('features');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const plans = [
    {
      name: 'Viral Starter',
      price: 39,
      followers: '1,000-2,000',
      features: [
        'Trending hashtag research',
        'Video optimization tips',
        'Basic engagement boost',
        'Weekly trend analysis',
        'Email support',
        'Safe organic methods'
      ]
    },
    {
      name: 'Viral Growth',
      price: 79,
      followers: '2,500-5,000',
      features: [
        'Advanced trend analysis',
        'Video editing suggestions',
        'Optimal posting schedule',
        'Duet & collaboration strategies',
        'Live stream optimization',
        'Priority support',
        'Monthly strategy sessions',
        'Viral content planning'
      ],
      popular: true
    },
    {
      name: 'Viral Pro',
      price: 149,
      followers: '5,000-10,000',
      features: [
        'Custom viral content strategy',
        'Dedicated TikTok specialist',
        'Influencer collaboration setup',
        'Brand partnership opportunities',
        'Advanced analytics dashboard',
        '24/7 priority support',
        'Weekly strategy calls',
        'Trend forecasting',
        'Crisis management support'
      ]
    }
  ];

  const growthMetrics = [
    { icon: Users, label: 'Followers', value: '100K+', description: 'Real followers gained' },
    { icon: Heart, label: 'Engagement', value: '400%', description: 'Average increase' },
    { icon: Eye, label: 'Views', value: '5M+', description: 'Monthly video views' },
    { icon: Flame, label: 'Viral Rate', value: '200%', description: 'More viral content' }
  ];

  const features = [
    {
      icon: Flame,
      title: 'Viral Content Strategy',
      description: 'We help create content that has the potential to go viral and reach millions.',
      details: ['Trend analysis and prediction', 'Viral content templates', 'Timing optimization for maximum reach']
    },
    {
      icon: Music,
      title: 'Trending Audio & Music',
      description: 'Stay ahead with the latest trending sounds and music that boost your visibility.',
      details: ['Daily trending audio updates', 'Music licensing guidance', 'Sound effect recommendations']
    },
    {
      icon: Hash,
      title: 'Hashtag Optimization',
      description: 'Master the art of TikTok hashtags to get discovered by your target audience.',
      details: ['Trending hashtag research', 'Niche-specific hashtag sets', 'Hashtag performance tracking']
    },
    {
      icon: Video,
      title: 'Video Editing Guidance',
      description: 'Learn professional video editing techniques that make your content stand out.',
      details: ['Editing software recommendations', 'Transition and effect tutorials', 'Hook creation strategies']
    },
    {
      icon: Target,
      title: 'Audience Targeting',
      description: 'Reach the right audience with precise targeting strategies tailored to TikTok.',
      details: ['Demographics analysis', 'Interest-based targeting', 'Geographic optimization']
    },
    {
      icon: BarChart3,
      title: 'Performance Analytics',
      description: 'Track your growth with detailed TikTok-specific analytics and insights.',
      details: ['Video performance metrics', 'Audience engagement analysis', 'Growth trend reports']
    }
  ];

  const testimonials = [
    {
      name: 'Alex Chen',
      handle: '@alexdances',
      image: '💃',
      text: 'Went from 5K to 500K followers in 4 months! My dance videos are getting millions of views.',
      followers: '500K followers',
      growth: '+10,000% growth'
    },
    {
      name: 'Jamie Rodriguez',
      handle: '@cookingwithjamie',
      image: '👨‍🍳',
      text: 'The viral strategies work! My cooking videos hit the For You page regularly now.',
      followers: '250K followers',
      growth: '+5,000% growth'
    },
    {
      name: 'Taylor Swift Fan',
      handle: '@swiftieforever',
      image: '🎤',
      text: 'Amazing results! My content creation improved dramatically and engagement skyrocketed.',
      followers: '180K followers',
      growth: '+3,600% growth'
    }
  ];

  const faqs = [
    {
      question: 'How quickly will I see results on TikTok?',
      answer: 'TikTok growth can happen very quickly due to the algorithm. Most clients see initial growth within 3-7 days, with potential viral moments happening within the first week.'
    },
    {
      question: 'Will you help me create viral content?',
      answer: 'Yes! We provide viral content strategies, trending topic suggestions, and guidance on creating engaging videos that have the potential to go viral on TikTok.'
    },
    {
      question: 'Do you help with TikTok trends and challenges?',
      answer: 'Absolutely! We monitor trending hashtags, sounds, and challenges daily, and help you participate in trends that align with your niche and brand.'
    },
    {
      question: 'Is this safe for my TikTok account?',
      answer: 'Yes, we only use organic growth methods that comply with TikTok\'s community guidelines. We focus on content optimization and engagement strategies, never fake followers or bots.'
    },
    {
      question: 'Can you help with TikTok Live streaming?',
      answer: 'Yes! Our higher-tier plans include live streaming optimization, helping you engage with your audience in real-time and grow your following through live content.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 to-black text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center mb-6">
                <Play className="w-12 h-12 mr-4 text-white" />
                <span className="text-2xl font-bold">TikTok Growth</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Go Viral on
                <span className="block text-red-400">TikTok</span>
              </h1>
              <p className="text-xl mb-8 leading-relaxed">
                Master the art of viral content creation. Our proven TikTok strategies help you reach millions 
                of viewers and build a massive, engaged following.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link 
                  to="/auth"
                  className="bg-red-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-red-600 transition-colors flex items-center justify-center"
                >
                  Start Going Viral
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <a 
                  href="#pricing"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-black transition-colors text-center"
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
                  <Flame className="w-4 h-4 mr-2" />
                  <span>Viral Content</span>
                </div>
                <div className="flex items-center">
                  <Award className="w-4 h-4 mr-2" />
                  <span>Proven Results</span>
                </div>
              </div>
            </div>
            
            {/* TikTok Stats Dashboard Mockup */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold mb-6 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-yellow-400" />
                Live Growth Dashboard
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
                <span>Viral Score</span>
                <div className="flex items-center text-red-400">
                  <Flame className="w-4 h-4 mr-1" />
                  <span>🔥 Hot Streak: 7 days</span>
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
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How We Make You Go Viral</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive TikTok growth strategy combines viral content creation with advanced targeting
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
                      ? 'bg-white shadow-md text-red-500'
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
                      title: 'Account & Content Analysis',
                      description: 'We analyze your current TikTok presence and identify viral opportunities in your niche.',
                      duration: '1-2 days'
                    },
                    {
                      step: 2,
                      title: 'Viral Strategy Development',
                      description: 'Create a custom content strategy focused on trending topics and viral potential.',
                      duration: '2-3 days'
                    },
                    {
                      step: 3,
                      title: 'Content Creation & Optimization',
                      description: 'Implement viral content strategies and optimize posting times for maximum reach.',
                      duration: 'Ongoing'
                    },
                    {
                      step: 4,
                      title: 'Performance Tracking & Scaling',
                      description: 'Monitor viral performance and scale successful content types for continued growth.',
                      duration: 'Daily'
                    }
                  ].map((step) => (
                    <div key={step.step} className="flex items-start">
                      <div className="bg-red-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold mr-6 flex-shrink-0">
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
                  <h3 className="text-3xl font-bold text-gray-900 mb-6">Viral Success Stories</h3>
                  <div className="space-y-6">
                    <div className="flex items-center">
                      <div className="bg-red-100 p-3 rounded-full mr-4">
                        <Flame className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">1000% Average Growth</div>
                        <div className="text-gray-600">In followers within 60 days</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="bg-yellow-100 p-3 rounded-full mr-4">
                        <Eye className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">5M+ Views Generated</div>
                        <div className="text-gray-600">Average monthly video views</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="bg-purple-100 p-3 rounded-full mr-4">
                        <Sparkles className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">50+ Viral Videos</div>
                        <div className="text-gray-600">Content that reached millions</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-8 text-white">
                  <h4 className="text-xl font-bold mb-6 flex items-center">
                    <Star className="w-5 h-5 mr-2 text-yellow-400" />
                    Viral Success Stories
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
                          <span>{testimonial.followers}</span>
                          <span className="text-red-400">{testimonial.growth}</span>
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
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Viral Growth Plan</h2>
            <p className="text-xl text-gray-600">Start creating viral content and growing your TikTok today</p>
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
                    <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center">
                      <Flame className="w-4 h-4 mr-1" />
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="p-8">
                  <div className="text-center mb-8">
                    <div className="bg-gray-900 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Play className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <div className="text-4xl font-bold text-gray-900 mb-2">${plan.price}</div>
                    <div className="text-gray-600 mb-4">{plan.followers} followers/month</div>
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
                        ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    Start Going Viral
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
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Viral Success Stories</h2>
            <p className="text-xl text-gray-600">See how our clients achieved viral success on TikTok</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center mb-4">
                  <span className="text-4xl mr-4">{testimonial.image}</span>
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-red-500">{testimonial.handle}</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">"{testimonial.text}"</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{testimonial.followers}</span>
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
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
            <p className="text-xl text-gray-600">Everything you need to know about TikTok viral growth</p>
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
      <section className="py-20 bg-gradient-to-r from-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Go Viral on TikTok?
          </h2>
          <p className="text-xl text-white mb-8 max-w-3xl mx-auto">
            Join thousands of successful TikTok creators who have achieved viral success with our proven strategies
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/auth"
              className="bg-red-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-red-600 transition-colors flex items-center justify-center"
            >
              Start Going Viral Today
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link
              to="/contact"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-black transition-colors"
            >
              Get Custom Strategy
            </Link>
          </div>
          <div className="mt-8 flex items-center justify-center space-x-8 text-sm text-white/80">
            <div className="flex items-center">
              <Flame className="w-4 h-4 mr-2" />
              <span>Viral in 7 days</span>
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

export default TikTokGrowthPage;