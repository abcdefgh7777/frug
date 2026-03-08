import { useState, useEffect, useRef } from 'react'
import './PfpBuilder.css'

// Layer configuration - you can reorder and manage layers here
const LAYERS_CONFIG = [
  { id: 'bg', name: 'Background', files: ['1.png','2.png','3.png','4.png','5.png','6.png','7.png','8.png','9.png','10.png','11.png','12.png','13.png','14.png','15.png','16.png','17.png','18.png','19.png','20.png','21.png','22.png','23.png','24.png','25.png','26.png','27.png','28.png','29.png','30.png','31.png','32.png','33.png','34.png','35.png','36.png','37.png','38.png','39.png','40.png'], required: true },
  { id: 'body', name: 'Body', files: ['01.png'], required: true, allowCustomColor: true },
  { id: 'eyes', name: 'Eyes', files: ['01.png','02.png','03.png','04.png','05.png','06.png','07.png','08.png','09.png','10.png','11.png'], required: false },
  { id: 'mouth', name: 'Mouth', files: ['01.png','02.png'], required: false },
]

function PfpBuilder({ onClose }) {
  const [selectedLayers, setSelectedLayers] = useState({
    bg: '1.png',
    body: '01.png',
    eyes: '01.png',
    mouth: '01.png',
  })

  const [activeTab, setActiveTab] = useState('bg')
  const [frugName, setFrugName] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [customBodyColor, setCustomBodyColor] = useState('#ff6b6b')
  const [customBodyColor2, setCustomBodyColor2] = useState('#feca57')
  const [useCustomBody, setUseCustomBody] = useState(false)
  const [customBodyImage, setCustomBodyImage] = useState(null)
  const [customBodyMode, setCustomBodyMode] = useState('gradient') // gradient, solid, custom
  const [selectedBodyGradient, setSelectedBodyGradient] = useState(0)
  const customBodyCanvasRef = useRef(null)

  // Custom background states
  const [useCustomBg, setUseCustomBg] = useState(false)
  const [customBgMode, setCustomBgMode] = useState('preset') // preset, solid, custom
  const [selectedPresetGradient, setSelectedPresetGradient] = useState(0)
  const [customBgColor1, setCustomBgColor1] = useState('#667eea')
  const [customBgColor2, setCustomBgColor2] = useState('#764ba2')

  const previewRef = useRef(null)

  // Drawing state
  const drawCanvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawTool, setDrawTool] = useState('brush') // brush, eraser, bucket
  const [drawColor, setDrawColor] = useState('#000000')
  const [brushSize, setBrushSize] = useState(4)
  const [drawingDataUrl, setDrawingDataUrl] = useState(null)
  const lastDrawPos = useRef(null)
  const [cursorPos, setCursorPos] = useState(null)


  // Beautiful preset gradients (inspired by uiGradients)
  const PRESET_GRADIENTS = [
    { name: 'Sunset', colors: ['#ff512f', '#dd2476'] },
    { name: 'Ocean', colors: ['#2193b0', '#6dd5ed'] },
    { name: 'Purple Love', colors: ['#cc2b5e', '#753a88'] },
    { name: 'Lime', colors: ['#a8e063', '#56ab2f'] },
    { name: 'Peach', colors: ['#ed4264', '#ffedbc'] },
    { name: 'Aqua', colors: ['#13547a', '#80d0c7'] },
    { name: 'Rose', colors: ['#eecda3', '#ef629f'] },
    { name: 'Violet', colors: ['#4776e6', '#8e54e9'] },
    { name: 'Sky', colors: ['#56ccf2', '#2f80ed'] },
    { name: 'Fire', colors: ['#f12711', '#f5af19'] },
    { name: 'Mint', colors: ['#00b09b', '#96c93d'] },
    { name: 'Berry', colors: ['#8360c3', '#2ebf91'] },
    { name: 'Candy', colors: ['#ff9a9e', '#fecfef'] },
    { name: 'Night', colors: ['#0f0c29', '#302b63'] },
    { name: 'Gold', colors: ['#f7971e', '#ffd200'] },
    { name: 'Cool', colors: ['#4ca1af', '#c4e0e5'] },
  ]

  // Preset solid colors for background
  const PRESET_SOLID_COLORS = [
    '#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#1dd1a1',
    '#5f27cd', '#00d2d3', '#54a0ff', '#2d3436', '#636e72',
    '#fdcb6e', '#e17055', '#d63031', '#0984e3', '#6c5ce7',
    '#00cec9', '#fab1a0', '#74b9ff', '#a29bfe', '#fd79a8'
  ]

  // Preset body gradients
  const PRESET_BODY_GRADIENTS = [
    { name: 'Sunset Skin', colors: ['#ffb88c', '#de6262'] },
    { name: 'Ocean', colors: ['#48dbfb', '#0abde3'] },
    { name: 'Cotton Candy', colors: ['#ff9ff3', '#f368e0'] },
    { name: 'Mint Fresh', colors: ['#1dd1a1', '#10ac84'] },
    { name: 'Lavender', colors: ['#a29bfe', '#6c5ce7'] },
    { name: 'Peachy', colors: ['#ffbe76', '#ff7979'] },
    { name: 'Sky', colors: ['#74b9ff', '#0984e3'] },
    { name: 'Lime', colors: ['#badc58', '#6ab04c'] },
    { name: 'Rose Gold', colors: ['#f8b500', '#e55039'] },
    { name: 'Bubblegum', colors: ['#fd79a8', '#e84393'] },
    { name: 'Arctic', colors: ['#c7ecee', '#dff9fb'] },
    { name: 'Fire', colors: ['#f9ca24', '#f0932b'] },
  ]

  // Preset body solid colors - skin tones + fun colors
  const PRESET_BODY_COLORS = [
    // Skin tones
    '#ffdbac', '#f1c27d', '#e0ac69', '#c68642', '#8d5524', '#5c3317',
    // Fun colors
    '#ff9ff3', '#48dbfb', '#1dd1a1', '#a29bfe', '#ffeaa7', '#ff9f43',
    '#ff6b6b', '#00d2d3', '#dfe6e9', '#fdcb6e', '#fab1a0', '#81ecec',
  ]

  // Helper to convert hex to RGB
  const hexToRgb = (hex) => {
    const h = hex.replace('#', '')
    return {
      r: parseInt(h.substring(0, 2), 16),
      g: parseInt(h.substring(2, 4), 16),
      b: parseInt(h.substring(4, 6), 16)
    }
  }

  // Helper to interpolate between two colors
  const lerpColor = (color1, color2, t) => {
    return {
      r: Math.round(color1.r + (color2.r - color1.r) * t),
      g: Math.round(color1.g + (color2.g - color1.g) * t),
      b: Math.round(color1.b + (color2.b - color1.b) * t)
    }
  }

  // Target color to replace: #96d939
  const TARGET_COLOR = { r: 150, g: 217, b: 57 }
  const COLOR_TOLERANCE = 60 // how close a pixel must be to #96d939 to get replaced

  // Function to apply color/gradient by replacing #96d939 green pixels
  const applyColorToBody = (color1, color2 = null) => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      ctx.drawImage(img, 0, 0, 512, 512)
      const imageData = ctx.getImageData(0, 0, 512, 512)
      const data = imageData.data

      const rgb1 = hexToRgb(color1)
      const rgb2 = color2 ? hexToRgb(color2) : rgb1
      const isGradient = color2 !== null

      for (let i = 0; i < data.length; i += 4) {
        const pixelIndex = i / 4
        const y = Math.floor(pixelIndex / 512)
        const red = data[i]
        const green = data[i + 1]
        const blue = data[i + 2]
        const alpha = data[i + 3]

        // Skip transparent pixels
        if (alpha < 10) continue

        // Check how close this pixel is to #96d939
        const dist = Math.sqrt(
          Math.pow(red - TARGET_COLOR.r, 2) +
          Math.pow(green - TARGET_COLOR.g, 2) +
          Math.pow(blue - TARGET_COLOR.b, 2)
        )

        if (dist > COLOR_TOLERANCE) continue // not the target green, skip

        // Get target color (gradient or solid)
        let targetColor
        if (isGradient) {
          const t = y / 512
          targetColor = lerpColor(rgb1, rgb2, t)
        } else {
          targetColor = rgb1
        }

        // Blend based on how close the pixel is to the target color
        const blendFactor = 1 - (dist / COLOR_TOLERANCE)
        data[i] = Math.round(red * (1 - blendFactor) + targetColor.r * blendFactor)
        data[i + 1] = Math.round(green * (1 - blendFactor) + targetColor.g * blendFactor)
        data[i + 2] = Math.round(blue * (1 - blendFactor) + targetColor.b * blendFactor)
      }

      ctx.putImageData(imageData, 0, 0)
      setCustomBodyImage(canvas.toDataURL('image/png'))
    }
    img.src = '/nfts/body/01.png'
  }

  // Update custom body when color/mode changes
  useEffect(() => {
    if (useCustomBody) {
      if (customBodyMode === 'gradient') {
        const gradient = PRESET_BODY_GRADIENTS[selectedBodyGradient]
        applyColorToBody(gradient.colors[0], gradient.colors[1])
      } else if (customBodyMode === 'solid') {
        applyColorToBody(customBodyColor)
      } else if (customBodyMode === 'custom') {
        applyColorToBody(customBodyColor, customBodyColor2)
      }
    }
  }, [customBodyColor, customBodyColor2, customBodyMode, selectedBodyGradient, useCustomBody])

  // Get custom background CSS style
  const getCustomBgStyle = () => {
    if (customBgMode === 'preset') {
      const gradient = PRESET_GRADIENTS[selectedPresetGradient]
      return { background: `linear-gradient(135deg, ${gradient.colors[0]}, ${gradient.colors[1]})` }
    } else if (customBgMode === 'solid') {
      return { background: customBgColor1 }
    } else if (customBgMode === 'custom') {
      return { background: `linear-gradient(135deg, ${customBgColor1}, ${customBgColor2})` }
    }
    return {}
  }

  // Draw custom background on canvas for download
  const drawCustomBgOnCanvas = (ctx) => {
    let color1, color2

    if (customBgMode === 'preset') {
      const gradient = PRESET_GRADIENTS[selectedPresetGradient]
      color1 = gradient.colors[0]
      color2 = gradient.colors[1]
    } else if (customBgMode === 'solid') {
      ctx.fillStyle = customBgColor1
      ctx.fillRect(0, 0, 512, 512)
      return
    } else {
      color1 = customBgColor1
      color2 = customBgColor2
    }

    // Draw gradient (diagonal)
    const gradient = ctx.createLinearGradient(0, 0, 512, 512)
    gradient.addColorStop(0, color1)
    gradient.addColorStop(1, color2)
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 512, 512)
  }

  const generatePogName = async () => {
    setIsGenerating(true)
    setFrugName('')

    try {
      const response = await fetch('/api/generate-name', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      if (data.name) {
        setFrugName(data.name)
      } else {
        setFrugName('TRY AGAIN')
      }
    } catch (error) {
      console.error('Error generating name:', error)
      setFrugName('TRY AGAIN')
    }

    setIsGenerating(false)
  }

  const selectItem = (layerId, file) => {
    // If selecting a body preset, disable custom body mode
    if (layerId === 'body') {
      setUseCustomBody(false)
    }
    // If selecting a bg preset, disable custom bg mode
    if (layerId === 'bg') {
      setUseCustomBg(false)
    }
    setSelectedLayers(prev => ({
      ...prev,
      [layerId]: prev[layerId] === file ? null : file
    }))
  }

  const selectCustomBody = () => {
    setUseCustomBody(true)
    setSelectedLayers(prev => ({
      ...prev,
      body: null
    }))
    // Generate the custom body image based on current mode
    if (customBodyMode === 'gradient') {
      const gradient = PRESET_BODY_GRADIENTS[selectedBodyGradient]
      applyColorToBody(gradient.colors[0], gradient.colors[1])
    } else if (customBodyMode === 'solid') {
      applyColorToBody(customBodyColor)
    } else {
      applyColorToBody(customBodyColor, customBodyColor2)
    }
  }

  const selectCustomBg = () => {
    setUseCustomBg(true)
    setSelectedLayers(prev => ({
      ...prev,
      bg: null
    }))
  }


  // Drawing functions
  const initDrawCanvas = () => {
    const canvas = drawCanvasRef.current
    if (!canvas) return
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, 512, 512)
    // If we have previous drawing data, restore it
    if (drawingDataUrl) {
      const img = new window.Image()
      img.onload = () => { ctx.drawImage(img, 0, 0) }
      img.src = drawingDataUrl
    }
  }

  useEffect(() => {
    if (activeTab === 'draw') {
      setTimeout(initDrawCanvas, 50)
    }
  }, [activeTab])

  const getDrawPos = (e) => {
    const canvas = drawCanvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    const scaleX = 512 / rect.width
    const scaleY = 512 / rect.height
    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      }
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    }
  }

  const floodFill = (ctx, startX, startY, fillColor) => {
    const imageData = ctx.getImageData(0, 0, 512, 512)
    const data = imageData.data
    const sx = Math.floor(startX)
    const sy = Math.floor(startY)
    const startIdx = (sy * 512 + sx) * 4
    const startR = data[startIdx], startG = data[startIdx+1], startB = data[startIdx+2], startA = data[startIdx+3]

    const fr = parseInt(fillColor.slice(1,3), 16)
    const fg = parseInt(fillColor.slice(3,5), 16)
    const fb = parseInt(fillColor.slice(5,7), 16)

    if (startR === fr && startG === fg && startB === fb && startA === 255) return

    const match = (idx) => {
      return Math.abs(data[idx] - startR) < 30 &&
             Math.abs(data[idx+1] - startG) < 30 &&
             Math.abs(data[idx+2] - startB) < 30 &&
             Math.abs(data[idx+3] - startA) < 30
    }

    const stack = [[sx, sy]]
    const visited = new Set()
    while (stack.length > 0) {
      const [x, y] = stack.pop()
      if (x < 0 || x >= 512 || y < 0 || y >= 512) continue
      const key = y * 512 + x
      if (visited.has(key)) continue
      visited.add(key)
      const idx = key * 4
      if (!match(idx)) continue
      data[idx] = fr; data[idx+1] = fg; data[idx+2] = fb; data[idx+3] = 255
      stack.push([x+1,y],[x-1,y],[x,y+1],[x,y-1])
    }
    ctx.putImageData(imageData, 0, 0)
  }

  const getScreenPos = (e) => {
    const canvas = drawCanvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    if (e.touches) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top, w: rect.width }
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top, w: rect.width }
  }

  const handleDrawStart = (e) => {
    e.preventDefault()
    const canvas = drawCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const pos = getDrawPos(e)
    const sPos = getScreenPos(e)
    if (!pos) return
    if (sPos) setCursorPos(sPos)

    if (drawTool === 'bucket') {
      floodFill(ctx, pos.x, pos.y, drawColor)
      saveDrawing()
      return
    }

    setIsDrawing(true)
    lastDrawPos.current = pos
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, (drawTool === 'eraser' ? brushSize * 2 : brushSize) / 2, 0, Math.PI * 2)
    if (drawTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.fillStyle = 'rgba(0,0,0,1)'
    } else {
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = drawColor
    }
    ctx.fill()
  }

  const handleDrawMove = (e) => {
    e.preventDefault()
    const sPos = getScreenPos(e)
    if (sPos) setCursorPos(sPos)

    if (!isDrawing) return
    const canvas = drawCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const pos = getDrawPos(e)
    if (!pos || !lastDrawPos.current) return

    ctx.beginPath()
    ctx.moveTo(lastDrawPos.current.x, lastDrawPos.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.strokeStyle = drawColor
    ctx.lineWidth = drawTool === 'eraser' ? brushSize * 2 : brushSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    if (drawTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.strokeStyle = 'rgba(0,0,0,1)'
    } else {
      ctx.globalCompositeOperation = 'source-over'
    }
    ctx.stroke()
    lastDrawPos.current = pos
  }

  const handleDrawEnd = () => {
    setIsDrawing(false)
    lastDrawPos.current = null
    setCursorPos(null)
    const canvas = drawCanvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx.globalCompositeOperation = 'source-over'
    }
    saveDrawing()
  }

  const saveDrawing = () => {
    const canvas = drawCanvasRef.current
    if (canvas) {
      setDrawingDataUrl(canvas.toDataURL('image/png'))
    }
  }

  const clearDrawing = () => {
    const canvas = drawCanvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, 512, 512)
    }
    setDrawingDataUrl(null)
  }

  const DRAW_COLORS = [
    '#000000', '#ffffff', '#ff0000', '#ff6600', '#ffff00', '#00ff00',
    '#00ffff', '#0000ff', '#9900ff', '#ff00ff', '#ff69b4', '#8B4513',
    '#808080', '#c0c0c0', '#800000', '#006400', '#000080', '#4B0082',
  ]

  const randomize = () => {
    const newSelection = {}
    LAYERS_CONFIG.forEach(layer => {
      if (layer.required) {
        // For body, always use custom color since there's only 1 base body
        if (layer.id === 'body') {
          newSelection[layer.id] = null
        // For bg, 30% chance of custom background
        } else if (layer.id === 'bg' && Math.random() < 0.3) {
          newSelection[layer.id] = null
        } else {
          const randomIndex = Math.floor(Math.random() * layer.files.length)
          newSelection[layer.id] = layer.files[randomIndex]
        }
      } else {
        // 50% chance to include optional layers
        if (Math.random() > 0.5 && layer.files.length > 0) {
          const randomIndex = Math.floor(Math.random() * layer.files.length)
          newSelection[layer.id] = layer.files[randomIndex]
        } else {
          newSelection[layer.id] = null
        }
      }
    })
    setSelectedLayers(newSelection)

    // If body was set to null, enable custom body with random preset gradient
    if (newSelection.body === null) {
      const randomGradientIndex = Math.floor(Math.random() * PRESET_BODY_GRADIENTS.length)
      setCustomBodyMode('gradient')
      setSelectedBodyGradient(randomGradientIndex)
      setUseCustomBody(true)
      const gradient = PRESET_BODY_GRADIENTS[randomGradientIndex]
      applyColorToBody(gradient.colors[0], gradient.colors[1])
    } else {
      setUseCustomBody(false)
    }

    // If bg was set to null, enable custom bg with random preset gradient
    if (newSelection.bg === null) {
      const randomPresetIndex = Math.floor(Math.random() * PRESET_GRADIENTS.length)
      setCustomBgMode('preset')
      setSelectedPresetGradient(randomPresetIndex)
      setUseCustomBg(true)
    } else {
      setUseCustomBg(false)
    }
  }

  const downloadPfp = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')

    const loadImage = (src) => {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = src
      })
    }

    const drawLayers = async () => {
      for (const layer of LAYERS_CONFIG) {
        // Handle custom background
        if (layer.id === 'bg' && useCustomBg) {
          drawCustomBgOnCanvas(ctx)
          continue
        }

        // Handle custom body
        if (layer.id === 'body' && useCustomBody && customBodyImage) {
          try {
            const img = await loadImage(customBodyImage)
            ctx.drawImage(img, 0, 0, 512, 512)
          } catch (e) {
            console.error('Failed to load custom body')
          }
          continue
        }

        const file = selectedLayers[layer.id]
        if (file) {
          try {
            const img = await loadImage(`/nfts/${layer.id}/${file}`)
            ctx.drawImage(img, 0, 0, 512, 512)
          } catch (e) {
            console.error(`Failed to load ${layer.id}/${file}`)
          }
        }
      }

      // Draw user drawing on top
      if (drawingDataUrl) {
        try {
          const drawImg = await loadImage(drawingDataUrl)
          ctx.drawImage(drawImg, 0, 0, 512, 512)
        } catch (e) {
          console.error('Failed to load drawing')
        }
      }


      const link = document.createElement('a')
      link.download = 'my-frug.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
    }

    drawLayers()
  }

  return (
    <div className="pfp-builder-overlay" onClick={onClose}>
      <div className="pfp-builder-modal" onClick={e => e.stopPropagation()}>
        {/* Mac Terminal Title Bar */}
        <div className="terminal-titlebar">
          <div className="terminal-buttons">
            <button className="terminal-btn close" onClick={onClose}></button>
            <button className="terminal-btn minimize"></button>
            <button className="terminal-btn maximize"></button>
          </div>
          <span className="terminal-title">FRUG PFP Builder</span>
        </div>

        <div className="terminal-content">
          <h1 className="pfp-builder-title">GET UR FRUG</h1>

        <div className="pfp-builder-content">
          {/* Preview */}
          <div className="pfp-preview-section">
            <div
              ref={previewRef}
              className="pfp-preview"
              style={useCustomBg ? getCustomBgStyle() : {}}
            >
              {LAYERS_CONFIG.map(layer => {
                const file = selectedLayers[layer.id]

                // Handle custom background - rendered via CSS style on parent
                if (layer.id === 'bg' && useCustomBg) {
                  return null
                }

                // Handle custom body
                if (layer.id === 'body' && useCustomBody) {
                  if (customBodyImage) {
                    return (
                      <img
                        key="custom-body"
                        src={customBodyImage}
                        alt="Custom Body"
                        className="pfp-layer"
                        style={{ zIndex: LAYERS_CONFIG.indexOf(layer) }}
                      />
                    )
                  }
                  return null
                }

                if (!file) return null
                return (
                  <img
                    key={layer.id}
                    src={`/nfts/${layer.id}/${file}`}
                    alt={layer.name}
                    className="pfp-layer"
                    style={{ zIndex: LAYERS_CONFIG.indexOf(layer) }}
                  />
                )
              })}

              {/* Drawing layer */}
              {drawingDataUrl && activeTab !== 'draw' && (
                <img
                  src={drawingDataUrl}
                  alt="Drawing"
                  className="pfp-layer"
                  style={{ zIndex: 50 }}
                />
              )}
              {activeTab === 'draw' && (
                <>
                  <canvas
                    ref={drawCanvasRef}
                    className="pfp-layer draw-canvas"
                    style={{ zIndex: 50, cursor: drawTool === 'bucket' ? 'crosshair' : 'none' }}
                    onMouseDown={handleDrawStart}
                    onMouseMove={handleDrawMove}
                    onMouseUp={handleDrawEnd}
                    onMouseLeave={handleDrawEnd}
                    onTouchStart={handleDrawStart}
                    onTouchMove={handleDrawMove}
                    onTouchEnd={handleDrawEnd}
                  />
                  {cursorPos && drawTool !== 'bucket' && (
                    <div
                      className="draw-cursor"
                      style={{
                        left: cursorPos.x,
                        top: cursorPos.y,
                        width: (drawTool === 'eraser' ? brushSize * 2 : brushSize) * (cursorPos.w / 512),
                        height: (drawTool === 'eraser' ? brushSize * 2 : brushSize) * (cursorPos.w / 512),
                        borderColor: drawTool === 'eraser' ? '#ff4444' : drawColor,
                      }}
                    />
                  )}
                </>
              )}

            </div>

            {/* Generated Name Display */}
            {frugName && (
              <div className="frug-name-display">
                <span>{frugName}</span>
              </div>
            )}

            <div className="pfp-actions">
              <button className="pfp-btn randomize" onClick={randomize}>RANDOMIZE</button>
              <button className="pfp-btn download" onClick={downloadPfp}>DOWNLOAD</button>
            </div>

            <button
              className={`pfp-btn namebtn ${isGenerating ? 'generating' : ''}`}
              onClick={generatePogName}
              disabled={isGenerating}
            >
              {isGenerating ? 'ASKING...' : 'NAME ME'}
            </button>
          </div>

          {/* Layer Selector */}
          <div className="pfp-selector-section">
            {/* Tabs */}
            <div className="layer-tabs">
              {LAYERS_CONFIG.map(layer => {
                let hasSelection = selectedLayers[layer.id]
                if (layer.id === 'body') hasSelection = selectedLayers[layer.id] || useCustomBody
                if (layer.id === 'bg') hasSelection = selectedLayers[layer.id] || useCustomBg
                return (
                  <button
                    key={layer.id}
                    className={`layer-tab ${activeTab === layer.id ? 'active' : ''} ${hasSelection ? 'has-selection' : ''}`}
                    onClick={() => setActiveTab(layer.id)}
                  >
                    {layer.name}
                    {!layer.required && <span className="optional-badge">opt</span>}
                  </button>
                )
              })}
              {/* Draw tab */}
              <button
                className={`layer-tab draw-tab ${activeTab === 'draw' ? 'active' : ''} ${drawingDataUrl ? 'has-selection' : ''}`}
                onClick={() => setActiveTab('draw')}
              >
                Draw
              </button>
            </div>

            {/* Items Grid */}
            <div className="layer-items">
              {LAYERS_CONFIG.find(l => l.id === activeTab)?.files.map(file => {
                const isCustomActive = (activeTab === 'body' && useCustomBody) || (activeTab === 'bg' && useCustomBg)
                return (
                  <div
                    key={file}
                    className={`layer-item ${selectedLayers[activeTab] === file && !isCustomActive ? 'selected' : ''}`}
                    onClick={() => selectItem(activeTab, file)}
                  >
                    <img src={`/nfts/${activeTab}/${file}`} alt={file} />
                  </div>
                )
              })}

              {/* Custom color option for background */}
              {activeTab === 'bg' && (
                <div
                  className={`layer-item custom-color-option ${useCustomBg ? 'selected' : ''}`}
                  onClick={selectCustomBg}
                  style={useCustomBg ? getCustomBgStyle() : { background: 'linear-gradient(135deg, #667eea, #764ba2, #f093fb, #f5576c)' }}
                >
                  <span>CUSTOM</span>
                </div>
              )}

              {/* Custom color option for body */}
              {activeTab === 'body' && (
                <div
                  className={`layer-item custom-color-option ${useCustomBody ? 'selected' : ''}`}
                  onClick={selectCustomBody}
                  style={{ background: useCustomBody ? customBodyColor : 'linear-gradient(135deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3)' }}
                >
                  <span>CUSTOM</span>
                </div>
              )}

              {/* None option for optional layers */}
              {!LAYERS_CONFIG.find(l => l.id === activeTab)?.required && (
                <div
                  className={`layer-item none-option ${selectedLayers[activeTab] === null ? 'selected' : ''}`}
                  onClick={() => selectItem(activeTab, null)}
                >
                  <span>NONE</span>
                </div>
              )}
            </div>

            {/* Color picker for custom background */}
            {activeTab === 'bg' && useCustomBg && (
              <div className="custom-color-picker">
                {/* Mode tabs */}
                <div className="bg-mode-tabs">
                  <button
                    className={`bg-mode-tab ${customBgMode === 'preset' ? 'active' : ''}`}
                    onClick={() => setCustomBgMode('preset')}
                  >
                    Gradients
                  </button>
                  <button
                    className={`bg-mode-tab ${customBgMode === 'solid' ? 'active' : ''}`}
                    onClick={() => setCustomBgMode('solid')}
                  >
                    Solid
                  </button>
                  <button
                    className={`bg-mode-tab ${customBgMode === 'custom' ? 'active' : ''}`}
                    onClick={() => setCustomBgMode('custom')}
                  >
                    Custom
                  </button>
                </div>

                {/* Preset gradients grid */}
                {customBgMode === 'preset' && (
                  <div className="gradient-presets-grid">
                    {PRESET_GRADIENTS.map((gradient, index) => (
                      <button
                        key={gradient.name}
                        className={`gradient-preset-btn ${selectedPresetGradient === index ? 'active' : ''}`}
                        style={{ background: `linear-gradient(135deg, ${gradient.colors[0]}, ${gradient.colors[1]})` }}
                        onClick={() => setSelectedPresetGradient(index)}
                        title={gradient.name}
                      />
                    ))}
                  </div>
                )}

                {/* Solid colors grid */}
                {customBgMode === 'solid' && (
                  <div className="solid-colors-section">
                    <div className="solid-colors-grid">
                      {PRESET_SOLID_COLORS.map(color => (
                        <button
                          key={color}
                          className={`solid-color-btn ${customBgColor1 === color ? 'active' : ''}`}
                          style={{ background: color }}
                          onClick={() => setCustomBgColor1(color)}
                        />
                      ))}
                    </div>
                    <div className="custom-solid-row">
                      <span>Or pick any color:</span>
                      <input
                        type="color"
                        value={customBgColor1}
                        onChange={(e) => setCustomBgColor1(e.target.value)}
                        className="color-input-small"
                      />
                    </div>
                  </div>
                )}

                {/* Custom gradient - 2 color pickers */}
                {customBgMode === 'custom' && (
                  <div className="custom-gradient-section">
                    <p className="custom-gradient-hint">Pick 2 colors to create your own gradient</p>
                    <div className="custom-gradient-pickers">
                      <div className="custom-gradient-color">
                        <span>Color 1</span>
                        <input
                          type="color"
                          value={customBgColor1}
                          onChange={(e) => setCustomBgColor1(e.target.value)}
                          className="color-input-large"
                        />
                      </div>
                      <div className="gradient-arrow">→</div>
                      <div className="custom-gradient-color">
                        <span>Color 2</span>
                        <input
                          type="color"
                          value={customBgColor2}
                          onChange={(e) => setCustomBgColor2(e.target.value)}
                          className="color-input-large"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Color picker for custom body */}
            {activeTab === 'body' && useCustomBody && (
              <div className="custom-color-picker">
                {/* Mode tabs */}
                <div className="bg-mode-tabs">
                  <button
                    className={`bg-mode-tab ${customBodyMode === 'gradient' ? 'active' : ''}`}
                    onClick={() => setCustomBodyMode('gradient')}
                  >
                    Gradients
                  </button>
                  <button
                    className={`bg-mode-tab ${customBodyMode === 'solid' ? 'active' : ''}`}
                    onClick={() => setCustomBodyMode('solid')}
                  >
                    Solid
                  </button>
                  <button
                    className={`bg-mode-tab ${customBodyMode === 'custom' ? 'active' : ''}`}
                    onClick={() => setCustomBodyMode('custom')}
                  >
                    Custom
                  </button>
                </div>

                {/* Preset gradients grid */}
                {customBodyMode === 'gradient' && (
                  <div className="gradient-presets-grid">
                    {PRESET_BODY_GRADIENTS.map((gradient, index) => (
                      <button
                        key={gradient.name}
                        className={`gradient-preset-btn ${selectedBodyGradient === index ? 'active' : ''}`}
                        style={{ background: `linear-gradient(180deg, ${gradient.colors[0]}, ${gradient.colors[1]})` }}
                        onClick={() => setSelectedBodyGradient(index)}
                        title={gradient.name}
                      />
                    ))}
                  </div>
                )}

                {/* Solid colors grid */}
                {customBodyMode === 'solid' && (
                  <div className="solid-colors-section">
                    <span className="body-section-label">Skin Tones</span>
                    <div className="body-colors-grid-small">
                      {PRESET_BODY_COLORS.slice(0, 6).map(color => (
                        <button
                          key={color}
                          className={`body-color-btn ${customBodyColor === color ? 'active' : ''}`}
                          style={{ background: color }}
                          onClick={() => setCustomBodyColor(color)}
                        />
                      ))}
                    </div>
                    <span className="body-section-label" style={{ marginTop: '12px' }}>Fun Colors</span>
                    <div className="body-colors-grid-small">
                      {PRESET_BODY_COLORS.slice(6).map(color => (
                        <button
                          key={color}
                          className={`body-color-btn ${customBodyColor === color ? 'active' : ''}`}
                          style={{ background: color }}
                          onClick={() => setCustomBodyColor(color)}
                        />
                      ))}
                    </div>
                    <div className="custom-solid-row">
                      <span>Or pick any color:</span>
                      <input
                        type="color"
                        value={customBodyColor}
                        onChange={(e) => setCustomBodyColor(e.target.value)}
                        className="color-input-small"
                      />
                    </div>
                  </div>
                )}

                {/* Custom gradient - 2 color pickers */}
                {customBodyMode === 'custom' && (
                  <div className="custom-gradient-section">
                    <p className="custom-gradient-hint">Pick 2 colors for your gradient</p>
                    <div className="custom-gradient-pickers">
                      <div className="custom-gradient-color">
                        <span>Top</span>
                        <input
                          type="color"
                          value={customBodyColor}
                          onChange={(e) => setCustomBodyColor(e.target.value)}
                          className="color-input-large"
                        />
                      </div>
                      <div className="gradient-arrow">↓</div>
                      <div className="custom-gradient-color">
                        <span>Bottom</span>
                        <input
                          type="color"
                          value={customBodyColor2}
                          onChange={(e) => setCustomBodyColor2(e.target.value)}
                          className="color-input-large"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}


            {/* Draw Panel */}
            {activeTab === 'draw' && (
              <div className="draw-panel">
                {/* Tool buttons */}
                <div className="draw-tools">
                  <button
                    className={`draw-tool-btn ${drawTool === 'brush' ? 'active' : ''}`}
                    onClick={() => setDrawTool('brush')}
                    title="Brush"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/></svg>
                  </button>
                  <button
                    className={`draw-tool-btn ${drawTool === 'eraser' ? 'active' : ''}`}
                    onClick={() => setDrawTool('eraser')}
                    title="Eraser"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 20H7L3 16l9-9 8 8-4 4z"/><path d="M6 11l8 8"/></svg>
                  </button>
                  <button
                    className={`draw-tool-btn ${drawTool === 'bucket' ? 'active' : ''}`}
                    onClick={() => setDrawTool('bucket')}
                    title="Paint Bucket"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 11V9a7 7 0 00-14 0v2"/><path d="M5 11h14l-2 9H7l-2-9z"/><circle cx="12" cy="6" r="1" fill="currentColor"/></svg>
                  </button>
                </div>

                {/* Brush size */}
                <div className="draw-size-control">
                  <span>Size: {brushSize}px</span>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={brushSize}
                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                    className="size-slider"
                  />
                </div>

                {/* Color palette */}
                <div className="draw-colors">
                  {DRAW_COLORS.map(color => (
                    <button
                      key={color}
                      className={`draw-color-btn ${drawColor === color ? 'active' : ''}`}
                      style={{ background: color, border: color === '#ffffff' ? '2px solid #ccc' : '2px solid transparent' }}
                      onClick={() => setDrawColor(color)}
                    />
                  ))}
                  <input
                    type="color"
                    value={drawColor}
                    onChange={(e) => setDrawColor(e.target.value)}
                    className="draw-color-picker"
                    title="Custom color"
                  />
                </div>

                {/* Clear button */}
                <button className="clear-drawing-btn" onClick={clearDrawing}>
                  Clear Drawing
                </button>

                <p className="sticker-hint">Draw on your PFP! Use brush to draw eyes, mouth, or anything you want</p>
              </div>
            )}
          </div>
        </div>

        {/* Layer Order Info */}
        <div className="layer-order-info">
          <span>Layer Order: </span>
          {LAYERS_CONFIG.map((l, i) => {
            let isActive = selectedLayers[l.id]
            let label = l.name
            if (l.id === 'body') {
              isActive = selectedLayers[l.id] || useCustomBody
              label = useCustomBody ? 'Body (Custom)' : l.name
            }
            if (l.id === 'bg') {
              isActive = selectedLayers[l.id] || useCustomBg
              label = useCustomBg ? 'BG (Custom)' : l.name
            }
            return (
              <span key={l.id} className={isActive ? 'active-layer' : 'inactive-layer'}>
                {label}{i < LAYERS_CONFIG.length - 1 ? ' → ' : ''}
              </span>
            )
          })}
        </div>
        </div>
      </div>
    </div>
  )
}

export default PfpBuilder
