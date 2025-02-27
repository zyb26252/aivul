export interface Software {
  id: number
  name: string
  version: string
  description: string
  created_at: string
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