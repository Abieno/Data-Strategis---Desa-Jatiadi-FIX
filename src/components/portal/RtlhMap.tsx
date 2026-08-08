import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
// Worker MapLibre di-bundel oleh Vite dan dipasang eksplisit. Tanpa ini, di
// hosting produksi (mis. Vercel) URL worker default bisa 404 sehingga SEMUA
// sumber GeoJSON (batas desa + titik RTLH) gagal diproses, walau basemap muncul.
import maplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
// GeoJSON batas desa diimpor (ikut ke bundle) agar tidak bergantung pada
// fetch ke /geojson/... yang bisa tidak tersedia di hosting produksi.
import boundaryRaw from "@/assets/jatiadi.geojson?raw";
import type { FeatureCollection, Point, } from "geojson";

maplibregl.setWorkerUrl(maplibreWorkerUrl);

// =============================================================================
// Tipe data
// =============================================================================

export type RtlhPoint = {
  latkoordinat: number;
  longkoordinat: number;
  foto_url: string | null;
};

interface RtlhMapProps {
  points: RtlhPoint[];
}

// =============================================================================
// Konstanta
// =============================================================================

const BOUNDARY_GEOJSON = JSON.parse(boundaryRaw) as FeatureCollection;
const BOUNDARY_SOURCE_ID = "village-boundary";
const BOUNDARY_FILL_LAYER_ID = "village-boundary-fill";
const BOUNDARY_OUTLINE_LAYER_ID = "village-boundary-outline";

const RTLH_SOURCE_ID = "rtlh-source";
const RTLH_LAYER_ID = "rtlh-layer";

const DEFAULT_CENTER: [number, number] = [113.351, -7.789];
const DEFAULT_ZOOM = 14;

// =============================================================================
// Util: titik RTLH -> GeoJSON FeatureCollection
// =============================================================================

function toRtlhFeatureCollection(points: RtlhPoint[]): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: points
      .filter((p) => Number.isFinite(p.latkoordinat) && Number.isFinite(p.longkoordinat))
      .map((point) => ({
        type: "Feature",
        properties: { foto_url: point.foto_url },
        geometry: { type: "Point", coordinates: [point.longkoordinat, point.latkoordinat] },
      })),
  };
}

// ---------------------------------------------------------------------------
// fitBounds ke seluruh titik RTLH (dipakai saat data pertama kali datang).
// ---------------------------------------------------------------------------
function fitToRtlhPoints(map: maplibregl.Map, points: RtlhPoint[]) {
  const valid = points.filter(
    (p) =>
      Number.isFinite(p.latkoordinat) &&
      Number.isFinite(p.longkoordinat)
  );

  if (valid.length === 0) return;

  if (valid.length === 1) {
    const p = valid[0]!;

    map.flyTo({
      center: [p.longkoordinat, p.latkoordinat],
      zoom: 17,
    });

    return;
  }

  const bounds = new maplibregl.LngLatBounds();

  valid.forEach((p) => {
    bounds.extend([p.longkoordinat, p.latkoordinat]);
  });

  map.fitBounds(bounds, {
    padding: 80,
    duration: 600,
    maxZoom: 17,
  });
}

// =============================================================================
// Util: hitung bounds dari geometry GeoJSON apa pun (Polygon/MultiPolygon/dll)
// =============================================================================

function collectCoordinates(node: unknown, out: [number, number][]): void {
  if (Array.isArray(node) && typeof node[0] === "number" && typeof node[1] === "number") {
    out.push([node[0] as number, node[1] as number]);
    return;
  }
  if (Array.isArray(node)) node.forEach((child) => collectCoordinates(child, out));
}

function boundsFromFeatureCollection(data: FeatureCollection): maplibregl.LngLatBounds | null {
  const coords: [number, number][] = [];
  data.features.forEach((feature) => collectCoordinates(feature.geometry, coords));
  if (coords.length === 0) return null;

  const bounds = new maplibregl.LngLatBounds(coords[0], coords[0]);
  coords.forEach((c) => bounds.extend(c));
  return bounds;
}

// =============================================================================
// Komponen utama
// =============================================================================

