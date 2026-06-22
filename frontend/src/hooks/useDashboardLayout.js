import { useState, useEffect, useCallback, useMemo } from 'react'
import { useHistory } from './useHistory'
import { getFingerprint } from '../lib/fingerprint'
import { 
  generateDefaultLayout, 
  generatePresetLayout, 
  mergeLayoutWithServices,
  CARD_SIZE,
  LAYOUT_PRESET,
  LAYOUT_PRESETS
} from '../lib/layoutConfig'
import { safeJsonParse, debounce } from '../lib/utils'

const STORAGE_PREFIX = 'hm_layout_'

export function useDashboardLayout(services) {
  const [fingerprint, setFingerprint] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const {
    state: layout,
    set: setLayout,
    undo,
    redo,
    canUndo,
    canRedo,
    reset
  } = useHistory(null, { maxHistory: 50 })

  const storageKey = useMemo(() => {
    return fingerprint ? `${STORAGE_PREFIX}${fingerprint}` : null
  }, [fingerprint])

  useEffect(() => {
    let mounted = true
    
    async function init() {
      try {
        const fp = await getFingerprint()
        if (mounted) {
          setFingerprint(fp)
        }
      } catch (e) {
        console.warn('Failed to generate fingerprint:', e)
        if (mounted) {
          setFingerprint('default')
        }
      }
    }
    
    init()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (!fingerprint || services.length === 0) return

    const key = `${STORAGE_PREFIX}${fingerprint}`
    const saved = localStorage.getItem(key)
    
    let initialLayout
    if (saved) {
      const parsed = safeJsonParse(saved, null)
      initialLayout = mergeLayoutWithServices(parsed, services)
    } else {
      initialLayout = generateDefaultLayout(services, LAYOUT_PRESET.GRID)
    }
    
    reset(initialLayout)
    setIsLoading(false)
  }, [fingerprint, services.length])

  useEffect(() => {
    if (!storageKey || !layout || isLoading) return

    const saveData = JSON.stringify(layout)
    localStorage.setItem(storageKey, saveData)
  }, [layout, storageKey, isLoading])

  const moveItem = useCallback((fromIndex, toIndex) => {
    if (!layout) return
    if (fromIndex === toIndex) return

    const items = [...layout.items]
    const fromItem = items[fromIndex]
    const toItem = items[toIndex]

    if (fromItem.pinned && !toItem.pinned) return
    if (!fromItem.pinned && toItem.pinned) {
      let targetIndex = toIndex
      while (targetIndex > 0 && items[targetIndex - 1].pinned) {
        targetIndex--
      }
      if (targetIndex === fromIndex) return
      toIndex = targetIndex
    }

    const [moved] = items.splice(fromIndex, 1)
    items.splice(toIndex, 0, moved)

    items.forEach((item, index) => {
      item.order = index
    })

    setLayout({
      ...layout,
      items
    })
  }, [layout, setLayout])

  const toggleCardSize = useCallback((serviceId) => {
    if (!layout) return

    const items = layout.items.map(item => {
      if (item.id === serviceId) {
        return {
          ...item,
          size: item.size === CARD_SIZE.SMALL ? CARD_SIZE.LARGE : CARD_SIZE.SMALL
        }
      }
      return item
    })

    setLayout({
      ...layout,
      items
    })
  }, [layout, setLayout])

  const togglePin = useCallback((serviceId) => {
    if (!layout) return

    const items = [...layout.items]
    const itemIndex = items.findIndex(item => item.id === serviceId)
    if (itemIndex === -1) return

    const item = items[itemIndex]
    const newPinned = !item.pinned

    if (newPinned) {
      items.splice(itemIndex, 1)
      let insertIndex = 0
      while (insertIndex < items.length && items[insertIndex].pinned) {
        insertIndex++
      }
      items.splice(insertIndex, 0, { ...item, pinned: true })
    } else {
      let unpinnedStart = 0
      while (unpinnedStart < items.length && items[unpinnedStart].pinned) {
        unpinnedStart++
      }
      if (itemIndex !== unpinnedStart) {
        items.splice(itemIndex, 1)
        items.splice(unpinnedStart, 0, { ...item, pinned: false })
      } else {
        items[itemIndex] = { ...item, pinned: false }
      }
    }

    items.forEach((it, index) => {
      it.order = index
    })

    setLayout({
      ...layout,
      items
    })
  }, [layout, setLayout])

  const applyPreset = useCallback((preset) => {
    if (!services.length) return

    const newLayout = generatePresetLayout(services, preset)
    setLayout(newLayout)
  }, [services, setLayout])

  const resetToDefault = useCallback(() => {
    if (!services.length) return
    const newLayout = generateDefaultLayout(services, LAYOUT_PRESET.GRID)
    setLayout(newLayout)
  }, [services, setLayout])

  const getSortedServices = useCallback(() => {
    if (!layout) return services

    return layout.items
      .sort((a, b) => a.order - b.order)
      .map(item => {
        const service = services.find(s => s.id === item.id)
        return service ? { ...service, layoutItem: item } : null
      })
      .filter(Boolean)
  }, [layout, services])

  const isResponsiveSingleColumn = useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth < 768
  }, [])

  return {
    layout,
    isLoading,
    fingerprint,
    moveItem,
    toggleCardSize,
    togglePin,
    applyPreset,
    resetToDefault,
    undo,
    redo,
    canUndo,
    canRedo,
    getSortedServices,
    isResponsiveSingleColumn,
    currentPreset: layout?.preset,
    presets: LAYOUT_PRESETS
  }
}

export default useDashboardLayout
