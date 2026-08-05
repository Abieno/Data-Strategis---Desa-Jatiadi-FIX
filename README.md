# Data Strategis Desa Cantik - Desa Jatiadi

1. PERAN & CARA KERJA

Anda bertindak sekaligus sebagai:

Senior Software Architect
Senior UI/UX Designer
Frontend Engineer
Backend Engineer
GIS Engineer
Database Architect
Product Designer

Instruksi wajib sebelum menulis kode apa pun:

Baca seluruh dokumen ini terlebih dahulu, dari awal sampai akhir, sebelum menghasilkan satu baris kode pun.
Perlakukan dokumen ini sebagai Software Requirement Specification (SRS) yang mengikat — bukan sekadar ide bebas.
Jangan menghapus, menyederhanakan, atau mengubah fitur apa pun tanpa alasan teknis yang kuat dan dijelaskan secara eksplisit.
Jika ada ambiguitas, pilih interpretasi yang paling konsisten dengan struktur database dan referensi yang dilampirkan (Bagian 4), bukan asumsi bebas.
Fokus utama: membangun aplikasi yang scalable, modular, maintainable, responsive, modern, dan siap dipakai sebagai Portal Data Strategis Desa Jatiadi — bukan sekadar tampilan cantik tanpa fondasi teknis.
2. IDENTITAS PROYEK
Item	Detail
Nama Website	Portal Data Strategis Desa Jatiadi
Program	Desa Cantik (Desa Cinta Statistik) — BPS
Lokasi	Desa Jatiadi, Kecamatan Gending, Kabupaten Probolinggo, Jawa Timur, Indonesia
Sifat	Portal publik, tanpa login, semua data terbuka untuk umum
Target pengguna	Masyarakat umum, Pemerintah Desa, BPS, mahasiswa, peneliti, investor, instansi pemerintah
3. TUJUAN

Menyajikan data statistik dan spasial Desa Jatiadi secara interaktif, modern, dan mudah diakses publik, mengikuti kerangka indikator resmi program Desa Cantik BPS, dilengkapi Peta Tematik sebagai fitur unggulan (khususnya layer Rumah Tidak Layak Huni/RTLH).

4. REFERENSI WAJIB (GUNAKAN SEBAGAI ACUAN UTAMA, BUKAN ASUMSI)
Referensi 1 — Looker Studio

https://datastudio.google.com/reporting/2e4c11ca-0a64-4bdb-8a8d-b6333fa602c5/page/p_5qijiz2lld

Gunakan sebagai acuan struktur menu, pengelompokan dashboard, dan jenis visualisasi (kartu ringkasan, tabel per-RT, grafik proporsi, dsb) — sesuai pola standar dashboard "Data Strategis Desa" program Desa Cantik BPS. Tampilan akhir website harus jauh lebih modern daripada Looker Studio, bukan menirunya secara visual.

Referensi 2 — Struktur Data (Excel)

Dua file data dummy sudah dianalisis dan strukturnya wajib dipakai sebagai dasar skema database (lihat Bagian 6 & 7 di bawah — sudah dipetakan lengkap dari kedua file, tidak perlu ditebak ulang):

Data_Dummy_Website_-_Desa_Cantik.xlsx — 13 sheet indikator statistik desa (Profil, Kependudukan, Keluarga, Disabilitas, Pendidikan, Kesehatan, Bencana, Gizi, Ekonomi, UMKM).
Data_Dummy_RTLH_-_Desa_Cantik.xlsx — 1 sheet data spasial Rumah Tidak Layak Huni (50 baris dummy, lengkap dengan koordinat).
5. ARSITEKTUR SISTEM (WAJIB, TIDAK BOLEH DIUBAH)
Google Spreadsheet (tempat input data oleh admin desa/BPS)
        │
        │  sinkronisasi terjadwal / manual trigger
        ▼
   Supabase (Database + Storage + API)
        │
        │  read-only via Supabase client/API
        ▼
   Website (Next.js/React) — HANYA MEMBACA dari Supabase

Aturan mutlak:

