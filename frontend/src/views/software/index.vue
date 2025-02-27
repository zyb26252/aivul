<template>
  <div class="software-container">
    <div class="header">
      <h2>软件管理</h2>
      <el-button type="primary" @click="handleAdd">
        添加软件
      </el-button>
    </div>

    <el-table
      v-loading="loading"
      :data="softwareList"
      style="width: 100%"
    >
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="version" label="版本" />
      <el-table-column prop="description" label="描述" show-overflow-tooltip />
      <el-table-column prop="created_at" label="创建时间">
        <template #default="{ row }">
          {{ new Date(row.created_at).toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button type="danger" link @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加软件' : '编辑软件'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入软件名称" />
        </el-form-item>
        <el-form-item label="版本" prop="version">
          <el-input v-model="form.version" placeholder="请输入软件版本" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            placeholder="请输入软件描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { getSoftwareList, createSoftware, updateSoftware, deleteSoftware } from '@/api/software'
import type { Software } from '@/types/software'

const loading = ref(false)
const softwareList = ref<Software[]>([])
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const submitLoading = ref(false)
const formRef = ref<FormInstance>()

const form = ref({
  id: 0,
  name: '',
  version: '',
  description: ''
})

const rules = {
  name: [
    { required: true, message: '请输入软件名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  version: [
    { required: true, message: '请输入软件版本', trigger: 'blur' }
  ]
}

// 获取软件列表
const fetchSoftwareList = async () => {
  loading.value = true
  try {
    softwareList.value = await getSoftwareList()
  } finally {
    loading.value = false
  }
}

// 添加软件
const handleAdd = () => {
  dialogType.value = 'add'
  form.value = {
    id: 0,
    name: '',
    version: '',
    description: ''
  }
  dialogVisible.value = true
}

// 编辑软件
const handleEdit = (row: Software) => {
  dialogType.value = 'edit'
  form.value = { ...row }
  dialogVisible.value = true
}

// 删除软件
const handleDelete = async (row: Software) => {
  try {
    await ElMessageBox.confirm('确定要删除该软件吗？', '提示', {
      type: 'warning'
    })
    await deleteSoftware(row.id)
    ElMessage.success('删除成功')
    await fetchSoftwareList()
  } catch (error) {
    // 用户取消删除或删除失败
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (dialogType.value === 'add') {
          await createSoftware(form.value)
          ElMessage.success('添加成功')
        } else {
          await updateSoftware(form.value.id, form.value)
          ElMessage.success('更新成功')
        }
        dialogVisible.value = false
        await fetchSoftwareList()
      } finally {
        submitLoading.value = false
      }
    }
  })
}

onMounted(() => {
  fetchSoftwareList()
})
</script>

<style scoped>
.software-container {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
}
</style> 