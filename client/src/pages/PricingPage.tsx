// pages/PricingPage.tsx - Fully Responsive Version
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Check, 
  Star, 
  Zap, 
  Crown, 
  Rocket,
  Users,
  TrendingUp,
  Shield,
  Clock,
  MessageCircle,
  BarChart3,
  Target,
  Award
} from 'lucide-react';

const PricingPage: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [selectedPlatform, setSelectedPlatform] = useState<'instagram' | 'tiktok' | 'youtube'>('instagram');

  const platforms = [
    { id: 'instagram' as const, name: 'Instagram', icon: '📸', color: 'from-pink-500 to-purple-500' },
    { id: 'tiktok' as const, name: 'TikTok', icon: '🎵', color: 'from-gray-800 to-gray-600' },
    { id: 'youtube' as const, name: 'YouTube', icon: '📺', color: 'from-red-500 to-red-600' }
  ];

  const pricingPlans = {
    instagram: [
      {
        name: 'Starter',
        icon: Zap,
        price: { monthly: 29, annual: 299 },
        description: 'Perfect for individuals and small accounts starting their growth journey',
        features: [
          '500-1,000 new followers/month',
          'Basic hashtag research',
          'Content optimization tips',
          'Weekly performance reports',
          'Email support',
          'Safe & organic growth methods'
        ],
        limitations: [],
        popular: false,
        color: 'border-gray-200'
      },
      {
        name: 'Growth',
        icon: TrendingUp,
        price: { monthly: 69, annual: 699 },
        description: 'Ideal for businesses and influencers serious about scaling their presence',
        features: [
          '1,500-3,000 new followers/month',
          'Advanced hashtag strategy',
          'Content calendar & posting schedule',
          'Competitor analysis',
          'Daily engagement optimization',
          'Bi-weekly strategy calls',
          'Priority email & chat support',
          'Story engagement boost',
          'Reels optimization'
        ],
        limitations: [],
        popular: true,
        color: 'border-purple-500 ring-2 ring-purple-200'
      },
      {
        name: 'Pro',
        icon: Crown,
        price: { monthly: 129, annual: 1299 },
        description: 'For established brands and agencies requiring maximum growth and features',
        features: [
          '3,000-5,000 new followers/month',
          'Custom content strategy',
          'Dedicated account manager',
          'Advanced analytics dashboard',
          'Influencer outreach assistance',
          'Brand collaboration opportunities',
          'Weekly video strategy calls',
          '24/7 priority support',
          'Custom hashtag research',
          'Competitor monitoring',
          'Crisis management support'
        ],
        limitations: [],
        popular: false,
        color: 'border-yellow-400'
      },
      {
        name: 'Enterprise',
        icon: Rocket,
        price: { monthly: 299, annual: 2999 },
        description: 'Complete social media domination for large brands and agencies',
        features: [
          '5,000+ new followers/month',
          'Multi-account management',
          'White-label reporting',
          'Custom API integration',
          'Dedicated team of specialists',
          'Monthly in-person/video meetings',
          'Custom automation workflows',
          'Advanced A/B testing',
          'Influencer network access',
          'Brand partnership facilitation',
          'Legal compliance support',
          'Custom contract terms'
        ],
        limitations: [],
        popular: false,
        color: 'border-gradient-to-r from-purple-500 to-pink-500'
      }
    ],
    tiktok: [
      {
        name: 'Viral Starter',
        icon: Zap,
        price: { monthly: 39, annual: 399 },
        description: 'Get your TikTok content in front of the right audience',
        features: [
          '1,000-2,000 new followers/month',
          'Trending hashtag research',
          'Video optimization tips',
          'Engagement boost strategies',
          'Weekly trend analysis',
          'Email support'
        ],
        limitations: [],
        popular: false,
        color: 'border-gray-200'
      },
      {
        name: 'Viral Growth',
        icon: TrendingUp,
        price: { monthly: 79, annual: 799 },
        description: 'Maximize your viral potential with advanced TikTok strategies',
        features: [
          '2,500-5,000 new followers/month',
          'Advanced trend analysis',
          'Video editing suggestions',
          'Optimal posting times',
          'Duet and collaboration strategies',
          'Live stream optimization',
          'Priority support',
          'Monthly strategy sessions'
        ],
        limitations: [],
        popular: true,
        color: 'border-purple-500 ring-2 ring-purple-200'
      },
      {
        name: 'Viral Pro',
        icon: Crown,
        price: { monthly: 149, annual: 1499 },
        description: 'Dominate TikTok with professional-grade growth strategies',
        features: [
          '5,000+ new followers/month',
          'Custom viral content strategy',
          'Dedicated TikTok specialist',
          'Influencer collaboration setup',
          'Brand partnership opportunities',
          'Advanced analytics',
          '24/7 support',
          'Weekly strategy calls',
          'Trend forecasting'
        ],
        limitations: [],
        popular: false,
        color: 'border-yellow-400'
      }
    ],
    youtube: [
      {
        name: 'Creator Starter',
        icon: Zap,
        price: { monthly: 49, annual: 499 },
        description: 'Build your YouTube channel with proven growth strategies',
        features: [
          '200-500 new subscribers/month',
          'Video SEO optimization',
          'Thumbnail design tips',
          'Title and description optimization',
          'Weekly performance reports',
          'Email support'
        ],
        limitations: [],
        popular: false,
        color: 'border-gray-200'
      },
      {
        name: 'Creator Growth',
        icon: TrendingUp,
        price: { monthly: 99, annual: 999 },
        description: 'Scale your YouTube presence with advanced optimization',
        features: [
          '500-1,500 new subscribers/month',
          'Advanced SEO strategies',
          'Custom thumbnail designs',
          'Video script optimization',
          'Playlist organization',
          'Community tab management',
          'Priority support',
          'Bi-weekly strategy calls'
        ],
        limitations: [],
        popular: true,
        color: 'border-purple-500 ring-2 ring-purple-200'
      },
      {
        name: 'Creator Pro',
        icon: Crown,
        price: { monthly: 199, annual: 1999 },
        description: 'Professional YouTube growth for serious content creators',
        features: [
          '1,500+ new subscribers/month',
          'Full channel management',
          'Professional thumbnail creation',
          'Video editing assistance',
          'Monetization optimization',
          'Brand deal facilitation',
          '24/7 support',
          'Weekly video calls',
          'Analytics deep dives'
        ],
        limitations: [],
        popular: false,
        color: 'border-yellow-400'
      }
    ]
  };

  const currentPlans = pricingPlans[selectedPlatform];
  const discount = billingCycle === 'annual' ? 17 : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 to-pink-600 text-white py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6">
              Simple, Transparent <span className="text-yellow-300">Pricing</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 max-w-3xl mx-auto px-2">
              Choose the perfect plan to grow your social media presence. No hidden fees, no long-term contracts.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <Award className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-300" />
              <span className="text-base sm:text-lg">30-day money-back guarantee on all plans</span>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Selection */}
      <section className="py-8 sm:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Choose Your Platform</h2>
            <p className="text-gray-600 text-sm sm:text-base">Select the social media platform you want to grow</p>
          </div>
          <div className="flex justify-center">
            <div className="bg-gray-100 p-1 rounded-lg inline-flex w-full max-w-md sm:max-w-none sm:w-auto overflow-x-auto">
              {platforms.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => setSelectedPlatform(platform.id)}
                  className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 rounded-md font-medium transition-all duration-200 text-sm sm:text-base whitespace-nowrap ${
                    selectedPlatform === platform.id
                      ? 'bg-white shadow-md text-purple-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span className="mr-1 sm:mr-2">{platform.icon}</span>
                  {platform.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Billing Toggle */}
      <section className="pb-6 sm:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <span className={`font-medium text-sm sm:text-base ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                billingCycle === 'annual' ? 'bg-purple-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`font-medium text-sm sm:text-base ${billingCycle === 'annual' ? 'text-gray-900' : 'text-gray-500'}`}>
              Annual
            </span>
            {billingCycle === 'annual' && (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs sm:text-sm font-medium">
                Save {discount}%
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="pb-12 sm:pb-16 md:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {currentPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-white rounded-xl sm:rounded-2xl shadow-xl ${plan.color} ${
                  plan.popular ? 'transform scale-100 sm:scale-105' : ''
                } transition-all duration-300 hover:shadow-2xl`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium flex items-center">
                      <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="p-6 sm:p-8">
                  {/* Plan Header */}
                  <div className="text-center mb-6 sm:mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-3 sm:mb-4">
                      <plan.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">{plan.description}</p>
                    
                    {/* Price */}
                    <div className="mb-3 sm:mb-4">
                      <span className="text-3xl sm:text-4xl font-bold text-gray-900">
                        ${plan.price[billingCycle]}
                      </span>
                      <span className="text-gray-500 ml-1 text-sm sm:text-base">
                        /{billingCycle === 'monthly' ? 'month' : 'year'}
                      </span>
                      {billingCycle === 'annual' && (
                        <div className="text-xs sm:text-sm text-green-600 mt-1">
                          Save ${(plan.price.monthly * 12) - plan.price.annual}/year
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-xs sm:text-sm leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Link
                    to="/auth"
                    className={`w-full py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg font-semibold text-center transition-colors duration-200 block text-sm sm:text-base ${
                      plan.popular
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
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

      {/* Features Comparison */}
      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Why Choose VISIONBOOST?</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-2">
              We offer more than just follower growth. Our comprehensive approach ensures long-term success.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <FeatureHighlight
              icon={Shield}
              title="100% Safe & Compliant"
              description="We use only organic, platform-approved methods that protect your account from any risks or penalties."
              color="text-green-600"
              bgColor="bg-green-100"
            />
            <FeatureHighlight
              icon={Users}
              title="Real, Engaged Followers"
              description="Every follower we bring is a real person interested in your content, not bots or fake accounts."
              color="text-blue-600"
              bgColor="bg-blue-100"
            />
            <FeatureHighlight
              icon={BarChart3}
              title="Detailed Analytics"
              description="Track your growth with comprehensive reports and insights to optimize your social media strategy."
              color="text-purple-600"
              bgColor="bg-purple-100"
            />
            <FeatureHighlight
              icon={Clock}
              title="24/7 Support"
              description="Our expert team is available around the clock to answer questions and provide strategic guidance."
              color="text-orange-600"
              bgColor="bg-orange-100"
            />
            <FeatureHighlight
              icon={Target}
              title="Targeted Growth"
              description="We don't just bring any followers - we attract your ideal audience based on interests and demographics."
              color="text-red-600"
              bgColor="bg-red-100"
            />
            <FeatureHighlight
              icon={MessageCircle}
              title="Content Optimization"
              description="Get expert advice on content strategy, hashtags, and posting schedules to maximize engagement."
              color="text-indigo-600"
              bgColor="bg-indigo-100"
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Frequently Asked Questions</h2>
            <p className="text-lg sm:text-xl text-gray-600 px-2">Everything you need to know about our pricing and services</p>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <FAQItem
              question="Can I change my plan anytime?"
              answer="Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle."
            />
            <FAQItem
              question="Is there a setup fee?"
              answer="No setup fees, no hidden costs. The price you see is exactly what you'll pay."
            />
            <FAQItem
              question="What if I'm not satisfied?"
              answer="We offer a 30-day money-back guarantee. If you're not completely satisfied, we'll refund your money."
            />
            <FAQItem
              question="How quickly will I see results?"
              answer="Most clients see initial growth within 7-14 days, with significant results within the first month."
            />
            <FAQItem
              question="Can I pause my subscription?"
              answer="Yes, you can pause your subscription at any time and resume when you're ready to continue growing."
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
            Ready to Start Growing?
          </h2>
          <p className="text-lg sm:text-xl text-white mb-6 sm:mb-8 max-w-3xl mx-auto px-2">
            Join thousands of satisfied clients who have transformed their social media presence
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link
              to="/auth"
              className="bg-white text-purple-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-gray-100 transition-colors"
            >
              Start Your Free Trial
            </Link>
            <Link
              to="/contact"
              className="border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-white hover:text-purple-600 transition-colors"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

// Feature Highlight Component
const FeatureHighlight: React.FC<{
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  bgColor: string;
}> = ({ icon: Icon, title, description, color, bgColor }) => (
  <div className="text-center p-4 sm:p-6">
    <div className={`${bgColor} w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4`}>
      <Icon className={`w-6 h-6 sm:w-8 sm:h-8 ${color}`} />
    </div>
    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">{title}</h3>
    <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{description}</p>
  </div>
);

// FAQ Item Component
const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md">
      <button
        className="w-full text-left p-4 sm:p-6 focus:outline-none focus:ring-2 focus:ring-purple-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex justify-between items-center">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 pr-4">{question}</h3>
          <span className={`transform transition-transform duration-200 text-gray-500 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}>
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </div>
      </button>
      {isOpen && (
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
};

export default PricingPage;