import { ref, computed } from 'vue'
import en from '../locales/en'
import ja from '../locales/ja'
import ko from '../locales/ko'

const translations = {
  en,
  ja,
  ko
}

// Load saved locale from localStorage, default to 'ko' for new users.
// Existing users with a stored preference keep it. Unknown stored values
// fall back to 'ko' rather than silently using a key that has no dictionary.
const DEFAULT_LOCALE = 'ko'
const storedLocale = localStorage.getItem('app-locale')
const savedLocale =
  storedLocale && ['en', 'ja', 'ko'].includes(storedLocale)
    ? storedLocale
    : DEFAULT_LOCALE
const currentLocale = ref(savedLocale)

// Currency is automatically set based on locale (en -> USD, ja -> JPY)
const currentCurrency = computed(() => {
  return currentLocale.value === 'ja' ? 'JPY' : 'USD'
})

export function useI18n() {
  const t = (key, params = {}) => {
    const keys = key.split('.')
    let value = translations[currentLocale.value]

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k]
      } else {
        // If translation not found, try English as fallback
        if (currentLocale.value !== 'en') {
          let fallback = translations.en
          for (const fk of keys) {
            if (fallback && typeof fallback === 'object') {
              fallback = fallback[fk]
            } else {
              break
            }
          }
          if (fallback && typeof fallback === 'string') {
            return replacePlaceholders(fallback, params)
          }
        }
        // If still not found, return the key itself
        return key
      }
    }

    if (typeof value === 'string') {
      return replacePlaceholders(value, params)
    }

    return key
  }

  const replacePlaceholders = (text, params) => {
    return text.replace(/\{(\w+)\}/g, (match, key) => {
      return params[key] !== undefined ? params[key] : match
    })
  }

  const setLocale = (locale) => {
    if (translations[locale]) {
      currentLocale.value = locale
      localStorage.setItem('app-locale', locale)
    }
  }

  const availableLocales = computed(() => Object.keys(translations))

  const localeName = computed(() => {
    const names = {
      en: 'English',
      ja: '日本語',
      ko: '한국어'
    }
    return names[currentLocale.value] || currentLocale.value
  })

  // Translate product names
  const translateProductName = (productName) => {
    const locale = currentLocale.value
    if ((locale === 'ja' || locale === 'ko') && translations[locale].productNames[productName]) {
      return translations[locale].productNames[productName]
    }
    return productName
  }

  // Translate customer names
  const translateCustomerName = (customerName) => {
    const locale = currentLocale.value
    if ((locale === 'ja' || locale === 'ko') && translations[locale].customerNames[customerName]) {
      return translations[locale].customerNames[customerName]
    }
    return customerName
  }

  // Translate warehouse names using locale dictionaries to avoid embedding
  // non-ASCII literals in source (tool limitations with certain encodings).
  const translateWarehouse = (warehouseName) => {
    const locale = currentLocale.value
    if (locale === 'ja' || locale === 'ko') {
      // Map English city names to locale dictionary keys
      const cityKeyMap = {
        'San Francisco': 'sanFrancisco',
        London: 'london',
        Tokyo: 'tokyo'
      }
      const key = cityKeyMap[warehouseName]
      if (key && translations[locale].warehouses && translations[locale].warehouses[key]) {
        return translations[locale].warehouses[key]
      }

      // Handle "Warehouse X-##" pattern. Match the trailing space so each
      // locale decides whether to keep a space (ko: "창고 A-12") or collapse
      // it (ja: "倉庫A-12", preserving the pre-ko-locale behavior).
      if (warehouseName.startsWith('Warehouse ')) {
        const label =
          locale === 'ja' ? '倉庫' : locale === 'ko' ? '창고 ' : null
        if (label) return warehouseName.replace('Warehouse ', label)
      }

      return warehouseName
    }
    return warehouseName
  }

  return {
    t,
    setLocale,
    currentLocale: computed(() => currentLocale.value),
    currentCurrency,
    availableLocales,
    localeName,
    translateProductName,
    translateCustomerName,
    translateWarehouse
  }
}
