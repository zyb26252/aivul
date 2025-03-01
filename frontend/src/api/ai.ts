import request from '@/utils/request'

interface AIResponse {
  description: string;
}

export const generateDescription = async (prompt: string): Promise<string> => {
  try {
    const response = await request.post<AIResponse>('/api/v1/ai/generate_description', { prompt })
    
    if (!response) {
      throw new Error('Response is null or undefined')
    }
    
    const data = response as unknown as AIResponse
    if (!data.description) {
      throw new Error('Description is missing from response')
    }
    
    return data.description
  } catch (error) {
    console.error('AI API error:', error)
    throw error
  }
} 