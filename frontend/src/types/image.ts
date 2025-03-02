export interface Image {
  id: number
  name: string
  version: string
  architecture: string
  registry_path: string
  description?: string
  created_at?: string
  updated_at?: string
  created_by_id: number
}

export interface ImageCreate {
  name: string
  registry_path: string
  description?: string
}

export interface ImageUpdate {
  name?: string
  registry_path?: string
  description?: string
} 