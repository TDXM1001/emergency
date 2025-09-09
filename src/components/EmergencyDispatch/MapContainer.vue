<!--
/**
 * @fileoverview 地图容器组件
 * @description 应急调度系统的核心地图展示组件，集成高德地图API
 * @author Emergency Dispatch Development Team
 * @date 2024-01-15
 * @version 1.0.0
 * 
 * @features
 * - 高德地图集成
 * - 多种地图样式切换
 * - 事件和资源标注显示
 * - 地图工具栏和控制面板
 * - 响应式设计支持
 * - 实时数据更新
 */
-->

<template>
  <div class="map-container">
    <!-- 地图工具栏：提供地图样式切换和操作按钮 -->
    <div class="map-toolbar">
      <div class="toolbar-left">
        <el-button-group>
          <el-button 
            :type="mapStyle === 'normal' ? 'primary' : 'default'"
            size="small"
            @click="switchMapStyle('normal')"
          >
            标准
          </el-button>
          <!-- <el-button 
            :type="mapStyle === 'satellite' ? 'primary' : 'default'"
            size="small"
            @click="switchMapStyle('satellite')"
          >
            卫星
          </el-button> -->
          <el-button 
            :type="mapStyle === 'dark' ? 'primary' : 'default'"
            size="small"
            @click="switchMapStyle('dark')"
          >
            深色
          </el-button>
        </el-button-group>
      </div>
      
      <div class="toolbar-center">
        <span class="map-info">{{ mapInfo }}</span>
      </div>
      
      <div class="toolbar-right">
        <el-button-group>
          <el-button 
            size="small"
            @click="fitView"
            title="适应视野"
          >
            <el-icon><FullScreen /></el-icon>
          </el-button>
          <el-button 
            size="small"
            @click="refreshMap"
            title="刷新地图"
          >
            <el-icon><Refresh /></el-icon>
          </el-button>
          <el-button 
            size="small"
            @click="toggleMarkers"
            :type="showMarkers ? 'primary' : 'default'"
            title="显示/隐藏标注"
          >
            <el-icon><Location /></el-icon>
          </el-button>
        </el-button-group>
      </div>
    </div>
    
    <!-- 地图容器 -->
    <div 
      ref="mapContainer" 
      class="map-content"
      :class="{ 'map-loading': isLoading }"
    >
      <!-- 加载状态 -->
      <div v-if="isLoading" class="map-loading-overlay">
        <el-icon class="loading-icon"><Loading /></el-icon>
        <span class="loading-text">地图加载中...</span>
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="error" class="map-error-overlay">
        <el-icon class="error-icon"><Warning /></el-icon>
        <span class="error-text">{{ error }}</span>
        <el-button type="primary" size="small" @click="initMap">重新加载</el-button>
      </div>
    </div>
    
    <!-- 地图图例 -->
    <div class="map-legend" v-if="showLegend">
      <div class="legend-title">图例</div>
      <div class="legend-items">
        <div class="legend-item">
          <div class="legend-marker event critical"></div>
          <span>紧急事件</span>
        </div>
        <div class="legend-item">
          <div class="legend-marker event high"></div>
          <span>高级事件</span>
        </div>
        <div class="legend-item">
          <div class="legend-marker event medium"></div>
          <span>中级事件</span>
        </div>
        <div class="legend-item">
          <div class="legend-marker event low"></div>
          <span>低级事件</span>
        </div>
        <div class="legend-item">
          <div class="legend-marker resource available"></div>
          <span>可用资源</span>
        </div>
        <div class="legend-item">
          <div class="legend-marker resource busy"></div>
          <span>忙碌资源</span>
        </div>
      </div>
    </div>
    
    <!-- 地图统计信息 -->
    <div class="map-stats" v-if="showStats">
      <div class="stats-item">
        <span class="stats-label">事件数量:</span>
        <span class="stats-value">{{ eventCount }}</span>
      </div>
      <div class="stats-item">
        <span class="stats-label">资源数量:</span>
        <span class="stats-value">{{ resourceCount }}</span>
      </div>
      <div class="stats-item">
        <span class="stats-label">缩放级别:</span>
        <span class="stats-value">{{ currentZoom }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * MapContainer组件的逻辑实现
 * @description 处理地图初始化、事件绑定、标注管理等核心功能
 */

// Vue相关导入
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue'
// Element Plus图标和组件
import { FullScreen, Refresh, Location, Loading, Warning } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
// 地图工具类和类型定义
import { mapUtils, type AMapInstance } from '@/utils/mapUtils'
// 状态管理
import { useEmergencyStore } from '@/stores/modules/emergency'
// 类型定义
import type { EmergencyEvent, EmergencyResource, MapMarker } from '@/types/emergency'

/**
 * 组件Props定义
 * @description 定义组件接收的属性参数
 */
interface Props {
  events?: EmergencyEvent[]
  resources?: EmergencyResource[]
  center?: [number, number]
  zoom?: number
  showLegend?: boolean
  showStats?: boolean
  autoFit?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  events: () => [],
  resources: () => [],
  center: () => [116.397428, 39.90923],
  zoom: 11,
  showLegend: true,
  showStats: true,
  autoFit: true
})

