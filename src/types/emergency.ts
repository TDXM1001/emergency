/**
 * @fileoverview 应急调度系统类型定义
 * @description 定义应急调度系统中使用的所有数据类型和接口
 * @author Emergency Dispatch Development Team
 * @date 2024-01-15
 * @version 1.0.0
 * 
 * @contents
 * - 基础枚举类型（严重程度、状态、类型等）
 * - 核心数据接口（事件、资源、地图标注等）
 * - 统计和配置接口
 * - API响应格式
 * - 实时通信接口
 */

/**
 * 事件严重程度枚举
 * @description 定义应急事件的严重程度级别
 */
export type EventSeverity = 'low' | 'medium' | 'high' | 'critical'

/**
 * 事件状态枚举
 * @description 定义应急事件的处理状态
 */
export type EventStatus = 'pending' | 'processing' | 'resolved' | 'closed'

/**
 * 事件类型枚举
 * @description 定义应急事件的分类类型
 */
export type EventType = 'fire' | 'accident' | 'medical' | 'natural_disaster' | 'security' | 'equipment_failure' | 'other'

/**
 * 资源状态枚举
 * @description 定义应急资源的工作状态
 */
export type ResourceStatus = 'available' | 'busy' | 'offline' | 'maintenance'

/**
 * 资源类型枚举
 * @description 定义应急资源的分类类型
 */
export type ResourceType = 'personnel' | 'vehicle' | 'equipment' | 'facility'

/**
 * 地理位置信息接口
 * @description 定义地理坐标和地址信息
 */
export interface Location {
  /** 纬度 */
  lat: number
  /** 经度 */
  lng: number
  /** 详细地址 */
  address: string
  /** 所属区县 */
  district?: string
  /** 所属城市 */
  city?: string
}

/**
 * 应急事件接口
 * @description 定义应急事件的完整数据结构
 */
export interface EmergencyEvent {
  id: string
  type: EventType
  title: string
  description: string
  location: Location
  severity: EventSeverity
  status: EventStatus
  createdAt: Date
  updatedAt: Date
  assignedResources: string[]
  reporter?: {
    name: string
    phone: string
  }
  estimatedDuration?: number // 预计处理时长（分钟）
  actualDuration?: number // 实际处理时长（分钟）
}

// 应急资源接口
export interface EmergencyResource {
  id: string
  type: ResourceType
  name: string
  code: string // 资源编号
  status: ResourceStatus
  location: Location
  capacity: number
  currentLoad: number
  department: string // 所属部门
  contact?: {
    name: string
    phone: string
  }
  equipment?: string[] // 配备设备
  skills?: string[] // 技能标签
}

// 事件统计数据
export interface EventStats {
  total: number
  pending: number
  processing: number
  resolved: number
  critical: number
  high: number
  medium: number
  low: number
}

// 资源统计数据
export interface ResourceStats {
  total: number
  available: number
  busy: number
  offline: number
  availablePercentage: number
  busyPercentage: number
}

// 地图标注点
export interface MapMarker {
  id: string
  type: 'event' | 'resource'
  position: [number, number] // [lng, lat]
  title: string
  content: string
  icon?: string
  color?: string
  size?: 'small' | 'medium' | 'large'
  data: EmergencyEvent | EmergencyResource
}

// 实时数据更新
export interface RealtimeUpdate {
  type: 'event_created' | 'event_updated' | 'resource_updated' | 'location_updated'
  timestamp: Date
  data: any
}

// WebSocket消息
export interface WebSocketMessage {
  type: string
  payload: any
  timestamp: Date
}

// 通信状态
export interface CommunicationStatus {
  video: boolean
  audio: boolean
  network: boolean
  gps: boolean
}

// 系统配置
export interface SystemConfig {
  mapCenter: [number, number]
  mapZoom: number
  refreshInterval: number
  alertThreshold: {
    critical: number
    high: number
  }
}

// API响应格式
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp: Date
}

// 分页参数
export interface PaginationParams {
  page: number
  pageSize: number
  total?: number
}

// 查询参数
export interface QueryParams {
  keyword?: string
  type?: EventType | ResourceType
  status?: EventStatus | ResourceStatus
  severity?: EventSeverity
  startTime?: Date
  endTime?: Date
  location?: string
}

// 图表数据
export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
  }[]
}

// 趋势数据
export interface TrendData {
  time: string
  value: number
  type?: string
}