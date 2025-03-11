import request from '@/utils/request'
import axios from 'axios'
import { getApiUrl } from '@/utils/request'
import type { Image } from '@/types/image'
import type { Software } from '@/types/software'

interface AIResponse {
  result: string;
}

interface GenerateDescriptionRequest {
  image: {
    name: string;
    version: string;
    architecture: string;
  };
  software_list: Array<{
    name: string;
    version: string;
    architecture: string;
  }>;
}

interface OptimizeDockerfileRequest {
  dockerfile: string;
}

interface CompatibilityCheckRequest {
  base_image: {
    name: string;
    version: string;
    architecture: string;
  };
  software_list: Array<{
    name: string;
    version: string;
    architecture: string;
  }>;
}

export const generateDescription = async (data: GenerateDescriptionRequest): Promise<string> => {
  try {
    const response = await request({
      url: getApiUrl('/ai/generate_description'),
      method: 'post',
      data
    })
    
    // 处理不同格式的响应
    if (typeof response === 'object') {
      // 如果响应是一个对象，尝试获取description或result字段
      if (response.description) {
        return response.description
      } else if (response.result) {
        return response.result
      } else if (typeof response === 'string') {
        return response
      } else {
        // 将整个响应转换为JSON字符串作为备选
        return JSON.stringify(response)
      }
    } else if (typeof response === 'string') {
      // 如果响应直接是字符串
      return response
    }
    
    // 如果无法识别响应格式，返回空字符串
    console.warn('生成描述返回了意外格式:', response)
    return ''
  } catch (error) {
    console.error('生成描述错误:', error)
    // 返回空字符串而不是抛出错误
    throw error
  }
}

export const optimizeDockerfile = async (dockerfile: string): Promise<any> => {
  try {
    const request_data: OptimizeDockerfileRequest = {
      dockerfile: dockerfile
    }
    
    const response = await request({
      url: getApiUrl('/ai/optimize_dockerfile'),
      method: 'post',
      data: request_data
    })
    
    // 如果响应数据为undefined，则直接返回响应本身
    if (response === undefined) {
      return response
    }
    
    return response
  } catch (error) {
    console.error('Optimize Dockerfile error:', error)
    throw error
  }
}

export const checkCompatibility = async (image: Image, softwareList: Software[]): Promise<any> => {
  try {
    const request_data: CompatibilityCheckRequest = {
      base_image: {
        name: image.name,
        version: image.version,
        architecture: image.architecture
      },
      software_list: softwareList.map(s => ({
        name: s.name,
        version: s.version,
        architecture: s.architecture
      }))
    }
    
    const response = await request({
      url: getApiUrl('/ai/check_compatibility'),
      method: 'post',
      data: request_data
    })
    
    // 如果响应数据为undefined，则直接返回响应本身
    if (response === undefined) {
      return response
    }
    
    return response
  } catch (error) {
    console.error('Check compatibility error:', error)
    throw error
  }
} 