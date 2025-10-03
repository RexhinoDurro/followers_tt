import React from 'react';
import { DollarSign, CheckCircle, Clock, AlertCircle, RefreshCw, Shield } from 'lucide-react';

const RefundPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 to-pink-600 text-white py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <DollarSign className="w-16 h-16 sm:w-20 sm:h-20" />
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6">
              Refund <span className="text-yellow-300">Policy</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 max-w-3xl mx-auto px-2">
              Your satisfaction is our priority. Learn about our refund terms and guarantees.
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
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Refund Highlights</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-2">
              Quick overview of our refund policies
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <InfoCard 
              icon={Shield}
              title="30-Day Guarantee"
              description="All new subscriptions come with a 30-day money-back guarantee if you're not satisfied."
              color="text-green-600"
              bgColor="bg-green-100"
            />
            <InfoCard 
              icon={Clock}
              title="Fast Processing"
              description="Approved refunds are processed within 5-7 business days to your original payment method."
              color="text-blue-600"
              bgColor="bg-blue-100"
            />
            <InfoCard 
              icon={CheckCircle}
              title="Fair Assessment"
              description="Every refund request is reviewed fairly with a response within 2-3 business days."
              color="text-purple-600"
              bgColor="bg-purple-100"
            />
            <InfoCard 
              icon={RefreshCw}
              title="Flexible Options"
              description="Choose between full refunds, partial refunds, or service replacements based on your situation."
              color="text-orange-600"
              bgColor="bg-orange-100"
            />
            <InfoCard 
              icon={AlertCircle}
              title="Clear Terms"
              description="No hidden fees or surprise charges. Our refund terms are transparent and straightforward."
              color="text-red-600"
              bgColor="bg-red-100"
            />
            <InfoCard 
              icon={DollarSign}
              title="Prorated Refunds"
              description="For subscriptions, get prorated refunds for unused service time after the first month."
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
              title="1. 30-Day Money-Back Guarantee"
              content="We offer a 30-day money-back guarantee on all new subscriptions and service purchases. To be eligible:"
              items={[
                "Request must be made within 30 days of initial purchase",
                "You must have followed our service guidelines",
                "Provide specific reasons for dissatisfaction",
                "Your account must be in good standing"
              ]}
            />

            <PolicySection
              title="2. Subscription Refunds"
              content="For monthly subscriptions:"
              items={[
                "First Month: Full refund available within 30 days",
                "Subsequent Months: Prorated refunds based on unused time",
                "Cancel anytime; service continues until end of billing period",
                "No partial month refunds unless there's a service failure"
              ]}
            />

            <PolicySection
              title="3. One-Time Service Refunds"
              content="Before service delivery:"
              items={[
                "Full refund within 24 hours of purchase",
                "50% refund if requested within 48 hours",
                "No refund after service has commenced"
              ]}
            />

            <PolicySection
              title="4. Non-Refundable Situations"
              content="Refunds will NOT be issued when:"
              items={[
                "Services have been fully delivered as promised",
                "Account suspended due to your violation of platform terms",
                "You changed your mind after services were delivered",
                "Incorrect account information was provided",
                "You failed to follow our guidelines",
                "Services purchased more than 30 days ago (except subscriptions)",
                "Fraudulent or abusive behavior occurred"
              ]}
            />

            <PolicySection
              title="5. Service Guarantees"
              content="We guarantee:"
              items={[
                "Delivery within specified timeframes",
                "Real, active followers (not bots)",
                "Replacement for followers lost within 30 days (up to 20%)",
                "Full refund or free replacement if we fail to deliver"
              ]}
            />

            <PolicySection
              title="6. Refund Request Process"
              content="To request a refund:"
              items={[
                "Contact refunds@visionboost.agency",
                "Include your order number and account details",
                "Provide detailed reason for request",
                "Include relevant screenshots or documentation",
                "Allow 2-3 business days for review"
              ]}
            />

            <PolicySection
              title="7. Processing Time"
              content="Approved refunds are processed as follows:"
              items={[
                "PayPal: 3-5 business days",
                "Credit/Debit Card: 5-10 business days",
                "Bank Transfer: 7-14 business days"
              ]}
            />

            <PolicySection
              title="8. Partial Refunds"
              content="Partial refunds may be issued for:"
              items={[
                "Services partially delivered",
                "Technical issues affecting service quality",
                "Delays in delivery beyond promised timeframe",
                "Quality issues with delivered services"
              ]}
            />

            <PolicySection
              title="9. Chargebacks"
              content="If you file a chargeback without contacting us first, we reserve the right to suspend your account and all services. Please contact our support team before initiating any chargeback to resolve the issue fairly."
            />

            <PolicySection
              title="10. Policy Changes"
              content="We may update this Refund Policy periodically. Changes will be posted on our website with an updated 'Last Updated' date. Continued use of our services after changes constitutes acceptance."
            />

            <PolicySection
              title="11. Contact Us"
              content="For refund requests or questions about this policy, contact refunds@visionboost.agency or visit our contact page."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 sm:mb-6">
            Need Help With a Refund?
          </h2>
          <p className="text-lg sm:text-xl text-white mb-6 sm:mb-8 max-w-3xl mx-auto px-2">
            Our support team is here to help. Contact us for any refund-related questions.
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

export default RefundPolicyPage;