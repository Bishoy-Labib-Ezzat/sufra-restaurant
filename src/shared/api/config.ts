const env = import.meta.env;

export const apiConfig = {
  baseUrl: (env.VITE_API_BASE_URL ?? '/api').replace(/\/$/, ''),
  /** Mocks stay on until the env explicitly opts out, so the app runs with no backend. */
  useMocks: env.VITE_USE_MOCKS !== 'false',
  timeoutMs: 15_000,
} as const;
