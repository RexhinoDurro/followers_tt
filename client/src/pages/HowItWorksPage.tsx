// pages/HowItWorksPage.tsx - Fully Responsive Version
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  UserPlus, 
  Target, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  Shield,
  Zap,
  Users,
  BarChart3,
  MessageSquare,
  Heart,
  Share2
} from 'lucide-react';

const HowItWorksPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 to-pink-600 text-white py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6">
              How It <span className="text-yellow-300">Works</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 max-w-3xl mx-auto px-2">
              Our proven 4-step process delivers authentic growth and engagement for your social media accounts
            </p>
            <div className="flex justify-center">
              <Link 
                to="/auth"
                className="bg-white text-purple-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-gray-100 transition-colors"
              >
                Start Growing Today
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Process Steps */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Our Growth Process</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-2">
              From account analysis to explosive growth, we handle everything so you can focus on creating amazing content
            </p>
          </div>

          {/* Step 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center mb-12 sm:mb-16 md:mb-20">
            <div className="order-2 lg:order-1">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4 sm:mb-6">
                  <div className="bg-purple-100 p-3 sm:p-4 rounded-full mr-0 sm:mr-4 mb-3 sm:mb-0">
                    <Target className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                  </div>
                  <div>
                    <span className="text-purple-600 font-semibold text-base sm:text-lg">Step 1</span>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Account Analysis</h3>
                  </div>
                </div>
                <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">
                  We conduct a comprehensive analysis of your current social media presence, identifying strengths, 
                  weaknesses, and untapped opportunities for growth.
                </p>
                <ul className="space-y-2 sm:space-y-3">
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                    <span className="text-sm sm:text-base">Content audit and performance review</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                    <span className="text-sm sm:text-base">Competitor analysis and benchmarking</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                    <span className="text-sm sm:text-base">Target audience identification</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="relative">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-white">
                  <BarChart3 className="w-16 h-16 sm:w-20 sm:h-20 mb-3 sm:mb-4" />
                  <h4 className="text-xl sm:text-2xl font-bold mb-2">Deep Insights</h4>
                  <p className="text-sm sm:text-base">We analyze over 50+ metrics to understand your account's current performance and growth potential.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center mb-12 sm:mb-16 md:mb-20">
            <div>
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-white">
                  <Zap className="w-16 h-16 sm:w-20 sm:h-20 mb-3 sm:mb-4" />
                  <h4 className="text-xl sm:text-2xl font-bold mb-2">Custom Strategy</h4>
                  <p className="text-sm sm:text-base">Every account is unique. We create a personalized growth strategy tailored to your niche and goals.</p>
                </div>
              </div>
            </div>
            <div>
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4 sm:mb-6">
                  <div className="bg-blue-100 p-3 sm:p-4 rounded-full mr-0 sm:mr-4 mb-3 sm:mb-0">
                    <UserPlus className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                  </div>
                  <div>
                    <span className="text-blue-600 font-semibold text-base sm:text-lg">Step 2</span>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Strategy Development</h3>
                  </div>
                </div>
                <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">
                  Based on our analysis, we develop a customized growth strategy that includes content optimization, 
                  engagement tactics, and targeted follower acquisition.
                </p>
                <ul className="space-y-2 sm:space-y-3">
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                    <span className="text-sm sm:text-base">Personalized content calendar</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                    <span className="text-sm sm:text-base">Hashtag research and optimization</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                    <span className="text-sm sm:text-base">Engagement timing strategies</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center mb-12 sm:mb-16 md:mb-20">
            <div className="order-2 lg:order-1">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4 sm:mb-6">
                  <div className="bg-green-100 p-3 sm:p-4 rounded-full mr-0 sm:mr-4 mb-3 sm:mb-0">
                    <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                  </div>
                  <div>
                    <span className="text-green-600 font-semibold text-base sm:text-lg">Step 3</span>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Growth Execution</h3>
                  </div>
                </div>
                <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">
                  Our team implements the growth strategy using proven organic methods, advanced automation tools, 
                  and strategic engagement to attract your ideal followers.
                </p>
                <ul className="space-y-2 sm:space-y-3">
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                    <span className="text-sm sm:text-base">Organic follower acquisition</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                    <span className="text-sm sm:text-base">Strategic content promotion</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                    <span className="text-sm sm:text-base">Community engagement management</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="relative">
                <div className="bg-gradient-to-br from-green-500 to-blue-500 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-white">
                  <Users className="w-16 h-16 sm:w-20 sm:h-20 mb-3 sm:mb-4" />
                  <h4 className="text-xl sm:text-2xl font-bold mb-2">Active Growth</h4>
                  <p className="text-sm sm:text-base">We work 24/7 to grow your account with real, engaged followers who are genuinely interested in your content.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div>
              <div className="relative">
                <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-white">
                  <BarChart3 className="w-16 h-16 sm:w-20 sm:h-20 mb-3 sm:mb-4" />
                  <h4 className="text-xl sm:text-2xl font-bold mb-2">Track & Optimize</h4>
                  <p className="text-sm sm:text-base">Continuous monitoring and optimization ensure sustained growth and maximum ROI from your investment.</p>
                </div>
              </div>
            </div>
            <div>
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4 sm:mb-6">
                  <div className="bg-orange-100 p-3 sm:p-4 rounded-full mr-0 sm:mr-4 mb-3 sm:mb-0">
                    <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
                  </div>
                  <div>
                    <span className="text-orange-600 font-semibold text-base sm:text-lg">Step 4</span>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Monitor & Optimize</h3>
                  </div>
                </div>
                <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">
                  We continuously monitor your account's performance, provide detailed analytics, and optimize 
                  our strategies to ensure consistent, sustainable growth.
                </p>
                <ul className="space-y-2 sm:space-y-3">
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                    <span className="text-sm sm:text-base">Weekly performance reports</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                    <span className="text-sm sm:text-base">Strategy adjustments and optimization</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                    <span className="text-sm sm:text-base">24/7 account monitoring</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Why Choose Our Method?</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-2">
              Our approach combines proven strategies with cutting-edge technology to deliver results that last
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <FeatureCard 
              icon={Shield}
              title="100% Safe & Secure"
              description="We use only organic, platform-compliant methods that protect your account from any risks or penalties."
              color="text-green-600"
              bgColor="bg-green-100"
            />
            <FeatureCard 
              icon={Clock}
              title="Quick Results"
              description="See noticeable growth within the first 7-14 days, with exponential improvements over time."
              color="text-blue-600"
              bgColor="bg-blue-100"
            />
            <FeatureCard 
              icon={Users}
              title="Real Followers"
              description="We attract genuine, engaged followers who are interested in your content and likely to convert."
              color="text-purple-600"
              bgColor="bg-purple-100"
            />
            <FeatureCard 
              icon={MessageSquare}
              title="Expert Support"
              description="Our dedicated team is available 24/7 to answer questions and provide strategic guidance."
              color="text-orange-600"
              bgColor="bg-orange-100"
            />
            <FeatureCard 
              icon={Heart}
              title="Increased Engagement"
              description="Not just followers - we focus on building a community that actively engages with your content."
              color="text-red-600"
              bgColor="bg-red-100"
            />
            <FeatureCard 
              icon={Share2}
              title="Viral Potential"
              description="Our strategies increase your content's reach and viral potential across all social platforms."
              color="text-indigo-600"
              bgColor="bg-indigo-100"
            />
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Growth Timeline</h2>
            <p className="text-lg sm:text-xl text-gray-600 px-2">See what to expect during your growth journey</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <TimelineCard 
              period="Week 1-2"
              title="Setup & Analysis"
              description="Account optimization, strategy development, and initial growth setup."
              percentage="Foundation"
              color="bg-purple-500"
            />
            <TimelineCard 
              period="Week 3-4"
              title="Early Growth"
              description="First wave of organic followers and increased engagement rates."
              percentage="10-25% Growth"
              color="bg-blue-500"
            />
            <TimelineCard 
              period="Month 2-3"
              title="Accelerated Growth"
              description="Exponential follower increase and viral content opportunities."
              percentage="50-100% Growth"
              color="bg-green-500"
            />
            <TimelineCard 
              period="Month 3+"
              title="Sustained Success"
              description="Established growth patterns and long-term community building."
              percentage="100%+ Growth"
              color="bg-orange-500"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
            Ready to Start Growing?
          </h2>
          <p className="text-lg sm:text-xl text-white mb-6 sm:mb-8 max-w-3xl mx-auto px-2">
            Join thousands of satisfied clients who have transformed their social media presence with our proven system
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link 
              to="/auth"
              className="bg-white text-purple-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-gray-100 transition-colors"
            >
              Start Your Growth Journey
            </Link>
            <Link 
              to="/pricing"
              className="border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-white hover:text-purple-600 transition-colors"
            >
              View Pricing Plans
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

// Feature Card Component
const FeatureCard: React.FC<{
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  bgColor: string;
}> = ({ icon: Icon, title, description, color, bgColor }) => (
  <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 hover:shadow-xl transition-shadow">
    <div className={`${bgColor} w-12 h-12 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center mb-4 sm:mb-6`}>
      <Icon className={`w-6 h-6 sm:w-8 sm:h-8 ${color}`} />
    </div>
    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">{title}</h3>
    <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{description}</p>
  </div>
);

// Timeline Card Component
const TimelineCard: React.FC<{
  period: string;
  title: string;
  description: string;
  percentage: string;
  color: string;
}> = ({ period, title, description, percentage, color }) => (
  <div className="text-center">
    <div className={`${color} text-white rounded-lg p-4 sm:p-6 mb-3 sm:mb-4`}>
      <div className="text-xs sm:text-sm font-semibold mb-1 sm:mb-2">{period}</div>
      <div className="text-lg sm:text-2xl font-bold">{percentage}</div>
    </div>
    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">{title}</h3>
    <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">{description}</p>
  </div>
);

export default HowItWorksPage;