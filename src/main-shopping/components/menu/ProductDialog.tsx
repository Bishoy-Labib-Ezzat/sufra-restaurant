import { useState } from 'react';
import { X } from '@phosphor-icons/react';
import { useCategories, useProduct, useProducts } from '@/shared/hooks/catalog';
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

function Details({ product, onDone }: { product: Product; onDone: () => void }) {
  const [quantity, setQuantity] = useState(1);
  const inCart = useCartQuantity(product.id);
  const addToCart = useAddToCart();
  const categories = useCategories();
  const products = useProducts();
  const { open } = useProductDialog();
  const category = categories.data?.find((item) => item.id === product.categoryId);
  const pairings = suggestPairings(product, categories.data ?? [], products.data ?? []);

  return (
    <div className="grid overflow-y-auto sm:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <div className="relative aspect-[4/3] bg-paper-deep sm:aspect-auto sm:min-h-full">
        <img
          src={photo(product.imageUrl, 900, 900)}
          alt={product.name}
          className={`absolute inset-0 size-full object-cover ${product.isAvailable ? '' : 'grayscale'}`}
        />
      </div>

      <div className="flex flex-col gap-5 p-6 sm:p-8">
        <div className="flex flex-col gap-2">
          {category && <p className="text-sm font-semibold text-tomato-deep">{category.name}</p>}
          <h2 className="display text-[2.6rem] sm:text-5xl">{product.name}</h2>
          <Price amount={product.price} className="text-lg text-ink" />
        </div>
        <p className="text-[15px] leading-relaxed text-ink-soft">{product.description}</p>
        <ProductTags tags={product.tags} />

        {product.isAvailable ? (
          <div className="flex flex-col gap-3 border-t border-line pt-5">
            {inCart > 0 && (
              <p className="text-sm text-muted">
                Already in your order: <span className="font-mono font-semibold text-ink">{inCart}</span>
              </p>
            )}
            <div className="flex items-center gap-3">
              <QuantityStepper value={quantity} onChange={setQuantity} itemName={product.name} />
              <Button
                size="lg"
                className="flex-1"
                data-autofocus
                onClick={() => {
                  addToCart(product, quantity);
                  onDone();
                }}
              >
                Add · {formatMoney(product.price * quantity)}
              </Button>
            </div>
          </div>
        ) : (
          <p className="rounded-field bg-paper-deep px-4 py-3 text-sm font-medium text-ink-soft">
            Sold out for today. It is usually back tomorrow.
          </p>
        )}

        {pairings.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-line pt-5">
            <h3 className="font-display text-lg font-bold">Goes well with</h3>
            <ul className="flex flex-col gap-3">
              {pairings.map((item) => (
                <li key={item.id} className="flex items-center gap-3">
                  <img src={photo(item.imageUrl, 120, 120)} alt="" className="size-12 rounded-thumb object-cover" />
                  <button type="button" onClick={() => open(item.id)} className="min-w-0 flex-1 text-left">
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
    <Overlay open={Boolean(openId)} onClose={close} label={product?.name ?? 'Dish details'} className="sm:max-w-4xl">
      <div className="absolute top-3 right-3 z-10">
        <IconButton icon={X} label="Close" variant="secondary" onClick={close} className="shadow-lift" />
      </div>
      {product ? (
        <Details key={product.id} product={product} onDone={close} />
      ) : fallback.error ? (
        <div className="p-6">
          <ErrorState error={fallback.error} title="We could not find this dish" compact />
        </div>
      ) : (
        <div className="grid gap-6 p-6 sm:grid-cols-2" role="status" aria-label="Loading dish">
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
