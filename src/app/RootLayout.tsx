import { Outlet, ScrollRestoration, type Location } from 'react-router';

/**
 * Every full page load gets the history key "default", so keying by it alone would make unrelated
 * URLs share one saved scroll position. Fresh loads are keyed by URL instead.
 */
const scrollKey = (location: Location) =>
  location.key === 'default' ? `${location.pathname}${location.search}` : location.key;

export function RootLayout() {
  return (
    <>
      <ScrollRestoration getKey={scrollKey} />
      <Outlet />
    </>
  );
}
