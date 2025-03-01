<template>
  <div class="login-container">
    <div class="login-header">
      <h1>AI驱动的网络靶场自动化构建引擎</h1>
    </div>
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
        console.log('Login data:', loginData)
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
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
}

.login-header {
  margin-bottom: 2rem;
  text-align: center;
}

.login-header h1 {
  color: #409EFF;
  font-size: 2rem;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.login-card {
  width: 400px;
}

.login-card :deep(.el-card__header) {
  text-align: center;
}

.login-card h2 {
  margin: 0;
}
</style> 