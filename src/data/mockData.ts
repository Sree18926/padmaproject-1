import { SmartBin, CitizenReport, WasteStatDay, CollectionRoute } from '../types/waste';

// Helper to create clean SVGs as Data URLs for immediate visual testing and AI analysis
function createSvgDataUrl(title: string, subtitle: string, bgColor: string, accentColor: string, iconShape: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${bgColor}"/>
        <stop offset="100%" stop-color="#090d16"/>
      </linearGradient>
      <linearGradient id="acc" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${accentColor}"/>
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0.8"/>
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <rect width="600" height="450" rx="16" fill="url(#bg)"/>
    <circle cx="300" cy="180" r="90" fill="${accentColor}" opacity="0.15" filter="url(#glow)"/>
    <g transform="translate(230, 110)">
      ${iconShape}
    </g>
    <rect x="50" y="320" width="500" height="1" fill="#334155" opacity="0.6"/>
    <text x="300" y="360" font-family="system-ui, sans-serif" font-size="22" font-weight="700" fill="#f8fafc" text-anchor="middle">${title}</text>
    <text x="300" y="395" font-family="system-ui, sans-serif" font-size="14" fill="#94a3b8" text-anchor="middle">${subtitle}</text>
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}

export const SAMPLE_WASTE_ITEMS = [
  {
    id: 'sample-bottle',
    name: 'PET Water Bottle',
    expectedCategory: 'plastic',
    description: 'Empty 500ml transparent polyethylene terephthalate bottle with plastic screw cap.',
    dataUrl: createSvgDataUrl(
      'PET Plastic Water Bottle',
      'Disposable 500ml transparent bottle #1',
      '#0f2942',
      '#38bdf8',
      `<path d="M45,10 h50 v20 h-50 z M55,30 h30 v25 h-30 z M30,55 h80 a20,20 0 0 1 20,20 v60 a15,15 0 0 1 -15,15 h-90 a15,15 0 0 1 -15,-15 v-60 a20,20 0 0 1 20,-20 z" fill="#38bdf8" opacity="0.85"/>
       <path d="M40,80 h60 v3 h-60 z M40,95 h60 v3 h-60 z M40,110 h60 v3 h-60 z" fill="#bae6fd"/>`
    ),
  },
  {
    id: 'sample-banana',
    name: 'Banana Peel & Fruit Waste',
    expectedCategory: 'organic',
    description: 'Discarded ripe banana skin and organic food kitchen scrap.',
    dataUrl: createSvgDataUrl(
      'Organic Banana Peel Scrap',
      'Biodegradable organic household waste',
      '#1e3a1f',
      '#4ade80',
      `<path d="M20,130 C40,40 90,20 120,40 C110,60 90,90 60,130 C40,120 30,125 20,130 Z" fill="#eab308"/>
       <path d="M60,130 C90,80 120,60 135,80 C120,110 90,135 60,130 Z" fill="#ca8a04"/>
       <circle cx="120" cy="40" r="5" fill="#4ade80"/>`
    ),
  },
  {
    id: 'sample-can',
    name: 'Aluminum Soda Can',
    expectedCategory: 'metal',
    description: 'Crushed carbonated soft drink 330ml aluminum beverage can.',
    dataUrl: createSvgDataUrl(
      'Aluminum Beverage Can',
      'Pure recyclable metal canister',
      '#372613',
      '#f59e0b',
      `<rect x="35" y="20" width="70" height="110" rx="12" fill="#f59e0b"/>
       <ellipse cx="70" cy="25" rx="30" ry="10" fill="#fde68a"/>
       <ellipse cx="70" cy="125" rx="30" ry="8" fill="#d97706"/>
       <rect x="60" y="18" width="20" height="6" rx="2" fill="#78350f"/>`
    ),
  },
  {
    id: 'sample-cardboard',
    name: 'Corrugated Cardboard Box',
    expectedCategory: 'paper',
    description: 'Flattened packaging shipping box made of recycled kraft pulp.',
    dataUrl: createSvgDataUrl(
      'Corrugated Shipping Box',
      'Recyclable paper packaging & kraft fiber',
      '#3a2817',
      '#fbbf24',
      `<polygon points="70,15 125,45 70,75 15,45" fill="#d97706"/>
       <polygon points="15,45 70,75 70,135 15,105" fill="#b45309"/>
       <polygon points="125,45 70,75 70,135 125,105" fill="#92400e"/>`
    ),
  },
  {
    id: 'sample-glass',
    name: 'Glass Beverage Jar',
    expectedCategory: 'glass',
    description: 'Empty green glass culinary condiment bottle without metal lid.',
    dataUrl: createSvgDataUrl(
      'Glass Culinary Jar',
      '100% recyclable silicate glass container',
      '#062e2c',
      '#2dd4bf',
      `<path d="M50,15 h40 v15 h-40 z M40,30 h60 a10,10 0 0 1 10,10 v80 a10,10 0 0 1 -10,10 h-60 a10,10 0 0 1 -10,-10 v-80 a10,10 0 0 1 10,-10 z" fill="#2dd4bf" opacity="0.8"/>
       <rect x="48" y="55" width="44" height="45" rx="4" fill="#134e4a"/>`
    ),
  },
  {
    id: 'sample-battery',
    name: 'Lithium E-Waste Battery',
    expectedCategory: 'hazardous_ewaste',
    description: 'Depleted rechargeable lithium-ion battery cell with warning label.',
    dataUrl: createSvgDataUrl(
      'Lithium Rechargeable Battery',
      'Hazardous E-Waste - Do not dispose in general bin',
      '#450a0a',
      '#f43f5e',
      `<rect x="45" y="30" width="50" height="95" rx="8" fill="#e11d48"/>
       <rect x="62" y="18" width="16" height="12" rx="3" fill="#fda4af"/>
       <path d="M70,55 l-10,20 h12 l-6,22 l18,-24 h-12 z" fill="#fff"/>`
    ),
  },
];

