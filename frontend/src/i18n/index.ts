import { createI18n } from 'vue-i18n'

// 导入语言包
import zh from './locales/zh'
import zhTW from './locales/zh-TW'
import en from './locales/en'
import ja from './locales/ja'

const i18n = createI18n({
  legacy: false, // 使用 Composition API
  locale: localStorage.getItem('language') || 'zh', // 默认语言
  fallbackLocale: 'zh', // 备用语言
  messages: {
    zh,
    'zh-TW': zhTW,
    en,
    ja
  }
})

export default i18n 