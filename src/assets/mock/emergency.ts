/**
 * @fileoverview 应急调度系统模拟数据
 * @description 提供开发和测试使用的模拟数据，包括事件和资源数据
 * @author Emergency Dispatch Development Team
 * @date 2024-01-15
 * @version 1.0.0
 * 
 * @contents
 * - 模拟应急事件数据
 * - 模拟应急资源数据
 * - 随机数据生成函数
 * - 数据更新工具函数
 */

import type { EmergencyEvent, EmergencyResource } from '@/types/emergency'

/**
 * 模拟事件数据集合
 * @description 包含不同类型和严重程度的应急事件示例
 */
export const mockEvents: EmergencyEvent[] = [
  {
    id: '1',
    type: 'fire',
    title: '商场火灾报警',
    description: '朝阳区某商场3楼发生火灾，现场有浓烟，需要立即疏散人员',
    location: {
      lat: 39.9042,
      lng: 116.4074,
      address: '北京市朝阳区建国路88号SOHO现代城',
      district: '朝阳区',
      city: '北京市'
    },
    severity: 'critical',
    status: 'processing',
    createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5分钟前
    updatedAt: new Date(Date.now() - 2 * 60 * 1000), // 2分钟前
    assignedResources: ['fire-001', 'ambulance-001'],
    reporter: {
      name: '张三',
      phone: '13800138001'
    },
    estimatedDuration: 120
  },
  {
    id: '2',
    type: 'accident',
    title: '交通事故',
    description: '三环路发生多车连环相撞事故，造成交通拥堵',
    location: {
      lat: 39.9388,
      lng: 116.3974,
      address: '北京市海淀区中关村大街与北三环交叉口',
      district: '海淀区',
      city: '北京市'
    },
    severity: 'high',
    status: 'processing',
    createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15分钟前
    updatedAt: new Date(Date.now() - 5 * 60 * 1000), // 5分钟前
    assignedResources: ['police-001', 'ambulance-002', 'tow-001'],
    reporter: {
      name: '李四',
      phone: '13800138002'
    },
    estimatedDuration: 90
  },
  {
    id: '3',
    title: '设备故障',
    type: 'equipment_failure',
    description: '地铁1号线信号系统故障，影响正常运营',
    location: {
      lat: 39.9075,
      lng: 116.3972,
      address: '北京市西城区西单地铁站',
      district: '西城区',
      city: '北京市'
    },
    severity: 'medium',
    status: 'pending',
    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30分钟前
    updatedAt: new Date(Date.now() - 30 * 60 * 1000),
    assignedResources: ['tech-001'],
    reporter: {
      name: '王五',
      phone: '13800138003'
    },
    estimatedDuration: 60
  },
  {
    id: '4',
    type: 'medical',
    title: '突发疾病',
    description: '办公楼内有人突发心脏病，需要紧急医疗救助',
    location: {
      lat: 39.9163,
      lng: 116.3971,
      address: '北京市西城区金融街购物中心',
      district: '西城区',
      city: '北京市'
    },
    severity: 'high',
    status: 'resolved',
    createdAt: new Date(Date.now() - 45 * 60 * 1000), // 45分钟前
    updatedAt: new Date(Date.now() - 10 * 60 * 1000), // 10分钟前
    assignedResources: ['ambulance-003'],
    reporter: {
      name: '赵六',
      phone: '13800138004'
    },
    estimatedDuration: 30,
    actualDuration: 35
  },
  {
    id: '5',
    type: 'security',
    title: '可疑人员',
    description: '地铁站发现可疑人员，携带不明包裹',
    location: {
      lat: 39.9042,
      lng: 116.4074,
      address: '北京市朝阳区国贸地铁站',
      district: '朝阳区',
      city: '北京市'
    },
    severity: 'medium',
    status: 'processing',
    createdAt: new Date(Date.now() - 20 * 60 * 1000), // 20分钟前
    updatedAt: new Date(Date.now() - 8 * 60 * 1000), // 8分钟前
    assignedResources: ['police-002', 'security-001'],
    reporter: {
      name: '孙七',
      phone: '13800138005'
    },
    estimatedDuration: 45
  }
]

