<template>
  <div class="dashboard">
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
          <el-timeline>
            <el-timeline-item
              v-for="activity in stats.recentActivities"
              :key="activity.id"
              :timestamp="activity.createdAt"
            >
              {{ activity.type }} - {{ activity.name }}
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Picture, Monitor, Aim, Box } from '@element-plus/icons-vue'
import { getDashboardStats } from '@/api/dashboard'
import type { DashboardStats } from '@/api/dashboard'
import { ElMessage } from 'element-plus'

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

const fetchDashboardData = async () => {
  try {
    const data = await getDashboardStats()
    stats.value = data
  } catch (error) {
    ElMessage.error('获取仪表盘数据失败')
  }
}

let refreshInterval: number | null = null

onMounted(() => {
  fetchDashboardData()
  // 每5秒刷新一次数据
  refreshInterval = window.setInterval(() => {
    fetchDashboardData()
  }, 5000)
})

onUnmounted(() => {
  // 组件卸载时清理定时器
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.mt-20 {
  margin-top: 20px;
}

.stat-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .card-value {
    font-size: 28px;
    font-weight: bold;
    color: #409EFF;
    text-align: center;
    margin-top: 10px;
  }
}

.resource-usage {
  .usage-item {
    margin-bottom: 20px;

    &:last-child {
      margin-bottom: 0;
    }

    span {
      display: block;
      margin-bottom: 5px;
      color: #606266;
    }
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  span {
    font-size: 16px;
    font-weight: bold;
  }
}
</style> 