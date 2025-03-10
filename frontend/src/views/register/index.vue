<template>
  <div class="register-container">
    <el-card class="register-card">
      <h2>注册</h2>
      <el-form
        ref="formRef"
        :model="registerForm"
        :rules="rules"
        label-width="0"
      >
        <el-form-item prop="username">
          <el-input
            v-model="registerForm.username"
            placeholder="用户名"
            prefix-icon="User"
          />
        </el-form-item>
        
        <el-form-item prop="email">
          <el-input
            v-model="registerForm.email"
            placeholder="邮箱"
            prefix-icon="Message"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="密码"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        
        <el-form-item prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="确认密码"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            class="submit-btn"
            @click="handleSubmit"
          >
            注册
          </el-button>
        </el-form-item>
        
        <div class="links">
          <router-link to="/login">返回登录</router-link>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Message } from '@element-plus/icons-vue'
import { register } from '@/api/auth'
import type { FormInstance } from 'element-plus'

const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)

const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const validatePass = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validatePass, trigger: 'blur' }
  ]
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await register({
          username: registerForm.username,
          email: registerForm.email,
          password: registerForm.password
        })
        ElMessage.success('注册成功')
        router.push('/login')
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
.register-container {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #F0F2F5;
  position: relative;
  overflow: hidden;
}

.register-card {
  width: 400px;
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
      
      .el-form-item__label {
        padding-bottom: 8px;
        line-height: 1.5;
        color: var(--text-regular);
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
        
        .el-input__prefix {
          font-size: 16px;
          color: var(--text-secondary);
        }
      }
    }
  }
  
  .submit-btn {
    width: 100%;
    height: 40px;
    font-size: 16px;
    font-weight: 400;
    margin-top: var(--spacing-large);
  }
  
  .links {
    text-align: center;
    margin-top: var(--spacing-base);
    
    a {
      color: var(--primary-color);
      text-decoration: none;
      font-size: 14px;
      transition: var(--transition-base);
      
      &:hover {
        color: var(--primary-hover);
      }
    }
  }
}

// 响应式布局
@media screen and (max-width: 768px) {
  .register-container {
    padding: var(--spacing-base);
  }
  
  .register-card {
    width: 100%;
    max-width: 400px;
  }
}
</style> 