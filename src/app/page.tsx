import type {Metadata} from 'next';
import {getTranslator} from '@/i18n/server';

const t = getTranslator();

export const metadata: Metadata = {
  title: t('meta.home.title'),
  description: t('meta.home.description'),
};

export default function Page() {
  return (
    <>
      <h1 className='heading'>{t('home.title')}</h1>
      <p>{t('home.message')}</p>
    </>
  );
}
