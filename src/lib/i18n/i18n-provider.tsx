'use client';

import React, {createContext, useContext} from 'react';
import {defaultLocale, type Locale} from './i18n-config';
import {I18nService, type Token} from './i18n-service';
import {type Messages} from './locales';

interface I18nContextValue {
  locale: Locale;

messages: Messages;
}

const I18nContext = createContext<I18nContextValue | null>(null);

interface I18nProviderProps {
  locale: Locale;

messages: Messages;

children: React.ReactNode;
}

export function I18nProvider({locale, messages, children}: I18nProviderProps): React.JSX.Element {
  return (
    <I18nContext.Provider value={{locale, messages}}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): {
  locale: Locale;
  t: (key: Token, values?: Record<string, string | number>) => string;
} {
  const context = useContext(I18nContext);
  if (!context && process.env.NODE_ENV === 'development') {
    throw new Error('`useI18n` must be used within an `I18nProvider`.');
  }

  const locale = context?.locale ?? defaultLocale;
  const i18n = context?.messages ?? I18nService.locale(defaultLocale);

  return {
    locale,
    t: (key: Token, values?: Record<string, string | number>) => I18nService.t(i18n, key, values),
  };
}
