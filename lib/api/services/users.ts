import { api } from "../client"
import type { UserListResponse } from "../types/user"
import type { RegisterResponse } from "../types/auth"

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
