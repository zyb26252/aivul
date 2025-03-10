<template>
  <el-container class="layout">
    <el-aside width="200px">
      <div class="logo-container">
        <el-icon class="logo-icon"><Aim /></el-icon>
        <span class="logo-text">AI VUL</span>
      </div>
      <el-menu
        :router="true"
        :default-active="route.path"
        class="menu"
      >
        <el-menu-item index="/">
          <el-icon><HomeFilled /></el-icon>
          <span>{{ $t('menu.home') }}</span>
        </el-menu-item>
        <el-menu-item index="/images">
          <el-icon><Picture /></el-icon>
          <span>{{ $t('menu.images') }}</span>
        </el-menu-item>
        <el-menu-item index="/software">
          <el-icon><Box /></el-icon>
          <span>{{ $t('menu.software') }}</span>
        </el-menu-item>
        <el-menu-item index="/targets">
          <el-icon><Aim /></el-icon>
          <span>{{ $t('menu.targets') }}</span>
        </el-menu-item>
        <el-menu-item index="/scenes">
          <el-icon><Operation /></el-icon>
          <span>{{ $t('menu.scenes') }}</span>
        </el-menu-item>
        <el-menu-item index="/instances">
          <el-icon><Monitor /></el-icon>
          <span>{{ $t('menu.instances') }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <el-container>
      <el-header>
        <div class="header">
          <div class="header-title">
            <h2>{{ $t('header.title') }}</h2>
            <div class="subtitle">{{ $t('header.subtitle') }}</div>
          </div>
          <div class="user-info">
            <!-- 语言切换器 -->
            <div class="language-switcher">
              <el-icon><ChatRound /></el-icon>
              <div class="language-buttons">
                <button 
                  class="lang-btn" 
                  :class="{ active: currentLocale === 'zh' }" 
                  @click="changeLanguage('zh')"
                >
                  简体
                </button>
                <button 
                  class="lang-btn" 
                  :class="{ active: currentLocale === 'zh-TW' }" 
                  @click="changeLanguage('zh-TW')"
                >
                  繁體
                </button>
                <button 
                  class="lang-btn" 
                  :class="{ active: currentLocale === 'en' }" 
                  @click="changeLanguage('en')"
                >
                  EN
                </button>
              </div>
            </div>
            <div class="divider"></div>
            <el-icon><User /></el-icon>
            <span>{{ userStore.userInfo?.username }}</span>
            <el-button link @click="handleLogout">{{ $t('common.logout') }}</el-button>
          </div>
        </div>
      </el-header>
      
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import {
  HomeFilled,
  Picture,
  Box,
  Aim,
  Monitor,
  User,
  Operation,
  ChatRound
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 语言切换功能
const { locale } = useI18n();
const currentLocale = ref(locale.value);

const changeLanguage = (value: string) => {
  locale.value = value;
  currentLocale.value = value;
  localStorage.setItem('language', value); // 保存语言设置
};

// 初始化时获取用户信息
onMounted(async () => {
  if (localStorage.getItem('token') && !userStore.userInfo) {
    await userStore.getUserInfo()
  }
  // 初始化语言设置
  const savedLanguage = localStorage.getItem('language');
  if (savedLanguage) {
    changeLanguage(savedLanguage);
  }
})

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}
</script>

<style lang="scss" scoped>
.layout {
  height: 100vh;
  background-color: var(--el-bg-color);
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--el-color-primary-dark-2);
  color: white;
  font-size: 20px;
  font-weight: bold;
  gap: 8px;
  padding: 0 12px;
  text-align: center;
  
  .logo-icon {
    font-size: 24px;
    flex-shrink: 0;
  }
  
  .logo-text {
    letter-spacing: 1px;
    line-height: 1.2;
  }
}

.menu {
  height: calc(100% - 60px);
  border-right: none;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  height: 100%;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  
  .header-title {
    h2 {
      margin: 0;
      font-size: 20px;
      color: var(--el-text-color-primary);
      font-weight: 600;
    }
    
    .subtitle {
      margin-top: 4px;
      font-size: 12px;
      color: var(--el-text-color-secondary);
      text-transform: uppercase;
      letter-spacing: 1px;
    }
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--el-text-color-regular);
  
  .el-icon {
    font-size: 16px;
  }
  
  span {
    font-size: 14px;
  }
  
  .divider {
    height: 20px;
    width: 1px;
    background-color: var(--el-border-color);
    margin: 0 8px;
  }
}

/* 语言切换器样式 */
.language-switcher {
  display: flex;
  align-items: center;
  gap: 8px;
}

.language-buttons {
  display: flex;
  align-items: center;
}

.lang-btn {
  background: none;
  border: none;
  padding: 2px 6px;
  margin: 0 1px;
  cursor: pointer;
  border-radius: 10px;
  font-size: 12px;
  transition: all 0.3s;
  color: var(--el-text-color-regular);
}

.lang-btn:hover {
  color: var(--el-color-primary);
  background-color: rgba(var(--el-color-primary-rgb), 0.1);
}

.lang-btn.active {
  color: #fff;
  background-color: var(--el-color-primary);
}

:deep(.el-aside) {
  border-right: 1px solid var(--el-border-color-light);
}

:deep(.el-header) {
  padding: 0;
  height: 70px;
}

:deep(.el-main) {
  padding: 0;
  background-color: var(--el-bg-color-page);
  overflow: hidden;
}
</style> 