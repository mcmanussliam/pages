import {describe, expect, it} from 'vitest';
import {getMessages, t} from '@/lib/i18n';
import {I18nService} from '@/lib/i18n/i18n-service';

describe('i18n', () => {
  it('returns english messages by default', () => {
    const messages = getMessages();
    expect(messages.nav.home).toBe('Home');
  });

  it('resolves nested translation keys', () => {
    const messages = getMessages();
    expect(t(messages, 'common.overview')).toBe('Overview');
  });

  it('interpolates variables in translations', () => {
    const messages = getMessages();

    expect(
      t(messages, 'common.updatedOn', {date: 'Jan 1, 2026'})
    ).toBe('Updated Jan 1, 2026');
  });

  it('creates a locale-specific translator function', () => {
    const translator = new I18nService().tfl();

    expect(translator('nav.projects')).toBe('Projects');
    expect(translator('common.updatedOn', {date: 'Feb 22, 2026'})).toBe('Updated Feb 22, 2026');
  });
});
