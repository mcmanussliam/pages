import Link from 'next/link';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';


export interface BreadcrumbNavItemProps {
  label: string;
  href?: string;
}

interface BreadcrumbNavProps {
  items: readonly BreadcrumbNavItemProps[];
}

function BreadcrumbNavItem({item, isLast}: {
  item: BreadcrumbNavItemProps;
  isLast: boolean;
}) {
  const showLink = !isLast && item.href;

  return (
    <>
      <BreadcrumbItem>
        {showLink ? (
          <BreadcrumbLink asChild>
            {item.href ? <Link href={item.href}>{item.label}</Link> : <p>{item.label}</p>}
          </BreadcrumbLink>
        ) : (
          <BreadcrumbPage>{item.label}</BreadcrumbPage>
        )}
      </BreadcrumbItem>
      {!isLast && <BreadcrumbSeparator />}
    </>
  );
}

export function BreadcrumbNav({items}: BreadcrumbNavProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => (
          <BreadcrumbNavItem
            item={item}
            isLast={index === items.length - 1}
            key={item.href || item.label}
          />
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
