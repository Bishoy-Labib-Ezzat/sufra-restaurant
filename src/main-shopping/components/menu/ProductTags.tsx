import { Leaf, Pepper, Sparkle, Star } from '@phosphor-icons/react';
import type { ElementType } from 'react';
import { tagLabel } from '@/shared/lib/product-tags';
import { cn } from '@/shared/lib/cn';
import type { ProductTag } from '@/shared/types';

const ICONS: Record<ProductTag, { icon: ElementType; className: string }> = {
  signature: { icon: Star, className: 'text-tomato-deep' },
  new: { icon: Sparkle, className: 'text-status-new-ink' },
  vegetarian: { icon: Leaf, className: 'text-status-ready-ink' },
  spicy: { icon: Pepper, className: 'text-tomato-deep' },
};

export function ProductTags({ tags, className }: { tags: ProductTag[]; className?: string }) {
  if (!tags.length) return null;
  return (
    <ul className={cn('flex flex-wrap gap-x-3 gap-y-1', className)}>
      {tags.map((tag) => {
        const { icon: Icon, className: tone } = ICONS[tag];
        return (
          <li key={tag} className={cn('inline-flex items-center gap-1 text-xs font-semibold', tone)}>
            <Icon size={14} weight="fill" aria-hidden />
            {tagLabel(tag)}
          </li>
        );
      })}
    </ul>
  );
}
