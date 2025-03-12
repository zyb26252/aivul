<template>
  <div class="password-change">
    <el-button type="primary" @click="dialogVisible = true">{{ $t('common.profile.changePassword') }}</el-button>
    
    <el-dialog
      v-model="dialogVisible"
      :title="$t('common.profile.changePassword')"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        class="password-form"
      >
      <el-form-item :label="$t('common.profile.oldPassword')" prop="old_password">
        <el-input
          v-model="form.old_password"
          type="password"
          show-password
          :placeholder="$t('common.pleaseInput')"
        />
      </el-form-item>
      
      <el-form-item :label="$t('common.profile.newPassword')" prop="new_password">
        <el-input
          v-model="form.new_password"
          type="password"
          show-password
          :placeholder="$t('common.pleaseInput')"
        />
      </el-form-item>
      
      <el-form-item :label="$t('common.profile.confirmPassword')" prop="confirm_password">
        <el-input
          v-model="form.confirm_password"
          type="password"
          show-password
          :placeholder="$t('common.pleaseInput')"
        />
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</el-button>
        <el-button @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
      </el-form-item>
    </el-form>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { changePassword } from '@/api/auth'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()
const formRef = ref()
const dialogVisible = ref(false)

const form = ref({
  old_password: '',
  new_password: '',
  confirm_password: ''
})

const rules = {
  old_password: [
    { required: true, message: $t('common.pleaseInput'), trigger: 'blur' }
  ],
  new_password: [
    { required: true, message: $t('common.pleaseInput'), trigger: 'blur' },
    { min: 8, message: $t('common.lengthLimit', { min: 8, max: 30 }), trigger: 'blur' }
  ],
  confirm_password: [
    { required: true, message: $t('common.pleaseInput'), trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (value !== form.value.new_password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        await changePassword(form.value)
        ElMessage.success($t('common.success'))
        dialogVisible.value = false
        // 重置表单
        form.value = {
          old_password: '',
          new_password: '',
          confirm_password: ''
        }
        // 登出并跳转到登录页
        userStore.logout()
        router.push('/login')
      } catch (error: any) {
        ElMessage.error(error.message || $t('common.failed'))
      }
    }
  })
}
</script>

<style scoped>
.password-change {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
}

.password-form {
  margin-top: 20px;
}
</style>