<template>
  <div class="page-container">
    <TableSkeleton v-if="loading" />
    <template v-else>
      <div class="page-header">
        <div class="header-left">
          <h2 class="page-title">场景管理</h2>
          <div class="search-container">
            <el-input
              v-model="keyword"
              placeholder="搜索场景名称或描述"
              class="search-input"
              clearable
              @input="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
        </div>
        <el-button type="primary" @click="handleAdd">
          添加场景
        </el-button>
      </div>

      <SceneTable
        :loading="loading"
        :scenes="filteredScenes"
        @selection-change="handleSelectionChange"
        @edit="handleEdit"
        @topology="handleTopology"
        @delete="handleDelete"
        @batch-delete="handleBatchDelete"
      />

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
import { ref, onMounted, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'
import type { Scene } from '@/types/scene'
import { getSceneList, deleteScene, copyScene, updateScene, createScene } from '@/services/scene'
import TableSkeleton from '@/components/TableSkeleton.vue'
import SceneTable from '@/components/SceneTable/index.vue'
import { useRouter } from 'vue-router'

const loading = ref(false)
const scenes = ref<Scene[]>([])
const selectedRows = ref<Scene[]>([])
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const submitLoading = ref(false)
const formRef = ref<FormInstance>()
const router = useRouter()
const keyword = ref('')

// 添加computed属性用于本地过滤
const filteredScenes = computed(() => {
  const query = keyword.value.trim().toLowerCase()
  if (!query) return scenes.value
  return scenes.value.filter((scene: Scene) => 
    scene.name.toLowerCase().includes(query) ||
    scene.description.toLowerCase().includes(query)
  )
})

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
    const response = await getSceneList()
    scenes.value = response.items.map((item: any) => ({
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

const handleSearch = () => {
  // 不需要调用fetchScenes，因为使用computed属性进行本地过滤
}

const handleSelectionChange = (rows: Scene[]) => {
  selectedRows.value = rows
}

const handleBatchDelete = async (rows: Scene[]) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${rows.length} 个场景吗？`,
      '提示',
      {
        type: 'warning'
      }
    )
    const promises = rows.map(row => deleteScene(row.id))
    await Promise.all(promises)
    ElMessage.success('删除成功')
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
  await formEl.validate(async (valid: boolean) => {
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

const handleTopology = (row: Scene) => {
  router.push(`/scene/${row.id}/topology`)
}

onMounted(() => {
  fetchScenes()
})
</script>

<style lang="scss" scoped>
@import '@/styles/common.scss';

.search-container {
  .search-input {
    width: 300px;
  }
}
</style> 