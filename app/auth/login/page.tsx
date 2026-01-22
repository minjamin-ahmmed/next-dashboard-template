"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { useAuth } from "@/providers/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { AnimateButton } from "@/components/animate/animate-button"
import {
  AnimateCard,
  AnimateCardHeader,
  AnimateCardTitle,
  AnimateCardDescription,
  AnimateCardContent,
  AnimateCardFooter,
} from "@/components/animate/animate-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Lock, Sparkles, Eye, EyeOff } from "lucide-react"
import { FadeIn, SlideIn } from "@/components/animate/page-transition"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await login(email, password)
      toast({ title: "Welcome back!", description: "You have successfully logged in." })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Please check your credentials and try again."
      toast({
        title: "Login failed",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.1, scale: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute -left-[20%] -top-[20%] h-[600px] w-[600px] rounded-full bg-primary"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.08, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.3 }}
          className="absolute -bottom-[20%] -right-[20%] h-[500px] w-[500px] rounded-full bg-primary"
        />
      </div>

      <div className="relative w-full max-w-md">
        <FadeIn className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0.5, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg"
          >
            <Sparkles className="h-8 w-8 text-primary-foreground" />
          </motion.div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard Pro</h1>
          <p className="text-muted-foreground">Sign in to your account</p>
        </FadeIn>

        <AnimateCard hover={false} delay={0.2}>
          <form onSubmit={handleSubmit}>
            <AnimateCardHeader>
              <AnimateCardTitle>Welcome back</AnimateCardTitle>
              <AnimateCardDescription>Enter your credentials to continue</AnimateCardDescription>
            </AnimateCardHeader>

            <AnimateCardContent className="space-y-4">
              <SlideIn direction="right" delay={0.3}>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </SlideIn>

              <SlideIn direction="right" delay={0.4}>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </SlideIn>
            </AnimateCardContent>

            <AnimateCardFooter className="flex-col gap-4">
              <AnimateButton type="submit" className="w-full" isLoading={isLoading}>
                Sign in
              </AnimateButton>
              <p className="text-center text-sm text-muted-foreground">Secure login powered by WebDynamo API</p>
            </AnimateCardFooter>
          </form>
        </AnimateCard>    
      </div>
    </div>
  )
}
