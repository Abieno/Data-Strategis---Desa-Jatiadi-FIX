import { createFileRoute } from "@tanstack/react-router";
import { SYNC_TABLES, normalizeRow, type SyncRow } from "@/lib/sync-tables";

/**
 * Sync endpoint called by the Google Apps Script attached to the input Spreadsheet.
 *
 * - onEdit trigger  -> sends only the edited row(s)  => near real-time (1-3s)
 * - time-driven trigger (every 30 min) -> sends the whole sheet as a safety net
 *
 * Writes use the server-side service role, so the Spreadsheet never holds a
 * database key. Every rejected row is recorded in sync_log.
 */

type SyncPayload = {
  sheet?: unknown;
  rows?: unknown;
  mode?: unknown;
};

type LogEntry = {
  sheet_name: string;
  row_number: number | null;
  status: string;
  error_message: string | null;
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export const Route = createFileRoute("/api/public/sync/sheet")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["SHEET_SYNC_SECRET"];
        if (!secret) return json({ error: "Sync secret is not configured" }, 500);
        if (request.headers.get("x-sync-secret") !== secret) {
          return json({ error: "Unauthorized" }, 401);
        }

        let payload: SyncPayload;
        try {
          payload = (await request.json()) as SyncPayload;
        } catch {
          return json({ error: "Body bukan JSON yang valid" }, 400);
        }

        const sheet = typeof payload.sheet === "string" ? payload.sheet : "";
        const config = SYNC_TABLES[sheet];
        if (!config) return json({ error: `Sheet tidak dikenal: ${sheet}` }, 400);
        if (!Array.isArray(payload.rows)) return json({ error: "rows harus berupa array" }, 400);

        const mode = payload.mode === "scheduled" ? "scheduled" : "onEdit";
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const logs: LogEntry[] = [];
        let synced = 0;

        // Resolve RT references (nomor_rw + nomor_rt -> rt_id) once per request.
        let rtIndex = new Map<string, string>();
        if (config.rtRef) {
          const { data } = await supabaseAdmin.from("rt").select("id, nomor_rw, nomor_rt");
          rtIndex = new Map(
            (data ?? []).map((r) => [`${String(r.nomor_rw).trim()}|${String(r.nomor_rt).trim()}`, r.id]),
          );
        }

        for (const [index, rawRow] of (payload.rows as SyncRow[]).entries()) {
          const rowNumber =
            typeof rawRow?.["_row"] === "number" ? (rawRow["_row"] as number) : index + 2;
          const raw: SyncRow = { ...rawRow };
          delete raw["_row"];

          const normalized = normalizeRow(config, raw);
          if (!normalized.ok) {
            logs.push({
              sheet_name: sheet,
              row_number: rowNumber,
              status: "error",
              error_message: normalized.error,
            });
            continue;
          }

          const row = normalized.payload;

          if (config.rtRef) {
            const rw = row["nomor_rw"];
            const rt = row["nomor_rt"];
            delete row["nomor_rw"];
            delete row["nomor_rt"];
            if (!isBlank(rw) && !isBlank(rt)) {
              const rtId = rtIndex.get(`${String(rw).trim()}|${String(rt).trim()}`);
              if (!rtId) {
                logs.push({
                  sheet_name: sheet,
                  row_number: rowNumber,
                  status: "error",
                  error_message: `RT ${String(rw)}/${String(rt)} belum ada di tabel rt`,
                });
                continue;
              }
              row["rt_id"] = rtId;
            }
            if (config.conflict?.includes("rt_id") && !row["rt_id"]) {
              logs.push({
                sheet_name: sheet,
                row_number: rowNumber,
                status: "error",
                error_message: "Kolom nomor_rw/nomor_rt wajib diisi",
              });
              continue;
            }
          }

          const error = await writeRow(supabaseAdmin, config.table, row, config);
          if (error) {
            logs.push({
              sheet_name: sheet,
              row_number: rowNumber,
              status: "error",
              error_message: error,
            });
            continue;
          }
          synced += 1;
        }

        logs.push({
          sheet_name: sheet,
          row_number: null,
          status: logs.length === 0 ? "success" : "partial",
          error_message: `mode=${mode}, berhasil=${synced}, gagal=${logs.length}`,
        });
        await supabaseAdmin.from("sync_log").insert(logs);

        return json({ sheet, mode, synced, failed: logs.length - 1 });
      },
    },
  },
});

function isBlank(value: unknown): boolean {
  return value === null || value === undefined || (typeof value === "string" && value.trim() === "");
}

type AdminClient = Awaited<
  typeof import("@/integrations/supabase/client.server")
>["supabaseAdmin"];

/** Idempotent write: upsert on the unique key, or match-then-update when needed. */
async function writeRow(
  supabaseAdmin: AdminClient,
  table: string,
  row: SyncRow,
  config: { conflict?: string[]; matchOn?: string[] },
): Promise<string | null> {
  const client = supabaseAdmin.from(table as never);

  if (config.conflict) {
    const { error } = await client.upsert(row as never, { onConflict: config.conflict.join(",") });
    return error ? error.message : null;
  }

  const matchOn = config.matchOn ?? [];
  let query = supabaseAdmin.from(table as never).select("id");
  for (const key of matchOn) {
    const value = row[key];
    query = isBlank(value) ? query.is(key, null) : query.eq(key, value as never);
  }
  const { data: existing, error: findError } = await query.limit(1);
  if (findError) return findError.message;

  const found = (existing ?? [])[0] as { id?: string } | undefined;
  if (found?.id) {
    const { error } = await supabaseAdmin
      .from(table as never)
      .update(row as never)
      .eq("id", found.id);
    return error ? error.message : null;
  }

  const { error } = await supabaseAdmin.from(table as never).insert(row as never);
  return error ? error.message : null;
}
