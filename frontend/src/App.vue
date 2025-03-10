<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'

const { t, locale } = useI18n()
const route = useRoute()

// 更新页面标题
const updateTitle = () => {
  const baseTitle = t('header.title')
  const pageTitle = route.meta.title ? t(`menu.${route.meta.title}`) : ''
  document.title = pageTitle ? `${pageTitle} - ${baseTitle}` : baseTitle
}

// 监听路由和语言变化
watch(() => [route.path, locale.value], updateTitle, { immediate: true })
</script>

<template>
  <div>
    <router-view></router-view>
  </div>
</template>

<style>
@import '@/styles/common.scss';

#app {
  width: 100%;
  height: 100vh;
  background-color: var(--bg-color);
}

.app-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  background-color: var(--bg-color);
  transition: var(--transition-base);
}

// 全局过渡动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(20px);
  opacity: 0;
}

// 滚动条样式
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: var(--bg-color);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
  
  &:hover {
    background: var(--text-secondary);
  }
}

// 全局加载动画
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  
  .el-loading-spinner {
    .circular {
      width: 42px;
      height: 42px;
      animation: loading-rotate 2s linear infinite;
    }
    
    .path {
      stroke: var(--primary-color);
      stroke-width: 2;
      stroke-linecap: round;
      animation: loading-dash 1.5s ease-in-out infinite;
    }
  }
}

@keyframes loading-rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes loading-dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}
</style>
