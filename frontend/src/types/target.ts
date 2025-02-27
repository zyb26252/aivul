export interface Target {
  id: number
  name: string
  description: string
  dockerfile: string
  image_id: number
  software_ids: number[]
  created_at: string
  created_by_id: number
  image?: {
    id: number
    name: string
    registry_path: string
  }
  software?: Array<{
    id: number
    name: string
    version: string
  }>
}

export interface TargetCreate {
  name: string
  description?: string
  dockerfile?: string
  image_id: number
  software_ids: number[]
}

export interface TargetUpdate {
  name?: string
  description?: string
  dockerfile?: string
  image_id?: number
  software_ids?: number[]
} 