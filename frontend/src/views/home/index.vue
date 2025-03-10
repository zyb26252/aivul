<template>
  <div class="dashboard">
    <!-- 骨架屏 -->
    <template v-if="loading">
      <el-row :gutter="20">
        <!-- 统计数据卡片 -->
        <el-col :span="6" v-for="i in 4" :key="i">
          <el-card class="stat-card">
            <template #header>
              <div class="card-header">
                <el-skeleton-item variant="text" style="width: 100px" />
                <el-skeleton-item variant="text" style="width: 24px" />
              </div>
            </template>
            <el-skeleton-item variant="text" style="width: 60px; margin: 0 auto" />
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" class="mt-20">
        <!-- 资源使用情况 -->
        <el-col :span="12">
          <el-card>
            <template #header>
              <div class="card-header">
                <el-skeleton-item variant="text" style="width: 150px" />
              </div>
            </template>
            <div class="resource-usage">
              <div class="usage-item" v-for="i in 3" :key="i">
                <el-skeleton-item variant="text" style="width: 100px; margin-bottom: 10px" />
                <el-skeleton-item variant="text" style="width: 100%" />
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 最近活动 -->
        <el-col :span="12">
          <el-card>
            <template #header>
              <div class="card-header">
                <el-skeleton-item variant="text" style="width: 100px" />
              </div>
            </template>
            <el-timeline>
              <el-timeline-item v-for="i in 5" :key="i">
                <el-skeleton-item variant="text" style="width: 200px" />
              </el-timeline-item>
            </el-timeline>
          </el-card>
        </el-col>
      </el-row>
    </template>

    <!-- 实际内容 -->
    <template v-else>
      <el-row :gutter="20">
        <!-- 统计数据卡片 -->
        <el-col :span="6">
          <el-card class="stat-card">
            <template #header>
              <div class="card-header">
                <span>镜像总数</span>
                <el-icon><Picture /></el-icon>
              </div>
            </template>
            <div class="card-value">{{ stats.totalImages }}</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <template #header>
              <div class="card-header">
                <span>实例总数</span>
                <el-icon><Monitor /></el-icon>
              </div>
            </template>
            <div class="card-value">{{ stats.totalInstances }}</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <template #header>
              <div class="card-header">
                <span>靶标总数</span>
                <el-icon><Aim /></el-icon>
              </div>
            </template>
            <div class="card-value">{{ stats.totalTargets }}</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <template #header>
              <div class="card-header">
                <span>软件总数</span>
                <el-icon><Box /></el-icon>
              </div>
            </template>
            <div class="card-value">{{ stats.totalSoftware }}</div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" class="mt-20">
        <!-- 资源使用情况 -->
        <el-col :span="12">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>系统资源使用情况</span>
              </div>
            </template>
            <div class="resource-usage">
              <div class="usage-item">
                <span>CPU使用率</span>
                <el-progress 
                  :percentage="stats.resourceUsage.cpuUsage" 
                  :color="getProgressColor(stats.resourceUsage.cpuUsage)"
                />
              </div>
              <div class="usage-item">
                <span>内存使用率</span>
                <el-progress 
                  :percentage="stats.resourceUsage.memoryUsage"
                  :color="getProgressColor(stats.resourceUsage.memoryUsage)"
                />
              </div>
              <div class="usage-item">
                <span>磁盘使用率</span>
                <el-progress 
                  :percentage="stats.resourceUsage.diskUsage"
                  :color="getProgressColor(stats.resourceUsage.diskUsage)"
                />
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 最近活动 -->
        <el-col :span="12">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>最近活动</span>
              </div>
            </template>
            <el-timeline v-if="stats.recentActivities && stats.recentActivities.length > 0">
              <el-timeline-item
                v-for="activity in stats.recentActivities"
                :key="activity.id"
                :timestamp="formatTime(activity.createdAt)"
              >
                {{ activity.type }} - {{ activity.name }}
              </el-timeline-item>
            </el-timeline>
            <div v-else class="no-data">暂无活动记录</div>
          </el-card>
        </el-col>
      </el-row>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Picture, Monitor, Aim, Box } from '@element-plus/icons-vue'
import { getDashboardStats } from '@/api/dashboard'
import type { DashboardStats } from '@/api/dashboard'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

// 设置为中文
dayjs.locale('zh-cn')

const loading = ref(true)
const stats = ref<DashboardStats>({
  totalImages: 0,
  totalInstances: 0,
  totalTargets: 0,
  totalSoftware: 0,
  recentActivities: [],
  resourceUsage: {
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0
  }
})

