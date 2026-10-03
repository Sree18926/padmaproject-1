export type WasteCategory =
  | 'plastic'
  | 'paper'
  | 'metal'
  | 'glass'
  | 'organic'
  | 'hazardous_ewaste'
  | 'other';

export type BinType =
  | 'dry_recyclable'
  | 'wet_organic'
  | 'glass_metal'
  | 'hazardous_ewaste'
  | 'general_waste';

export type BinStatus = 'normal' | 'moderate' | 'critical' | 'overflowing';

export interface SmartBin {
  id: string;
  code: string;
  name: string;
  locationName: string;
  zone: string;
  coordinates: { x: number; y: number }; // percentage on map (0-100)
  binType: BinType;
  fillLevel: number; // 0 - 100%
  capacityLiters: number;
  batteryLevel: number; // 0 - 100%
  temperatureC: number;
  odorLevel: 'Low' | 'Moderate' | 'High';
  lastEmptied: string; // ISO string
  status: BinStatus;
  fillHistory: number[]; // 24 hourly readings
  latitude?: number;
  longitude?: number;
}

export interface WasteClassificationResult {
  category: WasteCategory;
  itemName: string;
  confidence: number;
  binType: string;
  segregationGuide: string[];
  materialComposition: string;
  decompositionTime: string;
  carbonSavedKg: number;
  recyclable: boolean;
  recyclabilityGrade: number; // 1 to 5
  ecoTip: string;
  isFallback?: boolean;
}

export type ReportIssueType =
  | 'overflowing_bin'
  | 'illegal_dumping'
  | 'hazardous_waste'
  | 'damaged_bin'
  | 'general_litter';

export type ReportSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ReportStatus = 'pending' | 'assigned' | 'resolved' | 'rejected';

export interface CitizenReport {
  id: string;
  ticketNumber: string;
  timestamp: string;
  citizenName: string;
  location: string;
  zone: string;
  coordinates?: { x: number; y: number };
  photoUrl: string;
  issueType: ReportIssueType;
  severity: ReportSeverity;
  status: ReportStatus;
  summary: string;
  detectedItems: string[];
  estimatedVolumeKg: number;
  hazardDetected: boolean;
  hazardNotes: string;
  suggestedAction: string;
  assignedCrew?: string;
  adminNotes?: string;
  resolutionPhotoUrl?: string;
  resolutionTimestamp?: string;
}

export interface WasteStatDay {
  date: string;
  dayName: string;
  plasticKg: number;
  organicKg: number;
  paperKg: number;
  metalKg: number;
  glassKg: number;
  ewasteKg: number;
  generalKg: number;
  totalTons: number;
  diversionRatePct: number;
}

export interface CollectionRoute {
  id: string;
  truckId: string;
  truckName: string;
  driverName: string;
  status: 'idle' | 'en_route' | 'collecting' | 'completed';
  assignedBinIds: string[];
  currentWaypointIndex: number;
  estimatedDurationMin: number;
  estimatedFuelSavingsLiters: number;
  totalWasteCollectedKg: number;
}
