import type { ApiUser } from "./user"

// Login Response
export interface LoginResponse {
  user: ApiUser
  token: string
  message: string
  status: "success" | "error"
}

// Register Response
export interface RegisterResponse {
  token: string
  message: string
  status: "success" | "error"
}
