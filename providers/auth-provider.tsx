"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: "admin" | "user" | "viewer"
  createdAt: Date
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateUser: (updates: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const AUTH_TOKEN_KEY = "auth-token"
const USER_DATA_KEY = "user-data"

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
        await new Promise((resolve) => setTimeout(resolve, 1000))

        if (!email || !password) {
          throw new Error("Email and password are required")
        }

        const mockUser: User = {
          id: crypto.randomUUID(),
          email: email,
          name: email
            .split("@")[0]
            .replace(/[._-]/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase()),
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
          role: email.includes("admin") ? "admin" : "user",
          createdAt: new Date(),
        }

        const mockToken = btoa(JSON.stringify({ email, timestamp: Date.now() }))

        Cookies.set(AUTH_TOKEN_KEY, mockToken, {
          expires: 7,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        })
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(mockUser))

        setUser(mockUser)
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
      await new Promise((resolve) => setTimeout(resolve, 500))

      Cookies.remove(AUTH_TOKEN_KEY)
      localStorage.removeItem(USER_DATA_KEY)
      setUser(null)

      router.push("/auth/login")
    } catch (error) {
      console.error("Logout failed:", error)
      throw error
    } finally {
      setIsLoading(false)
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

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        updateUser,
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
