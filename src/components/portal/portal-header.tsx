import { Badge } from "@/components/ui/badge";
import { LogoutButton } from "@/components/portal/logout-button";
import type { SessionUser } from "@/lib/auth/session";

export function PortalHeader({ user }: { user: SessionUser }) {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-6 py-3">
        <span className="font-semibold tracking-tight">Internal Portal</span>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{user.name}</span>
            <Badge variant={user.role === "admin" ? "default" : "secondary"}>
              {user.role}
            </Badge>
          </div>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