const getProgressColor = (percentage: number) => {
  if (percentage < 60) return '#67C23A'
  if (percentage < 80) return '#E6A23C'
  return '#F56C6C'
}

// 格式化时间
const formatTime = (time: string) => {
  return dayjs(time).format('YYYY-MM-DD HH:mm')
}

// 获取所有仪表盘数据
const fetchDashboardData = async () => {
  try {
    loading.value = true
    const data = await getDashboardStats()
    stats.value = data
  } catch (error) {
    ElMessage.error('获取仪表盘数据失败')
  } finally {
    loading.value = false
  }
}

// 只刷新资源使用情况
const refreshResourceUsage = async () => {
  try {
    const data = await getDashboardStats()
    stats.value.resourceUsage = data.resourceUsage
  } catch (error) {
    console.error('刷新资源使用情况失败')
  }
}

let refreshInterval: number | null = null

onMounted(() => {
  // 首次加载所有数据
  fetchDashboardData()
  // 每5秒只刷新资源使用情况
  refreshInterval = window.setInterval(() => {
    refreshResourceUsage()
  }, 5000)
})

onUnmounted(() => {
  // 组件卸载时清理定时器
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<style lang="scss" scoped>
.dashboard {
  padding: var(--spacing-large);
  background: var(--bg-color);
  min-height: calc(100vh - 60px);
  
  .el-row {
    margin-bottom: var(--spacing-large);
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}

.stat-card {
  background: #FFFFFF;
  border-radius: var(--border-radius-base);
  transition: var(--transition-base);
  height: 108px;
  border: 1px solid var(--border-light);
  
  &:hover {
    box-shadow: var(--shadow-base);
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    border-bottom: 1px solid var(--border-light);
    
    span {
      font-size: 14px;
      color: var(--text-regular);
    }
    
    .el-icon {
      font-size: 16px;
      color: var(--text-secondary);
    }
  }
  
  .card-value {
    font-size: 30px;
    font-weight: 600;
    color: var(--text-primary);
    text-align: center;
    padding: 16px;
  }
}

.resource-usage {
  padding: 24px;
  
  .usage-item {
    margin-bottom: 24px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    span {
      display: block;
      margin-bottom: 8px;
      color: var(--text-regular);
      font-size: 14px;
    }
    
    .el-progress {
      margin-top: 4px;
      
      :deep(.el-progress-bar__outer) {
        background-color: var(--bg-light);
        border-radius: 4px;
      }
      
      :deep(.el-progress-bar__inner) {
        border-radius: 4px;
        transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
      }
    }
  }
}

.el-card {
  border: 1px solid var(--border-light);
  transition: var(--transition-base);
  margin-bottom: var(--spacing-large);
  background: #FFFFFF;
  
  &:hover {
    box-shadow: var(--shadow-base);
  }
  
  :deep(.el-card__header) {
    padding: 16px 24px;
    border-bottom: 1px solid var(--border-light);
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      span {
        font-size: 16px;
        color: var(--text-primary);
        font-weight: 500;
      }
    }
  }
}

.el-timeline {
  padding: 24px;
  
  .el-timeline-item {
    padding-bottom: 20px;
    
    &:last-child {
      padding-bottom: 0;
    }
    
    :deep(.el-timeline-item__wrapper) {
      padding-left: 16px;
      
      .el-timeline-item__timestamp {
        color: var(--text-secondary);
        font-size: 12px;
        line-height: 20px;
        margin-bottom: 4px;
      }
      
      .el-timeline-item__content {
        color: var(--text-regular);
        font-size: 14px;
        line-height: 22px;
      }
    }
    
    :deep(.el-timeline-item__tail) {
      border-left: 2px solid var(--border-light);
    }
  }
}

:deep(.el-timeline-item__node) {
  background-color: var(--primary-color);
  width: 8px;
  height: 8px;
}

:deep(.el-timeline-item__node--normal) {
  width: 8px;
  height: 8px;
}

// 骨架屏样式
.el-skeleton {
  padding: 24px;
}

.mt-20 {
  margin-top: 20px;
}

// 响应式布局
@media screen and (max-width: 768px) {
  .dashboard {
    padding: var(--spacing-base);
  }
  
  .stat-card {
    height: auto;
    margin-bottom: var(--spacing-base);
    
    .card-value {
      font-size: 24px;
      padding: 12px;
    }
  }
  
  .el-row {
    margin-left: 0 !important;
    margin-right: 0 !important;
  }
  
  .el-col {
    padding-left: 0 !important;
    padding-right: 0 !important;
  }
  
  .resource-usage,
  .el-timeline {
    padding: 16px;
  }
}
</style> 