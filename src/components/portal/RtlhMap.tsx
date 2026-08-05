import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export type RtlhPoint = {
  id: string;
  id_rtlh: string;
  nama_kepala_keluarga: string;
  dusun: string | null;
  alamat: string | null;
  latitude: number;
  longitude: number;
  kategori_kerusakan: string | null;
  status: string | null;
  foto_rumah_url: string | null;
};

const COLORS: Record<string, string> = {
  "Rusak Berat": "#dc2626",
  "Rusak Sedang": "#ea802a",
  "Rusak Ringan": "#16a34a",
};

export default function RtlhMap({ points }: { points: RtlhPoint[] }) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (!container.current || map.current) return;
    map.current = new maplibregl.Map({
      container: container.current,
      style: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
      center: [113.2233, -7.809],
      zoom: 14.5,
    });
    map.current.addControl(new maplibregl.NavigationControl(), "top-right");
    map.current.addControl(new maplibregl.FullscreenControl(), "top-right");
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    const m = map.current;
    if (!m) return;
    markers.current.forEach((mk) => mk.remove());
    markers.current = [];
    if (!points.length) return;

    const bounds = new maplibregl.LngLatBounds();
    points.forEach((p) => {
      const el = document.createElement("div");
      el.style.cssText = `width:16px;height:16px;border-radius:9999px;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35);background:${
        COLORS[p.kategori_kerusakan ?? ""] ?? "#ea802a"
      }`;
      const popup = new maplibregl.Popup({ offset: 16, maxWidth: "260px" }).setHTML(`
        <div style="font-family:inherit;font-size:12px;line-height:1.45">
          ${p.foto_rumah_url ? `<img src="${p.foto_rumah_url}" alt="Foto rumah ${p.nama_kepala_keluarga}" style="width:100%;height:120px;object-fit:cover;border-radius:8px;margin-bottom:8px" />` : ""}
          <strong style="font-size:13px">${p.nama_kepala_keluarga}</strong><br/>
          <span style="color:#666">${p.id_rtlh}</span><br/>
          <span>${p.dusun ?? "-"} · ${p.alamat ?? "-"}</span><br/>
          <span>Kerusakan: <strong>${p.kategori_kerusakan ?? "-"}</strong></span><br/>
          <span>Status: ${p.status ?? "-"}</span>
        </div>`);
      const marker = new maplibregl.Marker({ element: el }).setLngLat([p.longitude, p.latitude]).setPopup(popup).addTo(m);
      markers.current.push(marker);
      bounds.extend([p.longitude, p.latitude]);
    });
    m.fitBounds(bounds, { padding: 60, maxZoom: 16, duration: 600 });
  }, [points]);

  return <div ref={container} className="h-[560px] w-full overflow-hidden rounded-xl border" />;
}
