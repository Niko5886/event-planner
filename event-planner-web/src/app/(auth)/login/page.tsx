import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "Sign In · Event Planner",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;
  return <LoginForm redirectTo={redirect ?? null} />;
}
