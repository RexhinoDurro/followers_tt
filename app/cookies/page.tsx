"use client"

import { Cookie, Settings, BarChart3, Shield, Eye, CheckCircle } from "lucide-react"
import PublicLayout from "@/components/public-layout"
import Link from "next/link"

export default function CookiePolicyPage() {
  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-purple-600 to-pink-600 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <Cookie className="w-20 h-20" />
              </div>
              <h1 className="text-6xl font-bold mb-6">
                Cookie <span className="text-yellow-300">Policy</span>
              </h1>
              <p className="text-2xl mb-8 max-w-3xl mx-auto">
                Learn how we use cookies to improve your experience on our website
              </p>
              <p className="text-base text-purple-200">Last Updated: October 4, 2025</p>
            </div>
          </div>
        </section>

        {/* Key Points Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Cookie Overview</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Understanding how cookies enhance your browsing experience
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
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
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-12">
              <PolicySection
                title="1. What Are Cookies?"
                content="Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences, understanding how you use our site, and improving our services."
              />

              <PolicySection
                title="2. Managing Cookies"
                content="You can control and manage cookies in several ways:"
                items={[
                  "Browser Settings - Most browsers allow you to refuse or delete cookies",
                  "Privacy Tools - Use browser privacy tools to manage tracking",
                  "Opt-Out Tools - Use industry opt-out tools for advertising cookies",
                  "Cookie Preferences - Update your preferences through our cookie banner",
                ]}
              />

              <PolicySection
                title="3. Contact Us"
                content="If you have questions about our use of cookies, please contact us at privacy@visionboost.agency or visit our contact page."
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">Questions About Cookies?</h2>
            <p className="text-xl text-white mb-8 max-w-3xl mx-auto">
              We're here to help you understand and manage your cookie preferences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
              >
                Contact Us
              </Link>
              <Link
                href="/privacy"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-purple-600 transition-colors"
              >
                View Privacy Policy
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
