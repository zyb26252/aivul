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
          {{ $t('scene.addButton') }}
        </el-button>
      </div>

      <el-table
        :data="data"
        v-loading="loading"
        style="width: 100%"
      >
        <el-table-column prop="name" :label="$t('table.name')" min-width="150" />
        <el-table-column prop="description" :label="$t('table.description')" min-width="200" show-overflow-tooltip />
        <el-table-column prop="nodeCount" :label="$t('table.nodeCount')" width="100" align="center" />
        <el-table-column prop="createdAt" :label="$t('table.createdAt')" width="180">
          <template #default="{ row }">
            {{ new Date(row.createdAt).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('table.operation')" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleCopy(row.id)">
              {{ $t('common.copy') }}
            </el-button>
            <el-button type="primary" link @click="handleEdit(row)">
              {{ $t('common.edit') }}
            </el-button>
            <el-button type="danger" link @click="handleDelete(row.id)">
              {{ $t('common.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="current"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Scene } from '@/types/scene'
import { getScenes, deleteScene, copyScene } from '@/api/scene'
import TableSkeleton from '@/components/TableSkeleton.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const loading = ref(false)
const keyword = ref('')
const total = ref(0)
const current = ref(1)
const pageSize = ref(10)
const data = ref<Scene[]>([])

const fetchScenes = async () => {
  try {
    loading.value = true
    const res = await getScenes({
      keyword: keyword.value,
      page: current.value,
      pageSize: pageSize.value,
    })
    data.value = res.items
    total.value = res.total
  } catch (error) {
    ElMessage.error(t('scene.messages.loadFailed'))
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  current.value = 1
  fetchScenes()
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  fetchScenes()
}

const handleCurrentChange = (val: number) => {
  current.value = val
  fetchScenes()
}

const handleDelete = (id: string) => {
  ElMessageBox.confirm(t('scene.messages.deleteConfirm'), t('common.tips'), {
    type: 'warning',
  }).then(async () => {
    try {
      await deleteScene(id)
      ElMessage.success(t('scene.messages.deleteSuccess'))
      fetchScenes()
    } catch (error) {
      ElMessage.error(t('scene.messages.deleteFailed'))
    }
  })
}

const handleCopy = async (id: string) => {
  try {
    await copyScene(id)
    ElMessage.success(t('scene.messages.copySuccess'))
    fetchScenes()
  } catch (error) {
    ElMessage.error(t('scene.messages.copyFailed'))
  }
}

const handleEdit = (row: Scene) => {
  // TODO: 实现编辑功能
  console.log('编辑场景:', row)
}

const handleAdd = () => {
  // TODO: 实现添加功能
  console.log('添加场景')
}

onMounted(() => {
  fetchScenes()
})
</script>

<style lang="scss" scoped>
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 