export const SAMPLE_REPORT_PRESETS = [
  {
    id: 'rep-sample-1',
    title: 'Market Square - Overflowing Blue Bin',
    location: 'Central Plaza & 4th Avenue, Market Square',
    zone: 'Market Square',
    notes: 'Recycling bin is completely full and items are spilling onto the public sidewalk.',
    dataUrl: createSvgDataUrl(
      'CRITICAL: Overflowing Public Bin',
      'Refuse spilling on pedestrian walkway (Market Square)',
      '#3f1313',
      '#ef4444',
      `<rect x="35" y="45" width="70" height="90" rx="8" fill="#1e293b"/>
       <ellipse cx="70" cy="45" rx="35" ry="12" fill="#ef4444"/>
       <path d="M20,35 Q40,15 70,25 Q100,10 120,40" stroke="#f87171" stroke-width="8" fill="none"/>
       <circle cx="45" cy="20" r="10" fill="#38bdf8"/>
       <circle cx="95" cy="25" r="12" fill="#eab308"/>
       <rect x="25" y="115" width="20" height="25" fill="#f97316"/>`
    ),
  },
  {
    id: 'rep-sample-2',
    title: 'Waterfront - Illegal Roadside Debris',
    location: 'Pier 7 Promenade North Entrance',
    zone: 'Waterfront Promenade',
    notes: 'Commercial cardboard boxes and discarded packaging dumped by alleyway.',
    dataUrl: createSvgDataUrl(
      'ALERT: Illegal Waste Dumping',
      'Multiple discarded boxes obstructing waterfront bike path',
      '#3b2204',
      '#f97316',
      `<polygon points="40,30 90,20 120,60 70,70" fill="#d97706"/>
       <polygon points="20,70 80,70 65,125 10,120" fill="#b45309"/>
       <circle cx="100" cy="100" r="18" fill="#ef4444" opacity="0.8"/>`
    ),
  },
];

