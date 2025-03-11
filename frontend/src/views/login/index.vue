<template>
  <div class="login-container">
    <ParticleBackground />
    <div class="page-title">
      <h1>AI驱动的网络靶场自动化构建引擎</h1>
      <p>Automated Cyber Range Construction Engine</p>
    </div>
    <div class="login-content">
      <div class="login-form-wrapper">
        <el-card class="login-card">
          <template #header>
            <div class="card-header">
              <h2>登录</h2>
              <p class="subtitle">欢迎回来！请登录您的账号</p>
            </div>
          </template>
          <el-form
            ref="formRef"
            :model="form"
            :rules="rules"
            class="login-form"
          >
            <el-form-item prop="username">
              <el-input 
                v-model="form.username" 
                placeholder="请输入用户名"
                prefix-icon="User"
              />
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                v-model="form.password"
                type="password"
                placeholder="请输入密码"
                prefix-icon="Lock"
                @keyup.enter="handleSubmit"
              />
            </el-form-item>
            <div class="form-actions">
              <el-button 
                type="primary" 
                class="submit-btn" 
                :loading="loading" 
                @click="handleSubmit"
              >
                {{ loading ? '登录中...' : '登录' }}
              </el-button>
            </div>
          </el-form>
        </el-card>
      </div>
    </div>
    <div class="copyright">
      Copyright © {{ new Date().getFullYear() }} AI VUL. All rights reserved.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { login } from '@/api/auth'
import ParticleBackground from '@/components/ParticleBackground.vue'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const formRef = ref<FormInstance>()

const form = ref({
  username: '',
  password: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const loginData = {
          username: form.value.username.trim(),
          password: form.value.password
        }
        const res = await login(loginData)
        localStorage.setItem('token', res.data.access_token)
        ElMessage.success('登录成功')
        const redirect = route.query.redirect as string
        router.push(redirect || '/')
      } catch (error) {
        // 错误已在请求拦截器中处理
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.login-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #1a237e 0%, #0d47a1 100%);
  position: relative;
  overflow: hidden;
}

.page-title {
  position: absolute;
  top: var(--spacing-huge);
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  z-index: 1;
  width: 100%;
  padding: 0 var(--spacing-huge);
  animation: fadeInDown 0.8s ease-out;
  
  h1 {
    color: white;
    font-size: 36px;
    margin: 0 0 var(--spacing-base);
    font-weight: 600;
    line-height: 1.35;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  p {
    color: rgba(255, 255, 255, 0.8);
    font-size: 18px;
    margin: 0;
    line-height: 1.5;
  }
  
  @media screen and (max-width: 1200px) {
    position: relative;
    top: 0;
    padding: var(--spacing-huge) var(--spacing-large);
    
    h1 {
      font-size: 28px;
    }
    
    p {
      font-size: 16px;
    }
  }
}

.login-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: calc(var(--spacing-huge) * 2) var(--spacing-huge) var(--spacing-huge);
  position: relative;
  z-index: 1;
  
  @media screen and (max-width: 1200px) {
    padding: var(--spacing-large);
  }
}

.login-form-wrapper {
  width: 400px;
  animation: fadeInUp 0.8s ease-out;
  
  @media screen and (max-width: 1200px) {
    width: 100%;
    max-width: 400px;
    padding: 0 var(--spacing-large);
  }
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: var(--border-radius-large);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  .card-header {
    text-align: center;
    margin-bottom: var(--spacing-base);
    
    h2 {
      font-size: 24px;
      color: var(--text-primary);
      margin: 0 0 var(--spacing-mini);
      font-weight: 600;
    }
    
    .subtitle {
      color: var(--text-secondary);
      font-size: 14px;
      margin: 0;
    }
  }
  
  .login-form {
    .el-form-item {
      margin-bottom: var(--spacing-large);
      
      &:last-child {
        margin-bottom: 0;
      }
    }
    
    .el-input {
      --el-input-hover-border-color: var(--primary-color);
      --el-input-focus-border-color: var(--primary-color);
      
      :deep(.el-input__wrapper) {
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        transition: var(--transition-base);
        
        &:hover {
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        &.is-focus {
          box-shadow: 0 4px 12px rgba(24, 144, 255, 0.2);
        }
      }
    }
  }
  
  .form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-large);
  }
  
  .form-actions {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-base);
    
    .submit-btn {
      width: 100%;
      height: 40px;
      font-size: 16px;
      font-weight: 500;
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
      border: none;
      transition: var(--transition-bounce);
      
      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
      }
      
      &:active {
        transform: translateY(0);
      }
    }
  }
}

.copyright {
  text-align: center;
  padding: var(--spacing-base);
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  position: relative;
  z-index: 1;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translate(-50%, -20px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

// 响应式布局
@media screen and (max-width: 1200px) {
  .login-left {
    padding: var(--spacing-large);
    margin-bottom: var(--spacing-huge);
    
    .login-image {
      width: 60%;
      max-width: 300px;
    }
  }
  
  .login-right {
    width: 100%;
    max-width: 400px;
    padding: 0 var(--spacing-large);
  }
}
</style> 