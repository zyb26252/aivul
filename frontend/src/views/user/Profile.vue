<template>
  <div class="user-profile">
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <h3>{{ $t('profile.title') || '个人中心' }}</h3>
        </div>
      </template>
      
      <el-tabs>
        <el-tab-pane :label="$t('profile.basicInfo') || '基本信息'">
          <div class="user-info-section" v-if="userStore.userInfo">
            <el-descriptions :column="1" border>
              <el-descriptions-item :label="$t('profile.username') || '用户名'">
                {{ userStore.userInfo.username }}
              </el-descriptions-item>
              <el-descriptions-item :label="$t('profile.email') || '邮箱'">
                {{ userStore.userInfo.email }}
              </el-descriptions-item>
              <el-descriptions-item :label="$t('profile.role') || '角色'">
                {{ userStore.userInfo.role || '普通用户' }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-tab-pane>
        <el-tab-pane :label="$t('common.profile.changePassword') || '修改密码'">
          <PasswordChange />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import PasswordChange from '@/components/PasswordChange.vue'

const userStore = useUserStore()
</script>

<style lang="scss" scoped>
.user-profile {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  
  .profile-card {
    margin-bottom: 20px;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      h3 {
        margin: 0;
        font-size: 18px;
      }
    }
  }
  
  .user-info-section {
    margin-bottom: 20px;
  }
}
</style>