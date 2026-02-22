export const locales = ['en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export type TranslationValue = string | TranslationMap;
export interface TranslationMap {
  [key: string]: TranslationValue;
}

export type StructuredI18n = Record<Locale, TranslationMap>;
