"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { authApi, AUTH_TOKEN_KEY, type ApiUser, type ApiRole, type ApiPermission } from "@/lib/api"

// Re-export API types for use in other components
export type { ApiUser, ApiRole, ApiPermission }

export interface User {
  id: number
  email: string
  name: string
  avatar?: string
  emailVerifiedAt: string | null
  createdAt: string
  updatedAt: string
  roles: ApiRole[]
  branch: string | null
  allPermissions: ApiPermission[]
  permissions: ApiPermission[]
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateUser: (updates: Partial<User>) => void
  // Helper functions for role/permission checking
  hasRole: (roleName: string) => boolean
  hasPermission: (permissionName: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const USER_DATA_KEY = "user-data"

// Helper function to transform API user to local User type
function transformApiUser(apiUser: ApiUser): User {
  return {
    id: apiUser.id,
    email: apiUser.email,
    name: apiUser.name,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${apiUser.email}`,
    emailVerifiedAt: apiUser.email_verified_at,
    createdAt: apiUser.created_at,
    updatedAt: apiUser.updated_at,
    roles: apiUser.roles,
    branch: apiUser.branch,
    allPermissions: apiUser.all_permissions,
    permissions: apiUser.permissions,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = Cookies.get(AUTH_TOKEN_KEY)
        const storedUser = localStorage.getItem(USER_DATA_KEY)

        if (token && storedUser) {
          setUser(JSON.parse(storedUser))
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error)
        Cookies.remove(AUTH_TOKEN_KEY)
        localStorage.removeItem(USER_DATA_KEY)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true)

      try {
        if (!email || !password) {
          throw new Error("Email and password are required")
        }

        // Call the real API
        const response = await authApi.login(email, password)

        if (response.status !== "success") {
          throw new Error(response.message || "Login failed")
        }

        // Transform API user to local User type
        const transformedUser = transformApiUser(response.user)

        // Store the token in cookies
        Cookies.set(AUTH_TOKEN_KEY, response.token, {
          expires: 7, // 7 days
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        })

        // Store user data in localStorage
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(transformedUser))

        setUser(transformedUser)
        router.push("/dashboard")
      } catch (error) {
        console.error("Login failed:", error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [router],
  )

  const logout = useCallback(async () => {
    setIsLoading(true)

    try {
      // Call API logout (optional - clears server session if applicable)
      await authApi.logout()
    } catch (error) {
      // Ignore API logout errors - we'll clear local state anyway
      console.warn("API logout failed:", error)
    } finally {
    // Always clear local state
      Cookies.remove(AUTH_TOKEN_KEY)
      localStorage.removeItem(USER_DATA_KEY)
      setUser(null)
      setIsLoading(false)
      router.push("/auth/login")
    }
  }, [router])

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null
      const updated = { ...prev, ...updates }
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  // Check if user has a specific role
  const hasRole = useCallback(
    (roleName: string): boolean => {
      if (!user) return false
      return user.roles.some(
        (role) => role.name.toLowerCase() === roleName.toLowerCase()
      )
    },
    [user]
  )

  // Check if user has a specific permission
  const hasPermission = useCallback(
    (permissionName: string): boolean => {
      if (!user) return false
      // Check in allPermissions first (includes role-based permissions)
      const hasInAll = user.allPermissions.some(
        (perm) => perm.name.toLowerCase() === permissionName.toLowerCase()
      )
      if (hasInAll) return true
      // Check direct permissions
      return user.permissions.some(
        (perm) => perm.name.toLowerCase() === permissionName.toLowerCase()
      )
    },
    [user]
  )

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        updateUser,
        hasRole,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
