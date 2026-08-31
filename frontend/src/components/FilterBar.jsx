import React, { useState, useEffect } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  Play, 
  Pause, 
  RotateCcw, 
  Filter, 
  Users, 
  Phone, 
  Building2, 
  Car, 
  CreditCard,
  Calendar,
  Sparkles,
  ChevronDown
} from 'lucide-react';

export default function FilterBar({
  searchQuery,
  setSearchQuery,
  riskThreshold,
  setRiskThreshold,
  selectedTypes,
  toggleType,
  selectedCluster,
  setSelectedCluster,
  timelineDate,
  setTimelineDate,
  timelinePlaying,
  setTimelinePlaying,
  nodeCountsByType,
  resetFilters
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const entityTypes = [
    { id: 'Person', label: 'Persons', icon: Users, color: 'text-indigo-400 border-indigo-500/40 bg-indigo-950/30' },
    { id: 'Phone', label: 'Phones', icon: Phone, color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/30' },
    { id: 'Organization', label: 'Orgs', icon: Building2, color: 'text-amber-400 border-amber-500/40 bg-amber-950/30' },
    { id: 'Vehicle', label: 'Vehicles', icon: Car, color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30' },
    { id: 'Account', label: 'Accounts', icon: CreditCard, color: 'text-purple-400 border-purple-500/40 bg-purple-950/30' },
  ];

  const clusters = [
    { id: 'ALL', label: 'All Syndicate Sectors' },
    { id: 'bridge', label: '👑 Bridge Kingpin' },
    { id: 'cluster_a', label: '⚡ Cluster A (Extortion)' },
    { id: 'cluster_b', label: '💸 Cluster B (Laundering)' },
    { id: 'victim', label: '🛡️ Victims & Witnesses' },
  ];

  // Timeline dates: March 01 to March 21, 2026
  const timelineDates = [
    { day: '01', date: '2026-03-01', event: 'Initial Calls (Rajesh ↔ Bimal)' },
    { day: '02', date: '2026-03-02', event: 'Extortion Dispatch (Rajesh ↔ Sunita)' },
    { day: '03', date: '2026-03-03', event: 'Courier Drop (Sunita ↔ Bimal)' },
    { day: '05', date: '2026-03-05', event: '🚨 22-CALL SPIKE & ₹45k duress transfer' },
    { day: '06', date: '2026-03-06', event: 'Split payments & victim threat (Debjani)' },
    { day: '08', date: '2026-03-08', event: 'Cluster B prep wire' },
    { day: '10', date: '2026-03-10', event: 'Tea Stall Meeting (Debasish ↔ Sunita)' },
    { day: '12', date: '2026-03-12', event: 'FIR 101 Lodged (Bidhannagar PS)' },
    { day: '18', date: '2026-03-18', event: 'FIR 102 Lodged (Howrah PS)' },
    { day: '19', date: '2026-03-19', event: 'Bridge funds injection (Debasish → Ashok)' },
    { day: '20', date: '2026-03-20', event: '₹500k Circular Loop Begins (Hop 1 & 2)' },
    { day: '21', date: '2026-03-21', event: '₹490k Loop Closes (Hop 3)' },
    { day: '24', date: '2026-03-24', event: 'FIR 103 Lodged (AML Bank Alert)' },
  ];

  // Timeline playback interval
  useEffect(() => {
    let interval = null;
    if (timelinePlaying) {
      interval = setInterval(() => {
        setTimelineDate((prev) => {
          const currentIndex = timelineDates.findIndex((d) => d.date === prev);
          if (currentIndex === -1 || currentIndex >= timelineDates.length - 1) {
            return timelineDates[0].date;
          }
          return timelineDates[currentIndex + 1].date;
        });
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [timelinePlaying]);

  const currentTimelineEvent = timelineDates.find((d) => d.date === timelineDate);

  return (
    <div className="bg-[#0b1120]/95 border-b border-slate-800/80 px-4 py-2.5">
      {/* Primary Control Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Live Search Input */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entity, phone, plate, account, FIR..."
            className="w-full pl-9 pr-8 py-1.5 bg-slate-950/80 border border-slate-700/70 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40 transition-all font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Risk Score Threshold Slider */}
        <div className="flex items-center space-x-2.5 bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
          <span className="text-slate-400 font-medium">Risk &gt;</span>
          <input
            type="range"
            min="0"
            max="95"
            step="5"
            value={riskThreshold}
            onChange={(e) => setRiskThreshold(Number(e.target.value))}
            className="w-24 accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
          <span
            className={`font-mono font-bold px-1.5 py-0.2 rounded text-[11px] ${
              riskThreshold >= 80
                ? 'bg-rose-950 text-rose-300 border border-rose-600/40'
                : riskThreshold >= 50
                ? 'bg-amber-950 text-amber-300 border border-amber-600/40'
                : 'bg-cyan-950 text-cyan-300 border border-cyan-600/40'
            }`}
          >
            {riskThreshold}+
          </span>
        </div>

        {/* Cluster Filter Selector */}
        <div className="flex items-center space-x-1.5">
          <select
            value={selectedCluster}
            onChange={(e) => setSelectedCluster(e.target.value)}
            className="bg-slate-950/80 border border-slate-700/70 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 font-mono"
          >
            {clusters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Advanced Filters Toggle & Reset */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs border transition-all ${
              showAdvanced
                ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Types & Timeline</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          </button>

          <button
            onClick={resetFilters}
            className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg text-xs"
            title="Reset All Filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded Sub-Controls (Entity Types & Chronological Timeline Player) */}
      {showAdvanced && (
        <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-3">
          {/* Entity Type Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-medium mr-1">Filter by Type:</span>
            {entityTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = selectedTypes.includes(type.id);
              const count = nodeCountsByType[type.id] || 0;
              return (
                <button
                  key={type.id}
                  onClick={() => toggleType(type.id)}
                  className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs border transition-all font-mono ${
                    isSelected
                      ? `${type.color} font-semibold shadow-sm`
                      : 'bg-slate-950/40 border-slate-800 text-slate-500 hover:text-slate-400'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{type.label}</span>
                  <span className="text-[10px] opacity-75">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Chronological Investigation Timeline Player */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setTimelinePlaying(!timelinePlaying)}
                className={`p-1.5 rounded-md flex items-center justify-center transition-all ${
                  timelinePlaying
                    ? 'bg-rose-600 text-white shadow-glow-rose'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-glow-cyan'
                }`}
                title={timelinePlaying ? 'Pause Playback' : 'Replay Syndicate Event Chronology'}
              >
                {timelinePlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>

              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span className="text-xs text-slate-400">Date:</span>
                <span className="font-mono text-xs font-bold text-cyan-300">
                  {timelineDate || 'ALL (Full Network)'}
                </span>
              </div>
            </div>

            {/* Event Description Pill */}
            {currentTimelineEvent && (
              <div className="flex items-center space-x-2 text-xs bg-slate-900/90 border border-cyan-500/30 px-3 py-1 rounded-md">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span className="text-slate-300 font-mono">
                  {currentTimelineEvent.event}
                </span>
              </div>
            )}

            {/* Quick Step Timeline Selector */}
            <div className="flex items-center space-x-1 overflow-x-auto max-w-full pb-1 md:pb-0">
              <button
                onClick={() => {
                  setTimelineDate(null);
                  setTimelinePlaying(false);
                }}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all ${
                  timelineDate === null
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                }`}
              >
                ALL
              </button>
              {timelineDates.map((d) => (
                <button
                  key={d.date}
                  onClick={() => {
                    setTimelineDate(d.date);
                    setTimelinePlaying(false);
                  }}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-all ${
                    timelineDate === d.date
                      ? 'bg-cyan-400 text-slate-950 font-bold shadow-glow-cyan'
                      : d.event.includes('🚨')
                      ? 'bg-rose-950 text-rose-300 border border-rose-700/60'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                  }`}
                  title={d.event}
                >
                  Mar {d.day}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
