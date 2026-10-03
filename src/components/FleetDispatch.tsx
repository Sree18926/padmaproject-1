import React, { useState } from 'react';
import {
  Truck,
  MapPin,
  Clock,
  Fuel,
  CheckCircle2,
  Navigation,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SmartBin, CollectionRoute } from '../types/waste';
import { INITIAL_FLEET_ROUTES } from '../data/mockData';

interface FleetDispatchProps {
  bins: SmartBin[];
  onEmptyMultipleBins: (binIds: string[]) => void;
  alertThreshold: number;
}

export const FleetDispatch: React.FC<FleetDispatchProps> = ({
  bins,
  onEmptyMultipleBins,
  alertThreshold,
}) => {
  const [routes, setRoutes] = useState<CollectionRoute[]>(INITIAL_FLEET_ROUTES);
  const [isSweeping, setIsSweeping] = useState<boolean>(false);
  const [sweepSuccessMessage, setSweepSuccessMessage] = useState<string | null>(null);

  // Critical bins that require collection
  const criticalBins = bins.filter((b) => b.fillLevel >= alertThreshold);

  // Execute full sweep for critical bins
  const handleTriggerFleetSweep = () => {
    if (criticalBins.length === 0) return;

    setIsSweeping(true);
    setSweepSuccessMessage(null);

    // Simulate collection truck route execution
    setTimeout(() => {
      const binIdsToEmpty = criticalBins.map((b) => b.id);
      onEmptyMultipleBins(binIdsToEmpty);

      setIsSweeping(false);
      setSweepSuccessMessage(
        `Fleet sweep complete! Emptied ${criticalBins.length} high-priority smart bins across city sectors. All alerts resolved.`
      );

      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#10b981', '#06b6d4', '#f59e0b', '#3b82f6'],
      });
    }, 1800);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-400 text-xs font-semibold mb-2">
            <Truck className="w-3.5 h-3.5" />
            <span>AI Automated Logistics & Dynamic Fleet Dispatch</span>
          </div>
          <h2 className="text-xl font-bold text-white">Dynamic Collection Route Optimizer</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time clustering algorithms group bins exceeding the {alertThreshold}% threshold into optimal truck routes,
            cutting carbon emissions and avoiding redundant collection trips.
          </p>
        </div>

        {/* Big Action: Trigger Fleet Sweep */}
        <button
          onClick={handleTriggerFleetSweep}
          disabled={criticalBins.length === 0 || isSweeping}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all"
        >
          {isSweeping ? (
            <>
              <RotateCcw className="w-4 h-4 animate-spin" />
              <span>Simulating Fleet Collection Sweep...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>Execute Fleet Sweep ({criticalBins.length} Bins)</span>
            </>
          )}
        </button>
      </div>

      {sweepSuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{sweepSuccessMessage}</span>
        </div>
      )}

      {/* Critical Bins Awaiting Route Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">
              Critical Bins Requiring Dynamic Pickup ({criticalBins.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Threshold: ≥{alertThreshold}% fill
          </span>
        </div>

        {criticalBins.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {criticalBins.map((bin) => (
              <div
                key={bin.id}
                className="p-3 rounded-xl bg-slate-950 border border-amber-500/30 flex items-center justify-between"
              >
                <div>
                  <span className="font-mono text-[11px] font-bold text-cyan-400">{bin.code}</span>
                  <h4 className="text-xs font-bold text-white mt-0.5">{bin.name}</h4>
                  <span className="text-[10px] text-slate-400 truncate block">{bin.locationName}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold font-mono text-rose-400 block">{bin.fillLevel}%</span>
                  <span className="text-[9px] uppercase font-bold text-slate-500">
                    {bin.binType.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-xl bg-slate-950 text-center text-xs text-emerald-400 font-semibold border border-emerald-500/20">
            ✓ All municipal smart bins are currently below alert threshold. No urgent pickups pending.
          </div>
        )}
      </div>

      {/* Municipal Truck Fleet Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {routes.map((route) => {
          const assignedBins = bins.filter((b) => route.assignedBinIds.includes(b.id));

          return (
            <div
              key={route.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400">{route.truckId}</span>
                    <h3 className="text-sm font-bold text-white">{route.truckName}</h3>
                    <span className="text-xs text-slate-400">Operator: {route.driverName}</span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                    route.status === 'en_route'
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {route.status.replace('_', ' ')}
                </span>
              </div>

              {/* Route KPIs */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 block">Waypoints</span>
                  <span className="text-sm font-bold text-white font-mono">{route.assignedBinIds.length} Bins</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Est. Duration</span>
                  <span className="text-sm font-bold text-cyan-400 font-mono">{route.estimatedDurationMin}m</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Fuel Saved</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono">+{route.estimatedFuelSavingsLiters}L</span>
                </div>
              </div>

              {/* Waypoint Itinerary */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Optimized Route Itinerary:
                </span>
                <div className="space-y-1.5 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  {assignedBins.map((bin, idx) => (
                    <div
                      key={bin.id}
                      className="flex items-center justify-between text-xs text-slate-300 py-1 border-b border-slate-800/60 last:border-0"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-cyan-400 font-mono font-bold flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <div>
                          <span className="font-semibold text-white">{bin.name}</span>
                          <span className="text-[10px] text-slate-500 block truncate">{bin.locationName}</span>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-bold text-amber-400">{bin.fillLevel}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
