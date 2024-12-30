import Logo from "@/components/Logo";
import { UserButton } from "@clerk/nextjs";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="bg-neutral-100 min-h-screen">
      <div className="w-full max-w-6xl mx-auto p-4">
        <nav className="h-[73px] flex items-center justify-between">
          <Logo />

          <UserButton signInUrl="/auth/sign-in" />
        </nav>

        <div className="flex flex-col justify-center items-center py-4">
          {children}
        </div>
      </div>
    </main>
  );
}
