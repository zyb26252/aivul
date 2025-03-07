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

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
  background-size: 400% 400%;
  animation: gradient 15s ease infinite;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    z-index: 1;
  }
}

.login-content {
  flex: 1;
  display: flex;
  position: relative;
  z-index: 2;
}

.login-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(5px);
  }
}

.login-image {
  width: 80%;
  max-width: 500px;
  height: auto;
  margin-bottom: 2rem;
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1));
}

.login-title {
  text-align: center;
  position: relative;
  z-index: 1;
  
  h1 {
    color: white;
    font-size: 2rem;
    margin: 0 0 1rem;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    background: linear-gradient(45deg, #fff, #f0f0f0);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: shine 3s ease-in-out infinite;
  }

  p {
    color: rgba(255, 255, 255, 0.8);
    font-size: 1.2rem;
    margin: 0;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
}

.login-right {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  position: relative;
  z-index: 2;
}

.login-card {
  width: 400px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
}

.login-card :deep(.el-card__header) {
  text-align: center;
  background: transparent;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.login-card h2 {
  margin: 0;
  color: #409EFF;
  font-size: 24px;
  font-weight: 600;
}

.copyright {
  text-align: center;
  padding: 1rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  position: relative;
  z-index: 2;
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes shine {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

:deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }

  &.is-focus {
    background: white;
    box-shadow: 0 4px 16px rgba(64, 158, 255, 0.2);
  }
}

:deep(.el-button) {
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}
</style> 