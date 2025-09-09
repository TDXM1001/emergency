<!--
 * @Author: TDXM1001 2678062447@qq.com
 * @Date: 2025-09-09 11:40:38
 * @LastEditors: TDXM1001 2678062447@qq.com
 * @LastEditTime: 2025-09-09 12:00:49
 * @FilePath: \emergency\src\components\EmergencyDispatch\EventMarker.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<!--
/**
 * @fileoverview 应急事件标注组件
 * @description 用于在地图上显示应急事件的可视化标注，支持不同严重程度的样式和交互
 * @author Emergency Dispatch Development Team
 * @date 2024-01-15
 * @version 1.0.0
 * 
 * @features
 * - 支持4种严重程度的视觉区分（低、中、高、紧急）
 * - 动态图标和颜色显示
 * - 脉冲动画效果（紧急事件）
 * - 状态指示器
 * - 交互式详情弹窗
 * - 事件操作按钮
 * - 响应式设计
 */
-->

<template>
  <div class="event-marker" :class="markerClass" @click="handleClick">
    <!-- 事件标注图标：根据严重程度显示不同颜色和大小 -->
    <div class="marker-icon" :style="iconStyle">
      <el-icon class="marker-symbol" :size="iconSize">
        <component :is="eventIcon" />
      </el-icon>
      
      <!-- 脉冲动画 -->
      <div v-if="event.severity === 'critical'" class="pulse-ring"></div>
      
      <!-- 状态指示器 -->
      <div class="status-indicator" :class="event.status"></div>
    </div>
    
    <!-- 标注标签 -->
    <div v-if="showLabel" class="marker-label" :style="labelStyle">
      {{ event.title }}
    </div>
    
    <!-- 详情弹窗 -->
    <el-popover
      v-model:visible="showPopover"
      :width="300"
      trigger="manual"
      placement="top"
      popper-class="event-marker-popover"
    >
      <template #reference>
        <div class="marker-trigger"></div>
      </template>
      
      <div class="event-details">
        <div class="event-header">
          <h4 class="event-title">{{ event.title }}</h4>
          <el-tag :type="severityTagType" size="small">
            {{ severityText }}
          </el-tag>
        </div>
        
        <div class="event-info">
          <div class="info-item">
            <span class="info-label">类型:</span>
            <span class="info-value">{{ eventTypeText }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">状态:</span>
            <el-tag :type="statusTagType" size="small">
              {{ statusText }}
            </el-tag>
          </div>
          <div class="info-item">
            <span class="info-label">地址:</span>
            <span class="info-value">{{ event.location.address }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">时间:</span>
            <span class="info-value">{{ formatTime(event.createdAt) }}</span>
          </div>
          <div v-if="event.reporter" class="info-item">
            <span class="info-label">报告人:</span>
            <span class="info-value">{{ event.reporter.name }}</span>
          </div>
        </div>
        
        <div class="event-description">
          <p>{{ event.description }}</p>
        </div>
        
        <div class="event-actions">
          <el-button size="small" type="primary" @click="handleViewDetails">
            查看详情
          </el-button>
          <el-button 
            v-if="event.status === 'pending'"
            size="small" 
            type="success" 
            @click="handleProcess"
          >
            开始处理
          </el-button>
          <el-button size="small" @click="handleAssignResource">
            分配资源
          </el-button>
        </div>
      </div>
    </el-popover>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { 
  Warning, 
  Fire, 
  CarCrash, 
  FirstAid, 
  Shield, 
  Tools, 
  QuestionFilled 
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { EmergencyEvent } from '@/types/emergency'

// Props定义
interface Props {
  event: EmergencyEvent
  showLabel?: boolean
  size?: 'small' | 'medium' | 'large'
  interactive?: boolean
  selected?: boolean
  animated?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showLabel: false,
  size: 'medium',
  interactive: true,
  selected: false,
  animated: true
})

// Emits定义
interface Emits {
  click: [event: EmergencyEvent]
  viewDetails: [event: EmergencyEvent]
  process: [event: EmergencyEvent]
  assignResource: [event: EmergencyEvent]
}

const emit = defineEmits<Emits>()

// 响应式数据
const showPopover = ref(false)

// 计算属性
const markerClass = computed(() => {
  return [
    `severity-${props.event.severity}`,
    `status-${props.event.status}`,
    `size-${props.size}`,
    {
      'interactive': props.interactive,
      'selected': props.selected,
      'animated': props.animated && props.event.severity === 'critical'
    }
  ]
})

// 事件图标映射
const eventIconMap = {
  fire: Fire,
  accident: CarCrash,
  medical: FirstAid,
  security: Shield,
  equipment_failure: Tools,
  natural_disaster: Warning,
  other: QuestionFilled
}

const eventIcon = computed(() => {
  return eventIconMap[props.event.type] || QuestionFilled
})

// 图标尺寸
const iconSize = computed(() => {
  const sizeMap = {
    small: 14,
    medium: 18,
    large: 24
  }
  return sizeMap[props.size]
})

// 图标样式
const iconStyle = computed(() => {
  const severityColors = {
    critical: '#ff4d4f',
    high: '#ff7a45',
    medium: '#faad14',
    low: '#52c41a'
  }
  
  const sizes = {
    small: '24px',
    medium: '32px',
    large: '40px'
  }
  
  return {
    backgroundColor: severityColors[props.event.severity],
    width: sizes[props.size],
    height: sizes[props.size]
  }
})

// 标签样式
const labelStyle = computed(() => {
  const severityColors = {
    critical: '#ff4d4f',
    high: '#ff7a45',
    medium: '#faad14',
    low: '#52c41a'
  }
  
  return {
    borderColor: severityColors[props.event.severity],
    color: severityColors[props.event.severity]
  }
})

// 严重程度文本
const severityText = computed(() => {
  const severityMap = {
    critical: '紧急',
    high: '高级',
    medium: '中级',
    low: '低级'
  }
  return severityMap[props.event.severity]
})

// 严重程度标签类型
const severityTagType = computed(() => {
  const typeMap = {
    critical: 'danger',
    high: 'warning',
    medium: 'primary',
    low: 'success'
  }
  return typeMap[props.event.severity] as any
})

// 状态文本
const statusText = computed(() => {
  const statusMap = {
    pending: '待处理',
    processing: '处理中',
    resolved: '已解决',
    closed: '已关闭'
  }
  return statusMap[props.event.status]
})

// 状态标签类型
const statusTagType = computed(() => {
  const typeMap = {
    pending: 'warning',
    processing: 'primary',
    resolved: 'success',
    closed: 'info'
  }
  return typeMap[props.event.status] as any
})

// 事件类型文本
const eventTypeText = computed(() => {
  const typeMap = {
    fire: '火灾',
    accident: '事故',
    medical: '医疗',
    security: '安全',
    equipment_failure: '设备故障',
    natural_disaster: '自然灾害',
    other: '其他'
  }
  return typeMap[props.event.type]
})

// 格式化时间
const formatTime = (date: Date) => {
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 处理点击事件
const handleClick = (e: Event) => {
  e.stopPropagation()
  
  if (props.interactive) {
    showPopover.value = !showPopover.value
    emit('click', props.event)
  }
}

// 查看详情
const handleViewDetails = () => {
  showPopover.value = false
  emit('viewDetails', props.event)
}

// 开始处理
const handleProcess = () => {
  showPopover.value = false
  emit('process', props.event)
  ElMessage.success('事件已开始处理')
}

// 分配资源
const handleAssignResource = () => {
  showPopover.value = false
  emit('assignResource', props.event)
}

// 监听选中状态变化
watch(
  () => props.selected,
  (selected) => {
    if (selected) {
      showPopover.value = true
    }
  }
)
</script>

<style lang="scss" scoped>
.event-marker {
  position: relative;
  cursor: pointer;
  user-select: none;
  
  &.interactive:hover {
    .marker-icon {
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
  }
  
  &.selected {
    .marker-icon {
      transform: scale(1.2);
      box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.3);
    }
  }
  
  &.animated {
    .marker-icon {
      animation: bounce 2s infinite;
    }
  }
  
  .marker-icon {
    position: relative;
    border: 2px solid #ffffff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    
    .marker-symbol {
      color: #ffffff;
      z-index: 2;
    }
    
    .pulse-ring {
      position: absolute;
      top: -4px;
      left: -4px;
      right: -4px;
      bottom: -4px;
      border: 2px solid #ff4d4f;
      border-radius: 50%;
      animation: pulse 2s infinite;
      opacity: 0.6;
    }
    
    .status-indicator {
      position: absolute;
      top: -2px;
      right: -2px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      border: 1px solid #ffffff;
      
      &.pending {
        background: #faad14;
      }
      
      &.processing {
        background: #1890ff;
        animation: blink 1s infinite;
      }
      
      &.resolved {
        background: #52c41a;
      }
      
      &.closed {
        background: #d9d9d9;
      }
    }
  }
  
  .marker-label {
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-top: 4px;
    padding: 2px 6px;
    background: rgba(0, 0, 0, 0.7);
    color: #ffffff;
    font-size: 11px;
    border-radius: 3px;
    white-space: nowrap;
    border: 1px solid;
    backdrop-filter: blur(4px);
    
    &::before {
      content: '';
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 4px solid transparent;
      border-bottom-color: rgba(0, 0, 0, 0.7);
    }
  }
  
  .marker-trigger {
    position: absolute;
    top: -10px;
    left: -10px;
    right: -10px;
    bottom: -10px;
  }
}

// 尺寸变体
.event-marker {
  &.size-small {
    .marker-icon {
      .pulse-ring {
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
      }
      
      .status-indicator {
        width: 6px;
        height: 6px;
      }
    }
  }
  
  &.size-large {
    .marker-icon {
      .pulse-ring {
        top: -6px;
        left: -6px;
        right: -6px;
        bottom: -6px;
      }
      
      .status-indicator {
        width: 10px;
        height: 10px;
      }
    }
  }
}

// 严重程度样式
.event-marker {
  &.severity-critical {
    .marker-icon {
      box-shadow: 0 0 20px rgba(255, 77, 79, 0.4);
    }
  }
  
  &.severity-high {
    .marker-icon {
      box-shadow: 0 0 15px rgba(255, 122, 69, 0.3);
    }
  }
}

// 动画定义
@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.3;
  }
  100% {
    transform: scale(1.4);
    opacity: 0;
  }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-4px);
  }
  60% {
    transform: translateY(-2px);
  }
}

@keyframes blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0.3;
  }
}
</style>

<style lang="scss">
// 全局样式 - 弹窗样式
.event-marker-popover {
  .el-popover__content {
    padding: 0 !important;
  }
  
  .event-details {
    .event-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-bottom: 1px solid #e8e8e8;
      background: #fafafa;
      
      .event-title {
        margin: 0;
        font-size: 14px;
        color: #1890ff;
      }
    }
    
    .event-info {
      padding: 12px 16px;
      
      .info-item {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
        font-size: 12px;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .info-label {
          width: 60px;
          color: #666;
          font-weight: 500;
        }
        
        .info-value {
          flex: 1;
          color: #333;
        }
      }
    }
    
    .event-description {
      padding: 0 16px 12px;
      
      p {
        margin: 0;
        font-size: 12px;
        color: #666;
        line-height: 1.5;
      }
    }
    
    .event-actions {
      padding: 12px 16px;
      border-top: 1px solid #e8e8e8;
      background: #fafafa;
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }
  }
}
</style>