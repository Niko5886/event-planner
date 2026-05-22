import bcrypt from "bcryptjs";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

const BCRYPT_ROUNDS = 10;

export const MAX_NAME_LENGTH = 120;
export const MAX_EMAIL_LENGTH = 254;
export const MAX_PASSWORD_LENGTH = 200;
export const MIN_PASSWORD_LENGTH = 6;

export type AuthenticatedUser = {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
  photoUrl: string | null;
};

export type AuthErrorCode =
  | "invalid_credentials"
  | "email_taken"
  | "weak_password"
  | "input_too_long"
  | "input_too_short";

export class AuthError extends Error {
  constructor(public code: AuthErrorCode) {
    super(code);
    this.name = "AuthError";
  }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthenticatedUser> {
  const name = input.name.trim();
  const email = normalizeEmail(input.email);
  const password = input.password;

  if (name.length < 2 || password.length < MIN_PASSWORD_LENGTH) {
    throw new AuthError(
      password.length < MIN_PASSWORD_LENGTH ? "weak_password" : "input_too_short"
    );
  }
  if (
    name.length > MAX_NAME_LENGTH ||
    email.length > MAX_EMAIL_LENGTH ||
    password.length > MAX_PASSWORD_LENGTH
  ) {
    throw new AuthError("input_too_long");
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  try {
    const [created] = await db
      .insert(users)
      .values({ name, email, passwordHash, role: "user" })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        photoUrl: users.photoUrl,
      });

    return created;
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw new AuthError("email_taken");
    }
    throw err;
  }
}

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: unknown }).code === "23505"
  );
}

export async function loginUser(input: {
  email: string;
  password: string;
}): Promise<AuthenticatedUser> {
  const email = normalizeEmail(input.email);

  if (email.length > MAX_EMAIL_LENGTH || input.password.length > MAX_PASSWORD_LENGTH) {
    throw new AuthError("invalid_credentials");
  }

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      photoUrl: users.photoUrl,
      passwordHash: users.passwordHash,
    })
    .from(users)
    .where(sql`lower(${users.email}) = ${email}`)
    .limit(1);

  if (!user) {
    throw new AuthError("invalid_credentials");
  }

  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) {
    throw new AuthError("invalid_credentials");
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    photoUrl: user.photoUrl,
  };
}

export async function getUserById(id: number): Promise<AuthenticatedUser | null> {
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      photoUrl: users.photoUrl,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return user ?? null;
}
