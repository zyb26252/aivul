<template>
  <div class="header">
    <!-- ... 其他代码 ... -->
    <el-dropdown>
      <span class="user-info">
        {{ userStore.userInfo?.username }}
        <el-icon><ArrowDown /></el-icon>
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item @click="router.push('/profile')">
            个人中心
          </el-dropdown-item>
          <el-dropdown-item divided @click="handleLogout">
            退出登录
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <!-- ... 其他代码 ... -->
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}
</script>