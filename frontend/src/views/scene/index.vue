<template>
  <div class="page-container">
    <TableSkeleton v-if="loading" />
    <template v-else>
      <div class="page-header">
        <div class="header-left">
          <h2 class="page-title">场景管理</h2>
        </div>
        <el-button type="primary" @click="handleAdd">
          添加场景
        </el-button>
      </div>

      <el-table
        v-loading="loading"
        :data="scenes"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="场景名称" width="200" />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column prop="nodeCount" label="节点数量" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ row.nodeCount }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ new Date(row.createdAt).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <div class="operation-group">
              <el-button type="primary" link @click="handleEdit(row)">
                编辑
              </el-button>
              <el-button type="danger" link @click="handleDelete(row)">
                删除
              </el-button>
            </div>
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
        :title="dialogType === 'add' ? '添加场景' : '编辑场景'"
        width="500px"
      >
        <el-form
          ref="formRef"
          :model="formData"
          :rules="rules"
          label-width="100px"
        >
          <el-form-item label="名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入场景名称" />
          </el-form-item>
          <el-form-item label="描述" prop="description">
            <el-input
              v-model="formData.description"
              type="textarea"
              placeholder="请输入场景描述"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit(formRef)">
            确定
          </el-button>
        </template>
      </el-dialog>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import type { Scene } from '@/types/scene'
import { getSceneList, deleteScene, copyScene, updateScene, createScene } from '@/services/scene'
import TableSkeleton from '@/components/TableSkeleton.vue'

const loading = ref(false)
const scenes = ref<Scene[]>([])
const selectedRows = ref<Scene[]>([])
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const submitLoading = ref(false)
const formRef = ref<FormInstance>()

const formData = reactive({
  id: 0,
  name: '',
  description: ''
})

const rules = {
  name: [
    { required: true, message: '请输入场景名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入场景描述', trigger: 'blur' }
  ]
}

const fetchScenes = async () => {
  try {
    loading.value = true
    const response = await getSceneList({})
    console.log('Fetched scenes:', response)
    scenes.value = response.items.map(item => ({
      ...item,
      nodeCount: item.node_count,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }))
  } catch (error) {
    console.error('Error fetching scenes:', error)
    ElMessage.error('获取场景列表失败')
  } finally {
    loading.value = false
  }
}

const handleSelectionChange = (rows: Scene[]) => {
  selectedRows.value = rows
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 个场景吗？`,
      '提示',
      {
        type: 'warning'
      }
    )
    const promises = selectedRows.value.map(row => deleteScene(row.id))
    await Promise.all(promises)
    ElMessage.success('删除成功')
    selectedRows.value = []
    await fetchScenes()
  } catch (error) {
    // 用户取消删除或删除失败
  }
}

const handleDelete = async (row: Scene) => {
  try {
    await ElMessageBox.confirm('确定要删除该场景吗？', '提示', {
      type: 'warning'
    })
    await deleteScene(row.id)
    ElMessage.success('删除成功')
    await fetchScenes()
  } catch (error) {
    // 用户取消删除或删除失败
  }
}

const handleCopy = async (id: number) => {
  try {
    await copyScene(id)
    ElMessage.success('复制成功')
    await fetchScenes()
  } catch (error) {
    console.error('复制场景失败:', error)
    ElMessage.error('复制失败')
  }
}

const handleEdit = (row: Scene) => {
  dialogType.value = 'edit'
  formData.id = row.id
  formData.name = row.name
  formData.description = row.description
  dialogVisible.value = true
}

const handleAdd = () => {
  dialogType.value = 'add'
  formData.id = 0
  formData.name = ''
  formData.description = ''
  dialogVisible.value = true
}

const handleSubmit = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate(async (valid) => {
    if (valid) {
      try {
        if (dialogType.value === 'add') {
          await createScene({
            name: formData.name,
            description: formData.description
          })
          ElMessage.success('添加成功')
        } else {
          await updateScene(formData.id, {
            name: formData.name,
            description: formData.description
          })
          ElMessage.success('更新成功')
        }
        dialogVisible.value = false
        await fetchScenes()
      } catch (error) {
        console.error('保存场景失败:', error)
        ElMessage.error('保存失败')
      }
    }
  })
}

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
  formData.id = 0
  formData.name = ''
  formData.description = ''
}

onMounted(() => {
  fetchScenes()
})
</script>

<style lang="scss" scoped>
@import '@/styles/common.scss';

.operation-group {
  display: flex;
  align-items: center;
  gap: 16px;
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
</style> 