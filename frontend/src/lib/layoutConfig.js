export const CARD_SIZE = {
  SMALL: 'small',
  LARGE: 'large'
}

export const LAYOUT_PRESET = {
  GRID: 'grid',
  LIST: 'list',
  COMPACT: 'compact'
}

export const LAYOUT_PRESETS = {
  [LAYOUT_PRESET.GRID]: {
    id: LAYOUT_PRESET.GRID,
    name: '网格视图',
    icon: '⊞',
    description: '均匀分布，适合大屏展示',
    defaultSize: CARD_SIZE.SMALL,
    columns: 3,
    gap: 16
  },
  [LAYOUT_PRESET.LIST]: {
    id: LAYOUT_PRESET.LIST,
    name: '列表视图',
    icon: '☰',
    description: '单列排列，信息完整',
    defaultSize: CARD_SIZE.LARGE,
    columns: 1,
    gap: 12
  },
  [LAYOUT_PRESET.COMPACT]: {
    id: LAYOUT_PRESET.COMPACT,
    name: '紧凑视图',
    icon: '⊡',
    description: '紧密排列，浏览高效',
    defaultSize: CARD_SIZE.SMALL,
    columns: 4,
    gap: 8
  }
}

export const CARD_DIMENSIONS = {
  [CARD_SIZE.SMALL]: {
    minWidth: 280,
    flexBasis: 'calc(33.333% - 16px)',
    padding: 16
  },
  [CARD_SIZE.LARGE]: {
    minWidth: 320,
    flexBasis: 'calc(66.666% - 16px)',
    padding: 20
  }
}

export function generateDefaultLayout(services, preset = LAYOUT_PRESET.GRID) {
  const presetConfig = LAYOUT_PRESETS[preset]
  return {
    preset,
    columns: presetConfig.columns,
    gap: presetConfig.gap,
    items: services.map((service, index) => ({
      id: service.id,
      size: presetConfig.defaultSize,
      order: index,
      pinned: false
    }))
  }
}

export function generatePresetLayout(services, preset) {
  const presetConfig = LAYOUT_PRESETS[preset]
  return {
    preset,
    columns: presetConfig.columns,
    gap: presetConfig.gap,
    items: services.map((service, index) => ({
      id: service.id,
      size: presetConfig.defaultSize,
      order: index,
      pinned: index < 2
    }))
  }
}

export function findInsertPosition(newService, currentItems, services) {
  const statusPriority = {
    down: 0,
    maintenance: 1,
    unknown: 2,
    up: 3
  }

  const newStatus = newService.summary?.status || 'unknown'
  const newPriority = statusPriority[newStatus]

  let insertIndex = currentItems.length

  for (let i = 0; i < currentItems.length; i++) {
    const item = currentItems[i]
    const existingService = services.find(s => s.id === item.id)
    const existingStatus = existingService?.summary?.status || 'unknown'
    const existingPriority = statusPriority[existingStatus]

    if (item.pinned) continue

    if (newPriority < existingPriority) {
      insertIndex = i
      break
    }
  }

  return insertIndex
}

export function mergeLayoutWithServices(savedLayout, services) {
  if (!savedLayout || !savedLayout.items) {
    return generateDefaultLayout(services)
  }

  const existingIds = new Set(savedLayout.items.map(item => item.id))
  const serviceIds = new Set(services.map(s => s.id))

  const filteredItems = savedLayout.items.filter(item => serviceIds.has(item.id))

  const newServices = services.filter(s => !existingIds.has(s.id))
  
  for (const newService of newServices) {
    const insertIndex = findInsertPosition(newService, filteredItems, services)
    filteredItems.splice(insertIndex, 0, {
      id: newService.id,
      size: savedLayout.preset ? LAYOUT_PRESETS[savedLayout.preset].defaultSize : CARD_SIZE.SMALL,
      order: insertIndex,
      pinned: false
    })
  }

  filteredItems.forEach((item, index) => {
    item.order = index
  })

  return {
    ...savedLayout,
    items: filteredItems
  }
}
