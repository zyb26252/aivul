import request from '@/utils/request'
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

export const generateDescription = async (image: Image, softwareList: Software[]): Promise<string> => {
  try {
    const request_data: GenerateDescriptionRequest = {
      image: {
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
    
    const response = await request.post<AIResponse>(getApiUrl('/ai/generate_description'), request_data)
    return response.data.result
  } catch (error) {
    console.error('Generate description error:', error)
    throw error
  }
}

export const optimizeDockerfile = async (dockerfile: string): Promise<string> => {
  try {
    const request_data: OptimizeDockerfileRequest = {
      dockerfile
    }
    
    const response = await request.post<AIResponse>(getApiUrl('/ai/optimize_dockerfile'), request_data)
    return response.data.result
  } catch (error) {
    console.error('Optimize Dockerfile error:', error)
    throw error
  }
}

export const checkCompatibility = async (image: Image, softwareList: Software[]): Promise<string> => {
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
    
    const response = await request.post<AIResponse>(getApiUrl('/ai/check_compatibility'), request_data)
    return response.data.result
  } catch (error) {
    console.error('Check compatibility error:', error)
    throw error
  }
} 