export default function RtlhMap({ points }: RtlhMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);

  // ---------------------------------------------------------------------------
  // Inisialisasi peta (sekali saja).
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      // Dibatasi zoom 17 karena citra satelit Esri untuk wilayah Jatiadi
      // tidak tersedia di zoom 18+, yang justru menampilkan tulisan
      // "Map data not yet available".
      maxZoom: 17,
      style: {
        version: 8,
        sources: {
          // Lapisan dasar OSM sebagai fallback bila tile satelit Esri
          // tidak tersedia di area/zoom tertentu.
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            maxzoom: 19,
            attribution: "&copy; OpenStreetMap contributors",
          },
          esri: {
            type: "raster",
            tiles: [
              "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            ],
            tileSize: 256,
            maxzoom: 17,
            attribution: "Tiles &copy; Esri",
          },
        },
        layers: [
          { id: "osm", type: "raster", source: "osm" },
          { id: "esri", type: "raster", source: "esri" },
        ],
      },
    });

    mapRef.current = map;

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    map.addControl(new maplibregl.FullscreenControl(), "top-right");
    map.addControl(new maplibregl.GeolocateControl({}), "top-right");

    map.on("load", () => {
      // --- Titik RTLH (circle layer) ---
      map.addSource(RTLH_SOURCE_ID, { type: "geojson", data: toRtlhFeatureCollection(points) });
      map.addLayer({
        id: RTLH_LAYER_ID,
        type: "circle",
        source: RTLH_SOURCE_ID,
        paint: {
          "circle-radius": 7,
          "circle-color": "#ef4444",
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });

      map.on("mouseenter", RTLH_LAYER_ID, () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", RTLH_LAYER_ID, () => {
        map.getCanvas().style.cursor = "";
      });

      // Klik titik -> popup berisi foto saja.
      map.on("click", RTLH_LAYER_ID, (event) => {
        const feature = event.features?.[0];
        if (!feature || feature.geometry.type !== "Point") return;

        const geometry = feature.geometry as Point;
        const coordinates = geometry.coordinates as [number, number];
        const [lng, lat] = coordinates;
        const properties = feature.properties as {
          foto_url?: string;
        };

        const fotoUrl = properties?.foto_url ?? null;;

        const content = document.createElement("div");
        if (fotoUrl) {
          const img = document.createElement("img");
          img.src = fotoUrl;
          img.alt = "Foto rumah";
          img.style.cssText = "width:250px;height:180px;object-fit:cover;display:block;border-radius:12px;";
          content.appendChild(img);
        } else {
          content.textContent = "Tidak ada foto";
          content.style.cssText = "width:200px;padding:16px;text-align:center;font-size:13px;color:#4b5563;";
        }

        popupRef.current?.remove();
        popupRef.current = new maplibregl.Popup({ closeOnClick: true, maxWidth: "270px" })
          .setLngLat([lng as number, lat as number])
          .setDOMContent(content)
          .addTo(map);
      });

      fitToRtlhPoints(map, points);

      // --- Batas desa (data ikut ke bundle, tidak perlu fetch) ---
      try {
        const geojson = BOUNDARY_GEOJSON;
        map.addSource(BOUNDARY_SOURCE_ID, { type: "geojson", data: geojson });

        // beforeId = RTLH_LAYER_ID -> batas desa digambar DI BAWAH titik RTLH,
        // supaya titik rumah selalu terlihat di atas.
        map.addLayer(
          {
            id: BOUNDARY_FILL_LAYER_ID,
            type: "fill",
            source: BOUNDARY_SOURCE_ID,
            paint: { "fill-color": "#f97316", "fill-opacity": 0.08 },
          },
          RTLH_LAYER_ID
        );
        map.addLayer(
          {
            id: BOUNDARY_OUTLINE_LAYER_ID,
            type: "line",
            source: BOUNDARY_SOURCE_ID,
            paint: { "line-color": "#dc2626", "line-width": 3 },
          },
          RTLH_LAYER_ID
        );

        const bounds = boundsFromFeatureCollection(geojson);
        if (bounds) map.fitBounds(bounds, { padding: 40, duration: 0 });
      } catch (error: unknown) {
        console.error("[RtlhMap] Gagal menampilkan batas desa:", error);
      }
    });

    return () => {
      popupRef.current?.remove();
      popupRef.current = null;
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------------
  // Perbarui titik RTLH setiap kali props.points berubah (termasuk saat data
  // pertama kali datang dari Supabase setelah peta selesai / belum selesai load).
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return undefined;

    const applyPoints = () => {
      const source = map.getSource(RTLH_SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
      if (!source) return;
      source.setData(toRtlhFeatureCollection(points));
      fitToRtlhPoints(map, points);
    };

    if (map.isStyleLoaded() && map.getSource(RTLH_SOURCE_ID)) {
      applyPoints();
      return undefined;
    }

    map.once("load", applyPoints);
    return () => {
      map.off("load", applyPoints);
    };
  }, [points]);

  return <div ref={containerRef} className="h-[560px] w-full overflow-hidden rounded-xl border" />;
}
