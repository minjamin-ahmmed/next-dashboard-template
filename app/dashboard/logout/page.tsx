"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/providers/auth-provider"

export default function LogoutPage() {
  const { logout } = useAuth()

  useEffect(() => {
    const performLogout = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      await logout()
    }
    performLogout()
  }, [logout])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4 text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="rounded-full bg-primary/10 p-4"
        >
          <Loader2 className="h-8 w-8 text-primary" />
        </motion.div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Signing out...</h1>
          <p className="text-muted-foreground">Please wait while we securely log you out.</p>
        </div>
      </motion.div>
    </div>
  )
}
