"use client"

import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"
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

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  // Actions
  initialize: () => void
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateUser: (updates: Partial<User>) => void
  hasRole: (roleName: string) => boolean
  hasPermission: (permissionName: string) => boolean
}

export const useAuthStore = create<AuthState>()(
  subscribeWithSelector((set, get) => ({
    user: null,
    isLoading: true,
    isAuthenticated: false,

    initialize: () => {
      try {
        const token = Cookies.get(AUTH_TOKEN_KEY)
        const storedUser = localStorage.getItem(USER_DATA_KEY)

        if (token && storedUser) {
          const user = JSON.parse(storedUser)
          set({ user, isAuthenticated: true, isLoading: false })
        } else {
          set({ isLoading: false })
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error)
        Cookies.remove(AUTH_TOKEN_KEY)
        localStorage.removeItem(USER_DATA_KEY)
        set({ user: null, isAuthenticated: false, isLoading: false })
      }
    },

    login: async (email: string, password: string) => {
      set({ isLoading: true })

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

        set({
          user: transformedUser,
          isAuthenticated: true,
          isLoading: false,
        })

        // Navigate to dashboard - we'll handle this in the component
        // since we can't use useRouter in the store
      } catch (error) {
        console.error("Login failed:", error)
        set({ isLoading: false })
        throw error
      }
    },

    logout: async () => {
      set({ isLoading: true })

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
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        })
      }
    },

    updateUser: (updates: Partial<User>) => {
      const { user } = get()
      if (!user) return

      const updated = { ...user, ...updates }
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(updated))
      set({ user: updated })
    },

    hasRole: (roleName: string): boolean => {
      const { user } = get()
      if (!user) return false
      return user.roles.some(
        (role) => role.name.toLowerCase() === roleName.toLowerCase()
      )
    },

    hasPermission: (permissionName: string): boolean => {
      const { user } = get()
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
  }))
)
