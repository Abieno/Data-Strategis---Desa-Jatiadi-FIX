/**
 * Sheet -> table mapping used by the Spreadsheet sync (Apps Script).
 * One sheet = one logical table. Header row must match these column names.
 */

export type TableSync = {
  /** Target table in the database. */
  table: string;
  /** Columns forming the unique key (used for idempotent upserts). */
  conflict?: string[];
  /** Fallback matching columns when the unique key needs custom logic. */
  matchOn?: string[];
  /** Columns that must not be empty. */
  required: string[];
  /** Columns coerced to numbers; non-numeric values fail validation. */
  numeric: string[];
  /** Row identifies its RT with nomor_rw + nomor_rt instead of rt_id. */
  rtRef?: boolean;
};


export const SYNC_TABLES: Record<string, TableSync> = {
  desa_profil: {
    table: "desa_profil",
    matchOn: ["nama_desa"],
    required: ["nama_desa", "kecamatan", "kabupaten", "provinsi"],
    numeric: ["luas_wilayah_ha", "tinggi_wilayah_mdpl", "tahun_data"],
  },
  dusun: {
    table: "dusun",
    conflict: ["nama_dusun"],
    required: ["nama_dusun"],
    numeric: ["jumlah_rw", "jumlah_rt"],
  },
  rt: {
    table: "rt",
    conflict: ["nomor_rw", "nomor_rt"],
    required: ["nomor_rw", "nomor_rt"],
    numeric: ["jarak_ke_kantor_desa_km"],
  },
  kependudukan_per_rt: {
    table: "kependudukan_per_rt",
    conflict: ["rt_id", "tahun"],
    required: ["tahun"],
    numeric: [
      "laki_laki",
      "perempuan",
      "total",
      "islam",
      "protestan",
      "katolik",
      "hindu",
      "budha",
      "lainnya",
      "tahun",
    ],
    rtRef: true,
  },
  karakteristik_keluarga: {
    table: "karakteristik_keluarga",
    conflict: ["rt_id", "tahun"],
    required: ["tahun"],
    numeric: [
      "jumlah_kk",
      "kk_listrik_pln",
      "kk_listrik_non_pln",
      "kk_bukan_listrik",
      "tahun",
    ],
    rtRef: true,
  },
  penduduk_disabilitas: {
    table: "penduduk_disabilitas",
    conflict: ["rt_id", "tahun"],
    required: ["tahun"],
    numeric: [
      "tuna_netra",
      "tuna_rungu",
      "tuna_wicara",
      "tuna_rungu_wicara",
      "tuna_daksa",
      "tuna_grahita",
      "tuna_laras",
      "tuna_ganda",
      "tuna_eks_sakit_kusta",
      "total",
      "tahun",
    ],
    rtRef: true,
  },
  pendidikan_sekolah: {
    table: "pendidikan_sekolah",
    conflict: ["jenjang", "tahun"],
    required: ["jenjang", "tahun"],
    numeric: ["jumlah_sekolah", "jumlah_guru", "jumlah_murid", "tahun"],
  },
  kesehatan_fasilitas: {
    table: "kesehatan_fasilitas",
    conflict: ["jenis_fasilitas", "tahun"],
    required: ["jenis_fasilitas", "tahun"],
    numeric: ["jumlah", "tahun"],
  },
  kesehatan_tenaga: {
    table: "kesehatan_tenaga",
    conflict: ["jenis_tenaga", "tahun"],
    required: ["jenis_tenaga", "tahun"],
    numeric: ["jumlah", "tahun"],
  },
  bencana_alam: {
    table: "bencana_alam",
    conflict: ["rt_id", "tahun"],
    required: ["tahun"],
    numeric: [
      "kekeringan_lahan",
      "kebakaran_lahan",
      "banjir",
      "banjir_bandang",
      "gempa",
      "angin_puyuh",
      "longsor",
      "abrasi",
      "total",
      "tahun",
    ],
    rtRef: true,
  },
  gizi_balita: {
    table: "gizi_balita",
    conflict: ["rt_id", "tahun"],
    required: ["tahun"],
    numeric: ["bb_bawah_garis_merah", "bb_kurang", "gizi_buruk", "total", "tahun"],
    rtRef: true,
  },
  ekonomi_fasilitas: {
    table: "ekonomi_fasilitas",
    matchOn: ["kategori", "sub_kategori", "tahun"],
    required: ["kategori", "tahun"],
    numeric: ["jumlah", "tahun"],
  },
  umkm_per_rt: {
    table: "umkm_per_rt",
    conflict: ["rt_id", "tahun"],
    required: ["tahun"],
    numeric: [
      "jumlah_umkm",
      "bangunan_campuran",
      "bangunan_khusus_usaha",
      "di_rumah_online_keliling",
      "tahun",
    ],
    rtRef: true,
  },
  umkm_lapangan_usaha: {
    table: "umkm_lapangan_usaha",
    conflict: ["kode_kbli", "tahun"],
    required: ["kode_kbli", "nama_lapangan_usaha", "tahun"],
    numeric: ["jumlah_umkm", "tahun"],
  },
  umkm_karakteristik_pengusaha: {
    table: "umkm_karakteristik_pengusaha",
    conflict: ["kelompok_usia", "tahun"],
    required: ["kelompok_usia", "tahun"],
    numeric: ["laki_laki", "perempuan", "total", "tahun"],
  },
  umkm_pendidikan_pengusaha: {
    table: "umkm_pendidikan_pengusaha",
    conflict: ["tingkat_pendidikan", "tahun"],
    required: ["tingkat_pendidikan", "tahun"],
    numeric: ["persentase", "tahun"],
  },
  rtlh: {
    table: "rtlh",
    conflict: ["id_rtlh"],
    required: ["id_rtlh", "nama_kepala_keluarga", "latitude", "longitude"],
    numeric: [
      "latitude",
      "longitude",
      "luas_bangunan_m2",
      "jumlah_penghuni",
      "tahun_pendataan",
    ],
    rtRef: true,
  },
  metadata_indikator: {
    table: "metadata_indikator",
    conflict: ["nama_tabel", "nama_indikator"],
    required: ["nama_tabel", "nama_indikator"],
    numeric: ["tahun"],
  },
  publikasi: {
    table: "publikasi",
    matchOn: ["judul", "jenis"],
    required: ["judul", "jenis"],
    numeric: [],
  },
  berita: {
    table: "berita",
    conflict: ["slug"],
    required: ["judul", "slug"],
    numeric: [],
  },
  map_layers: {
    table: "map_layers",
    conflict: ["kode_layer"],
    required: ["kode_layer", "nama_layer", "tabel_sumber"],
    numeric: ["urutan"],
  },
};

