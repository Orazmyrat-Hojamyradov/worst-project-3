import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'tm', 'tr', 'ru'],
  defaultLocale: 'en',
})
