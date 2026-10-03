import React from 'react';
import {
  X,
  BookOpen,
  Trash2,
  Check,
  Ban,
  Award,
  Leaf,
  ShieldAlert,
  Sparkles,
  Info,
} from 'lucide-react';

interface EcoGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  citizenPoints: number;
}

export const EcoGuideModal: React.FC<EcoGuideModalProps> = ({
  isOpen,
  onClose,
  citizenPoints,
}) => {
  if (!isOpen) return null;

  const binStreams = [
    {
      name: 'Dry Recyclables (Blue Bin)',
      color: 'border-sky-500 bg-sky-500/10 text-sky-400',
      allowed: ['Clean plastic bottles (#1, #2)', 'Flattened cardboard & paper', 'Aluminum & tin cans', 'Clean egg cartons'],
      forbidden: ['Soiled pizza boxes with cheese/grease', 'Plastic grocery films/bags', 'Broken window ceramics', 'Food scraps'],
      tip: 'Always rinse containers with a splash of water to prevent pest contamination.',
    },
    {
      name: 'Wet Organic Waste (Green Bin)',
      color: 'border-emerald-500 bg-emerald-500/10 text-emerald-400',
      allowed: ['Fruit peels & vegetable scraps', 'Coffee grounds & tea bags', 'Leaves, garden trimmings', 'Leftover cooked food'],
      forbidden: ['Plastic wrap or foil', 'Pet waste or cat litter', 'Treated chemical wood', 'Glass or metal containers'],
      tip: 'Composting organic scraps prevents anaerobic methane formation in landfills.',
    },
    {
      name: 'Glass & Metal (Amber Bin)',
      color: 'border-amber-500 bg-amber-500/10 text-amber-400',
      allowed: ['Beverage glass bottles', 'Food jars & preserves', 'Aerosol cans (completely empty)', 'Aluminum foil (clean)'],
      forbidden: ['Pyrex heatproof cookware', 'Lightbulbs & fluorescent tubes', 'Mirrors and crystalware', 'Propane canisters'],
      tip: 'Glass can be recycled indefinitely without degradation in quality or purity.',
    },
    {
      name: 'Hazardous & E-Waste (Red Bin)',
      color: 'border-rose-500 bg-rose-500/10 text-rose-400',
      allowed: ['Lithium-ion & alkaline batteries', 'Old mobile electronics & cables', 'Paint cans with chemical residue', 'Expired medical supplies'],
      forbidden: ['Regular domestic food waste', 'Loose broken glass', 'General non-hazardous paper', 'Plastic bottles'],
      tip: 'Never throw lithium batteries in general waste: compaction trucks can ignite lithium fires.',
    },
  ];

  const badges = [
    { name: 'Eco Starter', pts: 25, unlocked: citizenPoints >= 25, desc: 'Logged first segregated waste item' },
    { name: 'Community Watchdog', pts: 75, unlocked: citizenPoints >= 75, desc: 'Filed verified waste report with AI triage' },
    { name: 'Zero-Waste Champion', pts: 150, unlocked: citizenPoints >= 150, desc: 'Logged 5+ properly segregated items' },
    { name: 'Master Environmentalist', pts: 300, unlocked: citizenPoints >= 300, desc: 'Consistently avoided landfill waste' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-6 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Civic Waste Segregation & Rewards Guide</h3>
              <p className="text-xs text-slate-400">
                Official municipal guidelines for color-coded sorting and civic rewards.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Citizen Eco-Points & Badges Strip */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                Your Eco-Citizen Profile
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
              {citizenPoints} Green Points
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {badges.map((badge, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-lg border text-center transition-all ${
                  badge.unlocked
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-500 opacity-60'
                }`}
              >
                <div className="text-xs font-bold flex items-center justify-center gap-1">
                  <span>{badge.name}</span>
                  {badge.unlocked && <Sparkles className="w-3 h-3 text-emerald-400" />}
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">{badge.pts} pts required</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stream Rules Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {binStreams.map((stream, idx) => (
            <div key={idx} className={`p-4 rounded-xl border ${stream.color} space-y-3 bg-slate-950/80`}>
              <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-white">
                <Trash2 className="w-3.5 h-3.5" />
                {stream.name}
              </h4>

              <div className="space-y-1.5 text-[11px]">
                <div className="space-y-1">
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Allowed:
                  </span>
                  <ul className="text-slate-300 pl-4 list-disc space-y-0.5">
                    {stream.allowed.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-1 pt-1">
                  <span className="text-rose-400 font-bold flex items-center gap-1">
                    <Ban className="w-3 h-3" /> Forbidden:
                  </span>
                  <ul className="text-slate-400 pl-4 list-disc space-y-0.5">
                    {stream.forbidden.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-1 border-t border-slate-800/80 text-[10px] text-slate-400 italic">
                💡 Tip: {stream.tip}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-colors"
          >
            Got it, Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
