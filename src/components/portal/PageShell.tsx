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
        <Link to="/" className="transition-colors hover:text-primary">
          Beranda
        </Link>
        {breadcrumb ? (
          <>
            <ChevronRight className="size-3" aria-hidden />
            <span className="text-foreground">{breadcrumb}</span>
          </>
        ) : null}
      </nav>

      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
          {description ? <p className="mt-2 text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </header>

      <div className="space-y-6">{children}</div>
    </div>
  );
}
