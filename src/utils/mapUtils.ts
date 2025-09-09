/**
 * @fileoverview 高德地图工具类
 * @description 封装高德地图API的常用操作方法，提供地图初始化、标注管理、信息窗口等功能
 * @author Emergency Dispatch Development Team
 * @date 2024-01-15
 * @version 1.0.0
 */

import AMapLoader from '@amap/amap-jsapi-loader'
import type { EmergencyEvent, EmergencyResource, MapMarker } from '@/types/emergency'

/**
 * 高德地图配置常量
 * @description 包含API密钥、版本号和插件配置
 */
export const MAP_CONFIG = {
  // key: 'YOUR_AMAP_KEY', // 需要替换为实际的API Key
  key:"f2e99997dc3bb5eada4635bb76425b58",
  version: '2.0',
  plugins: [
    'AMap.Scale',
    'AMap.ToolBar',
    'AMap.ControlBar',
    'AMap.MapType',
    'AMap.Geolocation',
    'AMap.MarkerCluster',
    'AMap.DistrictSearch',
    'AMap.Geocoder'
  ]
}

/**
 * 高德地图实例接口定义
 * @description 定义地图实例的主要方法和属性
 */
export interface AMapInstance {
  /** 添加覆盖物到地图 */
  add: (overlays: any[]) => void
  /** 从地图移除覆盖物 */
  remove: (overlays: any[]) => void
  /** 设置地图中心点 */
  setCenter: (center: [number, number]) => void
  /** 设置地图缩放级别 */
  setZoom: (zoom: number) => void
  /** 获取地图中心点 */
  getCenter: () => { lng: number; lat: number }
  /** 获取地图缩放级别 */
  getZoom: () => number
  /** 绑定事件监听器 */
  on: (event: string, callback: Function) => void
  /** 移除事件监听器 */
  off: (event: string, callback: Function) => void
  /** 销毁地图实例 */
  destroy: () => void
  /** 设置地图样式 */
  setMapStyle: (style: string) => void
  /** 平移到指定位置 */
  panTo: (position: [number, number]) => void
  /** 自适应显示覆盖物 */
  setFitView: (overlays?: any[], immediately?: boolean) => void
}

/**
 * 地图标注实例接口定义
 * @description 定义标注实例的主要方法和属性
 */
export interface MarkerInstance {
  /** 设置标注位置 */
  setPosition: (position: [number, number]) => void
  /** 获取标注位置 */
  getPosition: () => { lng: number; lat: number }
  /** 设置标注图标 */
  setIcon: (icon: any) => void
  /** 设置标注内容 */
  setContent: (content: string) => void
  /** 显示标注 */
  show: () => void
  /** 隐藏标注 */
  hide: () => void
  /** 销毁标注 */
  destroy: () => void
  /** 绑定事件监听器 */
  on: (event: string, callback: Function) => void
  /** 移除事件监听器 */
  off: (event: string, callback: Function) => void
}

/**
 * 地图工具类
 * @description 提供地图操作的核心功能，采用单例模式
 */
export class MapUtils {
  private static instance: MapUtils
  private AMap: any = null
  private mapInstance: AMapInstance | null = null
  private markers: Map<string, MarkerInstance> = new Map()
  private markerCluster: any = null

  /**
   * 私有构造函数，防止外部实例化
   */
  private constructor() {}

  /**
   * 获取MapUtils单例实例
   * @returns {MapUtils} MapUtils实例
   */
  public static getInstance(): MapUtils {
    if (!MapUtils.instance) {
      MapUtils.instance = new MapUtils()
    }
    return MapUtils.instance
  }

  /**
   * 初始化高德地图API
   * @description 加载高德地图JavaScript API和相关插件
   * @returns {Promise<any>} 返回AMap对象
   * @throws {Error} API加载失败时抛出错误
   */
  public async initAMap(): Promise<any> {
    if (this.AMap) {
      return this.AMap
    }

    try {
      this.AMap = await AMapLoader.load(MAP_CONFIG)
      console.log('高德地图API加载成功')
      return this.AMap
    } catch (error) {
      console.error('高德地图API加载失败:', error)
      throw error
    }
  }

  /**
   * 创建地图实例
   * @description 在指定容器中创建地图实例，并添加默认控件
   * @param {string | HTMLElement} container - 地图容器ID或DOM元素
   * @param {any} options - 地图配置选项
   * @returns {Promise<AMapInstance>} 地图实例
   */
  public async createMap(container: string | HTMLElement, options: any = {}): Promise<AMapInstance> {
    await this.initAMap()

    const defaultOptions = {
      zoom: 11,
      center: [116.397428, 39.90923], // 北京天安门
      mapStyle: 'amap://styles/darkblue', // 深色主题
      showLabel: true,
      showBuildingBlock: true,
      viewMode: '2D',
      ...options
    }

    this.mapInstance = new this.AMap.Map(container, defaultOptions)
    
    // 添加地图控件
    this.addMapControls()
    
    return this.mapInstance
  }