// 模拟资源数据
export const mockResources: EmergencyResource[] = [
  {
    id: 'fire-001',
    type: 'vehicle',
    name: '消防车001',
    code: 'FC001',
    status: 'busy',
    location: {
      lat: 39.9042,
      lng: 116.4074,
      address: '北京市朝阳区建国路88号'
    },
    capacity: 8,
    currentLoad: 6,
    department: '朝阳区消防大队',
    contact: {
      name: '消防队长',
      phone: '119001'
    },
    equipment: ['水枪', '云梯', '破拆工具'],
    skills: ['火灾扑救', '高空救援']
  },
  {
    id: 'ambulance-001',
    type: 'vehicle',
    name: '救护车001',
    code: 'AM001',
    status: 'busy',
    location: {
      lat: 39.9042,
      lng: 116.4074,
      address: '北京市朝阳区建国路88号'
    },
    capacity: 4,
    currentLoad: 2,
    department: '朝阳区急救中心',
    contact: {
      name: '急救医生',
      phone: '120001'
    },
    equipment: ['除颤器', '呼吸机', '急救药品'],
    skills: ['急救医疗', '病人转运']
  },
  {
    id: 'police-001',
    type: 'personnel',
    name: '巡警小组001',
    code: 'PL001',
    status: 'busy',
    location: {
      lat: 39.9388,
      lng: 116.3974,
      address: '北京市海淀区中关村大街'
    },
    capacity: 4,
    currentLoad: 4,
    department: '海淀区公安分局',
    contact: {
      name: '巡警队长',
      phone: '110001'
    },
    equipment: ['警车', '对讲机', '执法记录仪'],
    skills: ['交通疏导', '现场维护']
  },
  {
    id: 'ambulance-002',
    type: 'vehicle',
    name: '救护车002',
    code: 'AM002',
    status: 'available',
    location: {
      lat: 39.9163,
      lng: 116.3971,
      address: '北京市西城区急救站'
    },
    capacity: 4,
    currentLoad: 0,
    department: '西城区急救中心',
    contact: {
      name: '急救医生',
      phone: '120002'
    },
    equipment: ['除颤器', '呼吸机', '急救药品'],
    skills: ['急救医疗', '病人转运']
  },
  {
    id: 'fire-002',
    type: 'vehicle',
    name: '消防车002',
    code: 'FC002',
    status: 'available',
    location: {
      lat: 39.9075,
      lng: 116.3972,
      address: '北京市西城区消防站'
    },
    capacity: 8,
    currentLoad: 0,
    department: '西城区消防大队',
    contact: {
      name: '消防队长',
      phone: '119002'
    },
    equipment: ['水枪', '云梯', '破拆工具'],
    skills: ['火灾扑救', '高空救援']
  },
  {
    id: 'police-002',
    type: 'personnel',
    name: '特警小组001',
    code: 'SW001',
    status: 'busy',
    location: {
      lat: 39.9042,
      lng: 116.4074,
      address: '北京市朝阳区国贸地铁站'
    },
    capacity: 6,
    currentLoad: 4,
    department: '北京市公安局特警总队',
    contact: {
      name: '特警队长',
      phone: '110002'
    },
    equipment: ['防爆装备', '探测器', '通讯设备'],
    skills: ['反恐处置', '爆炸物处理']
  },
  {
    id: 'tech-001',
    type: 'personnel',
    name: '技术维修组',
    code: 'TC001',
    status: 'available',
    location: {
      lat: 39.9075,
      lng: 116.3972,
      address: '北京市西城区地铁维修中心'
    },
    capacity: 3,
    currentLoad: 0,
    department: '北京地铁运营公司',
    contact: {
      name: '技术主管',
      phone: '400001'
    },
    equipment: ['检测仪器', '维修工具', '备用设备'],
    skills: ['设备维修', '系统调试']
  },
  {
    id: 'security-001',
    type: 'personnel',
    name: '安保小组001',
    code: 'SC001',
    status: 'available',
    location: {
      lat: 39.9042,
      lng: 116.4074,
      address: '北京市朝阳区国贸安保中心'
    },
    capacity: 4,
    currentLoad: 2,
    department: '朝阳区安保公司',
    contact: {
      name: '安保队长',
      phone: '400002'
    },
    equipment: ['对讲机', '监控设备', '安检设备'],
    skills: ['现场安保', '人员疏散']
  }
]

// 生成随机事件数据
export const generateRandomEvent = (): EmergencyEvent => {
  const types = ['fire', 'accident', 'medical', 'security', 'equipment_failure']
  const severities = ['low', 'medium', 'high', 'critical']
  const statuses = ['pending', 'processing']
  
  const randomType = types[Math.floor(Math.random() * types.length)]
  const randomSeverity = severities[Math.floor(Math.random() * severities.length)]
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
  
  return {
    id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: randomType as any,
    title: `${randomType === 'fire' ? '火灾' : randomType === 'accident' ? '事故' : randomType === 'medical' ? '医疗' : randomType === 'security' ? '安全' : '设备'}事件`,
    description: `随机生成的${randomType}事件，严重程度：${randomSeverity}`,
    location: {
      lat: 39.9 + (Math.random() - 0.5) * 0.1,
      lng: 116.4 + (Math.random() - 0.5) * 0.1,
      address: `北京市随机地址${Math.floor(Math.random() * 1000)}号`,
      district: ['朝阳区', '海淀区', '西城区', '东城区'][Math.floor(Math.random() * 4)],
      city: '北京市'
    },
    severity: randomSeverity as any,
    status: randomStatus as any,
    createdAt: new Date(Date.now() - Math.random() * 60 * 60 * 1000), // 1小时内
    updatedAt: new Date(),
    assignedResources: [],
    reporter: {
      name: `报告人${Math.floor(Math.random() * 100)}`,
      phone: `138${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`
    }
  }
}

// 更新资源位置（模拟移动）
export const updateResourceLocation = (resource: EmergencyResource): EmergencyResource => {
  return {
    ...resource,
    location: {
      ...resource.location,
      lat: resource.location.lat + (Math.random() - 0.5) * 0.001,
      lng: resource.location.lng + (Math.random() - 0.5) * 0.001
    }
  }
}