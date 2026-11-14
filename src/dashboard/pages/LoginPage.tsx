import { lazy, Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router';
import { ArrowRight, Eye, EyeSlash, WarningCircle } from '@phosphor-icons/react';
import { z } from 'zod';
import { apiConfig } from '@/shared/api/config';
import { getErrorMessage } from '@/shared/api/errors';
import { useAuth } from '@/shared/auth/auth-context';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { t } from '@/shared/i18n';
import { photo } from '@/shared/lib/image';
import { Button } from '@/shared/ui/Button';
import { Checkbox, Field, Input } from '@/shared/ui/form';
import { Logo } from '@/shared/ui/Logo';
import { InlineNotice } from '@/shared/ui/states';

const schema = z.object({
  email: z.email(t.validation.emailInvalid),
  password: z.string().min(1, t.validation.passwordRequired),
  remember: z.boolean(),
});
type LoginValues = z.infer<typeof schema>;

// Loaded only in demo mode, so a production build never ships the demo credentials.
const DemoAccounts = lazy(() => import('../components/DemoAccounts').then((module) => ({ default: module.DemoAccounts })));

const GRILL = 'https://images.unsplash.com/photo-1558030006-450675393462';

/** Only allow redirects back into the dashboard after sign-in. */
function safeNext(next: string | null) {
  return next && next.startsWith('/dashboard') && !next.startsWith('//') ? next : '/dashboard';
}

export function LoginPage() {
  useDocumentTitle(t.dashboard.login.title);
  const { status, login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'));
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', remember: true },
  });

  if (status === 'authenticated') return <Navigate to={next} replace />;

  const onSubmit = handleSubmit(async ({ email, password, remember }) => {
    setError(null);
    try {
      await login({ email, password }, { remember });
      navigate(next, { replace: true });
    } catch (loginError) {
      setError(loginError);
    }
  });

  return (
    <div className="grid grid-cols-1 min-h-dvh bg-paper lg:grid-cols-[1.1fr_1fr]">
      <div className="relative hidden overflow-hidden bg-ink lg:block">
        <img src={photo(GRILL, 1400, 1800)} alt="" className="absolute inset-0 size-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-linear-to-t from-ink via-ink/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-12 text-paper">
          <Logo tone="paper" />
          <p className="display max-w-md text-6xl leading-[1.2]">{t.dashboard.login.tagline}</p>
          <p className="max-w-sm text-lg text-paper/75">{t.dashboard.login.taglineBody}</p>
        </div>
      </div>

      <div className="flex flex-col px-5 py-8 sm:px-10">
        <Link to="/" className="inline-flex items-center gap-2 self-start text-sm font-semibold text-ink-soft hover:text-ink">
          <ArrowRight size={16} weight="bold" aria-hidden />
          {t.dashboard.login.backToShop}
        </Link>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-8 py-10">
          <div className="flex flex-col gap-2">
            <Logo className="mb-4 lg:hidden" />
            <h1 className="display text-5xl leading-[1.2] sm:text-6xl">{t.dashboard.login.heading}</h1>
            <p className="text-[15px] text-muted">{t.dashboard.login.subheading}</p>
          </div>

          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
            {error !== null && (
              <InlineNotice tone="danger" icon={WarningCircle}>
                {getErrorMessage(error)}
              </InlineNotice>
            )}
            <Field label={t.dashboard.login.email} error={errors.email?.message}>
              {({ id, describedBy, invalid }) => (
                <Input id={id} type="email" dir="ltr" className="text-end" autoComplete="username" aria-describedby={describedBy} aria-invalid={invalid} {...register('email')} />
              )}
            </Field>
            <Field label={t.dashboard.login.password} error={errors.password?.message}>
              {({ id, describedBy, invalid }) => (
                <div className="relative">
                  <Input
                    id={id}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    dir="ltr"
                    className="ps-12 text-end"
                    aria-describedby={describedBy}
                    aria-invalid={invalid}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? t.dashboard.login.hidePassword : t.dashboard.login.showPassword}
                    aria-pressed={showPassword}
                    className="absolute top-1/2 end-2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-ink/6 hover:text-ink"
                  >
                    {showPassword ? <EyeSlash size={18} weight="bold" /> : <Eye size={18} weight="bold" />}
                  </button>
                </div>
              )}
            </Field>
            <Checkbox label={t.dashboard.login.remember} {...register('remember')} />
            <Button type="submit" variant="ink" size="lg" block loading={isSubmitting || status === 'checking'}>
              {t.dashboard.login.submit}
            </Button>
          </form>

          {apiConfig.useMocks && (
            <Suspense fallback={null}>
              <DemoAccounts
                onPick={(email, password) => {
                  setValue('email', email, { shouldValidate: true });
                  setValue('password', password, { shouldValidate: true });
                }}
              />
            </Suspense>
          )}
        </div>
      </div>
    </div>
  );
}
