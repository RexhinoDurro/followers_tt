"use client"

import { CheckCircle, UserPlus, TrendingUp, Shield, Zap, Target, BarChart, Users } from "lucide-react"
import PublicLayout from "@/components/public-layout"
import Link from "next/link"

export default function HowItWorksPage() {
  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-purple-600 to-pink-600 text-white py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                How <span className="text-yellow-300">It Works</span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-purple-100">
                Growing your social media presence is simple with our proven 4-step process
              </p>
            </div>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-24">
              <StepCard
                number="1"
                title="Choose Your Platform & Package"
                description="Select the social media platform you want to grow (Instagram, TikTok, or YouTube) and choose a package that fits your goals and budget."
                icon={Target}
                features={[
                  "Multiple platform options",
                  "Flexible package sizes",
                  "Transparent pricing",
                  "No hidden fees",
                ]}
                reverse={false}
              />

              <StepCard
                number="2"
                title="Provide Your Account Details"
                description="Simply enter your social media username. We never ask for passwords or sensitive information. Your account security is our top priority."
                icon={UserPlus}
                features={["No password required", "Secure data handling", "GDPR compliant", "Instant verification"]}
                reverse={true}
              />

              <StepCard
                number="3"
                title="We Start Growing Your Account"
                description="Our team uses proven organic growth strategies to attract real, engaged followers to your account. Growth begins within 24-48 hours."
                icon={TrendingUp}
                features={["Organic growth methods", "Real active users", "Gradual delivery", "Algorithm-friendly"]}
                reverse={false}
              />

              <StepCard
                number="4"
                title="Track Your Growth & Results"
                description="Monitor your progress in real-time through our dashboard. See detailed analytics and watch your social media presence grow."
                icon={BarChart}
                features={["Real-time analytics", "Detailed reports", "Growth tracking", "24/7 support"]}
                reverse={true}
              />
            </div>
          </div>
        </section>

        {/* Why It Works Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Our Method Works</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We combine proven strategies with cutting-edge technology to deliver real results
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <BenefitCard
                icon={Shield}
                title="100% Safe & Compliant"
                description="All our methods comply with platform guidelines. We never use bots or violate terms of service."
                color="text-green-600"
                bgColor="bg-green-100"
              />
              <BenefitCard
                icon={Users}
                title="Real Active Users"
                description="Every follower is a real person who genuinely engages with content in your niche."
                color="text-blue-600"
                bgColor="bg-blue-100"
              />
              <BenefitCard
                icon={Zap}
                title="Fast Results"
                description="See noticeable growth within days, not months. Our proven process delivers consistent results."
                color="text-purple-600"
                bgColor="bg-purple-100"
              />
            </div>
          </div>
        </section>

        {/* Process Details Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Growth Strategy</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Behind the scenes: How we deliver organic, sustainable growth
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Targeting & Research</h3>
                <ul className="space-y-4">
                  <ProcessItem text="Analyze your content and niche" />
                  <ProcessItem text="Identify your ideal audience demographics" />
                  <ProcessItem text="Research competitor strategies" />
                  <ProcessItem text="Create custom targeting parameters" />
                </ul>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Engagement & Growth</h3>
                <ul className="space-y-4">
                  <ProcessItem text="Connect with users interested in your niche" />
                  <ProcessItem text="Encourage organic engagement" />
                  <ProcessItem text="Monitor growth patterns and adjust" />
                  <ProcessItem text="Ensure sustainable, long-term results" />
                </ul>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Quality Control</h3>
                <ul className="space-y-4">
                  <ProcessItem text="Verify all followers are real accounts" />
                  <ProcessItem text="Filter out inactive or fake profiles" />
                  <ProcessItem text="Maintain high retention rates" />
                  <ProcessItem text="Regular quality audits" />
                </ul>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Ongoing Support</h3>
                <ul className="space-y-4">
                  <ProcessItem text="24/7 customer support" />
                  <ProcessItem text="Regular progress updates" />
                  <ProcessItem text="Strategy optimization" />
                  <ProcessItem text="Satisfaction guarantee" />
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Start Growing?</h2>
            <p className="text-xl text-white mb-8 max-w-3xl mx-auto">
              Join thousands of satisfied customers who have transformed their social media presence
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth"
                className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
              >
                Get Started Now
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

// Component definitions
const StepCard = ({ number, title, description, icon: Icon, features, reverse }: any) => (
  <div className={`grid md:grid-cols-2 gap-12 items-center ${reverse ? "md:flex-row-reverse" : ""}`}>
    <div className={reverse ? "md:order-2" : ""}>
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold">
          {number}
        </div>
        <h3 className="text-3xl font-bold text-gray-900">{title}</h3>
      </div>
      <p className="text-xl text-gray-600 mb-6">{description}</p>
      <ul className="space-y-3">
        {features.map((feature: string, index: number) => (
          <li key={index} className="flex items-center gap-3 text-gray-700">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
    <div className={reverse ? "md:order-1" : ""}>
      <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-12 flex items-center justify-center">
        <Icon className="w-32 h-32 text-purple-600" />
      </div>
    </div>
  </div>
)

const BenefitCard = ({ icon: Icon, title, description, color, bgColor }: any) => (
  <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
    <div className={`${bgColor} w-16 h-16 rounded-lg flex items-center justify-center mb-6`}>
      <Icon className={`w-8 h-8 ${color}`} />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
)

const ProcessItem = ({ text }: { text: string }) => (
  <li className="flex items-start gap-3">
    <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
    <span className="text-gray-700">{text}</span>
  </li>
)
