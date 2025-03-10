<template>
  <div class="login-container">
    <div class="login-content">
      <div class="login-left">
        <img src="/images/login-bg.svg" alt="Login Background" class="login-image" />
        <div class="login-title">
          <h1>AI驱动的网络靶场自动化构建引擎</h1>
          <p>Automated Cyber Range Construction Engine</p>
        </div>
      </div>
      <div class="login-right">
        <el-card class="login-card">
          <template #header>
            <h2>登录</h2>
          </template>
          <el-form
            ref="formRef"
            :model="form"
            :rules="rules"
            label-width="80px"
          >
            <el-form-item label="用户名" prop="username">
              <el-input v-model="form.username" placeholder="请输入用户名" />
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input
                v-model="form.password"
                type="password"
                placeholder="请输入密码"
                @keyup.enter="handleSubmit"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="loading" @click="handleSubmit">
                登录
              </el-button>
              <el-button @click="$router.push('/register')">
                注册
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </div>
    <div class="copyright">
      Copyright © 2024 AI VUL. All rights reserved.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { login } from '@/api/auth'

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
        // 确保表单数据格式正确
        const loginData = {
          username: form.value.username.trim(),
          password: form.value.password
        }
        const res = await login(loginData)
        localStorage.setItem('token', res.access_token)
        ElMessage.success('登录成功')
        // 获取重定向地址
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
  background: #F0F2F5;
  position: relative;
  overflow: hidden;
}

.login-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-huge);
  position: relative;
  z-index: 1;
}

.login-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-huge);
  
  .login-title {
    text-align: center;
    margin-bottom: var(--spacing-huge);
    
    h1 {
      color: var(--text-primary);
      font-size: 33px;
      margin: 0 0 var(--spacing-base);
      font-weight: 600;
      line-height: 1.35;
    }
    
    p {
      color: var(--text-secondary);
      font-size: 14px;
      margin: 0;
      line-height: 1.5;
    }
  }
  
  .login-image {
    width: 80%;
    max-width: 400px;
    height: auto;
    margin-bottom: var(--spacing-huge);
  }
}

.login-right {
  width: 400px;
  padding: var(--spacing-huge);
}

.login-card {
  background: #FFFFFF;
  border-radius: var(--border-radius-base);
  box-shadow: var(--shadow-base);
  padding: var(--spacing-large);
  
  h2 {
    font-size: 24px;
    color: var(--text-primary);
    text-align: center;
    margin: 0 0 var(--spacing-large);
    font-weight: 600;
  }
  
  .el-form {
    .el-form-item {
      margin-bottom: var(--spacing-large);
      
      &:last-child {
        margin-bottom: 0;
      }
    }
    
    .el-input {
      height: 40px;
      
      :deep(.el-input__wrapper) {
        padding: 4px 11px;
        
        .el-input__inner {
          height: 32px;
          font-size: 14px;
          
          &::placeholder {
            color: var(--text-placeholder);
          }
        }
      }
    }
    
    .submit-btn {
      width: 100%;
      height: 40px;
      font-size: 16px;
      font-weight: 400;
      margin-top: var(--spacing-base);
    }
  }
  
  .login-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: var(--spacing-base);
    
    .remember-me {
      color: var(--text-regular);
    }
    
    .forgot-password {
      color: var(--primary-color);
      text-decoration: none;
      
      &:hover {
        color: var(--primary-hover);
      }
    }
  }
  
  .other-login {
    margin-top: var(--spacing-large);
    text-align: center;
    
    .divider {
      color: var(--text-secondary);
      margin: var(--spacing-base) 0;
    }
    
    .login-methods {
      display: flex;
      justify-content: center;
      gap: var(--spacing-base);
      
      .method-item {
        width: 40px;
        height: 40px;
        border-radius: var(--border-radius-circle);
        border: 1px solid var(--border-color);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: var(--transition-base);
        
        &:hover {
          border-color: var(--primary-color);
          color: var(--primary-color);
        }
      }
    }
  }
}

.copyright {
  text-align: center;
  padding: var(--spacing-base);
  color: var(--text-secondary);
  font-size: 14px;
}

// 响应式布局
@media screen and (max-width: 1200px) {
  .login-content {
    padding: var(--spacing-large);
    flex-direction: column;
  }
  
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