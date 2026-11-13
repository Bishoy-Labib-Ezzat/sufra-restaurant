import { AnimatePresence, motion } from 'motion/react';
import { Plus } from '@phosphor-icons/react';
import { QuantityStepper } from '@/shared/ui/QuantityStepper';
import { cn } from '@/shared/lib/cn';
import type { Product } from '@/shared/types';
import { useAddToCart } from '../../hooks/useAddToCart';
import { useCartQuantity, useCartStore } from '../../store/cart.store';

/** "+ Add" pill that turns into a quantity stepper once the dish is in the order. */
export function AddControl({ product, className }: { product: Product; className?: string }) {
  const quantity = useCartQuantity(product.id);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const addToCart = useAddToCart();

  if (!product.isAvailable) {
    return (
      <span className={cn('inline-flex h-9 items-center rounded-full bg-paper-deep px-3.5 text-xs font-semibold text-muted', className)}>
        Sold out today
      </span>
    );
  }

  return (
    <div className={cn('relative', className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        {quantity === 0 ? (
          <motion.button
            key="add"
            type="button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 500, damping: 32 }}
            onClick={() => addToCart(product)}
            aria-label={`Add ${product.name} to your order`}
            className="inline-flex h-9 items-center gap-1 rounded-full bg-ink pr-4 pl-3 text-sm font-semibold text-paper shadow-lift transition-colors hover:bg-tomato active:scale-95"
          >
            <Plus size={16} weight="bold" aria-hidden />
            Add
          </motion.button>
        ) : (
          <motion.div
            key="stepper"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 500, damping: 32 }}
          >
            <QuantityStepper
              value={quantity}
              onChange={(next) => setQuantity(product.id, next)}
              itemName={product.name}
              removable
              size="sm"
              tone="ink"
              className="shadow-lift"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