  // 添加地图控件
  private addMapControls(): void {
    if (!this.mapInstance || !this.AMap) return

    // 比例尺控件
    const scale = new this.AMap.Scale({
      position: 'LB' // 左下角
    })
    this.mapInstance.add(scale)

    // 工具条控件
    const toolBar = new this.AMap.ToolBar({
      position: 'RT', // 右上角
      liteStyle: true
    })
    this.mapInstance.add(toolBar)

    // 地图类型控件
    const mapType = new this.AMap.MapType({
      defaultType: 0, // 默认为标准地图
      showRoad: true
    })
    this.mapInstance.add(mapType)
  }

  // 创建事件标注
  public createEventMarker(event: EmergencyEvent): MarkerInstance | null {
    if (!this.AMap || !this.mapInstance) return null

    const markerOptions = {
      position: [event.location.lng, event.location.lat],
      title: event.title,
      content: this.createEventMarkerContent(event),
      anchor: 'bottom-center',
      offset: new this.AMap.Pixel(0, 0)
    }

    const marker = new this.AMap.Marker(markerOptions)
    
    // 添加点击事件
    marker.on('click', () => {
      this.showEventInfoWindow(event, marker)
    })

    this.markers.set(`event-${event.id}`, marker)
    this.mapInstance.add(marker)
    
    return marker
  }

  // 创建资源标注
  public createResourceMarker(resource: EmergencyResource): MarkerInstance | null {
    if (!this.AMap || !this.mapInstance) return null

    const markerOptions = {
      position: [resource.location.lng, resource.location.lat],
      title: resource.name,
      content: this.createResourceMarkerContent(resource),
      anchor: 'bottom-center',
      offset: new this.AMap.Pixel(0, 0)
    }

    const marker = new this.AMap.Marker(markerOptions)
    
    // 添加点击事件
    marker.on('click', () => {
      this.showResourceInfoWindow(resource, marker)
    })

    this.markers.set(`resource-${resource.id}`, marker)
    this.mapInstance.add(marker)
    
    return marker
  }

  // 创建事件标注内容
  private createEventMarkerContent(event: EmergencyEvent): string {
    const colorMap = {
      critical: '#ff4d4f',
      high: '#ff7a45',
      medium: '#faad14',
      low: '#52c41a'
    }

    const color = colorMap[event.severity] || '#1890ff'
    const size = event.severity === 'critical' ? 24 : 20

    return `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border: 2px solid #fff;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 12px;
        font-weight: bold;
        cursor: pointer;
      ">
        🚨
      </div>
    `
  }

  // 创建资源标注内容
  private createResourceMarkerContent(resource: EmergencyResource): string {
    const colorMap = {
      available: '#52c41a',
      busy: '#faad14',
      offline: '#d9d9d9',
      maintenance: '#ff4d4f'
    }

    const iconMap = {
      personnel: '👥',
      vehicle: '🚗',
      equipment: '🔧',
      facility: '🏢'
    }

    const color = colorMap[resource.status] || '#1890ff'
    const icon = iconMap[resource.type] || '📍'

    return `
      <div style="
        width: 18px;
        height: 18px;
        background: ${color};
        border: 2px solid #fff;
        border-radius: 4px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 10px;
        cursor: pointer;
      ">
        ${icon}
      </div>
    `
  }

  // 显示事件信息窗口
  private showEventInfoWindow(event: EmergencyEvent, marker: MarkerInstance): void {
    if (!this.AMap) return

    const content = `
      <div style="padding: 12px; min-width: 200px;">
        <h4 style="margin: 0 0 8px 0; color: #1890ff;">${event.title}</h4>
        <p style="margin: 4px 0; color: #666; font-size: 12px;">
          <strong>类型:</strong> ${this.getEventTypeText(event.type)}
        </p>
        <p style="margin: 4px 0; color: #666; font-size: 12px;">
          <strong>严重程度:</strong> 
          <span style="color: ${this.getSeverityColor(event.severity)};">
            ${this.getSeverityText(event.severity)}
          </span>
        </p>
        <p style="margin: 4px 0; color: #666; font-size: 12px;">
          <strong>状态:</strong> ${this.getStatusText(event.status)}
        </p>
        <p style="margin: 4px 0; color: #666; font-size: 12px;">
          <strong>地址:</strong> ${event.location.address}
        </p>
        <p style="margin: 4px 0; color: #666; font-size: 12px;">
          <strong>时间:</strong> ${event.createdAt.toLocaleString()}
        </p>
      </div>
    `

    const infoWindow = new this.AMap.InfoWindow({
      content,
      anchor: 'bottom-center',
      offset: new this.AMap.Pixel(0, -10)
    })

    infoWindow.open(this.mapInstance, marker.getPosition())
  }

