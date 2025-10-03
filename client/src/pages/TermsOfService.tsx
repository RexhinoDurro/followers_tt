import React from 'react';
import { FileText, CheckCircle, AlertTriangle, CreditCard, Users, Scale, Shield } from 'lucide-react';

const TermsOfServicePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 to-pink-600 text-white py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <FileText className="w-16 h-16 sm:w-20 sm:h-20" />
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6">
              Terms of <span className="text-yellow-300">Service</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 max-w-3xl mx-auto px-2">
              Please read these terms carefully before using our services
            </p>
            <p className="text-sm sm:text-base text-purple-200">
              Last Updated: October 4, 2025
            </p>
          </div>
        </div>
      </section>

      {/* Key Points Section */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Important Highlights</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-2">
              Key points you should know about our services
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <InfoCard 
              icon={CheckCircle}
              title="Service Guarantee"
              description="We guarantee delivery of services within specified timeframes. Full refund if we fail to deliver."
              color="text-green-600"
              bgColor="bg-green-100"
            />
            <InfoCard 
              icon={Shield}
              title="Account Safety"
              description="All methods comply with platform guidelines. Your account stays safe and secure."
              color="text-blue-600"
              bgColor="bg-blue-100"
            />
            <InfoCard 
              icon={CreditCard}
              title="Flexible Payments"
              description="Cancel anytime. 30-day money-back guarantee on all new subscriptions."
              color="text-purple-600"
              bgColor="bg-purple-100"
            />
            <InfoCard 
              icon={Users}
              title="Real Followers Only"
              description="We deliver only real, active users. No bots or fake accounts ever."
              color="text-orange-600"
              bgColor="bg-orange-100"
            />
            <InfoCard 
              icon={AlertTriangle}
              title="Your Responsibilities"
              description="Provide accurate information and comply with platform terms of service."
              color="text-red-600"
              bgColor="bg-red-100"
            />
            <InfoCard 
              icon={Scale}
              title="Fair Usage"
              description="Services must be used legally and ethically. No abusive or fraudulent behavior."
              color="text-indigo-600"
              bgColor="bg-indigo-100"
            />
          </div>
        </div>
      </section>

      {/* Detailed Terms Content */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            <PolicySection
              title="1. Acceptance of Terms"
              content="By accessing or using VISIONBOOST's services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using our services."
            />

            <PolicySection
              title="2. Description of Services"
              content="VISIONBOOST provides social media growth services, including:"
              items={[
                "Instagram, TikTok, and YouTube growth services",
                "Follower and engagement growth",
                "Content strategy and optimization",
                "Analytics and performance tracking"
              ]}
            />

            <PolicySection
              title="3. Account Registration"
              content="To use our services, you must:"
              items={[
                "Be at least 18 years old",
                "Provide accurate and complete information",
                "Own or have authorization to manage the social media accounts",
                "Maintain the confidentiality of your account credentials",
                "Be responsible for all activities under your account"
              ]}
            />

            <PolicySection
              title="4. Service Delivery"
              content="Services typically begin within 24-48 hours of purchase. Growth is gradual and organic, with full delivery occurring within the specified timeframe. We guarantee delivery of services purchased, not specific business outcomes."
            />

            <PolicySection
              title="5. User Responsibilities"
              content="You agree to:"
              items={[
                "Comply with all applicable laws and platform terms of service",
                "Provide accurate social media account information",
                "Maintain appropriate content on your accounts",
                "Not use services for illegal or fraudulent purposes",
                "Not resell or redistribute our services without authorization",
                "Keep your account credentials secure"
              ]}
            />

            <PolicySection
              title="6. Prohibited Activities"
              content="You may not:"
              items={[
                "Promote illegal activities, hate speech, or violence",
                "Engage in copyright or trademark infringement",
                "Attempt to hack or compromise our systems",
                "Use automated tools without permission",
                "Submit false or fraudulent information",
                "Harass or abuse our staff or other users"
              ]}
            />

            <PolicySection
              title="7. Payment Terms"
              content="All prices are in USD and subject to change with notice. You agree to pay all fees for services at the prices in effect when charges are incurred. For subscription services, you authorize recurring charges until cancelled."
            />

            <PolicySection
              title="8. Refunds and Cancellations"
              content="Refunds are available within 14 days if services have not started. Partial refunds may be available for undelivered portions. No refunds for completed services. See our Refund Policy for complete details."
            />

            <PolicySection
              title="9. Intellectual Property"
              content="All content, trademarks, and intellectual property on our platform are owned by VISIONBOOST or our licensors. You retain ownership of your social media content but grant us a limited license to access and analyze your data to deliver services."
            />

            <PolicySection
              title="10. Limitation of Liability"
              content="VISIONBOOST shall not be liable for indirect, incidental, or consequential damages, loss of profits, or actions taken by social media platforms. Our total liability shall not exceed the amount paid for services in the six months preceding the claim."
            />

            <PolicySection
              title="11. Service Modifications"
              content="We reserve the right to modify, suspend, or discontinue any aspect of our services at any time. We will provide notice of significant changes when possible."
            />

            <PolicySection
              title="12. Termination"
              content="We may suspend or terminate your account for:"
              items={[
                "Violation of these Terms",
                "Fraudulent or illegal activity",
                "Non-payment of fees",
                "Abuse of services or staff"
              ]}
            />

            <PolicySection
              title="13. Disclaimer of Warranties"
              content="Our services are provided 'as is' and 'as available' without warranties of any kind. We do not warrant that services will be uninterrupted, error-free, or completely secure."
            />

            <PolicySection
              title="14. Governing Law"
              content="These Terms are governed by applicable laws without regard to conflict of law principles. Any disputes shall be resolved through binding arbitration, except where prohibited by law."
            />

            <PolicySection
              title="15. Changes to Terms"
              content="We may modify these Terms at any time. Material changes will be communicated via email or prominent notice. Continued use after changes constitutes acceptance of updated Terms."
            />

            <PolicySection
              title="16. Contact Information"
              content="For questions about these Terms of Service, contact us at legal@visionboost.agency or visit our contact page."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 sm:mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg sm:text-xl text-white mb-6 sm:mb-8 max-w-3xl mx-auto px-2">
            By using our services, you agree to these terms. Start growing your social media today!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <a 
              href="/auth"
              className="bg-white text-purple-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-gray-100 transition-colors inline-block"
            >
              Start Growing Now
            </a>
            <a 
              href="/contact"
              className="border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-white hover:text-purple-600 transition-colors inline-block"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

// Info Card Component  
const InfoCard: React.FC<{
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

// Policy Section Component
const PolicySection: React.FC<{
  title: string;
  content: string;
  items?: string[];
}> = ({ title, content, items }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">{title}</h3>
    <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4">{content}</p>
    {items && (
      <ul className="space-y-2 sm:space-y-3">
        {items.map((item, index) => (
          <li key={index} className="flex items-start text-gray-700">
            <span className="text-purple-600 mr-2 sm:mr-3 mt-1">•</span>
            <span className="text-sm sm:text-base">{item}</span>
          </li>
        ))}
      </ul>
    )}
  </div>
);

export default TermsOfServicePage;