import { isRouteErrorResponse, useRouteError } from 'react-router';
import { Button } from '@/shared/ui/Button';
import { NotFoundPage } from './NotFoundPage';

/** Last line of defence for errors thrown while rendering a route. */
export function RouteErrorPage() {
  const error = useRouteError();
  if (isRouteErrorResponse(error) && error.status === 404) return <NotFoundPage />;
  if (import.meta.env.DEV) console.error(error);

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col items-start justify-center gap-6 px-4 sm:px-6">
      <h1 className="display text-6xl">Something broke on this page.</h1>
      <p className="max-w-[46ch] text-lg text-ink-soft">
        Reloading usually fixes it. If it keeps happening, the team has a bug to look at.
      </p>
      <Button variant="ink" onClick={() => window.location.reload()}>
        Reload the page
      </Button>
    </div>
  );
}
