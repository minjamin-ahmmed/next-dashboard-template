import Cookies from "js-cookie"

// API Configuration
export const API_BASE_URL = "https://wa.acibd.com/api/webdynamo/api"

// Token key for cookies
export const AUTH_TOKEN_KEY = "auth-token"

// API Client class
class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private getAuthHeaders(): HeadersInit {
    const token = Cookies.get(AUTH_TOKEN_KEY)
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "Accept": "application/json",
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    return headers
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    }

    const response = await fetch(url, config)

    // Handle non-JSON responses
    const contentType = response.headers.get("content-type")
    if (!contentType?.includes("application/json")) {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return {} as T
    }

    const data = await response.json()

    if (!response.ok) {
      const errorMessage = data.message || `HTTP error! status: ${response.status}`
      throw new Error(errorMessage)
    }

    return data as T
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" })
  }

  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async put<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" })
  }
}

// Export singleton instance
export const api = new ApiClient(API_BASE_URL)
