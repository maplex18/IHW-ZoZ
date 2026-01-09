import { useState, useEffect, useRef, useCallback } from 'react'
import { X, ZoomIn, ZoomOut, Move } from 'lucide-react'

interface ImagePreviewProps {
  file: File | null
  className?: string
  maxHeight?: string
  showZoom?: boolean
  showInfo?: boolean
}

export function ImagePreview({
  file,
  className = '',
  maxHeight = '300px',
  showZoom = true,
  showInfo = true
}: ImagePreviewProps): JSX.Element | null {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null)

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      setDimensions(null)
      return
    }

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    const img = new Image()
    img.onload = () => {
      setDimensions({ width: img.naturalWidth, height: img.naturalHeight })
    }
    img.src = url

    return () => {
      URL.revokeObjectURL(url)
    }
  }, [file])

  if (!file || !previewUrl) return null

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 3))
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5))
  const handleResetZoom = () => setZoom(1)

  return (
    <div className={`card ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-200">Preview</h3>
        {showZoom && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetZoom}
              className="px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-white/10 rounded"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={handleZoomIn}
              className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div
        className="relative overflow-auto rounded-lg bg-[#1a1a1c] border border-white/10"
        style={{ maxHeight }}
      >
        {/* Checkerboard background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(45deg, #2a2a2c 25%, transparent 25%),
              linear-gradient(-45deg, #2a2a2c 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, #2a2a2c 75%),
              linear-gradient(-45deg, transparent 75%, #2a2a2c 75%)`,
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
          }}
        />
        <div className="relative flex items-center justify-center p-4" style={{ minHeight: '200px' }}>
          <img
            src={previewUrl}
            alt="Preview"
            className="transition-transform duration-200"
            style={{
              maxWidth: '100%',
              maxHeight: `calc(${maxHeight} - 32px)`,
              objectFit: 'contain',
              transform: `scale(${zoom})`,
              transformOrigin: 'center'
            }}
          />
        </div>
      </div>

      {showInfo && dimensions && (
        <div className="mt-3 flex items-center gap-4 text-sm text-gray-400">
          <span>{dimensions.width} x {dimensions.height} px</span>
          <span>{(file.size / 1024).toFixed(1)} KB</span>
          <span className="uppercase">{file.name.split('.').pop()}</span>
        </div>
      )}
    </div>
  )
}

// Interactive Resize Preview
interface ResizePreviewProps {
  file: File | null
  width: number
  height: number
  originalWidth: number
  originalHeight: number
  keepAspectRatio: boolean
  onResize: (width: number, height: number) => void
}

