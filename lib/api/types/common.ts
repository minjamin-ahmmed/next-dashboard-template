// API Error Response
export interface ApiErrorResponse {
  message: string
  status: "error"
  errors?: Record<string, string[]>
}

// Pagination Types
export interface PaginationLink {
  url: string | null
  label: string
  active: boolean
}

export interface PaginatedResponse<T> {
  current_page: number
  data: T[]
  first_page_url: string
  from: number | null
  last_page: number
  last_page_url: string
  links: PaginationLink[]
  next_page_url: string | null
  path: string
  per_page: number
  prev_page_url: string | null
  to: number | null
  total: number
}
