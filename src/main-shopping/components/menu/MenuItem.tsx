import { photo } from '@/shared/lib/image';
import { cn } from '@/shared/lib/cn';
import { Price } from '@/shared/ui/Price';
import type { Product } from '@/shared/types';
import { AddControl } from './AddControl';
import { ProductTags } from './ProductTags';

interface MenuItemProps {
  product: Product;
  /** Opens the dish details. Omit for a static preview (e.g. the dashboard editor). */
  onOpen?: (product: Product) => void;
  className?: string;
}

/** A single menu line: text on the left, plate on the right, add control resting on the plate's edge. */
export function MenuItem({ product, onOpen, className }: MenuItemProps) {
  const soldOut = !product.isAvailable;

  return (
    <article className={cn('group relative grid grid-cols-[1fr_auto] gap-4 py-5 sm:gap-6', className)}>
      <div className="flex min-w-0 flex-col gap-1.5">
        <h3 className="font-display text-[1.3rem] leading-tight font-bold tracking-tight text-ink">
          {onOpen ? (
            <button
              type="button"
              onClick={() => onOpen(product)}
              className="text-left after:absolute after:inset-0 after:rounded-panel after:content-[''] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-tomato"
            >
              {product.name}
            </button>
          ) : (
            product.name
          )}
        </h3>
        <p className={cn('line-clamp-2 text-[15px] leading-relaxed text-muted', soldOut && 'opacity-70')}>
          {product.description}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2">
          <Price amount={product.price} className={cn('text-[15px] text-ink', soldOut && 'text-muted line-through')} />
          <ProductTags tags={product.tags} />
        </div>
      </div>

      <div className="relative w-24 min-[380px]:w-28 sm:w-32">
        <div className="aspect-square overflow-hidden rounded-thumb bg-paper-deep">
          <img
            src={photo(product.imageUrl, 320, 320)}
            alt=""
            loading="lazy"
            decoding="async"
            className={cn(
              'size-full object-cover transition-transform duration-500 ease-out-expo group-hover:scale-[1.06]',
              soldOut && 'grayscale',
            )}
          />
        </div>
        <div className="absolute inset-x-0 -bottom-3 z-10 flex justify-center">
          {onOpen ? (
            <AddControl product={product} />
          ) : (
            <span aria-hidden className="inline-flex h-9 items-center rounded-full bg-ink px-4 text-sm font-semibold text-paper shadow-lift">
              {soldOut ? 'Sold out today' : '+ Add'}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
