import '@testing-library/jest-dom'
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import matchers from '@testing-library/jest-dom/matchers'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import enResources from '../locales/en'

expect.extend(matchers)

afterEach(() => {
  cleanup()
})

// Initialize i18next for tests
i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  ns: ['translation'],
  defaultNS: 'translation',
  resources: {
    en: enResources
  },
  interpolation: {
    escapeValue: false
  }
})

export default i18n 