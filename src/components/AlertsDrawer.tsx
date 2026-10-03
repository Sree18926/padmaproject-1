import React from 'react';
import {
  X,
  Bell,
  AlertTriangle,
  FileWarning,
  CheckCircle,
  Truck,
  ArrowRight,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import { SmartBin, CitizenReport } from '../types/waste';

interface AlertsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bins: SmartBin[];
  reports: CitizenReport[];
  alertThreshold: number;
  onEmptyBin: (binId: string) => void;
  onSelectTab: (tab: 'classify' | 'monitor' | 'reports' | 'analytics' | 'fleet') => void;
}

export const AlertsDrawer: React.FC<AlertsDrawerProps> = ({
  isOpen,
  onClose,
  bins,
  reports,
  alertThreshold,
  onEmptyBin,
  onSelectTab,
}) => {
  if (!isOpen) return null;

  const criticalBins = bins.filter((b) => b.fillLevel >= alertThreshold);
  const pendingReports = reports.filter((r) => r.status === 'pending');
  const totalAlerts = criticalBins.length + pendingReports.length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <Bell className="w-4 h-4 animate-bounce" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Central Operations Alert Center</h3>
                <span className="text-[11px] text-slate-400">{totalAlerts} Active Warnings Requiring Attention</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Section 1: Critical Bins */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  Bins Exceeding Threshold ({criticalBins.length})
                </h4>
                <button
                  onClick={() => {
                    onSelectTab('monitor');
                    onClose();
                  }}
                  className="text-[11px] text-cyan-400 hover:underline"
                >
                  View on Map
                </button>
              </div>

              {criticalBins.length > 0 ? (
                <div className="space-y-2.5">
                  {criticalBins.map((bin) => (
                    <div
                      key={bin.id}
                      className="p-3 rounded-xl bg-slate-950 border border-amber-500/30 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[10px] font-mono font-bold text-cyan-400">{bin.code}</span>
                          <span className="text-xs font-bold text-white">{bin.name}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 block truncate">{bin.locationName}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold text-rose-400">{bin.fillLevel}%</span>
                        <button
                          onClick={() => onEmptyBin(bin.id)}
                          title="Empty Bin"
                          className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 transition-all"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-950 text-xs text-slate-500 text-center">
                  No bins currently exceeding alert limit.
                </div>
              )}
            </div>

            {/* Section 2: Citizen Complaints Pending */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <FileWarning className="w-4 h-4" />
                  Citizen Reports Awaiting Triage ({pendingReports.length})
                </h4>
                <button
                  onClick={() => {
                    onSelectTab('reports');
                    onClose();
                  }}
                  className="text-[11px] text-cyan-400 hover:underline"
                >
                  Open Grievance Desk
                </button>
              </div>

              {pendingReports.length > 0 ? (
                <div className="space-y-2.5">
                  {pendingReports.map((report) => (
                    <div
                      key={report.id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-mono font-bold text-cyan-300">{report.ticketNumber}</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] uppercase font-bold bg-amber-500/20 text-amber-400">
                          {report.severity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 line-clamp-2">{report.summary}</p>
                      <span className="text-[10px] text-slate-500 block truncate">
                        Location: {report.location}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-950 text-xs text-slate-500 text-center">
                  No pending citizen complaints in queue.
                </div>
              )}
            </div>
          </div>

          {/* Footer Action */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/60">
            <button
              onClick={() => {
                onSelectTab('fleet');
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md"
            >
              <Truck className="w-4 h-4" />
              <span>Open Fleet Route Optimization</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
