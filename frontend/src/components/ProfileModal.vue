<template>
  <el-dialog
    v-model="visible"
    :title="$t('profile.title')"
    width="500px"
    :close-on-click-modal="false"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="120px"
      class="profile-form"
    >
      <el-form-item :label="$t('profile.oldPassword')" prop="oldPassword">
        <el-input
          v-model="form.oldPassword"
          type="password"
          :placeholder="$t('profile.oldPasswordPlaceholder')"
        />
      </el-form-item>
      <el-form-item :label="$t('profile.newPassword')" prop="newPassword">
        <el-input
          v-model="form.newPassword"
          type="password"
          :placeholder="$t('profile.newPasswordPlaceholder')"
        />
      </el-form-item>
      <el-form-item :label="$t('profile.confirmPassword')" prop="confirmPassword">
        <el-input
          v-model="form.confirmPassword"
          type="password"
          :placeholder="$t('profile.confirmPasswordPlaceholder')"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="visible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import type { FormInstance, FormRules } from 'element-plus'

const visible = ref(false)
const formRef = ref<FormInstance>()
const userStore = useUserStore()

const form = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const rules = reactive<FormRules>({
  oldPassword: [
    { required: true, message: 'Please input old password', trigger: 'blur' },
    { min: 6, message: 'Length should be at least 6 characters', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: 'Please input new password', trigger: 'blur' },
    { min: 6, message: 'Length should be at least 6 characters', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: 'Please confirm your password', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== form.newPassword) {
          callback(new Error('Two passwords do not match!'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
})

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await userStore.updatePassword({
          old_password: form.oldPassword,
          new_password: form.newPassword
        })
        ElMessage.success('Password updated successfully')
        visible.value = false
        // 重置表单
        formRef.value?.resetFields()
      } catch (error: any) {
        ElMessage.error(error.message || 'Failed to update password')
      }
    }
  })
}

defineExpose({
  visible
})
</script>

<style lang="scss" scoped>
.profile-form {
  max-width: 400px;
  margin: 0 auto;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>