import React, { useState } from 'react';
import {
  Radio,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Clock,
  Battery,
  Thermometer,
  Wind,
  Search,
  Filter,
  Trash2,
  RefreshCw,
  Plus,
  Sliders,
  Maximize2,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { SmartBin, BinType, BinStatus } from '../types/waste';

interface BinMonitorProps {
  bins: SmartBin[];
  onEmptyBin: (binId: string) => void;
  onSimulateFill: (binId: string, amount: number) => void;
  onAddBin: (newBin: Omit<SmartBin, 'id' | 'fillHistory'>) => void;
  alertThreshold: number;
  setAlertThreshold: (val: number) => void;
  onDispatchRouteForCritical: () => void;
}

export const BinMonitor: React.FC<BinMonitorProps> = ({
  bins,
  onEmptyBin,
  onSimulateFill,
  onAddBin,
  alertThreshold,
  setAlertThreshold,
  onDispatchRouteForCritical,
}) => {
  const [viewMode, setViewMode] = useState<'map' | 'grid'>('map');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedBinType, setSelectedBinType] = useState<string>('all');
  const [inspectingBin, setInspectingBin] = useState<SmartBin | null>(bins[0] || null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New bin form state
  const [newBinName, setNewBinName] = useState('');
  const [newBinLocation, setNewBinLocation] = useState('');
  const [newBinZone, setNewBinZone] = useState('Downtown Commercial');
  const [newBinType, setNewBinType] = useState<BinType>('dry_recyclable');
  const [newBinCapacity, setNewBinCapacity] = useState(400);

  // Filter bins
  const filteredBins = bins.filter((bin) => {
    const matchesSearch =
      bin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bin.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bin.locationName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesZone = selectedZone === 'all' || bin.zone === selectedZone;
    const matchesType = selectedBinType === 'all' || bin.binType === selectedBinType;
    const matchesStatus =
      selectedStatus === 'all'
        ? true
        : selectedStatus === 'critical'
        ? bin.fillLevel >= alertThreshold
        : selectedStatus === 'overflowing'
        ? bin.fillLevel >= 95
        : selectedStatus === 'normal'
        ? bin.fillLevel < 60
        : bin.fillLevel >= 60 && bin.fillLevel < alertThreshold;

    return matchesSearch && matchesZone && matchesType && matchesStatus;
  });

  const criticalBins = bins.filter((b) => b.fillLevel >= alertThreshold);
  const overflowingBins = bins.filter((b) => b.fillLevel >= 95);
  const avgFillRate = Math.round(bins.reduce((acc, b) => acc + b.fillLevel, 0) / bins.length);

  const zones = Array.from(new Set(bins.map((b) => b.zone)));

  const handleCreateBin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBinName || !newBinLocation) return;

    onAddBin({
      code: `BIN-NEW-${Math.floor(100 + Math.random() * 900)}`,
      name: newBinName,
      locationName: newBinLocation,
      zone: newBinZone,
      coordinates: {
        x: Math.floor(20 + Math.random() * 60),
        y: Math.floor(20 + Math.random() * 60),
      },
      binType: newBinType,
      fillLevel: 15,
      capacityLiters: newBinCapacity,
      batteryLevel: 98,
      temperatureC: 21,
      odorLevel: 'Low',
      lastEmptied: new Date().toISOString(),
      status: 'normal',
    });

    setShowAddModal(false);
    setNewBinName('');
    setNewBinLocation('');
  };

  const getStatusColor = (fill: number) => {
    if (fill >= 95) return 'text-rose-400 bg-rose-500/20 border-rose-500/50';
    if (fill >= alertThreshold) return 'text-amber-400 bg-amber-500/20 border-amber-500/50';
    if (fill >= 60) return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/40';
    return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40';
  };

  const getBinTypeLabel = (type: BinType) => {
    switch (type) {
      case 'dry_recyclable':
        return { label: 'Dry Recyclable', color: 'text-sky-400 bg-sky-500/10 border-sky-500/30' };
      case 'wet_organic':
        return { label: 'Wet Organic', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
      case 'glass_metal':
        return { label: 'Glass & Metal', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
      case 'hazardous_ewaste':
        return { label: 'Hazardous / E-Waste', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
      default:
        return { label: 'General Waste', color: 'text-slate-400 bg-slate-500/10 border-slate-500/30' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Alert Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Monitored Bins
            </span>
            <Radio className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">{bins.length}</span>
            <span className="text-xs text-slate-400">IoT nodes active</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Average Fill Level
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">{avgFillRate}%</span>
            <span className="text-xs text-emerald-400 font-medium">Within capacity</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Collection Alerts (≥{alertThreshold}%)
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-400 font-mono">
              {criticalBins.length}
            </span>
            <span className="text-xs text-amber-300">Requires pickup</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">
              Critical Overflowing (&gt;95%)
            </span>
            <span className="flex h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping"></span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-400 font-mono">
              {overflowingBins.length}
            </span>
            <span className="text-xs text-rose-300">Urgent action</span>
          </div>
        </div>
      </div>

      {/* Critical Alert Action Bar if any bins need collection */}
      {criticalBins.length > 0 && (
        <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-400 animate-bounce" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-300">
                Action Required: {criticalBins.length} Smart Bins Exceed {alertThreshold}% Capacity
              </h3>
              <p className="text-xs text-amber-200/80">
                Automatic threshold alert dispatched. Immediate collection avoids curbside spillage.
              </p>
            </div>
          </div>

          <button
            onClick={onDispatchRouteForCritical}
            className="shrink-0 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all"
          >
            <span>Dispatch Optimized Fleet Route</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Control Strip: Search, View Mode, Threshold Slider, Add Bin */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search code, bin name, street..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Zone filter */}
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Zones</option>
            {zones.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Fill Statuses</option>
            <option value="normal">Normal (&lt;60%)</option>
            <option value="critical">Requires Collection (≥{alertThreshold}%)</option>
            <option value="overflowing">Overflowing (&gt;95%)</option>
          </select>
        </div>

        {/* View mode toggle, Threshold Slider, Add Button */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Alert Threshold Adjuster */}
          <div className="flex items-center space-x-2 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Alert Limit:</span>
            <span className="font-bold text-amber-400 font-mono">{alertThreshold}%</span>
            <input
              type="range"
              min="60"
              max="90"
              step="5"
              value={alertThreshold}
              onChange={(e) => setAlertThreshold(Number(e.target.value))}
              className="w-16 accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Map vs Grid Toggle */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1 rounded-md font-semibold transition-all ${
                viewMode === 'map'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Interactive Map
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-md font-semibold transition-all ${
                viewMode === 'grid'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Grid View ({filteredBins.length})
            </button>
          </div>

          {/* Add Bin Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Deploy Bin</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'map' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Interactive Sector Map (8 cols) */}
          <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  City Municipal Sector GIS Telemetry Map
                </h3>
                <p className="text-[11px] text-slate-400">
                  Live sensor nodes with animated overflow beacons. Click any node to view telemetry.
                </p>
              </div>

              {/* Legend */}
              <div className="hidden sm:flex items-center space-x-3 text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Normal
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span> Moderate
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span> Critical
                </span>
              </div>
            </div>

            {/* Map Canvas Visual Schematic */}
            <div className="relative w-full aspect-[16/10] bg-slate-950 rounded-xl overflow-hidden border border-slate-800/80 p-4 select-none">
              {/* Subtle Sector Grid Lines & Landmark Labels */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#64748b" strokeWidth="0.7" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                {/* Sector Dividers */}
                <path d="M 0,200 Q 300,180 800,240" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 4" fill="none" />
                <path d="M 400,0 Q 420,300 450,600" stroke="#34d399" strokeWidth="2" strokeDasharray="4 4" fill="none" />
              </svg>

              {/* Sector Watermarks */}
              <div className="absolute top-4 left-6 text-[11px] font-mono uppercase tracking-widest text-slate-600 font-bold">
                SECTOR A: UNIVERSITY CAMPUS
              </div>
              <div className="absolute top-4 right-8 text-[11px] font-mono uppercase tracking-widest text-slate-600 font-bold">
                SECTOR B: INNOVATION TECH PARK
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[12px] font-mono uppercase tracking-widest text-slate-600 font-bold">
                DOWNTOWN COMMERCIAL HUB
              </div>
              <div className="absolute bottom-6 left-8 text-[11px] font-mono uppercase tracking-widest text-slate-600 font-bold">
                SECTOR C: WATERFRONT PROMENADE
              </div>
              <div className="absolute bottom-6 right-8 text-[11px] font-mono uppercase tracking-widest text-slate-600 font-bold">
                SECTOR D: GREEN VALLEY RESIDENTIAL
              </div>

              {/* Smart Bin Markers */}
              {filteredBins.map((bin) => {
                const isSelected = inspectingBin?.id === bin.id;
                const isCritical = bin.fillLevel >= alertThreshold;
                const isOverflowing = bin.fillLevel >= 95;

                return (
                  <div
                    key={bin.id}
                    onClick={() => setInspectingBin(bin)}
                    style={{
                      left: `${bin.coordinates.x}%`,
                      top: `${bin.coordinates.y}%`,
                    }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
                  >
                    {/* Pulsing Beacon for Critical or Overflowing Bins */}
                    {isCritical && (
                      <span className="absolute -inset-2 rounded-full bg-rose-500/40 animate-ping"></span>
                    )}

                    {/* Node Dot / Container */}
                    <div
                      className={`relative flex items-center justify-center rounded-xl p-1.5 transition-all shadow-lg ${
                        isOverflowing
                          ? 'bg-rose-500 text-white ring-4 ring-rose-500/30'
                          : isCritical
                          ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-500/30'
                          : bin.fillLevel >= 60
                          ? 'bg-yellow-500 text-slate-950'
                          : 'bg-emerald-500 text-slate-950'
                      } ${isSelected ? 'scale-125 ring-4 ring-cyan-400' : 'hover:scale-110'}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="absolute -top-5 bg-slate-900/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded font-mono border border-slate-700 whitespace-nowrap shadow">
                        {bin.fillLevel}%
                      </span>
                    </div>

                    {/* Hover Tooltip Card */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col w-48 bg-slate-900 border border-slate-700 p-2.5 rounded-xl shadow-xl z-30 pointer-events-none text-left">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800 pb-1 mb-1">
                        <span className="font-mono font-bold text-white">{bin.code}</span>
                        <span className="text-emerald-400 font-semibold">{bin.zone}</span>
                      </div>
                      <span className="text-xs font-bold text-white leading-tight">{bin.name}</span>
                      <span className="text-[10px] text-slate-400 truncate">{bin.locationName}</span>
                      <div className="mt-2 flex items-center justify-between text-[11px] font-bold">
                        <span className="text-slate-300">Fill Level:</span>
                        <span className={bin.fillLevel >= alertThreshold ? 'text-rose-400' : 'text-emerald-400'}>
                          {bin.fillLevel}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Bin Telemetry Inspector (4 cols) */}
          <div className="lg:col-span-4">
            {inspectingBin ? (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                        {inspectingBin.code}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          getStatusColor(inspectingBin.fillLevel)
                        }`}
                      >
                        {inspectingBin.fillLevel >= 95
                          ? 'OVERFLOW'
                          : inspectingBin.fillLevel >= alertThreshold
                          ? 'ALERT'
                          : inspectingBin.fillLevel >= 60
                          ? 'MODERATE'
                          : 'NORMAL'}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mt-1.5">{inspectingBin.name}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      {inspectingBin.locationName} ({inspectingBin.zone})
                    </p>
                  </div>
                </div>

                {/* Stream Type Pill */}
                <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Waste Stream:</span>
                  <span
                    className={`font-semibold px-2 py-0.5 rounded border text-[11px] ${
                      getBinTypeLabel(inspectingBin.binType).color
                    }`}
                  >
                    {getBinTypeLabel(inspectingBin.binType).label}
                  </span>
                </div>

                {/* Fill Level Big Gauge */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">Live Ultrasonic Fill Level</span>
                    <span className="font-mono font-bold text-base text-white">
                      {inspectingBin.fillLevel}% ({Math.round((inspectingBin.capacityLiters * inspectingBin.fillLevel) / 100)} / {inspectingBin.capacityLiters} L)
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      style={{ width: `${inspectingBin.fillLevel}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${
                        inspectingBin.fillLevel >= 95
                          ? 'bg-rose-500 animate-pulse'
                          : inspectingBin.fillLevel >= alertThreshold
                          ? 'bg-amber-500'
                          : inspectingBin.fillLevel >= 60
                          ? 'bg-yellow-500'
                          : 'bg-emerald-500'
                      }`}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Empty (0%)</span>
                    <span>Alert Limit ({alertThreshold}%)</span>
                    <span>Max (100%)</span>
                  </div>
                </div>

                {/* IoT Sensor Readings */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <Battery className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-400 block">Battery</span>
                    <span className="text-xs font-bold text-white font-mono">{inspectingBin.batteryLevel}%</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <Thermometer className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-400 block">Temp</span>
                    <span className="text-xs font-bold text-white font-mono">{inspectingBin.temperatureC}°C</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <Wind className="w-4 h-4 text-teal-400 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-400 block">Odor Sensor</span>
                    <span className="text-xs font-bold text-white font-mono">{inspectingBin.odorLevel}</span>
                  </div>
                </div>

                {/* 24-Hour Sparkline Visual */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>24h Fill Progression</span>
                    <span className="text-slate-500">Hourly Telemetry</span>
                  </div>
                  <div className="h-14 flex items-end gap-1 pt-2">
                    {inspectingBin.fillHistory.map((val, idx) => (
                      <div
                        key={idx}
                        title={`Hour ${idx}: ${val}%`}
                        style={{ height: `${Math.max(10, val)}%` }}
                        className={`flex-1 rounded-t transition-all ${
                          val >= alertThreshold ? 'bg-amber-400' : 'bg-emerald-500/70 hover:bg-emerald-400'
                        }`}
                      ></div>
                    ))}
                  </div>
                </div>

                {/* Interactive Actions: Empty vs Simulate Waste Influx */}
                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => onEmptyBin(inspectingBin.id)}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Empty Bin (Simulate Crew Collection)</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onSimulateFill(inspectingBin.id, 15)}
                      className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5 text-amber-400" />
                      <span>Add Waste (+15%)</span>
                    </button>

                    <button
                      onClick={() => onSimulateFill(inspectingBin.id, -20)}
                      className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Reduce (-20%)</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
                Select a smart bin on the map to inspect its real-time telemetry.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Grid Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBins.map((bin) => {
            const isCritical = bin.fillLevel >= alertThreshold;
            const isOverflowing = bin.fillLevel >= 95;

            return (
              <div
                key={bin.id}
                className={`bg-slate-900/90 border rounded-2xl p-5 shadow-sm space-y-4 transition-all ${
                  isOverflowing
                    ? 'border-rose-500/60 ring-1 ring-rose-500/40'
                    : isCritical
                    ? 'border-amber-500/60 ring-1 ring-amber-500/40'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-slate-400">{bin.code}</span>
                    <h4 className="text-base font-bold text-white mt-0.5">{bin.name}</h4>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {bin.locationName}
                    </p>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(
                      bin.fillLevel
                    )}`}
                  >
                    {isOverflowing ? 'OVERFLOW' : isCritical ? 'ALERT' : `${bin.fillLevel}%`}
                  </span>
                </div>

                {/* Fill Level Meter */}
                <div>
                  <div className="flex justify-between text-xs text-slate-300 font-semibold mb-1">
                    <span>Fill Status</span>
                    <span className="font-mono">{bin.fillLevel}% ({bin.capacityLiters}L)</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden">
                    <div
                      style={{ width: `${bin.fillLevel}%` }}
                      className={`h-full rounded-full ${
                        isOverflowing
                          ? 'bg-rose-500'
                          : isCritical
                          ? 'bg-amber-500'
                          : bin.fillLevel >= 60
                          ? 'bg-yellow-500'
                          : 'bg-emerald-500'
                      }`}
                    ></div>
                  </div>
                </div>

                {/* Sub-metrics */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs border-t border-slate-800/80 pt-3">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Stream</span>
                    <span className="text-xs font-semibold text-slate-300 truncate block">
                      {getBinTypeLabel(bin.binType).label}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Battery</span>
                    <span className="text-xs font-semibold text-emerald-400">{bin.batteryLevel}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Temp</span>
                    <span className="text-xs font-semibold text-slate-300">{bin.temperatureC}°C</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => onEmptyBin(bin.id)}
                    className="flex-1 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 font-semibold text-xs transition-colors flex items-center justify-center gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Empty</span>
                  </button>

                  <button
                    onClick={() => {
                      setInspectingBin(bin);
                      setViewMode('map');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                  >
                    Inspect
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add New Smart Bin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400" />
                Deploy New IoT Smart Bin
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBin} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Bin Identifier Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Waterfront Pier West Multi-Sort"
                  value={newBinName}
                  onChange={(e) => setNewBinName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Location / Street Landmark
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Pier 12 Ferry Terminal Gate 3"
                  value={newBinLocation}
                  onChange={(e) => setNewBinLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Municipal Zone
                  </label>
                  <select
                    value={newBinZone}
                    onChange={(e) => setNewBinZone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {zones.map((z) => (
                      <option key={z} value={z}>
                        {z}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Waste Stream
                  </label>
                  <select
                    value={newBinType}
                    onChange={(e) => setNewBinType(e.target.value as BinType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="dry_recyclable">Dry Recyclable (Blue)</option>
                    <option value="wet_organic">Wet Organic (Green)</option>
                    <option value="glass_metal">Glass & Metal (Amber)</option>
                    <option value="hazardous_ewaste">Hazardous / E-Waste (Red)</option>
                    <option value="general_waste">General Trash (Grey)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Bin Capacity (Liters)
                </label>
                <select
                  value={newBinCapacity}
                  onChange={(e) => setNewBinCapacity(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value={240}>240 Liters (Standard Curb)</option>
                  <option value={400}>400 Liters (Public Pavilion)</option>
                  <option value={600}>600 Liters (High Traffic)</option>
                  <option value={1100}>1,100 Liters (Commercial Compactor)</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md"
                >
                  Register & Activate Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