export function ResizePreview({
  file,
  width,
  height,
  originalWidth,
  originalHeight,
  keepAspectRatio,
  onResize
}: ResizePreviewProps): JSX.Element | null {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragCorner, setDragCorner] = useState<string | null>(null)

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const handleMouseDown = (corner: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    setDragCorner(corner)
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current || !dragCorner) return

    const rect = containerRef.current.getBoundingClientRect()
    const containerWidth = rect.width - 32 // padding
    const containerHeight = rect.height - 32

    // Calculate scale factor (how much the preview is scaled down)
    const scaleX = containerWidth / originalWidth
    const scaleY = containerHeight / originalHeight
    const scale = Math.min(scaleX, scaleY, 1) * 0.8

    const mouseX = e.clientX - rect.left - 16
    const mouseY = e.clientY - rect.top - 16

    // Calculate center of the preview image
    const previewWidth = originalWidth * scale
    const previewHeight = originalHeight * scale
    const centerX = containerWidth / 2
    const centerY = containerHeight / 2
    const imgLeft = centerX - previewWidth / 2
    const imgTop = centerY - previewHeight / 2

    // Calculate distance from center to mouse
    let newWidth = width
    let newHeight = height

    if (dragCorner.includes('e')) {
      const distX = (mouseX - centerX) / scale
      newWidth = Math.round(Math.max(10, originalWidth / 2 + distX) * 2)
    }
    if (dragCorner.includes('w')) {
      const distX = (centerX - mouseX) / scale
      newWidth = Math.round(Math.max(10, originalWidth / 2 + distX) * 2)
    }
    if (dragCorner.includes('s')) {
      const distY = (mouseY - centerY) / scale
      newHeight = Math.round(Math.max(10, originalHeight / 2 + distY) * 2)
    }
    if (dragCorner.includes('n')) {
      const distY = (centerY - mouseY) / scale
      newHeight = Math.round(Math.max(10, originalHeight / 2 + distY) * 2)
    }

    if (keepAspectRatio) {
      const ratio = originalWidth / originalHeight
      if (dragCorner.includes('e') || dragCorner.includes('w')) {
        newHeight = Math.round(newWidth / ratio)
      } else {
        newWidth = Math.round(newHeight * ratio)
      }
    }

    onResize(Math.max(1, newWidth), Math.max(1, newHeight))
  }, [isDragging, dragCorner, originalWidth, originalHeight, keepAspectRatio, onResize, width, height])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setDragCorner(null)
  }, [])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  if (!file || !previewUrl || !originalWidth || !originalHeight) return null

  // Calculate display size
  const containerMaxHeight = 300
  const containerMaxWidth = 500
  const scaleX = containerMaxWidth / originalWidth
  const scaleY = containerMaxHeight / originalHeight
  const scale = Math.min(scaleX, scaleY, 1) * 0.8

  const displayWidth = width * scale
  const displayHeight = height * scale

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-200">Preview</h3>
        <span className="text-sm text-gray-400">
          {width} x {height} px
          {(width !== originalWidth || height !== originalHeight) && (
            <span className="text-gray-500 ml-2">
              ({Math.round(width / originalWidth * 100)}%)
            </span>
          )}
        </span>
      </div>

      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-lg bg-[#1a1a1c] border border-white/10"
        style={{ height: containerMaxHeight }}
      >
        {/* Checkerboard background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(45deg, #2a2a2c 25%, transparent 25%),
              linear-gradient(-45deg, #2a2a2c 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, #2a2a2c 75%),
              linear-gradient(-45deg, transparent 75%, #2a2a2c 75%)`,
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
          }}
        />

        <div className="absolute inset-0 flex items-center justify-center p-4">
          {/* Original image (dimmed) */}
          <img
            src={previewUrl}
            alt="Original"
            className="absolute opacity-30"
            style={{
              width: originalWidth * scale,
              height: originalHeight * scale,
              objectFit: 'contain'
            }}
          />

          {/* Resized preview with handles */}
          <div
            className="relative border-2 border-primary-500 bg-black/20"
            style={{
              width: displayWidth,
              height: displayHeight,
              transition: isDragging ? 'none' : 'all 0.15s ease'
            }}
          >
            <img
              src={previewUrl}
              alt="Resized Preview"
              className="w-full h-full object-cover"
            />

            {/* Resize handles */}
            {['nw', 'ne', 'sw', 'se'].map((corner) => (
              <div
                key={corner}
                className="absolute w-3 h-3 bg-primary-500 border border-white rounded-sm cursor-nwse-resize hover:bg-primary-400"
                style={{
                  top: corner.includes('n') ? -6 : 'auto',
                  bottom: corner.includes('s') ? -6 : 'auto',
                  left: corner.includes('w') ? -6 : 'auto',
                  right: corner.includes('e') ? -6 : 'auto',
                  cursor: corner === 'nw' || corner === 'se' ? 'nwse-resize' : 'nesw-resize'
                }}
                onMouseDown={handleMouseDown(corner)}
              />
            ))}

            {/* Edge handles */}
            {['n', 's', 'e', 'w'].map((edge) => (
              <div
                key={edge}
                className="absolute bg-primary-500/50 hover:bg-primary-500"
                style={{
                  top: edge === 'n' ? -3 : edge === 's' ? 'auto' : '20%',
                  bottom: edge === 's' ? -3 : edge === 'n' ? 'auto' : '20%',
                  left: edge === 'w' ? -3 : edge === 'e' ? 'auto' : '20%',
                  right: edge === 'e' ? -3 : edge === 'w' ? 'auto' : '20%',
                  width: edge === 'n' || edge === 's' ? '60%' : 6,
                  height: edge === 'e' || edge === 'w' ? '60%' : 6,
                  cursor: edge === 'n' || edge === 's' ? 'ns-resize' : 'ew-resize',
                  borderRadius: 2
                }}
                onMouseDown={handleMouseDown(edge)}
              />
            ))}
          </div>
        </div>
      </div>

      <p className="mt-2 text-xs text-gray-500">Drag the handles to resize, or use the input fields below</p>
    </div>
  )
}

