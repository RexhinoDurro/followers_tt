"use client"

import { useEffect, useState } from "react"
import { DollarSign, Users, Clock, AlertCircle, FileText, RefreshCw, TrendingUp, Heart, Eye } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import ApiService from "@/lib/api-service"

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      if (user?.role === "admin") {
        const statsData = await ApiService.getDashboardStats()
        setStats(statsData)
      } else {
        const statsData = await ApiService.getClientDashboardStats()
        setStats(statsData)
      }
    } catch (err: any) {
      console.error("Failed to fetch dashboard data:", err)
      setError(err.message || "Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Admin Dashboard
  if (user?.role === "admin") {
    const statsCards = [
      {
        name: "Monthly Revenue",
        value: `$${Number(stats?.total_revenue || 0).toLocaleString()}`,
        icon: DollarSign,
        color: "text-green-600",
        trend: "+12%",
      },
      {
        name: "Active Clients",
        value: stats?.active_clients || "0",
        icon: Users,
        color: "text-blue-600",
        trend: "+3 this week",
      },
      {
        name: "Pending Tasks",
        value: stats?.pending_tasks || "0",
        icon: Clock,
        color: "text-yellow-600",
        trend: null,
      },
      {
        name: "Overdue Payments",
        value: stats?.overdue_payments || "0",
        icon: AlertCircle,
        color: "text-red-600",
        trend: null,
      },
    ]

    return (
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user.first_name || user.name || "Admin"}! 👋
              </h1>
              <p className="text-gray-600 mt-1">Here's what's happening with your agency today.</p>
            </div>
            <Button variant="outline" onClick={fetchData} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsCards.map((stat) => (
              <Card key={stat.name} className="hover:shadow-lg transition-shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    {stat.trend && <p className="text-sm text-green-600 font-medium mt-1">{stat.trend}</p>}
                  </div>
                  <div className={`p-3 rounded-lg bg-gray-50`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Quick Info */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Overview</h3>
            <p className="text-gray-600">
              Your admin dashboard is ready. Use the sidebar to navigate to different sections like Clients, Tasks,
              Content, and more.
            </p>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  // Client Dashboard
  const statsCards = [
    {
      name: "Total Followers",
      value: Number(stats?.total_followers || 0).toLocaleString(),
      icon: Users,
      color: "text-blue-600",
      trend: stats?.growth_rate ? `+${Number(stats.growth_rate).toFixed(1)}%` : null,
    },
    {
      name: "Engagement Rate",
      value: `${Number(stats?.engagement_rate || 0).toFixed(1)}%`,
      icon: Heart,
      color: "text-pink-600",
      trend: "+2.3%",
    },
    {
      name: "Monthly Reach",
      value: Number(stats?.reach || 0).toLocaleString(),
      icon: Eye,
      color: "text-purple-600",
      trend: "+15%",
    },
    {
      name: "Posts This Month",
      value: stats?.posts_this_month || "0",
      icon: FileText,
      color: "text-green-600",
      trend: null,
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.first_name || user?.name || "Client"}! 🚀
            </h1>
            <p className="text-gray-600 mt-1">Here's how your social media is performing.</p>
          </div>
          <Button variant="outline" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat) => (
            <Card key={stat.name} className="hover:shadow-lg transition-shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  {stat.trend && (
                    <p className="text-sm text-green-600 font-medium mt-1">
                      <TrendingUp className="w-3 h-3 inline mr-1" />
                      {stat.trend} this month
                    </p>
                  )}
                </div>
                <div className={`p-3 rounded-lg bg-gray-50`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Payment Status */}
        {stats?.next_payment_date && (
          <Card className="border-l-4 border-l-blue-500 bg-blue-50 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <DollarSign className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium text-blue-900">Next Payment Due</p>
                  <p className="text-sm text-blue-700">
                    ${Number(stats.next_payment_amount || 0).toLocaleString()} due on{" "}
                    {new Date(stats.next_payment_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Button size="sm">Pay Now</Button>
            </div>
          </Card>
        )}

        {/* Quick Info */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Overview</h3>
          <p className="text-gray-600">
            Your client dashboard is ready. Use the sidebar to navigate to Content, Performance, Messages, and more.
          </p>
        </Card>
      </div>
    </DashboardLayout>
  )
}
