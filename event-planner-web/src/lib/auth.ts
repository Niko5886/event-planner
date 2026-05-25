import { cookies } from "next/headers";
import { signToken, verifyToken, type JwtPayload } from "./jwt";

export const AUTH_COOKIE_NAME = "auth_token";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export async function setAuthCookie(payload: JwtPayload): Promise<void> {
  const token = signToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

export async function getCurrentUser(): Promise<JwtPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}
