<template>
  <div class="dashboard">
    <!-- 骨架屏 -->
    <template v-if="loading">
      <el-skeleton :rows="3" animated />
    </template>

    <!-- 实际内容 -->
    <template v-else>
      <!-- 欢迎区域 -->
      <div class="welcome-section">
        <div class="welcome-content">
          <h1>{{ $t('home.welcome') }}</h1>
          <p>{{ $t('home.description') }}</p>
        </div>
        <div class="quick-actions">
          <el-button type="primary" @click="router.push('/scenes/create')">
            <el-icon><Plus /></el-icon>
            {{ $t('home.quickStart.createScene') }}
          </el-button>
          <el-button @click="router.push('/images')">
            <el-icon><Picture /></el-icon>
            {{ $t('home.quickStart.manageImages') }}
          </el-button>
          <el-button @click="router.push('/targets')">
            <el-icon><Aim /></el-icon>
            {{ $t('home.quickStart.manageTargets') }}
          </el-button>
        </div>
      </div>

      <!-- 统计数据卡片 -->
      <el-row :gutter="20" class="mt-20">
        <el-col :xs="24" :sm="12" :md="6">
          <div class="stat-card">
            <div class="stat-icon">
              <el-icon><Picture /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-title">{{ $t('home.statistics.images') }}</div>
              <div class="stat-value">{{ stats.totalImages }}</div>
              <div class="stat-trend">
                <el-icon color="#67C23A"><TrendCharts /></el-icon>
                <span class="trend-value">+{{ imageGrowth }}%</span>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <div class="stat-card">
            <div class="stat-icon">
              <el-icon><Monitor /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-title">{{ $t('home.statistics.instances') }}</div>
              <div class="stat-value">{{ stats.totalInstances }}</div>
              <div class="stat-trend">
                <el-icon color="#409EFF"><TrendCharts /></el-icon>
                <span class="trend-value">+{{ instanceGrowth }}%</span>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <div class="stat-card">
            <div class="stat-icon">
              <el-icon><Aim /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-title">{{ $t('home.statistics.targets') }}</div>
              <div class="stat-value">{{ stats.totalTargets }}</div>
              <div class="stat-trend">
                <el-icon color="#E6A23C"><TrendCharts /></el-icon>
                <span class="trend-value">+{{ targetGrowth }}%</span>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <div class="stat-card">
            <div class="stat-icon">
              <el-icon><Box /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-title">{{ $t('home.statistics.software') }}</div>
              <div class="stat-value">{{ stats.totalSoftware }}</div>
              <div class="stat-trend">
                <el-icon color="#F56C6C"><TrendCharts /></el-icon>
                <span class="trend-value">+{{ softwareGrowth }}%</span>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="20" class="mt-20">
        <!-- 资源使用情况 -->
        <el-col :xs="24" :md="12">
          <el-card class="resource-card" :body-style="{ padding: '20px' }">
            <template #header>
              <div class="card-header">
                <span>{{ $t('home.systemResources.title') }}</span>
                <el-tooltip :content="$t('common.refresh')" placement="top">
                  <el-button circle link @click="refreshResourceUsage">
                    <el-icon><Refresh /></el-icon>
                  </el-button>
                </el-tooltip>
              </div>
            </template>
            <div class="resource-grid">
              <div class="resource-item">
                <div class="resource-info">
                  <span class="resource-label">{{ $t('home.systemResources.cpu') }}</span>
                  <span class="resource-value">{{ stats.resourceUsage.cpuUsage }}%</span>
                </div>
                <el-progress type="circle" 
                  :percentage="stats.resourceUsage.cpuUsage"
                  :color="getProgressColor(stats.resourceUsage.cpuUsage)"
                  :stroke-width="10"
                />
              </div>
              <div class="resource-item">
                <div class="resource-info">
                  <span class="resource-label">{{ $t('home.systemResources.memory') }}</span>
                  <span class="resource-value">{{ stats.resourceUsage.memoryUsage }}%</span>
                </div>
                <el-progress type="circle" 
                  :percentage="stats.resourceUsage.memoryUsage"
                  :color="getProgressColor(stats.resourceUsage.memoryUsage)"
                  :stroke-width="10"
                />
              </div>
              <div class="resource-item">
                <div class="resource-info">
                  <span class="resource-label">{{ $t('home.systemResources.disk') }}</span>
                  <span class="resource-value">{{ stats.resourceUsage.diskUsage }}%</span>
                </div>
                <el-progress type="circle" 
                  :percentage="stats.resourceUsage.diskUsage"
                  :color="getProgressColor(stats.resourceUsage.diskUsage)"
                  :stroke-width="10"
                />
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 最近活动 -->
        <el-col :xs="24" :md="12">
          <el-card class="activity-card" :body-style="{ padding: '0' }">
            <template #header>
              <div class="card-header">
                <span>{{ $t('home.recentActivity.title') }}</span>
                <el-tag v-if="stats.recentActivities.length" type="info" size="small">
                  {{ stats.recentActivities.length }}
                </el-tag>
              </div>
            </template>
            <el-scrollbar height="400px">
              <div class="activity-list" v-if="stats.recentActivities.length">
                <div v-for="activity in stats.recentActivities" 
                  :key="activity.id" 
                  class="activity-item"
                >
                  <div class="activity-icon">
                    <el-icon :class="getActivityIconClass(activity.type)">
                      <component :is="getActivityIcon(activity.type)" />
                    </el-icon>
                  </div>
                  <div class="activity-content">
                    <div class="activity-title">
                      {{ getActivityText(activity.type) }}
                      <span class="activity-name">{{ activity.name }}</span>
                    </div>
                    <div class="activity-time">{{ formatTime(activity.createdAt) }}</div>
                  </div>
                </div>
              </div>
              <el-empty v-else :description="$t('home.recentActivity.noActivity')" />
            </el-scrollbar>
          </el-card>
        </el-col>
      </el-row>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Picture, Monitor, Aim, Box, Plus, Refresh,
  TrendCharts, CircleCheck, CircleClose, Loading
} from '@element-plus/icons-vue'
import { getDashboardStats } from '@/api/dashboard'
import type { DashboardStats } from '@/api/dashboard'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
import 'dayjs/locale/ja'
import 'dayjs/locale/zh-tw'

