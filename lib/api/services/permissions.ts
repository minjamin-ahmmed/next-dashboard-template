import { api } from "../client"
import type { PermissionListResponse } from "../types/permission"

// Permissions API functions
export const permissionsApi = {
  // Get permission list
  getPermissions: async (): Promise<PermissionListResponse> => {
    return api.get<PermissionListResponse>("/permission_list")
  },
}
