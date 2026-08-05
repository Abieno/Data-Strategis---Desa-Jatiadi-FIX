create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;

create table public.desa_profil (
  id uuid primary key default gen_random_uuid(),
  nama_desa text not null, kecamatan text not null, kabupaten text not null, provinsi text not null,
  luas_wilayah_ha numeric, tinggi_wilayah_mdpl numeric, lokasi_kantor_desa text,
  sumber_data text, tahun_data integer,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create table public.dusun (
  id uuid primary key default gen_random_uuid(),
  nama_dusun text not null unique, jumlah_rw integer not null default 0, jumlah_rt integer not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create table public.rt (
  id uuid primary key default gen_random_uuid(),
  dusun_id uuid references public.dusun(id) on delete set null,
  nomor_rw text not null, nomor_rt text not null, jarak_ke_kantor_desa_km numeric,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (nomor_rw, nomor_rt));

create table public.kependudukan_per_rt (
  id uuid primary key default gen_random_uuid(),
  rt_id uuid not null references public.rt(id) on delete cascade,
  laki_laki integer not null default 0, perempuan integer not null default 0, total integer not null default 0,
  islam integer not null default 0, protestan integer not null default 0, katolik integer not null default 0,
  hindu integer not null default 0, budha integer not null default 0, lainnya integer not null default 0,
  tahun integer not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (rt_id, tahun));

create table public.karakteristik_keluarga (
  id uuid primary key default gen_random_uuid(),
  rt_id uuid not null references public.rt(id) on delete cascade,
  jumlah_kk integer not null default 0, kk_listrik_pln integer not null default 0,
  kk_listrik_non_pln integer not null default 0, kk_bukan_listrik integer not null default 0,
  tahun integer not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (rt_id, tahun));

create table public.penduduk_disabilitas (
  id uuid primary key default gen_random_uuid(),
  rt_id uuid not null references public.rt(id) on delete cascade,
  tuna_netra integer not null default 0, tuna_rungu integer not null default 0, tuna_wicara integer not null default 0,
  tuna_rungu_wicara integer not null default 0, tuna_daksa integer not null default 0, tuna_grahita integer not null default 0,
  tuna_laras integer not null default 0, tuna_ganda integer not null default 0, tuna_eks_sakit_kusta integer not null default 0,
  total integer not null default 0, tahun integer not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (rt_id, tahun));

create table public.pendidikan_sekolah (
  id uuid primary key default gen_random_uuid(),
  jenjang text not null, jumlah_sekolah integer not null default 0, jumlah_guru integer not null default 0,
  jumlah_murid integer not null default 0, tahun integer not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (jenjang, tahun));

create table public.kesehatan_fasilitas (
  id uuid primary key default gen_random_uuid(),
  jenis_fasilitas text not null, jumlah integer not null default 0, tahun integer not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (jenis_fasilitas, tahun));

create table public.kesehatan_tenaga (
  id uuid primary key default gen_random_uuid(),
  jenis_tenaga text not null, jumlah integer not null default 0, tahun integer not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (jenis_tenaga, tahun));

create table public.bencana_alam (
  id uuid primary key default gen_random_uuid(),
  rt_id uuid not null references public.rt(id) on delete cascade,
  kekeringan_lahan integer not null default 0, kebakaran_lahan integer not null default 0, banjir integer not null default 0,
  banjir_bandang integer not null default 0, gempa integer not null default 0, angin_puyuh integer not null default 0,
  longsor integer not null default 0, abrasi integer not null default 0, total integer not null default 0,
  tahun integer not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (rt_id, tahun));

create table public.gizi_balita (
  id uuid primary key default gen_random_uuid(),
  rt_id uuid not null references public.rt(id) on delete cascade,
  bb_bawah_garis_merah integer not null default 0, bb_kurang integer not null default 0,
  gizi_buruk integer not null default 0, total integer not null default 0, tahun integer not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (rt_id, tahun));

create table public.ekonomi_fasilitas (
  id uuid primary key default gen_random_uuid(),
  kategori text not null, sub_kategori text, jumlah integer not null default 0, tahun integer not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create unique index ekonomi_fasilitas_uq on public.ekonomi_fasilitas (kategori, coalesce(sub_kategori,''), tahun);

create table public.umkm_per_rt (
  id uuid primary key default gen_random_uuid(),
  rt_id uuid not null references public.rt(id) on delete cascade,
  jumlah_umkm integer not null default 0, bangunan_campuran integer not null default 0,
  bangunan_khusus_usaha integer not null default 0, di_rumah_online_keliling integer not null default 0,
  tahun integer not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (rt_id, tahun));

create table public.umkm_lapangan_usaha (
  id uuid primary key default gen_random_uuid(),
  kode_kbli text not null, nama_lapangan_usaha text not null, jumlah_umkm integer not null default 0, tahun integer not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (kode_kbli, tahun));

create table public.umkm_karakteristik_pengusaha (
  id uuid primary key default gen_random_uuid(),
  kelompok_usia text not null, laki_laki integer not null default 0, perempuan integer not null default 0,
  total integer not null default 0, tahun integer not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (kelompok_usia, tahun));

create table public.umkm_pendidikan_pengusaha (
  id uuid primary key default gen_random_uuid(),
  tingkat_pendidikan text not null, persentase numeric not null default 0, tahun integer not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (tingkat_pendidikan, tahun));

create table public.rtlh (
  id uuid primary key default gen_random_uuid(),
  id_rtlh text not null unique,
  nama_kepala_keluarga text not null, nik text,
  rt_id uuid references public.rt(id) on delete set null,
  dusun text, alamat text,
  latitude double precision not null, longitude double precision not null,
  status text, kategori_kerusakan text, luas_bangunan_m2 numeric,
  jenis_atap text, jenis_dinding text, jenis_lantai text, jumlah_penghuni integer,
  status_kepemilikan text, bantuan_terakhir text, tahun_pendataan integer,
  foto_rumah_url text, keterangan text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint rtlh_lat_chk check (latitude between -9 and -6),
  constraint rtlh_lon_chk check (longitude between 112 and 115));

create table public.metadata_indikator (
  id uuid primary key default gen_random_uuid(),
  nama_tabel text not null, nama_indikator text not null, definisi text, satuan text,
  sumber_data text, frekuensi_pembaruan text, tahun integer,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (nama_tabel, nama_indikator));

create table public.publikasi (
  id uuid primary key default gen_random_uuid(),
  judul text not null, jenis text not null, file_url text, tanggal_terbit date, deskripsi text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create table public.berita (
  id uuid primary key default gen_random_uuid(),
  judul text not null, slug text not null unique, konten text, gambar_url text,
  tanggal_terbit date, status text not null default 'draft',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create table public.map_layers (
  id uuid primary key default gen_random_uuid(),
  kode_layer text not null unique, nama_layer text not null, tipe_geometri text not null default 'point',
  tabel_sumber text not null, aktif_default boolean not null default false, deskripsi text, urutan integer not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create table public.sync_log (
  id uuid primary key default gen_random_uuid(),
  "timestamp" timestamptz not null default now(),
  sheet_name text not null, row_number integer, status text not null, error_message text,
  created_at timestamptz not null default now());

create view public.kependudukan_ringkasan
with (security_invoker = true) as
select k.tahun,
  sum(k.laki_laki)::int as laki_laki, sum(k.perempuan)::int as perempuan, sum(k.total)::int as total_penduduk,
  sum(k.islam)::int as islam, sum(k.protestan)::int as protestan, sum(k.katolik)::int as katolik,
  sum(k.hindu)::int as hindu, sum(k.budha)::int as budha, sum(k.lainnya)::int as lainnya
from public.kependudukan_per_rt k group by k.tahun;

do $$ declare t text; begin
  foreach t in array array['desa_profil','dusun','rt','kependudukan_per_rt','karakteristik_keluarga','penduduk_disabilitas','pendidikan_sekolah','kesehatan_fasilitas','kesehatan_tenaga','bencana_alam','gizi_balita','ekonomi_fasilitas','umkm_per_rt','umkm_lapangan_usaha','umkm_karakteristik_pengusaha','umkm_pendidikan_pengusaha','rtlh','metadata_indikator','publikasi','berita','map_layers']
  loop execute format('create trigger set_updated_at_%1$s before update on public.%1$I for each row execute function public.set_updated_at()', t); end loop;
end $$;

do $$ declare t text; begin
  foreach t in array array['desa_profil','dusun','rt','kependudukan_per_rt','karakteristik_keluarga','penduduk_disabilitas','pendidikan_sekolah','kesehatan_fasilitas','kesehatan_tenaga','bencana_alam','gizi_balita','ekonomi_fasilitas','umkm_per_rt','umkm_lapangan_usaha','umkm_karakteristik_pengusaha','umkm_pendidikan_pengusaha','rtlh','metadata_indikator','publikasi','map_layers','sync_log']
  loop
    execute format('grant select on public.%I to anon, authenticated', t);
    execute format('grant all on public.%I to service_role', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "public_read_%1$s" on public.%1$I for select to anon, authenticated using (true)', t);
  end loop;
end $$;

grant select on public.berita to anon, authenticated;
grant all on public.berita to service_role;
alter table public.berita enable row level security;
create policy "public_read_berita_published" on public.berita for select to anon, authenticated using (status = 'published');

grant select on public.kependudukan_ringkasan to anon, authenticated;

create index rtlh_rt_idx on public.rtlh (rt_id);
create index rtlh_tahun_idx on public.rtlh (tahun_pendataan);

-- Near real-time: publish row changes for every indicator table
do $$ declare t text; begin
  foreach t in array array['desa_profil','dusun','rt','kependudukan_per_rt','karakteristik_keluarga','penduduk_disabilitas','pendidikan_sekolah','kesehatan_fasilitas','kesehatan_tenaga','bencana_alam','gizi_balita','ekonomi_fasilitas','umkm_per_rt','umkm_lapangan_usaha','umkm_karakteristik_pengusaha','umkm_pendidikan_pengusaha','rtlh','metadata_indikator','publikasi','berita','map_layers']
  loop
    execute format('alter table public.%I replica identity full', t);
    execute format('alter publication supabase_realtime add table public.%I', t);
  end loop;
end $$;