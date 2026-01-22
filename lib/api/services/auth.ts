import { api } from "../client"
import type { LoginResponse } from "../types/auth"
import type { ApiUser } from "../types/user"

// Auth API functions
export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    return api.post<LoginResponse>("/login", { email, password })
  },

  logout: async (): Promise<void> => {
    try {
      await api.post("/logout")
    } catch {
      // Silently fail on logout errors
    }
  },

  // Get current user profile (if your API supports it)
  getProfile: async (): Promise<{ user: ApiUser }> => {
    return api.get<{ user: ApiUser }>("/profile")
  },
}
