import { useState, useCallback } from 'react'
import { Pipette, Copy, Check } from 'lucide-react'
import { FileDropZone } from '../shared/FileDropZone'
import { ImagePreview } from '../shared/ImagePreview'
import { useI18n } from '@/hooks/useI18n'

interface ColorInfo {
  rgb: { r: number; g: number; b: number }
  hex: string
  count: number
}

export function ColorPicker(): JSX.Element {
  const t = useI18n()
  const [file, setFile] = useState<File | null>(null)
  const [colors, setColors] = useState<ColorInfo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedColor, setCopiedColor] = useState<string | null>(null)
  const [numColors, setNumColors] = useState<number>(10)

  const handleFilesSelected = useCallback(async (files: File[]) => {
    if (files.length > 0) {
      const selectedFile = files[0]
      setFile(selectedFile)
      setColors([])
      setError(null)
      setIsLoading(true)

      try {
        const filePath = window.api.file.getFilePath(selectedFile)
        const extractedColors = await window.api.image.getColors(filePath, numColors) as ColorInfo[]
        setColors(extractedColors)
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      } finally {
        setIsLoading(false)
      }
    }
  }, [numColors])

  const handleExtractColors = async () => {
    if (!file) return
    setIsLoading(true)
    setError(null)

    try {
      const filePath = window.api.file.getFilePath(file)
      const extractedColors = await window.api.image.getColors(filePath, numColors) as ColorInfo[]
      setColors(extractedColors)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyColor = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex)
      setCopiedColor(hex)
      setTimeout(() => setCopiedColor(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleReset = () => {
    setFile(null)
    setColors([])
    setError(null)
    setIsLoading(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-100 mb-2">{t.image.colorPicker}</h1>
        <p className="text-gray-400">{t.image.colorPickerDesc}</p>
      </div>

      <FileDropZone
        accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.gif'] }}
        onFilesSelected={handleFilesSelected}
        multiple={false}
        disabled={isLoading}
        hideFileList={true}
      />

      {file && (
        <>
          <ImagePreview file={file} maxHeight="250px" />

          <div className="card space-y-4">
            <h3 className="font-medium text-gray-200">{t.file.options}</h3>
            <div>
              <label className="text-sm text-gray-400 block mb-2">
                Number of Colors: {numColors}
              </label>
              <input
                type="range"
                value={numColors}
                onChange={(e) => setNumColors(parseInt(e.target.value))}
                className="w-full"
                min={5}
                max={30}
                disabled={isLoading}
              />
            </div>
            <button
              onClick={handleExtractColors}
              disabled={isLoading}
              className="btn-secondary flex items-center gap-2"
            >
              <Pipette className="w-4 h-4" />
              Extract Colors
            </button>
          </div>

          {isLoading && (
            <div className="card">
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
              </div>
            </div>
          )}

          {error && (
            <div className="card border-red-500/50 bg-red-500/10">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {colors.length > 0 && (
            <div className="card">
              <h3 className="font-medium text-gray-200 mb-4">Extracted Colors</h3>
              <div className="grid grid-cols-2 gap-3">
                {colors.map((color, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
                    onClick={() => handleCopyColor(color.hex)}
                  >
                    <div
                      className="w-12 h-12 rounded-lg border border-white/20"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div className="flex-1">
                      <div className="font-mono text-gray-200">{color.hex.toUpperCase()}</div>
                      <div className="text-xs text-gray-500">
                        RGB({color.rgb.r}, {color.rgb.g}, {color.rgb.b})
                      </div>
                    </div>
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                      {copiedColor === color.hex ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
