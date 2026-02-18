import Link from 'next/link';
import {githubConfig} from '@/config/github.config';
import {getTranslator} from '@/i18n/server';
import {NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList} from '../ui/navigation-menu';
import {ModeToggle} from './mode-toggle';

export default function Root() {
  const t = getTranslator();

  return (
    <NavigationMenu className='max-w-none w-full flex justify-between p-5'>
      <NavigationMenuList className='gap-3'>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href="/">{t('nav.home')}</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href="/projects">{t('nav.projects')}</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href={githubConfig.profileUrl}>{t('nav.github')}</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>

      <NavigationMenuList className='gap-3'>
        <NavigationMenuItem>
          <ModeToggle/>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
