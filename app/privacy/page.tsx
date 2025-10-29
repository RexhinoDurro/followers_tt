"use client"

import { Shield, Lock, Eye, Database, UserCheck, FileText } from "lucide-react"
import PublicLayout from "@/components/public-layout"
import Link from "next/link"

export default function PrivacyPolicyPage() {
  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-purple-600 to-pink-600 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <Shield className="w-20 h-20" />
              </div>
              <h1 className="text-6xl font-bold mb-6">
                Privacy <span className="text-yellow-300">Policy</span>
              </h1>
              <p className="text-2xl mb-8 max-w-3xl mx-auto">
                Your privacy is important to us. Learn how we protect and handle your data.
              </p>
              <p className="text-base text-purple-200">Last Updated: October 4, 2025</p>
            </div>
          </div>
        </section>

        {/* Key Points Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Key Privacy Highlights</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Quick overview of how we protect your information
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
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
        <section className="py-16 bg-white">
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
                  "Device information (IP address, browser type, operating system)",
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
                  "Comply with legal obligations",
                ]}
              />

              <PolicySection
                title="4. Information Sharing"
                content="We do not sell your personal information. We may share your information with:"
                items={[
                  "Service providers who assist in operating our services",
                  "Social media platforms (limited data necessary for services)",
                  "Legal authorities when required by law",
                  "Business partners in connection with mergers or acquisitions",
                ]}
              />

              <PolicySection
                title="5. Contact Us"
                content="For questions about this Privacy Policy or our data practices, please contact us at privacy@visionboost.agency or visit our contact page."
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">Have Questions About Your Privacy?</h2>
            <p className="text-xl text-white mb-8 max-w-3xl mx-auto">
              Our team is here to help. Contact us anytime with privacy concerns or questions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
              >
                Contact Support
              </Link>
              <Link
                href="/"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-purple-600 transition-colors"
              >
                Back to Home
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
