import React, { useState } from 'react';
import { Palette, X, RotateCcw, Search, Sparkles, RefreshCw, Bell, BellOff, Volume2 } from 'lucide-react';
import { ALL_AIRCRAFT_ICONS, DEFAULT_MODEL_COLORS } from '../utils/aircraftIconMap';

const LOCAL_STORAGE_KEY = 'aircraft_icon_colors';

// Quick preset color swatches
const PRESET_SWATCHES = [
  { name: 'Weiss', hex: '#ffffff' },
  { name: 'Sky Blau', hex: '#38bdf8' },
  { name: 'Neon Grün', hex: '#22c55e' },
  { name: 'Radar Gelb', hex: '#eab308' },
  { name: 'Amber Orange', hex: '#f97316' },
  { name: 'Signal Rot', hex: '#ef4444' },
  { name: 'Neon Pink', hex: '#ec4899' },
  { name: 'Violett', hex: '#a855f7' },
  { name: 'Cyan Türkis', hex: '#06b6d4' },
];

export interface AircraftColorMenuProps {
  iconColors: Record<string, string>;
  onColorsChange: (newColors: Record<string, string>) => void;
  showRunways: boolean;
  onToggleRunways: (show: boolean) => void;
  soundAlertsEnabled: boolean;
  onToggleSoundAlerts: (enabled: boolean) => void;
  soundModels: string[];
  onToggleSoundModel: (filename: string) => void;
  onTestSound: () => void;
}

