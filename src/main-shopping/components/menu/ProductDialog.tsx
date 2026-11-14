import { useState } from 'react';
import { X } from '@phosphor-icons/react';
import { useCategories, useProduct, useProducts } from '@/shared/hooks/catalog';
import { fill, formatNumber, t } from '@/shared/i18n';
import { formatMoney } from '@/shared/lib/format';
import { photo } from '@/shared/lib/image';
import { Button, IconButton } from '@/shared/ui/Button';
import { Overlay } from '@/shared/ui/Overlay';
import { Price } from '@/shared/ui/Price';
import { QuantityStepper } from '@/shared/ui/QuantityStepper';
import { ErrorState, Skeleton } from '@/shared/ui/states';
import type { Product } from '@/shared/types';
import { useAddToCart } from '../../hooks/useAddToCart';
import { useProductDialog } from '../../hooks/useProductDialog';
import { suggestPairings } from '../../lib/menu';
import { useCartQuantity } from '../../store/cart.store';
import { AddControl } from './AddControl';
import { ProductTags } from './ProductTags';

function AddBar({ product, onDone }: { product: Product; onDone: () => void }) {
  const [quantity, setQuantity] = useState(1);
  const inCart = useCartQuantity(product.id);
  const addToCart = useAddToCart();

  return (
    <div className="sticky bottom-0 z-10 flex flex-col gap-2 border-t border-line bg-surface/95 px-5 py-3 backdrop-blur-md min-[380px]:px-6 sm:static sm:px-8 sm:py-4">
      {inCart > 0 && (
        <p className="text-sm text-muted">
          {t.shop.product.inCart} <span className="font-mono font-semibold text-ink">{formatNumber(inCart)}</span>
        </p>
      )}
      <div className="flex items-center gap-3">
        <QuantityStepper value={quantity} onChange={setQuantity} itemName={product.name} />
        <Button
          size="lg"
          className="min-w-0 flex-1 px-4"
          data-autofocus
          onClick={() => {
            addToCart(product, quantity);
            onDone();
          }}
        >
          {fill(t.shop.product.addFor, { price: formatMoney(product.price * quantity) })}
        </Button>
      </div>
    </div>
  );
}

function Details({ product, onDone }: { product: Product; onDone: () => void }) {
  const categories = useCategories();
  const products = useProducts();
  const { open } = useProductDialog();
  const category = categories.data?.find((item) => item.id === product.categoryId);
  const pairings = suggestPairings(product, categories.data ?? [], products.data ?? []);

  // Phones: the whole sheet scrolls and the add bar sticks to its bottom edge, always in thumb reach.
  // Larger screens: photo at the start (right), details scroll at the end above the add bar.
  return (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain sm:grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] sm:grid-rows-[minmax(0,1fr)] sm:overflow-hidden">
      <div className="relative aspect-[16/11] bg-paper-deep sm:aspect-auto sm:h-full sm:min-h-[460px]">
        <img
          src={photo(product.imageUrl, 900, 900)}
          alt={product.name}
          className={`absolute inset-0 size-full object-cover ${product.isAvailable ? '' : 'grayscale'}`}
        />
      </div>

      <div className="flex min-h-0 flex-col">
        <div className="flex flex-col gap-5 p-5 min-[380px]:p-6 sm:flex-1 sm:overflow-y-auto sm:p-8">
          <div className="flex flex-col gap-2">
            {category && <p className="text-sm font-semibold text-tomato-deep">{category.name}</p>}
            <h2 className="display text-[clamp(2.1rem,10vw,2.6rem)] leading-[1.25] sm:text-5xl">{product.name}</h2>
            <Price amount={product.price} className="text-lg text-ink" />
          </div>
          <p className="text-[15px] leading-relaxed text-ink-soft">{product.description}</p>
          <ProductTags tags={product.tags} />

          {!product.isAvailable && (
            <p className="rounded-field bg-paper-deep px-4 py-3 text-sm font-medium text-ink-soft">
              {t.shop.product.soldOutNote}
            </p>
          )}

          {pairings.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-line pt-5">
              <h3 className="font-display text-xl">{t.shop.product.pairings}</h3>
              <ul className="flex flex-col gap-3">
                {pairings.map((item) => (
                  <li key={item.id} className="flex items-center gap-3">
                    <img src={photo(item.imageUrl, 120, 120)} alt="" className="size-12 shrink-0 rounded-thumb object-cover" />
                    <button type="button" onClick={() => open(item.id)} className="min-h-11 min-w-0 flex-1 text-start">
                      <span className="block truncate text-[15px] font-semibold hover:underline">{item.name}</span>
                      <Price amount={item.price} className="text-sm text-muted" />
                    </button>
                    <AddControl product={item} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {product.isAvailable && <AddBar product={product} onDone={onDone} />}
      </div>
    </div>
  );
}

/** Dish details, driven by the `?item=` URL parameter. */
export function ProductDialog() {
  const { openId, close } = useProductDialog();
  const products = useProducts();
  const cached = products.data?.find((product) => product.id === openId);
  const fallback = useProduct(openId && !cached && !products.isPending ? openId : undefined);
  const product = cached ?? fallback.data;

  return (
    <Overlay open={Boolean(openId)} onClose={close} label={product?.name ?? t.shop.product.details} className="sm:max-w-4xl">
      <div className="absolute top-3 end-3 z-20">
        <IconButton icon={X} label={t.common.close} variant="secondary" onClick={close} className="shadow-lift" />
      </div>
      {product ? (
        <Details key={product.id} product={product} onDone={close} />
      ) : fallback.error ? (
        <div className="p-6">
          <ErrorState error={fallback.error} title={t.shop.product.notFound} compact />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2" role="status" aria-label={t.shop.product.loading}>
          <Skeleton className="aspect-square w-full rounded-panel" />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      )}
    </Overlay>
  );
}
