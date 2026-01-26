import { api } from "../client"
import type { SeoListResponse, ApiSeoPage } from "../types/seo"

// Create SEO Request
export interface CreateSeoRequest {
  page_name: string
  page_slug: string
  meta_title: string
  meta_description: string
  meta_keywords: string
  status?: boolean
}

// Create SEO Response
export interface CreateSeoResponse {
  message: string
  status: "Success" | "Error" | "success" | "error"
  data?: {
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
}

// Update SEO Request
export interface UpdateSeoRequest {
  page_name?: string
  page_slug?: string
  meta_title?: string
  meta_description?: string
  meta_keywords?: string
  status?: boolean
}

// Update SEO Response
export interface UpdateSeoResponse {
  message: string
  status: "Success" | "Error" | "success" | "error"
  data?: {
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
}

// Delete SEO Response
export interface DeleteSeoResponse {
  message: string
  status: "Success" | "Error" | "success" | "error"
}

// SEO API functions
export const seoApi = {
  // Get SEO list (GET /seos)
  getSeoPages: async (): Promise<SeoListResponse> => {
    return api.get<SeoListResponse>("/seos")
  },

  // Get SEO by slug (Public GET /seo/{slug})
  getSeoBySlug: async (slug: string): Promise<{ data: ApiSeoPage; message: string; status: "success" | "error" }> => {
    return api.get<{ data: ApiSeoPage; message: string; status: "success" | "error" }>(`/seo/${slug}`)
  },

  // Create new SEO page (POST /seos)
  createSeoPage: async (data: CreateSeoRequest): Promise<CreateSeoResponse> => {
    return api.post<CreateSeoResponse>("/seos", data)
  },

  // Update SEO page (PUT /seos/{id})
  updateSeoPage: async (id: number, data: UpdateSeoRequest): Promise<UpdateSeoResponse> => {
    return api.put<UpdateSeoResponse>(`/seos/${id}`, data)
  },

  // Delete SEO page (DELETE /seos/{id})
  deleteSeoPage: async (id: number): Promise<DeleteSeoResponse> => {
    return api.delete<DeleteSeoResponse>(`/seos/${id}`)
  },
}
