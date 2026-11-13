const KEY = 'sufra.staff-session';

interface StoredToken {
  token: string;
  expiresAt: string;
}

function readFrom(storage: Storage): StoredToken | null {
  try {
    const raw = storage.getItem(KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as StoredToken;
    if (new Date(value.expiresAt).getTime() <= Date.now()) {
      storage.removeItem(KEY);
      return null;
    }
    return value;
  } catch {
    return null;
  }
}

/**
 * "Keep me signed in" stores the token in localStorage; otherwise it lives in sessionStorage
 * and disappears with the tab.
 */
export const tokenStorage = {
  get(): string | null {
    return (readFrom(sessionStorage) ?? readFrom(localStorage))?.token ?? null;
  },
  set(value: StoredToken, remember: boolean) {
    this.clear();
    (remember ? localStorage : sessionStorage).setItem(KEY, JSON.stringify(value));
  },
  clear() {
    localStorage.removeItem(KEY);
    sessionStorage.removeItem(KEY);
  },
};
