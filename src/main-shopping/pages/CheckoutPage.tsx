import { Link } from 'react-router';
import { ArrowRight, ForkKnife, MapPin, WarningCircle } from '@phosphor-icons/react';
import { getErrorMessage, isApiError } from '@/shared/api/errors';
import { restaurant } from '@/shared/config/restaurant';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { fill, plural, t } from '@/shared/i18n';
import { formatMoney } from '@/shared/lib/format';
import { formatPhone } from '@/shared/lib/phone';
import { Button } from '@/shared/ui/Button';
import { buttonStyles } from '@/shared/ui/button-styles';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Checkbox, Field, Input, Select, Textarea } from '@/shared/ui/form';
import { InlineNotice } from '@/shared/ui/states';
import { FulfillmentPicker } from '../components/checkout/FulfillmentPicker';
import { MobileCheckoutBar } from '../components/checkout/MobileCheckoutBar';
import { OrderSummary } from '../components/checkout/OrderSummary';
import { useCheckout } from '../hooks/useCheckout';
import { NOTES_LIMIT } from '../lib/checkout';

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-5">
      <h2 className="font-display text-3xl">{title}</h2>
      {children}
    </section>
  );
}

export function CheckoutPage() {
  useDocumentTitle(t.shop.checkout.title);
  const {
    form,
    lines,
    cartPending,
    zones,
    zone,
    totals,
    unavailable,
    removeUnavailable,
    submit,
    isSubmitting,
    submitError,
    placed,
  } = useCheckout();
  const {
    register,
    watch,
    formState: { errors },
  } = form;
  const fulfillment = watch('fulfillment');
  const notesLength = watch('notes').length;

  // Avoid flashing the empty state between clearing the cart and leaving the page, and while a
  // saved cart is still waiting for the menu to fill in its names and prices.
  if (placed || cartPending) return <div className="min-h-[60vh]" />;

  if (!lines.length) {
    return (
      <EmptyState
        className="py-28"
        icon={ForkKnife}
        title={t.shop.checkout.emptyTitle}
        description={t.shop.checkout.emptyBody}
        action={
          <Link to="/menu" className={buttonStyles({ variant: 'ink' })}>
            {t.shop.checkout.browse}
          </Link>
        }
      />
    );
  }

  const serverMessage =
    submitError && !(isApiError(submitError) && Object.keys(submitError.fieldErrors).length)
      ? getErrorMessage(submitError, t.shop.checkout.submitError)
      : null;

  return (
    <div className="mx-auto max-w-7xl px-4 pt-4 pb-24 sm:px-6 sm:pt-8 lg:px-8 lg:pt-12 lg:pb-0">
      <Link to="/menu" className="inline-flex min-h-11 items-center gap-2 text-[15px] font-semibold text-ink-soft hover:text-ink">
        <ArrowRight size={16} weight="bold" aria-hidden />
        {t.shop.checkout.keepBrowsing}
      </Link>
      <h1 className="display mt-2 text-[clamp(3.25rem,9vw,6.5rem)] leading-[1.15] sm:mt-4">{t.shop.checkout.title}</h1>

      <form onSubmit={submit} noValidate className="mt-8 grid grid-cols-1 gap-10 sm:mt-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-16">
        <MobileCheckoutBar
          total={totals.total}
          feePending={fulfillment === 'delivery' && !zone}
          submitting={isSubmitting}
        />
        <div className="flex flex-col gap-10 sm:gap-12">
          {unavailable.length > 0 && (
            <InlineNotice
              tone="warning"
              icon={WarningCircle}
              action={
                <Button size="sm" variant="ink" onClick={removeUnavailable}>
                  {unavailable.length === 1 ? t.shop.checkout.removeOne : t.shop.checkout.removeMany}
                </Button>
              }
            >
              {fill(unavailable.length === 1 ? t.shop.checkout.unavailableOne : t.shop.checkout.unavailableMany, {
                names: unavailable.map((line) => line.name).join('، '),
              })}
            </InlineNotice>
          )}

          <FormSection title={t.shop.checkout.howTitle}>
            <FulfillmentPicker value={fulfillment} registration={register('fulfillment')} />
          </FormSection>

          <FormSection title={t.shop.checkout.detailsTitle}>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label={t.shop.checkout.name} error={errors.name?.message}>
                {({ id, describedBy, invalid }) => (
                  <Input id={id} autoComplete="name" aria-describedby={describedBy} aria-invalid={invalid} {...register('name')} />
                )}
              </Field>
              <Field label={t.shop.checkout.phone} hint={t.shop.checkout.phoneHint} error={errors.phone?.message}>
                {({ id, describedBy, invalid }) => (
                  <Input
                    id={id}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    dir="ltr"
                    placeholder={formatPhone('01001234567')}
                    className="digits-ltr text-end"
                    aria-describedby={describedBy}
                    aria-invalid={invalid}
                    {...register('phone')}
                  />
                )}
              </Field>
            </div>
          </FormSection>

          {fulfillment === 'delivery' ? (
            <FormSection title={t.shop.checkout.whereTitle}>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field
                  label={t.shop.checkout.area}
                  error={errors.zoneId?.message}
                  hint={zone ? fill(t.shop.checkout.areaEta, { minutes: plural(t.plurals.minutes, zone.etaMinutes) }) : undefined}
                >
                  {({ id, describedBy, invalid }) => (
                    <Select
                      id={id}
                      aria-describedby={describedBy}
                      aria-invalid={invalid}
                      disabled={zones.isPending}
                      {...register('zoneId')}
                    >
                      <option value="">{zones.isPending ? t.shop.checkout.areasLoading : t.shop.checkout.chooseArea}</option>
                      {zones.data?.map((item) => (
                        <option key={item.id} value={item.id}>
                          {fill(t.shop.checkout.areaOption, { name: item.name, price: formatMoney(item.fee) })}
                        </option>
                      ))}
                    </Select>
                  )}
                </Field>
                <Field label={t.shop.checkout.street} error={errors.street?.message}>
                  {({ id, describedBy, invalid }) => (
                    <Input
                      id={id}
                      autoComplete="address-line1"
                      placeholder={t.shop.checkout.streetPlaceholder}
                      aria-describedby={describedBy}
                      aria-invalid={invalid}
                      {...register('street')}
                    />
                  )}
                </Field>
                <Field label={t.shop.checkout.details} aside={t.common.optional} error={errors.details?.message}>
                  {({ id, describedBy, invalid }) => (
                    <Input id={id} autoComplete="address-line2" aria-describedby={describedBy} aria-invalid={invalid} {...register('details')} />
                  )}
                </Field>
                <Field label={t.shop.checkout.landmark} aside={t.common.optional} error={errors.landmark?.message}>
                  {({ id, describedBy, invalid }) => (
                    <Input id={id} placeholder={t.shop.checkout.landmarkPlaceholder} aria-describedby={describedBy} aria-invalid={invalid} {...register('landmark')} />
                  )}
                </Field>
              </div>
              {zones.error && (
                <InlineNotice tone="danger" action={<Button size="sm" variant="secondary" onClick={() => zones.refetch()}>{t.common.retry}</Button>}>
                  {getErrorMessage(zones.error)}
                </InlineNotice>
              )}
            </FormSection>
          ) : (
            <FormSection title={t.shop.checkout.pickupTitle}>
              <div className="flex items-start gap-4 rounded-panel bg-surface p-5 ring-1 ring-line">
                <MapPin size={22} weight="bold" className="mt-0.5 shrink-0 text-tomato-deep" aria-hidden />
                <div className="flex flex-col gap-1 text-[15px]">
                  <p className="font-semibold">{restaurant.address}</p>
                  <p className="text-muted">{t.shop.checkout.pickupNote}</p>
                </div>
              </div>
            </FormSection>
          )}

          <FormSection title={t.shop.checkout.notesTitle}>
            <Field
              label={t.shop.checkout.notes}
              aside={fill(t.common.charCount, { count: notesLength, max: NOTES_LIMIT })}
              hint={t.shop.checkout.notesHint}
              error={errors.notes?.message}
            >
              {({ id, describedBy, invalid }) => (
                <Textarea id={id} maxLength={NOTES_LIMIT} aria-describedby={describedBy} aria-invalid={invalid} {...register('notes')} />
              )}
            </Field>
            <Checkbox label={t.shop.checkout.remember} {...register('saveDetails')} />
          </FormSection>

          {serverMessage && (
            <InlineNotice tone="danger" icon={WarningCircle}>
              {serverMessage}
            </InlineNotice>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <OrderSummary
            lines={lines}
            unavailableIds={new Set(unavailable.map((line) => line.productId))}
            totals={totals}
            fulfillment={fulfillment}
            zone={zone}
            submitting={isSubmitting}
          />
        </aside>
      </form>
    </div>
  );
}
