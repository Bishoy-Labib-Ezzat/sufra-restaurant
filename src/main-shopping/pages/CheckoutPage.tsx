import { Link } from 'react-router';
import { ArrowLeft, ForkKnife, MapPin, WarningCircle } from '@phosphor-icons/react';
import { getErrorMessage, isApiError } from '@/shared/api/errors';
import { restaurant } from '@/shared/config/restaurant';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
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
      <h2 className="font-display text-2xl font-bold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}

export function CheckoutPage() {
  useDocumentTitle('Checkout');
  const { form, lines, zones, zone, totals, unavailable, removeUnavailable, submit, isSubmitting, submitError, placed } =
    useCheckout();
  const {
    register,
    watch,
    formState: { errors },
  } = form;
  const fulfillment = watch('fulfillment');
  const notesLength = watch('notes').length;

  // Avoid flashing the empty state between clearing the cart and leaving the page.
  if (placed) return <div className="min-h-[60vh]" />;

  if (!lines.length) {
    return (
      <EmptyState
        className="py-28"
        icon={ForkKnife}
        title="Your order is empty"
        description="Pick a few things from the menu first, then come back here to check out."
        action={
          <Link to="/menu" className={buttonStyles({ variant: 'ink' })}>
            Browse the menu
          </Link>
        }
      />
    );
  }

  const serverMessage =
    submitError && !(isApiError(submitError) && Object.keys(submitError.fieldErrors).length)
      ? getErrorMessage(submitError, 'We could not place your order. Please try again.')
      : null;

  return (
    <div className="mx-auto max-w-7xl px-4 pt-4 pb-24 sm:px-6 sm:pt-8 lg:px-8 lg:pt-12 lg:pb-0">
      <Link to="/menu" className="inline-flex min-h-11 items-center gap-2 text-[15px] font-semibold text-ink-soft hover:text-ink">
        <ArrowLeft size={16} weight="bold" aria-hidden />
        Keep browsing
      </Link>
      <h1 className="display mt-2 text-[clamp(3.25rem,9vw,6.5rem)] leading-[0.88] sm:mt-4">Checkout</h1>

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
                  Remove {unavailable.length === 1 ? 'it' : 'them'}
                </Button>
              }
            >
              {unavailable.map((line) => line.name).join(', ')} sold out since you added {unavailable.length === 1 ? 'it' : 'them'}.
            </InlineNotice>
          )}

          <FormSection title="How should we get it to you?">
            <FulfillmentPicker value={fulfillment} registration={register('fulfillment')} />
          </FormSection>

          <FormSection title="Your details">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Full name" error={errors.name?.message}>
                {({ id, describedBy, invalid }) => (
                  <Input id={id} autoComplete="name" aria-describedby={describedBy} aria-invalid={invalid} {...register('name')} />
                )}
              </Field>
              <Field label="Mobile number" hint="We call this number to confirm." error={errors.phone?.message}>
                {({ id, describedBy, invalid }) => (
                  <Input
                    id={id}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="0100 123 4567"
                    aria-describedby={describedBy}
                    aria-invalid={invalid}
                    {...register('phone')}
                  />
                )}
              </Field>
            </div>
          </FormSection>

          {fulfillment === 'delivery' ? (
            <FormSection title="Where to?">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="Area" error={errors.zoneId?.message} hint={zone ? `Usually arrives in about ${zone.etaMinutes} minutes.` : undefined}>
                  {({ id, describedBy, invalid }) => (
                    <Select
                      id={id}
                      aria-describedby={describedBy}
                      aria-invalid={invalid}
                      disabled={zones.isPending}
                      {...register('zoneId')}
                    >
                      <option value="">{zones.isPending ? 'Loading areas' : 'Choose your area'}</option>
                      {zones.data?.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}, delivery EGP {item.fee}
                        </option>
                      ))}
                    </Select>
                  )}
                </Field>
                <Field label="Street and building number" error={errors.street?.message}>
                  {({ id, describedBy, invalid }) => (
                    <Input
                      id={id}
                      autoComplete="address-line1"
                      placeholder="14 Hassan Sabry Street"
                      aria-describedby={describedBy}
                      aria-invalid={invalid}
                      {...register('street')}
                    />
                  )}
                </Field>
                <Field label="Floor and apartment" aside="Optional" error={errors.details?.message}>
                  {({ id, describedBy, invalid }) => (
                    <Input id={id} autoComplete="address-line2" aria-describedby={describedBy} aria-invalid={invalid} {...register('details')} />
                  )}
                </Field>
                <Field label="Landmark" aside="Optional" error={errors.landmark?.message}>
                  {({ id, describedBy, invalid }) => (
                    <Input id={id} placeholder="Next to the pharmacy" aria-describedby={describedBy} aria-invalid={invalid} {...register('landmark')} />
                  )}
                </Field>
              </div>
              {zones.error && (
                <InlineNotice tone="danger" action={<Button size="sm" variant="secondary" onClick={() => zones.refetch()}>Retry</Button>}>
                  {getErrorMessage(zones.error)}
                </InlineNotice>
              )}
            </FormSection>
          ) : (
            <FormSection title="Pick it up from">
              <div className="flex items-start gap-4 rounded-panel bg-surface p-5 ring-1 ring-line">
                <MapPin size={22} weight="bold" className="mt-0.5 shrink-0 text-tomato-deep" aria-hidden />
                <div className="flex flex-col gap-1 text-[15px]">
                  <p className="font-semibold">{restaurant.address}</p>
                  <p className="text-muted">Say your order number at the counter.</p>
                </div>
              </div>
            </FormSection>
          )}

          <FormSection title="Anything the kitchen should know?">
            <Field
              label="Notes"
              aside={`${notesLength}/${NOTES_LIMIT}`}
              hint="Allergies, no onions, extra sauce, where to ring."
              error={errors.notes?.message}
            >
              {({ id, describedBy, invalid }) => (
                <Textarea id={id} maxLength={NOTES_LIMIT} aria-describedby={describedBy} aria-invalid={invalid} {...register('notes')} />
              )}
            </Field>
            <Checkbox label="Remember my details on this device" {...register('saveDetails')} />
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
