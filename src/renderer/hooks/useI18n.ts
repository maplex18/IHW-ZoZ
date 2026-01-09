import { useMemo } from 'react'
import { useSettingsStore } from '@/stores/settingsStore'
import { getTranslation, Locale, TranslationKeys } from '@shared/i18n'

export function useI18n(): TranslationKeys {
  const language = useSettingsStore((state) => state.language) as Locale

  const t = useMemo(() => {
    return getTranslation(language)
  }, [language])

  return t
}
