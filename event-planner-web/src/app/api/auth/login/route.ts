import {
  AuthError,
  MAX_EMAIL_LENGTH,
  MAX_PASSWORD_LENGTH,
  loginUser,
} from "@/services/userService";
import { signToken } from "@/lib/jwt";
import { badRequest, jsonError, jsonOk } from "@/lib/apiResponse";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Request body must be valid JSON.");
  }

  const { email, password } = (body ?? {}) as {
    email?: unknown;
    password?: unknown;
  };

  if (typeof email !== "string" || typeof password !== "string") {
    return badRequest("Fields 'email' and 'password' are required strings.");
  }
  if (
    !email.trim() ||
    !password ||
    email.length > MAX_EMAIL_LENGTH ||
    password.length > MAX_PASSWORD_LENGTH
  ) {
    return jsonError(
      401,
      "invalid_credentials",
      "Invalid email or password."
    );
  }

  let user;
  try {
    user = await loginUser({ email, password });
  } catch (err) {
    if (err instanceof AuthError && err.code === "invalid_credentials") {
      return jsonError(
        401,
        "invalid_credentials",
        "Invalid email or password."
      );
    }
    throw err;
  }

  const token = signToken({
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  return jsonOk({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}