Website tidak boleh membaca Google Spreadsheet secara langsung dalam mode produksi.
Website tidak punya dashboard admin dan tidak punya sistem login. Semua input/edit data dilakukan lewat Spreadsheet oleh operator desa.
Spreadsheet berfungsi murni sebagai form input terstruktur, bukan sumber data live bagi frontend.
5.1 Alur Sinkronisasi Spreadsheet → Supabase (jelaskan & implementasikan secara rinci)
Struktur Spreadsheet: satu sheet = satu tabel logis (mengikuti nama-nama sheet di Bagian 7). Baris pertama = header kolom yang identik dengan nama kolom di Supabase (snake_case).
Mekanisme sinkronisasi (implementasi final): Google Apps Script pada Spreadsheet input (lihat `docs/apps-script/Code.gs`) memanggil endpoint server `POST /api/public/sync/sheet` dengan header rahasia `x-sync-secret`. Endpoint inilah yang melakukan validasi + upsert ke database memakai kredensial server-side, sehingga service role key tidak pernah ada di Spreadsheet maupun di browser. Dua trigger dipasang berlapis: (1) installable trigger `onEdit` yang mengirim hanya baris yang diubah sehingga data masuk dalam 1–3 detik, dan (2) trigger terjadwal tiap 30 menit yang mengirim ulang seluruh sheet sebagai fallback bila `onEdit` gagal/terlewat. Karena upsert bersifat idempoten, fallback tidak menghasilkan duplikasi. Alternatif middleware (n8n / Make.com) tetap memungkinkan dengan memanggil endpoint yang sama, namun tidak dipakai sebagai default agar tidak menambah layanan pihak ketiga. Di sisi website, tabel indikator diaktifkan pada publikasi Realtime dan hook data berlangganan perubahan tabel (`src/lib/realtime.ts`), sehingga UI ikut ter-refresh otomatis tanpa reload.
Proses import per sheet:
Baca seluruh baris baru/berubah sejak sinkronisasi terakhir (bandingkan updated_at atau gunakan checksum baris).
Validasi tipe data sesuai skema (angka tidak boleh string, koordinat harus dalam rentang valid, field wajib tidak boleh kosong).
Lakukan upsert (insert jika baru, update jika id/kode unik sudah ada) ke tabel Supabase terkait — jangan pernah duplikasi baris.
Baris yang gagal validasi tidak disinkronkan, dan dicatat ke log kesalahan (buat tabel sync_log berisi: timestamp, sheet_name, row_number, status, error_message).
Foto rumah RTLH: proses input foto dilakukan terpisah dari spreadsheet — operator mengunggah foto ke Supabase Storage (bucket rtlh-photos), lalu memasukkan nama file/URL hasil upload ke kolom foto_rumah di spreadsheet. Skrip sinkronisasi hanya menyalin referensi URL tersebut ke kolom foto_rumah_url di tabel rtlh.
Validasi data: setiap sinkronisasi harus memvalidasi tipe data, rentang nilai (misal persentase 0–1, koordinat sesuai wilayah Kabupaten Probolinggo), dan relasi foreign key (RT harus ada di tabel rt sebelum baris turunannya disinkronkan).
Idempotensi: menjalankan sinkronisasi berkali-kali dengan data yang sama tidak boleh menghasilkan data duplikat atau berubah tanpa alasan.
6. SUPABASE — KOMPONEN YANG DIGUNAKAN
Database (Postgres) — seluruh tabel di Bagian 7.
Storage — bucket rtlh-photos (foto rumah RTLH), bucket publikasi (PDF/Excel/infografis), bucket berita (gambar berita).
Row Level Security (RLS): aktifkan RLS di semua tabel. Karena tidak ada login, buat policy SELECT bersifat publik (USING (true)) untuk role anon, tetapi tolak INSERT/UPDATE/DELETE dari role anon — operasi tulis hanya boleh lewat service role key yang dipakai skrip sinkronisasi (server-side), tidak pernah lewat client browser.
API: gunakan Supabase client (@supabase/supabase-js) di sisi frontend, khusus untuk query SELECT read-only.
7. SKEMA DATABASE (WAJIB DIIKUTI — DITURUNKAN LANGSUNG DARI DATA DUMMY)

