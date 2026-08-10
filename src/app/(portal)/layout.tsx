import { requireUser } from "@/lib/auth/guards";
import { PortalHeader } from "@/components/portal/portal-header";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Middleware already turned anonymous requests away; this is the check that
  // actually gates the page.
  const user = await requireUser();

  return (
    <div className="min-h-svh bg-muted/40">
      <PortalHeader user={user} />
      <main className="mx-auto w-full max-w-3xl px-6 py-8">{children}</main>
    </div>
  );
}
