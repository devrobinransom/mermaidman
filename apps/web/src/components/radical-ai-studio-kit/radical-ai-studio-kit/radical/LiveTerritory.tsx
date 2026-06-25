"use client";
import React, { useMemo } from "react";
import { World } from "@frappe-ui/neobrutalism";
import { Card, Badge } from "@frappe-ui/neobrutalism";
import { IconMapPin, IconAccessPoint, IconWifi } from "@tabler/icons-react";

interface LiveTerritoryProps {
    leadLocation?: { lat: number; lng: number; name: string };
    hqLocation?: { lat: number; lng: number; name: string };
}

export function LiveTerritory({
    leadLocation = { lat: 40.7128, lng: -74.0060, name: "New York" },
    hqLocation = { lat: 37.7749, lng: -122.4194, name: "San Francisco" }
}: LiveTerritoryProps) {

    // Fun Fallback: If "Unknown", move to Arctic Secret Bunker
    const effectiveLocation = useMemo(() => {
        if (!leadLocation.name || leadLocation.name === "Unknown Territory" || leadLocation.name.includes("Unknown")) {
            return {
                lat: 82.8628,
                lng: -135.0000,
                name: "Secret Arctic Bunker (Unknown)"
            };
        }
        return leadLocation;
    }, [leadLocation]);

    // 1. Arc Generation: SOTA logic ("The Strokes")
    // We create a primary "active" connection + background "network traffic"
    const arcs = useMemo(() => {
        const primaryArc = {
            order: 1,
            startLat: hqLocation.lat,
            startLng: hqLocation.lng,
            endLat: effectiveLocation.lat,
            endLng: effectiveLocation.lng,
            arcAlt: 0.3,
            color: "#d946ef", // Fuchsia-500 (Primary Active Link)
        };

        // Simulated "Global Traffic" noise to make the world feel alive
        const ambientArcs = Array.from({ length: 15 }).map((_, i) => ({
            order: 2 + i,
            startLat: (Math.random() * 180) - 90,
            startLng: (Math.random() * 360) - 180,
            endLat: (Math.random() * 180) - 90,
            endLng: (Math.random() * 360) - 180,
            arcAlt: 0.1 + (Math.random() * 0.3),
            color: "#38bdf820", // Sky-400 with very low opacity (Ghost traffic)
        }));

        return [primaryArc, ...ambientArcs];
    }, [leadLocation, hqLocation]);

    // 2. Active Rings (Sonar Pings at locations)
    const rings = [
        // Ring at Lead Location (Target)
        {
            lat: effectiveLocation.lat,
            lng: effectiveLocation.lng,
            color: "#d946ef", // Match primary arc
        },
        // Ring at HQ (Source)
        {
            lat: hqLocation.lat,
            lng: hqLocation.lng,
            color: "#38bdf8", // Blue for HQ
        }
    ];

    // 3. Globe Configuration (SOTA Quality)
    const globeConfig = {
        pointSize: 4,
        globeColor: "#050505", // Vantablack look
        showAtmosphere: true,
        atmosphereColor: "#7c3aed", // Violet atmosphere
        atmosphereAltitude: 0.15,
        emissive: "#1e1b4b", // Deep Indigo emissive
        emissiveIntensity: 0.3,
        shininess: 0.9,
        polygonColor: "rgba(255,255,255,0.8)", // Bright continents
        ambientLight: "#38bdf8",
        directionalLeftLight: "#ffffff",
        directionalTopLight: "#ffffff",
        pointLight: "#ffffff",
        arcTime: 1200, // Faster, energetic
        arcLength: 0.9,
        rings: 2,
        maxRings: 4,
        initialPosition: { lat: (hqLocation.lat + effectiveLocation.lat) / 2, lng: (hqLocation.lng + effectiveLocation.lng) / 2 },
        autoRotate: true,
        autoRotateSpeed: 0.3,
    };

    // Helper: Calculate distance (Haversine approximation)
    const distanceKm = Math.round(
        6371 * Math.acos(
            Math.cos(hqLocation.lat * Math.PI / 180) *
            Math.cos(effectiveLocation.lat * Math.PI / 180) *
            Math.cos((effectiveLocation.lng - hqLocation.lng) * Math.PI / 180) +
            Math.sin(hqLocation.lat * Math.PI / 180) *
            Math.sin(effectiveLocation.lat * Math.PI / 180)
        )
    );

    return (
        <Card className="w-full h-[500px] overflow-hidden relative border-0 bg-black group">

            {/* --- HUD Layer (The "Iron Man" Interface) --- */}

            {/* Top Left: Identification */}
            <div className="absolute top-6 left-6 z-20 pointer-events-none">
                <Badge variant="outline" className="bg-purple-950/30 backdrop-blur-md text-purple-300 border-purple-800/50 mb-3 px-3 py-1">
                    <span className="relative flex h-2 w-2 mr-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                    </span>
                    LIVE TERRITORY
                </Badge>
                <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-500 tracking-tighter">
                    {effectiveLocation.name.toUpperCase()}
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mt-1">
                    <IconMapPin size={12} /> {effectiveLocation.lat.toFixed(4)}° N, {effectiveLocation.lng.toFixed(4)}° W
                </div>
            </div>

            {/* Top Right: Connection Telemetry */}
            <div className="absolute top-6 right-6 z-20 pointer-events-none text-right">
                <div className="flex flex-col gap-2">
                    <div className="bg-black/40 backdrop-blur-sm border border-white/10 p-3 rounded-lg">
                        <div className="text-[10px] uppercase text-neutral-500 font-bold mb-1 tracking-widest">Signal Strength</div>
                        <div className="flex items-center justify-end gap-2 text-emerald-400 font-mono text-sm">
                            <IconWifi size={14} /> Excellent (98%)
                        </div>
                    </div>
                    <div className="bg-black/40 backdrop-blur-sm border border-white/10 p-3 rounded-lg">
                        <div className="text-[10px] uppercase text-neutral-500 font-bold mb-1 tracking-widest">Geodesic Distance</div>
                        <div className="flex items-center justify-end gap-2 text-cyan-300 font-mono text-sm">
                            <IconAccessPoint size={14} /> {distanceKm.toLocaleString()} km
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar: Status Stream */}
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black via-black/80 to-transparent z-20 flex items-center px-6">
                <div className="font-mono text-[10px] text-neutral-600 flex gap-8 w-full">
                    <span>STATUS: MONITORING_ACTIVE</span>
                    <span>ENCRYPTION: AES-256</span>
                    <span className="hidden sm:inline">DATA_STREAM: STABLE</span>
                    <span className="ml-auto text-purple-500/50">RADICAL_UX_ENGINE_V3</span>
                </div>
            </div>

            {/* --- The Globe Engine --- */}
            <div className="absolute inset-0 h-full w-full bg-transparent z-10">
                <World globeConfig={globeConfig} data={arcs} />
            </div>

            {/* --- Cyber Overlays --- */}
            {/* Scanlines */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,20,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[15] bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20" />

            {/* Vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.8)_100%)] z-[15] pointer-events-none" />

        </Card>
    );
}
