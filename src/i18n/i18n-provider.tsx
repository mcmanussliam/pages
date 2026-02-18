'use client';

import React, {createContext, useContext} from 'react';
import {defaultLocale, type Locale} from './config';
import {getMessages, t, type MessageKey} from './index';
import type {AppMessages} from './messages/en';

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
  const locale = context?.locale ?? defaultLocale;
  const messages = context?.messages ?? getMessages(defaultLocale);

  return {
    locale,
    t: (key: MessageKey, values?: Record<string, string | number>) => t(messages, key, values),
  };
}
