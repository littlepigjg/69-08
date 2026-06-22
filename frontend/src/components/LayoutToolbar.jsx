import React, { useState } from 'react'
import { LAYOUT_PRESETS } from '../lib/layoutConfig'

export default function LayoutToolbar({
  currentPreset,
  presets,
  onApplyPreset,
  onReset,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  fingerprint
}) {
  const [showPresets, setShowPresets] = useState(false)

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 12px',
      background: '#fff',
      borderRadius: 12,
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      flexWrap: 'wrap'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        marginRight: 8
      }}>
        <span style={{ fontSize: 14, color: '#6b7280', marginRight: 4 }}>布局:</span>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowPresets(!showPresets)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500,
              color: '#1f2937',
              transition: 'all 0.2s'
            }}
            onBlur={() => setTimeout(() => setShowPresets(false), 150)}
          >
            <span style={{ fontSize: 16 }}>{presets[currentPreset]?.icon || '⊞'}</span>
            <span>{presets[currentPreset]?.name || '自定义'}</span>
            <span style={{ fontSize: 10, color: '#9ca3af' }}>▼</span>
          </button>

          {showPresets && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: 4,
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: 10,
              boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
              zIndex: 1000,
              minWidth: 200,
              overflow: 'hidden'
            }}>
              {Object.values(presets).map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    onApplyPreset(preset.id)
                    setShowPresets(false)
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 14px',
                    background: currentPreset === preset.id ? '#f0f9ff' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.2s',
                    borderBottom: '1px solid #f3f4f6'
                  }}
                >
                  <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>
                    {preset.icon}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: currentPreset === preset.id ? '#0284c7' : '#1f2937'
                    }}>
                      {preset.name}
                    </div>
                    <div style={{ fontSize: 11, color: '#6b7280' }}>
                      {preset.description}
                    </div>
                  </div>
                  {currentPreset === preset.id && (
                    <span style={{ color: '#0284c7', fontSize: 14 }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '0 8px',
        borderLeft: '1px solid #e5e7eb',
        borderRight: '1px solid #e5e7eb'
      }}>
        <button
          onClick={onUndo}
          disabled={!canUndo}
          title="撤销 (Ctrl+Z)"
          style={{
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: canUndo ? '#f9fafb' : '#f3f4f6',
            border: '1px solid #e5e7eb',
            borderRadius: 6,
            cursor: canUndo ? 'pointer' : 'not-allowed',
            fontSize: 14,
            color: canUndo ? '#1f2937' : '#d1d5db',
            transition: 'all 0.2s'
          }}
        >
          ↩
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          title="重做 (Ctrl+Y)"
          style={{
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: canRedo ? '#f9fafb' : '#f3f4f6',
            border: '1px solid #e5e7eb',
            borderRadius: 6,
            cursor: canRedo ? 'pointer' : 'not-allowed',
            fontSize: 14,
            color: canRedo ? '#1f2937' : '#d1d5db',
            transition: 'all 0.2s'
          }}
        >
          ↪
        </button>
      </div>

      <button
        onClick={onReset}
        title="重置为默认布局"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 12px',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: 6,
          cursor: 'pointer',
          fontSize: 12,
          color: '#dc2626',
          transition: 'all 0.2s'
        }}
      >
        <span>↻</span>
        <span>重置</span>
      </button>

      <div style={{ flex: 1 }} />

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        background: '#f0fdf4',
        border: '1px solid #bbf7d0',
        borderRadius: 6,
        fontSize: 11
      }}>
        <span style={{ fontSize: 12 }}>🔒</span>
        <span style={{ color: '#166534', fontFamily: 'monospace', fontSize: 10 }}>
          {fingerprint ? fingerprint.slice(0, 8) : '...'}
        </span>
        <span style={{ color: '#15803d', fontSize: 10 }}>自动保存</span>
      </div>
    </div>
  )
}
