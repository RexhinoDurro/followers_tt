"use client"

import { FileText, CheckCircle, AlertTriangle, CreditCard, Users, Scale, Shield } from "lucide-react"
import PublicLayout from "@/components/public-layout"
import Link from "next/link"

export default function TermsOfServicePage() {
  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-purple-600 to-pink-600 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <FileText className="w-20 h-20" />
              </div>
              <h1 className="text-6xl font-bold mb-6">
                Terms of <span className="text-yellow-300">Service</span>
              </h1>
              <p className="text-2xl mb-8 max-w-3xl mx-auto">
                Please read these terms carefully before using our services
              </p>
              <p className="text-base text-purple-200">Last Updated: October 4, 2025</p>
            </div>
          </div>
        </section>

        {/* Key Points Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Important Highlights</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">Key points you should know about our services</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
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
        <section className="py-16 bg-white">
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
                  "Analytics and performance tracking",
                ]}
              />

              <PolicySection
                title="3. User Responsibilities"
                content="You agree to:"
                items={[
                  "Comply with all applicable laws and platform terms of service",
                  "Provide accurate social media account information",
                  "Maintain appropriate content on your accounts",
                  "Not use services for illegal or fraudulent purposes",
                ]}
              />

              <PolicySection
                title="4. Contact Information"
                content="For questions about these Terms of Service, contact us at legal@visionboost.agency or visit our contact page."
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-white mb-8 max-w-3xl mx-auto">
              By using our services, you agree to these terms. Start growing your social media today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth"
                className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
              >
                Start Growing Now
              </Link>
              <Link
                href="/contact"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-purple-600 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  )
}

const InfoCard = ({ icon: Icon, title, description, color, bgColor }: any) => (
  <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
    <div className={`${bgColor} w-16 h-16 rounded-lg flex items-center justify-center mb-6`}>
      <Icon className={`w-8 h-8 ${color}`} />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
)

const PolicySection = ({ title, content, items }: { title: string; content: string; items?: string[] }) => (
  <div className="bg-white rounded-xl shadow-lg p-8">
    <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
    <p className="text-gray-600 leading-relaxed mb-4">{content}</p>
    {items && (
      <ul className="space-y-3">
        {items.map((item, index) => (
          <li key={index} className="flex items-start text-gray-700">
            <span className="text-purple-600 mr-3 mt-1">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    )}
  </div>
)
