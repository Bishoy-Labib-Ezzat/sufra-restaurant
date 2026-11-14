import { useRef } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react';
import { useProducts } from '@/shared/hooks/catalog';
import { t } from '@/shared/i18n';
import { photo } from '@/shared/lib/image';
import { IconButton } from '@/shared/ui/Button';
import { Price } from '@/shared/ui/Price';
import { ErrorState, Skeleton } from '@/shared/ui/states';
import type { Product } from '@/shared/types';
import { useProductDialog } from '../../hooks/useProductDialog';
import { AddControl } from '../menu/AddControl';

function FeaturedCard({ product }: { product: Product }) {
  const { open } = useProductDialog();
  return (
    <li className="group relative w-[72vw] max-w-[300px] shrink-0 snap-start sm:w-[280px]">
      <div className="relative aspect-[4/5] overflow-hidden rounded-panel bg-paper-deep">
        <img
          src={photo(product.imageUrl, 600, 750)}
          alt=""
          loading="lazy"
          className="size-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
        />
        <div className="absolute end-3 bottom-3 z-10">
          <AddControl product={product} />
        </div>
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <h3 className="font-display text-xl leading-tight font-bold">
          <button
            type="button"
            onClick={() => open(product.id)}
            className="text-start after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
          >
            {product.name}
          </button>
        </h3>
        <Price amount={product.price} className="mt-1 text-[15px]" />
      </div>
      <p className="mt-1 line-clamp-1 text-[15px] text-muted">{product.description}</p>
    </li>
  );
}

export function FeaturedRail() {
  const featured = useProducts({ featured: true, available: true });
  const rail = useRef<HTMLUListElement>(null);
  // Right to left: moving forward means scrolling towards the left, so the offset is negative.
  const scroll = (direction: 1 | -1) => rail.current?.scrollBy({ left: -direction * 300, behavior: 'smooth' });

  return (
    <section className="mx-auto max-w-7xl py-24">
      <div className="flex items-end justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2">
          <h2 className="display text-5xl sm:text-6xl">{t.shop.home.featured.title}</h2>
          <p className="text-[15px] text-muted">
            {t.shop.home.featured.body}{' '}
            <Link to="/menu" className="font-semibold text-ink underline underline-offset-4">
              {t.shop.home.featured.seeAll}
            </Link>
          </p>
        </div>
        <div className="hidden gap-2 sm:flex">
          <IconButton icon={ArrowRight} label={t.shop.home.featured.back} variant="secondary" onClick={() => scroll(-1)} />
          <IconButton icon={ArrowLeft} label={t.shop.home.featured.forward} variant="secondary" onClick={() => scroll(1)} />
        </div>
      </div>

      {featured.error ? (
        <div className="mt-8 px-4 sm:px-6 lg:px-8">
          <ErrorState error={featured.error} onRetry={() => featured.refetch()} retrying={featured.isFetching} compact />
        </div>
      ) : (
        <ul
          ref={rail}
          className="scrollbar-none mt-8 flex snap-x snap-mandatory scroll-px-4 gap-5 overflow-x-auto px-4 pb-4 sm:scroll-px-6 sm:px-6 lg:scroll-px-8 lg:px-8"
        >
          {featured.isPending
            ? Array.from({ length: 5 }, (_, index) => (
                <li key={index} className="w-[72vw] max-w-[300px] shrink-0 sm:w-[280px]">
                  <Skeleton className="aspect-[4/5] w-full rounded-panel" />
                  <Skeleton className="mt-4 h-6 w-2/3" />
                  <Skeleton className="mt-2 h-4 w-full" />
                </li>
              ))
            : featured.data?.map((product) => <FeaturedCard key={product.id} product={product} />)}
        </ul>
      )}
    </section>
  );
}
