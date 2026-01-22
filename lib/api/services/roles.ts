import { api } from "../client"
import type { RoleListResponse, RoleWiseUserResponse } from "../types/role"

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
