import React from 'react';
import { Cookie, Settings, BarChart3, Shield, Eye, CheckCircle } from 'lucide-react';

const CookiePolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 to-pink-600 text-white py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Cookie className="w-16 h-16 sm:w-20 sm:h-20" />
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6">
              Cookie <span className="text-yellow-300">Policy</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 max-w-3xl mx-auto px-2">
              Learn how we use cookies to improve your experience on our website
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
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Cookie Overview</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-2">
              Understanding how cookies enhance your browsing experience
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <InfoCard 
              icon={Cookie}
              title="What Are Cookies"
              description="Small text files stored on your device to remember your preferences and improve functionality."
              color="text-orange-600"
              bgColor="bg-orange-100"
            />
            <InfoCard 
              icon={Settings}
              title="You Control Cookies"
              description="Manage or disable cookies anytime through your browser settings. You're always in control."
              color="text-blue-600"
              bgColor="bg-blue-100"
            />
            <InfoCard 
              icon={BarChart3}
              title="Analytics & Insights"
              description="We use cookies to understand how you use our site and improve your experience."
              color="text-green-600"
              bgColor="bg-green-100"
            />
            <InfoCard 
              icon={Shield}
              title="Secure & Safe"
              description="Our cookies don't collect sensitive personal information and are secure."
              color="text-purple-600"
              bgColor="bg-purple-100"
            />
            <InfoCard 
              icon={Eye}
              title="Transparency"
              description="We're upfront about every cookie we use and why we use it."
              color="text-red-600"
              bgColor="bg-red-100"
            />
            <InfoCard 
              icon={CheckCircle}
              title="Essential Only Option"
              description="Choose to only allow essential cookies needed for basic site functionality."
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
              title="1. What Are Cookies?"
              content="Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences, understanding how you use our site, and improving our services."
            />

            <PolicySection
              title="2. Types of Cookies We Use"
              content="We use several types of cookies on our website:"
            />

            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
              <h4 className="text-lg font-bold text-gray-900 mb-4">Essential Cookies</h4>
              <p className="text-gray-600 text-sm sm:text-base mb-4">
                These cookies are necessary for the website to function properly. They enable basic features like page navigation, access to secure areas, and form submissions.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start text-gray-700">
                  <span className="text-purple-600 mr-2 mt-1">•</span>
                  <span className="text-sm sm:text-base">Session management</span>
                </li>
                <li className="flex items-start text-gray-700">
                  <span className="text-purple-600 mr-2 mt-1">•</span>
                  <span className="text-sm sm:text-base">Authentication and security</span>
                </li>
                <li className="flex items-start text-gray-700">
                  <span className="text-purple-600 mr-2 mt-1">•</span>
                  <span className="text-sm sm:text-base">Shopping cart functionality</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
              <h4 className="text-lg font-bold text-gray-900 mb-4">Analytics Cookies</h4>
              <p className="text-gray-600 text-sm sm:text-base mb-4">
                These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start text-gray-700">
                  <span className="text-purple-600 mr-2 mt-1">•</span>
                  <span className="text-sm sm:text-base">Google Analytics</span>
                </li>
                <li className="flex items-start text-gray-700">
                  <span className="text-purple-600 mr-2 mt-1">•</span>
                  <span className="text-sm sm:text-base">Page visit tracking</span>
                </li>
                <li className="flex items-start text-gray-700">
                  <span className="text-purple-600 mr-2 mt-1">•</span>
                  <span className="text-sm sm:text-base">User behavior analysis</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
              <h4 className="text-lg font-bold text-gray-900 mb-4">Marketing Cookies</h4>
              <p className="text-gray-600 text-sm sm:text-base mb-4">
                These cookies track your browsing habits to deliver advertisements relevant to you and your interests.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start text-gray-700">
                  <span className="text-purple-600 mr-2 mt-1">•</span>
                  <span className="text-sm sm:text-base">Social media integration</span>
                </li>
                <li className="flex items-start text-gray-700">
                  <span className="text-purple-600 mr-2 mt-1">•</span>
                  <span className="text-sm sm:text-base">Targeted advertising</span>
                </li>
                <li className="flex items-start text-gray-700">
                  <span className="text-purple-600 mr-2 mt-1">•</span>
                  <span className="text-sm sm:text-base">Retargeting campaigns</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
              <h4 className="text-lg font-bold text-gray-900 mb-4">Preference Cookies</h4>
              <p className="text-gray-600 text-sm sm:text-base mb-4">
                These cookies allow our website to remember choices you make and provide enhanced, personalized features.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start text-gray-700">
                  <span className="text-purple-600 mr-2 mt-1">•</span>
                  <span className="text-sm sm:text-base">Language preferences</span>
                </li>
                <li className="flex items-start text-gray-700">
                  <span className="text-purple-600 mr-2 mt-1">•</span>
                  <span className="text-sm sm:text-base">Display settings</span>
                </li>
                <li className="flex items-start text-gray-700">
                  <span className="text-purple-600 mr-2 mt-1">•</span>
                  <span className="text-sm sm:text-base">Customization options</span>
                </li>
              </ul>
            </div>

            <PolicySection
              title="3. Third-Party Cookies"
              content="We use services from trusted third parties that may also set cookies:"
              items={[
                "Google Analytics - for website analytics",
                "Facebook Pixel - for advertising",
                "PayPal - for payment processing",
                "Social media platforms - for sharing and integration"
              ]}
            />

            <PolicySection
              title="4. Cookie Duration"
              content="Cookies can be either:"
              items={[
                "Session Cookies - Deleted when you close your browser",
                "Persistent Cookies - Remain on your device for a set period or until deleted"
              ]}
            />

            <PolicySection
              title="5. Managing Cookies"
              content="You can control and manage cookies in several ways:"
              items={[
                "Browser Settings - Most browsers allow you to refuse or delete cookies",
                "Privacy Tools - Use browser privacy tools to manage tracking",
                "Opt-Out Tools - Use industry opt-out tools for advertising cookies",
                "Cookie Preferences - Update your preferences through our cookie banner"
              ]}
            />

            <PolicySection
              title="6. Disabling Cookies"
              content="You can disable cookies through your browser settings. However, this may affect the functionality of our website. Essential cookies cannot be disabled as they are necessary for the site to work properly."
            />

            <PolicySection
              title="7. Browser-Specific Instructions"
              content="To manage cookies in popular browsers:"
              items={[
                "Chrome - Settings > Privacy and Security > Cookies",
                "Firefox - Settings > Privacy & Security > Cookies and Site Data",
                "Safari - Preferences > Privacy > Cookies and website data",
                "Edge - Settings > Cookies and site permissions"
              ]}
            />

            <PolicySection
              title="8. Do Not Track"
              content="Some browsers include a 'Do Not Track' feature. Currently, there is no industry standard for responding to Do Not Track signals. We do not alter our data collection practices when we detect such signals."
            />

            <PolicySection
              title="9. Updates to This Policy"
              content="We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated revision date. Please check back periodically for updates."
            />

            <PolicySection
              title="10. More Information"
              content="For more information about cookies and online privacy, visit:"
              items={[
                "www.allaboutcookies.org",
                "www.youronlinechoices.eu",
                "Our Privacy Policy page"
              ]}
            />

            <PolicySection
              title="11. Contact Us"
              content="If you have questions about our use of cookies, please contact us at privacy@visionboost.agency or visit our contact page."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 sm:mb-6">
            Questions About Cookies?
          </h2>
          <p className="text-lg sm:text-xl text-white mb-6 sm:mb-8 max-w-3xl mx-auto px-2">
            We're here to help you understand and manage your cookie preferences.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <a 
              href="/contact"
              className="bg-white text-purple-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-gray-100 transition-colors inline-block"
            >
              Contact Us
            </a>
            <a 
              href="/privacy"
              className="border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-white hover:text-purple-600 transition-colors inline-block"
            >
              View Privacy Policy
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

export default CookiePolicyPage;