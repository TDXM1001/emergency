<template>
  <div class="emergency-dispatch">
    <!-- 顶部标题栏 -->
    <header class="dispatch-header">
      <div class="header-left">
        <el-icon class="header-icon"><Monitor /></el-icon>
        <h1 class="header-title">应急调度指挥中心</h1>
      </div>
      <div class="header-center">
        <div class="current-time">{{ currentTime }}</div>
      </div>
      <div class="header-right">
        <el-badge :value="alertCount" class="alert-badge">
          <el-icon class="alert-icon"><Bell /></el-icon>
        </el-badge>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="dispatch-main">
      <!-- 左侧面板 -->
      <aside class="left-panel">
        <div class="panel-section">
          <h3 class="section-title">事件概览</h3>
          <div class="event-overview">
            <div class="overview-item">
              <div class="item-value">{{ eventStats.total }}</div>
              <div class="item-label">总事件数</div>
            </div>
            <div class="overview-item">
              <div class="item-value critical">{{ eventStats.critical }}</div>
              <div class="item-label">紧急事件</div>
            </div>
            <div class="overview-item">
              <div class="item-value processing">{{ eventStats.processing }}</div>
              <div class="item-label">处理中</div>
            </div>
          </div>
        </div>

        <div class="panel-section">
          <h3 class="section-title">资源状态</h3>
          <div class="resource-status">
            <div class="status-item">
              <el-progress 
                :percentage="resourceStats.available" 
                :color="'#67C23A'"
                :show-text="false"
              />
              <span class="status-label">可用资源: {{ resourceStats.available }}%</span>
            </div>
            <div class="status-item">
              <el-progress 
                :percentage="resourceStats.busy" 
                :color="'#E6A23C'"
                :show-text="false"
              />
              <span class="status-label">忙碌资源: {{ resourceStats.busy }}%</span>
            </div>
          </div>
        </div>
      </aside>

      <!-- 中央地图区域 -->
      <section class="map-container">
        <MapContainer
          ref="mapContainerRef"
          :events="recentEvents"
          :resources="availableResources"
          :center="mapCenter"
          :zoom="mapZoom"
          :show-legend="true"
          :show-stats="true"
          :auto-fit="false"
          @map-ready="handleMapReady"
          @marker-click="handleMarkerClick"
          @map-click="handleMapClick"
          @zoom-change="handleZoomChange"
          @center-change="handleCenterChange"
        />
      </section>

      <!-- 右侧面板 -->
      <aside class="right-panel">
        <div class="panel-section">
          <h3 class="section-title">实时事件</h3>
          <div class="event-list">
            <div 
              v-for="event in recentEvents" 
              :key="event.id"
              class="event-item"
              :class="event.severity"
            >
              <div class="event-time">{{ formatTime(event.createdAt) }}</div>
              <div class="event-title">{{ event.title }}</div>
              <div class="event-location">{{ event.location.address }}</div>
            </div>
          </div>
        </div>

        <div class="panel-section">
          <h3 class="section-title">通信状态</h3>
          <div class="communication-status">
            <div class="comm-item">
              <el-icon class="comm-icon online"><VideoCamera /></el-icon>
              <span>视频监控: 在线</span>
            </div>
            <div class="comm-item">
              <el-icon class="comm-icon online"><Message /></el-icon>
              <span>通信系统: 正常</span>
            </div>
            <div class="comm-item">
              <el-icon class="comm-icon online"><Connection /></el-icon>
              <span>网络连接: 稳定</span>
            </div>
          </div>
        </div>
      </aside>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { Monitor, Bell, VideoCamera, Message, Connection } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import MapContainer from '@/components/EmergencyDispatch/MapContainer.vue'
import { useEmergencyStore } from '@/stores/modules/emergency'
import { useMapStore } from '@/stores/modules/map'
import { mockEvents, mockResources } from '@/assets/mock/emergency'
import type { AMapInstance } from '@/utils/mapUtils'
import type { EmergencyEvent, EmergencyResource } from '@/types/emergency'

// 状态管理
const emergencyStore = useEmergencyStore()
const mapStore = useMapStore()

// 响应式数据
const currentTime = ref('')
const alertCount = ref(3)
const mapContainerRef = ref<InstanceType<typeof MapContainer>>()

// 地图配置
const mapCenter = ref<[number, number]>([116.397428, 39.90923])
const mapZoom = ref(11)

// 计算属性
const eventStats = computed(() => emergencyStore.eventStats)
const resourceStats = computed(() => emergencyStore.resourceStats)
const recentEvents = computed(() => emergencyStore.recentEvents)
const availableResources = computed(() => emergencyStore.availableResources)

// 时间更新定时器
let timeInterval: NodeJS.Timeout

// 更新当前时间
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 地图事件处理
const handleMapReady = (mapInstance: AMapInstance) => {
  console.log('地图初始化完成')
  mapStore.setMapInstance(mapInstance)
  ElMessage.success('地图加载完成')
}

