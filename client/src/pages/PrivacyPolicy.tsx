import React from 'react';
import { Shield, Lock, Eye, Database, UserCheck, FileText } from 'lucide-react';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 to-pink-600 text-white py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Shield className="w-16 h-16 sm:w-20 sm:h-20" />
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6">
              Privacy <span className="text-yellow-300">Policy</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 max-w-3xl mx-auto px-2">
              Your privacy is important to us. Learn how we protect and handle your data.
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
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Key Privacy Highlights</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-2">
              Quick overview of how we protect your information
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <InfoCard 
              icon={Lock}
              title="Secure Data Storage"
              description="All your data is encrypted and stored on secure servers with industry-standard protection."
              color="text-blue-600"
              bgColor="bg-blue-100"
            />
            <InfoCard 
              icon={Eye}
              title="No Data Selling"
              description="We never sell your personal information to third parties. Your data is yours alone."
              color="text-green-600"
              bgColor="bg-green-100"
            />
            <InfoCard 
              icon={UserCheck}
              title="You're In Control"
              description="Access, update, or delete your data anytime. You have full control over your information."
              color="text-purple-600"
              bgColor="bg-purple-100"
            />
            <InfoCard 
              icon={Database}
              title="Minimal Collection"
              description="We only collect data necessary to provide our services. No excessive tracking."
              color="text-orange-600"
              bgColor="bg-orange-100"
            />
            <InfoCard 
              icon={Shield}
              title="GDPR Compliant"
              description="We comply with GDPR, CCPA, and other privacy regulations to protect your rights."
              color="text-red-600"
              bgColor="bg-red-100"
            />
            <InfoCard 
              icon={FileText}
              title="Transparent Policies"
              description="Clear, straightforward privacy practices. No hidden clauses or confusing legalese."
              color="text-indigo-600"
              bgColor="bg-indigo-100"
            />
          </div>
        </div>
      </section>

      {/* Detailed Policy Content */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            <PolicySection
              title="1. Introduction"
              content="Welcome to VISIONBOOST. We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our social media growth services and website."
            />

            <PolicySection
              title="2. Information We Collect"
              content="We collect information that you provide directly to us, including:"
              items={[
                "Name and contact information (email address, phone number)",
                "Social media account usernames and profile information",
                "Payment and billing information",
                "Communication preferences",
                "Usage data and analytics",
                "Device information (IP address, browser type, operating system)"
              ]}
            />

            <PolicySection
              title="3. How We Use Your Information"
              content="We use your information to:"
              items={[
                "Provide and improve our social media growth services",
                "Process payments and manage your account",
                "Communicate with you about services, updates, and promotions",
                "Analyze usage patterns and optimize our platform",
                "Prevent fraud and ensure security",
                "Comply with legal obligations"
              ]}
            />

            <PolicySection
              title="4. Information Sharing"
              content="We do not sell your personal information. We may share your information with:"
              items={[
                "Service providers who assist in operating our services",
                "Social media platforms (limited data necessary for services)",
                "Legal authorities when required by law",
                "Business partners in connection with mergers or acquisitions"
              ]}
            />

            <PolicySection
              title="5. Data Security"
              content="We implement industry-standard security measures including SSL encryption, secure servers, and regular security audits. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security."
            />

            <PolicySection
              title="6. Your Rights"
              content="You have the right to:"
              items={[
                "Access, update, or delete your personal information",
                "Opt-out of marketing communications",
                "Request a copy of your data",
                "Object to processing of your information",
                "Lodge a complaint with a supervisory authority"
              ]}
            />

            <PolicySection
              title="7. Cookies and Tracking"
              content="We use cookies and similar technologies to improve your experience, analyze usage, and deliver personalized content. You can control cookies through your browser settings. For more details, see our Cookie Policy."
            />

            <PolicySection
              title="8. Children's Privacy"
              content="Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately."
            />

            <PolicySection
              title="9. International Data Transfers"
              content="Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy."
            />

            <PolicySection
              title="10. Changes to This Policy"
              content="We may update this Privacy Policy periodically. Material changes will be communicated via email or prominent notice on our website. Your continued use of our services constitutes acceptance of the updated policy."
            />

            <PolicySection
              title="11. Contact Us"
              content="For questions about this Privacy Policy or our data practices, please contact us at privacy@visionboost.agency or visit our contact page."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 sm:mb-6">
            Have Questions About Your Privacy?
          </h2>
          <p className="text-lg sm:text-xl text-white mb-6 sm:mb-8 max-w-3xl mx-auto px-2">
            Our team is here to help. Contact us anytime with privacy concerns or questions.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <a 
              href="/contact"
              className="bg-white text-purple-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-gray-100 transition-colors inline-block"
            >
              Contact Support
            </a>
            <a 
              href="/"
              className="border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-white hover:text-purple-600 transition-colors inline-block"
            >
              Back to Home
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

export default PrivacyPolicyPage;