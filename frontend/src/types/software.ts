export interface Software {
  id: number
  name: string
  version: string
  architecture: string
  description?: string
  start_command: string[]
  created_at?: string
  updated_at?: string
  created_by_id: number
}

export interface SoftwareCreate {
  name: string
  version: string
  description?: string
}

export interface SoftwareUpdate {
  name?: string
  version?: string
  description?: string
} 