import request from '@/utils/request'

export interface DashboardStats {
  totalImages: number
  totalInstances: number
  totalTargets: number
  totalSoftware: number
  recentActivities: Array<{
    id: number
    type: string
    name: string
    createdAt: string
  }>
  resourceUsage: {
    cpuUsage: number
    memoryUsage: number
    diskUsage: number
  }
}

export const getDashboardStats = () => {
  return request<DashboardStats>({
    url: '/dashboard/stats',
    method: 'get'
  })
} 