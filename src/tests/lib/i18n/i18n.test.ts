import {describe, expect, it} from 'vitest';
import {I18nService} from '@/lib/i18n';

describe('i18n', () => {
  it('returns english messages by default', () => {
    const messages = I18nService.locale();
    expect(messages.nav.home).toBe('Home');
  });

  it('resolves nested translation keys', () => {
    const messages = I18nService.locale();
    expect(I18nService.t(messages, 'common.overview')).toBe('Overview');
  });

  it('interpolates variables in translations', () => {
    const messages = I18nService.locale();

    expect(
      I18nService.t(messages, 'common.updatedOn', {date: 'Jan 1, 2026'})
    ).toBe('Updated Jan 1, 2026');
  });

  it('creates a locale-specific translator function', () => {
    const translator = I18nService.translator();

    expect(translator('nav.projects')).toBe('Projects');
    expect(translator('common.updatedOn', {date: 'Feb 22, 2026'})).toBe('Updated Feb 22, 2026');
  });
});
