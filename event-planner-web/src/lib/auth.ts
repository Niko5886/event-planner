import { cookies } from "next/headers";
import { signToken, verifyToken, type JwtPayload } from "./jwt";
import { AUTH_COOKIE_NAME } from "./authConstants";
import { getUserById } from "@/services/userService";

export { AUTH_COOKIE_NAME };

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
  const payload = verifyToken(token);
  if (!payload) return null;

  const dbUser = await getUserById(payload.userId);
  if (!dbUser || dbUser.email !== payload.email) {
    return null;
  }

  return {
    userId: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    role: dbUser.role,
  };
}
