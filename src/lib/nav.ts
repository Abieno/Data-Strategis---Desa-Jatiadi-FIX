import {
  Home,
  Landmark,
  Users,
  HeartHandshake,
  Accessibility,
  GraduationCap,
  Stethoscope,
  CloudLightning,
  Baby,
  Store,
  Building2,
  Map as MapIcon,
  FileText,
  BookOpen,
  Download,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  description: string;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const navGroups: NavGroup[] = [
  {
    label: "Utama",
    items: [
      { title: "Beranda", url: "/", icon: Home, description: "Ringkasan data strategis desa" },
      { title: "Profil Desa", url: "/profil-desa", icon: Landmark, description: "Wilayah, dusun, dan RT" },
    ],
  },
  {
    label: "Statistik Sosial",
    items: [
      { title: "Kependudukan", url: "/kependudukan", icon: Users, description: "Jumlah penduduk & agama per RT" },
      { title: "Keluarga", url: "/keluarga", icon: HeartHandshake, description: "Karakteristik keluarga & listrik" },
      { title: "Disabilitas", url: "/disabilitas", icon: Accessibility, description: "Penduduk penyandang disabilitas" },
      { title: "Pendidikan", url: "/pendidikan", icon: GraduationCap, description: "Sekolah, guru, dan murid" },
      { title: "Kesehatan", url: "/kesehatan", icon: Stethoscope, description: "Fasilitas & tenaga kesehatan" },
      { title: "Bencana", url: "/bencana", icon: CloudLightning, description: "Kejadian bencana alam per RT" },
      { title: "Gizi", url: "/gizi", icon: Baby, description: "Status gizi balita per RT" },
    ],
  },
  {
    label: "Ekonomi",
    items: [
      { title: "Ekonomi", url: "/ekonomi", icon: Building2, description: "Fasilitas ekonomi desa" },
      { title: "UMKM", url: "/umkm", icon: Store, description: "Usaha mikro, kecil, dan menengah" },
    ],
  },
  {
    label: "Spasial",
    items: [
      { title: "Peta Tematik", url: "/peta-tematik", icon: MapIcon, description: "Peta interaktif layer RTLH" },
    ],
  },
  {
    label: "Publikasi & Data",
    items: [
      { title: "Publikasi", url: "/publikasi", icon: FileText, description: "Dokumen, laporan, infografis" },
      { title: "Metadata", url: "/metadata", icon: BookOpen, description: "Definisi & sumber indikator" },
      { title: "Download Data", url: "/download-data", icon: Download, description: "Unduh seluruh tabel indikator" },
    ],
  },
];

export const allNavItems: NavItem[] = navGroups.flatMap((g) => g.items);
