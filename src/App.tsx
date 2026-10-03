import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { WasteClassifier } from './components/WasteClassifier';
import { BinMonitor } from './components/BinMonitor';
import { CitizenReporting } from './components/CitizenReporting';
import { WasteAnalytics } from './components/WasteAnalytics';
import { FleetDispatch } from './components/FleetDispatch';
import { AlertsDrawer } from './components/AlertsDrawer';
import { EcoGuideModal } from './components/EcoGuideModal';
import {
  INITIAL_SMART_BINS,
  INITIAL_REPORTS,
  HISTORICAL_WASTE_STATS,
} from './data/mockData';
import { SmartBin, CitizenReport, WasteStatDay, ReportStatus } from './types/waste';
import { AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';

export default function App() {
  // Navigation & Role State
  const [currentTab, setCurrentTab] = useState<'classify' | 'monitor' | 'reports' | 'analytics' | 'fleet'>('classify');
  const [userRole, setUserRole] = useState<'admin' | 'citizen'>('citizen');

  // Core Data with LocalStorage Persistence
  const [bins, setBins] = useState<SmartBin[]>(() => {
    try {
      const saved = localStorage.getItem('ecopulse_bins');
      return saved ? JSON.parse(saved) : INITIAL_SMART_BINS;
    } catch {
      return INITIAL_SMART_BINS;
    }
  });

  const [reports, setReports] = useState<CitizenReport[]>(() => {
    try {
      const saved = localStorage.getItem('ecopulse_reports');
      return saved ? JSON.parse(saved) : INITIAL_REPORTS;
    } catch {
      return INITIAL_REPORTS;
    }
  });

  const [historicalStats, setHistoricalStats] = useState<WasteStatDay[]>(() => {
    try {
      const saved = localStorage.getItem('ecopulse_stats');
      return saved ? JSON.parse(saved) : HISTORICAL_WASTE_STATS;
    } catch {
      return HISTORICAL_WASTE_STATS;
    }
  });

  const [citizenPoints, setCitizenPoints] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('ecopulse_points');
      return saved ? Number(saved) : 175;
    } catch {
      return 175;
    }
  });

  // System Settings
  const [alertThreshold, setAlertThreshold] = useState<number>(80);
  const [isTelemetryActive, setIsTelemetryActive] = useState<boolean>(true);
  const [isAlertsOpen, setIsAlertsOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('ecopulse_bins', JSON.stringify(bins));
  }, [bins]);

  useEffect(() => {
    localStorage.setItem('ecopulse_reports', JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem('ecopulse_points', String(citizenPoints));
  }, [citizenPoints]);

  // Toast helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Add eco-points
  const addPoints = (amount: number, reason: string) => {
    setCitizenPoints((prev) => prev + amount);
    showToast(`+${amount} Eco-Points Earned! ${reason}`);
  };

  // IoT Telemetry Simulation Timer (runs when active)
  useEffect(() => {
    if (!isTelemetryActive) return;

    const interval = setInterval(() => {
      setBins((prevBins) => {
        // Pick one or two random bins to simulate waste deposit or sensor jitter
        const randomIndex = Math.floor(Math.random() * prevBins.length);
        return prevBins.map((bin, i) => {
          if (i === randomIndex) {
            const increment = Math.floor(1 + Math.random() * 3);
            const newFill = Math.min(100, bin.fillLevel + increment);
            const newHistory = [...bin.fillHistory.slice(1), newFill];
            const newStatus =
              newFill >= 95 ? 'overflowing' : newFill >= alertThreshold ? 'critical' : newFill >= 60 ? 'moderate' : 'normal';

            return {
              ...bin,
              fillLevel: newFill,
              status: newStatus,
              fillHistory: newHistory,
              temperatureC: Math.round(20 + Math.random() * 5),
            };
          }
          return bin;
        });
      });
    }, 9000);

    return () => clearInterval(interval);
  }, [isTelemetryActive, alertThreshold]);

  // Bin actions
  const handleEmptyBin = (binId: string) => {
    setBins((prev) =>
      prev.map((b) => {
        if (b.id === binId) {
          return {
            ...b,
            fillLevel: 5,
            status: 'normal',
            lastEmptied: new Date().toISOString(),
            fillHistory: [...b.fillHistory.slice(1), 5],
          };
        }
        return b;
      })
    );
    showToast('Bin emptied and reset to 5% baseline capacity.');
  };

  const handleEmptyMultipleBins = (binIds: string[]) => {
    setBins((prev) =>
      prev.map((b) => {
        if (binIds.includes(b.id)) {
          return {
            ...b,
            fillLevel: 4,
            status: 'normal',
            lastEmptied: new Date().toISOString(),
            fillHistory: [...b.fillHistory.slice(1), 4],
          };
        }
        return b;
      })
    );
  };

  const handleSimulateFill = (binId: string, amount: number) => {
    setBins((prev) =>
      prev.map((b) => {
        if (b.id === binId) {
          const newLevel = Math.max(0, Math.min(100, b.fillLevel + amount));
          const newStatus =
            newLevel >= 95 ? 'overflowing' : newLevel >= alertThreshold ? 'critical' : newLevel >= 60 ? 'moderate' : 'normal';
          return {
            ...b,
            fillLevel: newLevel,
            status: newStatus,
            fillHistory: [...b.fillHistory.slice(1), newLevel],
          };
        }
        return b;
      })
    );
  };

  const handleAddBin = (newBin: Omit<SmartBin, 'id' | 'fillHistory'>) => {
    const fullBin: SmartBin = {
      ...newBin,
      id: `bin-${Date.now()}`,
      fillHistory: [10, 12, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15],
    };
    setBins((prev) => [...prev, fullBin]);
    showToast(`New IoT node ${fullBin.code} activated in ${fullBin.zone}.`);
  };

  // Disposal logged from AI Segregator
  const handleDisposalLogged = (category: string, binId: string, carbonSaved: number) => {
    // Increment target bin fill level by 2%
    setBins((prev) =>
      prev.map((b) => {
        if (b.id === binId) {
          const nextFill = Math.min(100, b.fillLevel + 2);
          return {
            ...b,
            fillLevel: nextFill,
            status:
              nextFill >= 95 ? 'overflowing' : nextFill >= alertThreshold ? 'critical' : nextFill >= 60 ? 'moderate' : 'normal',
          };
        }
        return b;
      })
    );

    // Update today's stats
    setHistoricalStats((prev) => {
      const today = prev[prev.length - 1];
      if (!today) return prev;

      const updatedToday: WasteStatDay = {
        ...today,
        plasticKg: category === 'plastic' ? today.plasticKg + 2 : today.plasticKg,
        organicKg: category === 'organic' ? today.organicKg + 3 : today.organicKg,
        paperKg: category === 'paper' ? today.paperKg + 2 : today.paperKg,
        metalKg: category === 'metal' ? today.metalKg + 1 : today.metalKg,
        glassKg: category === 'glass' ? today.glassKg + 2 : today.glassKg,
        ewasteKg: category === 'hazardous_ewaste' ? today.ewasteKg + 1 : today.ewasteKg,
        generalKg: category === 'other' ? today.generalKg + 2 : today.generalKg,
        totalTons: Number((today.totalTons + 0.002).toFixed(3)),
      };

      return [...prev.slice(0, prev.length - 1), updatedToday];
    });
  };

  // Citizen report actions
  const handleSubmitReport = (newReport: CitizenReport) => {
    setReports((prev) => [newReport, ...prev]);
    showToast(`Ticket ${newReport.ticketNumber} registered. Alert sent to dispatch.`);
  };

  const handleUpdateReportStatus = (
    reportId: string,
    status: ReportStatus,
    adminNotes?: string,
    crew?: string,
    resolutionPhoto?: string
  ) => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id === reportId) {
          return {
            ...r,
            status,
            adminNotes: adminNotes || r.adminNotes,
            assignedCrew: crew || r.assignedCrew,
            resolutionPhotoUrl: resolutionPhoto || r.resolutionPhotoUrl,
            resolutionTimestamp: status === 'resolved' ? new Date().toISOString() : r.resolutionTimestamp,
          };
        }
        return r;
      })
    );
    showToast(`Report status updated to "${status.toUpperCase()}".`);
  };

  // Reset to default demo data
  const handleResetData = () => {
    setBins(INITIAL_SMART_BINS);
    setReports(INITIAL_REPORTS);
    setHistoricalStats(HISTORICAL_WASTE_STATS);
    setCitizenPoints(175);
    localStorage.clear();
    showToast('Demo environment reset to initial defaults.');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Primary Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        userRole={userRole}
        setUserRole={setUserRole}
        bins={bins}
        reports={reports}
        onOpenAlerts={() => setIsAlertsOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        isTelemetryActive={isTelemetryActive}
        toggleTelemetry={() => setIsTelemetryActive(!isTelemetryActive)}
        citizenPoints={citizenPoints}
      />

      {/* Main App Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'classify' && (
          <WasteClassifier
            smartBins={bins}
            onDisposalLogged={handleDisposalLogged}
            addPoints={addPoints}
          />
        )}

        {currentTab === 'monitor' && (
          <BinMonitor
            bins={bins}
            onEmptyBin={handleEmptyBin}
            onSimulateFill={handleSimulateFill}
            onAddBin={handleAddBin}
            alertThreshold={alertThreshold}
            setAlertThreshold={setAlertThreshold}
            onDispatchRouteForCritical={() => setCurrentTab('fleet')}
          />
        )}

        {currentTab === 'reports' && (
          <CitizenReporting
            reports={reports}
            onSubmitReport={handleSubmitReport}
            onUpdateReportStatus={handleUpdateReportStatus}
            userRole={userRole}
            addPoints={addPoints}
          />
        )}

        {currentTab === 'analytics' && (
          <WasteAnalytics
            bins={bins}
            reports={reports}
            historicalStats={historicalStats}
          />
        )}

        {currentTab === 'fleet' && (
          <FleetDispatch
            bins={bins}
            onEmptyMultipleBins={handleEmptyMultipleBins}
            alertThreshold={alertThreshold}
          />
        )}
      </main>

      {/* Alerts Drawer Slide-over */}
      <AlertsDrawer
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        bins={bins}
        reports={reports}
        alertThreshold={alertThreshold}
        onEmptyBin={handleEmptyBin}
        onSelectTab={(tab) => setCurrentTab(tab)}
      />

      {/* Segregation Rules & Badges Guide Modal */}
      <EcoGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        citizenPoints={citizenPoints}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 bg-slate-900 border border-emerald-500/50 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl shadow-emerald-500/20 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>EcoPulse AI Municipal Smart Waste Management System</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleResetData}
              className="text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
              title="Reset sample data"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Demo State</span>
            </button>
            <span>•</span>
            <span>Multi-modal Computer Vision & IoT Telemetry</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
