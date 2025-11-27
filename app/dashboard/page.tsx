"use client"

import { motion } from "framer-motion"
import { Users, DollarSign, Activity, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { AnimateCard, AnimateCardHeader, AnimateCardTitle, AnimateCardContent } from "@/components/animate/animate-card"
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animate/page-transition"
import { useAuth } from "@/providers/auth-provider"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

const statsData = [
  { title: "Total Users", value: "12,847", change: "+12.5%", trend: "up", icon: Users },
  { title: "Revenue", value: "$48,352", change: "+8.2%", trend: "up", icon: DollarSign },
  { title: "Active Sessions", value: "2,847", change: "-3.1%", trend: "down", icon: Activity },
  { title: "Growth Rate", value: "24.5%", change: "+4.3%", trend: "up", icon: TrendingUp },
]

const chartData = [
  { name: "Jan", value: 4000, revenue: 2400 },
  { name: "Feb", value: 3000, revenue: 1398 },
  { name: "Mar", value: 2000, revenue: 9800 },
  { name: "Apr", value: 2780, revenue: 3908 },
  { name: "May", value: 1890, revenue: 4800 },
  { name: "Jun", value: 2390, revenue: 3800 },
  { name: "Jul", value: 3490, revenue: 4300 },
]

const recentActivity = [
  { user: "John Doe", action: "Created a new project", time: "2 min ago" },
  { user: "Jane Smith", action: "Updated profile settings", time: "5 min ago" },
  { user: "Bob Johnson", action: "Uploaded 3 files", time: "12 min ago" },
  { user: "Alice Brown", action: "Invited team member", time: "1 hour ago" },
]

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Welcome back, {user?.name?.split(" ")[0] || "User"}!
          </h1>
          <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your projects today.</p>
        </div>
      </FadeIn>

      <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat, index) => (
          <StaggerItem key={stat.title}>
            <AnimateCard delay={index * 0.1}>
              <AnimateCardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span
                    className={`flex items-center text-sm font-medium ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}
                  >
                    {stat.change}
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="ml-1 h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="ml-1 h-4 w-4" />
                    )}
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </AnimateCardContent>
            </AnimateCard>
          </StaggerItem>
        ))}
      </StaggerContainer>

      <div className="grid gap-6 lg:grid-cols-2">
        <AnimateCard delay={0.4}>
          <AnimateCardHeader>
            <AnimateCardTitle>User Growth</AnimateCardTitle>
          </AnimateCardHeader>
          <AnimateCardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#00444a" strokeWidth={2} dot={{ fill: "#00444a" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </AnimateCardContent>
        </AnimateCard>

        <AnimateCard delay={0.5}>
          <AnimateCardHeader>
            <AnimateCardTitle>Revenue Overview</AnimateCardTitle>
          </AnimateCardHeader>
          <AnimateCardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="revenue" fill="#00444a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </AnimateCardContent>
        </AnimateCard>
      </div>

      <AnimateCard delay={0.6}>
        <AnimateCardHeader>
          <AnimateCardTitle>Recent Activity</AnimateCardTitle>
        </AnimateCardHeader>
        <AnimateCardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-sm font-medium text-primary">{activity.user.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{activity.user}</p>
                    <p className="text-xs text-muted-foreground">{activity.action}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </motion.div>
            ))}
          </div>
        </AnimateCardContent>
      </AnimateCard>
    </div>
  )
}
