import { t } from '@/shared/i18n';
import { Button } from '@/shared/ui/Button';
import { Price } from '@/shared/ui/Price';

interface MobileCheckoutBarProps {
  total: number;
  /** Delivery chosen but no area yet, so the total does not include the fee. */
  feePending: boolean;
  submitting: boolean;
}

/** Total and "أرسل الطلب" pinned to the bottom of the screen on phones and tablets. Lives inside the form. */
export function MobileCheckoutBar({ total, feePending, submitting }: MobileCheckoutBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden">
      <div className="mx-auto flex max-w-xl items-center gap-4">
        <div className="flex shrink-0 flex-col">
          <span className="text-xs text-muted">{feePending ? t.shop.checkout.beforeDelivery : t.common.total}</span>
          <Price amount={total} strong className="text-lg" />
        </div>
        <Button type="submit" size="lg" loading={submitting} className="min-w-0 flex-1 px-4">
          {submitting ? t.shop.checkout.placingShort : t.shop.checkout.placeOrder}
        </Button>
      </div>
    </div>
  );
}
