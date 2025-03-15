<template>
  <div class="page-container">
    <TableSkeleton v-if="loading" />
    <template v-else>
      <div class="page-header">
        <div class="header-left">
          <h2 class="page-title">{{ $t('menu.images') }}</h2>
          <div class="search-container">
            <el-input
              v-model="searchQuery"
              :placeholder="$t('images.searchPlaceholder')"
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
              :placeholder="$t('images.selectArchitecture')"
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
          <el-icon><Plus /></el-icon>{{ $t('images.addButton') }}
        </el-button>
      </div>

      <div class="main-content">
        <el-card class="table-card">
          <el-table
            v-loading="loading"
            :data="images"
            style="width: 100%"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="name" :label="$t('table.name')" min-width="150">
              <template #default="{ row }">
                <div class="name-column">
                  <span class="name">{{ row.name }}</span>
                  <el-tag size="small" type="info" v-if="row.version">v{{ row.version }}</el-tag>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="registry_path" :label="$t('table.registryPath')" min-width="200" show-overflow-tooltip />
            <el-table-column prop="architecture" :label="$t('table.architecture')" width="100">
              <template #default="{ row }">
                <el-tag size="small" :type="row.architecture === 'x86' ? 'success' : 'warning'">
                  {{ row.architecture }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="description" :label="$t('table.description')" min-width="200" show-overflow-tooltip />
            <el-table-column prop="created_at" :label="$t('table.createdAt')" width="180">
              <template #default="{ row }">
                {{ new Date(row.created_at).toLocaleString() }}
              </template>
            </el-table-column>
            <el-table-column :label="$t('table.operation')" width="150" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link @click="handleEdit(row)">
                  {{ $t('common.edit') }}
                </el-button>
                <el-button type="danger" link @click="handleDelete(row)">
                  {{ $t('common.delete') }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination-container">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="totalCount"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>

          <div v-if="selectedRows.length > 0" class="batch-operation">
            <span class="selected-count">{{ $t('common.selected') }} {{ selectedRows.length }} {{ $t('common.items') }}</span>
            <el-button type="danger" @click="handleBatchDelete">
              <el-icon><Delete /></el-icon>{{ $t('common.batchDelete') }}
            </el-button>
          </div>
        </el-card>
      </div>

      <!-- 添加/编辑对话框 -->
      <el-dialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? $t('images.form.addTitle') : $t('images.form.editTitle')"
        width="600px"
        destroy-on-close
      >
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="100px"
          class="dialog-form"
        >
          <el-form-item :label="$t('images.form.name')" prop="name">
            <el-input v-model="form.name" :placeholder="$t('images.form.namePlaceholder')" />
          </el-form-item>
          <el-form-item :label="$t('images.form.registryPath')" prop="registry_path">
            <el-input v-model="form.registry_path" :placeholder="$t('images.form.registryPathPlaceholder')" />
          </el-form-item>
          <el-form-item :label="$t('images.form.architecture')" prop="architecture">
            <el-select v-model="form.architecture" :placeholder="$t('images.form.architecturePlaceholder')" class="full-width">
              <el-option label="x86" value="x86" />
              <el-option label="arm" value="arm" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('images.form.version')" prop="version">
            <el-input v-model="form.version" :placeholder="$t('images.form.versionPlaceholder')" />
          </el-form-item>
          <el-form-item :label="$t('images.form.description')" prop="description">
            <el-input
              v-model="form.description"
              type="textarea"
              :rows="4"
              :placeholder="$t('images.form.descriptionPlaceholder')"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
            <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
              {{ $t('common.confirm') }}
            </el-button>
          </div>
        </template>
      </el-dialog>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Delete } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'
import { getImages, createImage, updateImage, deleteImage } from '@/api/image'
import type { Image } from '@/types/image'
import TableSkeleton from '@/components/TableSkeleton.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const loading = ref(false)
const images = ref<Image[]>([])
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const submitLoading = ref(false)
const formRef = ref<FormInstance>()
const searchQuery = ref('')
const selectedArchitecture = ref('')
const selectedRows = ref<Image[]>([])

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const totalCount = ref(0)
const hasNextPage = ref(false)

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
    { required: true, message: t('images.form.namePlaceholder'), trigger: 'blur' },
    { min: 2, max: 50, message: t('common.lengthLimit', { min: 2, max: 50 }), trigger: 'blur' }
  ],
  registry_path: [
    { required: true, message: t('images.form.registryPathPlaceholder'), trigger: 'blur' }
  ],
  architecture: [
    { required: true, message: t('images.form.architecturePlaceholder'), trigger: 'change' }
  ],
  version: [
    { required: true, message: t('images.form.versionPlaceholder'), trigger: 'blur' }
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
    
    // 添加分页参数
    params.append('skip', ((currentPage.value - 1) * pageSize.value).toString())
    params.append('limit', (pageSize.value + 1).toString()) // 多请求一条数据，用于判断是否有下一页
    
    const response = await getImages(params)
    
    // 判断是否有下一页
    hasNextPage.value = response.length > pageSize.value
    
    // 如果返回的数据超过了页大小，则截取前pageSize条数据
    images.value = hasNextPage.value ? response.slice(0, pageSize.value) : response
    
    // 计算总数
    // 如果当前页是第一页，且返回的数据量小于页大小，则总数就是返回的数据量
    if (currentPage.value === 1 && response.length < pageSize.value + 1) {
      totalCount.value = response.length
    } 
    // 如果有下一页，则总数至少是当前页的数据加上下一页的一条数据
    else if (hasNextPage.value) {
      totalCount.value = Math.max(totalCount.value, currentPage.value * pageSize.value + 1)
    } 
    // 如果没有下一页，且不是第一页，则总数是前面所有页的数据量加上当前页的数据量
    else if (!hasNextPage.value && currentPage.value > 1) {
      totalCount.value = (currentPage.value - 1) * pageSize.value + response.length
    }
    
    // 如果当前页没有数据，但不是第一页，回到上一页
    if (response.length === 0 && currentPage.value > 1) {
      currentPage.value--
      await fetchImages()
    }
  } finally {
    loading.value = false
  }
}

