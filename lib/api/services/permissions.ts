import { api } from "../client"
import type { PermissionListResponse } from "../types/permission"

// Create Permission Request
export interface CreatePermissionRequest {
  name: string
  guard_name?: string
}

// Create Permission Response
export interface CreatePermissionResponse {
  message: string
  status: "Success" | "Error" | "success" | "error"
}

// Update Permission Request
export interface UpdatePermissionRequest {
  name: string
  guard_name?: string
}

// Update Permission Response
export interface UpdatePermissionResponse {
  message: string
  status: "Success" | "Error" | "success" | "error"
}

// Delete Permission Response
export interface DeletePermissionResponse {
  message: string
  status: "Success" | "Error" | "success" | "error"
}

// Permissions API functions
export const permissionsApi = {
  // Get permission list
  getPermissions: async (): Promise<PermissionListResponse> => {
    return api.get<PermissionListResponse>("/permissions")
  },

  // Create new permission
  createPermission: async (data: CreatePermissionRequest): Promise<CreatePermissionResponse> => {
    return api.post<CreatePermissionResponse>("/permissions", data)
  },

  // Update permission
  updatePermission: async (id: number, data: UpdatePermissionRequest): Promise<UpdatePermissionResponse> => {
    return api.put<UpdatePermissionResponse>(`/permissions/${id}`, data)
  },

  // Delete permission
  deletePermission: async (id: number): Promise<DeletePermissionResponse> => {
    return api.delete<DeletePermissionResponse>(`/permissions/${id}`)
  },
}