export type SyncRow = Record<string, unknown>;

function isEmpty(value: unknown): boolean {
  return value === null || value === undefined || (typeof value === "string" && value.trim() === "");
}

/**
 * Validates and normalises one spreadsheet row against its table config.
 * Returns the cleaned payload, or an error message when the row must be skipped.
 */
export function normalizeRow(
  config: TableSync,
  raw: SyncRow,
): { ok: true; payload: SyncRow } | { ok: false; error: string } {
  const payload: SyncRow = {};

  for (const [key, value] of Object.entries(raw)) {
    if (key === "created_at" || key === "updated_at" || key === "id") continue;
    payload[key] = typeof value === "string" ? value.trim() : value;
  }

  for (const field of config.required) {
    if (isEmpty(payload[field])) return { ok: false, error: `Kolom wajib kosong: ${field}` };
  }

  for (const field of config.numeric) {
    const value = payload[field];
    if (isEmpty(value)) {
      delete payload[field];
      continue;
    }
    const num = Number(typeof value === "string" ? value.replace(",", ".") : value);
    if (!Number.isFinite(num)) return { ok: false, error: `Nilai bukan angka: ${field}="${String(value)}"` };
    payload[field] = num;
  }

  if (config.table === "rtlh") {
    const lat = Number(payload["latitude"]);
    const lon = Number(payload["longitude"]);
    if (lat < -9 || lat > -6 || lon < 112 || lon > 115) {
      return { ok: false, error: `Koordinat di luar wilayah Probolinggo: ${lat}, ${lon}` };
    }
  }

  if (config.table === "umkm_pendidikan_pengusaha") {
    const p = Number(payload["persentase"]);
    if (p < 0 || p > 100) return { ok: false, error: `Persentase di luar rentang: ${p}` };
  }

  return { ok: true, payload };
}
