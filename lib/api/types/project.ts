// Project Technology Interface
export interface ProjectTechnology {
  name: string
  icon: string
}

// Project Interface (matches API response with snake_case)
export interface ApiProject {
  id: number
  title: string
  short_description: string
  category: string
  image_url: string | null
  duration: string
  team_size: string
  rating: string
  client: string
  year: string
  technologies: ProjectTechnology[]
  live_url: string | null
  github_url?: string | null
  status: boolean
  created_at: string
  updated_at: string
}

// Project List Response
export interface ProjectListResponse {
  data: ApiProject[]
  message: string
  status: "success" | "error" | "Success" | "Error"
}
