export interface Target {
  id: number
  name: string
  description: string
  dockerfile: string
  optimized_dockerfile: string | null
  base_image_id: number
  software_ids: number[]
  ports: number[]
  created_at: string
  created_by_id: number
  base_image?: {
    id: number
    name: string
    registry_path: string
    version: string
    architecture: string
  }
  software_list: Array<{
    id: number
    name: string
    version: string
    architecture: string
    install_command: string
    start_command: string[]
    ports: number[]
  }>
}

export interface TargetCreate {
  name: string
  description?: string
  dockerfile?: string
  optimized_dockerfile?: string
  base_image_id: number
  software_ids: number[]
  ports: number[]
}

export interface TargetUpdate {
  name?: string
  description?: string
  dockerfile?: string
  optimized_dockerfile?: string
  base_image_id?: number
  software_ids?: number[]
  ports?: number[]
} 