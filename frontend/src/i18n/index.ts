import { createI18n } from 'vue-i18n'

// 导入语言包
import zh from './locales/zh'
import en from './locales/en'

const i18n = createI18n({
  legacy: false, // 使用 Composition API
  locale: localStorage.getItem('language') || 'zh', // 默认语言
  fallbackLocale: 'zh', // 备用语言
  messages: {
    zh,
    en
  }
})

export default i18n 