Konvensi: nama tabel & kolom snake_case, primary key id (uuid atau serial), tambahkan created_at/updated_at di semua tabel, tambahkan kolom tahun di tabel yang bersifat data tahunan agar mendukung filter tahun di dashboard.

7.1 desa_profil (1 baris)

nama_desa, kecamatan, kabupaten, provinsi, luas_wilayah_ha, tinggi_wilayah_mdpl, lokasi_kantor_desa, sumber_data, tahun_data

7.2 dusun

id, nama_dusun, jumlah_rw, jumlah_rt

7.3 rt

id, dusun_id (FK → dusun), nomor_rw, nomor_rt, jarak_ke_kantor_desa_km (Semua tabel "per RT" di bawah mereferensikan rt_id ke tabel ini — jangan simpan RT sebagai teks bebas di tabel lain.)

7.4 kependudukan_per_rt

id, rt_id (FK), laki_laki, perempuan, total, islam, protestan, katolik, hindu, budha, lainnya, tahun

kependudukan_ringkasan yang ditampilkan di dashboard dihitung (aggregate SUM) dari tabel ini via query/view, bukan tabel input terpisah — hindari duplikasi data.

7.5 karakteristik_keluarga

id, rt_id (FK), jumlah_kk, kk_listrik_pln, kk_listrik_non_pln, kk_bukan_listrik, tahun

7.6 penduduk_disabilitas

id, rt_id (FK), tuna_netra, tuna_rungu, tuna_wicara, tuna_rungu_wicara, tuna_daksa, tuna_grahita, tuna_laras, tuna_ganda, tuna_eks_sakit_kusta, total, tahun

7.7 pendidikan_sekolah

id, jenjang (PAUD/TK/RA/SD/MI/SMP/MTs/SMA/MA/SMK), jumlah_sekolah, jumlah_guru, jumlah_murid, tahun

7.8 kesehatan_fasilitas

id, jenis_fasilitas (Puskesmas Pembantu, Tempat Praktik Bidan, Poskesdes, Posyandu, Posbindu, dst), jumlah, tahun

7.9 kesehatan_tenaga

id, jenis_tenaga (Dokter, Dokter Gigi, Perawat, Bidan, Tenaga Kefarmasian, Tenaga Kesehatan Lingkungan, Tenaga Gizi, Ahli Teknologi Lab Medis, Tenaga Kesehatan Masyarakat), jumlah, tahun

7.10 bencana_alam

id, rt_id (FK), kekeringan_lahan, kebakaran_lahan, banjir, banjir_bandang, gempa, angin_puyuh, longsor, abrasi, total, tahun

7.11 gizi_balita

id, rt_id (FK), bb_bawah_garis_merah, bb_kurang, gizi_buruk, total, tahun

7.12 ekonomi_fasilitas

id, kategori (Bank/Pasar/Koperasi/Minimarket), sub_kategori (mis. "Bank Umum Pemerintah", "Bangunan Permanen", "Simpan Pinjam" — nullable untuk kategori tanpa sub-kategori seperti Minimarket), jumlah, tahun

7.13 umkm_per_rt

id, rt_id (FK), jumlah_umkm, bangunan_campuran, bangunan_khusus_usaha, di_rumah_online_keliling, tahun

7.14 umkm_lapangan_usaha

id, kode_kbli, nama_lapangan_usaha, jumlah_umkm, tahun

7.15 umkm_karakteristik_pengusaha

id, kelompok_usia, laki_laki, perempuan, total, tahun

7.16 rtlh (WAJIB — data spasial peta tematik)

id, id_rtlh (kode unik, mis. RTLH-0001), nama_kepala_keluarga, nik, rt_id (FK), dusun, alamat, latitude, longitude, status, kategori_kerusakan (Atap/Dinding/Lantai/Kombinasi), luas_bangunan_m2, jenis_atap, jenis_dinding, jenis_lantai, jumlah_penghuni, status_kepemilikan, bantuan_terakhir, tahun_pendataan, foto_rumah_url, keterangan

