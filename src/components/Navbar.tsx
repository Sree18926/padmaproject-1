import React from 'react';
import {
  Recycle,
  ScanLine,
  LayoutDashboard,
  Radio,
  FileWarning,
  Truck,
  Bell,
  BookOpen,
  Sparkles,
  Award,
  Zap,
} from 'lucide-react';
import { SmartBin, CitizenReport } from '../types/waste';

interface NavbarProps {
  currentTab: 'classify' | 'monitor' | 'reports' | 'analytics' | 'fleet';
  setCurrentTab: (tab: 'classify' | 'monitor' | 'reports' | 'analytics' | 'fleet') => void;
  userRole: 'admin' | 'citizen';
  setUserRole: (role: 'admin' | 'citizen') => void;
  bins: SmartBin[];
  reports: CitizenReport[];
  onOpenAlerts: () => void;
  onOpenGuide: () => void;
  isTelemetryActive: boolean;
  toggleTelemetry: () => void;
  citizenPoints: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  userRole,
  setUserRole,
  bins,
  reports,
  onOpenAlerts,
  onOpenGuide,
  isTelemetryActive,
  toggleTelemetry,
  citizenPoints,
}) => {
  const criticalBinsCount = bins.filter((b) => b.fillLevel >= 80).length;
  const pendingReportsCount = reports.filter((r) => r.status === 'pending').length;
  const totalAlerts = criticalBinsCount + pendingReportsCount;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('classify')}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20 text-white font-bold">
              <Recycle className="w-6 h-6 animate-spin-slow" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  EcoPulse<span className="text-emerald-400 font-extrabold">AI</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                  Smart Waste OS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">AI Waste Segregation & IoT Bin Management</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setCurrentTab('classify')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'classify'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ScanLine className="w-4 h-4 text-emerald-400" />
              <span>AI Segregator</span>
            </button>

            <button
              onClick={() => setCurrentTab('monitor')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all relative ${
                currentTab === 'monitor'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Radio className="w-4 h-4 text-cyan-400" />
              <span>Smart Bins</span>
              {criticalBinsCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
                  {criticalBinsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentTab('reports')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all relative ${
                currentTab === 'reports'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileWarning className="w-4 h-4 text-amber-400" />
              <span>Citizen Reports</span>
              {pendingReportsCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  {pendingReportsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentTab('analytics')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'analytics'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-indigo-400" />
              <span>Analytics</span>
            </button>

            <button
              onClick={() => setCurrentTab('fleet')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'fleet'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Truck className="w-4 h-4 text-teal-400" />
              <span>Fleet Dispatch</span>
            </button>
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center space-x-3">
            {/* Telemetry Stream simulation toggle */}
            <button
              onClick={toggleTelemetry}
              title={isTelemetryActive ? 'IoT Telemetry Simulation: Active (Click to Pause)' : 'IoT Telemetry Simulation: Paused (Click to Resume)'}
              className={`hidden lg:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                isTelemetryActive
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-800/60 border-slate-700 text-slate-400'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${isTelemetryActive ? 'text-emerald-400 fill-emerald-400/30' : 'text-slate-400'}`} />
              <span>IoT Feed: {isTelemetryActive ? 'Live' : 'Paused'}</span>
            </button>

            {/* Eco Points pill */}
            <div
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold cursor-pointer hover:bg-amber-500/20 transition-all"
              onClick={onOpenGuide}
              title="Click to view Waste Segregation Rules & Badges"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>{citizenPoints} pts</span>
            </div>

            {/* Segregation Guide */}
            <button
              onClick={onOpenGuide}
              title="Civic Waste Segregation Rules"
              className="p-2 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
            >
              <BookOpen className="w-5 h-5" />
            </button>

            {/* Alert Bell Button */}
            <button
              onClick={onOpenAlerts}
              className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="System Alerts & Overflow Warning Center"
            >
              <Bell className="w-5 h-5" />
              {totalAlerts > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-slate-900 animate-bounce">
                  {totalAlerts}
                </span>
              )}
            </button>

            {/* Role switch toggle */}
            <div className="flex items-center p-1 rounded-lg bg-slate-800/80 border border-slate-700 text-xs font-medium">
              <button
                onClick={() => setUserRole('citizen')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  userRole === 'citizen'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Citizen
              </button>
              <button
                onClick={() => setUserRole('admin')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  userRole === 'admin'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Admin
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Sub-Navigation */}
        <div className="flex md:hidden overflow-x-auto py-2 space-x-1 border-t border-slate-800/60 no-scrollbar">
          <button
            onClick={() => setCurrentTab('classify')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              currentTab === 'classify' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400'
            }`}
          >
            <ScanLine className="w-3.5 h-3.5" />
            <span>AI Segregator</span>
          </button>
          <button
            onClick={() => setCurrentTab('monitor')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              currentTab === 'monitor' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Smart Bins ({criticalBinsCount})</span>
          </button>
          <button
            onClick={() => setCurrentTab('reports')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              currentTab === 'reports' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400'
            }`}
          >
            <FileWarning className="w-3.5 h-3.5" />
            <span>Reports ({pendingReportsCount})</span>
          </button>
          <button
            onClick={() => setCurrentTab('analytics')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              currentTab === 'analytics' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Analytics</span>
          </button>
          <button
            onClick={() => setCurrentTab('fleet')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              currentTab === 'fleet' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Fleet</span>
          </button>
        </div>
      </div>
    </header>
  );
};
