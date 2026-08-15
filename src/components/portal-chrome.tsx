import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Menu } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

export type NavItem = { to: string; label: string };

export function PortalNav({ items, title }: { items: NavItem[]; title: string }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const roleLabel = user?.role === "student" ? "Student" : user?.role === "admin" ? "Admin" : "Teacher";

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-ink text-ink-foreground">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-md bg-secondary text-sm font-semibold text-secondary-foreground">
            SP
          </span>
          <span className="font-display text-base leading-tight">{title}</span>
        </Link>

        <nav className="ml-6 hidden items-center gap-1 md:flex">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to.split("/").length <= 2 }}
              className="rounded-md px-3 py-1.5 text-sm text-ink-foreground/70 transition-colors hover:bg-white/10 hover:text-ink-foreground data-[status=active]:bg-white/15 data-[status=active]:text-ink-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm leading-tight">{user?.name}</p>
            <p className="text-[11px] uppercase tracking-wide text-ink-foreground/60">{roleLabel}</p>
          </div>
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide sm:hidden">
            {roleLabel}
          </span>
          <Button
            size="sm"
            variant="ghost"
            className="text-ink-foreground hover:bg-white/10 hover:text-ink-foreground"
            onClick={() => {
              signOut();
              navigate({ to: "/", replace: true });
            }}
          >
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="text-ink-foreground hover:bg-white/10 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <Menu className="size-5" />
          </Button>
        </div>
      </div>

      <div className={cn("border-t border-white/10 md:hidden", open ? "block" : "hidden")}>
        <nav className="mx-auto grid max-w-7xl gap-1 px-4 py-3">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm text-ink-foreground/80 hover:bg-white/10 data-[status=active]:bg-white/15"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="grid place-items-center rounded-xl border border-dashed border-border bg-card/60 px-6 py-14 text-center">
      {icon && <div className="mb-3 text-muted-foreground">{icon}</div>}
      <p className="font-display text-lg">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
