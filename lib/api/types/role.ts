import type { ApiPermission } from "./permission"

// Permission with pivot (for role-permission relationship)
export interface ApiPermissionWithPivot extends ApiPermission {
  pivot: {
    role_id: number
    permission_id: number
  }
}

// Role Interface
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
  permissions: ApiPermissionWithPivot[]
}

// Role List Response
export interface RoleListResponse {
  role: ApiRole[]
  message: string
  status: "Success" | "Error" | "success" | "error"
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

// Role List Simple Response (for role_list endpoint)
export interface RoleListSimpleResponse {
  roles: Record<string, string> // key is role ID, value is role name
  message: string
  status: "success" | "error"
}
