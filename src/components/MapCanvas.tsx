import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Flight } from '../types';
import { WINTERSWEILER_CENTER, MAP_CENTER } from '../data/geoData';
import { FlightTooltip } from './FlightTooltip';
import { fetchClientFlights } from '../utils/clientFlightFetcher';
import { getAircraftIconPath } from '../utils/aircraftIconMap';

interface RenderFlight extends Flight {
  prevLat: number;
  prevLon: number;
  targetLat: number;
  targetLon: number;
  lastUpdate: number;
  updateDuration: number;
}

export const MapCanvas: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  const [hoveredFlight, setHoveredFlight] = useState<Flight | null>(null);
  const hoveredFlightRef = useRef<Flight | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isLiveRadar, setIsLiveRadar] = useState<boolean>(false);
  const [flightCount, setFlightCount] = useState<number>(0);

  // Map stores for active flights & Leaflet markers & label placement side & hover status
  const flightsMapRef = useRef<Map<string, RenderFlight>>(new Map());
  const markersMapRef = useRef<Map<string, L.Marker>>(new Map());
  const labelSidesRef = useRef<Map<string, 'left' | 'right'>>(new Map());
  const hoverStatesRef = useRef<Map<string, boolean>>(new Map());

  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  // Rotatable Aircraft SVG Icon matched to model with Dynamic Label Side (left / right)
  const createPlaneIcon = (f: Flight, isHovered: boolean, labelSide: 'right' | 'left' = 'right') => {
    const heading = f.heading || 0;
    const callsign = f.callsign || 'N/A';
    const altFeet = f.altitudeFeet || 0;
    const iconPath = getAircraftIconPath(f);

    const filterStyle = isHovered
      ? 'filter: brightness(0) invert(65%) sepia(85%) saturate(2500%) hue-rotate(165deg) contrast(100%) drop-shadow(0 0 10px #38bdf8);'
      : 'filter: brightness(0) invert(1) drop-shadow(0 2px 6px rgba(0, 0, 0, 0.85));';

    const isLeft = labelSide === 'left';
    const labelStyle = isLeft
      ? 'position: absolute; right: 48px; top: 4px; text-align: right; display: flex; flex-direction: column; align-items: flex-end;'
      : 'position: absolute; left: 48px; top: 4px; text-align: left; display: flex; flex-direction: column; align-items: flex-start;';

    return L.divIcon({
      className: 'custom-airplane-marker',
      html: `
        <div style="position: relative; width: 44px; height: 44px; pointer-events: none;">
          <!-- Rotatable Aircraft Model SVG Silhouette -->
          <div style="transform: rotate(${heading}deg); transform-origin: center center; transition: transform 0.1s linear; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
            <img src="${iconPath}" style="width: 36px; height: 36px; object-fit: contain; ${filterStyle}" alt="aircraft" />
          </div>
          <!-- Callsign & Altitude Badge (Placed Left or Right to avoid overlapping) -->
          <div style="${labelStyle} pointer-events: none; text-shadow: 0 1px 4px #000000, 0 0 3px #000000; white-space: nowrap;">
            <span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; font-weight: 800; color: ${isHovered ? '#38bdf8' : '#f8fafc'}; letter-spacing: 0.5px; line-height: 1.2;">
              ${callsign}
            </span>
            <span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 10px; font-weight: 600; color: ${isHovered ? '#7dd3fc' : 'rgba(255, 255, 255, 0.75)'}; line-height: 1.2;">
              ${altFeet} ft
            </span>
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });
  };

  // 1. Initialize Locked Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [MAP_CENTER.lat, MAP_CENTER.lon],
      zoom: 12,
      zoomControl: false,
      dragging: false,
      touchZoom: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    mapRef.current = map;

    // Wintersweiler center marker
    const wintersweilerIcon = L.divIcon({
      className: 'custom-wintersweiler-marker',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; transform: translate(-50%, -50%); pointer-events: none;">
          <div style="width: 10px; height: 10px; border-radius: 50%; background-color: #38bdf8; border: 2px solid #ffffff; box-shadow: 0 0 12px #38bdf8;"></div>
          <div style="position: absolute; top: 14px; white-space: nowrap; font-family: ui-monospace, monospace; font-size: 11px; font-weight: bold; color: #ffffff; background: rgba(15, 23, 42, 0.95); padding: 2px 7px; border-radius: 4px; border: 1px solid rgba(56, 189, 248, 0.5); text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 12px rgba(0,0,0,0.6);">
            WINTERSWEILER
          </div>
        </div>
      `,
      iconSize: [0, 0],
    });

    L.marker([WINTERSWEILER_CENTER.lat, WINTERSWEILER_CENTER.lon], {
      icon: wintersweilerIcon,
      interactive: false,
    }).addTo(map);

    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    const handleResize = () => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 2. Poll server for real-time live flight radar every 2 seconds
  useEffect(() => {
    let isMounted = true;

    const fetchFlights = async () => {
      try {
        let fetchedFlights: Flight[] = [];
        let isLive = false;

        try {
          const res = await fetch('/api/flights');
          if (res.ok) {
            const data = await res.json();
            if (data && Array.isArray(data.flights)) {
              fetchedFlights = data.flights;
              isLive = Boolean(data.isLiveRadar);
            }
          }
        } catch (serverErr) {
          // /api/flights unavailable (e.g. Netlify static hosting)
        }

        // Fallback for static hosting (Netlify) or failed backend fetch
        if (fetchedFlights.length === 0) {
          const clientData = await fetchClientFlights();
          fetchedFlights = clientData.flights;
          isLive = clientData.isLiveRadar;
        }

        if (isMounted) {
          setIsLiveRadar(isLive);
          setFlightCount(fetchedFlights.length);

          const activeIds = new Set<string>();
          const now = performance.now();

          fetchedFlights.forEach((f) => {
            activeIds.add(f.id);
            const existing = flightsMapRef.current.get(f.id);
            if (!existing) {
              flightsMapRef.current.set(f.id, {
                ...f,
                prevLat: f.lat,
                prevLon: f.lon,
                targetLat: f.lat,
                targetLon: f.lon,
                lastUpdate: now,
                updateDuration: 2000,
              });
            } else {
              const latDiff = f.lat - existing.lat;
              const lonDiff = f.lon - existing.lon;
              const distMeters = Math.hypot(latDiff * 111000, lonDiff * 75000);

              const timeSinceLastUpdate = now - existing.lastUpdate;
              existing.updateDuration = timeSinceLastUpdate > 400 && timeSinceLastUpdate < 6000
                ? timeSinceLastUpdate
                : 2000;

              // Smoothly start from current rendered position on screen
              existing.prevLat = existing.lat;
              existing.prevLon = existing.lon;
              existing.targetLat = f.lat;
              existing.targetLon = f.lon;
              existing.lastUpdate = now;

              existing.heading = f.heading ?? existing.heading;
              existing.velocityKmh = f.velocityKmh ?? existing.velocityKmh;
              existing.velocityKnots = f.velocityKnots ?? existing.velocityKnots;
              existing.altitudeFeet = f.altitudeFeet ?? existing.altitudeFeet;
              existing.altitudeMeters = f.altitudeMeters ?? existing.altitudeMeters;
              existing.callsign = f.callsign || existing.callsign;
              existing.verticalRate = f.verticalRate ?? existing.verticalRate;
              existing.isGround = f.isGround;
              existing.squawk = f.squawk || existing.squawk;
              existing.originCountry = f.originCountry || existing.originCountry;
              existing.registration = f.registration || existing.registration;
              existing.aircraftTypeCode = f.aircraftTypeCode || existing.aircraftTypeCode;

              // Snap immediately only if huge teleport (> 3000m)
              if (distMeters > 3000) {
                existing.prevLat = f.lat;
                existing.prevLon = f.lon;
                existing.lat = f.lat;
                existing.lon = f.lon;
              }
            }
          });

          // Clean up markers for flights no longer present
          flightsMapRef.current.forEach((_, id) => {
            if (!activeIds.has(id)) {
              const marker = markersMapRef.current.get(id);
              if (marker && mapRef.current) {
                mapRef.current.removeLayer(marker);
              }
              markersMapRef.current.delete(id);
              flightsMapRef.current.delete(id);
            }
          });
        }
      } catch (err) {
        // Silent catch
      }
    };

    fetchFlights();
    const interval = setInterval(fetchFlights, 2000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // 3. Smooth 60FPS Flight Motion Interpolation & Leaflet Marker Sync with Dynamic Label Deconfliction
  useEffect(() => {
    const updateLoop = (now: number) => {
      const map = mapRef.current;

      if (map && (map as any)._loaded && (map as any)._mapPane) {
        const flightPositions: { flight: RenderFlight; x: number; y: number; labelSide: 'right' | 'left' }[] = [];

        flightsMapRef.current.forEach((f) => {
          const elapsed = now - f.lastUpdate;
          const duration = f.updateDuration || 2000;

          if (elapsed <= duration) {
            // Smooth progress fraction 0.0 -> 1.0 between prev position and target position
            const progress = elapsed / duration;
            f.lat = f.prevLat + (f.targetLat - f.prevLat) * progress;
            f.lon = f.prevLon + (f.targetLon - f.prevLon) * progress;
          } else {
            // Extrapolate smoothly forward along aircraft heading if update is slightly delayed
            const extraSeconds = (elapsed - duration) / 1000;
            const velKmh = f.velocityKmh || 0;

            if (velKmh > 20 && !f.isGround) {
              const speedMS = velKmh / 3.6;
              const rad = ((f.heading || 0) * Math.PI) / 180;
              const dLat = (speedMS * Math.cos(rad) * extraSeconds) / 111000;
              const dLon = (speedMS * Math.sin(rad) * extraSeconds) / (111000 * Math.cos((f.targetLat * Math.PI) / 180));
              f.lat = f.targetLat + dLat;
              f.lon = f.targetLon + dLon;
            } else {
              f.lat = f.targetLat;
              f.lon = f.targetLon;
            }
          }

          if (typeof f.lat === 'number' && typeof f.lon === 'number' && !isNaN(f.lat) && !isNaN(f.lon)) {
            try {
              const pt = map.latLngToContainerPoint([f.lat, f.lon]);
              flightPositions.push({ flight: f, x: pt.x, y: pt.y, labelSide: 'right' });
            } catch (err) {
              // Ignore position calculation error during map cleanup or resize
            }
          }
        });

        // Sort by horizontal screen position (X) ascending
        flightPositions.sort((a, b) => a.x - b.x);

        // Deconflict overlapping airplane labels
        // If airplane A is to the left of airplane B (dx < 120px) and at similar height (dy < 36px),
        // flip airplane A's label to the LEFT side so it extends away from airplane B.
        for (let i = 0; i < flightPositions.length; i++) {
          const itemA = flightPositions[i];
          for (let j = i + 1; j < flightPositions.length; j++) {
            const itemB = flightPositions[j];
            const dx = itemB.x - itemA.x;
            const dy = Math.abs(itemB.y - itemA.y);
            if (dx < 120 && dy < 36) {
              itemA.labelSide = 'left';
            }
          }
        }

        // Render & Update Leaflet markers
        flightPositions.forEach(({ flight: f, labelSide }) => {
          let marker = markersMapRef.current.get(f.id);
          const previousSide = labelSidesRef.current.get(f.id) || 'right';
          const isHovered = hoveredFlightRef.current?.id === f.id;
          const previousHovered = hoverStatesRef.current.get(f.id) || false;

          if (!marker) {
            marker = L.marker([f.lat, f.lon], {
              icon: createPlaneIcon(f, isHovered, labelSide),
              interactive: false,
            }).addTo(map);

            markersMapRef.current.set(f.id, marker);
            labelSidesRef.current.set(f.id, labelSide);
            hoverStatesRef.current.set(f.id, isHovered);
          } else {
            marker.setLatLng([f.lat, f.lon]);
            // Re-create icon if label side OR hover state changed
            if (previousSide !== labelSide || previousHovered !== isHovered) {
              marker.setIcon(createPlaneIcon(f, isHovered, labelSide));
              labelSidesRef.current.set(f.id, labelSide);
              hoverStatesRef.current.set(f.id, isHovered);
            }
          }
        });
      }

      animFrameRef.current = requestAnimationFrame(updateLoop);
    };

    animFrameRef.current = requestAnimationFrame(updateLoop);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  // 4. Global MouseMove Distance-Based Hover Detection
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    setMousePos({ x: mouseX, y: mouseY });

    const map = mapRef.current;
    if (!map || !(map as any)._loaded || !(map as any)._mapPane) return;

    let found: Flight | null = null;
    let minDist = 34; // 34px hit radius threshold

    flightsMapRef.current.forEach((f) => {
      if (typeof f.lat !== 'number' || typeof f.lon !== 'number' || isNaN(f.lat) || isNaN(f.lon)) return;
      try {
        const pt = map.latLngToContainerPoint([f.lat, f.lon]);
        const dist = Math.hypot(pt.x - mouseX, pt.y - mouseY);

        if (dist < minDist) {
          minDist = dist;
          found = f;
        }
      } catch (err) {
        // Safe guard against map container detachment or position calculation race conditions
      }
    });

    const prevHovered = hoveredFlightRef.current;
    if (found?.id !== prevHovered?.id) {
      if (prevHovered) {
        const prevMarker = markersMapRef.current.get(prevHovered.id);
        if (prevMarker) {
          const side = labelSidesRef.current.get(prevHovered.id) || 'right';
          prevMarker.setIcon(createPlaneIcon(prevHovered, false, side));
          prevMarker.setZIndexOffset(100);
          hoverStatesRef.current.set(prevHovered.id, false);
        }
      }
      if (found) {
        const newMarker = markersMapRef.current.get(found.id);
        if (newMarker) {
          const side = labelSidesRef.current.get(found.id) || 'right';
          newMarker.setIcon(createPlaneIcon(found, true, side));
          newMarker.setZIndexOffset(1000);
          hoverStatesRef.current.set(found.id, true);
        }
      }
      hoveredFlightRef.current = found;
      setHoveredFlight(found);
    }
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className={`relative w-screen h-screen overflow-hidden bg-slate-950 ${
        hoveredFlight ? 'cursor-pointer' : 'cursor-default'
      }`}
    >
      {/* 1. Leaflet Base Map Container */}
      <div
        ref={mapContainerRef}
        className="absolute inset-0 w-full h-full bg-slate-950"
      />

      {/* 2. Hover Details Tooltip Card (Only rendered when cursor is over an airplane) */}
      {hoveredFlight && (
        <FlightTooltip
          flight={hoveredFlight}
          x={mousePos.x}
          y={mousePos.y}
          canvasWidth={window.innerWidth}
          canvasHeight={window.innerHeight}
        />
      )}
    </div>
  );
};
