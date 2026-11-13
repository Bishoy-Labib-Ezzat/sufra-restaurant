import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router';
import { ArrowRight } from '@phosphor-icons/react';
import { z } from 'zod';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { Button } from '@/shared/ui/Button';
import { Field, Input } from '@/shared/ui/form';
import { useRecentOrders } from '../store/shop-ui.store';

const schema = z.object({
  code: z
    .string()
    .trim()
    .transform((value) => value.toUpperCase().replace(/\s+/g, ''))
    .transform((value) => (/^\d+$/.test(value) ? `SF-${value}` : value.replace(/^SF(?=\d)/, 'SF-')))
    .refine((value) => /^SF-\d{4,}$/.test(value), 'Order numbers look like SF-1042.'),
});

type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

export function TrackOrderPage() {
  useDocumentTitle('Track an order');
  const navigate = useNavigate();
  const recent = useRecentOrders((state) => state.codes);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInput, unknown, FormOutput>({ resolver: zodResolver(schema), defaultValues: { code: '' } });

  return (
    <div className="mx-auto grid max-w-7xl gap-14 px-4 pt-12 sm:px-6 lg:grid-cols-2 lg:px-8 lg:pt-20">
      <div className="flex flex-col gap-4">
        <h1 className="display text-[clamp(3.5rem,8vw,6rem)] leading-[0.9]">Where is my food?</h1>
        <p className="max-w-[44ch] text-lg text-ink-soft">
          Enter the order number from your confirmation. The status updates on its own while the page is open.
        </p>
      </div>

      <div className="flex flex-col gap-10">
        <form onSubmit={handleSubmit(({ code }) => navigate(`/order/${code}`))} noValidate className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <Field label="Order number" error={errors.code?.message} className="flex-1">
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                placeholder="SF-1042"
                autoCapitalize="characters"
                className="font-mono uppercase"
                aria-describedby={describedBy}
                aria-invalid={invalid}
                {...register('code')}
              />
            )}
          </Field>
          <Button type="submit" variant="ink" size="md" className="h-12 sm:mt-7" icon={ArrowRight}>
            Track
          </Button>
        </form>

        {recent.length > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-bold">Ordered from this device</h2>
            <ul className="flex flex-wrap gap-2">
              {recent.map((code) => (
                <li key={code}>
                  <Link
                    to={`/order/${code}`}
                    className="inline-flex h-10 items-center rounded-full bg-surface px-4 font-mono text-sm font-semibold ring-1 ring-line ring-inset hover:ring-ink"
                  >
                    {code}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