// Interactive Crop Preview
interface CropPreviewProps {
  file: File | null
  x: number
  y: number
  cropWidth: number
  cropHeight: number
  originalWidth: number
  originalHeight: number
  onCropChange: (x: number, y: number, width: number, height: number) => void
}

export function CropPreview({
  file,
  x,
  y,
  cropWidth,
  cropHeight,
  originalWidth,
  originalHeight,
  onCropChange
}: CropPreviewProps): JSX.Element | null {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragMode, setDragMode] = useState<'move' | string | null>(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [cropStart, setCropStart] = useState({ x: 0, y: 0, w: 0, h: 0 })

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const containerMaxHeight = 350
  const containerMaxWidth = 600
  const scaleX = containerMaxWidth / originalWidth
  const scaleY = containerMaxHeight / originalHeight
  const scale = Math.min(scaleX, scaleY, 1)

  const handleMouseDown = (mode: 'move' | string) => (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
    setDragMode(mode)
    setDragStart({ x: e.clientX, y: e.clientY })
    setCropStart({ x, y, w: cropWidth, h: cropHeight })
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragMode) return

    const deltaX = Math.round((e.clientX - dragStart.x) / scale)
    const deltaY = Math.round((e.clientY - dragStart.y) / scale)

    let newX = cropStart.x
    let newY = cropStart.y
    let newW = cropStart.w
    let newH = cropStart.h

    if (dragMode === 'move') {
      newX = Math.max(0, Math.min(originalWidth - cropStart.w, cropStart.x + deltaX))
      newY = Math.max(0, Math.min(originalHeight - cropStart.h, cropStart.y + deltaY))
    } else {
      // Handle resize
      if (dragMode.includes('e')) {
        newW = Math.max(20, Math.min(originalWidth - cropStart.x, cropStart.w + deltaX))
      }
      if (dragMode.includes('w')) {
        const maxDelta = cropStart.x
        const actualDelta = Math.max(-maxDelta, Math.min(cropStart.w - 20, deltaX))
        newX = cropStart.x + actualDelta
        newW = cropStart.w - actualDelta
      }
      if (dragMode.includes('s')) {
        newH = Math.max(20, Math.min(originalHeight - cropStart.y, cropStart.h + deltaY))
      }
      if (dragMode.includes('n')) {
        const maxDelta = cropStart.y
        const actualDelta = Math.max(-maxDelta, Math.min(cropStart.h - 20, deltaY))
        newY = cropStart.y + actualDelta
        newH = cropStart.h - actualDelta
      }
    }

    onCropChange(newX, newY, newW, newH)
  }, [isDragging, dragMode, dragStart, cropStart, scale, originalWidth, originalHeight, onCropChange])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setDragMode(null)
  }, [])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  if (!file || !previewUrl || !originalWidth || !originalHeight) return null

  const displayWidth = originalWidth * scale
  const displayHeight = originalHeight * scale

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-200">Crop Preview</h3>
        <span className="text-sm text-gray-400">
          {cropWidth} x {cropHeight} px
        </span>
      </div>

      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-lg bg-[#1a1a1c] border border-white/10 flex items-center justify-center"
        style={{ height: Math.min(containerMaxHeight, displayHeight + 32) }}
      >
        <div className="relative" style={{ width: displayWidth, height: displayHeight }}>
          {/* Full image (dimmed) */}
          <img
            src={previewUrl}
            alt="Original"
            className="w-full h-full object-contain"
            style={{ filter: 'brightness(0.4)' }}
          />

          {/* Crop region */}
          <div
            className="absolute border-2 border-primary-500 cursor-move"
            style={{
              left: x * scale,
              top: y * scale,
              width: cropWidth * scale,
              height: cropHeight * scale,
              transition: isDragging ? 'none' : 'all 0.1s ease'
            }}
            onMouseDown={handleMouseDown('move')}
          >
            {/* Bright cropped area */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ pointerEvents: 'none' }}
            >
              <img
                src={previewUrl}
                alt="Crop area"
                className="absolute"
                style={{
                  width: displayWidth,
                  height: displayHeight,
                  left: -x * scale,
                  top: -y * scale,
                  maxWidth: 'none'
                }}
              />
            </div>

            {/* Move icon */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Move className="w-6 h-6 text-white/50" />
            </div>

            {/* Resize handles */}
            {['nw', 'ne', 'sw', 'se'].map((corner) => (
              <div
                key={corner}
                className="absolute w-3 h-3 bg-primary-500 border border-white rounded-sm hover:bg-primary-400"
                style={{
                  top: corner.includes('n') ? -6 : 'auto',
                  bottom: corner.includes('s') ? -6 : 'auto',
                  left: corner.includes('w') ? -6 : 'auto',
                  right: corner.includes('e') ? -6 : 'auto',
                  cursor: corner === 'nw' || corner === 'se' ? 'nwse-resize' : 'nesw-resize'
                }}
                onMouseDown={handleMouseDown(corner)}
              />
            ))}

            {/* Edge handles */}
            {['n', 's', 'e', 'w'].map((edge) => (
              <div
                key={edge}
                className="absolute bg-primary-500/50 hover:bg-primary-500"
                style={{
                  top: edge === 'n' ? -3 : edge === 's' ? 'auto' : '30%',
                  bottom: edge === 's' ? -3 : edge === 'n' ? 'auto' : '30%',
                  left: edge === 'w' ? -3 : edge === 'e' ? 'auto' : '30%',
                  right: edge === 'e' ? -3 : edge === 'w' ? 'auto' : '30%',
                  width: edge === 'n' || edge === 's' ? '40%' : 6,
                  height: edge === 'e' || edge === 'w' ? '40%' : 6,
                  cursor: edge === 'n' || edge === 's' ? 'ns-resize' : 'ew-resize',
                  borderRadius: 2
                }}
                onMouseDown={handleMouseDown(edge)}
              />
            ))}

            {/* Rule of thirds grid */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/20" />
              <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/20" />
              <div className="absolute top-1/3 left-0 right-0 h-px bg-white/20" />
              <div className="absolute top-2/3 left-0 right-0 h-px bg-white/20" />
            </div>
          </div>
        </div>
      </div>

      <p className="mt-2 text-xs text-gray-500">Drag to move, drag handles to resize, or use the input fields below</p>
    </div>
  )
}

