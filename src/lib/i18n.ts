import en from '../locales/en.json';
import zh from '../locales/zh.json';

export const translations = {
  zh,
  en,
} as const;

export type TranslationKeys = (typeof translations)['zh'];
export type Language = keyof typeof translations;

/** Get nested translation by dot-separated key */
export function getTranslation(lang: Language, key: string): string {
  const keys = key.split('.');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let value: any = translations[lang];

  for (const k of keys) {
    value = value?.[k];
  }

  return value || key;
}
