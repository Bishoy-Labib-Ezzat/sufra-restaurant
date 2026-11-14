import { Link } from 'react-router';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { t } from '@/shared/i18n';
import { buttonStyles } from '@/shared/ui/button-styles';

export function NotFoundPage({ homeHref = '/', homeLabel = t.pages.notFound.home }: { homeHref?: string; homeLabel?: string }) {
  useDocumentTitle(t.pages.notFound.title);
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-start gap-6 px-4 py-24 sm:px-6">
      <p className="font-mono text-sm text-muted">{t.pages.notFound.code}</p>
      <h1 className="display text-[clamp(3.5rem,9vw,6.5rem)] leading-[1.15]">{t.pages.notFound.heading}</h1>
      <p className="max-w-[46ch] text-lg text-ink-soft">{t.pages.notFound.body}</p>
      <div className="flex flex-wrap gap-3">
        <Link to={homeHref} className={buttonStyles({ variant: 'ink' })}>
          {homeLabel}
        </Link>
        {homeHref === '/' && (
          <Link to="/menu" className={buttonStyles({ variant: 'secondary' })}>
            {t.pages.notFound.menu}
          </Link>
        )}
      </div>
    </div>
  );
}
