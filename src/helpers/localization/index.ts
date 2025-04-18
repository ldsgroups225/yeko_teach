// src/helpers/localization/index.ts

import type { Scope, TranslateOptions } from 'i18n-js'
import i18n from '@helpers/global/i18nInstance'

/**
 * Translates the given key into the current language.
 *
 * @param key - The translation key.
 * @param options - Optional translation options.
 * @returns The translated text.
 */
function translate(key: Scope, options?: TranslateOptions): string {
  return i18n.t(key, options)
}

export default translate
