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
                <div class="chart-container" ref="cpuChartRef"></div>
              </div>
              <div class="resource-item">
                <div class="resource-info">
                  <span class="resource-label">{{ $t('home.systemResources.memory') }}</span>
                  <span class="resource-value">{{ stats.resourceUsage.memoryUsage }}%</span>
                </div>
                <div class="chart-container" ref="memoryChartRef"></div>
              </div>
              <div class="resource-item">
                <div class="resource-info">
                  <span class="resource-label">{{ $t('home.systemResources.disk') }}</span>
                  <span class="resource-value">{{ stats.resourceUsage.diskUsage }}%</span>
                </div>
                <div class="chart-container" ref="diskChartRef"></div>
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
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
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
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'

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

// 图表相关
const MAX_DATA_POINTS = 30 // 保留30个数据点
const cpuChartRef = ref<HTMLElement | null>(null)
const memoryChartRef = ref<HTMLElement | null>(null)
const diskChartRef = ref<HTMLElement | null>(null)
let cpuChart: echarts.ECharts | null = null
let memoryChart: echarts.ECharts | null = null
let diskChart: echarts.ECharts | null = null

// 历史数据
const cpuData = ref<number[]>([])
const memoryData = ref<number[]>([])
const diskData = ref<number[]>([])
const timeData = ref<string[]>([])

// 初始化图表
const initChart = (
  el: HTMLElement,
  data: number[],
  name: string,
  color: string
): echarts.ECharts => {
  const chart = echarts.init(el)
  const option: EChartsOption = {
    grid: {
      top: 15,      // 减小顶部空间
      right: 20,
      bottom: 30,   // 减小底部空间
      left: 55,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: timeData.value,
      axisLabel: {
        show: true,
        color: 'var(--el-text-color-secondary)',
        fontSize: 12,
        interval: Math.floor(MAX_DATA_POINTS / 6),
        formatter: (value: string) => value,
        rotate: 45
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: 'var(--el-border-color-lighter)'
        }
      },
      axisTick: {
        show: true,
        alignWithLabel: true,
        interval: Math.floor(MAX_DATA_POINTS / 6),
        lineStyle: {
          color: 'var(--el-border-color-lighter)'
        }
      }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      splitNumber: 5,    // 增加分割线数量
      interval: 20,      // 固定间隔为20
      axisLabel: {
        formatter: '{value}%',
        color: 'var(--el-text-color-secondary)',
        fontSize: 12,
        margin: 16,      // 增加标签与轴的距离
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: 'var(--el-border-color-lighter)',
          type: 'dashed',
          width: 1
        }
      }
    },
    series: [{
      name: name,
      type: 'line',
      data: data,
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      showSymbol: true,
      emphasis: {
        scale: true,
        focus: 'series',
        itemStyle: {
          borderWidth: 2
        }
      },
      lineStyle: {
        color: color,
        width: 3,
        shadowColor: 'rgba(0, 0, 0, 0.2)',
        shadowBlur: 10
      },
      itemStyle: {
        color: color,
        borderWidth: 2,
        borderColor: '#fff'
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: color.replace('1)', '0.2)')
          },
          {
            offset: 1,
            color: color.replace('1)', '0.02)')
          }
        ])
      }
    }],
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const data = params[0]
        return `${data.name}<br/>${data.value}%`
      },
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: 'var(--el-border-color-lighter)',
      textStyle: {
        color: 'var(--el-text-color-primary)'
      },
      extraCssText: 'box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);'
    },
    animation: true
  }
  chart.setOption(option)
  return chart
}

// 更新图表数据
const updateChartData = (
  chart: echarts.ECharts | null,
  data: number[],
  value: number
) => {
  if (!chart) return

  const now = dayjs().format('HH:mm:ss')  // 改为时:分:秒格式
  
  // 更新数据数组
  data.push(value)
  if (data.length > MAX_DATA_POINTS) {
    data.shift()
  }
  
  // 更新时间数组
  timeData.value.push(now)
  if (timeData.value.length > MAX_DATA_POINTS) {
    timeData.value.shift()
  }

  // 重新设置图表选项
  chart.setOption({
    xAxis: {
      data: timeData.value
    },
    series: [{
      data: data
    }]
  })
}

