import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/**
 * Near real-time sync: Spreadsheet -> (Apps Script onEdit) -> database -> Realtime -> UI.
 * Subscriptions are scoped per page: a channel only exists while a component that
 * reads the table is mounted, so we never hold WebSocket topics we don't need.
 */

/** Views are not published; listen to the table that feeds them instead. */
const SOURCE_TABLE: Record<string, string> = {
  kependudukan_ringkasan: "kependudukan_per_rt",
};

type Entry = {
  channel: RealtimeChannel;
  listeners: Set<() => void>;
};

const registry = new Map<string, Entry>();

/** Ref-counted channel per table, shared by every hook reading that table. */
function subscribeTable(table: string, onChange: () => void): () => void {
  const source = SOURCE_TABLE[table] ?? table;
  let entry = registry.get(source);

  if (!entry) {
    const listeners = new Set<() => void>();
    const channel = supabase
      .channel(`realtime-${source}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: source },
        () => {
          for (const listener of listeners) listener();
        },
      )
      .subscribe();
    entry = { channel, listeners };
    registry.set(source, entry);
  }

  entry.listeners.add(onChange);

  return () => {
    const current = registry.get(source);
    if (!current) return;
    current.listeners.delete(onChange);
    if (current.listeners.size === 0) {
      registry.delete(source);
      void supabase.removeChannel(current.channel);
    }
  };
}

/**
 * Refetch every query bound to `table` whenever a row changes in the database.
 * Visitors see updates within a couple of seconds, without reloading the page.
 */
export function useRealtimeTable(table: string | null | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!table) return;
    const source = SOURCE_TABLE[table] ?? table;

    return subscribeTable(table, () => {
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey;
          if (!Array.isArray(key) || key.length < 2) return false;
          const keyTable = key[1];
          if (typeof keyTable !== "string") return false;
          return keyTable === table || keyTable === source || SOURCE_TABLE[keyTable] === source;
        },
      });
    });
  }, [table, queryClient]);
}
