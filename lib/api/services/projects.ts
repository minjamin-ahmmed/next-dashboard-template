import { api } from "../client";
import type {
  ProjectListResponse,
  ApiProject,
  ProjectTechnology,
} from "../types/project";

// Create Project Request (using snake_case to match API)
export interface CreateProjectRequest {
  title: string;
  short_description: string;
  category: string;
  image_url?: string;
  duration: string;
  team_size: string;
  rating: string;
  client: string;
  year: string;
  technologies: ProjectTechnology[];
  live_url: string;
  github_url?: string | null;
  status?: boolean;
}

// Create Project Response
export interface CreateProjectResponse {
  message: string;
  status: "Success" | "Error" | "success" | "error";
  data?: ApiProject;
}

// Update Project Request (using snake_case to match API)
export interface UpdateProjectRequest {
  title?: string;
  short_description?: string;
  category?: string;
  image_url?: string;
  duration?: string;
  team_size?: string;
  rating?: string;
  client?: string;
  year?: string;
  technologies?: ProjectTechnology[];
  live_url?: string;
  github_url?: string | null;
  status?: boolean;
}

// Update Project Response
export interface UpdateProjectResponse {
  message: string;
  status: "Success" | "Error" | "success" | "error";
  data?: ApiProject;
}

// Delete Project Response
export interface DeleteProjectResponse {
  message: string;
  status: "Success" | "Error" | "success" | "error";
}

// Project API functions
export const projectApi = {
  // Get all projects (GET /admin/projects)
  getProjects: async (): Promise<ProjectListResponse> => {
    return api.get<ProjectListResponse>("/admin/projects");
  },

  // Get project by ID (GET /admin/projects/{id})
  getProjectById: async (
    id: number,
  ): Promise<{
    data: ApiProject;
    message: string;
    status: "success" | "error";
  }> => {
    return api.get<{
      data: ApiProject;
      message: string;
      status: "success" | "error";
    }>(`/admin/projects/${id}`);
  },

  // Create new project (POST /admin/projects)
  // Accepts either JSON body (CreateProjectRequest) or FormData for file uploads
  createProject: async (
    data: CreateProjectRequest | FormData,
  ): Promise<CreateProjectResponse> => {
    return api.post<CreateProjectResponse>("/admin/projects", data);
  },

  // Update project (PUT /admin/projects/{id})
  // Accepts either JSON body (UpdateProjectRequest) or FormData for file uploads
  updateProject: async (
    id: number,
    data: UpdateProjectRequest | FormData,
  ): Promise<UpdateProjectResponse> => {
    // When using FormData, many Laravel backends expect POST with _method spoofing for file uploads
    if (typeof FormData !== "undefined" && data instanceof FormData) {
      data.append("_method", "PUT");
      return api.post<UpdateProjectResponse>(`/admin/projects/${id}`, data);
    }

    return api.put<UpdateProjectResponse>(`/admin/projects/${id}`, data);
  },

  // Delete project (DELETE /admin/projects/{id})
  deleteProject: async (id: number): Promise<DeleteProjectResponse> => {
    return api.delete<DeleteProjectResponse>(`/admin/projects/${id}`);
  },
};