// 设置dayjs插件和语言
dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

const router = useRouter()
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

// 模拟增长率数据（实际项目中应从后端获取）
const imageGrowth = ref(15)
const instanceGrowth = ref(8)
const targetGrowth = ref(12)
const softwareGrowth = ref(5)

const getProgressColor = (percentage: number) => {
  if (percentage < 60) return '#67C23A'
  if (percentage < 80) return '#E6A23C'
  return '#F56C6C'
}

// 格式化时间为相对时间
const formatTime = (time: string) => {
  return dayjs(time).fromNow()
}

// 获取活动图标
const getActivityIcon = (type: string) => {
  const iconMap: Record<string, any> = {
    'create': CircleCheck,
    'update': Loading,
    'delete': CircleClose
  }
  return iconMap[type.split('_')[0]] || CircleCheck
}

// 获取活动图标样式
const getActivityIconClass = (type: string) => {
  const classMap: Record<string, string> = {
    'create': 'success',
    'update': 'warning',
    'delete': 'danger'
  }
  return classMap[type.split('_')[0]] || 'info'
}

// 获取活动文本
const getActivityText = (type: string) => {
  const textMap: Record<string, string> = {
    'create_scene': '创建了场景',
    'update_scene': '更新了场景',
    'delete_scene': '删除了场景',
    'create_instance': '创建了实例',
    'delete_instance': '删除了实例'
  }
  return textMap[type] || type
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
  fetchDashboardData()
  refreshInterval = window.setInterval(refreshResourceUsage, 5000)
})

onUnmounted(() => {
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
}

.welcome-section {
  background: linear-gradient(135deg, var(--el-color-primary) 0%, var(--el-color-primary-light-3) 100%);
  border-radius: 12px;
  padding: 40px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .welcome-content {
    h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    
    p {
      margin: 10px 0 0;
      opacity: 0.9;
      font-size: 16px;
    }
  }
  
  .quick-actions {
    display: flex;
    gap: 12px;
    
    .el-button {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      
      &:hover {
        background: rgba(255, 255, 255, 0.3);
      }
      
      &.el-button--primary {
        background: white;
        color: var(--el-color-primary);
        
        &:hover {
          background: rgba(255, 255, 255, 0.9);
        }
      }
    }
  }
}

.mt-20 {
  margin-top: 20px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  }
  
  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: var(--el-color-primary-light-9);
    display: flex;
    align-items: center;
    justify-content: center;
    
    .el-icon {
      font-size: 24px;
      color: var(--el-color-primary);
    }
  }
  
  .stat-content {
    flex: 1;
    
    .stat-title {
      color: var(--el-text-color-secondary);
      font-size: 14px;
      margin-bottom: 4px;
    }
    
    .stat-value {
      font-size: 24px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      line-height: 1.2;
    }
    
    .stat-trend {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-top: 8px;
      font-size: 12px;
      
      .trend-value {
        color: #67C23A;
      }
    }
  }
}

.resource-card {
  height: 100%;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    span {
      font-size: 16px;
      font-weight: 500;
    }
  }
  
  .resource-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    
    .resource-item {
      text-align: center;
      
      .resource-info {
        margin-bottom: 12px;
        
        .resource-label {
          display: block;
          color: var(--el-text-color-secondary);
          font-size: 14px;
          margin-bottom: 4px;
        }
        
        .resource-value {
          font-size: 20px;
          font-weight: 600;
          color: var(--el-text-color-primary);
        }
      }
    }
  }
}

.activity-card {
  height: 100%;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    span {
      font-size: 16px;
      font-weight: 500;
    }
  }
  
  .activity-list {
    .activity-item {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 16px 20px;
      border-bottom: 1px solid var(--el-border-color-lighter);
      
      &:last-child {
        border-bottom: none;
      }
      
      .activity-icon {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: var(--el-color-primary-light-9);
        display: flex;
        align-items: center;
        justify-content: center;
        
        .el-icon {
          font-size: 16px;
          
          &.success { color: var(--el-color-success); }
          &.warning { color: var(--el-color-warning); }
          &.danger { color: var(--el-color-danger); }
          &.info { color: var(--el-color-info); }
        }
      }
      
      .activity-content {
        flex: 1;
        
        .activity-title {
          color: var(--el-text-color-primary);
          font-size: 14px;
          
          .activity-name {
            color: var(--el-color-primary);
            margin-left: 4px;
          }
        }
        
        .activity-time {
          color: var(--el-text-color-secondary);
          font-size: 12px;
          margin-top: 4px;
        }
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .dashboard {
    padding: var(--spacing-base);
  }
  
  .welcome-section {
    flex-direction: column;
    gap: 20px;
    text-align: center;
    padding: 24px;
    
    .quick-actions {
      flex-direction: column;
      width: 100%;
      
      .el-button {
        width: 100%;
      }
    }
  }
  
  .resource-card {
    .resource-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style> 