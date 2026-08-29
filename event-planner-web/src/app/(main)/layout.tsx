import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getCurrentUser } from "@/lib/auth";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
      >
        Skip to content
      </a>
      <Header
        user={{ name: user.name, email: user.email, role: user.role }}
      />
      <main id="main-content" className="flex-1 scroll-mt-20">
        {children}
      </main>
      <Footer />
    </>
  );
}
