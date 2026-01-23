"use client"

import { useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore, type User, type ApiUser, type ApiRole, type ApiPermission } from "@/stores/auth-store"

// Re-export types for backward compatibility
export type { ApiUser, ApiRole, ApiPermission }
export type { User }

// AuthProvider component - now just initializes the store
export function AuthProvider({ children }: { children: ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  return <>{children}</>
}

// useAuth hook - wraps Zustand store with router integration
export function useAuth() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const isLoading = useAuthStore((state) => state.isLoading)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const loginStore = useAuthStore((state) => state.login)
  const logoutStore = useAuthStore((state) => state.logout)
  const updateUser = useAuthStore((state) => state.updateUser)
  const hasRole = useAuthStore((state) => state.hasRole)
  const hasPermission = useAuthStore((state) => state.hasPermission)

  // Wrap login to add router navigation
  const login = async (email: string, password: string) => {
    await loginStore(email, password)
    router.push("/dashboard")
  }

  // Wrap logout to add router navigation
  const logout = async () => {
    await logoutStore()
    router.push("/auth/login")
  }

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    hasRole,
    hasPermission,
  }
}
