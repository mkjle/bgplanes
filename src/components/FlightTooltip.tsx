import React, { useRef, useState, useLayoutEffect } from 'react';
import { Flight } from '../types';
import { Compass, Gauge, ArrowUpRight, ArrowDownRight, Minus, Globe, Building2 } from 'lucide-react';
import { getFlightMeta } from '../utils/airlineData';
import { getAircraftIconPath } from '../utils/aircraftIconMap';

interface FlightTooltipProps {
  flight: Flight;
  x: number;
  y: number;
  canvasWidth: number;
  canvasHeight: number;
}

export const FlightTooltip: React.FC<FlightTooltipProps> = ({
  flight,
  x,
  y,
  canvasWidth,
  canvasHeight,
}) => {
  const meta = getFlightMeta(flight);
  const airlineName = flight.airline || meta.airline;
  const aircraftModel = flight.aircraftModel || meta.aircraftModel;

  const tooltipRef = useRef<HTMLDivElement>(null);

  // Initial estimate
  const estimatedWidth = 288;
  const estimatedHeight = 310;
  let initLeft = x + 24;
  let initTop = y - 30;

  if (initTop + estimatedHeight > canvasHeight - 16) {
    initTop = Math.max(16, y - estimatedHeight - 16);
  }
  if (initLeft + estimatedWidth > canvasWidth - 16) {
    initLeft = Math.max(16, x - estimatedWidth - 24);
  }

  const [pos, setPos] = useState({ left: initLeft, top: initTop });

  useLayoutEffect(() => {
    if (!tooltipRef.current) return;
    const rect = tooltipRef.current.getBoundingClientRect();
    const width = rect.width || estimatedWidth;
    const height = rect.height || estimatedHeight;

    let calcLeft = x + 24;
    let calcTop = y - 30;

    // Flip above airplane if near bottom of viewport or extending past bottom
    if (y + height / 2 > canvasHeight || calcTop + height > canvasHeight - 16) {
      calcTop = y - height - 16;
    }

    // Flip to left of airplane if extending past right boundary
    if (calcLeft + width > canvasWidth - 16) {
      calcLeft = x - width - 24;
    }

    // Strict boundary clamps
    if (calcTop + height > canvasHeight - 16) {
      calcTop = canvasHeight - height - 16;
    }
    if (calcTop < 16) {
      calcTop = 16;
    }

    if (calcLeft + width > canvasWidth - 16) {
      calcLeft = canvasWidth - width - 16;
    }
    if (calcLeft < 16) {
      calcLeft = 16;
    }

    setPos({ left: calcLeft, top: calcTop });
  }, [x, y, canvasWidth, canvasHeight, flight.id]);

  const getCardinalHeading = (heading: number) => {
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const idx = Math.round(((heading % 360) + 360) % 360 / 45) % 8;
    return dirs[idx];
  };

  const getVerticalIcon = (rate: number) => {
    if (rate > 0.5) return <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400 inline ml-1" />;
    if (rate < -0.5) return <ArrowDownRight className="w-3.5 h-3.5 text-amber-400 inline ml-1" />;
    return <Minus className="w-3.5 h-3.5 text-neutral-500 inline ml-1" />;
  };

  return (
    <div
      ref={tooltipRef}
      style={{
        position: 'fixed',
        left: `${pos.left}px`,
        top: `${pos.top}px`,
        pointerEvents: 'none',
        userSelect: 'none',
      }}
      className="z-[9999] w-72 max-h-[calc(100vh-32px)] overflow-y-auto bg-slate-950/95 border border-sky-500/30 rounded-xl shadow-[0_10px_35px_rgba(0,0,0,0.85)] backdrop-blur-md p-4 text-white font-sans tracking-tight pointer-events-none select-none"
    >
      {/* Top Bar: Callsign & Status Badge */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-950/80 flex items-center justify-center border border-sky-500/40 shrink-0 p-1">
            <img
              src={getAircraftIconPath(flight)}
              className="w-full h-full object-contain filter invert brightness-200"
              style={{ transform: `rotate(${flight.heading}deg)` }}
              alt="Flugzeug-Icon"
            />
          </div>
          <div>
            <span className="text-base font-bold tracking-wider font-mono text-white block leading-none">
              {flight.callsign || 'N/A'}
            </span>
            <span className="text-[10px] text-sky-400/80 tracking-wider font-mono mt-1 block">
              {flight.registration ? `REG: ${flight.registration}` : `ICAO: ${flight.id.toUpperCase()}`}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono tracking-wider uppercase bg-sky-950/60 border border-sky-500/40 text-sky-300 font-bold">
            {flight.isGround ? 'AM BODEN' : 'IN FLUG'}
          </span>
        </div>
      </div>

      {/* Airline & Aircraft Model Details */}
      <div className="space-y-1.5 mb-3 bg-slate-900/80 border border-slate-800 rounded-lg p-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
            <Building2 className="w-3.5 h-3.5 text-sky-400 shrink-0" /> Airline:
          </span>
          <span className="font-semibold text-sky-200 truncate max-w-[150px]" title={airlineName}>
            {airlineName}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
          <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
            <Globe className="w-3.5 h-3.5 text-sky-400 shrink-0" /> Flugzeug:
          </span>
          <span className="font-semibold text-slate-100 truncate max-w-[150px]" title={aircraftModel}>
            {aircraftModel}
          </span>
        </div>
      </div>

      {/* 2x2 Specs Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
        {/* Altitude */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-2">
          <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-sans">Flughöhe</span>
          <div className="text-sm font-bold text-white mt-0.5">
            {(flight.altitudeFeet ?? 0).toLocaleString()} <span className="text-[10px] font-normal text-slate-400">ft</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            ({(flight.altitudeMeters ?? 0).toLocaleString()} m)
          </span>
        </div>

        {/* Speed */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-sans">Tempo</span>
            <Gauge className="w-3 h-3 text-slate-500" />
          </div>
          <div className="text-sm font-bold text-white mt-0.5">
            {flight.velocityKmh ?? 0} <span className="text-[10px] font-normal text-slate-400">km/h</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            ({flight.velocityKnots ?? 0} kts)
          </span>
        </div>

        {/* Heading */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-sans">Kurs</span>
            <Compass className="w-3 h-3 text-slate-500" />
          </div>
          <div className="text-sm font-bold text-white mt-0.5">
            {flight.heading ?? 0}° <span className="text-xs font-normal text-sky-300">{getCardinalHeading(flight.heading ?? 0)}</span>
          </div>
        </div>

        {/* Vertical Rate */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-2">
          <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-sans">Steigrate</span>
          <div className="text-sm font-bold text-white mt-0.5 flex items-center justify-between">
            <span>
              {(flight.verticalRate ?? 0) > 0 ? `+${flight.verticalRate}` : (flight.verticalRate ?? 0)}
              <span className="text-[10px] font-normal text-slate-400"> m/s</span>
            </span>
            {getVerticalIcon(flight.verticalRate ?? 0)}
          </div>
        </div>
      </div>

      {/* Footer Squawk Code & Country */}
      <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
        <span className="truncate max-w-[150px]">
          {flight.originCountry || 'Schweiz / Europa'}
        </span>
        {flight.squawk && (
          <span className="text-sky-300 font-bold bg-sky-950/80 border border-sky-500/30 px-1.5 py-0.5 rounded">
            SQ {flight.squawk}
          </span>
        )}
      </div>
    </div>
  );
};
