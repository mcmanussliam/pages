import Link from 'next/link';
import {githubConfig} from '@/config/github.config';
import {getTranslator} from '@/i18n/server';
import {NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList} from '../ui/navigation-menu';
import {ModeToggle} from './mode-toggle';

export default function Root() {
  const t = getTranslator();
  const navItems = [
    {href: '/', label: t('nav.projects')},
    {href: githubConfig.profileUrl, label: t('nav.github')},
  ];

  return (
    <NavigationMenu className='max-w-none w-full flex justify-between p-5'>
      <NavigationMenuList className='gap-3'>
        {navItems.map(item => (
          <NavigationMenuItem key={item.href}>
            <NavigationMenuLink asChild>
              <Link href={item.href}>{item.label}</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>

      <NavigationMenuList className='gap-3'>
        <NavigationMenuItem>
          <ModeToggle/>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