const handleMarkerClick = (data: EmergencyEvent | EmergencyResource, type: 'event' | 'resource') => {
  console.log('标注点击:', type, data)
  
  if (type === 'event') {
    emergencyStore.setCurrentEvent(data as EmergencyEvent)
    ElMessage.info(`选中事件: ${data.title || (data as EmergencyEvent).title}`)
  } else {
    emergencyStore.setCurrentResource(data as EmergencyResource)
    ElMessage.info(`选中资源: ${(data as EmergencyResource).name}`)
  }
}

const handleMapClick = (position: [number, number]) => {
  console.log('地图点击位置:', position)
  // 可以在此处添加新事件或资源的逻辑
}

const handleZoomChange = (zoom: number) => {
  mapZoom.value = zoom
  mapStore.updateConfig({ zoom })
}

const handleCenterChange = (center: [number, number]) => {
  mapCenter.value = center
  mapStore.updateConfig({ center })
}

// 格式化时间
const formatTime = (date: Date) => {
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 初始化数据
const initData = () => {
  // 加载模拟数据
  emergencyStore.setEvents(mockEvents)
  emergencyStore.setResources(mockResources)
  
  console.log('数据初始化完成')
}

// 组件挂载
onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
  initData()
})

// 组件卸载
onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style lang="scss" scoped>
.emergency-dispatch {
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dispatch-header {
  height: 80px;
  background: rgba(26, 31, 58, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 2px solid #2c5aa0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);

  .header-left {
    display: flex;
    align-items: center;
    gap: 15px;

    .header-icon {
      font-size: 32px;
      color: #409eff;
    }

    .header-title {
      font-size: 28px;
      font-weight: bold;
      background: linear-gradient(45deg, #409eff, #67c23a);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }

  .header-center {
    .current-time {
      font-size: 20px;
      font-weight: 500;
      color: #e4e7ed;
      font-family: 'Courier New', monospace;
    }
  }

  .header-right {
    .alert-badge {
      .alert-icon {
        font-size: 24px;
        color: #f56c6c;
        cursor: pointer;
        transition: color 0.3s;

        &:hover {
          color: #f78989;
        }
      }
    }
  }
}

.dispatch-main {
  flex: 1;
  display: flex;
  gap: 20px;
  padding: 20px;
  overflow: hidden;
}

.left-panel,
.right-panel {
  width: 320px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.panel-section {
  background: rgba(26, 31, 58, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid #2c5aa0;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);

  .section-title {
    font-size: 16px;
    font-weight: bold;
    color: #409eff;
    margin-bottom: 15px;
    padding-bottom: 8px;
    border-bottom: 1px solid #2c5aa0;
  }
}

.event-overview {
  display: flex;
  flex-direction: column;
  gap: 15px;

  .overview-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    background: rgba(64, 158, 255, 0.1);
    border-radius: 8px;
    border-left: 4px solid #409eff;

    .item-value {
      font-size: 24px;
      font-weight: bold;
      color: #ffffff;

      &.critical {
        color: #f56c6c;
      }

      &.processing {
        color: #e6a23c;
      }
    }

    .item-label {
      font-size: 12px;
      color: #909399;
    }
  }
}

.resource-status {
  .status-item {
    margin-bottom: 15px;

    .status-label {
      display: block;
      margin-top: 8px;
      font-size: 12px;
      color: #c0c4cc;
    }
  }
}

.map-container {
    flex: 1;
    background: rgba(26, 31, 58, 0.6);
    backdrop-filter: blur(10px);
    border: 1px solid #2c5aa0;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  }

.event-list {
  max-height: 300px;
  overflow-y: auto;

  .event-item {
    padding: 12px;
    margin-bottom: 10px;
    background: rgba(64, 158, 255, 0.1);
    border-radius: 8px;
    border-left: 4px solid #409eff;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      background: rgba(64, 158, 255, 0.2);
      transform: translateX(5px);
    }

    &.critical {
      border-left-color: #f56c6c;
      background: rgba(245, 108, 108, 0.1);
    }

    &.high {
      border-left-color: #e6a23c;
      background: rgba(230, 162, 60, 0.1);
    }

    .event-time {
      font-size: 12px;
      color: #909399;
      margin-bottom: 4px;
    }

    .event-title {
      font-size: 14px;
      font-weight: bold;
      color: #ffffff;
      margin-bottom: 4px;
    }

    .event-location {
      font-size: 12px;
      color: #c0c4cc;
    }
  }
}

.communication-status {
  .comm-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 0;
    font-size: 14px;
    color: #c0c4cc;

    .comm-icon {
      font-size: 16px;

      &.online {
        color: #67c23a;
      }

      &.offline {
        color: #f56c6c;
      }
    }
  }
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(26, 31, 58, 0.3);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #2c5aa0;
  border-radius: 3px;

  &:hover {
    background: #409eff;
  }
}
</style>