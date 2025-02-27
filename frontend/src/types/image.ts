export interface Image {
  id: number
  name: string
  registry_path: string
  description: string
  created_at: string
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