7.17 metadata_indikator (WAJIB — setiap indikator harus punya metadata)

id, nama_tabel, nama_indikator, definisi, satuan, sumber_data, frekuensi_pembaruan, tahun

7.18 publikasi

id, judul, jenis (PDF/Excel/Infografis/Dokumen/Laporan), file_url, tanggal_terbit, deskripsi

7.19 berita (siapkan strukturnya walau belum dipakai)

id, judul, slug, konten, gambar_url, tanggal_terbit, status (draft/published)

7.20 map_layers (untuk future-proofing peta)

id, kode_layer, nama_layer, tipe_geometri (point/polygon/line), tabel_sumber, aktif_default (boolean), deskripsi

Layer RTLH adalah baris pertama dan wajib di tabel ini. Layer lain (UMKM, Sekolah, Posyandu, dst) tinggal ditambahkan sebagai baris baru + tabel data spasial baru, tanpa mengubah struktur aplikasi inti.

7.21 sync_log

id, timestamp, sheet_name, row_number, status (success/failed), error_message

Relasi kunci: dusun 1—N rt, rt 1—N ke seluruh tabel "per_rt" dan ke rtlh. Semua tabel bertahun (tahun) mendukung filter tahun di dashboard tanpa perlu tabel snapshot terpisah.

8. PETA TEMATIK

Bukan halaman terpisah — merupakan satu menu di dalam Portal Data Strategis.

Kemampuan peta (wajib):

Peta interaktif dengan level zoom sedalam Google Maps
Drag, zoom in, zoom out, fullscreen
Fully responsive di semua perangkat

Sistem Layer:

Layer aktif/nonaktif via toggle/checkbox
Layer wajib pertama: Rumah Tidak Layak Huni (RTLH)
Arsitektur harus disiapkan agar layer baru (UMKM, Sekolah, Posyandu, Fasilitas Kesehatan, Infrastruktur, Jalan, Sawah, Tempat Ibadah, Batas Dusun, dst) tinggal ditambahkan lewat tabel map_layers + tabel data spasial baru, tanpa mengubah struktur peta inti.

Layer RTLH — detail marker & popup (prioritas tertinggi):

Setiap baris tabel rtlh = satu marker di peta, posisi dari latitude/longitude. Klik marker menampilkan popup berisi:

Foto rumah (diambil dari Supabase Storage via foto_rumah_url)
Nama Kepala Keluarga
RT / RW / Dusun
Alamat
Koordinat
Jenis kerusakan (kategori_kerusakan)
Status bantuan (bantuan_terakhir)
Tahun pendataan
Tombol "Lihat Detail" → membuka halaman/panel detail lengkap rumah tersebut
9. STRUKTUR MENU (SIDEBAR KIRI — WAJIB, BUKAN NAVBAR ATAS)
Beranda
Profil Desa
Kependudukan
Keluarga
Disabilitas
Pendidikan
Kesehatan
Bencana
Gizi
Ekonomi
UMKM
Peta Tematik
Publikasi
Metadata
Download Data

Sidebar bersifat sticky. Di mobile, sidebar berubah menjadi drawer/menu yang bisa dibuka-tutup, bukan sekadar dipaksakan mengecil dari versi desktop.

10. DASHBOARD

Ikuti pengelompokan indikator seperti pada Looker Studio (Bagian 4), tapi dengan tampilan modern:

Animated counter untuk angka ringkasan (jumlah penduduk, jumlah KK, jumlah UMKM, dst)
KPI cards dengan ikon dan warna kontekstual
Grafik interaktif (bar, pie/donut, line) untuk data per-RT dan per-kategori
Filter tahun di setiap halaman yang punya data bertahun-tahun (query berdasarkan kolom tahun)
Download grafik (PNG/JPEG)
Fullscreen untuk setiap grafik
Export PDF dan Export Excel untuk tabel data dan ringkasan halaman

Setiap indikator menampilkan tombol/ikon kecil untuk melihat metadata (definisi, satuan, sumber data, frekuensi pembaruan, tahun) — data metadata diambil dari tabel metadata_indikator.

11. UI / UX