  // 显示资源信息窗口
  private showResourceInfoWindow(resource: EmergencyResource, marker: MarkerInstance): void {
    if (!this.AMap) return

    const content = `
      <div style="padding: 12px; min-width: 200px;">
        <h4 style="margin: 0 0 8px 0; color: #1890ff;">${resource.name}</h4>
        <p style="margin: 4px 0; color: #666; font-size: 12px;">
          <strong>类型:</strong> ${this.getResourceTypeText(resource.type)}
        </p>
        <p style="margin: 4px 0; color: #666; font-size: 12px;">
          <strong>状态:</strong> 
          <span style="color: ${this.getResourceStatusColor(resource.status)};">
            ${this.getResourceStatusText(resource.status)}
          </span>
        </p>
        <p style="margin: 4px 0; color: #666; font-size: 12px;">
          <strong>容量:</strong> ${resource.currentLoad}/${resource.capacity}
        </p>
        <p style="margin: 4px 0; color: #666; font-size: 12px;">
          <strong>部门:</strong> ${resource.department}
        </p>
        ${resource.contact ? `
          <p style="margin: 4px 0; color: #666; font-size: 12px;">
            <strong>联系人:</strong> ${resource.contact.name} (${resource.contact.phone})
          </p>
        ` : ''}
      </div>
    `

    const infoWindow = new this.AMap.InfoWindow({
      content,
      anchor: 'bottom-center',
      offset: new this.AMap.Pixel(0, -10)
    })

    infoWindow.open(this.mapInstance, marker.getPosition())
  }

  // 批量添加标注
  public addMarkers(markers: MapMarker[]): void {
    markers.forEach(markerData => {
      if (markerData.type === 'event') {
        this.createEventMarker(markerData.data as EmergencyEvent)
      } else if (markerData.type === 'resource') {
        this.createResourceMarker(markerData.data as EmergencyResource)
      }
    })
  }

  // 清除所有标注
  public clearMarkers(): void {
    if (!this.mapInstance) return

    this.markers.forEach(marker => {
      this.mapInstance!.remove(marker)
      marker.destroy()
    })
    this.markers.clear()
  }

  // 移除指定标注
  public removeMarker(id: string): void {
    const marker = this.markers.get(id)
    if (marker && this.mapInstance) {
      this.mapInstance.remove(marker)
      marker.destroy()
      this.markers.delete(id)
    }
  }

  // 设置地图中心和缩放
  public setMapView(center: [number, number], zoom?: number): void {
    if (!this.mapInstance) return

    this.mapInstance.setCenter(center)
    if (zoom !== undefined) {
      this.mapInstance.setZoom(zoom)
    }
  }

  // 自适应显示所有标注
  public fitView(): void {
    if (!this.mapInstance || this.markers.size === 0) return

    const overlays = Array.from(this.markers.values())
    this.mapInstance.setFitView(overlays, true)
  }

  // 切换地图样式
  public setMapStyle(style: string): void {
    if (!this.mapInstance) return
    this.mapInstance.setMapStyle(style)
  }

  // 获取地图实例
  public getMapInstance(): AMapInstance | null {
    return this.mapInstance
  }

  // 销毁地图
  public destroy(): void {
    this.clearMarkers()
    if (this.mapInstance) {
      this.mapInstance.destroy()
      this.mapInstance = null
    }
  }

  // 辅助方法：获取事件类型文本
  private getEventTypeText(type: string): string {
    const typeMap: Record<string, string> = {
      fire: '火灾',
      accident: '事故',
      medical: '医疗',
      natural_disaster: '自然灾害',
      security: '安全',
      equipment_failure: '设备故障',
      other: '其他'
    }
    return typeMap[type] || type
  }

  // 辅助方法：获取严重程度文本
  private getSeverityText(severity: string): string {
    const severityMap: Record<string, string> = {
      low: '低',
      medium: '中',
      high: '高',
      critical: '紧急'
    }
    return severityMap[severity] || severity
  }

  // 辅助方法：获取严重程度颜色
  private getSeverityColor(severity: string): string {
    const colorMap: Record<string, string> = {
      low: '#52c41a',
      medium: '#faad14',
      high: '#ff7a45',
      critical: '#ff4d4f'
    }
    return colorMap[severity] || '#1890ff'
  }

  // 辅助方法：获取状态文本
  private getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      pending: '待处理',
      processing: '处理中',
      resolved: '已解决',
      closed: '已关闭'
    }
    return statusMap[status] || status
  }

  // 辅助方法：获取资源类型文本
  private getResourceTypeText(type: string): string {
    const typeMap: Record<string, string> = {
      personnel: '人员',
      vehicle: '车辆',
      equipment: '设备',
      facility: '设施'
    }
    return typeMap[type] || type
  }

  // 辅助方法：获取资源状态文本
  private getResourceStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      available: '可用',
      busy: '忙碌',
      offline: '离线',
      maintenance: '维护中'
    }
    return statusMap[status] || status
  }

  // 辅助方法：获取资源状态颜色
  private getResourceStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      available: '#52c41a',
      busy: '#faad14',
      offline: '#d9d9d9',
      maintenance: '#ff4d4f'
    }
    return colorMap[status] || '#1890ff'
  }
}

// 导出工具类实例
export const mapUtils = MapUtils.getInstance()

// 导出常用方法
export const {
  initAMap,
  createMap,
  createEventMarker,
  createResourceMarker,
  addMarkers,
  clearMarkers,
  removeMarker,
  setMapView,
  fitView,
  setMapStyle,
  getMapInstance,
  destroy
} = mapUtils