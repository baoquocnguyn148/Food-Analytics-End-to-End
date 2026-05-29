import type { User } from "./types";

// localStorage-backed token store. Guards against SSR (no window).

const ACCESS = "fa_access";
const REFRESH = "fa_refresh";
const USER = "fa_user";

const isBrowser = () => typeof window !== "undefined";

export const tokenStore = {
  getAccess(): string | null {
    return isBrowser() ? localStorage.getItem(ACCESS) : null;
  },
  getRefresh(): string | null {
    return isBrowser() ? localStorage.getItem(REFRESH) : null;
  },
  getUser(): User | null {
    if (!isBrowser()) return null;
    const raw = localStorage.getItem(USER);
    try {
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  },
  setTokens(access: string, refresh: string) {
    if (!isBrowser()) return;
    localStorage.setItem(ACCESS, access);
    localStorage.setItem(REFRESH, refresh);
  },
  setUser(user: User) {
    if (!isBrowser()) return;
    localStorage.setItem(USER, JSON.stringify(user));
  },
  clear() {
    if (!isBrowser()) return;
    localStorage.removeItem(ACCESS);
    localStorage.removeItem(REFRESH);
    localStorage.removeItem(USER);
  },
};
