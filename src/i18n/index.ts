import {defaultLocale, type Locale} from './config';
import {enMessages, type AppMessages} from './messages/en';

const dictionaries: Record<Locale, AppMessages> = {en: enMessages};

type Primitive = string | number | boolean | null | undefined;

type DotNestedKeys<T> = T extends Primitive
  ? never
  : {
      [K in keyof T & string]: T[K] extends Primitive
        ? K
        : `${K}.${DotNestedKeys<T[K]>}`;
    }[keyof T & string];

export type MessageKey = DotNestedKeys<AppMessages>;

function getMessageValue(messages: AppMessages, key: MessageKey): string {
  const value = key.split('.').reduce<unknown>((acc, part) => {
    if (typeof acc === 'object' && acc !== null && part in acc) {
      return (acc as Record<string, unknown>)[part];
    }

    return undefined;
  }, messages);

  if (typeof value !== 'string') {
    throw new Error(`Missing translation for key "${key}"`);
  }

  return value;
}

export function getMessages(locale: Locale = defaultLocale): AppMessages {
  return dictionaries[locale];
}

export function t(
  messages: AppMessages,
  key: MessageKey,
  values?: Record<string, string | number>
): string {
  const message = getMessageValue(messages, key);
  if (!values) {
    return message;
  }

  return message.replace(/\{(\w+)\}/g, (_, token: string) => {
    const tokenValue = values[token];
    return tokenValue === undefined ? `{${token}}` : String(tokenValue);
  });
}
