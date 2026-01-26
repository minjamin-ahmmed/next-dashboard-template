// Re-export client and configuration
export { api, API_BASE_URL, AUTH_TOKEN_KEY } from "./client"

// Re-export all types
export type {
  ApiErrorResponse,
  PaginationLink,
  PaginatedResponse,
  ApiPermission,
  PermissionItem,
  PermissionListResponse,
  ApiRole,
  RoleListResponse,
  RoleWiseUser,
  RoleWiseUserResponse,
  ApiUser,
  UserListResponse,
  LoginResponse,
  RegisterResponse,
  ContactMessage,
  ContactMessagesResponse,
  ApiSeoPage,
  SeoListResponse,
} from "./types"

// Re-export all services
export {
  authApi,
  usersApi,
  rolesApi,
  permissionsApi,
  contactApi,
  seoApi,
} from "./services"
