import React, { useState } from 'react'
import StatusBadge from './StatusBadge.jsx'
import MiniAvailabilityBars from './MiniAvailabilityBars.jsx'
import { formatRelativeTime } from '../lib/utils'
import { CARD_SIZE, CARD_DIMENSIONS } from '../lib/layoutConfig'

export default function ServiceCard({ 
  service, 
  onClick, 
  selected,
  onToggleSize,
  onTogglePin,
  isDragging,
  dragHandleProps,
  isResponsiveSingleColumn
}) {
  const [showActions, setShowActions] = useState(false)
  
  const layoutItem = service.layoutItem || {}
  const size = layoutItem.size || CARD_SIZE.SMALL
  const isLarge = size === CARD_SIZE.LARGE
  const isPinned = layoutItem.pinned || false
  const dimensions = CARD_DIMENSIONS[size]

  const statusColor = {
    up: '#10b981', down: '#ef4444', maintenance: '#f59e0b', unknown: '#9ca3af'
  }[service.summary?.status] || '#9ca3af'

  const avail = service.summary?.availability ?? 0
  const availColor = avail >= 99 ? '#059669' : avail >= 95 ? '#d97706' : '#dc2626'

  const handleToggleSize = (e) => {
    e.stopPropagation()
    onToggleSize && onToggleSize(service.id)
  }

  const handleTogglePin = (e) => {
    e.stopPropagation()
    onTogglePin && onTogglePin(service.id)
  }

  const flexBasis = isResponsiveSingleColumn ? '100%' : dimensions.flexBasis

  return (
    <div
      onClick={onClick}
      draggable={!isDragging}
      {...dragHandleProps}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      style={{
        background: '#fff',
        borderRadius: 14,
        padding: dimensions.padding,
        border: selected ? `2px solid ${statusColor}` : '2px solid transparent',
        boxShadow: selected 
          ? `0 4px 20px ${statusColor}33` 
          : isDragging 
            ? '0 10px 40px rgba(0,0,0,0.2)'
            : '0 1px 3px rgba(0,0,0,0.06)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        minWidth: isResponsiveSingleColumn ? '100%' : dimensions.minWidth,
        flex: `1 1 ${flexBasis}`,
        opacity: isDragging ? 0.8 : 1,
        transform: isDragging ? 'rotate(2deg) scale(1.02)' : 'none',
        position: 'relative',
        overflow: 'visible',
        touchAction: 'none'
      }}
    >
      {isPinned && (
        <div style={{
          position: 'absolute',
          top: -8,
          right: 16,
          background: '#f59e0b',
          color: '#fff',
          fontSize: 10,
          padding: '2px 8px',
          borderRadius: 999,
          fontWeight: 600,
          zIndex: 1
        }}>
          置顶
        </div>
      )}

      {showActions && (
        <div style={{
          position: 'absolute',
          top: 8,
          right: 8,
          display: 'flex',
          gap: 4,
          zIndex: 2,
          opacity: showActions ? 1 : 0,
          transition: 'opacity 0.2s'
        }}>
          <button
            onClick={handleTogglePin}
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              border: 'none',
              background: isPinned ? '#f59e0b' : '#f3f4f6',
              color: isPinned ? '#fff' : '#6b7280',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              transition: 'all 0.2s'
            }}
            title={isPinned ? '取消置顶' : '置顶'}
          >
            📌
          </button>
          <button
            onClick={handleToggleSize}
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              border: 'none',
              background: isLarge ? '#6366f1' : '#f3f4f6',
              color: isLarge ? '#fff' : '#6b7280',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              transition: 'all 0.2s'
            }}
            title={isLarge ? '缩小卡片' : '放大卡片'}
          >
            {isLarge ? '⊟' : '⊞'}
          </button>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: '#e5e7eb',
              color: '#6b7280',
              cursor: 'grab',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              touchAction: 'none'
            }}
            title="拖拽排序"
            {...dragHandleProps}
          >
            ⋮⋮
          </div>
        </div>
      )}

      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        marginBottom: isLarge ? 16 : 12 
      }}>
        <div>
          <h3 style={{ 
            fontSize: isLarge ? 18 : 16, 
            fontWeight: 600, 
            marginBottom: 4,
            paddingRight: 100
          }}>
            {service.name}
          </h3>
          <div style={{ fontSize: 12, color: '#6b7280', fontFamily: 'monospace' }}>
            {service.type.toUpperCase()} · {service.target}
            {service.type === 'tcp' && service.port ? `:${service.port}` : ''}
          </div>
        </div>
        <StatusBadge status={service.summary?.status} />
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isLarge ? '1fr 1fr 1fr' : '1fr 1fr', 
        gap: isLarge ? 16 : 12, 
        marginBottom: isLarge ? 16 : 12 
      }}>
        <div style={{ background: '#f9fafb', padding: isLarge ? 14 : 10, borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>可用率</div>
          <div style={{ 
            fontSize: isLarge ? 24 : 20, 
            fontWeight: 700, 
            color: availColor 
          }}>
            {avail.toFixed(2)}%
          </div>
        </div>
        <div style={{ background: '#f9fafb', padding: isLarge ? 14 : 10, borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>平均响应</div>
          <div style={{ 
            fontSize: isLarge ? 24 : 20, 
            fontWeight: 700, 
            color: '#4f46e5' 
          }}>
            {service.summary?.avgResponseTime || 0}ms
          </div>
        </div>
        {isLarge && (
          <div style={{ background: '#f9fafb', padding: 14, borderRadius: 8 }}>
            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>检测次数</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#0891b2' }}>
              {service.summary?.successfulChecks || 0}
              <span style={{ fontSize: 14, color: '#9ca3af', fontWeight: 500 }}>
                /{service.summary?.totalChecks || 0}
              </span>
            </div>
          </div>
        )}
      </div>

      <MiniAvailabilityBars serviceId={service.id} />

      {service.summary?.lastCheck && (
        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: isLarge ? 12 : 10 }}>
          上次检测: {formatRelativeTime(service.summary.lastCheck)}
        </div>
      )}

      {isLarge && service.summary?.error_message && (
        <div style={{
          marginTop: 12,
          padding: 10,
          background: '#fef2f2',
          borderRadius: 8,
          border: '1px solid #fecaca'
        }}>
          <div style={{ fontSize: 11, color: '#991b1b', fontWeight: 600, marginBottom: 2 }}>
            最新错误
          </div>
          <div style={{
            fontSize: 12,
            color: '#7f1d1d',
            fontFamily: 'monospace',
            wordBreak: 'break-all',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {service.summary.error_message}
          </div>
        </div>
      )}
    </div>
  )
}
