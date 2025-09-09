<!--
/**
 * @fileoverview 应急资源标注组件
 * @description 用于在地图上显示应急资源的分布和状态，支持不同资源类型的可视化展示
 * @author Emergency Dispatch Development Team
 * @date 2024-01-15
 * @version 1.0.0
 * 
 * @features
 * - 支持4种资源类型（人员、车辆、设备、设施）
 * - 4种状态显示（可用、忙碌、离线、维护中）
 * - 负载指示器显示资源利用率
 * - 状态动画效果
 * - 交互式详情弹窗
 * - 资源调度操作
 * - 设备和技能标签展示
 */
-->

<template>
  <div class="resource-marker" :class="markerClass" @click="handleClick">
    <!-- 资源标注图标：根据资源类型和状态显示不同样式 -->
    <div class="marker-icon" :style="iconStyle">
      <el-icon class="marker-symbol" :size="iconSize">
        <component :is="resourceIcon" />
      </el-icon>
      
      <!-- 状态指示器 -->
      <div class="status-indicator" :class="resource.status"></div>
      
      <!-- 负载指示器 -->
      <div v-if="showLoadIndicator" class="load-indicator">
        <div class="load-bar" :style="loadBarStyle"></div>
      </div>
    </div>
    
    <!-- 标注标签 -->
    <div v-if="showLabel" class="marker-label" :style="labelStyle">
      {{ resource.name }}
    </div>
    
    <!-- 详情弹窗 -->
    <el-popover
      v-model:visible="showPopover"
      :width="320"
      trigger="manual"
      placement="top"
      popper-class="resource-marker-popover"
    >
      <template #reference>
        <div class="marker-trigger"></div>
      </template>
      
      <div class="resource-details">
        <div class="resource-header">
          <div class="header-left">
            <h4 class="resource-name">{{ resource.name }}</h4>
            <span class="resource-code">{{ resource.code }}</span>
          </div>
          <el-tag :type="statusTagType" size="small">
            {{ statusText }}
          </el-tag>
        </div>
        
        <div class="resource-info">
          <div class="info-item">
            <span class="info-label">类型:</span>
            <span class="info-value">{{ resourceTypeText }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">部门:</span>
            <span class="info-value">{{ resource.department }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">容量:</span>
            <div class="capacity-info">
              <el-progress 
                :percentage="loadPercentage" 
                :color="loadColor"
                :show-text="false"
                :stroke-width="6"
              />
              <span class="capacity-text">{{ resource.currentLoad }}/{{ resource.capacity }}</span>
            </div>
          </div>
          <div v-if="resource.contact" class="info-item">
            <span class="info-label">联系人:</span>
            <span class="info-value">{{ resource.contact.name }}</span>
          </div>
          <div v-if="resource.contact" class="info-item">
            <span class="info-label">电话:</span>
            <span class="info-value">{{ resource.contact.phone }}</span>
          </div>
        </div>
        
        <!-- 设备信息 -->
        <div v-if="resource.equipment && resource.equipment.length > 0" class="equipment-section">
          <div class="section-title">配备设备</div>
          <div class="equipment-list">
            <el-tag 
              v-for="equipment in resource.equipment" 
              :key="equipment"
              size="small"
              class="equipment-tag"
            >
              {{ equipment }}
            </el-tag>
          </div>
        </div>
        
        <!-- 技能标签 -->
        <div v-if="resource.skills && resource.skills.length > 0" class="skills-section">
          <div class="section-title">技能标签</div>
          <div class="skills-list">
            <el-tag 
              v-for="skill in resource.skills" 
              :key="skill"
              type="info"
              size="small"
              class="skill-tag"
            >
              {{ skill }}
            </el-tag>
          </div>
        </div>
        
        <div class="resource-actions">
          <el-button size="small" type="primary" @click="handleViewDetails">
            查看详情
          </el-button>
          <el-button 
            v-if="resource.status === 'available'"
            size="small" 
            type="success" 
            @click="handleDispatch"
          >
            立即调度
          </el-button>
          <el-button 
            v-if="resource.status === 'busy'"
            size="small" 
            type="warning" 
            @click="handleTrack"
          >
            跟踪位置
          </el-button>
          <el-button size="small" @click="handleContact">
            联系资源
          </el-button>
        </div>
      </div>
    </el-popover>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { 
  User, 
  Truck, 
  Tools, 
  OfficeBuilding,
  Phone,
  Position
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { EmergencyResource } from '@/types/emergency'

// Props定义
interface Props {
  resource: EmergencyResource
  showLabel?: boolean
  showLoadIndicator?: boolean
  size?: 'small' | 'medium' | 'large'
  interactive?: boolean
  selected?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showLabel: false,
  showLoadIndicator: true,
  size: 'medium',
  interactive: true,
  selected: false
})

// Emits定义
interface Emits {
  click: [resource: EmergencyResource]
  viewDetails: [resource: EmergencyResource]
  dispatch: [resource: EmergencyResource]
  track: [resource: EmergencyResource]
  contact: [resource: EmergencyResource]
}

const emit = defineEmits<Emits>()

// 响应式数据
const showPopover = ref(false)

// 计算属性
const markerClass = computed(() => {
  return [
    `status-${props.resource.status}`,
    `type-${props.resource.type}`,
    `size-${props.size}`,
    {
      'interactive': props.interactive,
      'selected': props.selected,
      'overloaded': loadPercentage.value > 90
    }
  ]
})

// 资源图标映射
const resourceIconMap = {
  personnel: User,
  vehicle: Truck,
  equipment: Tools,
  facility: OfficeBuilding
}

const resourceIcon = computed(() => {
  return resourceIconMap[props.resource.type] || Tools
})

// 图标尺寸
const iconSize = computed(() => {
  const sizeMap = {
    small: 12,
    medium: 16,
    large: 20
  }
  return sizeMap[props.size]
})

// 图标样式
const iconStyle = computed(() => {
  const statusColors = {
    available: '#52c41a',
    busy: '#faad14',
    offline: '#d9d9d9',
    maintenance: '#ff4d4f'
  }
  
  const sizes = {
    small: '20px',
    medium: '24px',
    large: '28px'
  }
  
  return {
    backgroundColor: statusColors[props.resource.status],
    width: sizes[props.size],
    height: sizes[props.size]
  }
})

// 标签样式
const labelStyle = computed(() => {
  const statusColors = {
    available: '#52c41a',
    busy: '#faad14',
    offline: '#d9d9d9',
    maintenance: '#ff4d4f'
  }
  
  return {
    borderColor: statusColors[props.resource.status],
    color: statusColors[props.resource.status]
  }
})

// 负载百分比
const loadPercentage = computed(() => {
  if (props.resource.capacity === 0) return 0
  return Math.round((props.resource.currentLoad / props.resource.capacity) * 100)
})

// 负载条样式
const loadBarStyle = computed(() => {
  return {
    width: `${loadPercentage.value}%`
  }
})

// 负载颜色
const loadColor = computed(() => {
  const percentage = loadPercentage.value
  if (percentage >= 90) return '#ff4d4f'
  if (percentage >= 70) return '#faad14'
  return '#52c41a'
})

// 状态文本
const statusText = computed(() => {
  const statusMap = {
    available: '可用',
    busy: '忙碌',
    offline: '离线',
    maintenance: '维护中'
  }
  return statusMap[props.resource.status]
})

// 状态标签类型
const statusTagType = computed(() => {
  const typeMap = {
    available: 'success',
    busy: 'warning',
    offline: 'info',
    maintenance: 'danger'
  }
  return typeMap[props.resource.status] as any
})

// 资源类型文本
const resourceTypeText = computed(() => {
  const typeMap = {
    personnel: '人员',
    vehicle: '车辆',
    equipment: '设备',
    facility: '设施'
  }
  return typeMap[props.resource.type]
})

// 处理点击事件
const handleClick = (e: Event) => {
  e.stopPropagation()
  
  if (props.interactive) {
    showPopover.value = !showPopover.value
    emit('click', props.resource)
  }
}

// 查看详情
const handleViewDetails = () => {
  showPopover.value = false
  emit('viewDetails', props.resource)
}

// 立即调度
const handleDispatch = () => {
  showPopover.value = false
  emit('dispatch', props.resource)
  ElMessage.success('资源调度指令已发送')
}

// 跟踪位置
const handleTrack = () => {
  showPopover.value = false
  emit('track', props.resource)
  ElMessage.info('开始跟踪资源位置')
}

// 联系资源
const handleContact = () => {
  showPopover.value = false
  emit('contact', props.resource)
  
  if (props.resource.contact) {
    ElMessage.success(`正在呼叫 ${props.resource.contact.name}`)
  } else {
    ElMessage.warning('该资源暂无联系方式')
  }
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
.resource-marker {
  position: relative;
  cursor: pointer;
  user-select: none;
  
  &.interactive:hover {
    .marker-icon {
      transform: scale(1.1);
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
    }
  }
  
  &.selected {
    .marker-icon {
      transform: scale(1.15);
      box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.4);
    }
  }
  
  &.overloaded {
    .marker-icon {
      animation: shake 0.5s infinite;
    }
  }
  
  .marker-icon {
    position: relative;
    border: 2px solid #ffffff;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    
    .marker-symbol {
      color: #ffffff;
      z-index: 2;
    }
    
    .status-indicator {
      position: absolute;
      top: -3px;
      right: -3px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      border: 1px solid #ffffff;
      
      &.available {
        background: #52c41a;
      }
      
      &.busy {
        background: #faad14;
        animation: pulse-status 2s infinite;
      }
      
      &.offline {
        background: #d9d9d9;
      }
      
      &.maintenance {
        background: #ff4d4f;
        animation: blink 1s infinite;
      }
    }
    
    .load-indicator {
      position: absolute;
      bottom: -6px;
      left: 0;
      right: 0;
      height: 3px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 2px;
      overflow: hidden;
      
      .load-bar {
        height: 100%;
        background: #52c41a;
        border-radius: 2px;
        transition: all 0.3s ease;
        
        .resource-marker.overloaded & {
          background: #ff4d4f;
        }
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
    font-size: 10px;
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
      border: 3px solid transparent;
      border-bottom-color: rgba(0, 0, 0, 0.7);
    }
  }
  
  .marker-trigger {
    position: absolute;
    top: -8px;
    left: -8px;
    right: -8px;
    bottom: -8px;
  }
}

// 尺寸变体
.resource-marker {
  &.size-small {
    .marker-icon {
      .status-indicator {
        width: 6px;
        height: 6px;
        top: -2px;
        right: -2px;
      }
      
      .load-indicator {
        height: 2px;
        bottom: -4px;
      }
    }
  }
  
  &.size-large {
    .marker-icon {
      .status-indicator {
        width: 10px;
        height: 10px;
        top: -4px;
        right: -4px;
      }
      
      .load-indicator {
        height: 4px;
        bottom: -8px;
      }
    }
  }
}

// 动画定义
@keyframes pulse-status {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
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

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-1px);
  }
  75% {
    transform: translateX(1px);
  }
}
</style>

<style lang="scss">
// 全局样式 - 弹窗样式
.resource-marker-popover {
  .el-popover__content {
    padding: 0 !important;
  }
  
  .resource-details {
    .resource-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-bottom: 1px solid #e8e8e8;
      background: #fafafa;
      
      .header-left {
        .resource-name {
          margin: 0 0 4px 0;
          font-size: 14px;
          color: #1890ff;
        }
        
        .resource-code {
          font-size: 11px;
          color: #999;
          background: #f0f0f0;
          padding: 2px 6px;
          border-radius: 3px;
        }
      }
    }
    
    .resource-info {
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
        
        .capacity-info {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 8px;
          
          .el-progress {
            flex: 1;
          }
          
          .capacity-text {
            font-size: 11px;
            color: #666;
            font-family: 'Courier New', monospace;
            min-width: 40px;
          }
        }
      }
    }
    
    .equipment-section,
    .skills-section {
      padding: 0 16px 12px;
      
      .section-title {
        font-size: 12px;
        font-weight: 500;
        color: #666;
        margin-bottom: 6px;
      }
      
      .equipment-list,
      .skills-list {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        
        .equipment-tag,
        .skill-tag {
          font-size: 10px;
        }
      }
    }
    
    .resource-actions {
      padding: 12px 16px;
      border-top: 1px solid #e8e8e8;
      background: #fafafa;
      display: flex;
      gap: 6px;
      justify-content: flex-end;
      flex-wrap: wrap;
    }
  }
}
</style>