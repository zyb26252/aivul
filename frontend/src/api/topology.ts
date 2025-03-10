import request from '@/utils/request'
import { getApiUrl } from '@/utils/request'

export interface TopologyData {
  id?: number
  name: string
  data: any
  description?: string
  created_at?: string
  updated_at?: string
}

// 保存拓扑图
export const saveTopology = (data: TopologyData) => {
  if (data.id) {
    return request({
      url: getApiUrl(`/scenes/${data.id}`),
      method: 'PUT',
      data
    })
  }
  return request({
    url: getApiUrl('/scenes'),
    method: 'POST',
    data
  })
}

// 获取拓扑图列表
export const getTopologyList = () => {
  return request({
    url: getApiUrl('/scenes'),
    method: 'GET'
  })
}

// 获取拓扑图详情
export const getTopologyDetail = (id: number) => {
  return request({
    url: getApiUrl(`/scenes/${id}`),
    method: 'GET'
  })
}

// 删除拓扑图
export const deleteTopology = (id: number) => {
  return request({
    url: getApiUrl(`/scenes/${id}`),
    method: 'DELETE'
  })
} 