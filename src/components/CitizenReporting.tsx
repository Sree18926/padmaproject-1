import React, { useState, useRef } from 'react';
import {
  FileWarning,
  Camera,
  Upload,
  MapPin,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
  Search,
  CheckCircle,
  Truck,
  ArrowRight,
  ShieldAlert,
  Send,
  ExternalLink,
  ChevronRight,
  Filter,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SAMPLE_REPORT_PRESETS } from '../data/mockData';
import { CitizenReport, ReportIssueType, ReportSeverity, ReportStatus } from '../types/waste';

interface CitizenReportingProps {
  reports: CitizenReport[];
  onSubmitReport: (report: CitizenReport) => void;
  onUpdateReportStatus: (
    reportId: string,
    status: ReportStatus,
    adminNotes?: string,
    crew?: string,
    resolutionPhoto?: string
  ) => void;
  userRole: 'admin' | 'citizen';
  addPoints: (amount: number, reason: string) => void;
}

export const CitizenReporting: React.FC<CitizenReportingProps> = ({
  reports,
  onSubmitReport,
  onUpdateReportStatus,
  userRole,
  addPoints,
}) => {
  const [activeTab, setActiveTab] = useState<'submit' | 'browse' | 'track'>('submit');
  const [ticketSearch, setTicketSearch] = useState<string>('');
  const [selectedReport, setSelectedReport] = useState<CitizenReport | null>(reports[0] || null);

  // New report form state
  const [citizenName, setCitizenName] = useState<string>('Alex Rivera');
  const [locationName, setLocationName] = useState<string>('Market Square Central Plaza');
  const [zone, setZone] = useState<string>('Market Square');
  const [reportPhoto, setReportPhoto] = useState<string>(SAMPLE_REPORT_PRESETS[0].dataUrl);
  const [userNotes, setUserNotes] = useState<string>(SAMPLE_REPORT_PRESETS[0].notes);
  const [issueType, setIssueType] = useState<ReportIssueType>('overflowing_bin');
  const [severity, setSeverity] = useState<ReportSeverity>('critical');
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState<boolean>(false);
  const [aiAnalysisSummary, setAiAnalysisSummary] = useState<any>({
    summary: 'Public commercial container overflowing into pedestrian walkway with scattered food and paper waste.',
    detectedItems: ['Cardboard boxes', 'Soda cups', 'Polystyrene foam', 'Food scraps'],
    estimatedVolumeKg: 45,
    hazardDetected: true,
    hazardNotes: 'Sidewalk blockage and hygiene risk near open-air food stalls.',
    suggestedAction: 'Deploy high-capacity compactor crew and sanitize surrounding curb.',
  });
  const [submissionSuccessTicket, setSubmissionSuccessTicket] = useState<string | null>(null);

  // Admin action states
  const [adminNotesInput, setAdminNotesInput] = useState<string>('');
  const [selectedCrew, setSelectedCrew] = useState<string>('Crew Alpha (Compactor 101)');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Trigger AI analysis on the report image
  const analyzeReportImage = async (imageDataUrl: string, notes?: string) => {
    setIsAnalyzingPhoto(true);
    try {
      const response = await fetch('/api/analyze-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageDataUrl,
          notes: notes || userNotes,
          location: locationName,
        }),
      });

      if (!response.ok) throw new Error('Failed to analyze image');
      const data = await response.json();
      setAiAnalysisSummary(data);
      if (data.issueType) setIssueType(data.issueType as ReportIssueType);
      if (data.severity) setSeverity(data.severity as ReportSeverity);
    } catch (err) {
      console.warn('AI Report analysis error, using smart fallback heuristics:', err);
      setAiAnalysisSummary({
        summary: 'Waste accumulation identified in civic zone requiring municipal collection.',
        detectedItems: ['Dry recyclables', 'Mixed packaging', 'Spilled debris'],
        estimatedVolumeKg: 30,
        hazardDetected: false,
        hazardNotes: 'No acute chemical hazard; minor aesthetic and pedestrian obstacle.',
        suggestedAction: 'Route collection unit within standard 4-hour window.',
      });
    } finally {
      setIsAnalyzingPhoto(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setReportPhoto(dataUrl);
        analyzeReportImage(dataUrl, `File: ${file.name}`);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPreset = (preset: (typeof SAMPLE_REPORT_PRESETS)[0]) => {
    setReportPhoto(preset.dataUrl);
    setLocationName(preset.location);
    setZone(preset.zone);
    setUserNotes(preset.notes);
    analyzeReportImage(preset.dataUrl, preset.notes);
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocationName(`GPS: Lat ${pos.coords.latitude.toFixed(4)}, Lng ${pos.coords.longitude.toFixed(4)}`);
        },
        () => {
          setLocationName('Downtown Commercial Hub, Sector 3');
        }
      );
    } else {
      setLocationName('Downtown Commercial Hub, Sector 3');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTicket = `REP-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newReport: CitizenReport = {
      id: `rep-${Date.now()}`,
      ticketNumber: newTicket,
      timestamp: new Date().toISOString(),
      citizenName: citizenName || 'Anonymous Citizen',
      location: locationName,
      zone: zone,
      photoUrl: reportPhoto,
      issueType: issueType,
      severity: severity,
      status: 'pending',
      summary: aiAnalysisSummary.summary || userNotes,
      detectedItems: aiAnalysisSummary.detectedItems || ['Mixed municipal waste'],
      estimatedVolumeKg: aiAnalysisSummary.estimatedVolumeKg || 25,
      hazardDetected: Boolean(aiAnalysisSummary.hazardDetected),
      hazardNotes: aiAnalysisSummary.hazardNotes || 'None identified',
      suggestedAction: aiAnalysisSummary.suggestedAction || 'Municipal dispatch scheduled',
    };

    onSubmitReport(newReport);
    addPoints(50, `Submitted verified waste report ${newTicket}`);

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#38bdf8', '#34d399', '#f59e0b', '#10b981'],
    });

    setSubmissionSuccessTicket(newTicket);
    setSelectedReport(newReport);
  };

  // Filter reports for browsing
  const filteredReports = reports.filter((r) => {
    const matchesFilter = statusFilter === 'all' || r.status === statusFilter;
    const matchesSearch =
      r.ticketNumber.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      r.location.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      r.citizenName.toLowerCase().includes(ticketSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getSeverityBadge = (sev: ReportSeverity) => {
    switch (sev) {
      case 'critical':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/50';
      case 'high':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    }
  };

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case 'resolved':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'assigned':
        return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
      case 'rejected':
        return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
      default:
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-2">
            <FileWarning className="w-3.5 h-3.5" />
            <span>Citizen Grievance & Overflow Redressal Portal</span>
          </div>
          <h2 className="text-xl font-bold text-white">Community Waste Reporting & AI Triage</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Empower citizens to report overflowing bins, illegal dumping, or damaged bins. Gemini AI
            automatically analyzes photo evidence, scores urgency, and routes to municipal crews.
          </p>
        </div>

        {/* Mode Switch Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('submit')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'submit'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            File New Report (+50 Pts)
          </button>
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'browse'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Reports ({reports.length})
          </button>
          <button
            onClick={() => setActiveTab('track')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'track'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Track Ticket
          </button>
        </div>
      </div>

      {/* Mode 1: Submit New Report Form */}
      {activeTab === 'submit' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form: Photo & Location (6 cols) */}
          <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-400" />
              1. Photographic Evidence & Location
            </h3>

            {/* Photo preview viewport */}
            <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
              {reportPhoto ? (
                <div className="relative w-full h-full">
                  <img src={reportPhoto} alt="Report evidence" className="w-full h-full object-cover" />
                  {isAnalyzingPhoto && (
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center">
                      <Sparkles className="w-8 h-8 text-amber-400 animate-spin" />
                      <p className="mt-2 text-xs font-mono text-amber-300 animate-pulse">
                        AI INSPECTING OVERFLOW & HAZARDS...
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-6 text-slate-500">
                  <Camera className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                  <p className="text-xs">No photo selected</p>
                </div>
              )}
            </div>

            {/* Upload or Preset Buttons */}
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                <span>Upload Photo</span>
              </button>

              <button
                type="button"
                onClick={() => analyzeReportImage(reportPhoto)}
                disabled={isAnalyzingPhoto}
                className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Re-Analyze</span>
              </button>
            </div>

            {/* Quick Preset Samples for Testing */}
            <div>
              <span className="block text-[11px] font-semibold uppercase text-slate-400 mb-2">
                Or pick a real sample report incident:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {SAMPLE_REPORT_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/70 hover:border-slate-700 text-left transition-all group"
                  >
                    <span className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 block line-clamp-1">
                      {preset.title}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                      {preset.location}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Location & Citizen inputs */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-400">Incident Location</label>
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <MapPin className="w-3 h-3" />
                    Use Current GPS
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Municipal Zone
                  </label>
                  <select
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Market Square">Market Square</option>
                    <option value="Downtown Commercial">Downtown Commercial</option>
                    <option value="Waterfront Promenade">Waterfront Promenade</option>
                    <option value="Innovation Tech Park">Innovation Tech Park</option>
                    <option value="Metro University Campus">Metro University Campus</option>
                    <option value="Green Valley Residential">Green Valley Residential</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Reporter Name
                  </label>
                  <input
                    type="text"
                    value={citizenName}
                    onChange={(e) => setCitizenName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Form: AI Triage & Submission (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  2. AI Automated Triage & Assessment
                </h3>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                  Gemini Vision 3.8
                </span>
              </div>

              {/* AI Detection Summary Card */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">Classified Issue:</span>
                  <span
                    className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getSeverityBadge(
                      severity
                    )}`}
                  >
                    {severity} Severity
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  {aiAnalysisSummary.summary}
                </p>

                {/* Detected Waste Items Pill List */}
                {aiAnalysisSummary.detectedItems && (
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">
                      Visual Evidence Detected:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {aiAnalysisSummary.detectedItems.map((item: string, i: number) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-slate-300 border border-slate-700"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Acute Hazard Warning if detected */}
                {aiAnalysisSummary.hazardDetected && (
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                    <div>
                      <span className="font-bold text-rose-200">Public Hazard Alert: </span>
                      {aiAnalysisSummary.hazardNotes}
                    </div>
                  </div>
                )}

                {/* Suggested Action */}
                <div className="text-xs text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
                  <span>Est. Volume: <strong className="text-white font-mono">{aiAnalysisSummary.estimatedVolumeKg || 30} kg</strong></span>
                  <span className="text-emerald-400 font-semibold">{aiAnalysisSummary.suggestedAction}</span>
                </div>
              </div>

              {/* Manual Category / Severity override */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Complaint Category
                  </label>
                  <select
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value as ReportIssueType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="overflowing_bin">Overflowing Public Bin</option>
                    <option value="illegal_dumping">Illegal Roadside Dumping</option>
                    <option value="hazardous_waste">Hazardous Chemical / E-Waste</option>
                    <option value="damaged_bin">Damaged Bin / Latch Broken</option>
                    <option value="general_litter">General Scatter Litter</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Priority Severity
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as ReportSeverity)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="low">Low (Standard Routine)</option>
                    <option value="medium">Medium (Priority)</option>
                    <option value="high">High (Urgent)</option>
                    <option value="critical">Critical (Immediate Dispatch)</option>
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                <Send className="w-4 h-4" />
                Submit Citizen Report & Claim +50 Eco-Points
              </button>

              {/* Success Notification */}
              {submissionSuccessTicket && (
                <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs space-y-1">
                  <div className="flex items-center gap-2 font-bold text-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Report Filed Successfully!</span>
                  </div>
                  <p>
                    Tracking Ticket:{' '}
                    <strong className="text-white font-mono bg-slate-950 px-2 py-0.5 rounded border border-emerald-500/40">
                      {submissionSuccessTicket}
                    </strong>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Municipal authorities notified. You earned 50 Green Citizen Points!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Browse All Reports (Kanban / Triage List) */}
      {activeTab === 'browse' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Reports List (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search ticket, citizen, street..."
                  value={ticketSearch}
                  onChange={(e) => setTicketSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All ({reports.length})</option>
                <option value="pending">Pending</option>
                <option value="assigned">Assigned</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            {/* List */}
            <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
              {filteredReports.map((report) => {
                const isSelected = selectedReport?.id === report.id;
                return (
                  <div
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-900 border-emerald-500/60 ring-1 ring-emerald-500/40'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-mono font-bold text-white">{report.ticketNumber}</span>
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getStatusBadge(
                          report.status
                        )}`}
                      >
                        {report.status}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-200 line-clamp-1">{report.summary}</h4>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        {report.location}
                      </span>
                      <span
                        className={`font-semibold px-1.5 py-0.2 rounded border ${getSeverityBadge(
                          report.severity
                        )}`}
                      >
                        {report.severity}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Report Detail Inspector & Admin Resolution Panel (7 cols) */}
          <div className="lg:col-span-7">
            {selectedReport ? (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                        {selectedReport.ticketNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${getStatusBadge(
                          selectedReport.status
                        )}`}
                      >
                        {selectedReport.status}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${getSeverityBadge(
                          selectedReport.severity
                        )}`}
                      >
                        {selectedReport.severity}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-1.5">{selectedReport.summary}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      {selectedReport.location} ({selectedReport.zone})
                    </p>
                  </div>
                </div>

                {/* Photo & Findings */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl overflow-hidden aspect-[4/3] bg-slate-950 border border-slate-800">
                    <img
                      src={selectedReport.photoUrl}
                      alt="Complaint photo"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Citizen Reporter
                      </span>
                      <span className="font-semibold text-white block">{selectedReport.citizenName}</span>
                      <span className="text-[11px] text-slate-500 block">
                        Logged on: {new Date(selectedReport.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        AI Recommended Dispatch
                      </span>
                      <span className="font-semibold text-emerald-400 block">
                        {selectedReport.suggestedAction}
                      </span>
                      <span className="text-[11px] text-slate-400 block">
                        Est. Volume: {selectedReport.estimatedVolumeKg} kg
                      </span>
                    </div>
                  </div>
                </div>

                {/* Admin Actions Panel */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-cyan-400" />
                    Municipal Dispatch & Status Update
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Assign Cleanup Crew</label>
                      <select
                        value={selectedCrew}
                        onChange={(e) => setSelectedCrew(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                      >
                        <option value="Crew Alpha (Compactor 101)">Crew Alpha (Compactor 101)</option>
                        <option value="Crew Bravo (Compactor 102)">Crew Bravo (Compactor 102)</option>
                        <option value="Crew Delta (Rapid Hazmat Sweep)">Crew Delta (Rapid Hazmat Sweep)</option>
                        <option value="Civic Works Maintenance Unit">Civic Works Maintenance Unit</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Administrative Notes</label>
                      <input
                        type="text"
                        placeholder="e.g., Crew dispatched; curbside cleared."
                        value={adminNotesInput}
                        onChange={(e) => setAdminNotesInput(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() =>
                        onUpdateReportStatus(
                          selectedReport.id,
                          'assigned',
                          adminNotesInput || 'Assigned to municipal cleanup team.',
                          selectedCrew
                        )
                      }
                      className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors"
                    >
                      Assign & Mark In Progress
                    </button>

                    <button
                      onClick={() =>
                        onUpdateReportStatus(
                          selectedReport.id,
                          'resolved',
                          adminNotesInput || 'Site sanitized and waste collected.',
                          selectedCrew,
                          selectedReport.photoUrl
                        )
                      }
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors"
                    >
                      Mark Resolved
                    </button>

                    <button
                      onClick={() =>
                        onUpdateReportStatus(
                          selectedReport.id,
                          'rejected',
                          adminNotesInput || 'Duplicate report or out of municipal jurisdiction.'
                        )
                      }
                      className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs transition-colors"
                    >
                      Reject / Duplicate
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
                Select a report to view details and assign cleanup crews.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mode 3: Track Ticket Status */}
      {activeTab === 'track' && (
        <div className="max-w-2xl mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="text-center space-y-1">
            <h3 className="text-lg font-bold text-white">Public Grievance Tracker</h3>
            <p className="text-xs text-slate-400">
              Enter your complaint ticket reference number to verify current municipal resolution status.
            </p>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g., REP-2026-8941"
              value={ticketSearch}
              onChange={(e) => setTicketSearch(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
            />
            <button
              onClick={() => {
                const match = reports.find((r) =>
                  r.ticketNumber.toLowerCase().includes(ticketSearch.toLowerCase())
                );
                if (match) setSelectedReport(match);
              }}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors"
            >
              Search
            </button>
          </div>

          {/* Quick Ticket Pill Links */}
          <div className="pt-2">
            <span className="text-[11px] text-slate-500 uppercase block mb-1">
              Sample tickets to track:
            </span>
            <div className="flex flex-wrap gap-2">
              {reports.slice(0, 4).map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    setTicketSearch(r.ticketNumber);
                    setSelectedReport(r);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-400 hover:border-cyan-500/50"
                >
                  {r.ticketNumber} ({r.status})
                </button>
              ))}
            </div>
          </div>

          {selectedReport && (
            <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-mono font-bold text-white">{selectedReport.ticketNumber}</span>
                <span
                  className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full border ${getStatusBadge(
                    selectedReport.status
                  )}`}
                >
                  Status: {selectedReport.status}
                </span>
              </div>
              <p className="text-xs text-slate-300">{selectedReport.summary}</p>
              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>Location: {selectedReport.location}</span>
                {selectedReport.assignedCrew && (
                  <span className="text-cyan-400 font-semibold">
                    Assigned: {selectedReport.assignedCrew}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
