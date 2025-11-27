"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { User, Bell, Lock, Palette, Save, Camera } from "lucide-react"
import {
  AnimateCard,
  AnimateCardHeader,
  AnimateCardTitle,
  AnimateCardDescription,
  AnimateCardContent,
} from "@/components/animate/animate-card"
import { AnimateButton } from "@/components/animate/animate-button"
import { FadeIn, SlideIn } from "@/components/animate/page-transition"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/providers/auth-provider"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [notifications, setNotifications] = useState({ email: true, push: false, weekly: true, marketing: false })

  const handleSaveProfile = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    toast({ title: "Settings saved", description: "Your profile has been updated successfully." })
    setIsLoading(false)
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences.</p>
        </div>
      </FadeIn>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <AnimateCard delay={0.1}>
            <AnimateCardHeader>
              <AnimateCardTitle>Profile Information</AnimateCardTitle>
              <AnimateCardDescription>Update your personal details and public profile.</AnimateCardDescription>
            </AnimateCardHeader>
            <AnimateCardContent className="space-y-6">
              <SlideIn direction="right" delay={0.1}>
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
                    <AvatarFallback className="text-2xl">{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <AnimateButton variant="outline" leftIcon={<Camera className="h-4 w-4" />}>
                      Change Avatar
                    </AnimateButton>
                    <p className="mt-2 text-xs text-muted-foreground">JPG, GIF or PNG. Max size 2MB.</p>
                  </div>
                </div>
              </SlideIn>

              <div className="grid gap-4 sm:grid-cols-2">
                <SlideIn direction="right" delay={0.15}>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" defaultValue={user?.name} />
                  </div>
                </SlideIn>
                <SlideIn direction="right" delay={0.2}>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" defaultValue={user?.email} />
                  </div>
                </SlideIn>
              </div>

              <SlideIn direction="right" delay={0.25}>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" placeholder="Tell us about yourself..." rows={4} />
                </div>
              </SlideIn>

              <SlideIn direction="right" delay={0.3}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select defaultValue="utc">
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="utc">UTC</SelectItem>
                        <SelectItem value="est">Eastern Time</SelectItem>
                        <SelectItem value="pst">Pacific Time</SelectItem>
                        <SelectItem value="cet">Central European Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </SlideIn>

              <div className="flex justify-end">
                <AnimateButton
                  onClick={handleSaveProfile}
                  isLoading={isLoading}
                  leftIcon={<Save className="h-4 w-4" />}
                >
                  Save Changes
                </AnimateButton>
              </div>
            </AnimateCardContent>
          </AnimateCard>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <AnimateCard delay={0.1}>
            <AnimateCardHeader>
              <AnimateCardTitle>Notification Preferences</AnimateCardTitle>
              <AnimateCardDescription>Choose how you want to receive notifications.</AnimateCardDescription>
            </AnimateCardHeader>
            <AnimateCardContent className="space-y-6">
              {[
                { key: "email", title: "Email Notifications", description: "Receive notifications via email" },
                { key: "push", title: "Push Notifications", description: "Receive push notifications in your browser" },
                { key: "weekly", title: "Weekly Digest", description: "Get a weekly summary of your activity" },
                {
                  key: "marketing",
                  title: "Marketing Emails",
                  description: "Receive updates about new features and offers",
                },
              ].map((item, index) => (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                  className="flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <Label className="text-base">{item.title}</Label>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <Switch
                    checked={notifications[item.key as keyof typeof notifications]}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, [item.key]: checked }))}
                  />
                </motion.div>
              ))}
            </AnimateCardContent>
          </AnimateCard>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <AnimateCard delay={0.1}>
            <AnimateCardHeader>
              <AnimateCardTitle>Password</AnimateCardTitle>
              <AnimateCardDescription>Change your password to keep your account secure.</AnimateCardDescription>
            </AnimateCardHeader>
            <AnimateCardContent className="space-y-4">
              <SlideIn direction="right" delay={0.1}>
                <div className="space-y-2">
                  <Label htmlFor="current">Current Password</Label>
                  <Input id="current" type="password" />
                </div>
              </SlideIn>
              <SlideIn direction="right" delay={0.15}>
                <div className="space-y-2">
                  <Label htmlFor="new">New Password</Label>
                  <Input id="new" type="password" />
                </div>
              </SlideIn>
              <SlideIn direction="right" delay={0.2}>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm New Password</Label>
                  <Input id="confirm" type="password" />
                </div>
              </SlideIn>
              <div className="flex justify-end">
                <AnimateButton leftIcon={<Lock className="h-4 w-4" />}>Update Password</AnimateButton>
              </div>
            </AnimateCardContent>
          </AnimateCard>

          <AnimateCard delay={0.2}>
            <AnimateCardHeader>
              <AnimateCardTitle>Two-Factor Authentication</AnimateCardTitle>
              <AnimateCardDescription>Add an extra layer of security to your account.</AnimateCardDescription>
            </AnimateCardHeader>
            <AnimateCardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Enable 2FA</p>
                  <p className="text-sm text-muted-foreground">Use an authenticator app for additional security.</p>
                </div>
                <AnimateButton variant="outline">Enable</AnimateButton>
              </div>
            </AnimateCardContent>
          </AnimateCard>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <AnimateCard delay={0.1}>
            <AnimateCardHeader>
              <AnimateCardTitle>Theme</AnimateCardTitle>
              <AnimateCardDescription>Customize the look and feel of the dashboard.</AnimateCardDescription>
            </AnimateCardHeader>
            <AnimateCardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                {["light", "dark", "system"].map((theme, index) => (
                  <motion.button
                    key={theme}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex flex-col items-center gap-2 rounded-lg border p-4 hover:border-primary hover:bg-primary/5"
                    onClick={() => {
                      if (theme === "dark") document.documentElement.classList.add("dark")
                      else if (theme === "light") document.documentElement.classList.remove("dark")
                    }}
                  >
                    <div
                      className={`h-20 w-full rounded-md border ${theme === "dark" ? "bg-gray-900" : theme === "light" ? "bg-white" : "bg-gradient-to-r from-white to-gray-900"}`}
                    />
                    <span className="text-sm font-medium capitalize">{theme}</span>
                  </motion.button>
                ))}
              </div>
            </AnimateCardContent>
          </AnimateCard>
        </TabsContent>
      </Tabs>
    </div>
  )
}
