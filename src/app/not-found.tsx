import type {Metadata} from 'next';
import {I18nService} from '@/lib/i18n';

const t = I18nService.translator();

export const metadata: Metadata = {
  title: t('meta.notFound.title'),
  description: t('meta.notFound.description'),
};

export default function NotFound() {
  return (
    <div className="pt-25 pb-5 flex items-center justify-center">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-sm text-muted-foreground">{t('notFound.message')}</p>
      </div>
    </div>
  );
}
