import { Tool, ToolCategory } from '../types'

// PDF file filters
export const PDF_FILTERS = [{ name: 'PDF Files', extensions: ['pdf'] }]

// Image file filters
export const IMAGE_FILTERS = [
  { name: 'Image Files', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff'] }
]

// Video file filters
export const VIDEO_FILTERS = [
  { name: 'Video Files', extensions: ['mp4', 'avi', 'mov', 'mkv', 'wmv', 'flv', 'webm', 'm4v', '3gp'] }
]

// Audio file filters
export const AUDIO_FILTERS = [
  {
    name: 'Audio Files',
    extensions: [
      'mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'wma', 'aiff',
      'alac', 'opus', 'amr', 'ac3', 'dts', 'ape', 'wv', 'mka', 'webm', 'mid', 'midi', 'caf'
    ]
  }
]

// All media filters
export const ALL_MEDIA_FILTERS = [
  { name: 'All Media Files', extensions: [...VIDEO_FILTERS[0].extensions, ...AUDIO_FILTERS[0].extensions] }
]

// Audio output formats
export const AUDIO_OUTPUT_FORMATS = [
  { value: 'mp3', label: 'MP3', description: 'Most compatible format' },
  { value: 'aac', label: 'AAC', description: 'High efficiency, Apple ecosystem' },
  { value: 'wav', label: 'WAV', description: 'Lossless, professional editing' },
  { value: 'flac', label: 'FLAC', description: 'Lossless compression' },
  { value: 'ogg', label: 'OGG', description: 'Open source lossy' },
  { value: 'opus', label: 'OPUS', description: 'Best for low bitrate' },
  { value: 'm4a', label: 'M4A', description: 'Apple devices' },
  { value: 'alac', label: 'ALAC', description: 'Apple lossless' },
  { value: 'wma', label: 'WMA', description: 'Windows Media Audio' },
  { value: 'aiff', label: 'AIFF', description: 'macOS professional' },
  { value: 'ac3', label: 'AC3', description: 'Dolby Digital, 5.1 surround' },
  { value: 'webm', label: 'WebM Audio', description: 'Web friendly' }
]

// Video output formats
export const VIDEO_OUTPUT_FORMATS = [
  { value: 'mp4', label: 'MP4', description: 'Most compatible' },
  { value: 'mkv', label: 'MKV', description: 'High quality, multiple tracks' },
  { value: 'webm', label: 'WebM', description: 'Web optimized' },
  { value: 'avi', label: 'AVI', description: 'Legacy format' },
  { value: 'mov', label: 'MOV', description: 'Apple QuickTime' },
  { value: 'wmv', label: 'WMV', description: 'Windows Media Video' }
]

// Audio bitrates
export const AUDIO_BITRATES = [
  { value: '64k', label: '64 kbps', description: 'Low quality, small file' },
  { value: '128k', label: '128 kbps', description: 'Standard quality' },
  { value: '192k', label: '192 kbps', description: 'Good quality' },
  { value: '256k', label: '256 kbps', description: 'High quality' },
  { value: '320k', label: '320 kbps', description: 'Best quality for MP3' }
]

// Sample rates
export const SAMPLE_RATES = [
  { value: 22050, label: '22.05 kHz' },
  { value: 44100, label: '44.1 kHz', description: 'CD quality' },
  { value: 48000, label: '48 kHz', description: 'DVD quality' },
  { value: 96000, label: '96 kHz', description: 'High resolution' }
]

// Video presets
export const VIDEO_PRESETS = [
  { value: 'ultrafast', label: 'Ultra Fast', description: 'Fastest, larger file' },
  { value: 'fast', label: 'Fast', description: 'Good balance' },
  { value: 'medium', label: 'Medium', description: 'Default balance' },
  { value: 'slow', label: 'Slow', description: 'Better compression' },
  { value: 'veryslow', label: 'Very Slow', description: 'Best compression' }
]

// Video resolutions
export const VIDEO_RESOLUTIONS = [
  { value: '3840x2160', label: '4K (3840x2160)' },
  { value: '2560x1440', label: '2K (2560x1440)' },
  { value: '1920x1080', label: 'Full HD (1920x1080)' },
  { value: '1280x720', label: 'HD (1280x720)' },
  { value: '854x480', label: '480p (854x480)' },
  { value: '640x360', label: '360p (640x360)' }
]

// PDF tools
export const PDF_TOOLS: Tool[] = [
  { id: 'merge', name: 'Merge PDF', description: 'Combine multiple PDFs into one', icon: 'Combine', path: '/pdf/merge', category: 'pdf' },
  { id: 'split', name: 'Split PDF', description: 'Split PDF into multiple files', icon: 'Scissors', path: '/pdf/split', category: 'pdf' },
  { id: 'compress', name: 'Compress PDF', description: 'Reduce PDF file size', icon: 'Minimize2', path: '/pdf/compress', category: 'pdf' },
  { id: 'to-images', name: 'PDF to Images', description: 'Convert PDF pages to images', icon: 'Image', path: '/pdf/to-images', category: 'pdf' },
  { id: 'rotate', name: 'Rotate PDF', description: 'Rotate PDF pages', icon: 'RotateCw', path: '/pdf/rotate', category: 'pdf' },
  { id: 'watermark', name: 'Add Watermark', description: 'Add text or image watermark', icon: 'Droplet', path: '/pdf/watermark', category: 'pdf' },
  { id: 'encrypt', name: 'Encrypt PDF', description: 'Password protect PDF', icon: 'Lock', path: '/pdf/encrypt', category: 'pdf' },
  { id: 'decrypt', name: 'Decrypt PDF', description: 'Remove PDF password', icon: 'Unlock', path: '/pdf/decrypt', category: 'pdf' }
]

// Media tools
export const MEDIA_TOOLS: Tool[] = [
  { id: 'video-compress', name: 'Compress Video', description: 'Reduce video file size', icon: 'Film', path: '/media/video-compress', category: 'media' },
  { id: 'video-convert', name: 'Convert Video', description: 'Convert video format', icon: 'FileVideo', path: '/media/video-convert', category: 'media' },
  { id: 'audio-convert', name: 'Convert Audio', description: 'Convert audio format', icon: 'FileAudio', path: '/media/audio-convert', category: 'media' },
  { id: 'audio-extract', name: 'Extract Audio', description: 'Extract audio from video', icon: 'AudioLines', path: '/media/audio-extract', category: 'media' },
  { id: 'trim', name: 'Trim Media', description: 'Cut video or audio', icon: 'Scissors', path: '/media/trim', category: 'media' }
]

// Image tools
export const IMAGE_TOOLS: Tool[] = [
  { id: 'gif-maker', name: 'GIF Maker', description: 'Create GIF animation from images', icon: 'Film', path: '/image/gif-maker', category: 'image' },
  { id: 'resize', name: 'Resize Image', description: 'Resize image dimensions', icon: 'Maximize2', path: '/image/resize', category: 'image' },
  { id: 'crop', name: 'Crop Image', description: 'Crop image to specific area', icon: 'Crop', path: '/image/crop', category: 'image' },
  { id: 'color-picker', name: 'Color Picker', description: 'Pick colors from image', icon: 'Pipette', path: '/image/color-picker', category: 'image' },
  { id: 'rotate', name: 'Rotate Image', description: 'Rotate image angle', icon: 'RotateCw', path: '/image/rotate', category: 'image' },
  { id: 'flip', name: 'Flip Image', description: 'Flip image horizontally or vertically', icon: 'FlipHorizontal', path: '/image/flip', category: 'image' },
  { id: 'enlarger', name: 'Image Enlarger', description: 'Upscale image using AI', icon: 'ZoomIn', path: '/image/enlarger', category: 'image' }
]

// All tools grouped by category
export const TOOL_CATEGORIES: ToolCategory[] = [
  {
    id: 'pdf',
    name: 'PDF Tools',
    icon: 'FileText',
    tools: PDF_TOOLS
  },
  {
    id: 'media',
    name: 'Media Tools',
    icon: 'Play',
    tools: MEDIA_TOOLS
  },
  {
    id: 'image',
    name: 'Image Tools',
    icon: 'Image',
    tools: IMAGE_TOOLS
  }
]

// Default settings
export const DEFAULT_SETTINGS = {
  theme: 'dark' as const,
  language: 'zh-TW',
  defaultOutputDir: '',
  autoCleanTempFiles: true,
  maxConcurrentTasks: 3,
  pdfDefaultQuality: 75,
  pdfDefaultDpi: 150,
  videoDefaultQuality: 23,
  videoDefaultPreset: 'medium',
  audioDefaultFormat: 'mp3',
  audioDefaultBitrate: '192k'
}
