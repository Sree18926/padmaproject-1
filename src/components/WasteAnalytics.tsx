import React, { useState } from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  Leaf,
  Layers,
  Download,
  Calendar,
  Zap,
  ShieldCheck,
  Award,
  ArrowUpRight,
  PieChart as PieIcon,
  BarChart2,
  Clock,
} from 'lucide-react';
import { HISTORICAL_WASTE_STATS } from '../data/mockData';
import { SmartBin, CitizenReport, WasteStatDay } from '../types/waste';

interface WasteAnalyticsProps {
  bins: SmartBin[];
  reports: CitizenReport[];
  historicalStats: WasteStatDay[];
}

export const WasteAnalytics: React.FC<WasteAnalyticsProps> = ({
  bins,
  reports,
  historicalStats,
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | 'all'>('7d');
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Compute totals
  const totalVolumeTons = historicalStats.reduce((acc, d) => acc + d.totalTons, 0).toFixed(2);
  const avgDiversion = (
    historicalStats.reduce((acc, d) => acc + d.diversionRatePct, 0) / historicalStats.length
  ).toFixed(1);

  const totalPlasticKg = historicalStats.reduce((acc, d) => acc + d.plasticKg, 0);
  const totalOrganicKg = historicalStats.reduce((acc, d) => acc + d.organicKg, 0);
  const totalPaperKg = historicalStats.reduce((acc, d) => acc + d.paperKg, 0);
  const totalMetalKg = historicalStats.reduce((acc, d) => acc + d.metalKg, 0);
  const totalGlassKg = historicalStats.reduce((acc, d) => acc + d.glassKg, 0);
  const totalEwasteKg = historicalStats.reduce((acc, d) => acc + d.ewasteKg, 0);
  const totalGeneralKg = historicalStats.reduce((acc, d) => acc + d.generalKg, 0);

  const totalAllKg =
    totalPlasticKg +
    totalOrganicKg +
    totalPaperKg +
    totalMetalKg +
    totalGlassKg +
    totalEwasteKg +
    totalGeneralKg;

  // Composition data
  const streamComposition = [
    {
      name: 'Organic / Wet Waste',
      key: 'organic',
      kg: totalOrganicKg,
      color: '#10b981',
      pct: ((totalOrganicKg / totalAllKg) * 100).toFixed(1),
      destination: 'Aerobic Municipal Composter',
    },
    {
      name: 'Recyclable Plastic',
      key: 'plastic',
      kg: totalPlasticKg,
      color: '#38bdf8',
      pct: ((totalPlasticKg / totalAllKg) * 100).toFixed(1),
      destination: 'Pelletizing Extrusion Facility',
    },
    {
      name: 'Paper & Cardboard',
      key: 'paper',
      kg: totalPaperKg,
      color: '#fbbf24',
      pct: ((totalPaperKg / totalAllKg) * 100).toFixed(1),
      destination: 'De-inking Pulp Mill',
    },
    {
      name: 'Glass Cullet',
      key: 'glass',
      kg: totalGlassKg,
      color: '#2dd4bf',
      pct: ((totalGlassKg / totalAllKg) * 100).toFixed(1),
      destination: 'Foundry Remelting Kiln',
    },
    {
      name: 'Aluminum & Scrap Metal',
      key: 'metal',
      kg: totalMetalKg,
      color: '#f59e0b',
      pct: ((totalMetalKg / totalAllKg) * 100).toFixed(1),
      destination: 'Smelter Recycling Loop',
    },
    {
      name: 'Hazardous / E-Waste',
      key: 'ewaste',
      kg: totalEwasteKg,
      color: '#f43f5e',
      pct: ((totalEwasteKg / totalAllKg) * 100).toFixed(1),
      destination: 'Certified Chemical Neutralization',
    },
    {
      name: 'Non-Recyclable Landfill',
      key: 'general',
      kg: totalGeneralKg,
      color: '#64748b',
      pct: ((totalGeneralKg / totalAllKg) * 100).toFixed(1),
      destination: 'Sanitary Landfill Capping',
    },
  ];

  // Equivalencies
  const co2AvoidedTons = (
    ((totalPlasticKg * 1.5 + totalPaperKg * 1.1 + totalMetalKg * 2.2 + totalGlassKg * 0.4) / 1000)
  ).toFixed(2);
  const treesSaved = Math.round(Number(co2AvoidedTons) * 45);
  const kwhSaved = Math.round(Number(co2AvoidedTons) * 1200);

  // Resolution stats
  const resolvedReports = reports.filter((r) => r.status === 'resolved').length;
  const resolutionRatePct = Math.round((resolvedReports / (reports.length || 1)) * 100);

  // Export CSV
  const handleExportData = () => {
    const csvRows = [
      ['Date', 'Day', 'Plastic(kg)', 'Organic(kg)', 'Paper(kg)', 'Metal(kg)', 'Glass(kg)', 'EWaste(kg)', 'General(kg)', 'Total(Tons)', 'DiversionRate(%)'],
      ...historicalStats.map((d) => [
        d.date,
        d.dayName,
        d.plasticKg,
        d.organicKg,
        d.paperKg,
        d.metalKg,
        d.glassKg,
        d.ewasteKg,
        d.generalKg,
        d.totalTons,
        d.diversionRatePct,
      ]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ecopulse_waste_metrics_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 text-xs font-semibold mb-2">
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Municipal Historical Intelligence</span>
          </div>
          <h2 className="text-xl font-bold text-white">Waste Analytics & Diversion Dashboard</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Empowering municipal supervisors with real-time diversion metrics, emission offsets, and zone performance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Timeframe selector */}
          <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <button
              onClick={() => setSelectedTimeframe('7d')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                selectedTimeframe === '7d' ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setSelectedTimeframe('30d')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                selectedTimeframe === '30d' ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setSelectedTimeframe('all')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                selectedTimeframe === 'all' ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Quarterly
            </button>
          </div>

          {/* Export CSV button */}
          <button
            onClick={handleExportData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Collected Volume</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white font-mono">{totalVolumeTons}</span>
            <span className="text-xs text-cyan-400 font-semibold">Metric Tons</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Across 12 smart collection nodes</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Municipal Diversion Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-400 font-mono">{avgDiversion}%</span>
            <span className="text-xs text-emerald-300 font-semibold">+3.8% vs last month</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Diverted from city landfills</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Carbon Offsets Prevented</span>
            <Leaf className="w-4 h-4 text-teal-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-teal-400 font-mono">{co2AvoidedTons}</span>
            <span className="text-xs text-teal-300 font-semibold">Tons CO₂e</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Equivalent to planting {treesSaved} trees</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Complaint Redressal Speed</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-amber-400 font-mono">{resolutionRatePct}%</span>
            <span className="text-xs text-amber-300 font-semibold">1.4 hr avg dispatch</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{resolvedReports} of {reports.length} grievances solved</p>
        </div>
      </div>

      {/* Main Charts Grid: Donut Composition + Weekly Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Donut Waste Stream Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-cyan-400" />
              Waste Stream Composition
            </h3>
            <span className="text-xs font-mono text-slate-400">Total {Math.round(totalAllKg)} kg</span>
          </div>

          {/* SVG Donut Visual */}
          <div className="relative flex items-center justify-center py-2">
            <svg width="220" height="220" viewBox="0 0 220 220" className="transform -rotate-90">
              {(() => {
                const center = 110;
                const radius = 80;
                const strokeWidth = 32;
                const circumference = 2 * Math.PI * radius;
                let currentOffset = 0;

                return streamComposition.map((item, idx) => {
                  const sliceFraction = item.kg / totalAllKg;
                  const strokeDasharray = `${circumference * sliceFraction} ${circumference}`;
                  const strokeDashoffset = -currentOffset;
                  currentOffset += circumference * sliceFraction;

                  const isHovered = hoveredCategory === item.key;

                  return (
                    <circle
                      key={idx}
                      cx={center}
                      cy={center}
                      r={radius}
                      fill="none"
                      stroke={item.color}
                      strokeWidth={isHovered ? strokeWidth + 6 : strokeWidth}
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-300 cursor-pointer"
                      onMouseEnter={() => setHoveredCategory(item.key)}
                      onMouseLeave={() => setHoveredCategory(null)}
                    />
                  );
                });
              })()}
            </svg>

            {/* Inner Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-xs text-slate-400 font-semibold uppercase">Diversion</span>
              <span className="text-2xl font-bold font-mono text-white">{avgDiversion}%</span>
              <span className="text-[10px] text-emerald-400 font-semibold">Recycled</span>
            </div>
          </div>

          {/* Detailed Stream Legend List */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            {streamComposition.map((item) => (
              <div
                key={item.key}
                onMouseEnter={() => setHoveredCategory(item.key)}
                onMouseLeave={() => setHoveredCategory(null)}
                className={`flex items-center justify-between p-2 rounded-lg text-xs transition-colors cursor-pointer ${
                  hoveredCategory === item.key ? 'bg-slate-800' : 'hover:bg-slate-950/60'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  ></span>
                  <span className="text-slate-300 font-medium">{item.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-white mr-2">{item.pct}%</span>
                  <span className="text-[11px] text-slate-400 font-mono">({item.kg} kg)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Daily Waste Generation Trend (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-emerald-400" />
              7-Day Daily Collection Volume (Metric Tons)
            </h3>
            <span className="text-xs text-slate-400">Recyclables vs Organics vs Landfill</span>
          </div>

          {/* Custom SVG Bar Chart */}
          <div className="h-64 w-full flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-slate-800">
            {historicalStats.map((day, idx) => {
              const maxTons = 14;
              const heightPct = (day.totalTons / maxTons) * 100;
              const recyclableTons =
                ((day.plasticKg + day.paperKg + day.metalKg + day.glassKg) / 1000).toFixed(2);
              const organicTons = (day.organicKg / 1000).toFixed(2);
              const landfillTons = (day.generalKg / 1000).toFixed(2);

              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                  {/* Hover tooltip */}
                  <div className="text-[10px] font-mono text-slate-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {day.totalTons}T
                  </div>

                  {/* Stacked Bar */}
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full max-w-[42px] rounded-t-lg overflow-hidden flex flex-col justify-end bg-slate-800 transition-all duration-300 group-hover:ring-2 group-hover:ring-emerald-400/50"
                  >
                    {/* Landfill Segment (Top) */}
                    <div
                      style={{
                        height: `${(Number(landfillTons) / day.totalTons) * 100}%`,
                      }}
                      className="bg-slate-600 w-full"
                      title={`General: ${landfillTons} Tons`}
                    ></div>
                    {/* Recyclables Segment (Middle) */}
                    <div
                      style={{
                        height: `${(Number(recyclableTons) / day.totalTons) * 100}%`,
                      }}
                      className="bg-sky-500 w-full"
                      title={`Recyclables: ${recyclableTons} Tons`}
                    ></div>
                    {/* Organic Segment (Bottom) */}
                    <div
                      style={{
                        height: `${(Number(organicTons) / day.totalTons) * 100}%`,
                      }}
                      className="bg-emerald-500 w-full"
                      title={`Organics: ${organicTons} Tons`}
                    ></div>
                  </div>

                  {/* Day Label */}
                  <span className="text-[11px] font-bold text-slate-400 mt-2">
                    {day.dayName}
                  </span>
                  <span className="text-[9px] text-emerald-400 font-mono">
                    {day.diversionRatePct}%
                  </span>
                </div>
              );
            })}
          </div>

          {/* Bar Chart Legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs pt-1 text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500"></span> Wet Organic Stream
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-sky-500"></span> Dry Recyclables (Plastic, Paper, Metal)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-slate-600"></span> Residual Landfill Waste
            </span>
          </div>

          {/* Eco Impact Equivalencies Banner */}
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-900 border border-emerald-500/20 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
            <div>
              <span className="text-xl font-bold font-mono text-emerald-400 block">{treesSaved}</span>
              <span className="text-[11px] text-slate-400">Tree Carbon Sequestration Eq.</span>
            </div>
            <div>
              <span className="text-xl font-bold font-mono text-cyan-400 block">{kwhSaved.toLocaleString()}</span>
              <span className="text-[11px] text-slate-400">Kilowatt-Hours Clean Energy Saved</span>
            </div>
            <div>
              <span className="text-xl font-bold font-mono text-amber-400 block">{Math.round(totalPlasticKg / 0.025).toLocaleString()}</span>
              <span className="text-[11px] text-slate-400">Single-Use Bottles Diverted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
