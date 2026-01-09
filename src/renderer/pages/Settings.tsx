import { useSettingsStore } from '@/stores/settingsStore'
import { useI18n } from '@/hooks/useI18n'
import { Settings as SettingsIcon, Globe, FolderOpen, Trash2, FileText, Music, Film, RotateCcw } from 'lucide-react'

export default function Settings(): JSX.Element {
  const t = useI18n()
  const settings = useSettingsStore()

  const handleSelectOutputDir = async () => {
    const dir = await window.api.file.openDirectory()
    if (dir) {
      settings.updateSetting('defaultOutputDir', dir)
    }
  }

  const SettingRow = ({
    icon: Icon,
    label,
    description,
    children
  }: {
    icon?: React.ElementType
    label: string
    description?: string
    children: React.ReactNode
  }) => (
    <div className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-3 flex-1">
        {Icon && <Icon className="w-4 h-4 text-gray-500" />}
        <div>
          <p className="text-sm font-medium text-white">{label}</p>
          {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  )

  const Select = ({
    value,
    onChange,
    options,
    className = 'w-32'
  }: {
    value: string | number
    onChange: (value: string) => void
    options: { value: string | number; label: string }[]
    className?: string
  }) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`px-3 py-2 rounded-lg text-sm text-white transition-all ${className}`}
      style={{ background: 'rgba(50, 50, 55, 0.9)', border: '1px solid rgba(255,255,255,0.12)' }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  )

  const Toggle = ({
    checked,
    onChange
  }: {
    checked: boolean
    onChange: (checked: boolean) => void
  }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-blue-500' : 'bg-white/15'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : ''}`}
      />
    </button>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-gray-500/20 text-gray-400">
          <SettingsIcon className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">{t.settings.title}</h1>
          <p className="text-gray-400 text-sm">{t.settings.subtitle}</p>
        </div>
      </div>

      {/* General Settings */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(35, 35, 40, 0.95)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="px-5 py-3 border-b border-white/10">
          <h2 className="text-sm font-semibold text-white">{t.settings.general}</h2>
        </div>
        <div className="px-5">
          <SettingRow icon={SettingsIcon} label={t.settings.theme} description={t.settings.themeDesc}>
            <Select
              value={settings.theme}
              onChange={(v) => settings.updateSetting('theme', v as 'light' | 'dark' | 'system')}
              options={[
                { value: 'dark', label: t.settings.themeDark },
                { value: 'light', label: t.settings.themeLight },
                { value: 'system', label: t.settings.themeSystem }
              ]}
            />
          </SettingRow>

          <SettingRow icon={Globe} label={t.settings.language} description={t.settings.languageDesc}>
            <Select
              value={settings.language}
              onChange={(v) => settings.updateSetting('language', v)}
              options={[
                { value: 'zh-TW', label: '繁體中文' },
                { value: 'en', label: 'English' },
                { value: 'ja', label: '日本語' }
              ]}
            />
          </SettingRow>

          <SettingRow icon={FolderOpen} label={t.settings.outputDir} description={settings.defaultOutputDir || t.settings.outputDirDesc}>
            <button
              onClick={handleSelectOutputDir}
              className="px-3 py-2 rounded-lg text-sm font-medium text-white transition-all hover:bg-white/20"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              {t.settings.select}
            </button>
          </SettingRow>

          <SettingRow icon={Trash2} label={t.settings.autoClean} description={t.settings.autoCleanDesc}>
            <Toggle
              checked={settings.autoCleanTempFiles}
              onChange={(v) => settings.updateSetting('autoCleanTempFiles', v)}
            />
          </SettingRow>
        </div>
      </div>

      {/* PDF Settings */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(35, 35, 40, 0.95)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="px-5 py-3 border-b border-white/10">
          <h2 className="text-sm font-semibold text-white">{t.settings.pdfSettings}</h2>
        </div>
        <div className="px-5">
          <div className="py-4 border-b border-white/5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-white">{t.settings.defaultQuality}</span>
              </div>
              <span className="text-sm text-blue-400 font-medium">{settings.pdfDefaultQuality}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={settings.pdfDefaultQuality}
              onChange={(e) => settings.updateSetting('pdfDefaultQuality', parseInt(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          <SettingRow icon={FileText} label={t.settings.defaultDpi} description={t.settings.dpiDesc}>
            <Select
              value={settings.pdfDefaultDpi}
              onChange={(v) => settings.updateSetting('pdfDefaultDpi', parseInt(v))}
              options={[
                { value: 72, label: '72 DPI' },
                { value: 150, label: '150 DPI' },
                { value: 300, label: '300 DPI' },
                { value: 600, label: '600 DPI' }
              ]}
            />
          </SettingRow>
        </div>
      </div>

      {/* Audio Settings */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(35, 35, 40, 0.95)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="px-5 py-3 border-b border-white/10">
          <h2 className="text-sm font-semibold text-white">{t.settings.audioSettings}</h2>
        </div>
        <div className="px-5">
          <SettingRow icon={Music} label={t.settings.defaultFormat} description={t.settings.defaultFormatDesc}>
            <Select
              value={settings.audioDefaultFormat}
              onChange={(v) => settings.updateSetting('audioDefaultFormat', v)}
              options={[
                { value: 'mp3', label: 'MP3' },
                { value: 'aac', label: 'AAC' },
                { value: 'wav', label: 'WAV' },
                { value: 'flac', label: 'FLAC' },
                { value: 'ogg', label: 'OGG' },
                { value: 'opus', label: 'OPUS' }
              ]}
            />
          </SettingRow>

          <SettingRow icon={Music} label={t.settings.defaultBitrate} description={t.settings.defaultBitrateDesc}>
            <Select
              value={settings.audioDefaultBitrate}
              onChange={(v) => settings.updateSetting('audioDefaultBitrate', v)}
              options={[
                { value: '64k', label: '64 kbps' },
                { value: '128k', label: '128 kbps' },
                { value: '192k', label: '192 kbps' },
                { value: '256k', label: '256 kbps' },
                { value: '320k', label: '320 kbps' }
              ]}
            />
          </SettingRow>
        </div>
      </div>

      {/* Video Settings */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(35, 35, 40, 0.95)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="px-5 py-3 border-b border-white/10">
          <h2 className="text-sm font-semibold text-white">{t.settings.videoSettings}</h2>
        </div>
        <div className="px-5">
          <SettingRow icon={Film} label={t.settings.encodingPreset} description={t.settings.encodingPresetDesc}>
            <Select
              value={settings.videoDefaultPreset}
              onChange={(v) => settings.updateSetting('videoDefaultPreset', v)}
              options={[
                { value: 'ultrafast', label: t.settings.presetUltrafast },
                { value: 'fast', label: t.settings.presetFast },
                { value: 'medium', label: t.settings.presetMedium },
                { value: 'slow', label: t.settings.presetSlow },
                { value: 'veryslow', label: t.settings.presetVeryslow }
              ]}
            />
          </SettingRow>

          <div className="py-4 border-b border-white/5 last:border-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Film className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-white">{t.settings.qualityCrf}</span>
              </div>
              <span className="text-sm text-blue-400 font-medium">{settings.videoDefaultQuality}</span>
            </div>
            <input
              type="range"
              min="0"
              max="51"
              value={settings.videoDefaultQuality}
              onChange={(e) => settings.updateSetting('videoDefaultQuality', parseInt(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500"
            />
            <p className="text-xs text-gray-500 mt-2">{t.settings.qualityHint}</p>
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <div className="flex justify-end">
        <button
          onClick={settings.resetSettings}
          className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:text-white transition-all flex items-center gap-2 hover:bg-white/10"
          style={{ border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <RotateCcw className="w-4 h-4" />
          {t.settings.resetDefaults}
        </button>
      </div>
    </div>
  )
}
