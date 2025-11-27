"use client"

import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Eye, Clock, MousePointer, Globe } from "lucide-react"
import { AnimateCard, AnimateCardHeader, AnimateCardTitle, AnimateCardContent } from "@/components/animate/animate-card"
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animate/page-transition"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const pageViewsData = [
  { date: "Mon", views: 4500, unique: 2800 },
  { date: "Tue", views: 5200, unique: 3200 },
  { date: "Wed", views: 4800, unique: 2900 },
  { date: "Thu", views: 6100, unique: 3800 },
  { date: "Fri", views: 5800, unique: 3500 },
  { date: "Sat", views: 3200, unique: 1900 },
  { date: "Sun", views: 2800, unique: 1700 },
]

const trafficSources = [
  { name: "Direct", value: 35, color: "#00444a" },
  { name: "Organic Search", value: 28, color: "#267b82" },
  { name: "Social Media", value: 22, color: "#4da7ae" },
  { name: "Referral", value: 15, color: "#80c0c5" },
]

const topPages = [
  { page: "/dashboard", views: 12847, change: "+12.5%" },
  { page: "/users", views: 8432, change: "+8.2%" },
  { page: "/analytics", views: 6291, change: "+15.3%" },
  { page: "/settings", views: 4156, change: "-2.1%" },
  { page: "/profile", views: 3892, change: "+5.7%" },
]

const metrics = [
  { title: "Total Page Views", value: "128,432", change: "+18.2%", trend: "up", icon: Eye },
  { title: "Avg. Session Duration", value: "4m 32s", change: "+5.4%", trend: "up", icon: Clock },
  { title: "Bounce Rate", value: "34.2%", change: "-8.1%", trend: "down", icon: MousePointer },
  { title: "Countries Reached", value: "42", change: "+3", trend: "up", icon: Globe },
]

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Analytics</h1>
          <p className="text-muted-foreground">Track your website performance and user engagement.</p>
        </div>
      </FadeIn>

      <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <StaggerItem key={metric.title}>
            <AnimateCard delay={index * 0.1}>
              <AnimateCardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <metric.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span
                    className={`flex items-center text-sm font-medium ${metric.trend === "up" ? "text-green-600" : "text-red-600"}`}
                  >
                    {metric.change}
                    {metric.trend === "up" ? (
                      <TrendingUp className="ml-1 h-4 w-4" />
                    ) : (
                      <TrendingDown className="ml-1 h-4 w-4" />
                    )}
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">{metric.title}</p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                </div>
              </AnimateCardContent>
            </AnimateCard>
          </StaggerItem>
        ))}
      </StaggerContainer>

      <div className="grid gap-6 lg:grid-cols-3">
        <AnimateCard delay={0.4} className="lg:col-span-2">
          <AnimateCardHeader>
            <AnimateCardTitle>Page Views Trend</AnimateCardTitle>
          </AnimateCardHeader>
          <AnimateCardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={pageViewsData}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00444a" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00444a" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorUnique" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4da7ae" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4da7ae" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="views"
                    stroke="#00444a"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorViews)"
                  />
                  <Area
                    type="monotone"
                    dataKey="unique"
                    stroke="#4da7ae"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorUnique)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-primary" />
                <span className="text-muted-foreground">Total Views</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "#4da7ae" }} />
                <span className="text-muted-foreground">Unique Visitors</span>
              </div>
            </div>
          </AnimateCardContent>
        </AnimateCard>

        <AnimateCard delay={0.5}>
          <AnimateCardHeader>
            <AnimateCardTitle>Traffic Sources</AnimateCardTitle>
          </AnimateCardHeader>
          <AnimateCardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={trafficSources}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {trafficSources.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {trafficSources.map((source) => (
                <div key={source.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: source.color }} />
                    <span>{source.name}</span>
                  </div>
                  <span className="font-medium">{source.value}%</span>
                </div>
              ))}
            </div>
          </AnimateCardContent>
        </AnimateCard>
      </div>

      <AnimateCard delay={0.6}>
        <AnimateCardHeader>
          <AnimateCardTitle>Top Pages</AnimateCardTitle>
        </AnimateCardHeader>
        <AnimateCardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50 text-left text-sm">
                  <th className="p-4 font-medium">Page</th>
                  <th className="p-4 font-medium text-right">Views</th>
                  <th className="p-4 font-medium text-right">Change</th>
                </tr>
              </thead>
              <tbody>
                {topPages.map((page, index) => (
                  <motion.tr
                    key={page.page}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="border-b last:border-0 hover:bg-muted/30"
                  >
                    <td className="p-4 font-medium">{page.page}</td>
                    <td className="p-4 text-right">{page.views.toLocaleString()}</td>
                    <td className="p-4 text-right">
                      <span
                        className={`font-medium ${page.change.startsWith("+") ? "text-green-600" : "text-red-600"}`}
                      >
                        {page.change}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </AnimateCardContent>
      </AnimateCard>
    </div>
  )
}
