import { defineStore } from 'pinia'
import type { 
  EmergencyEvent, 
  EmergencyResource, 
  EventStats, 
  ResourceStats,
  MapMarker,
  CommunicationStatus,
  SystemConfig
} from '@/types/emergency'

interface EmergencyState {
  // 事件数据
  events: EmergencyEvent[]
  currentEvent: EmergencyEvent | null
  eventStats: EventStats
  
  // 资源数据
  resources: EmergencyResource[]
  currentResource: EmergencyResource | null
  resourceStats: ResourceStats
  
  // 地图数据
  mapMarkers: MapMarker[]
  mapCenter: [number, number]
  mapZoom: number
  
  // 系统状态
  communicationStatus: CommunicationStatus
  systemConfig: SystemConfig
  isLoading: boolean
  error: string | null
  
  // WebSocket连接状态
  wsConnected: boolean
  lastUpdateTime: Date | null
}

export const useEmergencyStore = defineStore('emergency', {
  state: (): EmergencyState => ({
    // 事件数据
    events: [],
    currentEvent: null,
    eventStats: {
      total: 0,
      pending: 0,
      processing: 0,
      resolved: 0,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    },
    
    // 资源数据
    resources: [],
    currentResource: null,
    resourceStats: {
      total: 0,
      available: 0,
      busy: 0,
      offline: 0,
      availablePercentage: 0,
      busyPercentage: 0
    },
    
    // 地图数据
    mapMarkers: [],
    mapCenter: [116.397428, 39.90923], // 北京天安门
    mapZoom: 11,
    
    // 系统状态
    communicationStatus: {
      video: true,
      audio: true,
      network: true,
      gps: true
    },
    systemConfig: {
      mapCenter: [116.397428, 39.90923],
      mapZoom: 11,
      refreshInterval: 30000, // 30秒
      alertThreshold: {
        critical: 5,
        high: 10
      }
    },
    isLoading: false,
    error: null,
    
    // WebSocket状态
    wsConnected: false,
    lastUpdateTime: null
  }),
  
  getters: {
    // 获取紧急事件
    criticalEvents: (state) => 
      state.events.filter(event => event.severity === 'critical'),
    
    // 获取处理中的事件
    processingEvents: (state) => 
      state.events.filter(event => event.status === 'processing'),
    
    // 获取可用资源
    availableResources: (state) => 
      state.resources.filter(resource => resource.status === 'available'),
    
    // 获取忙碌资源
    busyResources: (state) => 
      state.resources.filter(resource => resource.status === 'busy'),
    
    // 获取最近事件（最近1小时）
    recentEvents: (state) => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
      return state.events
        .filter(event => event.createdAt > oneHourAgo)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 10)
    },
    
    // 获取事件地图标注
    eventMarkers: (state) => 
      state.mapMarkers.filter(marker => marker.type === 'event'),
    
    // 获取资源地图标注
    resourceMarkers: (state) => 
      state.mapMarkers.filter(marker => marker.type === 'resource'),
    
    // 获取告警数量
    alertCount: (state) => 
      state.events.filter(event => 
        event.severity === 'critical' && event.status !== 'resolved'
      ).length
  },
  
  actions: {
    // 设置加载状态
    setLoading(loading: boolean) {
      this.isLoading = loading
    },
    
    // 设置错误信息
    setError(error: string | null) {
      this.error = error
    },
    
    // 更新事件列表
    setEvents(events: EmergencyEvent[]) {
      this.events = events
      this.updateEventStats()
      this.updateMapMarkers()
    },
    
    // 添加新事件
    addEvent(event: EmergencyEvent) {
      this.events.unshift(event)
      this.updateEventStats()
      this.updateMapMarkers()
    },
    
    // 更新事件
    updateEvent(eventId: string, updates: Partial<EmergencyEvent>) {
      const index = this.events.findIndex(event => event.id === eventId)
      if (index !== -1) {
        this.events[index] = { ...this.events[index], ...updates }
        this.updateEventStats()
        this.updateMapMarkers()
      }
    },
    
    // 删除事件
    removeEvent(eventId: string) {
      this.events = this.events.filter(event => event.id !== eventId)
      this.updateEventStats()
      this.updateMapMarkers()
    },
    
    // 设置当前事件
    setCurrentEvent(event: EmergencyEvent | null) {
      this.currentEvent = event
    },
    
    // 更新资源列表
    setResources(resources: EmergencyResource[]) {
      this.resources = resources
      this.updateResourceStats()
      this.updateMapMarkers()
    },
    
    // 添加新资源
    addResource(resource: EmergencyResource) {
      this.resources.push(resource)
      this.updateResourceStats()
      this.updateMapMarkers()
    },
    
    // 更新资源
    updateResource(resourceId: string, updates: Partial<EmergencyResource>) {
      const index = this.resources.findIndex(resource => resource.id === resourceId)
      if (index !== -1) {
        this.resources[index] = { ...this.resources[index], ...updates }
        this.updateResourceStats()
        this.updateMapMarkers()
      }
    },
    
    // 设置当前资源
    setCurrentResource(resource: EmergencyResource | null) {
      this.currentResource = resource
    },
    
    // 更新事件统计
    updateEventStats() {
      const stats = {
        total: this.events.length,
        pending: 0,
        processing: 0,
        resolved: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
      }
      
      this.events.forEach(event => {
        // 按状态统计
        stats[event.status]++
        // 按严重程度统计
        stats[event.severity]++
      })
      
      this.eventStats = stats
    },
    
    // 更新资源统计
    updateResourceStats() {
      const total = this.resources.length
      const available = this.resources.filter(r => r.status === 'available').length
      const busy = this.resources.filter(r => r.status === 'busy').length
      const offline = this.resources.filter(r => r.status === 'offline').length
      
      this.resourceStats = {
        total,
        available,
        busy,
        offline,
        availablePercentage: total > 0 ? Math.round((available / total) * 100) : 0,
        busyPercentage: total > 0 ? Math.round((busy / total) * 100) : 0
      }
    },
    
    // 更新地图标注
    updateMapMarkers() {
      const markers: MapMarker[] = []
      
      // 添加事件标注
      this.events.forEach(event => {
        markers.push({
          id: `event-${event.id}`,
          type: 'event',
          position: [event.location.lng, event.location.lat],
          title: event.title,
          content: event.description,
          color: this.getEventColor(event.severity),
          size: event.severity === 'critical' ? 'large' : 'medium',
          data: event
        })
      })
      
      // 添加资源标注
      this.resources.forEach(resource => {
        markers.push({
          id: `resource-${resource.id}`,
          type: 'resource',
          position: [resource.location.lng, resource.location.lat],
          title: resource.name,
          content: `${resource.type} - ${resource.status}`,
          color: this.getResourceColor(resource.status),
          size: 'small',
          data: resource
        })
      })
      
      this.mapMarkers = markers
    },
    
    // 获取事件颜色
    getEventColor(severity: string): string {
      const colors = {
        critical: '#f56c6c',
        high: '#e6a23c',
        medium: '#409eff',
        low: '#67c23a'
      }
      return colors[severity as keyof typeof colors] || '#909399'
    },
    
    // 获取资源颜色
    getResourceColor(status: string): string {
      const colors = {
        available: '#67c23a',
        busy: '#e6a23c',
        offline: '#909399',
        maintenance: '#f56c6c'
      }
      return colors[status as keyof typeof colors] || '#909399'
    },
    
    // 设置地图中心和缩放
    setMapView(center: [number, number], zoom: number) {
      this.mapCenter = center
      this.mapZoom = zoom
    },
    
    // 更新通信状态
    updateCommunicationStatus(status: Partial<CommunicationStatus>) {
      this.communicationStatus = { ...this.communicationStatus, ...status }
    },
    
    // 设置WebSocket连接状态
    setWebSocketStatus(connected: boolean) {
      this.wsConnected = connected
      if (connected) {
        this.lastUpdateTime = new Date()
      }
    },
    
    // 更新最后更新时间
    updateLastUpdateTime() {
      this.lastUpdateTime = new Date()
    },
    
    // 重置状态
    reset() {
      this.events = []
      this.resources = []
      this.mapMarkers = []
      this.currentEvent = null
      this.currentResource = null
      this.error = null
      this.isLoading = false
    }
  }
})