// 处理页大小变化
const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1 // 重置到第一页
  fetchImages()
}

// 处理页码变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchImages()
}

// 处理搜索和筛选
const handleSearch = () => {
  currentPage.value = 1 // 重置到第一页
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
  form.value = { 
    id: row.id,
    name: row.name,
    registry_path: row.registry_path,
    architecture: row.architecture,
    version: row.version,
    description: row.description || ''  // 确保description不为undefined
  }
  dialogVisible.value = true
}

// 删除镜像
const handleDelete = async (row: Image) => {
  try {
    await ElMessageBox.confirm(t('images.messages.deleteConfirm'), t('common.tips'), {
      type: 'warning'
    })
    await deleteImage(row.id)
    ElMessage.success(t('images.messages.deleteSuccess'))
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
          ElMessage.success(t('images.messages.addSuccess'))
        } else {
          await updateImage(form.value.id, form.value)
          ElMessage.success(t('images.messages.updateSuccess'))
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
      t('images.messages.batchDeleteConfirm', { count: selectedRows.value.length }), 
      t('common.batchDeleteConfirm'), 
      {
        type: 'warning',
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel')
      }
    )
    
    loading.value = true
    try {
      await Promise.all(selectedRows.value.map(row => deleteImage(row.id)))
      ElMessage.success(t('images.messages.batchDeleteSuccess'))
      await fetchImages()
      selectedRows.value = []
    } catch (error) {
      ElMessage.error(t('images.messages.batchDeleteError'))
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
      
      .architecture-select {
        width: 120px;
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

.el-table {
  --el-table-border-color: var(--border-light);
  --el-table-header-bg-color: var(--bg-light);
  --el-table-row-hover-bg-color: var(--primary-light);
  
  .name-column {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .name {
      color: var(--text-primary);
      font-weight: 500;
    }
  }
}

.batch-operation {
  display: flex;
  align-items: center;
  gap: var(--spacing-base);
  margin-top: var(--spacing-base);
  padding: var(--spacing-base);
  background: var(--bg-light);
  border-radius: var(--border-radius-base);
  
  .selected-count {
    color: var(--text-secondary);
    font-size: 14px;
  }
  
  .el-button {
    .el-icon {
      margin-right: 4px;
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
  
  .full-width {
    width: 100%;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-base);
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
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
        
        .search-input,
        .architecture-select {
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