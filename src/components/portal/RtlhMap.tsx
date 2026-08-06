import { useEffect, useMemo, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { FeatureCollection, Geometry } from "geojson";

// ============================================================================
// Types (tidak diubah — kontrak dari komponen parent)
// ============================================================================

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

type RtlhMapProps = {
  points: RtlhPoint[];
};

type BaseLayerId = "satellite" | "osm";

// ============================================================================
// Konstanta
// ============================================================================

const VILLAGE_GEOJSON_URL = "/geojson/jatiadi.geojson";
const VILLAGE_LABEL = "Desa Jatiadi";
const VILLAGE_FILL_COLOR = "#ff9800";
const VILLAGE_OUTLINE_COLOR = "#ff3b30";

const MIN_ZOOM = 2;
const MAX_ZOOM = 20;
const DEFAULT_CENTER: [number, number] = [113.2233, -7.809];
const DEFAULT_ZOOM = 14;

const MARKER_SIZE_PX = 22;

const DAMAGE_COLORS: Record<string, string> = {
  "Rusak Berat": "#dc2626",
  "Rusak Sedang": "#f97316",
  "Rusak Ringan": "#16a34a",
};
const DEFAULT_MARKER_COLOR = "#6b7280";

// Placeholder rumah (SVG inline) — dipakai saat foto kosong atau gagal dimuat,
// supaya tidak bergantung pada aset eksternal yang bisa hilang.
const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 120">
      <rect width="200" height="120" fill="#e5e7eb"/>
      <path d="M100 28 L160 68 H145 V96 H55 V68 H40 Z" fill="#9ca3af"/>
      <rect x="90" y="76" width="20" height="20" fill="#e5e7eb"/>
    </svg>
  `);

// Sumber glyph publik (dipakai OpenMapTiles/MapLibre demo) supaya label teks
// (mis. nama desa) bisa dirender tanpa perlu meng-host font sendiri.
const GLYPHS_URL = "https://fonts.openmaptiles.org/{fontstack}/{range}.pbf";

// ============================================================================
// Util: ekstraksi bounding box dari GeoJSON / titik, tanpa dependency tambahan
// ============================================================================

function extendBoundsWithGeometry(bounds: maplibregl.LngLatBounds, geometry: Geometry | null | undefined): void {
  if (!geometry) return;
  const coordinates = (geometry as { coordinates?: unknown }).coordinates;

  const walk = (node: unknown): void => {
    if (!Array.isArray(node)) return;
    const [a, b] = node;
    if (typeof a === "number" && typeof b === "number") {
      bounds.extend([a, b]);
      return;
    }
    node.forEach(walk);
  };

  walk(coordinates);
}

function boundsFromFeatureCollection(collection: FeatureCollection): maplibregl.LngLatBounds | null {
  const bounds = new maplibregl.LngLatBounds();
  let hasAny = false;

  collection.features.forEach((feature) => {
    if (feature.geometry) {
      extendBoundsWithGeometry(bounds, feature.geometry);
      hasAny = true;
    }
  });

  return hasAny ? bounds : null;
}

function boundsFromPoints(points: RtlhPoint[]): maplibregl.LngLatBounds | null {
  if (points.length === 0) return null;
  const bounds = new maplibregl.LngLatBounds();
  points.forEach((p) => bounds.extend([p.longitude, p.latitude]));
  return bounds;
}

// ============================================================================
// Util: signature ringan untuk deteksi perubahan data (hindari rebuild marker
// kalau isi datanya sama walau reference array-nya beda).
// ============================================================================

function computePointsSignature(points: RtlhPoint[]): string {
  return points
    .map(
      (p) =>
        `${p.id}:${p.latitude}:${p.longitude}:${p.kategori_kerusakan ?? ""}:${p.status ?? ""}:${
          p.foto_rumah_url ?? ""
        }`,
    )
    .join("|");
}

// ============================================================================
// Util: bangun konten HTML popup
// ============================================================================

function buildPopupHtml(point: RtlhPoint): string {
  const photoSrc = point.foto_rumah_url && point.foto_rumah_url.trim() !== "" ? point.foto_rumah_url : PLACEHOLDER_IMAGE;
  const kategori = point.kategori_kerusakan ?? "Tidak diketahui";
  const color = DAMAGE_COLORS[kategori] ?? DEFAULT_MARKER_COLOR;

  return `
    <div class="w-[78vw] max-w-[280px] sm:w-72 overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-black/5 font-sans text-sm">
      <img
        src="${photoSrc}"
        alt="Foto rumah ${escapeHtml(point.nama_kepala_keluarga)}"
        class="h-32 w-full object-cover"
        onerror="this.onerror=null;this.src='${PLACEHOLDER_IMAGE}'"
      />
      <div class="space-y-1.5 p-3">
        <div class="flex items-center justify-between gap-2">
          <span class="truncate font-semibold text-gray-900">${escapeHtml(point.nama_kepala_keluarga)}</span>
          <span
            class="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium text-white"
            style="background:${color}"
          >${escapeHtml(kategori)}</span>
        </div>
        <div class="text-xs text-gray-500">${escapeHtml(point.id_rtlh)}</div>
        <div class="text-xs text-gray-700">
          ${escapeHtml(point.dusun ?? "-")} &middot; ${escapeHtml(point.alamat ?? "-")}
        </div>
        <div class="text-xs text-gray-700">
          Status: <span class="font-medium">${escapeHtml(point.status ?? "-")}</span>
        </div>
      </div>
    </div>
  `;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ============================================================================
// Util: muat batas desa (GeoJSON), toleran terhadap kegagalan
// ============================================================================

async function loadVillageBoundary(mapInstance: maplibregl.Map): Promise<maplibregl.LngLatBounds | null> {
  try {
    const response = await fetch(VILLAGE_GEOJSON_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = (await response.json()) as FeatureCollection;

    if (!mapInstance.getSource("desa")) {
      mapInstance.addSource("desa", { type: "geojson", data });

      mapInstance.addLayer({
        id: "desa-fill",
        type: "fill",
        source: "desa",
        paint: {
          "fill-color": VILLAGE_FILL_COLOR,
          "fill-opacity": 0.08,
        },
      });

      mapInstance.addLayer({
        id: "desa-outline",
        type: "line",
        source: "desa",
        paint: {
          "line-color": VILLAGE_OUTLINE_COLOR,
          "line-width": 4,
        },
      });

      // symbol-placement default MapLibre untuk geometry Polygon otomatis
      // menaruh label di titik tengah visual poligon (tanpa perlu hitung centroid manual).
      mapInstance.addLayer({
        id: "desa-label",
        type: "symbol",
        source: "desa",
        layout: {
          "text-field": VILLAGE_LABEL,
          "text-size": 16,
          "text-anchor": "center",
        },
        paint: {
          "text-color": "#ffffff",
          "text-halo-color": "rgba(0,0,0,0.55)",
          "text-halo-width": 1.4,
        },
      });
    }

    return boundsFromFeatureCollection(data);
  } catch (err) {
    // Gagal muat batas desa tidak boleh meruntuhkan peta — cukup dicatat.
    console.warn("[RtlhMap] Gagal memuat batas desa:", err);
    return null;
  }
}

// ============================================================================
// Komponen utama
// ============================================================================

export default function RtlhMap({ points }: RtlhMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const openPopupRef = useRef<maplibregl.Popup | null>(null);

  const villageBoundsRef = useRef<maplibregl.LngLatBounds | null>(null);
  const initialFitDoneRef = useRef(false);
  const maybeFitInitialViewRef = useRef<((m: maplibregl.Map) => void) | null>(null);
  const lastSignatureRef = useRef<string>("");
  const pointsRef = useRef<RtlhPoint[]>(points);
  pointsRef.current = points;

  const [activeLayer, setActiveLayer] = useState<BaseLayerId>("satellite");

  const pointsSignature = useMemo(() => computePointsSignature(points), [points]);

  // --- Inisialisasi peta (hanya sekali) ------------------------------------
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      attributionControl: false,
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      style: {
        version: 8,
        glyphs: GLYPHS_URL,
        sources: {
          satellite: {
            type: "raster",
            tiles: [
              "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            ],
            tileSize: 256,
          },
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
          },
        },
        layers: [
          {
            id: "satellite",
            type: "raster",
            source: "satellite",
            layout: { visibility: "visible" },
          },
          {
            id: "osm",
            type: "raster",
            source: "osm",
            layout: { visibility: "none" },
          },
        ],
      },
    });

    mapRef.current = map;

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    map.addControl(new maplibregl.FullscreenControl(), "top-right");
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 120, unit: "metric" }), "bottom-left");
    map.addControl(
      new maplibregl.AttributionControl({
        compact: true,
        customAttribution: [
          "&copy; OpenStreetMap contributors",
          "Esri World Imagery",
          "Data Strategis Desa Jatiadi",
        ],
      }),
      "bottom-right",
    );

    // Tile/style error tidak boleh membuat aplikasi crash.
    map.on("error", (e) => {
      console.warn("[RtlhMap] Map error:", e.error?.message ?? e);
    });

    map.on("load", () => {
      void loadVillageBoundary(map).then((bounds) => {
        villageBoundsRef.current = bounds;
        maybeFitInitialView(map);
      });
    });

    function maybeFitInitialView(mapInstance: maplibregl.Map): void {
      if (initialFitDoneRef.current) return;

      // Prioritas: batas polygon desa (kalau ada) > bounding box seluruh marker.
      const preferredBounds = villageBoundsRef.current ?? boundsFromPoints(pointsRef.current);
      if (!preferredBounds) return;

      mapInstance.fitBounds(preferredBounds, { padding: 56, maxZoom: 16, duration: 0 });
      initialFitDoneRef.current = true;
    }
    maybeFitInitialViewRef.current = maybeFitInitialView;

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      openPopupRef.current?.remove();
      openPopupRef.current = null;
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- peta memang hanya dibuat sekali
  }, []);

  // --- Layer switch: Satelit / Jalan --------------------------------------
  const handleSelectLayer = (layer: BaseLayerId): void => {
    setActiveLayer(layer);
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    map.setLayoutProperty("satellite", "visibility", layer === "satellite" ? "visible" : "none");
    map.setLayoutProperty("osm", "visibility", layer === "osm" ? "visible" : "none");
  };

  // --- Render ulang marker saat data berubah ------------------------------
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Guard performa: hindari membangun ulang marker kalau isi data sebenarnya sama.
    if (lastSignatureRef.current === pointsSignature) return;
    lastSignatureRef.current = pointsSignature;

    const rebuild = (): void => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      openPopupRef.current = null;

      points.forEach((point) => {
        const color = DAMAGE_COLORS[point.kategori_kerusakan ?? ""] ?? DEFAULT_MARKER_COLOR;

        const el = document.createElement("div");
        el.style.width = `${MARKER_SIZE_PX}px`;
        el.style.height = `${MARKER_SIZE_PX}px`;
        el.style.borderRadius = "9999px";
        el.style.border = "2px solid #ffffff";
        el.style.boxShadow = "0 1px 4px rgba(0,0,0,0.35)";
        el.style.background = color;
        el.style.cursor = "pointer";
        el.style.transition = "transform 150ms ease";
        el.addEventListener("mouseenter", () => {
          el.style.transform = "scale(1.35)";
        });
        el.addEventListener("mouseleave", () => {
          el.style.transform = "scale(1)";
        });

        const popup = new maplibregl.Popup({
          offset: MARKER_SIZE_PX / 2 + 6,
          maxWidth: "300px",
          closeButton: true,
          closeOnClick: true,
        }).setHTML(buildPopupHtml(point));

        // Auto-close: tutup popup lain yang sedang terbuka saat popup baru dibuka.
        popup.on("open", () => {
          if (openPopupRef.current && openPopupRef.current !== popup) {
            openPopupRef.current.remove();
          }
          openPopupRef.current = popup;
        });
        popup.on("close", () => {
          if (openPopupRef.current === popup) openPopupRef.current = null;
        });

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([point.longitude, point.latitude])
          .setPopup(popup)
          .addTo(map);

        markersRef.current.push(marker);
      });

      const maybeFit = maybeFitInitialViewRef.current;
      maybeFit?.(map);
    };

    if (map.isStyleLoaded()) {
      rebuild();
    } else {
      map.once("load", rebuild);
    }
  }, [points, pointsSignature]);

  return (
    <div className="relative h-[560px] w-full overflow-hidden rounded-xl border">
      <div ref={containerRef} className="h-full w-full" />

      {/* Layer switch */}
      <div className="absolute left-3 top-3 z-10 flex overflow-hidden rounded-lg border border-black/10 bg-white/95 text-xs font-medium shadow-md backdrop-blur">
        <button
          type="button"
          onClick={() => handleSelectLayer("satellite")}
          className={`border-r border-black/10 px-3 py-1.5 transition-colors hover:bg-gray-100 ${
            activeLayer === "satellite" ? "bg-orange-600 text-white hover:bg-orange-600" : "text-gray-700"
          }`}
        >
          Satelit
        </button>
      </div>
    </div>
  );
}
