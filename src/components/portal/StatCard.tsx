import type { LucideIcon } from "lucide-react";
import { useCountUp } from "@/hooks/use-count-up";
import { cn } from "@/lib/utils";
import { nf } from "@/lib/format";

type Tone = "primary" | "info" | "success" | "warning" | "female" | "destructive";

const toneClasses: Record<Tone, { chip: string; glow: string }> = {
  primary: { chip: "bg-primary/12 text-primary", glow: "from-primary/12" },
  info: { chip: "bg-info/12 text-info", glow: "from-info/12" },
  success: { chip: "bg-success/12 text-success", glow: "from-success/12" },
  warning: { chip: "bg-warning/20 text-warning-foreground", glow: "from-warning/15" },
  female: { chip: "bg-female/12 text-female", glow: "from-female/12" },
  destructive: { chip: "bg-destructive/12 text-destructive", glow: "from-destructive/12" },
};

type Props = {
  label: string;
  value: number;
  suffix?: string;
  icon: LucideIcon;
  tone?: Tone;
  hint?: string;
  loading?: boolean;
};

export function StatCard({ label, value, suffix, icon: Icon, tone = "primary", hint, loading }: Props) {
  const { ref, value: animated } = useCountUp(value);
  const t = toneClasses[tone];

  return (
    <div className="group surface-card relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <div className={cn("pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-gradient-to-br to-transparent blur-2xl", t.glow)} />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          {loading ? (
            <div className="mt-3 h-8 w-24 animate-pulse rounded-md bg-muted" />
          ) : (
            <p className="mt-2 font-display text-3xl font-bold tabular-nums">
              <span ref={ref}>{nf.format(animated)}</span>
              {suffix ? <span className="ml-1 text-base font-semibold text-muted-foreground">{suffix}</span> : null}
            </p>
          )}
          {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        <span className={cn("grid size-11 shrink-0 place-items-center rounded-xl transition-transform duration-300 group-hover:scale-110", t.chip)}>
          <Icon className="size-5" aria-hidden />
        </span>
      </div>
    </div>
  );
}
