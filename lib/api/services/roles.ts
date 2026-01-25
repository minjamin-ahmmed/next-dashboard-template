import { api } from "../client"
import type { RoleListResponse, RoleWiseUserResponse, RoleListSimpleResponse } from "../types/role"

// Create Role Request
export interface CreateRoleRequest {
  name: string
  permission: string[] // API expects permission names (strings), not IDs
}

// Create Role Response
export interface CreateRoleResponse {
  message: string
  status: "Success" | "Error" | "success" | "error"
}

// Update Role Request
export interface UpdateRoleRequest {
  name: string
  permission: string[] // API expects permission names (strings), not IDs
}

// Update Role Response
export interface UpdateRoleResponse {
  message: string
  status: "Success" | "Error" | "success" | "error"
}

// Roles API functions
export const rolesApi = {
  // Get role list
  getRoles: async (): Promise<RoleListResponse> => {
    return api.get<RoleListResponse>("/roles")
  },

  // Get role list (simple format)
  getRoleList: async (): Promise<RoleListSimpleResponse> => {
    return api.get<RoleListSimpleResponse>("/role_list")
  },

  // Get role wise users
  getRoleWiseUsers: async (): Promise<RoleWiseUserResponse> => {
    return api.get<RoleWiseUserResponse>("/role_wise_user")
  },

  // Create new role
  createRole: async (data: CreateRoleRequest): Promise<CreateRoleResponse> => {
    return api.post<CreateRoleResponse>("/roles", data)
  },

  // Update role
  updateRole: async (id: number, data: UpdateRoleRequest): Promise<UpdateRoleResponse> => {
    // Build dynamic query string with name and permission[] array format
    // Example: /roles/2?name=Super Admin Updated&permission[]=user-create&permission[]=user-edit
    const params = new URLSearchParams()
    params.append("name", data.name)
    
    // Add each permission name as a separate permission[] parameter
    if (data.permission && data.permission.length > 0) {
      data.permission.forEach((permName) => {
        params.append("permission[]", permName)
      })
    }
    
    // Construct the dynamic endpoint with query parameters
    const endpoint = `/roles/${id}?${params.toString()}`
    return api.put<UpdateRoleResponse>(endpoint)
  },
}
