import { APP_STATE_VERSION } from "@/lib/constants";

const PREFIX = "activamente";

const inBrowser = () => typeof window !== "undefined";

const keyWithPrefix = (key: string) => `${PREFIX}:${APP_STATE_VERSION}:${key}`;

export const storage = {
  get<T>(key: string, fallback: T): T {
    if (!inBrowser()) return fallback;
    try {
      const raw = window.sessionStorage.getItem(keyWithPrefix(key));
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set<T>(key: string, value: T): void {
    if (!inBrowser()) return;
    try {
      window.sessionStorage.setItem(keyWithPrefix(key), JSON.stringify(value));
    } catch {
      // Ignored to avoid app crash when storage is unavailable.
    }
  },
  update<T>(key: string, fallback: T, fn: (current: T) => T): T {
    const current = this.get<T>(key, fallback);
    const next = fn(current);
    this.set(key, next);
    return next;
  },
  remove(key: string): void {
    if (!inBrowser()) return;
    try {
      window.sessionStorage.removeItem(keyWithPrefix(key));
    } catch {
      // no-op
    }
  },
};
