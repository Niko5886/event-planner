import { verifyToken, type JwtPayload } from "./jwt";

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

export function authenticateRequest(req: Request): ApiUser | null {
  const token = getBearerToken(req);
  if (!token) return null;
  return verifyToken(token);
}
