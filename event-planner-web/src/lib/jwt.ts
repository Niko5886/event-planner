import jwt from "jsonwebtoken";

const JWT_EXPIRES_IN = "7d";

/**
 * Read the JWT secret at call time (not at module load) so that importing this
 * module during `next build` — when JWT_SECRET may be absent — does not throw
 * and crash the build. The secret is only required when actually signing or
 * verifying a token at request time.
 */
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }
  return secret;
}

export type JwtPayload = {
  userId: number;
  name: string;
  email: string;
  role: "user" | "admin";
};

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload;
    return {
      userId: decoded.userId,
      name: decoded.name ?? decoded.email,
      email: decoded.email,
      role: decoded.role,
    };
  } catch {
    return null;
  }
}
