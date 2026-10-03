import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  Trash2,
  Leaf,
  Layers,
  Clock,
  Zap,
  ArrowRight,
  Info,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SAMPLE_WASTE_ITEMS } from '../data/mockData';
import { WasteClassificationResult, SmartBin } from '../types/waste';

interface WasteClassifierProps {
  onDisposalLogged: (category: string, binId: string, carbonSaved: number) => void;
  smartBins: SmartBin[];
  addPoints: (amount: number, reason: string) => void;
}

export const WasteClassifier: React.FC<WasteClassifierProps> = ({
  onDisposalLogged,
  smartBins,
  addPoints,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(SAMPLE_WASTE_ITEMS[0].dataUrl);
  const [activeItemTitle, setActiveItemTitle] = useState<string>(SAMPLE_WASTE_ITEMS[0].name);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<WasteClassificationResult | null>(null);
  const [userNotes, setUserNotes] = useState<string>('');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [depositSuccess, setDepositSuccess] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start live webcam
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setIsCameraActive(true);
      } else {
        setCameraError('Camera access not supported on this browser or device.');
      }
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setCameraError('Camera permission was denied or camera unavailable. Please upload a photo or use preset test samples.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const captureCameraFrame = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setSelectedImage(dataUrl);
        setActiveItemTitle('Live Camera Capture');
        stopCamera();
        runClassification(dataUrl, 'Live camera capture item');
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setSelectedImage(dataUrl);
        setActiveItemTitle(file.name.replace(/\.[^/.]+$/, ''));
        stopCamera();
        runClassification(dataUrl, `File upload: ${file.name}`);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectSample = (sample: (typeof SAMPLE_WASTE_ITEMS)[0]) => {
    stopCamera();
    setSelectedImage(sample.dataUrl);
    setActiveItemTitle(sample.name);
    runClassification(sample.dataUrl, sample.description);
  };

  const runClassification = async (imageDataUrl: string, notes?: string) => {
    setIsAnalyzing(true);
    setDepositSuccess(null);
    try {
      const response = await fetch('/api/classify-waste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageDataUrl,
          notes: notes || userNotes,
        }),
      });

      if (!response.ok) {
        throw new Error('Classification request failed');
      }

      const data: WasteClassificationResult = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Classification error:', err);
      // Fallback heuristics based on sample item if available
      const sampleMatch = SAMPLE_WASTE_ITEMS.find((s) => s.dataUrl === imageDataUrl);
      const cat = (sampleMatch?.expectedCategory as any) || 'plastic';
      setResult({
        category: cat,
        itemName: sampleMatch?.name || 'Classified Waste Item',
        confidence: 93,
        binType:
          cat === 'organic'
            ? 'Wet Organic (Green)'
            : cat === 'hazardous_ewaste'
            ? 'Hazardous / E-Waste (Red)'
            : cat === 'paper' || cat === 'metal' || cat === 'plastic' || cat === 'glass'
            ? 'Dry Recyclable (Blue)'
            : 'General Trash (Grey)',
        segregationGuide: [
          'Separate from mixed municipal refuse',
          'Rinse or wipe to eliminate wet food contaminants',
          'Flatten to maximize internal smart bin storage capacity',
          'Dispose in designated sorted bin stream',
        ],
        materialComposition: 'Processed recyclable aggregate',
        decompositionTime: cat === 'organic' ? '2-6 weeks' : cat === 'plastic' ? '450 years' : '80-100 years',
        carbonSavedKg: 0.14,
        recyclable: cat !== 'other',
        recyclabilityGrade: cat === 'plastic' || cat === 'metal' ? 5 : 4,
        ecoTip: 'Ensure materials are dry before binning to prevent mold cross-contamination.',
        isFallback: true,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Perform virtual disposal into matching Smart Bin
  const handleDisposeToSmartBin = () => {
    if (!result) return;

    // Find best matching bin in system
    let targetType = 'dry_recyclable';
    if (result.category === 'organic') targetType = 'wet_organic';
    if (result.category === 'hazardous_ewaste') targetType = 'hazardous_ewaste';
    if (result.category === 'glass' || result.category === 'metal') targetType = 'glass_metal';
    if (result.category === 'other') targetType = 'general_waste';

    const matchingBin =
      smartBins.find((b) => b.binType === targetType && b.fillLevel < 95) || smartBins[0];

    onDisposalLogged(result.category, matchingBin.id, result.carbonSavedKg || 0.1);
    addPoints(25, `Properly segregated: ${result.itemName}`);

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#10b981', '#38bdf8', '#fbbf24', '#34d399'],
    });

    setDepositSuccess(
      `Disposed into ${matchingBin.name} (${matchingBin.code}). Fill level updated! Earned +25 Green Eco-Points.`
    );
  };

  // Category styling helpers
  const getCategoryTheme = (category?: string) => {
    switch (category) {
      case 'organic':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400',
          badge: 'bg-emerald-500 text-slate-950',
          binColor: 'text-emerald-400 border-emerald-500',
          barColor: 'bg-emerald-500',
          glow: 'shadow-emerald-500/20',
          label: 'Wet Organic Waste',
        };
      case 'plastic':
        return {
          bg: 'bg-sky-500/10 border-sky-500/40 text-sky-400',
          badge: 'bg-sky-500 text-slate-950',
          binColor: 'text-sky-400 border-sky-500',
          barColor: 'bg-sky-500',
          glow: 'shadow-sky-500/20',
          label: 'Recyclable Plastic',
        };
      case 'metal':
        return {
          bg: 'bg-amber-500/10 border-amber-500/40 text-amber-400',
          badge: 'bg-amber-500 text-slate-950',
          binColor: 'text-amber-400 border-amber-500',
          barColor: 'bg-amber-500',
          glow: 'shadow-amber-500/20',
          label: 'Recyclable Metal',
        };
      case 'paper':
        return {
          bg: 'bg-yellow-500/10 border-yellow-500/40 text-yellow-400',
          badge: 'bg-yellow-500 text-slate-950',
          binColor: 'text-yellow-400 border-yellow-500',
          barColor: 'bg-yellow-500',
          glow: 'shadow-yellow-500/20',
          label: 'Recyclable Paper / Fiber',
        };
      case 'glass':
        return {
          bg: 'bg-teal-500/10 border-teal-500/40 text-teal-400',
          badge: 'bg-teal-500 text-slate-950',
          binColor: 'text-teal-400 border-teal-500',
          barColor: 'bg-teal-500',
          glow: 'shadow-teal-500/20',
          label: 'Recyclable Glass',
        };
      case 'hazardous_ewaste':
        return {
          bg: 'bg-rose-500/10 border-rose-500/40 text-rose-400',
          badge: 'bg-rose-500 text-white',
          binColor: 'text-rose-400 border-rose-500',
          barColor: 'bg-rose-500',
          glow: 'shadow-rose-500/20',
          label: 'Hazardous / E-Waste',
        };
      default:
        return {
          bg: 'bg-slate-500/10 border-slate-500/40 text-slate-400',
          badge: 'bg-slate-500 text-white',
          binColor: 'text-slate-400 border-slate-500',
          barColor: 'bg-slate-500',
          glow: 'shadow-slate-500/20',
          label: 'General Landfill Waste',
        };
    }
  };

  const theme = getCategoryTheme(result?.category);

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-500/20 p-6 shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Computer Vision Waste Segregation Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            Intelligent Waste Segregation & Classification
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Snap or upload any waste item to classify it in real-time. Our neural vision model
            distinguishes plastics, organics, paper, metals, glass, and electronic hazards—giving step-by-step
            disposal steps, decomposition duration, and routing it to the nearest municipal smart bin.
          </p>
        </div>
      </div>

      {/* Main Grid: Input / Scanner on Left, AI Output Analysis on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Capture & Presets (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-400" />
                Image Capture & Feed
              </h2>
              <span className="text-xs text-slate-400">Camera / Upload / Preset</span>
            </div>

            {/* Video or Image Viewport */}
            <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-950 border-2 border-slate-800/80 flex items-center justify-center group">
              {isCameraActive ? (
                <div className="relative w-full h-full">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Real-time scanning HUD overlay */}
                  <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4">
                    <div className="flex justify-between items-center text-[10px] font-mono text-emerald-400 bg-slate-950/70 px-2 py-1 rounded backdrop-blur border border-emerald-500/30">
                      <span>LIVE CAM ACTIVE</span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                        CV SENSOR
                      </span>
                    </div>
                    {/* Reticle Target */}
                    <div className="self-center w-48 h-48 border border-emerald-500/40 rounded-xl relative flex items-center justify-center">
                      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-400"></div>
                      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-400"></div>
                      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-400"></div>
                      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-400"></div>
                      <div className="text-[11px] font-mono text-emerald-300/80 bg-slate-950/80 px-2 py-0.5 rounded">
                        Aim Waste Here
                      </div>
                    </div>
                    <div className="text-center">
                      <button
                        onClick={captureCameraFrame}
                        className="pointer-events-auto px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/30 transition-all flex items-center gap-2 mx-auto"
                      >
                        <Camera className="w-4 h-4" />
                        Capture Frame & Classify
                      </button>
                    </div>
                  </div>
                </div>
              ) : selectedImage ? (
                <div className="relative w-full h-full">
                  <img
                    src={selectedImage}
                    alt={activeItemTitle}
                    className="w-full h-full object-cover"
                  />
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm flex flex-col items-center justify-center p-4">
                      <div className="relative w-16 h-16 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin"></div>
                        <Sparkles className="w-7 h-7 text-emerald-400 animate-pulse" />
                      </div>
                      <p className="mt-3 text-xs font-semibold text-emerald-300 tracking-wide font-mono animate-pulse">
                        ANALYZING MATERIAL COMPOSITION...
                      </p>
                      <p className="text-[11px] text-slate-400">Multimodal Neural Segregation Engine</p>
                    </div>
                  )}
                  {/* Overlay Tag */}
                  <div className="absolute bottom-3 left-3 bg-slate-900/85 backdrop-blur border border-slate-700/80 text-white text-xs px-2.5 py-1 rounded-md font-medium">
                    {activeItemTitle}
                  </div>
                </div>
              ) : (
                <div className="text-center p-6 space-y-2">
                  <Camera className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400">No image loaded</p>
                </div>
              )}
            </div>

            {/* Camera error notification if any */}
            {cameraError && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{cameraError}</span>
              </div>
            )}

            {/* Action buttons: Webcam vs File Upload vs Scan */}
            <div className="grid grid-cols-2 gap-2">
              {isCameraActive ? (
                <button
                  onClick={stopCamera}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Stop Camera
                </button>
              ) : (
                <button
                  onClick={startCamera}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700"
                >
                  <Camera className="w-3.5 h-3.5 text-emerald-400" />
                  Live Camera
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700"
              >
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                Upload Photo
              </button>
            </div>

            {/* Optional Notes input */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Optional hints or item description:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  placeholder="e.g., Plastic bottle with cap, pizza box..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={() => selectedImage && runClassification(selectedImage)}
                  disabled={!selectedImage || isAnalyzing}
                  className="shrink-0 px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Classify
                </button>
              </div>
            </div>

            {/* Preset Samples Selector */}
            <div className="pt-2 border-t border-slate-800">
              <span className="block text-[11px] font-semibold uppercase text-slate-400 mb-2">
                Test with Instant Waste Samples:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {SAMPLE_WASTE_ITEMS.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => handleSelectSample(sample)}
                    className={`flex flex-col items-center p-2 rounded-xl border text-center transition-all ${
                      selectedImage === sample.dataUrl
                        ? 'bg-emerald-950/40 border-emerald-500/60 ring-1 ring-emerald-500/40 text-emerald-300'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-[11px] font-semibold line-clamp-1">{sample.name}</span>
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 mt-0.5">
                      {sample.expectedCategory}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Segregation Intelligence Output (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {result ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
              {/* Header: Identified Item & Category Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${theme.badge}`}
                    >
                      {theme.label}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {result.confidence}% Confidence
                    </span>
                    {result.isFallback && (
                      <span className="text-[10px] text-amber-400 font-mono">Simulated</span>
                    )}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                    {result.itemName}
                  </h2>
                </div>

                {/* Recyclability Grade */}
                <div className="flex flex-col items-start sm:items-end">
                  <span className="text-[11px] text-slate-400 font-medium">Recyclability Grade</span>
                  <div className="flex items-center space-x-1 mt-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`text-sm ${
                          star <= result.recyclabilityGrade ? 'text-amber-400' : 'text-slate-700'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                    <span className="text-xs font-bold text-slate-200 ml-1">
                      {result.recyclabilityGrade}/5
                    </span>
                  </div>
                </div>
              </div>

              {/* Recommended Smart Bin Destination Card */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${theme.bg} ${theme.glow} shadow-lg`}
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-12 h-12 rounded-xl bg-slate-950/80 border border-slate-700 flex items-center justify-center text-white">
                    <Trash2 className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      Designated Municipal Stream
                    </span>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      {result.binType}
                    </h3>
                  </div>
                </div>
                <div className="hidden sm:block text-right">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                    Zero Waste Goal
                  </span>
                  <span className="text-xs font-semibold text-slate-300">
                    Avoids Landfill Methane
                  </span>
                </div>
              </div>

              {/* Key Environmental Impact Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
                  <div className="flex items-center space-x-1.5 text-slate-400 text-xs mb-1">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Decomposition</span>
                  </div>
                  <div className="text-sm font-bold text-white font-mono">
                    {result.decompositionTime}
                  </div>
                  <span className="text-[10px] text-slate-500">Natural degradation rate</span>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
                  <div className="flex items-center space-x-1.5 text-slate-400 text-xs mb-1">
                    <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                    <span>CO2 Saved</span>
                  </div>
                  <div className="text-sm font-bold text-emerald-400 font-mono">
                    ~{result.carbonSavedKg} kg CO₂
                  </div>
                  <span className="text-[10px] text-slate-500">Emissions prevented</span>
                </div>

                <div className="col-span-2 sm:col-span-1 bg-slate-950/70 border border-slate-800 rounded-xl p-3">
                  <div className="flex items-center space-x-1.5 text-slate-400 text-xs mb-1">
                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                    <span>Material Base</span>
                  </div>
                  <div className="text-xs font-bold text-slate-200 truncate">
                    {result.materialComposition}
                  </div>
                  <span className="text-[10px] text-slate-500">Chemical / Fiber spec</span>
                </div>
              </div>

              {/* Segregation Instructions Checklist */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Mandatory Segregation Protocol
                </h3>
                <div className="space-y-1.5 bg-slate-950/50 rounded-xl p-3 border border-slate-800/80">
                  {result.segregationGuide.map((step, idx) => (
                    <div key={idx} className="flex items-start space-x-2.5 text-xs text-slate-300">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="leading-snug">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Eco Tip */}
              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-cyan-200 flex items-start gap-2.5">
                <Lightbulb className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-cyan-300">Smart Waste Tip: </span>
                  {result.ecoTip}
                </div>
              </div>

              {/* Disposal Log Action & Confetti */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  onClick={handleDisposeToSmartBin}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Log Disposal & Route to Smart Bin (+25 Pts)
                </button>

                <span className="text-[11px] text-slate-400 text-center sm:text-right">
                  Updates real-time IoT municipal fill volume
                </span>
              </div>

              {/* Success Notification */}
              {depositSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{depositSuccess}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[420px]">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Awaiting Waste Input</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Select an instant sample on the left, start the webcam, or upload an image of trash to run
                our AI waste segregation vision model.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
