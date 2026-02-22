import React from 'react';
import {renderHook} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {getMessages} from '@/lib/i18n';
import {I18nProvider, useI18n} from '@/lib/i18n/i18n-provider';

describe('i18n-provider', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('uses default locale/messages when rendered without a provider', () => {
    const {result} = renderHook(() => useI18n());

    expect(result.current.locale).toBe('en');
    expect(result.current.t('nav.home')).toBe('Home');
  });

  it('uses provider locale/messages when available', () => {
    const defaultMessages = getMessages();
    const messages = {
      ...defaultMessages,
      nav: {
        ...defaultMessages.nav,
        home: 'Homepage',
      },
    };

    const wrapper = ({children}: {children: React.ReactNode}) => (
      <I18nProvider locale="en" messages={messages}>{children}</I18nProvider>
    );

    const {result} = renderHook(() => useI18n(), {wrapper});
    expect(result.current.locale).toBe('en');
    expect(result.current.t('nav.home')).toBe('Homepage');
  });

  it('throws in development when hook is used outside provider', () => {
    vi.stubEnv('NODE_ENV', 'development');

    expect(() => renderHook(() => useI18n())).toThrow(
      'useI18n must be used within an I18nProvider.'
    );
  });
});
