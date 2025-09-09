/**
 * @fileoverview 地图状态管理模块
 * @description 使用Pinia管理地图相关的状态，包括地图配置、图层管理、标注数据等
 * @author Emergency Dispatch Development Team
 * @date 2024-01-15
 * @version 1.0.0
 * 
 * @features
 * - 地图实例和配置管理
 * - 图层显示控制
 * - 标注数据管理
 * - 搜索和过滤功能
 * - 测量和绘制工具
 * - 轨迹跟踪功能
 * - 地图交互状态
 */

import { defineStore } from 'pinia'
import type { AMapInstance } from '@/utils/mapUtils'
import type { EmergencyEvent, EmergencyResource, MapMarker } from '@/types/emergency'

/**
 * 地图图层类型枚举
 * @description 定义支持的地图图层类型
 */
export type MapLayerType = 'events' | 'resources' | 'areas' | 'routes' | 'heatmap'

// 地图视图模式
export type MapViewMode = 'normal' | 'satellite' | 'dark'

// 地图配置接口
interface MapConfig {
  center: [number, number]
  zoom: number
  minZoom: number
  maxZoom: number
  style: MapViewMode
  showTraffic: boolean
  showBuildings: boolean
  showLabels: boolean
}

// 图层配置接口
interface LayerConfig {
  visible: boolean
  opacity: number
  zIndex: number
  clustered: boolean
  minZoom?: number
  maxZoom?: number
}

// 地图状态接口
interface MapState {
  // 地图实例
  mapInstance: AMapInstance | null
  isMapReady: boolean
  isLoading: boolean
  error: string | null
  
  // 地图配置
  config: MapConfig
  
  // 图层管理
  layers: Record<MapLayerType, LayerConfig>
  
  // 标注数据
  markers: MapMarker[]
  selectedMarker: MapMarker | null
  hoveredMarker: MapMarker | null
  
  // 地图交互
  isDragging: boolean
  isZooming: boolean
  
  // 搜索和过滤
  searchKeyword: string
  filterOptions: {
    eventTypes: string[]
    eventSeverities: string[]
    resourceTypes: string[]
    resourceStatuses: string[]
  }
  
  // 测量工具
  measureMode: 'none' | 'distance' | 'area'
  measureResult: {
    distance?: number
    area?: number
    points: [number, number][]
  }
  
  // 绘制工具
  drawMode: 'none' | 'point' | 'line' | 'polygon' | 'circle'
  drawnShapes: any[]
  
  // 轨迹跟踪
  trackingResources: string[]
  trajectories: Record<string, {
    points: [number, number][]
    timestamps: Date[]
    color: string
  }>
}

