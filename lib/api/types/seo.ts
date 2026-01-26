// SEO Page Interface
export interface ApiSeoPage {
  id: number
  page_name: string
  page_slug: string
  meta_title: string
  meta_description: string
  meta_keywords: string
  status: boolean
  created_at: string
  updated_at: string
}

// SEO List Response
export interface SeoListResponse {
  data: ApiSeoPage[]
  message: string
  status: "success" | "error" | "Success" | "Error"
}
