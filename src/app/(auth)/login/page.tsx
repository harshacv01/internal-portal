import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/40 p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1.5 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Internal Portal</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to see what the team has been sharing.
          </p>
        </div>

        <LoginForm redirectTo={safeRedirect(next)} />

        <p className="text-center text-xs text-muted-foreground">
          Demo accounts — <span className="font-mono">admin@example.com</span> ·{" "}
          <span className="font-mono">member@example.com</span>
          <br />
          Password <span className="font-mono">portal1234</span>
        </p>
      </div>
    </main>
  );
}

// `?next=` is attacker-controlled: only same-site paths are honoured, otherwise
// a crafted link could bounce the user off-site right after signing in.
function safeRedirect(next: string | undefined): string {
  const fallback = "/announcements";
  if (!next) return fallback;
  return next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}