export const useMapStore = defineStore('map', {
  state: (): MapState => ({
    // 地图实例
    mapInstance: null,
    isMapReady: false,
    isLoading: false,
    error: null,
    
    // 地图配置
    config: {
      center: [116.397428, 39.90923], // 北京天安门
      zoom: 11,
      minZoom: 3,
      maxZoom: 18,
      style: 'dark',
      showTraffic: false,
      showBuildings: true,
      showLabels: true
    },
    
    // 图层管理
    layers: {
      events: {
        visible: true,
        opacity: 1,
        zIndex: 100,
        clustered: true,
        minZoom: 8
      },
      resources: {
        visible: true,
        opacity: 1,
        zIndex: 90,
        clustered: true,
        minZoom: 10
      },
      areas: {
        visible: true,
        opacity: 0.6,
        zIndex: 50,
        clustered: false
      },
      routes: {
        visible: true,
        opacity: 0.8,
        zIndex: 80,
        clustered: false
      },
      heatmap: {
        visible: false,
        opacity: 0.7,
        zIndex: 60,
        clustered: false
      }
    },
    
    // 标注数据
    markers: [],
    selectedMarker: null,
    hoveredMarker: null,
    
    // 地图交互
    isDragging: false,
    isZooming: false,
    
    // 搜索和过滤
    searchKeyword: '',
    filterOptions: {
      eventTypes: [],
      eventSeverities: [],
      resourceTypes: [],
      resourceStatuses: []
    },
    
    // 测量工具
    measureMode: 'none',
    measureResult: {
      points: []
    },
    
    // 绘制工具
    drawMode: 'none',
    drawnShapes: [],
    
    // 轨迹跟踪
    trackingResources: [],
    trajectories: {}
  }),
  
  getters: {
    // 获取当前地图中心点
    currentCenter: (state) => {
      if (state.mapInstance) {
        const center = state.mapInstance.getCenter()
        return [center.lng, center.lat] as [number, number]
      }
      return state.config.center
    },
    
    // 获取当前缩放级别
    currentZoom: (state) => {
      if (state.mapInstance) {
        return state.mapInstance.getZoom()
      }
      return state.config.zoom
    },
    
    // 获取可见的标注
    visibleMarkers: (state) => {
      return state.markers.filter(marker => {
        const layer = state.layers[marker.type as MapLayerType]
        return layer?.visible
      })
    },
    
    // 获取过滤后的标注
    filteredMarkers: (state) => {
      let filtered = state.markers
      
      // 关键词搜索
      if (state.searchKeyword) {
        const keyword = state.searchKeyword.toLowerCase()
        filtered = filtered.filter(marker => 
          marker.title.toLowerCase().includes(keyword) ||
          marker.content.toLowerCase().includes(keyword)
        )
      }
      
      // 类型过滤
      filtered = filtered.filter(marker => {
        if (marker.type === 'event') {
          const event = marker.data as EmergencyEvent
          const typeMatch = state.filterOptions.eventTypes.length === 0 || 
                           state.filterOptions.eventTypes.includes(event.type)
          const severityMatch = state.filterOptions.eventSeverities.length === 0 || 
                               state.filterOptions.eventSeverities.includes(event.severity)
          return typeMatch && severityMatch
        } else if (marker.type === 'resource') {
          const resource = marker.data as EmergencyResource
          const typeMatch = state.filterOptions.resourceTypes.length === 0 || 
                           state.filterOptions.resourceTypes.includes(resource.type)
          const statusMatch = state.filterOptions.resourceStatuses.length === 0 || 
                             state.filterOptions.resourceStatuses.includes(resource.status)
          return typeMatch && statusMatch
        }
        return true
      })
      
      return filtered
    },
    
    // 获取事件标注
    eventMarkers: (state) => {
      return state.markers.filter(marker => marker.type === 'event')
    },
    
    // 获取资源标注
    resourceMarkers: (state) => {
      return state.markers.filter(marker => marker.type === 'resource')
    },
    
    // 获取正在跟踪的资源轨迹
    activeTrajectories: (state) => {
      return Object.entries(state.trajectories)
        .filter(([resourceId]) => state.trackingResources.includes(resourceId))
        .reduce((acc, [resourceId, trajectory]) => {
          acc[resourceId] = trajectory
          return acc
        }, {} as Record<string, any>)
    },
    
    // 检查是否有工具激活
    hasActiveTools: (state) => {
      return state.measureMode !== 'none' || state.drawMode !== 'none'
    }
  },
  
  actions: {
    // 设置地图实例
    setMapInstance(instance: AMapInstance) {
      this.mapInstance = instance
      this.isMapReady = true
      this.isLoading = false
      this.error = null
    },
    
    // 设置加载状态
    setLoading(loading: boolean) {
      this.isLoading = loading
    },
    
    // 设置错误信息
    setError(error: string | null) {
      this.error = error
      this.isLoading = false
    },
    
    // 更新地图配置
    updateConfig(config: Partial<MapConfig>) {
      this.config = { ...this.config, ...config }
    },
    
    // 设置地图中心和缩放
    setMapView(center: [number, number], zoom?: number) {
      this.config.center = center
      if (zoom !== undefined) {
        this.config.zoom = zoom
      }
      
      if (this.mapInstance) {
        this.mapInstance.setCenter(center)
        if (zoom !== undefined) {
          this.mapInstance.setZoom(zoom)
        }
      }
    },
    
    // 切换地图样式
    setMapStyle(style: MapViewMode) {
      this.config.style = style
      
      if (this.mapInstance) {
        const styleMap = {
          normal: 'amap://styles/normal',
          satellite: 'amap://styles/satellite',
          dark: 'amap://styles/darkblue'
        }
        this.mapInstance.setMapStyle(styleMap[style])
      }
    },
    
    // 更新图层配置
    updateLayerConfig(layerType: MapLayerType, config: Partial<LayerConfig>) {
      this.layers[layerType] = { ...this.layers[layerType], ...config }
    },
    
    // 切换图层可见性
    toggleLayer(layerType: MapLayerType) {
      this.layers[layerType].visible = !this.layers[layerType].visible
    },
    
    // 设置标注数据
    setMarkers(markers: MapMarker[]) {
      this.markers = markers
    },
    
    // 添加标注
    addMarker(marker: MapMarker) {
      const existingIndex = this.markers.findIndex(m => m.id === marker.id)
      if (existingIndex >= 0) {
        this.markers[existingIndex] = marker
      } else {
        this.markers.push(marker)
      }
    },
    
    // 移除标注
    removeMarker(markerId: string) {
      this.markers = this.markers.filter(marker => marker.id !== markerId)
      
      // 清除选中状态
      if (this.selectedMarker?.id === markerId) {
        this.selectedMarker = null
      }
      if (this.hoveredMarker?.id === markerId) {
        this.hoveredMarker = null
      }
    },
    
    // 清除所有标注
    clearMarkers() {
      this.markers = []
      this.selectedMarker = null
      this.hoveredMarker = null
    },
    
    // 选中标注
    selectMarker(marker: MapMarker | null) {
      this.selectedMarker = marker
    },
    
    // 悬停标注
    hoverMarker(marker: MapMarker | null) {
      this.hoveredMarker = marker
    },
    
    // 设置拖拽状态
    setDragging(dragging: boolean) {
      this.isDragging = dragging
    },
    
    // 设置缩放状态
    setZooming(zooming: boolean) {
      this.isZooming = zooming
    },
    
    // 设置搜索关键词
    setSearchKeyword(keyword: string) {
      this.searchKeyword = keyword
    },
    
    // 更新过滤选项
    updateFilterOptions(options: Partial<typeof this.filterOptions>) {
      this.filterOptions = { ...this.filterOptions, ...options }
    },
    
    // 清除过滤
    clearFilters() {
      this.searchKeyword = ''
      this.filterOptions = {
        eventTypes: [],
        eventSeverities: [],
        resourceTypes: [],
        resourceStatuses: []
      }
    },
    
    // 设置测量模式
    setMeasureMode(mode: typeof this.measureMode) {
      this.measureMode = mode
      if (mode === 'none') {
        this.measureResult = { points: [] }
      }
    },
    
    // 更新测量结果
    updateMeasureResult(result: Partial<typeof this.measureResult>) {
      this.measureResult = { ...this.measureResult, ...result }
    },
    
    // 设置绘制模式
    setDrawMode(mode: typeof this.drawMode) {
      this.drawMode = mode
    },
    
    // 添加绘制形状
    addDrawnShape(shape: any) {
      this.drawnShapes.push(shape)
    },
    
    // 清除绘制形状
    clearDrawnShapes() {
      this.drawnShapes = []
    },
    
    // 开始跟踪资源
    startTrackingResource(resourceId: string) {
      if (!this.trackingResources.includes(resourceId)) {
        this.trackingResources.push(resourceId)
      }
      
      // 初始化轨迹数据
      if (!this.trajectories[resourceId]) {
        this.trajectories[resourceId] = {
          points: [],
          timestamps: [],
          color: this.generateTrajectoryColor()
        }
      }
    },
    
    // 停止跟踪资源
    stopTrackingResource(resourceId: string) {
      this.trackingResources = this.trackingResources.filter(id => id !== resourceId)
    },
    
    // 更新资源轨迹
    updateResourceTrajectory(resourceId: string, position: [number, number]) {
      if (this.trajectories[resourceId]) {
        this.trajectories[resourceId].points.push(position)
        this.trajectories[resourceId].timestamps.push(new Date())
        
        // 限制轨迹点数量，避免内存过大
        const maxPoints = 100
        if (this.trajectories[resourceId].points.length > maxPoints) {
          this.trajectories[resourceId].points.shift()
          this.trajectories[resourceId].timestamps.shift()
        }
      }
    },
    
    // 清除资源轨迹
    clearResourceTrajectory(resourceId: string) {
      if (this.trajectories[resourceId]) {
        this.trajectories[resourceId].points = []
        this.trajectories[resourceId].timestamps = []
      }
    },
    
    // 清除所有轨迹
    clearAllTrajectories() {
      this.trackingResources = []
      this.trajectories = {}
    },
    
    // 生成轨迹颜色
    generateTrajectoryColor(): string {
      const colors = [
        '#1890ff', '#52c41a', '#faad14', '#f5222d',
        '#722ed1', '#13c2c2', '#eb2f96', '#fa8c16'
      ]
      return colors[Math.floor(Math.random() * colors.length)]
    },
    
    // 适应视野显示所有标注
    fitView() {
      if (!this.mapInstance || this.markers.length === 0) return
      
      // 计算所有标注的边界
      const bounds = this.calculateMarkersBounds()
      if (bounds) {
        // 使用地图实例的 setFitView 方法
        this.mapInstance.setFitView([], true)
      }
    },
    
    // 计算标注边界
    calculateMarkersBounds(markers?: MapMarker[]) {
      const markersToUse = markers || this.visibleMarkers
      if (markersToUse.length === 0) return null
      
      let minLng = Infinity, maxLng = -Infinity
      let minLat = Infinity, maxLat = -Infinity
      
      markersToUse.forEach(marker => {
        const [lng, lat] = marker.position
        minLng = Math.min(minLng, lng)
        maxLng = Math.max(maxLng, lng)
        minLat = Math.min(minLat, lat)
        maxLat = Math.max(maxLat, lat)
      })
      
      return {
        southwest: [minLng, minLat] as [number, number],
        northeast: [maxLng, maxLat] as [number, number]
      }
    },
    
    // 重置地图状态
    reset() {
      this.markers = []
      this.selectedMarker = null
      this.hoveredMarker = null
      this.searchKeyword = ''
      this.clearFilters()
      this.setMeasureMode('none')
      this.setDrawMode('none')
      this.clearDrawnShapes()
      this.clearAllTrajectories()
      this.error = null
    },
    
    // 销毁地图
    destroy() {
      if (this.mapInstance) {
        this.mapInstance.destroy()
        this.mapInstance = null
      }
      this.isMapReady = false
      this.reset()
    }
  }
})