Target pengguna: Gen Z, milenial, profesional — desain harus terasa modern, bukan seperti portal pemerintah konvensional yang kaku.

Gaya desain: Modern, minimalis, clean, elegant, soft shadow, rounded card, micro-interaction, smooth animation, glassmorphism ringan, loading skeleton, hover effect, transition halus, sticky sidebar, sticky filter.

Warna:

Primary: Orange — identitas utama website, dominan di sidebar aktif, tombol utama, aksen grafik.
Pendukung: putih, abu muda, biru, hijau, merah, kuning — dipakai secara kontekstual (mis. biru untuk kategori laki-laki, merah muda untuk perempuan, hijau untuk status positif, merah untuk status kritis/kerusakan berat), bukan asal tempel.

Responsive: Optimal di desktop, tablet, dan mobile. Layout mobile dirancang ulang secara UX (bukan sekadar scaling), termasuk navigasi, peta, dan tabel data yang harus tetap nyaman dibaca di layar kecil (gunakan card list sebagai pengganti tabel lebar di mobile bila perlu).

12. FITUR TAMBAHAN

Global search, breadcrumb, dark mode (siapkan arsitektur toggle walau default light), lazy loading, loading skeleton, empty state, back-to-top, floating action button, SEO friendly (meta tag dinamis per halaman), PWA ready, accessibility (kontras warna, alt text, keyboard navigation), fast loading, dan optimasi performa (image lazy load, code splitting).

13. HALAMAN KHUSUS
Publikasi: daftar dokumen (PDF, Excel, Infografis, Dokumen, Laporan) dari tabel publikasi, dengan filter jenis dan tahun, tombol download/preview.
Berita: siapkan struktur halaman & tabel berita walaupun kontennya belum diisi — jangan tampilkan menu ini di sidebar utama jika belum ada konten, cukup siapkan route dan komponennya.
Metadata: halaman terpisah yang menampilkan seluruh isi tabel metadata_indikator dalam bentuk tabel yang bisa difilter per kategori data.
Download Data: kumpulan tombol export (Excel/CSV/PDF) untuk seluruh tabel indikator, dikelompokkan sesuai menu sidebar.
14. HAL YANG TIDAK BOLEH DIUBAH
Website bersifat publik, tanpa login.
Tidak ada dashboard admin.
Sidebar wajib di sebelah kiri.
Struktur dashboard mengikuti kerangka Looker Studio (Bagian 4), ditampilkan lebih modern.
Warna utama Orange.
Menu Peta Tematik wajib ada.
Layer RTLH wajib ada dan menjadi layer default.
Marker RTLH wajib menampilkan foto rumah di popup.
Alur data: Spreadsheet → Supabase → Website, website tidak pernah membaca Spreadsheet langsung di production.
Desain harus modern, bukan template portal pemerintah generik.
15. FUTURE-PROOFING (ARSITEKTUR MODULAR)

Bangun aplikasi agar berikut ini bisa ditambahkan tanpa mengubah struktur utama:

Layer peta baru → tambah baris di map_layers + tabel data spasial baru
Dashboard/menu baru → tambah entri navigasi + tabel data baru mengikuti pola tabel yang sudah ada (relasi ke rt, kolom tahun)
Indikator dan grafik baru → mengikuti pola komponen dashboard yang sudah dibangun (card + chart + filter tahun + metadata)
Dataset baru dari spreadsheet baru → mengikuti pola sinkronisasi di Bagian 5.1
16. CATATAN UNTUK LOVABLE AI

Data yang dilampirkan (dua file Excel dan link Looker Studio) adalah data dummy/contoh, bukan data asli desa — namun strukturnya (nama kolom, nama sheet, relasi, satuan) harus dijadikan acuan skema database final, sehingga saat data asli dimasukkan lewat spreadsheet nanti, tidak perlu ada perubahan struktur.

Sebelum coding, ringkas dulu pemahaman Anda terhadap SRS ini (skema tabel final, struktur menu, dan arsitektur sinkronisasi) untuk dikonfirmasi, baru lanjutkan ke implementasi.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d8fcc513-e538-4a88-b3b2-2da08ca95ee4).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
