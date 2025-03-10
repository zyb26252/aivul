<template>
  <div class="page-container">
    <TableSkeleton v-if="loading" />
    <template v-else>
      <div class="page-header">
        <div class="header-left">
          <h2 class="page-title">{{ $t('scene.title') }}</h2>
          <div class="search-container">
            <el-input
              v-model="keyword"
              :placeholder="$t('scene.searchPlaceholder')"
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
          <el-icon><Plus /></el-icon>{{ $t('scene.addButton') }}
        </el-button>
      </div>

      <div class="main-content">
        <el-card class="table-card">
          <SceneTable
            :loading="loading"
            :scenes="filteredScenes"
            @selection-change="handleSelectionChange"
            @edit="handleEdit"
            @topology="handleTopology"
            @delete="handleDelete"
            @batch-delete="handleBatchDelete"
          />
        </el-card>
      </div>

      <!-- 添加/编辑对话框 -->
      <el-dialog
        v-model="dialogVisible"
        :title="$t(dialogType === 'add' ? 'scene.form.addTitle' : 'scene.form.editTitle')"
        width="600px"
        destroy-on-close
      >
        <el-form
          ref="formRef"
          :model="formData"
          :rules="rules"
          label-width="100px"
          class="dialog-form"
        >
          <el-form-item :label="$t('scene.form.name')" prop="name">
            <el-input v-model="formData.name" :placeholder="$t('scene.form.namePlaceholder')" />
          </el-form-item>
          <el-form-item :label="$t('scene.form.description')" prop="description">
            <el-input
              v-model="formData.description"
              type="textarea"
              :rows="4"
              :placeholder="$t('scene.form.descriptionPlaceholder')"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
            <el-button type="primary" :loading="submitLoading" @click="handleSubmit(formRef)">
              {{ $t('common.confirm') }}
            </el-button>
          </div>
        </template>
      </el-dialog>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'
import type { Scene } from '@/types/scene'
import { getScenes, deleteScene, copyScene, updateScene, createScene } from '@/api/scene'
import TableSkeleton from '@/components/TableSkeleton.vue'
import SceneTable from '@/components/SceneTable/index.vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

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
    { required: true, message: t('scene.form.namePlaceholder'), trigger: 'blur' },
    { min: 2, max: 50, message: t('common.lengthLimit', { min: 2, max: 50 }), trigger: 'blur' }
  ],
  description: [
    { required: true, message: t('scene.form.descriptionPlaceholder'), trigger: 'blur' }
  ]
}

const fetchScenes = async () => {
  try {
    loading.value = true
    const response = await getScenes()
    scenes.value = response.items.map((item: any) => ({
      ...item,
      nodeCount: item.node_count,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }))
  } catch (error) {
    console.error('Error fetching scenes:', error)
    ElMessage.error(t('scene.messages.loadFailed'))
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
      t('scene.messages.batchDeleteConfirm', { count: rows.length }),
      t('common.tips'),
      {
        type: 'warning'
      }
    )
    const promises = rows.map(row => deleteScene(row.id))
    await Promise.all(promises)
    ElMessage.success(t('scene.messages.deleteSuccess'))
    await fetchScenes()
  } catch (error) {
    // 用户取消删除或删除失败
  }
}

const handleDelete = async (row: Scene) => {
  try {
    await ElMessageBox.confirm(t('scene.messages.deleteConfirm'), t('common.tips'), {
      type: 'warning'
    })
    await deleteScene(row.id)
    ElMessage.success(t('scene.messages.deleteSuccess'))
    await fetchScenes()
  } catch (error) {
    // 用户取消删除或删除失败
  }
}

const handleCopy = async (id: number) => {
  try {
    await copyScene(id)
    ElMessage.success(t('scene.messages.copySuccess'))
    await fetchScenes()
  } catch (error) {
    console.error('Error copying scene:', error)
    ElMessage.error(t('scene.messages.copyFailed'))
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
          ElMessage.success(t('scene.messages.addSuccess'))
        } else {
          await updateScene(formData.id, {
            name: formData.name,
            description: formData.description
          })
          ElMessage.success(t('scene.messages.updateSuccess'))
        }
        dialogVisible.value = false
        await fetchScenes()
      } catch (error) {
        console.error('Error saving scene:', error)
        ElMessage.error(t('scene.messages.saveFailed'))
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
.page-container {
  padding: var(--spacing-large);
  background: var(--bg-color);
  min-height: calc(100vh - 60px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-large);
  
  .header-left {
    display: flex;
    align-items: center;
    gap: var(--spacing-large);
    
    .page-title {
      margin: 0;
      font-size: 20px;
      font-weight: 500;
      color: var(--text-primary);
    }
    
    .search-container {
      display: flex;
      gap: var(--spacing-base);
      
      .search-input {
        width: 320px;
      }
    }
  }
  
  .el-button {
    .el-icon {
      margin-right: 4px;
    }
  }
}

.main-content {
  background: var(--bg-lighter);
  border-radius: var(--border-radius-base);
  
  .table-card {
    background: transparent;
    border: none;
    
    :deep(.el-card__body) {
      padding: 0;
    }
  }
}

.dialog-form {
  padding: var(--spacing-large) var(--spacing-huge);
  
  .el-form-item {
    margin-bottom: var(--spacing-large);
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-base);
}

// 响应式布局
@media screen and (max-width: 768px) {
  .page-container {
    padding: var(--spacing-base);
  }
  
  .page-header {
    flex-direction: column;
    gap: var(--spacing-base);
    
    .header-left {
      flex-direction: column;
      align-items: stretch;
      width: 100%;
      
      .search-container {
        flex-direction: column;
        
        .search-input {
          width: 100%;
        }
      }
    }
  }
  
  .dialog-form {
    padding: var(--spacing-base);
  }
}
</style> 