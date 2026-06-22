export async function generateFingerprint() {
  const components = []

  components.push(navigator.userAgent)
  components.push(navigator.language)
  components.push(navigator.platform)
  components.push(screen.width + 'x' + screen.height)
  components.push(screen.colorDepth)
  components.push(new Date().getTimezoneOffset())
  components.push(navigator.hardwareConcurrency || 'unknown')
  components.push(navigator.deviceMemory || 'unknown')
  components.push(navigator.maxTouchPoints || 0)

  if (navigator.plugins && navigator.plugins.length) {
    const pluginNames = Array.from(navigator.plugins)
      .map(p => p.name)
      .join(',')
    components.push(pluginNames)
  }

  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = 200
    canvas.height = 200
    ctx.textBaseline = 'top'
    ctx.font = "14px 'Arial'"
    ctx.fillStyle = '#f60'
    ctx.fillRect(0, 0, 80, 20)
    ctx.fillStyle = '#069'
    ctx.fillText('fingerprint', 2, 2)
    components.push(canvas.toDataURL())
  } catch (e) {
    components.push('canvas-not-supported')
  }

  try {
    const gl = document.createElement('canvas').getContext('webgl') || 
               document.createElement('canvas').getContext('experimental-webgl')
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
      if (debugInfo) {
        components.push(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL))
        components.push(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL))
      }
    }
  } catch (e) {
    components.push('webgl-not-supported')
  }

  const raw = components.join('|||')
  
  let hash = 0
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  
  return Math.abs(hash).toString(36)
}

const FINGERPRINT_KEY = 'hm_fingerprint'

export async function getFingerprint() {
  let fp = localStorage.getItem(FINGERPRINT_KEY)
  if (!fp) {
    fp = await generateFingerprint()
    localStorage.setItem(FINGERPRINT_KEY, fp)
  }
  return fp
}
