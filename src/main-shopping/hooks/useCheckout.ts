import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { isApiError } from '@/shared/api/errors';
import { queryKeys } from '@/shared/api/query-keys';
import { useDeliveryZones, useProducts } from '@/shared/hooks/catalog';
import { calculateTotals } from '@/shared/lib/pricing';
import { checkoutSchema, savedDetails, SERVER_FIELD_MAP, toCreateOrderRequest, type CheckoutValues } from '../lib/checkout';
import { useCartStore } from '../store/cart.store';
import { useCartLines } from './useCart';
import { useRecentOrders } from '../store/shop-ui.store';
import { usePlaceOrder } from './orders';

function defaultValues(): CheckoutValues {
  const saved = savedDetails.read();
  return {
    fulfillment: saved.fulfillment ?? 'delivery',
    name: saved.name ?? '',
    phone: saved.phone ?? '',
    zoneId: saved.zoneId ?? '',
    street: saved.street ?? '',
    details: saved.details ?? '',
    landmark: saved.landmark ?? '',
    notes: '',
    saveDetails: true,
  };
}

/** Everything the checkout page needs: form, live cart reconciliation, totals and submission. */
export function useCheckout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { lines, isPending: cartPending } = useCartLines();
  const clearCart = useCartStore((state) => state.clear);
  const rememberOrder = useRecentOrders((state) => state.remember);
  const zones = useDeliveryZones();
  const products = useProducts();
  const placeOrder = usePlaceOrder();
  const [placed, setPlaced] = useState(false);
  const [submitError, setSubmitError] = useState<unknown>(null);

  const form = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: defaultValues(),
    mode: 'onTouched',
  });

  // The area <select> only gets its options once zones load, so a remembered area set before that
  // is not shown. Re-apply it so the dropdown matches the form (and the fee in the summary).
  useEffect(() => {
    if (zones.data) form.setValue('zoneId', form.getValues('zoneId'));
  }, [zones.data, form]);

  const unavailable = useMemo(() => {
    if (!products.data) return [];
    const available = new Set(products.data.filter((product) => product.isAvailable).map((product) => product.id));
    return lines.filter((line) => !available.has(line.productId));
  }, [lines, products.data]);

  const fulfillment = form.watch('fulfillment');
  const zoneId = form.watch('zoneId');
  const zone = fulfillment === 'delivery' ? zones.data?.find((item) => item.id === zoneId) : undefined;
  const totals = calculateTotals(lines, zone?.fee ?? 0);

  const submit = form.handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      const tracking = await placeOrder.mutateAsync(toCreateOrderRequest(values, lines));
      savedDetails.write(values);
      rememberOrder(tracking.code);
      setPlaced(true);
      clearCart();
      navigate(`/order/${tracking.code}`, { state: { justPlaced: true } });
    } catch (error) {
      if (isApiError(error)) {
        for (const [field, message] of Object.entries(error.fieldErrors)) {
          const target = SERVER_FIELD_MAP[field];
          if (target) form.setError(target, { message }, { shouldFocus: true });
        }
        if (error.code === 'items_unavailable') {
          queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
        }
      }
      setSubmitError(error);
    }
  });

  const removeUnavailable = () => {
    const remove = useCartStore.getState().remove;
    unavailable.forEach((line) => remove(line.productId));
    setSubmitError(null);
  };

  return {
    form,
    lines,
    cartPending,
    zones,
    zone,
    totals,
    unavailable,
    removeUnavailable,
    submit,
    isSubmitting: placeOrder.isPending,
    submitError,
    placed,
  };
}
