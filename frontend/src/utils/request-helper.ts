import { API_CONFIG } from '@/config'

interface CacheItem {
  data: any
  timestamp: number
}

class RequestHelper {
  private static cache: Map<string, CacheItem> = new Map()
  private static CACHE_DURATION = 5 * 60 * 1000 // 5分钟缓存

  // 获取缓存
  static getCache(key: string): any | null {
    if (!API_CONFIG.ENABLE_CACHE) return null

    const item = this.cache.get(key)
    if (!item) return null

    // 检查缓存是否过期
    if (Date.now() - item.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  // 设置缓存
  static setCache(key: string, data: any): void {
    if (!API_CONFIG.ENABLE_CACHE) return

    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  // 清除缓存
  static clearCache(): void {
    this.cache.clear()
  }

  // 带重试的请求
  static async requestWithRetry<T>(
    requestFn: () => Promise<T>,
    retries: number = API_CONFIG.MAX_RETRIES
  ): Promise<T> {
    try {
      return await requestFn()
    } catch (error) {
      if (retries <= 0) throw error

      // 延迟重试，每次重试时间翻倍
      const delay = Math.pow(2, API_CONFIG.MAX_RETRIES - retries) * 1000
      await new Promise(resolve => setTimeout(resolve, delay))

      return this.requestWithRetry(requestFn, retries - 1)
    }
  }

  // 生成缓存键
  static generateCacheKey(url: string, params?: any): string {
    return `${url}:${JSON.stringify(params || {})}`
  }
} 