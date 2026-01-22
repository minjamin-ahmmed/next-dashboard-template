// Base Permission Interface
export interface ApiPermission {
  id: number
  name: string
  guard_name: string
  created_at: string | null
  updated_at: string | null
}

// Permission Item (simplified version)
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