// Emits定义
interface Emits {
  mapReady: [map: AMapInstance]
  markerClick: [data: EmergencyEvent | EmergencyResource, type: 'event' | 'resource']
  mapClick: [position: [number, number]]
  zoomChange: [zoom: number]
  centerChange: [center: [number, number]]
}

const emit = defineEmits<Emits>()

// 响应式数据
const mapContainer = ref<HTMLElement>()
const isLoading = ref(true)
const error = ref<string | null>(null)
const mapInstance = ref<AMapInstance | null>(null)
const mapStyle = ref('dark')
const showMarkers = ref(true)
const currentZoom = ref(11)
const mapInfo = ref('地图初始化中...')

// 状态管理
const emergencyStore = useEmergencyStore()

// 计算属性
const eventCount = computed(() => props.events.length)
const resourceCount = computed(() => props.resources.length)

// 地图样式配置
const mapStyleConfig = {
  normal: 'amap://styles/normal',
  // satellite: 'amap://styles/satellite',
  dark: 'amap://styles/darkblue'
}

// 初始化地图
const initMap = async () => {
  if (!mapContainer.value) return
  
  try {
    isLoading.value = true
    error.value = null
    mapInfo.value = '正在加载地图...'
    
    // 创建地图实例
    mapInstance.value = await mapUtils.createMap(mapContainer.value, {
      center: props.center,
      zoom: props.zoom,
      mapStyle: mapStyleConfig[mapStyle.value as keyof typeof mapStyleConfig]
    })
    
    // 绑定地图事件
    bindMapEvents()
    
    // 加载标注数据
    await loadMarkers()
    
    // 自适应视野
    if (props.autoFit && (props.events.length > 0 || props.resources.length > 0)) {
      await nextTick()
      mapUtils.fitView()
    }
    
    mapInfo.value = `地图加载完成 - 中心: ${props.center[1].toFixed(4)}, ${props.center[0].toFixed(4)}`
    emit('mapReady', mapInstance.value)
    
  } catch (err) {
    console.error('地图初始化失败:', err)
    error.value = '地图加载失败，请检查网络连接或API配置'
    ElMessage.error('地图加载失败')
  } finally {
    isLoading.value = false
  }
}

// 绑定地图事件
const bindMapEvents = () => {
  if (!mapInstance.value) return
  
  // 地图点击事件
  mapInstance.value.on('click', (e: any) => {
    const position: [number, number] = [e.lnglat.lng, e.lnglat.lat]
    emit('mapClick', position)
  })
  
  // 缩放变化事件
  mapInstance.value.on('zoomend', () => {
    if (mapInstance.value) {
      currentZoom.value = mapInstance.value.getZoom()
      emit('zoomChange', currentZoom.value)
      updateMapInfo()
    }
  })
  
  // 中心点变化事件
  mapInstance.value.on('moveend', () => {
    if (mapInstance.value) {
      const center = mapInstance.value.getCenter()
      emit('centerChange', [center.lng, center.lat])
      updateMapInfo()
    }
  })
}

// 加载标注数据
const loadMarkers = async () => {
  if (!showMarkers.value) return
  
  try {
    // 清除现有标注
    mapUtils.clearMarkers()
    
    // 添加事件标注
    props.events.forEach(event => {
      mapUtils.createEventMarker(event)
    })
    
    // 添加资源标注
    props.resources.forEach(resource => {
      mapUtils.createResourceMarker(resource)
    })
    
  } catch (err) {
    console.error('标注加载失败:', err)
    ElMessage.warning('部分标注加载失败')
  }
}

// 切换地图样式
const switchMapStyle = (style: string) => {
  mapStyle.value = style
  if (mapInstance.value) {
    const styleUrl = mapStyleConfig[style as keyof typeof mapStyleConfig]
    mapUtils.setMapStyle(styleUrl)
    mapInfo.value = `地图样式已切换为: ${style === 'normal' ? '标准' : style === 'satellite' ? '卫星' : '深色'}`
  }
}

// 适应视野
const fitView = () => {
  mapUtils.fitView()
  mapInfo.value = '已适应所有标注视野'
}

// 刷新地图
const refreshMap = async () => {
  mapInfo.value = '正在刷新地图...'
  await loadMarkers()
  mapInfo.value = '地图刷新完成'
  ElMessage.success('地图刷新完成')
}

// 切换标注显示
const toggleMarkers = () => {
  showMarkers.value = !showMarkers.value
  if (showMarkers.value) {
    loadMarkers()
    mapInfo.value = '标注已显示'
  } else {
    mapUtils.clearMarkers()
    mapInfo.value = '标注已隐藏'
  }
}

// 更新地图信息
const updateMapInfo = () => {
  if (mapInstance.value) {
    const center = mapInstance.value.getCenter()
    const zoom = mapInstance.value.getZoom()
    mapInfo.value = `缩放: ${zoom} | 中心: ${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}`
  }
}

