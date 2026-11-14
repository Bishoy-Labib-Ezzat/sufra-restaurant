import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router';
import { ArrowLeft } from '@phosphor-icons/react';
import { z } from 'zod';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { t, toWesternDigits } from '@/shared/i18n';
import { formatOrderCode } from '@/shared/lib/order-status';
import { Button } from '@/shared/ui/Button';
import { Field, Input } from '@/shared/ui/form';
import { useRecentOrders } from '../store/shop-ui.store';

const schema = z.object({
  code: z
    .string()
    .trim()
    // People may type the number with Arabic digits (١٠٤٢) or with the SF- prefix (SF-1042).
    .transform((value) => toWesternDigits(value).toUpperCase().replace(/\s+/g, ''))
    .transform((value) => (/^\d+$/.test(value) ? `SF-${value}` : value.replace(/^SF(?=\d)/, 'SF-')))
    .refine((value) => /^SF-\d{4,}$/.test(value), t.validation.orderCode),
});

type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

export function TrackOrderPage() {
  useDocumentTitle(t.shop.track.title);
  const navigate = useNavigate();
  const recent = useRecentOrders((state) => state.codes);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInput, unknown, FormOutput>({ resolver: zodResolver(schema), defaultValues: { code: '' } });

  return (
    <div className="mx-auto grid grid-cols-1 max-w-7xl gap-14 px-4 pt-12 sm:px-6 lg:grid-cols-2 lg:px-8 lg:pt-20">
      <div className="flex flex-col gap-4">
        <h1 className="display text-[clamp(3.5rem,8vw,6rem)] leading-[1.15]">{t.shop.track.heading}</h1>
        <p className="max-w-[44ch] text-lg text-ink-soft">
          {t.shop.track.body}
        </p>
      </div>

      <div className="flex flex-col gap-10">
        <form onSubmit={handleSubmit(({ code }) => navigate(`/order/${code}`))} noValidate className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <Field label={t.shop.track.label} error={errors.code?.message} className="flex-1">
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                placeholder={t.shop.track.placeholder}
                inputMode="numeric"
                className="font-mono"
                aria-describedby={describedBy}
                aria-invalid={invalid}
                {...register('code')}
              />
            )}
          </Field>
          <Button type="submit" variant="ink" size="md" className="h-12 sm:mt-7" icon={ArrowLeft}>
            {t.shop.track.submit}
          </Button>
        </form>

        {recent.length > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="font-display text-2xl">{t.shop.track.recent}</h2>
            <ul className="flex flex-wrap gap-2">
              {recent.map((code) => (
                <li key={code}>
                  <Link
                    to={`/order/${code}`}
                    className="inline-flex h-10 items-center rounded-full bg-surface px-4 font-mono text-sm font-semibold ring-1 ring-line ring-inset hover:ring-ink"
                  >
                    {formatOrderCode(code)}
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
