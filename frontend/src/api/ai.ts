import request from '@/utils/request'

export const generateDescription = async (prompt: string): Promise<string> => {
  const response = await request({
    url: '/api/v1/ai/generate',
    method: 'post',
    data: { prompt }
  })
  return response.data.description
} 