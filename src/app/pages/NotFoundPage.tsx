import { Link } from 'react-router';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { buttonStyles } from '@/shared/ui/button-styles';

export function NotFoundPage({ homeHref = '/', homeLabel = 'Go to the home page' }: { homeHref?: string; homeLabel?: string }) {
  useDocumentTitle('Page not found');
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-start gap-6 px-4 py-24 sm:px-6">
      <p className="font-mono text-sm text-muted">404</p>
      <h1 className="display text-[clamp(3.5rem,9vw,6.5rem)] leading-[0.9]">This page is off the menu.</h1>
      <p className="max-w-[46ch] text-lg text-ink-soft">The link may be old, or the address has a typo.</p>
      <div className="flex flex-wrap gap-3">
        <Link to={homeHref} className={buttonStyles({ variant: 'ink' })}>
          {homeLabel}
        </Link>
        {homeHref === '/' && (
          <Link to="/menu" className={buttonStyles({ variant: 'secondary' })}>
            See the menu
          </Link>
        )}
      </div>
    </div>
  );
}