// 初始化所有图表
const initCharts = () => {
  // 销毁现有图表
  cpuChart?.dispose()
  memoryChart?.dispose()
  diskChart?.dispose()

  // 重新初始化图表
  if (cpuChartRef.value) {
    cpuChart = initChart(
      cpuChartRef.value,
      cpuData.value,
      'CPU',
      'rgba(64, 158, 255, 1)'
    )
  }
  if (memoryChartRef.value) {
    memoryChart = initChart(
      memoryChartRef.value,
      memoryData.value,
      'Memory',
      'rgba(103, 194, 58, 1)'
    )
  }
  if (diskChartRef.value) {
    diskChart = initChart(
      diskChartRef.value,
      diskData.value,
      'Disk',
      'rgba(230, 162, 60, 1)'
    )
  }
}

// 更新所有图表
const updateCharts = () => {
  updateChartData(cpuChart, cpuData.value, stats.value.resourceUsage.cpuUsage)
  updateChartData(memoryChart, memoryData.value, stats.value.resourceUsage.memoryUsage)
  updateChartData(diskChart, diskData.value, stats.value.resourceUsage.diskUsage)
}

// 处理窗口大小变化
const handleResize = () => {
  cpuChart?.resize()
  memoryChart?.resize()
  diskChart?.resize()
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

// 格式化时间为相对时间
const formatTime = (time: string) => {
  return dayjs(time).fromNow()
}

// 获取所有仪表盘数据
const fetchDashboardData = async () => {
  try {
    loading.value = true
    const data = await getDashboardStats()
    stats.value = data
    
    // 初始化数据数组
    const now = dayjs().format('HH:mm:ss')  // 改为时:分:秒格式
    cpuData.value = [data.resourceUsage.cpuUsage]
    memoryData.value = [data.resourceUsage.memoryUsage]
    diskData.value = [data.resourceUsage.diskUsage]
    timeData.value = [now]
    
    // 等待 DOM 更新后初始化图表
    await nextTick()
    initCharts()
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
    
    // 确保图表存在
    if (!cpuChart || !memoryChart || !diskChart) {
      await nextTick()
      initCharts()
    } else {
      updateCharts()
    }
  } catch (error) {
    console.error('刷新资源使用情况失败')
  }
}

let refreshInterval: number | null = null

onMounted(async () => {
  await fetchDashboardData()
  refreshInterval = window.setInterval(refreshResourceUsage, 5000)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
  window.removeEventListener('resize', handleResize)
  cpuChart?.dispose()
  memoryChart?.dispose()
  diskChart?.dispose()
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

  // 修复 el-col 的边距问题
  :deep(.el-col) {
    margin-bottom: 0;
    padding-bottom: 0;
  }

  .el-card {
    height: 100%;
    margin-bottom: 0;
    border-radius: 12px;  // 添加圆角
    overflow: hidden;     // 确保内容不会溢出圆角

    :deep(.el-card__body) {
      height: 100%;      // 确保内容区域填充满整个卡片
    }
  }
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
  margin-bottom: 0;
  border-radius: 12px;  // 添加圆角
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 12px;  // 减小头部与内容的间距
    
    span {
      font-size: 16px;
      font-weight: 500;
    }
  }
  
  .resource-grid {
    display: flex;
    flex-direction: column;
    gap: 16px;    // 减小卡片之间的间距
    
    .resource-item {
      text-align: left;
      background: var(--el-bg-color-page);
      border-radius: 8px;
      padding: 16px;    // 减小内边距
      
      .resource-info {
        margin-bottom: 12px;   // 减小信息与图表的间距
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .resource-label {
          color: var(--el-text-color-secondary);
          font-size: 14px;
        }
        
        .resource-value {
          font-size: 20px;
          font-weight: 600;
          color: var(--el-text-color-primary);
        }
      }

      .chart-container {
        height: 180px;    // 调整图表高度
        width: 100%;
      }
    }
  }
}

.activity-card {
  height: 100%;
  margin-bottom: 0;
  border-radius: 12px;  // 添加圆角
  
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
      gap: 16px;
      
      .resource-item {
        .chart-container {
          height: 200px;    // 保持移动端的图表高度一致
        }
      }
    }
  }
}
</style> 