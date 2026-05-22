"use server";

import { redirect } from "next/navigation";
import {
  AuthError,
  MAX_EMAIL_LENGTH,
  MAX_NAME_LENGTH,
  MAX_PASSWORD_LENGTH,
  loginUser,
  registerUser,
} from "@/services/userService";
import { clearAuthCookie, setAuthCookie } from "@/lib/auth";

export type AuthFormState = {
  error: string | null;
};

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Моля попълни имейл и парола." };
  }
  if (email.length > MAX_EMAIL_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
    return { error: "Имейлът или паролата са твърде дълги." };
  }

  let user;
  try {
    user = await loginUser({ email, password });
  } catch (err) {
    if (err instanceof AuthError && err.code === "invalid_credentials") {
      return { error: "Грешен имейл или парола." };
    }
    throw err;
  }

  await setAuthCookie({
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
  redirect("/dashboard");
}

export async function registerAction(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!name || !email || !password) {
    return { error: "Моля попълни всички задължителни полета." };
  }
  if (password !== confirmPassword) {
    return { error: "Паролите не съвпадат." };
  }
  if (password.length < 6) {
    return { error: "Паролата трябва да е поне 6 символа." };
  }
  if (
    name.length > MAX_NAME_LENGTH ||
    email.length > MAX_EMAIL_LENGTH ||
    password.length > MAX_PASSWORD_LENGTH
  ) {
    return { error: "Едно от полетата е твърде дълго." };
  }

  let user;
  try {
    user = await registerUser({ name, email, password });
  } catch (err) {
    if (err instanceof AuthError) {
      if (err.code === "email_taken") {
        return { error: "Имейлът вече е регистриран." };
      }
      if (err.code === "weak_password") {
        return { error: "Паролата трябва да е поне 6 символа." };
      }
      if (err.code === "input_too_long") {
        return { error: "Едно от полетата е твърде дълго." };
      }
      if (err.code === "input_too_short") {
        return { error: "Едно от полетата е твърде късо." };
      }
    }
    throw err;
  }

  await setAuthCookie({
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  await clearAuthCookie();
  redirect("/");
}
