import { photo } from '@/shared/lib/image';
import { Price } from '@/shared/ui/Price';
import { QuantityStepper } from '@/shared/ui/QuantityStepper';
import { cn } from '@/shared/lib/cn';
import { useCartStore, type CartLine } from '../../store/cart.store';

export function CartLineRow({ line, unavailable, compact }: { line: CartLine; unavailable?: boolean; compact?: boolean }) {
  const setQuantity = useCartStore((state) => state.setQuantity);

  return (
    <li className="flex items-center gap-3 py-3">
      <img
        src={photo(line.imageUrl, 140, 140)}
        alt=""
        className={cn('shrink-0 rounded-thumb object-cover', compact ? 'size-12' : 'size-16', unavailable && 'grayscale')}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="truncate text-[15px] font-semibold">{line.name}</p>
        {unavailable ? (
          <p className="text-sm font-medium text-danger">Sold out, remove to continue</p>
        ) : (
          <Price amount={line.unitPrice * line.quantity} className="text-sm text-ink-soft" />
        )}
      </div>
      <QuantityStepper
        value={line.quantity}
        onChange={(next) => setQuantity(line.productId, next)}
        itemName={line.name}
        removable
        size="sm"
      />
    </li>
  );
}
