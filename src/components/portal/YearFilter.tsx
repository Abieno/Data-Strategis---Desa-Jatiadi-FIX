import { CalendarRange } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Props = {
  years: number[];
  value: number | null;
  onChange: (year: number) => void;
};

export function YearFilter({ years, value, onChange }: Props) {
  if (!years.length) return null;
  return (
    <div className="flex items-center gap-2">
      <CalendarRange className="size-4 text-muted-foreground" aria-hidden />
      <Select {...(value ? { value: String(value) } : {})} onValueChange={(v) => onChange(Number(v))}>
        <SelectTrigger className="h-9 w-[130px]" aria-label="Filter tahun data">
          <SelectValue placeholder="Tahun" />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={String(y)}>
              Tahun {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