// Image Preview Grid for multiple images
interface ImagePreviewGridProps {
  files: File[]
  maxItems?: number
  onRemove?: (index: number) => void
}

export function ImagePreviewGrid({
  files,
  maxItems = 12,
  onRemove
}: ImagePreviewGridProps): JSX.Element | null {
  const [previewUrls, setPreviewUrls] = useState<string[]>([])

  useEffect(() => {
    const urls = files.slice(0, maxItems).map((file) => URL.createObjectURL(file))
    setPreviewUrls(urls)

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [files, maxItems])

  if (files.length === 0) return null

  return (
    <div className="card">
      <h3 className="font-medium text-gray-200 mb-3">
        Preview ({files.length} images)
      </h3>
      <div className="grid grid-cols-4 gap-2">
        {previewUrls.map((url, index) => (
          <div
            key={index}
            className="relative group aspect-square rounded-lg overflow-hidden bg-[#1a1a1c] border border-white/10"
          >
            <img
              src={url}
              alt={`Preview ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-sm font-medium">{index + 1}</span>
            </div>
            {onRemove && (
              <button
                onClick={() => onRemove(index)}
                className="absolute top-1 right-1 p-1 bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            )}
          </div>
        ))}
        {files.length > maxItems && (
          <div className="aspect-square rounded-lg overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
            <span className="text-gray-400 text-sm">+{files.length - maxItems} more</span>
          </div>
        )}
      </div>
    </div>
  )
}
