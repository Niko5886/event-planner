import {
  AuthError,
  MAX_EMAIL_LENGTH,
  MAX_NAME_LENGTH,
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  registerUser,
} from "@/services/userService";
import { signToken } from "@/lib/jwt";
import { badRequest, conflict, jsonOk } from "@/lib/apiResponse";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Request body must be valid JSON.");
  }

  const { name, email, password } = (body ?? {}) as {
    name?: unknown;
    email?: unknown;
    password?: unknown;
  };

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    return badRequest("Fields 'name', 'email' and 'password' are required.");
  }
  if (!name.trim() || !email.trim() || !password) {
    return badRequest("All fields are required.");
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return badRequest(
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      "weak_password"
    );
  }
  if (
    name.length > MAX_NAME_LENGTH ||
    email.length > MAX_EMAIL_LENGTH ||
    password.length > MAX_PASSWORD_LENGTH
  ) {
    return badRequest("One of the fields is too long.", "input_too_long");
  }

  let user;
  try {
    user = await registerUser({ name, email, password });
  } catch (err) {
    if (err instanceof AuthError) {
      if (err.code === "email_taken") {
        return conflict("Email is already registered.", "email_taken");
      }
      if (err.code === "weak_password") {
        return badRequest("Password is too weak.", "weak_password");
      }
      if (err.code === "input_too_long" || err.code === "input_too_short") {
        return badRequest("Invalid input.", err.code);
      }
    }
    throw err;
  }

  const token = signToken({
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  return jsonOk(
    {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
    { status: 201 }
  );
}
