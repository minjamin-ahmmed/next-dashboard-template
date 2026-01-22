import type { ApiPermission } from "./permission"

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
  permissions: ApiPermission[]
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
