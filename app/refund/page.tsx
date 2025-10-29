"use client"

import { DollarSign, CheckCircle, Clock, AlertCircle, RefreshCw, Shield } from "lucide-react"
import PublicLayout from "@/components/public-layout"
import Link from "next/link"

export default function RefundPolicyPage() {
  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-purple-600 to-pink-600 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <DollarSign className="w-20 h-20" />
              </div>
              <h1 className="text-6xl font-bold mb-6">
                Refund <span className="text-yellow-300">Policy</span>
              </h1>
              <p className="text-2xl mb-8 max-w-3xl mx-auto">
                Your satisfaction is our priority. Learn about our refund terms and guarantees.
              </p>
              <p className="text-base text-purple-200">Last Updated: October 4, 2025</p>
            </div>
          </div>
        </section>

        {/* Key Points Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Refund Highlights</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">Quick overview of our refund policies</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
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
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-12">
              <PolicySection
                title="1. 30-Day Money-Back Guarantee"
                content="We offer a 30-day money-back guarantee on all new subscriptions and service purchases. To be eligible:"
                items={[
                  "Request must be made within 30 days of initial purchase",
                  "You must have followed our service guidelines",
                  "Provide specific reasons for dissatisfaction",
                  "Your account must be in good standing",
                ]}
              />

              <PolicySection
                title="2. Refund Request Process"
                content="To request a refund:"
                items={[
                  "Contact refunds@visionboost.agency",
                  "Include your order number and account details",
                  "Provide detailed reason for request",
                  "Include relevant screenshots or documentation",
                  "Allow 2-3 business days for review",
                ]}
              />

              <PolicySection
                title="3. Contact Us"
                content="For refund requests or questions about this policy, contact refunds@visionboost.agency or visit our contact page."
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">Need Help With a Refund?</h2>
            <p className="text-xl text-white mb-8 max-w-3xl mx-auto">
              Our support team is here to help. Contact us for any refund-related questions.
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
