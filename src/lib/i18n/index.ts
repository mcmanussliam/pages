import {defaultLocale, type Locale} from './i18n-config';
import {I18nService, type Token} from './i18n-service';
import type {AppMessages} from './locales';

export type MessageKey = Token;

export function getMessages(locale: Locale = defaultLocale): AppMessages {
  return I18nService.locale(locale);
}

export function t(
  messages: AppMessages,
  key: MessageKey,
  values?: Record<string, string | number>
): string {
  return I18nService.t(messages, key, values);
}
