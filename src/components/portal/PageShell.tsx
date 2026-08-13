import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  title: string;
  description?: string;
  breadcrumb?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function PageShell({ title, description, breadcrumb, actions, children }: Props) {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-1 text-xs text-muted-foreground">
        <Link to="/" className="story-link transition-colors hover:text-primary">
          Beranda
        </Link>
        {breadcrumb ? (
          <>
            <ChevronRight className="size-3" aria-hidden />
            <span className="font-medium text-foreground">{breadcrumb}</span>
          </>
        ) : null}
      </nav>

      <header className="relative mb-6 flex animate-fade-in flex-col gap-4 overflow-hidden rounded-2xl border border-primary/20 bg-card/60 p-5 backdrop-blur-sm sm:flex-row sm:items-end sm:justify-between sm:p-6">
        <div className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative max-w-2xl">
          <span className="mb-2 inline-block h-1 w-12 rounded-full bg-gradient-to-r from-primary to-primary/20" />
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
          {description ? <p className="mt-2 text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {actions ? <div className="relative flex flex-wrap items-center gap-2">{actions}</div> : null}
      </header>

      <div className="space-y-6">{children}</div>
    </div>

  );
}
