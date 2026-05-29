import { jwtDecode } from "jwt-decode";

const TOKEN_KEY = "token";
const COOKIE_NAME = "token";

interface JwtPayload {
  userId: string;
  role: string;
  exp: number;
  iat?: number;
}

export interface DecodedToken {
  id: string;
  role: string;
  exp: number;
}

function setAuthCookie(token: string): void {
  const maxAge = 7 * 24 * 60 * 60;
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function clearAuthCookie(): void {
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}

export function saveToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  setAuthCookie(token);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function removeToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  clearAuthCookie();
}

export function decodeToken(token: string): DecodedToken | null {
  try {
    const payload = jwtDecode<JwtPayload>(token);
    return {
      id: payload.userId,
      role: payload.role,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}

export function isLoggedIn(): boolean {
  const token = getToken();
  if (!token) return false;

  const decoded = decodeToken(token);
  if (!decoded) return false;

  return decoded.exp * 1000 > Date.now();
}