export const AircraftColorMenu: React.FC<AircraftColorMenuProps> = ({
  iconColors,
  onColorsChange,
  showRunways,
  onToggleRunways,
  soundAlertsEnabled,
  onToggleSoundAlerts,
  soundModels,
  onToggleSoundModel,
  onTestSound,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Alle');

  const handleColorChange = (filename: string, color: string) => {
    const updated = { ...iconColors, [filename]: color };
    onColorsChange(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save aircraft colors:', e);
    }
  };

  const handleResetAll = () => {
    onColorsChange({});
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to reset aircraft colors:', e);
    }
  };

  const handleApplyPresetToAll = (hex: string) => {
    const updated: Record<string, string> = {};
    ALL_AIRCRAFT_ICONS.forEach((item) => {
      updated[item.filename] = hex;
    });
    onColorsChange(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save preset colors:', e);
    }
  };

  const categories = ['Alle', 'Airbus', 'Boeing', 'Military', 'Regional', 'General Aviation', 'Business Jet'];

  const filteredIcons = ALL_AIRCRAFT_ICONS.filter((item) => {
    const matchesCategory = selectedCategory === 'Alle' || item.category === selectedCategory;
    const matchesSearch =
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.filename.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed top-3 left-3 z-[9999] group">
      {/* Invisible Trigger Area: Invisible by default, becomes visible & clickable on hover */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          title="Flugzeug-Farben anpassen"
          className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-300 w-11 h-11 rounded-xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-md flex items-center justify-center text-slate-300 hover:text-sky-400 hover:border-sky-500/60 hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Palette className="w-5 h-5 text-sky-400" />
        </button>
      )}

      {/* Slide-out / Floating Customization Menu */}
      {isOpen && (
        <div className="w-[440px] max-w-[calc(100vw-24px)] max-h-[85vh] bg-slate-950/95 border border-sky-500/40 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] backdrop-blur-xl flex flex-col text-white overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-4 border-b border-slate-800/80 bg-slate-900/90 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-sky-950/80 border border-sky-500/40 flex items-center justify-center text-sky-400 shadow-inner">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white tracking-wide">Flugzeug Icon Farben</h3>
                <p className="text-[11px] text-slate-400">Farbe pro Modell individuell festlegen</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.location.reload()}
                title="Website neu laden (Refresh)"
                className="px-2.5 py-1.5 rounded-lg bg-sky-950/80 hover:bg-sky-900 border border-sky-500/40 text-sky-400 hover:text-sky-200 flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer shadow-sm active:scale-95 group/btn"
              >
                <RefreshCw className="w-3.5 h-3.5 text-sky-400 group-hover/btn:rotate-180 transition-transform duration-500" />
                <span>Neu laden</span>
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Map Overlay Toggles: EuroAirport Runways & Sound Alerts */}
          <div className="px-3 py-2.5 bg-slate-900/60 border-b border-slate-800/80 space-y-2">
            {/* Runways Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                <div>
                  <span className="text-xs font-semibold text-slate-200">EuroAirport Basel Pisten</span>
                  <p className="text-[10px] text-slate-400">Pisten 15/33 & 08/26 auf Karte einblenden</p>
                </div>
              </div>

              <button
                onClick={() => onToggleRunways(!showRunways)}
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer border ${
                  showRunways
                    ? 'bg-sky-600 border-sky-400'
                    : 'bg-slate-800 border-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                    showRunways ? 'translate-x-[20px]' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Sound Alert Master Toggle & Test Sound */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
                <div>
                  <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-amber-400" /> Ton bei Erscheinen (B747, A380, A340...)
                  </span>
                  <p className="text-[10px] text-slate-400">Angenehmer Dimmelton beim Einfliegen auf den Schirm</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onTestSound}
                  title="Ton testen"
                  className="px-2 py-1 rounded bg-amber-950/80 hover:bg-amber-900 border border-amber-500/40 text-amber-300 text-[10px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Volume2 className="w-3 h-3" />
                  <span>Test</span>
                </button>

                <button
                  onClick={() => onToggleSoundAlerts(!soundAlertsEnabled)}
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer border ${
                    soundAlertsEnabled
                      ? 'bg-amber-600 border-amber-400'
                      : 'bg-slate-800 border-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                      soundAlertsEnabled ? 'translate-x-[20px]' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Preset Bar & Global Reset */}
          <div className="p-3 bg-slate-900/40 border-b border-slate-800/60 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 flex items-center gap-1 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Schnellwahl Paletten
              </span>
              <button
                onClick={handleResetAll}
                className="text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1 text-[11px] font-medium cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Zurücksetzen
              </button>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {PRESET_SWATCHES.map((swatch) => (
                <button
                  key={swatch.hex}
                  onClick={() => handleApplyPresetToAll(swatch.hex)}
                  title={`Alle auf ${swatch.name} setzen`}
                  className="w-6 h-6 rounded-full border border-slate-600/80 shrink-0 hover:scale-110 hover:border-white transition-transform cursor-pointer shadow-sm"
                  style={{ backgroundColor: swatch.hex }}
                />
              ))}
            </div>
          </div>

          {/* Search & Category Filter */}
          <div className="p-3 border-b border-slate-800/60 space-y-2 bg-slate-900/20">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Modell suchen (z.B. A380, B737, Cessna)..."
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-sky-500 text-white font-semibold shadow-sm'
                      : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Aircraft Model List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[480px]">
            {filteredIcons.map((item) => {
              const currentColor = iconColors[item.filename] || DEFAULT_MODEL_COLORS[item.filename] || item.defaultColor;
              const iconPath = `/assets/ADS-B_Radar_Free_Aircraft_SVG_Icons/${item.filename}`;
              const hasSoundAlert = soundModels.includes(item.filename);

              return (
                <div
                  key={item.filename}
                  className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between gap-3 transition-colors"
                >
                  {/* Left: Aircraft Icon Preview & Label */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-lg bg-slate-950 border border-slate-700/80 flex items-center justify-center shrink-0 p-1 shadow-inner relative group/icon"
                      style={{ boxShadow: `inset 0 0 12px ${currentColor}15` }}
                    >
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          backgroundColor: currentColor,
                          maskImage: `url('${iconPath}')`,
                          WebkitMaskImage: `url('${iconPath}')`,
                          maskSize: 'contain',
                          WebkitMaskSize: 'contain',
                          maskRepeat: 'no-repeat',
                          WebkitMaskRepeat: 'no-repeat',
                          maskPosition: 'center',
                          WebkitMaskPosition: 'center',
                          filter: `drop-shadow(0 0 4px ${currentColor}aa)`,
                        }}
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white truncate" title={item.label}>
                        {item.label}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {item.filename} • <span className="text-sky-400">{item.category}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Sound Alert Bell + Color Selector & Color Input */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Sound Alert Toggle for this specific aircraft model */}
                    <button
                      onClick={() => onToggleSoundModel(item.filename)}
                      title={hasSoundAlert ? 'Ton-Signal bei Erscheinen AKTIV' : 'Ton-Signal bei Erscheinen deaktiviert'}
                      className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                        hasSoundAlert
                          ? 'bg-amber-950/80 border-amber-500/80 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                          : 'bg-slate-950/60 border-slate-800 text-slate-600 hover:text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {hasSoundAlert ? (
                        <Bell className="w-3.5 h-3.5 fill-amber-400/20" />
                      ) : (
                        <BellOff className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Native Hex Picker */}
                    <label
                      title="Eigene Farbe wählen"
                      className="relative w-7 h-7 rounded-lg border border-slate-600 hover:border-white transition-all cursor-pointer flex items-center justify-center overflow-hidden shadow-sm"
                      style={{ backgroundColor: currentColor }}
                    >
                      <input
                        type="color"
                        value={currentColor}
                        onChange={(e) => handleColorChange(item.filename, e.target.value)}
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                      />
                    </label>

                    {/* Quick Swatch Popup / Mini Palette */}
                    <div className="hidden sm:flex items-center gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800">
                      {['#ffffff', '#38bdf8', '#22c55e', '#eab308', '#ef4444', '#a855f7'].map((hex) => (
                        <button
                          key={hex}
                          onClick={() => handleColorChange(item.filename, hex)}
                          className={`w-4 h-4 rounded-full border transition-transform cursor-pointer ${
                            currentColor.toLowerCase() === hex.toLowerCase()
                              ? 'border-white scale-110 shadow-sm'
                              : 'border-slate-700 hover:scale-105'
                          }`}
                          style={{ backgroundColor: hex }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredIcons.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-500">
                Kein Flugzeug-Modell gefunden für "{searchQuery}"
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="px-4 py-2.5 bg-slate-900/90 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
            <span>{ALL_AIRCRAFT_ICONS.length} Flugzeug-Icons verfügbar</span>
            <span className="text-sky-400">Automatisch auf der Karte aktualisiert</span>
          </div>
        </div>
      )}
    </div>
  );
};
