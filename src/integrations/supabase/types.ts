export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      bencana_alam: {
        Row: {
          abrasi: number
          angin_puyuh: number
          banjir: number
          banjir_bandang: number
          created_at: string
          gempa: number
          id: string
          kebakaran_lahan: number
          kekeringan_lahan: number
          longsor: number
          rt_id: string
          tahun: number
          total: number
          updated_at: string
        }
        Insert: {
          abrasi?: number
          angin_puyuh?: number
          banjir?: number
          banjir_bandang?: number
          created_at?: string
          gempa?: number
          id?: string
          kebakaran_lahan?: number
          kekeringan_lahan?: number
          longsor?: number
          rt_id: string
          tahun: number
          total?: number
          updated_at?: string
        }
        Update: {
          abrasi?: number
          angin_puyuh?: number
          banjir?: number
          banjir_bandang?: number
          created_at?: string
          gempa?: number
          id?: string
          kebakaran_lahan?: number
          kekeringan_lahan?: number
          longsor?: number
          rt_id?: string
          tahun?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bencana_alam_rt_id_fkey"
            columns: ["rt_id"]
            isOneToOne: false
            referencedRelation: "rt"
            referencedColumns: ["id"]
          },
        ]
      }
      berita: {
        Row: {
          created_at: string
          gambar_url: string | null
          id: string
          judul: string
          konten: string | null
          slug: string
          status: string
          tanggal_terbit: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          gambar_url?: string | null
          id?: string
          judul: string
          konten?: string | null
          slug: string
          status?: string
          tanggal_terbit?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          gambar_url?: string | null
          id?: string
          judul?: string
          konten?: string | null
          slug?: string
          status?: string
          tanggal_terbit?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      desa_profil: {
        Row: {
          created_at: string
          id: string
          kabupaten: string
          kecamatan: string
          lokasi_kantor_desa: string | null
          luas_wilayah_ha: number | null
          nama_desa: string
          provinsi: string
          sumber_data: string | null
          tahun_data: number | null
          tinggi_wilayah_mdpl: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          kabupaten: string
          kecamatan: string
          lokasi_kantor_desa?: string | null
          luas_wilayah_ha?: number | null
          nama_desa: string
          provinsi: string
          sumber_data?: string | null
          tahun_data?: number | null
          tinggi_wilayah_mdpl?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          kabupaten?: string
          kecamatan?: string
          lokasi_kantor_desa?: string | null
          luas_wilayah_ha?: number | null
          nama_desa?: string
          provinsi?: string
          sumber_data?: string | null
          tahun_data?: number | null
          tinggi_wilayah_mdpl?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      dusun: {
        Row: {
          created_at: string
          id: string
          jumlah_rt: number
          jumlah_rw: number
          nama_dusun: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          jumlah_rt?: number
          jumlah_rw?: number
          nama_dusun: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          jumlah_rt?: number
          jumlah_rw?: number
          nama_dusun?: string
          updated_at?: string
        }
        Relationships: []
      }
      ekonomi_fasilitas: {
        Row: {
          created_at: string
          id: string
          jumlah: number
          kategori: string
          sub_kategori: string | null
          tahun: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          jumlah?: number
          kategori: string
          sub_kategori?: string | null
          tahun: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          jumlah?: number
          kategori?: string
          sub_kategori?: string | null
          tahun?: number
          updated_at?: string
        }
        Relationships: []
      }
      gizi_balita: {
        Row: {
          bb_bawah_garis_merah: number
          bb_kurang: number
          created_at: string
          gizi_buruk: number
          id: string
          rt_id: string
          tahun: number
          total: number
          updated_at: string
        }
        Insert: {
          bb_bawah_garis_merah?: number
          bb_kurang?: number
          created_at?: string
          gizi_buruk?: number
          id?: string
          rt_id: string
          tahun: number
          total?: number
          updated_at?: string
        }
        Update: {
          bb_bawah_garis_merah?: number
          bb_kurang?: number
          created_at?: string
          gizi_buruk?: number
          id?: string
          rt_id?: string
          tahun?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gizi_balita_rt_id_fkey"
            columns: ["rt_id"]
            isOneToOne: false
            referencedRelation: "rt"
            referencedColumns: ["id"]
          },
        ]
      }
      karakteristik_keluarga: {
        Row: {
          created_at: string
          id: string
          jumlah_kk: number
          kk_bukan_listrik: number
          kk_listrik_non_pln: number
          kk_listrik_pln: number
          rt_id: string
          tahun: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          jumlah_kk?: number
          kk_bukan_listrik?: number
          kk_listrik_non_pln?: number
          kk_listrik_pln?: number
          rt_id: string
          tahun: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          jumlah_kk?: number
          kk_bukan_listrik?: number
          kk_listrik_non_pln?: number
          kk_listrik_pln?: number
          rt_id?: string
          tahun?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "karakteristik_keluarga_rt_id_fkey"
            columns: ["rt_id"]
            isOneToOne: false
            referencedRelation: "rt"
            referencedColumns: ["id"]
          },
        ]
      }
      kependudukan_per_rt: {
        Row: {
          budha: number
          created_at: string
          hindu: number
          id: string
          islam: number
          katolik: number
          lainnya: number
          laki_laki: number
          perempuan: number
          protestan: number
          rt_id: string
          tahun: number
          total: number
          updated_at: string
        }
        Insert: {
          budha?: number
          created_at?: string
          hindu?: number
          id?: string
          islam?: number
          katolik?: number
          lainnya?: number
          laki_laki?: number
          perempuan?: number
          protestan?: number
          rt_id: string
          tahun: number
          total?: number
          updated_at?: string
        }
        Update: {
          budha?: number
          created_at?: string
          hindu?: number
          id?: string
          islam?: number
          katolik?: number
          lainnya?: number
          laki_laki?: number
          perempuan?: number
          protestan?: number
          rt_id?: string
          tahun?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kependudukan_per_rt_rt_id_fkey"
            columns: ["rt_id"]
            isOneToOne: false
            referencedRelation: "rt"
            referencedColumns: ["id"]
          },
        ]
      }
      kesehatan_fasilitas: {
        Row: {
          created_at: string
          id: string
          jenis_fasilitas: string
          jumlah: number
          tahun: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          jenis_fasilitas: string
          jumlah?: number
          tahun: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          jenis_fasilitas?: string
          jumlah?: number
          tahun?: number
          updated_at?: string
        }
        Relationships: []
      }
      kesehatan_tenaga: {
        Row: {
          created_at: string
          id: string
          jenis_tenaga: string
          jumlah: number
          tahun: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          jenis_tenaga: string
          jumlah?: number
          tahun: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          jenis_tenaga?: string
          jumlah?: number
          tahun?: number
          updated_at?: string
        }
        Relationships: []
      }
      map_layers: {
        Row: {
          aktif_default: boolean
          created_at: string
          deskripsi: string | null
          id: string
          kode_layer: string
          nama_layer: string
          tabel_sumber: string
          tipe_geometri: string
          updated_at: string
          urutan: number
        }
        Insert: {
          aktif_default?: boolean
          created_at?: string
          deskripsi?: string | null
          id?: string
          kode_layer: string
          nama_layer: string
          tabel_sumber: string
          tipe_geometri?: string
          updated_at?: string
          urutan?: number
        }
        Update: {
          aktif_default?: boolean
          created_at?: string
          deskripsi?: string | null
          id?: string
          kode_layer?: string
          nama_layer?: string
          tabel_sumber?: string
          tipe_geometri?: string
          updated_at?: string
          urutan?: number
        }
        Relationships: []
      }
      metadata_indikator: {
        Row: {
          created_at: string
          definisi: string | null
          frekuensi_pembaruan: string | null
          id: string
          nama_indikator: string
          nama_tabel: string
          satuan: string | null
          sumber_data: string | null
          tahun: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          definisi?: string | null
          frekuensi_pembaruan?: string | null
          id?: string
          nama_indikator: string
          nama_tabel: string
          satuan?: string | null
          sumber_data?: string | null
          tahun?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          definisi?: string | null
          frekuensi_pembaruan?: string | null
          id?: string
          nama_indikator?: string
          nama_tabel?: string
          satuan?: string | null
          sumber_data?: string | null
          tahun?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      pendidikan_sekolah: {
        Row: {
          created_at: string
          id: string
          jenjang: string
          jumlah_guru: number
          jumlah_murid: number
          jumlah_sekolah: number
          tahun: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          jenjang: string
          jumlah_guru?: number
          jumlah_murid?: number
          jumlah_sekolah?: number
          tahun: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          jenjang?: string
          jumlah_guru?: number
          jumlah_murid?: number
          jumlah_sekolah?: number
          tahun?: number
          updated_at?: string
        }
        Relationships: []
      }
      penduduk_disabilitas: {
        Row: {
          created_at: string
          id: string
          rt_id: string
          tahun: number
          total: number
          tuna_daksa: number
          tuna_eks_sakit_kusta: number
          tuna_ganda: number
          tuna_grahita: number
          tuna_laras: number
          tuna_netra: number
          tuna_rungu: number
          tuna_rungu_wicara: number
          tuna_wicara: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          rt_id: string
          tahun: number
          total?: number
          tuna_daksa?: number
          tuna_eks_sakit_kusta?: number
          tuna_ganda?: number
          tuna_grahita?: number
          tuna_laras?: number
          tuna_netra?: number
          tuna_rungu?: number
          tuna_rungu_wicara?: number
          tuna_wicara?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          rt_id?: string
          tahun?: number
          total?: number
          tuna_daksa?: number
          tuna_eks_sakit_kusta?: number
          tuna_ganda?: number
          tuna_grahita?: number
          tuna_laras?: number
          tuna_netra?: number
          tuna_rungu?: number
          tuna_rungu_wicara?: number
          tuna_wicara?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "penduduk_disabilitas_rt_id_fkey"
            columns: ["rt_id"]
            isOneToOne: false
            referencedRelation: "rt"
            referencedColumns: ["id"]
          },
        ]
      }
      publikasi: {
        Row: {
          created_at: string
          deskripsi: string | null
          file_url: string | null
          id: string
          jenis: string
          judul: string
          tanggal_terbit: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          deskripsi?: string | null
          file_url?: string | null
          id?: string
          jenis: string
          judul: string
          tanggal_terbit?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          deskripsi?: string | null
          file_url?: string | null
          id?: string
          jenis?: string
          judul?: string
          tanggal_terbit?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      rt: {
        Row: {
          created_at: string
          dusun_id: string | null
          id: string
          jarak_ke_kantor_desa_km: number | null
          nomor_rt: string
          nomor_rw: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dusun_id?: string | null
          id?: string
          jarak_ke_kantor_desa_km?: number | null
          nomor_rt: string
          nomor_rw: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dusun_id?: string | null
          id?: string
          jarak_ke_kantor_desa_km?: number | null
          nomor_rt?: string
          nomor_rw?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rt_dusun_id_fkey"
            columns: ["dusun_id"]
            isOneToOne: false
            referencedRelation: "dusun"
            referencedColumns: ["id"]
          },
        ]
      }
      rtlh: {
        Row: {
          alamat: string | null
          bantuan_terakhir: string | null
          created_at: string
          dusun: string | null
          foto_rumah_url: string | null
          id: string
          id_rtlh: string
          jenis_atap: string | null
          jenis_dinding: string | null
          jenis_lantai: string | null
          jumlah_penghuni: number | null
          kategori_kerusakan: string | null
          keterangan: string | null
          latitude: number
          longitude: number
          luas_bangunan_m2: number | null
          nama_kepala_keluarga: string
          nik: string | null
          rt_id: string | null
          status: string | null
          status_kepemilikan: string | null
          tahun_pendataan: number | null
          updated_at: string
        }
        Insert: {
          alamat?: string | null
          bantuan_terakhir?: string | null
          created_at?: string
          dusun?: string | null
          foto_rumah_url?: string | null
          id?: string
          id_rtlh: string
          jenis_atap?: string | null
          jenis_dinding?: string | null
          jenis_lantai?: string | null
          jumlah_penghuni?: number | null
          kategori_kerusakan?: string | null
          keterangan?: string | null
          latitude: number
          longitude: number
          luas_bangunan_m2?: number | null
          nama_kepala_keluarga: string
          nik?: string | null
          rt_id?: string | null
          status?: string | null
          status_kepemilikan?: string | null
          tahun_pendataan?: number | null
          updated_at?: string
        }
        Update: {
          alamat?: string | null
          bantuan_terakhir?: string | null
          created_at?: string
          dusun?: string | null
          foto_rumah_url?: string | null
          id?: string
          id_rtlh?: string
          jenis_atap?: string | null
          jenis_dinding?: string | null
          jenis_lantai?: string | null
          jumlah_penghuni?: number | null
          kategori_kerusakan?: string | null
          keterangan?: string | null
          latitude?: number
          longitude?: number
          luas_bangunan_m2?: number | null
          nama_kepala_keluarga?: string
          nik?: string | null
          rt_id?: string | null
          status?: string | null
          status_kepemilikan?: string | null
          tahun_pendataan?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rtlh_rt_id_fkey"
            columns: ["rt_id"]
            isOneToOne: false
            referencedRelation: "rt"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          row_number: number | null
          sheet_name: string
          status: string
          timestamp: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          row_number?: number | null
          sheet_name: string
          status: string
          timestamp?: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          row_number?: number | null
          sheet_name?: string
          status?: string
          timestamp?: string
        }
        Relationships: []
      }
      umkm_karakteristik_pengusaha: {
        Row: {
          created_at: string
          id: string
          kelompok_usia: string
          laki_laki: number
          perempuan: number
          tahun: number
          total: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          kelompok_usia: string
          laki_laki?: number
          perempuan?: number
          tahun: number
          total?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          kelompok_usia?: string
          laki_laki?: number
          perempuan?: number
          tahun?: number
          total?: number
          updated_at?: string
        }
        Relationships: []
      }
      umkm_lapangan_usaha: {
        Row: {
          created_at: string
          id: string
          jumlah_umkm: number
          kode_kbli: string
          nama_lapangan_usaha: string
          tahun: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          jumlah_umkm?: number
          kode_kbli: string
          nama_lapangan_usaha: string
          tahun: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          jumlah_umkm?: number
          kode_kbli?: string
          nama_lapangan_usaha?: string
          tahun?: number
          updated_at?: string
        }
        Relationships: []
      }
      umkm_pendidikan_pengusaha: {
        Row: {
          created_at: string
          id: string
          persentase: number
          tahun: number
          tingkat_pendidikan: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          persentase?: number
          tahun: number
          tingkat_pendidikan: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          persentase?: number
          tahun?: number
          tingkat_pendidikan?: string
          updated_at?: string
        }
        Relationships: []
      }
      umkm_per_rt: {
        Row: {
          bangunan_campuran: number
          bangunan_khusus_usaha: number
          created_at: string
          di_rumah_online_keliling: number
          id: string
          jumlah_umkm: number
          rt_id: string
          tahun: number
          updated_at: string
        }
        Insert: {
          bangunan_campuran?: number
          bangunan_khusus_usaha?: number
          created_at?: string
          di_rumah_online_keliling?: number
          id?: string
          jumlah_umkm?: number
          rt_id: string
          tahun: number
          updated_at?: string
        }
        Update: {
          bangunan_campuran?: number
          bangunan_khusus_usaha?: number
          created_at?: string
          di_rumah_online_keliling?: number
          id?: string
          jumlah_umkm?: number
          rt_id?: string
          tahun?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "umkm_per_rt_rt_id_fkey"
            columns: ["rt_id"]
            isOneToOne: false
            referencedRelation: "rt"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      kependudukan_ringkasan: {
        Row: {
          budha: number | null
          hindu: number | null
          islam: number | null
          katolik: number | null
          lainnya: number | null
          laki_laki: number | null
          perempuan: number | null
          protestan: number | null
          tahun: number | null
          total_penduduk: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
