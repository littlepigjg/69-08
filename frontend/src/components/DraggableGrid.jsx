import React, { useState, useRef, useCallback, useEffect } from 'react'
import ServiceCard from './ServiceCard.jsx'
import { CARD_DIMENSIONS } from '../lib/layoutConfig'

export default function DraggableGrid({
  services,
  onMoveItem,
  onToggleSize,
  onTogglePin,
  selectedService,
  onSelectService,
  isResponsiveSingleColumn
}) {
  const [draggingIndex, setDraggingIndex] = useState(null)
  const [dragOverIndex, setDragOverIndex] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [showGuides, setShowGuides] = useState(false)
  const [guidePosition, setGuidePosition] = useState({ x: 0, y: 0, type: 'left' })
  const [placeholderRect, setPlaceholderRect] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const containerRef = useRef(null)
  const itemRefs = useRef([])
  const dragStartPos = useRef({ x: 0, y: 0 })
  const currentPos = useRef({ x: 0, y: 0 })
  const longPressTimer = useRef(null)
  const isTouchDevice = typeof window !== 'undefined' && 'ontouchstart' in window

  const handleDragStart = useCallback((index, e) => {
    const service = services[index]
    if (service?.layoutItem?.pinned) return

    setDraggingIndex(index)
    setIsDragging(true)
    setShowGuides(true)

    const rect = itemRefs.current[index]?.getBoundingClientRect()
    if (rect) {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      const clientY = e.touches ? e.touches[0].clientY : e.clientY
      setDragOffset({
        x: clientX - rect.left,
        y: clientY - rect.top
      })
      setPlaceholderRect({
        width: rect.width,
        height: rect.height
      })
    }

    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move'
      try {
        e.dataTransfer.setData('text/plain', index.toString())
      } catch (err) {}
    }
  }, [services])

  const handleDragEnd = useCallback(() => {
    if (draggingIndex !== null && dragOverIndex !== null && draggingIndex !== dragOverIndex) {
      onMoveItem(draggingIndex, dragOverIndex)
    }

    setDraggingIndex(null)
    setDragOverIndex(null)
    setIsDragging(false)
    setShowGuides(false)
    setPlaceholderRect(null)

    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }, [draggingIndex, dragOverIndex, onMoveItem])

  const handleDragOver = useCallback((index, e) => {
    e.preventDefault()
    if (!isDragging || draggingIndex === null) return

    const targetService = services[index]
    if (targetService?.layoutItem?.pinned) return

    const rect = itemRefs.current[index]?.getBoundingClientRect()
    if (!rect) return

    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY

    const relativeX = clientX - rect.left
    const relativeY = clientY - rect.top
    const insertBefore = relativeX < rect.width / 2

    if (index !== dragOverIndex) {
      setDragOverIndex(index)
    }

    const snapThreshold = 20

    let guideType = insertBefore ? 'left' : 'right'
    let guideX = insertBefore ? rect.left : rect.right
    const containerRect = containerRef.current?.getBoundingClientRect()
    if (containerRect) {
      guideX -= containerRect.left
    }

    setGuidePosition({
      x: guideX,
      y: rect.top - (containerRect?.top || 0),
      height: rect.height,
      type: guideType
    })

    if (Math.abs(relativeY - rect.height / 2) < snapThreshold) {
      setGuidePosition(prev => ({ ...prev, showHorizontal: true }))
    } else {
      setGuidePosition(prev => ({ ...prev, showHorizontal: false }))
    }
  }, [isDragging, draggingIndex, dragOverIndex, services])

  const handleTouchStart = useCallback((index, e) => {
    const touch = e.touches[0]
    dragStartPos.current = { x: touch.clientX, y: touch.clientY }
    currentPos.current = { x: touch.clientX, y: touch.clientY }

    longPressTimer.current = setTimeout(() => {
      handleDragStart(index, e)
      if (navigator.vibrate) {
        navigator.vibrate(50)
      }
    }, 200)
  }, [handleDragStart])

  const handleTouchMove = useCallback((e) => {
    if (!isDragging) {
      const touch = e.touches[0]
      const dx = Math.abs(touch.clientX - dragStartPos.current.x)
      const dy = Math.abs(touch.clientY - dragStartPos.current.y)
      if (dx > 10 || dy > 10) {
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current)
          longPressTimer.current = null
        }
      }
      return
    }

    e.preventDefault()
    const touch = e.touches[0]
    currentPos.current = { x: touch.clientX, y: touch.clientY }

    const containerRect = containerRef.current?.getBoundingClientRect()
    if (!containerRect) return

    for (let i = 0; i < itemRefs.current.length; i++) {
      const itemRect = itemRefs.current[i]?.getBoundingClientRect()
      if (!itemRect) continue

      if (
        touch.clientX >= itemRect.left &&
        touch.clientX <= itemRect.right &&
        touch.clientY >= itemRect.top &&
        touch.clientY <= itemRect.bottom
      ) {
        handleDragOver(i, e)
        break
      }
    }
  }, [isDragging, handleDragOver])

  const handleTouchEnd = useCallback(() => {
    if (isDragging) {
      handleDragEnd()
    } else if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }, [isDragging, handleDragEnd])

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleDragEnd()
      }
    }

    const handleGlobalMouseMove = (e) => {
      if (!isDragging || draggingIndex === null) return

      const containerRect = containerRef.current?.getBoundingClientRect()
      if (!containerRect) return

      for (let i = 0; i < itemRefs.current.length; i++) {
        if (i === draggingIndex) continue
        const itemRect = itemRefs.current[i]?.getBoundingClientRect()
        if (!itemRect) continue

        if (
          e.clientX >= itemRect.left &&
          e.clientX <= itemRect.right &&
          e.clientY >= itemRect.top &&
          e.clientY <= itemRect.bottom
        ) {
          handleDragOver(i, e)
          break
        }
      }
    }

    if (isDragging && !isTouchDevice) {
      window.addEventListener('mouseup', handleGlobalMouseUp)
      window.addEventListener('mousemove', handleGlobalMouseMove)
    }

    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp)
      window.removeEventListener('mousemove', handleGlobalMouseMove)
    }
  }, [isDragging, draggingIndex, handleDragOver, handleDragEnd, isTouchDevice])

  const renderItem = (service, index) => {
    const isDraggingThis = draggingIndex === index
    const isDragOverThis = dragOverIndex === index
    const showPlaceholder = isDragOverThis && placeholderRect && draggingIndex !== null

    const dragHandleProps = isTouchDevice ? {
      onTouchStart: (e) => handleTouchStart(index, e),
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd
    } : {
      onDragStart: (e) => handleDragStart(index, e),
      onDragEnd: handleDragEnd
    }

    return (
      <React.Fragment key={service.id}>
        {showPlaceholder && dragOverIndex < draggingIndex && (
          <div
            style={{
              flex: '1 1 calc(33.333% - 16px)',
              minWidth: placeholderRect.width,
              height: placeholderRect.height,
              background: 'linear-gradient(135deg, #6366f133 0%, #8b5cf633 100%)',
              border: '2px dashed #6366f1',
              borderRadius: 14,
              animation: 'pulse 1.5s infinite',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6366f1',
              fontSize: 12,
              fontWeight: 600
            }}
          >
            放置到这里
          </div>
        )}

        {!isDraggingThis && (
          <div
            ref={el => itemRefs.current[index] = el}
            style={{
              display: 'contents'
            }}
            onDragOver={(e) => {
              e.preventDefault()
              handleDragOver(index, e)
            }}
          >
            <ServiceCard
              service={service}
              selected={selectedService === service.id}
              onClick={() => onSelectService(service.id)}
              onToggleSize={onToggleSize}
              onTogglePin={onTogglePin}
              isDragging={false}
              dragHandleProps={dragHandleProps}
              isResponsiveSingleColumn={isResponsiveSingleColumn}
            />
          </div>
        )}

        {showPlaceholder && dragOverIndex > draggingIndex && (
          <div
            style={{
              flex: '1 1 calc(33.333% - 16px)',
              minWidth: placeholderRect.width,
              height: placeholderRect.height,
              background: 'linear-gradient(135deg, #6366f133 0%, #8b5cf633 100%)',
              border: '2px dashed #6366f1',
              borderRadius: 14,
              animation: 'pulse 1.5s infinite',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6366f1',
              fontSize: 12,
              fontWeight: 600
            }}
          >
            放置到这里
          </div>
        )}
      </React.Fragment>
    )
  }

  const gap = services[0]?.layoutItem?.size === 'small' ? 16 : 12

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: gap,
        position: 'relative',
        minHeight: 200
      }}
      onDragOver={(e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
      }}
    >
      {showGuides && (
        <>
          <div
            style={{
              position: 'absolute',
              left: guidePosition.x,
              top: guidePosition.y,
              width: 3,
              height: guidePosition.height,
              background: 'linear-gradient(to bottom, #6366f1, #8b5cf6)',
              borderRadius: 2,
              zIndex: 100,
              pointerEvents: 'none',
              boxShadow: '0 0 10px rgba(99, 102, 241, 0.5)',
              animation: 'guidePulse 0.5s infinite alternate'
            }}
          />
          {guidePosition.showHorizontal && (
            <div
              style={{
                position: 'absolute',
                left: guidePosition.x - 50,
                top: guidePosition.y + guidePosition.height / 2,
                width: 100,
                height: 3,
                background: 'linear-gradient(to right, #6366f1, #8b5cf6)',
                borderRadius: 2,
                zIndex: 100,
                pointerEvents: 'none',
                boxShadow: '0 0 10px rgba(99, 102, 241, 0.5)'
              }}
            />
          )}
        </>
      )}

      {services.map((service, index) => renderItem(service, index))}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes guidePulse {
          0% { opacity: 0.8; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
