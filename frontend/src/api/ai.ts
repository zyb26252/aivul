import request from '@/utils/request'

interface AIResponse {
  description: string;
}

export const generateDescription = async (prompt: string): Promise<string> => {
  try {
    const response = await request<AIResponse>({
      url: '/api/v1/ai/generate',
      method: 'post',
      data: { prompt }
    })
    
    console.log('AI Response:', response)
    
    if (response && typeof response === 'object' && 'description' in response) {
      return (response as AIResponse).description
    }
    
    throw new Error('无效的响应格式')
  } catch (error) {
    console.error('生成描述失败:', error)
    throw new Error('生成描述失败，请稍后重试')
  }
} 