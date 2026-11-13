import { lazy, type ComponentType } from 'react';

/** React.lazy for modules with named exports. */
export function lazyNamed<M extends Record<string, unknown>, K extends keyof M>(loader: () => Promise<M>, name: K) {
  return lazy(async () => ({ default: (await loader())[name] as ComponentType }));
}
