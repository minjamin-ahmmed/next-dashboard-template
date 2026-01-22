import type { ApiRole } from "./role"
import type { ApiPermission } from "./permission"
import type { PaginatedResponse } from "./common"

// User Interface
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

// User List Response
export interface UserListResponse {
  users: PaginatedResponse<ApiUser>
  message: string
  status: "success" | "error"
}
