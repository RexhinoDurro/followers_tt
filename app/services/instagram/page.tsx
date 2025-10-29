"use client"

import { useState } from "react"
import {
  Instagram,
  Users,
  Heart,
  TrendingUp,
  Shield,
  Zap,
  CheckCircle,
  Star,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import PublicLayout from "@/components/public-layout"
import Link from "next/link"

export default function InstagramGrowthPage() {
  const [activeTab, setActiveTab] = useState("followers")
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const packages = {
    followers: [
      {
        name: "Starter",
        followers: "1,000",
        price: "$29",
        duration: "7-10 days",
        features: ["Real followers", "Gradual delivery", "Safe & secure", "24/7 support"],
      },
      {
        name: "Growth",
        followers: "5,000",
        price: "$99",
        duration: "14-21 days",
        features: ["Real followers", "Gradual delivery", "Safe & secure", "24/7 support", "Priority delivery"],
      },
      {
        name: "Pro",
        followers: "10,000",
        price: "$179",
        duration: "21-30 days",
        features: [
          "Real followers",
          "Gradual delivery",
          "Safe & secure",
          "24/7 support",
          "Priority delivery",
          "Dedicated manager",
        ],
      },
    ],
    likes: [
      {
        name: "Basic",
        likes: "500",
        price: "$19",
        duration: "3-5 days",
        features: ["Real likes", "Instant start", "Safe delivery", "24/7 support"],
      },
      {
        name: "Standard",
        likes: "2,500",
        price: "$69",
        duration: "5-7 days",
        features: ["Real likes", "Instant start", "Safe delivery", "24/7 support", "Priority processing"],
      },
      {
        name: "Premium",
        likes: "5,000",
        price: "$119",
        duration: "7-10 days",
        features: [
          "Real likes",
          "Instant start",
          "Safe delivery",
          "24/7 support",
          "Priority processing",
          "Bonus engagement",
        ],
      },
    ],
    views: [
      {
        name: "Starter",
        views: "10,000",
        price: "$24",
        duration: "1-3 days",
        features: ["Real views", "Fast delivery", "Safe & secure", "24/7 support"],
      },
      {
        name: "Growth",
        views: "50,000",
        price: "$89",
        duration: "3-5 days",
        features: ["Real views", "Fast delivery", "Safe & secure", "24/7 support", "Priority delivery"],
      },
      {
        name: "Pro",
        views: "100,000",
        price: "$149",
        duration: "5-7 days",
        features: [
          "Real views",
          "Fast delivery",
          "Safe & secure",
          "24/7 support",
          "Priority delivery",
          "Analytics report",
        ],
      },
    ],
  }

  const faqs = [
    {
      q: "Is it safe to buy Instagram followers?",
      a: "Yes, our service is completely safe. We use organic growth methods that comply with Instagram's terms of service. All followers are real accounts, and growth is gradual to appear natural.",
    },
    {
      q: "How long does delivery take?",
      a: "Delivery times vary by package size. Typically, you'll start seeing results within 24-48 hours, with full delivery completed within the timeframe specified for your package.",
    },
    {
      q: "Will my account get banned?",
      a: "No. We use 100% safe, organic methods that comply with Instagram's guidelines. Your account security is our top priority.",
    },
    {
      q: "Are the followers real people?",
      a: "Yes, all followers are real, active Instagram users. We never use bots or fake accounts.",
    },
    {
      q: "What if I'm not satisfied?",
      a: "We offer a 30-day money-back guarantee. If you're not satisfied with our service, contact us for a full refund.",
    },
    {
      q: "Can I customize my target audience?",
      a: "Yes! We can target followers based on location, interests, and demographics to ensure they align with your content.",
    },
  ]

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 text-white py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Instagram className="w-12 h-12" />
                  <span className="text-2xl font-bold">Instagram Growth</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-bold mb-6">
                  Grow Your Instagram <span className="text-yellow-300">Organically</span>
                </h1>
                <p className="text-xl md:text-2xl mb-8 text-purple-100">
                  Get real followers, likes, and views from active Instagram users. Safe, fast, and guaranteed results.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/auth"
                    className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors text-center"
                  >
                    Start Growing Now
                  </Link>
                  <Link
                    href="/how-it-works"
                    className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-purple-600 transition-colors text-center"
                  >
                    How It Works
                  </Link>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                  <div className="space-y-6">
                    <StatCard icon={Users} label="Active Users" value="2M+" />
                    <StatCard icon={TrendingUp} label="Growth Rate" value="300%" />
                    <StatCard icon={Shield} label="Success Rate" value="99.9%" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Our Instagram Growth Service?</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We deliver real results with proven methods that keep your account safe
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={Shield}
                title="100% Safe & Secure"
                description="All methods comply with Instagram's terms of service. Your account stays protected."
                color="text-green-600"
                bgColor="bg-green-100"
              />
              <FeatureCard
                icon={Users}
                title="Real Active Users"
                description="Get genuine followers who engage with your content. No bots or fake accounts."
                color="text-blue-600"
                bgColor="bg-blue-100"
              />
              <FeatureCard
                icon={Zap}
                title="Fast Delivery"
                description="See results within 24-48 hours. Full delivery guaranteed within timeframe."
                color="text-purple-600"
                bgColor="bg-purple-100"
              />
              <FeatureCard
                icon={TrendingUp}
                title="Organic Growth"
                description="Gradual, natural growth that looks authentic to Instagram's algorithm."
                color="text-orange-600"
                bgColor="bg-orange-100"
              />
              <FeatureCard
                icon={Heart}
                title="High Retention"
                description="Followers stay engaged long-term. We guarantee 90-day retention."
                color="text-pink-600"
                bgColor="bg-pink-100"
              />
              <FeatureCard
                icon={CheckCircle}
                title="Money-Back Guarantee"
                description="Not satisfied? Get a full refund within 30 days. No questions asked."
                color="text-indigo-600"
                bgColor="bg-indigo-100"
              />
            </div>
          </div>
        </section>

        {/* Packages Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Growth Package</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Select the perfect package for your Instagram growth goals
              </p>
            </div>

            {/* Tabs */}
            <div className="flex justify-center mb-12">
              <div className="inline-flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab("followers")}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                    activeTab === "followers"
                      ? "bg-white text-purple-600 shadow-md"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Followers
                </button>
                <button
                  onClick={() => setActiveTab("likes")}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                    activeTab === "likes" ? "bg-white text-purple-600 shadow-md" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Likes
                </button>
                <button
                  onClick={() => setActiveTab("views")}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                    activeTab === "views" ? "bg-white text-purple-600 shadow-md" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Views
                </button>
              </div>
            </div>

            {/* Package Cards */}
            <div className="grid md:grid-cols-3 gap-8">
              {packages[activeTab as keyof typeof packages].map((pkg, index) => (
                <PackageCard key={index} {...pkg} isPopular={index === 1} />
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
              <p className="text-xl text-gray-600">Everything you need to know about our Instagram growth service</p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-semibold text-gray-900">{faq.q}</span>
                    {openFaq === index ? (
                      <ChevronUp className="w-5 h-5 text-purple-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  {openFaq === index && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                      <p className="text-gray-600">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Grow Your Instagram?</h2>
            <p className="text-xl text-white mb-8 max-w-3xl mx-auto">
              Join thousands of satisfied customers who have grown their Instagram presence with us
            </p>
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              Get Started Now
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </div>
    </PublicLayout>
  )
}

// Component definitions
const StatCard = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <div className="flex items-center gap-4">
    <div className="bg-white/20 p-3 rounded-lg">
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-purple-200">{label}</div>
    </div>
  </div>
)

const FeatureCard = ({ icon: Icon, title, description, color, bgColor }: any) => (
  <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
    <div className={`${bgColor} w-16 h-16 rounded-lg flex items-center justify-center mb-6`}>
      <Icon className={`w-8 h-8 ${color}`} />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
)

const PackageCard = ({ name, followers, likes, views, price, duration, features, isPopular }: any) => (
  <div className={`relative bg-white rounded-xl shadow-lg p-8 ${isPopular ? "ring-2 ring-purple-600 scale-105" : ""}`}>
    {isPopular && (
      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
        <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
          <Star className="w-4 h-4" /> Most Popular
        </span>
      </div>
    )}
    <div className="text-center mb-6">
      <h3 className="text-2xl font-bold text-gray-900 mb-2">{name}</h3>
      <div className="text-4xl font-bold text-purple-600 mb-2">{price}</div>
      <div className="text-3xl font-bold text-gray-900 mb-2">{followers || likes || views}</div>
      <div className="text-gray-600">{duration}</div>
    </div>
    <ul className="space-y-3 mb-8">
      {features.map((feature: string, index: number) => (
        <li key={index} className="flex items-center gap-2 text-gray-700">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
    <Link
      href="/auth"
      className={`block w-full text-center py-3 rounded-lg font-semibold transition-colors ${
        isPopular
          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
          : "bg-gray-100 text-gray-900 hover:bg-gray-200"
      }`}
    >
      Get Started
    </Link>
  </div>
)
