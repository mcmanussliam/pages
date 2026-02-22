import {type DeepNestedKeys} from '../../types/deep-nested-keys';
import {defaultLocale, type Locale} from './i18n-config';
import {i18n, type AppMessages, type I18n} from './locales';

const dictionaries: I18n = i18n;
export type Token = DeepNestedKeys<AppMessages>;

export class I18nService {
  public static t(messages: AppMessages, token: Token, ph?: Record<string, string | number>): string {
    const message = I18nService.get(messages, token);
    if (!ph) {
      return message;
    }

    return message.replace(/\{(\w+)\}/g, (_, key: string) => {
      const value = ph[key];
      return value === undefined ? `{${key}}` : String(value);
    });
  }

  public tfl(locale: Locale = defaultLocale) {
    const messages = I18nService.locale(locale);
    return (key: Token, values?: Record<string, string | number>) => I18nService.t(messages, key, values);
  }

  public static get(messages: AppMessages, token: Token): string {
    const value = token.split('.').reduce<unknown>((acc, part) => {
      if (typeof acc === 'object' && acc !== null && part in acc) {
        return (acc as Record<string, unknown>)[part];
      }

      return undefined;
    }, messages);

    if (typeof value !== 'string') {
      throw new Error(`Missing translation for key "${token}"`);
    }

    return value;
  }

  public static locale(locale: Locale = defaultLocale): AppMessages {
    return dictionaries[locale];
  }
}
