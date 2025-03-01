<template>
  <el-container class="layout">
    <el-aside width="200px">
      <div class="logo-container">
        <el-icon class="logo-icon"><Aim /></el-icon>
        <span class="logo-text">AI Target</span>
      </div>
      <el-menu
        :router="true"
        :default-active="route.path"
        class="menu"
      >
        <el-menu-item index="/">
          <el-icon><HomeFilled /></el-icon>
          <span>首页</span>
        </el-menu-item>
        <el-menu-item index="/images">
          <el-icon><Picture /></el-icon>
          <span>镜像管理</span>
        </el-menu-item>
        <el-menu-item index="/software">
          <el-icon><Box /></el-icon>
          <span>软件管理</span>
        </el-menu-item>
        <el-menu-item index="/targets">
          <el-icon><Aim /></el-icon>
          <span>靶标管理</span>
        </el-menu-item>
        <el-menu-item index="/instances">
          <el-icon><Monitor /></el-icon>
          <span>实例管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <el-container>
      <el-header>
        <div class="header">
          <div class="header-title">
            <h2>AI驱动的网络靶场自动化构建引擎</h2>
            <div class="subtitle">Automated Cyber Range Construction Engine</div>
          </div>
          <div class="user-info">
            <el-icon><User /></el-icon>
            <span>{{ userStore.userInfo?.username }}</span>
            <el-button link @click="handleLogout">退出</el-button>
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
  User
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { onMounted } from 'vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 初始化时获取用户信息
onMounted(async () => {
  if (localStorage.getItem('token') && !userStore.userInfo) {
    await userStore.getUserInfo()
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
  
  .logo-icon {
    font-size: 24px;
  }
  
  .logo-text {
    letter-spacing: 1px;
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
}

:deep(.el-aside) {
  border-right: 1px solid var(--el-border-color-light);
}

:deep(.el-header) {
  padding: 0;
  height: 70px;
}

:deep(.el-main) {
  padding: 24px;
  background-color: var(--el-bg-color-page);
}
</style> 