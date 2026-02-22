'use client';

import React, {createContext, useContext} from 'react';
import {getMessages, t, type MessageKey} from './index';
import type {AppMessages} from './locales';
import {defaultLocale, type Locale} from './i18n-config';

interface I18nContextValue {
  locale: Locale;
  messages: AppMessages;
}

const I18nContext = createContext<I18nContextValue | null>(null);

interface I18nProviderProps {
  locale: Locale;
  messages: AppMessages;
  children: React.ReactNode;
}

export function I18nProvider({locale, messages, children}: I18nProviderProps) {
  return (
    <I18nContext.Provider value={{locale, messages}}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context && process.env.NODE_ENV === 'development') {
    throw new Error('useI18n must be used within an I18nProvider.');
  }

  const locale = context?.locale ?? defaultLocale;
  const messages = context?.messages ?? getMessages(defaultLocale);

  return {
    locale,
    t: (key: MessageKey, values?: Record<string, string | number>) => t(messages, key, values),
  };
}
