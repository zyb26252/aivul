<template>
  <el-dropdown @command="handleLanguageChange" trigger="click">
    <span class="language-dropdown-link">
      {{ currentLanguageLabel }}
      <el-icon class="el-icon--right"><arrow-down /></el-icon>
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item v-for="lang in availableLanguages" 
                         :key="lang.value" 
                         :command="lang.value"
                         :class="{ 'is-active': currentLanguage === lang.value }">
          {{ lang.label }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowDown } from '@element-plus/icons-vue'

const { locale } = useI18n()

const currentLanguage = computed(() => locale.value)

const availableLanguages = [
  { value: 'zh', label: '简体中文' },
  { value: 'en', label: 'English' },
  { value: 'zh-TW', label: '繁體中文' },
  { value: 'ja', label: '日本語' }
]

const currentLanguageLabel = computed(() => {
  const lang = availableLanguages.find(lang => lang.value === currentLanguage.value)
  return lang ? lang.label : '简体中文'
})

// 切换语言并保存到localStorage
const handleLanguageChange = (lang: string) => {
  locale.value = lang
  localStorage.setItem('language', lang)
}

// 组件挂载时检查localStorage中是否有语言设置
onMounted(() => {
  const savedLanguage = localStorage.getItem('language')
  if (savedLanguage && availableLanguages.some(lang => lang.value === savedLanguage)) {
    locale.value = savedLanguage
  }
})
</script>

<style scoped>
.language-dropdown-link {
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 14px;
  color: var(--el-text-color-primary);
}

:deep(.el-dropdown-menu__item.is-active) {
  color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
}
</style> 