export const INITIAL_SMART_BINS: SmartBin[] = [
  {
    id: 'bin-01',
    code: 'BIN-DWN-01',
    name: 'Downtown Plaza Hub',
    locationName: 'City Center Mall Entrance',
    zone: 'Downtown Commercial',
    coordinates: { x: 48, y: 35 },
    binType: 'dry_recyclable',
    fillLevel: 88, // CRITICAL alert
    capacityLiters: 500,
    batteryLevel: 94,
    temperatureC: 22,
    odorLevel: 'Low',
    lastEmptied: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    status: 'critical',
    fillHistory: [20, 25, 30, 36, 42, 50, 58, 65, 72, 79, 84, 88],
  },
  {
    id: 'bin-02',
    code: 'BIN-DWN-02',
    name: 'Metro Food Court Waste',
    locationName: 'Central Station Food Pavilion',
    zone: 'Downtown Commercial',
    coordinates: { x: 54, y: 40 },
    binType: 'wet_organic',
    fillLevel: 96, // OVERFLOWING
    capacityLiters: 400,
    batteryLevel: 87,
    temperatureC: 26,
    odorLevel: 'High',
    lastEmptied: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
    status: 'overflowing',
    fillHistory: [15, 25, 40, 52, 63, 75, 82, 89, 93, 94, 95, 96],
  },
  {
    id: 'bin-03',
    code: 'BIN-DWN-03',
    name: 'Avenue General Trash',
    locationName: '5th Ave & Pine Crossroads',
    zone: 'Downtown Commercial',
    coordinates: { x: 42, y: 44 },
    binType: 'general_waste',
    fillLevel: 45,
    capacityLiters: 240,
    batteryLevel: 99,
    temperatureC: 21,
    odorLevel: 'Low',
    lastEmptied: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    status: 'normal',
    fillHistory: [10, 12, 18, 22, 28, 32, 35, 39, 41, 43, 44, 45],
  },
  {
    id: 'bin-04',
    code: 'BIN-TCK-01',
    name: 'Tech Park Recycler',
    locationName: 'Cyber Tower East Lobby',
    zone: 'Innovation Tech Park',
    coordinates: { x: 78, y: 22 },
    binType: 'dry_recyclable',
    fillLevel: 32,
    capacityLiters: 350,
    batteryLevel: 96,
    temperatureC: 20,
    odorLevel: 'Low',
    lastEmptied: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    status: 'normal',
    fillHistory: [8, 12, 15, 18, 21, 24, 26, 28, 30, 31, 32, 32],
  },
  {
    id: 'bin-05',
    code: 'BIN-TCK-02',
    name: 'Tech Park E-Waste Drop',
    locationName: 'Hardware Lab Quadrangle',
    zone: 'Innovation Tech Park',
    coordinates: { x: 84, y: 28 },
    binType: 'hazardous_ewaste',
    fillLevel: 82, // CRITICAL
    capacityLiters: 200,
    batteryLevel: 91,
    temperatureC: 23,
    odorLevel: 'Low',
    lastEmptied: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    status: 'critical',
    fillHistory: [40, 45, 50, 55, 60, 65, 70, 74, 76, 78, 80, 82],
  },
  {
    id: 'bin-06',
    code: 'BIN-UNI-01',
    name: 'Campus Library Sorting Hub',
    locationName: 'Main Quad Science Pavilion',
    zone: 'Metro University Campus',
    coordinates: { x: 22, y: 25 },
    binType: 'dry_recyclable',
    fillLevel: 68,
    capacityLiters: 400,
    batteryLevel: 92,
    temperatureC: 21,
    odorLevel: 'Low',
    lastEmptied: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    status: 'moderate',
    fillHistory: [15, 20, 26, 32, 40, 48, 54, 58, 62, 65, 67, 68],
  },
  {
    id: 'bin-07',
    code: 'BIN-UNI-02',
    name: 'Student Cafeteria Compost',
    locationName: 'Dining Hall Breezeway',
    zone: 'Metro University Campus',
    coordinates: { x: 18, y: 34 },
    binType: 'wet_organic',
    fillLevel: 85, // CRITICAL
    capacityLiters: 500,
    batteryLevel: 89,
    temperatureC: 24,
    odorLevel: 'Moderate',
    lastEmptied: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
    status: 'critical',
    fillHistory: [18, 25, 38, 49, 60, 68, 74, 78, 81, 83, 84, 85],
  },
  {
    id: 'bin-08',
    code: 'BIN-WTR-01',
    name: 'Marina Promenade Can & Glass',
    locationName: 'Pier 4 Harbor Boardwalk',
    zone: 'Waterfront Promenade',
    coordinates: { x: 25, y: 72 },
    binType: 'glass_metal',
    fillLevel: 58,
    capacityLiters: 350,
    batteryLevel: 94,
    temperatureC: 19,
    odorLevel: 'Low',
    lastEmptied: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
    status: 'normal',
    fillHistory: [10, 15, 22, 28, 34, 40, 46, 50, 52, 55, 57, 58],
  },
  {
    id: 'bin-09',
    code: 'BIN-WTR-02',
    name: 'Sunset Beach Multi-Sort',
    locationName: 'South Pier Observation Deck',
    zone: 'Waterfront Promenade',
    coordinates: { x: 34, y: 82 },
    binType: 'general_waste',
    fillLevel: 72,
    capacityLiters: 350,
    batteryLevel: 88,
    temperatureC: 21,
    odorLevel: 'Low',
    lastEmptied: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString(),
    status: 'moderate',
    fillHistory: [12, 18, 25, 34, 45, 55, 60, 65, 68, 70, 71, 72],
  },
  {
    id: 'bin-10',
    code: 'BIN-GRN-01',
    name: 'Green Valley Community Bin',
    locationName: 'Oakwood Circle Park',
    zone: 'Green Valley Residential',
    coordinates: { x: 74, y: 68 },
    binType: 'dry_recyclable',
    fillLevel: 41,
    capacityLiters: 600,
    batteryLevel: 97,
    temperatureC: 20,
    odorLevel: 'Low',
    lastEmptied: new Date(Date.now() - 1000 * 60 * 60 * 7).toISOString(),
    status: 'normal',
    fillHistory: [12, 16, 20, 24, 28, 31, 34, 36, 38, 39, 40, 41],
  },
  {
    id: 'bin-11',
    code: 'BIN-GRN-02',
    name: 'Valley Organics Compost',
    locationName: 'Community Garden Corner',
    zone: 'Green Valley Residential',
    coordinates: { x: 80, y: 76 },
    binType: 'wet_organic',
    fillLevel: 53,
    capacityLiters: 400,
    batteryLevel: 95,
    temperatureC: 22,
    odorLevel: 'Low',
    lastEmptied: new Date(Date.now() - 1000 * 60 * 60 * 11).toISOString(),
    status: 'normal',
    fillHistory: [10, 14, 19, 25, 30, 36, 42, 45, 48, 50, 52, 53],
  },
  {
    id: 'bin-12',
    code: 'BIN-MKT-01',
    name: 'Old Town Market Square Compactor',
    locationName: 'Farmers Market South Alley',
    zone: 'Market Square',
    coordinates: { x: 58, y: 64 },
    binType: 'wet_organic',
    fillLevel: 91, // CRITICAL
    capacityLiters: 1100,
    batteryLevel: 85,
    temperatureC: 25,
    odorLevel: 'High',
    lastEmptied: new Date(Date.now() - 1000 * 60 * 60 * 19).toISOString(),
    status: 'critical',
    fillHistory: [25, 35, 48, 58, 69, 76, 82, 85, 88, 89, 90, 91],
  },
];