// 监听数据变化
watch(
  () => [props.events, props.resources],
  () => {
    if (mapInstance.value && showMarkers.value) {
      loadMarkers()
    }
  },
  { deep: true }
)

// 监听中心点变化
watch(
  () => props.center,
  (newCenter) => {
    if (mapInstance.value) {
      mapUtils.setMapView(newCenter, props.zoom)
    }
  },
  { deep: true }
)

// 监听缩放级别变化
watch(
  () => props.zoom,
  (newZoom) => {
    if (mapInstance.value) {
      mapUtils.setMapView(props.center, newZoom)
    }
  }
)

// 组件挂载
onMounted(() => {
  initMap()
})

// 组件卸载
onUnmounted(() => {
  mapUtils.destroy()
})

// 暴露方法给父组件
defineExpose({
  getMapInstance: () => mapInstance.value,
  refreshMap,
  fitView,
  setMapView: (center: [number, number], zoom?: number) => {
    mapUtils.setMapView(center, zoom)
  },
  addMarker: (data: EmergencyEvent | EmergencyResource, type: 'event' | 'resource') => {
    if (type === 'event') {
      mapUtils.createEventMarker(data as EmergencyEvent)
    } else {
      mapUtils.createResourceMarker(data as EmergencyResource)
    }
  },
  removeMarker: (id: string) => {
    mapUtils.removeMarker(id)
  },
  clearMarkers: () => {
    mapUtils.clearMarkers()
  }
})
</script>

<style lang="scss" scoped>
.map-container {
  position: relative;
  width: 100%;
  height: 100%;
  background: #1a1f3a;
  border-radius: 8px;
  overflow: hidden;
  
  .map-toolbar {
    position: absolute;
    top: 10px;
    left: 10px;
    right: 10px;
    height: 40px;
    background: rgba(26, 31, 58, 0.9);
    backdrop-filter: blur(10px);
    border: 1px solid #2c5aa0;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 12px;
    z-index: 1000;
    
    .toolbar-left,
    .toolbar-right {
      display: flex;
      align-items: center;
    }
    
    .toolbar-center {
      flex: 1;
      text-align: center;
      
      .map-info {
        font-size: 12px;
        color: #c0c4cc;
        font-family: 'Courier New', monospace;
      }
    }
  }
  
  .map-content {
    width: 100%;
    height: 100%;
    position: relative;
    
    &.map-loading {
      pointer-events: none;
    }
  }
  
  .map-loading-overlay,
  .map-error-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(26, 31, 58, 0.8);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 999;
    
    .loading-icon,
    .error-icon {
      font-size: 32px;
      color: #409eff;
      margin-bottom: 12px;
      
      &.loading-icon {
        animation: spin 1s linear infinite;
      }
      
      &.error-icon {
        color: #f56c6c;
      }
    }
    
    .loading-text,
    .error-text {
      font-size: 14px;
      color: #c0c4cc;
      margin-bottom: 12px;
    }
  }
  
  .map-legend {
    position: absolute;
    bottom: 60px;
    left: 10px;
    background: rgba(26, 31, 58, 0.9);
    backdrop-filter: blur(10px);
    border: 1px solid #2c5aa0;
    border-radius: 6px;
    padding: 12px;
    z-index: 1000;
    min-width: 120px;
    
    .legend-title {
      font-size: 12px;
      font-weight: bold;
      color: #409eff;
      margin-bottom: 8px;
      text-align: center;
    }
    
    .legend-items {
      .legend-item {
        display: flex;
        align-items: center;
        margin-bottom: 6px;
        font-size: 11px;
        color: #c0c4cc;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .legend-marker {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          margin-right: 6px;
          border: 1px solid #fff;
          
          &.event {
            &.critical {
              background: #ff4d4f;
            }
            &.high {
              background: #ff7a45;
            }
            &.medium {
              background: #faad14;
            }
            &.low {
              background: #52c41a;
            }
          }
          
          &.resource {
            border-radius: 2px;
            
            &.available {
              background: #52c41a;
            }
            &.busy {
              background: #faad14;
            }
          }
        }
      }
    }
  }
  
  .map-stats {
    position: absolute;
    bottom: 10px;
    right: 10px;
    background: rgba(26, 31, 58, 0.9);
    backdrop-filter: blur(10px);
    border: 1px solid #2c5aa0;
    border-radius: 6px;
    padding: 8px 12px;
    z-index: 1000;
    
    .stats-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
      font-size: 11px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .stats-label {
        color: #909399;
        margin-right: 8px;
      }
      
      .stats-value {
        color: #409eff;
        font-weight: bold;
        font-family: 'Courier New', monospace;
      }
    }
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .map-container {
    .map-toolbar {
      .toolbar-center {
        display: none;
      }
    }
    
    .map-legend {
      bottom: 10px;
      left: 50%;
      transform: translateX(-50%);
      
      .legend-items {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        
        .legend-item {
          margin-bottom: 0;
        }
      }
    }
    
    .map-stats {
      bottom: 60px;
      right: 10px;
    }
  }
}
</style>