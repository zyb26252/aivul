<template>
  <div class="page-container">
    <TableSkeleton v-if="loading" />
    <template v-else>
      <div class="page-header">
        <div class="header-left">
          <h2 class="page-title">镜像管理</h2>
          <div class="search-container">
            <el-input
              v-model="searchQuery"
              placeholder="搜索镜像名称"
              class="search-input"
              clearable
              @input="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            
            <el-select
              v-model="selectedArchitecture"
              placeholder="选择架构"
              clearable
              @change="handleSearch"
              class="architecture-select"
            >
              <el-option label="x86" value="x86" />
              <el-option label="arm" value="arm" />
            </el-select>
          </div>
        </div>
        <el-button type="primary" @click="handleAdd">
          添加镜像
        </el-button>
      </div>

      <el-table
        v-loading="loading"
        :data="images"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="镜像名称" />
        <el-table-column prop="registry_path" label="镜像路径" />
        <el-table-column prop="architecture" label="架构" />
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

      <div v-if="selectedRows.length > 0" class="batch-operation">
        <span class="selected-count">已选择 {{ selectedRows.length }} 项</span>
        <el-button type="danger" @click="handleBatchDelete">批量删除</el-button>
      </div>

      <!-- 添加/编辑对话框 -->
      <el-dialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '添加镜像' : '编辑镜像'"
        width="500px"
      >
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="100px"
        >
          <el-form-item label="名称" prop="name">
            <el-input v-model="form.name" placeholder="请输入镜像名称" />
          </el-form-item>
          <el-form-item label="镜像路径" prop="registry_path">
            <el-input v-model="form.registry_path" placeholder="请输入镜像路径" />
          </el-form-item>
          <el-form-item label="架构" prop="architecture">
            <el-select v-model="form.architecture" placeholder="请选择架构">
              <el-option label="x86" value="x86" />
              <el-option label="arm" value="arm" />
            </el-select>
          </el-form-item>
          <el-form-item label="版本" prop="version">
            <el-input v-model="form.version" placeholder="请输入版本号" />
          </el-form-item>
          <el-form-item label="描述" prop="description">
            <el-input
              v-model="form.description"
              type="textarea"
              placeholder="请输入镜像描述"
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
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'
import { getImages, createImage, updateImage, deleteImage } from '@/api/image'
import type { Image } from '@/types/image'
import TableSkeleton from '@/components/TableSkeleton.vue'

const loading = ref(false)
const images = ref<Image[]>([])
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const submitLoading = ref(false)
const formRef = ref<FormInstance>()
const searchQuery = ref('')
const selectedArchitecture = ref('')
const selectedRows = ref<Image[]>([])

const form = ref({
  id: 0,
  name: '',
  registry_path: '',
  architecture: '',
  version: '',
  description: ''
})

const rules = {
  name: [
    { required: true, message: '请输入镜像名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  registry_path: [
    { required: true, message: '请输入镜像路径', trigger: 'blur' }
  ],
  architecture: [
    { required: true, message: '请选择架构', trigger: 'change' }
  ],
  version: [
    { required: true, message: '请输入版本号', trigger: 'blur' }
  ]
}

// 获取镜像列表
const fetchImages = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (searchQuery.value) {
      params.append('search', searchQuery.value)
    }
    if (selectedArchitecture.value) {
      params.append('architecture', selectedArchitecture.value)
    }
    const response = await getImages(params)
    images.value = response
  } finally {
    loading.value = false
  }
}

// 处理搜索和筛选
const handleSearch = () => {
  fetchImages()
}

// 添加镜像
const handleAdd = () => {
  dialogType.value = 'add'
  form.value = {
    id: 0,
    name: '',
    registry_path: '',
    architecture: '',
    version: '',
    description: ''
  }
  dialogVisible.value = true
}

// 编辑镜像
const handleEdit = (row: Image) => {
  dialogType.value = 'edit'
  form.value = { ...row }
  dialogVisible.value = true
}

// 删除镜像
const handleDelete = async (row: Image) => {
  try {
    await ElMessageBox.confirm('确定要删除该镜像吗？', '提示', {
      type: 'warning'
    })
    await deleteImage(row.id)
    ElMessage.success('删除成功')
    await fetchImages()
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
          await createImage(form.value)
          ElMessage.success('添加成功')
        } else {
          await updateImage(form.value.id, form.value)
          ElMessage.success('更新成功')
        }
        dialogVisible.value = false
        await fetchImages()
      } finally {
        submitLoading.value = false
      }
    }
  })
}

// 处理表格选择变化
const handleSelectionChange = (rows: Image[]) => {
  selectedRows.value = rows
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) return
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 个镜像吗？`, 
      '批量删除确认', 
      {
        type: 'warning',
        confirmButtonText: '确定删除',
        cancelButtonText: '取消'
      }
    )
    
    loading.value = true
    try {
      await Promise.all(selectedRows.value.map(row => deleteImage(row.id)))
      ElMessage.success('批量删除成功')
      await fetchImages()
      selectedRows.value = []
    } catch (error) {
      ElMessage.error('批量删除失败')
    } finally {
      loading.value = false
    }
  } catch {
    // 用户取消删除
  }
}

onMounted(() => {
  fetchImages()
})
</script>

<style lang="scss" scoped>
@import '@/styles/common.scss';

.architecture-select {
  margin-left: 12px;
  width: 120px;
}

.image-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  
  .info-item {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--el-text-color-regular);
    font-size: 13px;
    
    .label {
      color: var(--el-text-color-secondary);
    }
  }
}

.batch-operation {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding: 12px;
  background-color: var(--el-fill-color-light);
  border-radius: 4px;
  
  .selected-count {
    color: var(--el-text-color-secondary);
    font-size: 14px;
  }
}

.operation-group {
  display: flex;
  align-items: center;
  gap: 16px;
}
</style> 