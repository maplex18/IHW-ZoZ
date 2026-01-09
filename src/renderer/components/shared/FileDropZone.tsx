import { useCallback, useState } from 'react'
import { useDropzone, Accept } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileType, X, File } from 'lucide-react'
import { cn, formatBytes } from '@/lib/utils'
import { useI18n } from '@/hooks/useI18n'

interface FileDropZoneProps {
  accept: Accept
  multiple?: boolean
  onFilesSelected: (files: File[]) => void
  className?: string
  maxFiles?: number
  disabled?: boolean
  compact?: boolean
  hideFileList?: boolean  // Hide the built-in file list when parent component displays its own
}

export function FileDropZone({
  accept,
  multiple = false,
  onFilesSelected,
  className,
  maxFiles = 50,
  disabled = false,
  compact = false,
  hideFileList = false
}: FileDropZoneProps): JSX.Element {
  const t = useI18n()
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = multiple ? [...selectedFiles, ...acceptedFiles].slice(0, maxFiles) : acceptedFiles
      setSelectedFiles(newFiles)
      onFilesSelected(newFiles)
    },
    [selectedFiles, multiple, maxFiles, onFilesSelected]
  )

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    setSelectedFiles(newFiles)
    onFilesSelected(newFiles)
  }

  const clearFiles = () => {
    setSelectedFiles([])
    onFilesSelected([])
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple,
    maxFiles,
    disabled
  })

  const rootProps = getRootProps()

  return (
    <div className={cn('space-y-3', className)}>
      {/* Drop zone */}
      <div
        {...rootProps}
        className={cn(
          'relative rounded-xl transition-all duration-200 overflow-hidden',
          compact ? 'p-6' : 'p-8',
          disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'cursor-pointer',
          isDragActive
            ? 'ring-2 ring-blue-500/50'
            : 'hover:ring-1 hover:ring-white/20'
        )}
        style={{
          background: isDragActive
            ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(35, 35, 40, 0.95) 100%)'
            : 'rgba(35, 35, 40, 0.95)',
          border: isDragActive
            ? '1px dashed rgba(59, 130, 246, 0.5)'
            : '1px dashed rgba(255, 255, 255, 0.15)'
        }}
      >
        <input {...getInputProps()} />

        <AnimatePresence mode="wait">
          <motion.div
            key={isDragActive ? 'active' : 'inactive'}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center gap-3 text-center"
          >
            <div
              className={cn(
                'p-3 rounded-xl transition-all',
                isDragActive
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-white/8 text-gray-400'
              )}
            >
              {isDragActive ? <FileType className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
            </div>

            <div>
              <p className={cn(
                'font-medium text-white',
                compact ? 'text-sm' : 'text-base'
              )}>
                {t.file.dragDrop}
              </p>
              <p className="text-sm text-gray-400 mt-0.5">
                {multiple ? t.file.orClickMultiple : t.file.orClick}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Selected files list - hidden when parent component displays its own */}
      <AnimatePresence>
        {!hideFileList && selectedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl overflow-hidden"
            style={{ background: 'rgba(35, 35, 40, 0.95)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <span className="text-sm font-medium text-white">
                {t.file.selectedFiles} ({selectedFiles.length})
              </span>
              <button
                onClick={clearFiles}
                className="text-xs text-gray-400 hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-red-500/10"
              >
                {t.file.clearAll}
              </button>
            </div>

            <div className="max-h-48 overflow-auto">
              {selectedFiles.map((file, index) => (
                <motion.div
                  key={`${file.name}-${index}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center gap-3 px-4 py-2.5 border-b border-white/5 last:border-0 group hover:bg-white/5 transition-colors"
                >
                  <File className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-200 truncate">{file.name}</p>
                  </div>
                  <span className="text-xs text-gray-500">{formatBytes(file.size)}</span>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1 rounded text-gray-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
