"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Play,
  Heart,
  Users,
  TrendingUp,
  BarChart3,
  MessageCircle,
  Eye,
  Target,
  Video,
  Hash,
  Award,
  Shield,
  Clock,
  ArrowRight,
} from "lucide-react"

export default function YouTubeGrowthPage() {
  const [activeTab, setActiveTab] = useState<"features" | "process" | "results">("features")
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const followerPackages = [
    { followers: "1K", price: 20 },
    { followers: "3K", price: 50 },
    { followers: "5K", price: 80 },
    { followers: "10K", price: 140 },
    { followers: "15K", price: 190 },
    { followers: "20K", price: 250 },
  ]

  const plans = [
    {
      name: "Starter",
      price: 100,
      features: [
        "12 posts per month",
        "12 interactive stories",
        "Hashtag research",
        "Monthly reports",
        "ideal for small businesses",
      ],
    },
    {
      name: "Pro",
      price: 250,
      features: [
        "20 posts + reels",
        "Monthly promotional areas",
        "boost strategies",
        "Bio optimization",
        "report + recommendations",
        "Story engagement boost",
        "aggressive boosting",
      ],
      popular: true,
    },
    {
      name: "Premium",
      price: 400,
      features: [
        "YouTube + Instagram + Facebook",
        "30 posts(design,reels carousel)",
        "Advertising on a budget",
        "Influencer outreach assistance",
        "full and professional management",
      ],
    },
  ]

  const growthMetrics = [
    { icon: Users, label: "Subscribers", value: "50K+", description: "Real subscribers gained" },
    { icon: Heart, label: "Engagement", value: "300%", description: "Average increase" },
    { icon: Eye, label: "Views", value: "2M+", description: "Monthly video views" },
    { icon: BarChart3, label: "Growth Rate", value: "150%", description: "Faster than average" },
  ]

  const features = [
    {
      icon: Target,
      title: "Targeted Subscriber Growth",
      description: "We attract real, engaged subscribers who are genuinely interested in your content and niche.",
      details: [
        "Audience research and targeting",
        "Interest-based subscriber acquisition",
        "Geographic targeting options",
      ],
    },
    {
      icon: Hash,
      title: "Advanced SEO Strategy",
      description: "Our AI-powered keyword research ensures maximum discoverability for your videos.",
      details: ["Custom keyword sets for each video", "Trending topic identification", "Competitor keyword analysis"],
    },
    {
      icon: Video,
      title: "Content Optimization",
      description: "Get expert guidance on creating videos that drive engagement and growth.",
      details: ["Upload timing optimization", "Title and description writing guidance", "Thumbnail design advice"],
    },
    {
      icon: MessageCircle,
      title: "Engagement Management",
      description: "We help manage and boost your engagement to increase visibility and reach.",
      details: ["Strategic commenting and community posts", "Audience engagement tactics", "Community interaction"],
    },
    {
      icon: BarChart3,
      title: "Analytics & Reporting",
      description: "Track your growth with detailed analytics and actionable insights.",
      details: ["Weekly growth reports", "Engagement rate analysis", "Audience insights dashboard"],
    },
    {
      icon: Shield,
      title: "100% Safe & Compliant",
      description: "All our methods are organic and comply with YouTube's terms of service.",
      details: ["No bots or fake accounts", "Organic growth methods only", "Account safety guaranteed"],
    },
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      handle: "@sarahjcreates",
      image: "👩‍🎨",
      text: "Grew from 2K to 25K subscribers in 3 months! The engagement quality is incredible.",
      followers: "25K subscribers",
      growth: "+2300% growth",
    },
    {
      name: "Mike Rodriguez",
      handle: "@mikefit",
      image: "💪",
      text: "Best investment for my fitness channel. Real subscribers who actually engage with my content.",
      followers: "45K subscribers",
      growth: "+1800% growth",
    },
    {
      name: "Emma Thompson",
      handle: "@emmastyle",
      image: "👗",
      text: "Amazing results! My fashion channel exploded and brands started reaching out.",
      followers: "85K subscribers",
      growth: "+4200% growth",
    },
  ]

  const faqs = [
    {
      question: "How quickly will I see results?",
      answer:
        "Most clients see initial growth within 7-14 days. Significant results typically appear within the first month, with exponential growth continuing over time.",
    },
    {
      question: "Are the subscribers real people?",
      answer:
        "Yes! We only use organic methods to attract real, active YouTube users who are genuinely interested in your content and niche.",
    },
    {
      question: "Is this safe for my YouTube account?",
      answer:
        "Absolutely. All our methods are 100% compliant with YouTube's terms of service. We use only organic growth strategies to protect your account.",
    },
    {
      question: "What information do you need from me?",
      answer:
        "We only need your YouTube channel URL and basic information about your target audience and goals. We never ask for passwords or sensitive information.",
    },
    {
      question: "Can I target specific demographics?",
      answer:
        "Yes! We can target subscribers based on location, interests, age, gender, and similar channels to ensure you get the most relevant audience.",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-red-600 to-red-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center mb-6">
                <Play className="w-12 h-12 mr-4" />
                <span className="text-2xl font-bold">YouTube Growth</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Grow Your YouTube
                <span className="block text-yellow-300">Organically</span>
              </h1>
              <p className="text-xl mb-8 leading-relaxed">
                Get real, engaged subscribers who love your content. Our proven strategies help you build an authentic
                YouTube presence that converts.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  href="/auth"
                  className="bg-white text-red-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors flex items-center justify-center"
                >
                  Start Growing Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <a
                  href="#pricing"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-red-600 transition-colors text-center"
                >
                  View Pricing
                </a>
              </div>
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  <span>100% Safe</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  <span>Real Subscribers</span>
                </div>
                <div className="flex items-center">
                  <Award className="w-4 h-4 mr-2" />
                  <span>Proven Results</span>
                </div>
              </div>
            </div>

            {/* Stats Dashboard Mockup */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-6">Live Growth Dashboard</h3>
              <div className="grid grid-cols-2 gap-4">
                {growthMetrics.map((metric, index) => (
                  <div key={index} className="bg-white/20 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <metric.icon className="w-5 h-5 mr-2" />
                      <span className="text-sm font-medium">{metric.label}</span>
                    </div>
                    <div className="text-2xl font-bold mb-1">{metric.value}</div>
                    <div className="text-xs opacity-80">{metric.description}</div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-between text-sm">
                <span>Growth Rate</span>
                <div className="flex items-center text-green-300">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>+23% this week</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-red-600 to-red-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Grow Your YouTube?</h2>
          <p className="text-xl text-white mb-8 max-w-3xl mx-auto">
            Join thousands of successful creators and businesses who have transformed their YouTube presence
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth"
              className="bg-white text-red-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors flex items-center justify-center"
            >
              Start Growing Today
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link
              href="/contact"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-red-600 transition-colors"
            >
              Get Custom Quote
            </Link>
          </div>
          <div className="mt-8 flex items-center justify-center space-x-8 text-sm text-white/80">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              <span>Results in 7-14 days</span>
            </div>
            <div className="flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              <span>100% safe methods</span>
            </div>
            <div className="flex items-center">
              <Award className="w-4 h-4 mr-2" />
              <span>Money-back guarantee</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
