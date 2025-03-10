import request from '@/utils/request'
import { getApiUrl } from '@/utils/request'

export interface Activity {
  id: number
  type: string
  name: string
  createdAt: string
}

export interface ResourceUsage {
  cpuUsage: number
  memoryUsage: number
  diskUsage: number
}

export interface DashboardStats {
  totalImages: number
  totalInstances: number
  totalTargets: number
  totalSoftware: number
  recentActivities: Activity[]
  resourceUsage: ResourceUsage
}

export const getDashboardStats = () => {
  return request<DashboardStats>({
    url: getApiUrl('/dashboard/stats'),
    method: 'get'
  })
} 