"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import Image from "next/image";
import L from "leaflet";
import { getDb, saveDb } from "@/db/client";
import {
  getCachedGeocoding,
  saveGeocodingCache,
  type Coords,
} from "@/db/queries";
import { normalizeAddressKey } from "@/lib/address";
import { type DataSource } from "./SourceBadge";

// Leaflet can't resolve its own assets under module bundlers; serve from /public/ for a stable URL.
const markerIcon = L.icon({
  iconUrl: "/leaflet/marker-icon.png",
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  shadowUrl: "/leaflet/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

type MapStatus = "loading" | "ok" | "error";

async function fetchCoords(address: string): Promise<Coords> {
  const res = await fetch(`/api/geocode?q=${encodeURIComponent(address)}`);
  if (!res.ok) throw new Error(`Geocoding returned ${res.status}`);
  return res.json() as Promise<Coords>;
}

/**
 * Displays an interactive Mapy.com map for the given address.
 * Checks the local SQLite geocoding cache before calling the Mapy.com API.
 *
 * @param address - Human-readable address string used as the geocoding query.
 * @param onSourceChangeAction - Optional callback fired once the data source is resolved.
 * @returns Map with marker, coordinates, and a link to Mapy.com.
 */
export default function FirmaMap({
  address,
  onSourceChangeAction,
}: {
  address: string;
  onSourceChangeAction?: (source: DataSource) => void;
}) {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [status, setStatus] = useState<MapStatus>("loading");
  const [source, setSource] = useState<DataSource>("api");

  useEffect(() => {
    let cancelled = false;
    const key = normalizeAddressKey(address);

    async function load() {
      const db = await getDb();

      const cached = getCachedGeocoding(db, key);
      if (cached) {
        if (!cancelled) {
          setCoords(cached);
          setSource("cache");
          setStatus("ok");
          onSourceChangeAction?.("cache");
        }
        return;
      }

      try {
        const result = await fetchCoords(address);
        if (cancelled) return;
        saveGeocodingCache(db, key, result);
        await saveDb();
        setCoords(result);
        setSource("api");
        setStatus("ok");
        onSourceChangeAction?.("api");
      } catch (err) {
        console.error("[FirmaMap] Geocoding failed:", err);
        if (!cancelled) setStatus("error");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [address, onSourceChangeAction]);

  const tileApiKey = process.env.NEXT_PUBLIC_MAP_API_KEY ?? "";
  const tileUrl = `https://api.mapy.com/v1/maptiles/basic/256/{z}/{x}/{y}?apikey=${tileApiKey}`;

  if (status === "loading") {
    return (
      <p aria-live="polite" className="text-sm text-zinc-500 dark:text-zinc-400">Načítám mapu…</p>
    );
  }

  if (status === "error" || !coords) {
    return (
      <p className="text-sm text-zinc-400 dark:text-zinc-500">
        Polohu sídla se nepodařilo zobrazit na mapě.
      </p>
    );
  }

  const mapyLink = `https://mapy.com/@${coords.lat},${coords.lng},15z`;

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <MapContainer
          center={[coords.lat, coords.lng]}
          zoom={15}
          scrollWheelZoom={false}
          className="h-64 w-full rounded-lg"
        >
          <TileLayer
            url={tileUrl}
            attribution='&copy; <a href="https://mapy.com/">Mapy.com</a>'
          />
          <Marker position={[coords.lat, coords.lng]} icon={markerIcon} />
        </MapContainer>
        {/* Required by Mapy.com terms of service when using their tile layer */}
        <a
          href="https://mapy.com"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-2 left-2 z-1000"
        >
          <Image
            src="https://api.mapy.com/img/api/logo.svg"
            alt="Mapy.com"
            width={89}
            height={30}
            unoptimized
          />
        </a>
      </div>
      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
        <span>
          {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
        </span>
        <a
          href={mapyLink}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-sm underline-offset-2 hover:text-zinc-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-1 dark:hover:text-zinc-100 dark:focus-visible:ring-zinc-400"
        >
          Otevřít v Mapy.com →
        </a>
      </div>
    </div>
  );
}
