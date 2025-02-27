export interface Instance {
  id: number
  name: string
  status: 'running' | 'stopped' | 'error'
  container_id: string
  target_id: number
  port_mappings: string
  created_at: string
  created_by_id: number
  target?: {
    id: number
    name: string
    image?: {
      registry_path: string
    }
  }
}

export interface InstanceCreate {
  name: string
  target_id: number
  port_mappings?: string
}

export interface InstanceUpdate {
  name?: string
  status?: 'running' | 'stopped'
}

export interface PortMapping {
  container_port: number
  host_port: number
  protocol: 'tcp' | 'udp'
} 