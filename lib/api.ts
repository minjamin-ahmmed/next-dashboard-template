import Cookies from "js-cookie"

// API Configuration
export const API_BASE_URL = "https://wa.acibd.com/api/webdynamo/api"

// Token key for cookies
export const AUTH_TOKEN_KEY = "auth-token"

// API Response Types
export interface ApiRole {
  id: number
  name: string
  guard_name: string
  created_at: string | null
  updated_at: string | null
  pivot?: {
    model_type: string
    model_id: number
    role_id: number
  }
  permissions: ApiPermission[]
}

export interface ApiPermission {
  id: number
  name: string
  guard_name: string
  created_at: string | null
  updated_at: string | null
}

export interface ApiUser {
  id: number
  name: string
  email: string
  email_verified_at: string | null
  created_at: string
  updated_at: string
  roles: ApiRole[]
  branch: string | null
  all_permissions: ApiPermission[]
  permissions: ApiPermission[]
}

export interface LoginResponse {
  user: ApiUser
  token: string
  message: string
  status: "success" | "error"
}

export interface ApiErrorResponse {
  message: string
  status: "error"
  errors?: Record<string, string[]>
}

// Pagination Types
export interface PaginationLink {
  url: string | null
  label: string
  active: boolean
}

export interface PaginatedResponse<T> {
  current_page: number
  data: T[]
  first_page_url: string
  from: number | null
  last_page: number
  last_page_url: string
  links: PaginationLink[]
  next_page_url: string | null
  path: string
  per_page: number
  prev_page_url: string | null
  to: number | null
  total: number
}

// User List Response
export interface UserListResponse {
  users: PaginatedResponse<ApiUser>
  message: string
  status: "success" | "error"
}

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

// Auth API functions
export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    return api.post<LoginResponse>("/login", { email, password })
  },

  logout: async (): Promise<void> => {
    try {
      await api.post("/logout")
    } catch {
    }
  },

  // Get current user profile (if your API supports it)
  getProfile: async (): Promise<{ user: ApiUser }> => {
    return api.get<{ user: ApiUser }>("/profile")
  },
}

// Register Response
export interface RegisterResponse {
  token: string
  message: string
  status: "success" | "error"
}

// Users API functions
export const usersApi = {
  // Get paginated user list
  getUsers: async (page: number = 1): Promise<UserListResponse> => {
    return api.get<UserListResponse>(`/user_list?page=${page}`)
  },

  // Register new user
  register: async (data: {
    name: string
    email: string
    password: string
    roles: string
  }): Promise<RegisterResponse> => {
    return api.post<RegisterResponse>("/register", data)
  },

  // Update user
  updateUser: async (
    id: number,
    data: {
      name: string
      email: string
      status?: string
      branch_id?: number
      roles?: string[]
    }
  ): Promise<{ message: string; status: "success" | "error" }> => {
    return api.put(`/user_update/${id}`, data)
  },

  // Delete user
  deleteUser: async (id: number): Promise<{ message: string; status: "success" | "error" }> => {
    return api.delete(`/user_delete/${id}`)
  },
}

// Role List Response
export interface RoleListResponse {
  roles: Record<string, string>
  message: string
  status: "success" | "error"
}

// Role Wise User
export interface RoleWiseUser {
  user_id: number
  email: string
  name: string
  role_name: string
}

export interface RoleWiseUserResponse {
  roles: Record<string, RoleWiseUser[]>
  message: string
  status: "success" | "error"
}

// Roles API functions
export const rolesApi = {
  // Get role list
  getRoles: async (): Promise<RoleListResponse> => {
    return api.get<RoleListResponse>("/role_list")
  },

  // Get role wise users
  getRoleWiseUsers: async (): Promise<RoleWiseUserResponse> => {
    return api.get<RoleWiseUserResponse>("/role_wise_user")
  },
}

// Permission type
export interface PermissionItem {
  id: number
  name: string
}

// Permission List Response
export interface PermissionListResponse {
  permission: PermissionItem[]
  message: string
  status: "success" | "error"
}

// Permissions API functions
export const permissionsApi = {
  // Get permission list
  getPermissions: async (): Promise<PermissionListResponse> => {
    return api.get<PermissionListResponse>("/permission_list")
  },
}

// Contact Message type
export interface ContactMessage {
  id: number
  first_name: string
  last_name: string
  phone_number: string
  email_address: string
  company: string | null
  subject: string | null
  message: string
  created_at: string
  updated_at: string
}

// Contact Messages Response
export interface ContactMessagesResponse {
  success: boolean
  data: ContactMessage[]
}

// Contact API functions
export const contactApi = {
  // Get contact messages
  getMessages: async (): Promise<ContactMessagesResponse> => {
    return api.get<ContactMessagesResponse>("/contact-messages")
  },
}
