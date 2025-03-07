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

      <el-table
        :data="data"
        v-loading="loading"
        style="width: 100%"
      >
        <el-table-column prop="name" label="场景名称" min-width="150" />
        <el-table-column prop="description" label="场景描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="nodeCount" label="节点数量" width="100" align="center" />
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ new Date(row.createdAt).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleCopy(row.id)">
              复制
            </el-button>
            <el-button type="primary" link @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="danger" link @click="handleDelete(row.id)">
              删除
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
import { getSceneList, deleteScene, copyScene } from '@/services/scene'
import TableSkeleton from '@/components/TableSkeleton.vue'

const loading = ref(false)
const keyword = ref('')
const total = ref(0)
const current = ref(1)
const pageSize = ref(10)
const data = ref<Scene[]>([])

const fetchScenes = async () => {
  try {
    loading.value = true
    const res = await getSceneList({
      keyword: keyword.value,
      page: current.value,
      pageSize: pageSize.value,
    })
    data.value = res.items
    total.value = res.total
  } catch (error) {
    ElMessage.error('获取场景列表失败')
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
  ElMessageBox.confirm('确定要删除这个场景吗？', '提示', {
    type: 'warning',
  }).then(async () => {
    try {
      await deleteScene(id)
      ElMessage.success('删除成功')
      fetchScenes()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

const handleCopy = async (id: string) => {
  try {
    await copyScene(id)
    ElMessage.success('复制成功')
    fetchScenes()
  } catch (error) {
    ElMessage.error('复制失败')
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