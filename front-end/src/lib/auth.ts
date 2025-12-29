export type UserRole = "ADMIN" | "BIBLIOTHECAIRE" | "LECTEUR";

export type UserProfile = {
  username: string;
  role: UserRole;
};

const ACCESS_TOKEN_KEY = "bibli_access_token";
const REFRESH_TOKEN_KEY = "bibli_refresh_token";
const USER_KEY = "bibli_user";

const safeStorage = {
  getItem(key: string) {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(key);
  },
  setItem(key: string, value: string) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, value);
  },
  removeItem(key: string) {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(key);
  },
};

export const getAccessToken = () => safeStorage.getItem(ACCESS_TOKEN_KEY);
export const getRefreshToken = () => safeStorage.getItem(REFRESH_TOKEN_KEY);

export const setTokens = (access: string, refresh?: string) => {
  safeStorage.setItem(ACCESS_TOKEN_KEY, access);
  if (refresh) safeStorage.setItem(REFRESH_TOKEN_KEY, refresh);
};

export const clearTokens = () => {
  safeStorage.removeItem(ACCESS_TOKEN_KEY);
  safeStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const storeUser = (user: UserProfile) => {
  safeStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getStoredUser = (): UserProfile | null => {
  const raw = safeStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
};

export const clearUser = () => safeStorage.removeItem(USER_KEY);

export const clearAuth = () => {
  clearTokens();
  clearUser();
};