export const INITIAL_REPORTS: CitizenReport[] = [
  {
    id: 'rep-101',
    ticketNumber: 'REP-2026-8941',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    citizenName: 'Devon Vance',
    location: 'Central Plaza & 4th Avenue, Market Square',
    zone: 'Market Square',
    coordinates: { x: 58, y: 64 },
    photoUrl: SAMPLE_REPORT_PRESETS[0].dataUrl,
    issueType: 'overflowing_bin',
    severity: 'critical',
    status: 'assigned',
    summary: 'Public commercial container overflowing into pedestrian walkway with scattered food and paper waste.',
    detectedItems: ['Cardboard boxes', 'Soda cups', 'Polystyrene foam', 'Fruit peels'],
    estimatedVolumeKg: 45,
    hazardDetected: true,
    hazardNotes: 'Sidewalk blockage and hygiene risk near open-air food stalls.',
    suggestedAction: 'Deploy high-capacity compactor crew and sanitize surrounding curb.',
    assignedCrew: 'Crew Bravo (Compactor 102)',
    adminNotes: 'Crew dispatched at 09:15 AM; estimated arrival 20 mins.',
  },
  {
    id: 'rep-102',
    ticketNumber: 'REP-2026-8942',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    citizenName: 'Maya Lin',
    location: 'Pier 7 Promenade North Entrance',
    zone: 'Waterfront Promenade',
    coordinates: { x: 30, y: 75 },
    photoUrl: SAMPLE_REPORT_PRESETS[1].dataUrl,
    issueType: 'illegal_dumping',
    severity: 'high',
    status: 'pending',
    summary: 'Unauthorized pile of commercial renovation packaging and bulky scrap dumped overnight.',
    detectedItems: ['Corrugated pallets', 'Shrink wrap', 'Industrial paint bucket'],
    estimatedVolumeKg: 85,
    hazardDetected: true,
    hazardNotes: 'Contains residue chemical container; potential marine runoff danger.',
    suggestedAction: 'Environmental compliance inspection and rapid flatbed removal.',
  },
  {
    id: 'rep-103',
    ticketNumber: 'REP-2026-8939',
    timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    citizenName: 'Arjun Patel',
    location: 'Main Quad Science Pavilion',
    zone: 'Metro University Campus',
    coordinates: { x: 22, y: 25 },
    photoUrl: SAMPLE_WASTE_ITEMS[0].dataUrl,
    issueType: 'damaged_bin',
    severity: 'medium',
    status: 'resolved',
    summary: 'Smart sensor lid latch jammed open; solar power module connection loose.',
    detectedItems: ['Jammed optical sensor', 'Broken lid hinge'],
    estimatedVolumeKg: 10,
    hazardDetected: false,
    hazardNotes: 'Non-hazardous mechanical latch defect.',
    suggestedAction: 'Technician repair sensor hinge and test telemetry handshake.',
    assignedCrew: 'IoT Field Tech Squad 1',
    adminNotes: 'Hinge replaced and sensor recalibrated. Status restored to active.',
    resolutionPhotoUrl: SAMPLE_WASTE_ITEMS[0].dataUrl,
    resolutionTimestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
];

export const HISTORICAL_WASTE_STATS: WasteStatDay[] = [
  {
    date: '2026-09-27',
    dayName: 'Sun',
    plasticKg: 1240,
    organicKg: 2850,
    paperKg: 1420,
    metalKg: 620,
    glassKg: 890,
    ewasteKg: 110,
    generalKg: 1680,
    totalTons: 8.81,
    diversionRatePct: 62.4,
  },
  {
    date: '2026-09-28',
    dayName: 'Mon',
    plasticKg: 1480,
    organicKg: 3100,
    paperKg: 1850,
    metalKg: 710,
    glassKg: 940,
    ewasteKg: 145,
    generalKg: 1890,
    totalTons: 10.11,
    diversionRatePct: 63.8,
  },
  {
    date: '2026-09-29',
    dayName: 'Tue',
    plasticKg: 1390,
    organicKg: 2980,
    paperKg: 1720,
    metalKg: 690,
    glassKg: 910,
    ewasteKg: 130,
    generalKg: 1760,
    totalTons: 9.58,
    diversionRatePct: 64.2,
  },
  {
    date: '2026-09-30',
    dayName: 'Wed',
    plasticKg: 1520,
    organicKg: 3250,
    paperKg: 1910,
    metalKg: 740,
    glassKg: 980,
    ewasteKg: 160,
    generalKg: 1810,
    totalTons: 10.37,
    diversionRatePct: 65.5,
  },
  {
    date: '2026-10-01',
    dayName: 'Thu',
    plasticKg: 1460,
    organicKg: 3180,
    paperKg: 1840,
    metalKg: 700,
    glassKg: 920,
    ewasteKg: 125,
    generalKg: 1730,
    totalTons: 9.95,
    diversionRatePct: 64.9,
  },
  {
    date: '2026-10-02',
    dayName: 'Fri',
    plasticKg: 1680,
    organicKg: 3620,
    paperKg: 2100,
    metalKg: 820,
    glassKg: 1050,
    ewasteKg: 180,
    generalKg: 2020,
    totalTons: 11.47,
    diversionRatePct: 66.1,
  },
  {
    date: '2026-10-03',
    dayName: 'Today',
    plasticKg: 1150,
    organicKg: 2420,
    paperKg: 1380,
    metalKg: 580,
    glassKg: 790,
    ewasteKg: 95,
    generalKg: 1310,
    totalTons: 7.72,
    diversionRatePct: 67.2,
  },
];

export const INITIAL_FLEET_ROUTES: CollectionRoute[] = [
  {
    id: 'route-1',
    truckId: 'TRK-101',
    truckName: 'EcoCompactor Alpha',
    driverName: 'Marcus Cole',
    status: 'en_route',
    assignedBinIds: ['bin-02', 'bin-01', 'bin-12'],
    currentWaypointIndex: 0,
    estimatedDurationMin: 42,
    estimatedFuelSavingsLiters: 14.8,
    totalWasteCollectedKg: 620,
  },
  {
    id: 'route-2',
    truckId: 'TRK-204',
    truckName: 'RecycleHauler Beta',
    driverName: 'Sarah Jenkins',
    status: 'idle',
    assignedBinIds: ['bin-07', 'bin-05'],
    currentWaypointIndex: 0,
    estimatedDurationMin: 28,
    estimatedFuelSavingsLiters: 8.5,
    totalWasteCollectedKg: 0,
  },
];
