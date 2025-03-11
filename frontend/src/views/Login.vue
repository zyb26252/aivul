<template>
  <div class="login-container">
    <div class="language-switcher">
      <LanguageSwitcher />
    </div>
    
    <div class="login-box">
      <div class="login-header">
        <h2>{{ $t('header.title') }}</h2>
        <p>{{ $t('header.subtitle') }}</p>
      </div>
      
      <div class="login-form">
        <input type="text" v-model="email" placeholder="Email" />
        <input type="password" v-model="password" placeholder="Password" />
        <button @click="handleLogin">Login</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'

const router = useRouter()
const userStore = useUserStore()

const email = ref('')
const password = ref('')

const handleLogin = () => {
  // Implement login logic here
}
</script>

<style scoped>
.login-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: var(--el-bg-color);
}

.language-switcher {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;
}

.login-box {
  background-color: var(--el-bg-color);
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 20px;
}

.login-header h2 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 10px;
}

.login-header p {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.login-form {
  display: flex;
  flex-direction: column;
}

.login-form input {
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
}

.login-form button {
  padding: 10px;
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  cursor: pointer;
}
</style> 