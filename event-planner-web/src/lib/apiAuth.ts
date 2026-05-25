import { verifyToken, type JwtPayload } from "./jwt";
import { getUserById } from "@/services/userService";

export type ApiUser = JwtPayload;

export function getBearerToken(req: Request): string | null {
  const header =
    req.headers.get("authorization") || req.headers.get("Authorization");
  if (!header) return null;
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  if (!match) return null;
  const token = match[1].trim();
  return token || null;
}

export async function authenticateRequest(req: Request): Promise<ApiUser | null> {
  const token = getBearerToken(req);
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
