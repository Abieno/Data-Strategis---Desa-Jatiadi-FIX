import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeTable } from "@/lib/realtime";

/** Generic public read helper. All portal tables are read-only for visitors. */
export function useRows<T = Record<string, unknown>>(
  table: string,
  opts?: { select?: string; year?: number | null; order?: string; ascending?: boolean; limit?: number },
) {
  const { select = "*", year = null, order, ascending = true, limit } = opts ?? {};
  useRealtimeTable(table);
  return useQuery({
    queryKey: ["rows", table, select, year, order, ascending, limit],
    queryFn: async () => {
      let q = supabase.from(table as never).select(select);
      if (year != null) q = q.eq("tahun", year);
      if (order) q = q.order(order, { ascending });
      if (limit) q = q.limit(limit);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as T[];
    },
  });
}


/** Distinct year list for a table, newest first. */
export function useYears(table: string) {
  useRealtimeTable(table);
  return useQuery({

    queryKey: ["years", table],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(table as never)
        .select("tahun")
        .order("tahun", { ascending: false });
      if (error) throw error;
      const years = Array.from(
        new Set(((data ?? []) as unknown as { tahun: number | null }[]).map((r) => r.tahun).filter((y): y is number => y != null)),
      );
      return years.sort((a, b) => b - a);
    },
  });
}

export type RtRef = {
  id: string;
  nomor_rt: string;
  nomor_rw: string | null;
  dusun: { nama_dusun: string } | null;
};

export const RT_SELECT = "*, rt:rt_id(id, nomor_rt, nomor_rw, dusun:dusun_id(nama_dusun))";

export type WithRt<T> = T & { rt: RtRef | null; rt_label: string; dusun_label: string };

/** Rows of a per-RT table, joined with RT/dusun labels and sorted by RT number. */
export function useRtRows<T = Record<string, unknown>>(table: string, year: number | null) {
  const query = useRows<T & { rt: RtRef | null }>(table, { select: RT_SELECT, year });
  const rows: WithRt<T>[] = (query.data ?? [])
    .map((r) => ({
      ...(r as T & { rt: RtRef | null }),
      rt_label: r.rt?.nomor_rt ?? "-",
      dusun_label: r.rt?.dusun?.nama_dusun ?? "-",
    }))
    .sort((a, b) => a.rt_label.localeCompare(b.rt_label, "id", { numeric: true }));
  return { ...query, rows };
}

export function sum<T>(rows: T[], key: keyof T): number {
  return rows.reduce((acc, r) => acc + (Number(r[key]) || 0), 0);
}
