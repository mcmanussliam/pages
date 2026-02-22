import {defaultLocale, type Locale} from './i18n-config';
import {getMessages, t, type MessageKey} from './index';

export function getTranslator(locale: Locale = defaultLocale) {
  const messages = getMessages(locale);
  return (key: MessageKey, values?: Record<string, string | number>) => t(messages, key, values);
}
