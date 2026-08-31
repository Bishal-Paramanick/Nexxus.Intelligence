import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Play, 
  Pause, 
  RotateCcw, 
  Calendar,
  Sparkles,
  Filter,
  Users,
  Phone,
  Building2,
  Car,
  CreditCard,
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
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);

  const clusters = [
    { id: 'ALL', label: 'All Entities' },
    { id: 'bridge', label: '👑 Kingpin' },
    { id: 'cluster_a', label: '⚡ Extortion Cell' },
    { id: 'cluster_b', label: '💸 Laundering Cell' },
    { id: 'victim', label: '🛡️ Victims' },
  ];

  const entityTypes = [
    { id: 'Person', label: 'Persons', icon: Users },
    { id: 'Phone', label: 'Phones', icon: Phone },
    { id: 'Organization', label: 'Orgs', icon: Building2 },
    { id: 'Vehicle', label: 'Vehicles', icon: Car },
    { id: 'Account', label: 'Accounts', icon: CreditCard },
  ];

  const timelineDates = [
    { day: '01', date: '2026-03-01', event: 'Initial Calls (Rajesh ↔ Bimal)' },
    { day: '05', date: '2026-03-05', event: '🚨 22-Call Extortion Spike & ₹45k duress' },
    { day: '10', date: '2026-03-10', event: 'Tea Stall Meeting (Debasish ↔ Sunita)' },
    { day: '12', date: '2026-03-12', event: 'FIR 101 Lodged (Bidhannagar PS)' },
    { day: '18', date: '2026-03-18', event: 'FIR 102 Lodged (Howrah PS)' },
    { day: '20', date: '2026-03-20', event: '₹500k Circular Loop (Hop 1 & 2)' },
    { day: '21', date: '2026-03-21', event: '₹490k Loop Closes (Hop 3)' },
    { day: '24', date: '2026-03-24', event: 'FIR 103 Lodged (AML Bank Alert)' },
  ];

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
      }, 2200);
    }
    return () => clearInterval(interval);
  }, [timelinePlaying]);

  const currentTimelineEvent = timelineDates.find((d) => d.date === timelineDate);

  return (
    <div className="bg-[#090d18]/90 border-b border-white/[0.08] px-4 lg:px-6 py-2.5 transition-all">
      <div className="max-w-[1780px] mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Search & Cluster Selector */}
        <div className="flex items-center space-x-2.5 flex-1 min-w-[300px] max-w-2xl">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search suspects, phones, accounts, vehicles, FIRs..."
              className="w-full pl-8 pr-8 py-1.5 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all font-sans"
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

          {/* Cluster Filter Buttons */}
          <div className="hidden sm:flex items-center space-x-1 p-0.5 bg-black/40 border border-white/[0.08] rounded-xl">
            {clusters.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCluster(c.id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  selectedCluster === c.id
                    ? 'bg-white/[0.12] text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right Filter Actions */}
        <div className="flex items-center space-x-2">
          {/* Risk Threshold Selector */}
          <div className="flex items-center space-x-1 p-0.5 bg-black/40 border border-white/[0.08] rounded-xl text-xs">
            <span className="text-[10px] text-slate-400 font-mono px-2">Risk:</span>
            {[
              { val: 0, label: 'All' },
              { val: 50, label: '>50' },
              { val: 75, label: '>75' },
              { val: 85, label: '🚨 85+' },
            ].map((r) => (
              <button
                key={r.val}
                onClick={() => setRiskThreshold(r.val)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all ${
                  riskThreshold === r.val
                    ? r.val >= 85
                      ? 'bg-rose-500/25 text-rose-300 border border-rose-500/50 font-bold'
                      : 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/50 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Entity Types Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowTypeFilter(!showTypeFilter)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs border transition-all ${
                showTypeFilter || selectedTypes.length < 5
                  ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 font-medium'
                  : 'bg-black/40 text-slate-300 border-white/[0.08] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Types ({selectedTypes.length})</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showTypeFilter ? 'rotate-180' : ''}`} />
            </button>

            {showTypeFilter && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-[#0c101c]/95 backdrop-blur-2xl border border-white/[0.1] rounded-xl p-2 shadow-2xl z-30 space-y-1 animate-fade-in">
                {entityTypes.map((type) => {
                  const Icon = type.icon;
                  const isChecked = selectedTypes.includes(type.id);
                  const count = nodeCountsByType[type.id] || 0;
                  return (
                    <button
                      key={type.id}
                      onClick={() => toggleType(type.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                        isChecked ? 'bg-cyan-500/15 text-cyan-300' : 'text-slate-400 hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className="w-3.5 h-3.5" />
                        <span>{type.label}</span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-500">({count})</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Timeline Toggle */}
          <button
            onClick={() => setShowTimeline(!showTimeline)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs border transition-all ${
              showTimeline || timelineDate
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-medium'
                : 'bg-black/40 text-slate-300 border-white/[0.08] hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Timeline</span>
            {timelineDate && (
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            )}
          </button>

          {/* Reset Filters */}
          <button
            onClick={resetFilters}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.08] rounded-xl transition-colors border border-white/[0.08]"
            title="Reset Filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expandable Chronological Timeline Player */}
      {showTimeline && (
        <div className="max-w-[1780px] mx-auto mt-2.5 pt-2.5 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-xs animate-fade-in">
          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => setTimelinePlaying(!timelinePlaying)}
              className={`p-1.5 rounded-lg transition-all ${
                timelinePlaying
                  ? 'bg-rose-500 text-white shadow-glow-rose'
                  : 'bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 shadow-glow-cyan'
              }`}
              title={timelinePlaying ? 'Pause Timeline' : 'Play Timeline'}
            >
              {timelinePlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>

            <span className="font-mono text-slate-200 font-medium">
              {timelineDate ? `Date: ${timelineDate}` : 'Network Baseline (All Events)'}
            </span>

            {currentTimelineEvent && (
              <span className="text-[11px] text-cyan-300 bg-cyan-950/60 border border-cyan-500/40 px-2.5 py-0.5 rounded-lg font-mono">
                {currentTimelineEvent.event}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => {
                setTimelineDate(null);
                setTimelinePlaying(false);
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all ${
                timelineDate === null
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-white/[0.04] text-slate-400 hover:text-white'
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
                className={`px-2 py-0.5 rounded-lg text-[10px] font-mono whitespace-nowrap transition-all ${
                  timelineDate === d.date
                    ? 'bg-cyan-400 text-slate-950 font-bold shadow-sm'
                    : d.event.includes('🚨')
                    ? 'bg-rose-950/60 text-rose-300 border border-rose-500/40'
                    : 'bg-white/[0.04] text-slate-400 hover:text-white'
                }`}
              >
                Mar {d.day}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
