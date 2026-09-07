import React, { useState, useEffect, useRef } from 'react';
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
import { apiService } from '../services/api';

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
  resetFilters,
  onSelectNode
}) {
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [liveSuggestions, setLiveSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef(null);

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

  // Search autocomplete from Neo4j / API
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setLiveSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      const results = await apiService.searchEntities(searchQuery.trim(), 5);
      if (Array.isArray(results)) {
        setLiveSuggestions(results);
        setShowSuggestions(true);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener for suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
          {/* Search Box with Autocomplete */}
          <div className="relative flex-1" ref={searchContainerRef}>
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (liveSuggestions.length > 0) setShowSuggestions(true);
              }}
              placeholder="Search suspects, phones, accounts, vehicles, FIRs..."
              className="w-full pl-8 pr-8 py-1.5 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setLiveSuggestions([]);
                  setShowSuggestions(false);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs z-10"
              >
                ✕
              </button>
            )}

            {/* Live Autocomplete Dropdown */}
            {showSuggestions && liveSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#0a0f1d] border border-cyan-500/30 rounded-xl shadow-2xl z-50 overflow-hidden text-xs">
                <div className="px-3 py-1.5 bg-black/40 border-b border-white/[0.06] text-[10px] font-mono text-slate-400 flex items-center justify-between">
                  <span>Neo4j Entity Autocomplete</span>
                  <span className="text-cyan-400">{liveSuggestions.length} found</span>
                </div>
                <div className="max-h-56 overflow-y-auto">
                  {liveSuggestions.map((s, idx) => (
                    <button
                      key={s.id || idx}
                      onClick={() => {
                        setSearchQuery(s.name || s.id);
                        setShowSuggestions(false);
                        if (onSelectNode) onSelectNode(s);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-cyan-500/10 border-b border-white/[0.04] last:border-0 flex items-center justify-between transition-colors"
                    >
                      <div>
                        <div className="font-bold text-white text-xs">{s.name || s.id}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {s.role || s.type} {s.phone ? `• 📞 ${s.phone}` : ''}
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.05] text-cyan-300">
                        {s.id}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
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
              <Filter className="w-3 h-3 text-slate-400" />
              <span>Types</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-white/[0.08] text-cyan-300">
                {selectedTypes.length}/5
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showTypeFilter && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-[#0c101d] border border-white/[0.12] rounded-xl shadow-2xl p-2 z-50 space-y-1 animate-fade-in">
                <div className="text-[10px] font-mono text-slate-400 px-2 py-1 uppercase tracking-wider">
                  Filter Entity Nodes
                </div>
                {entityTypes.map((t) => {
                  const Icon = t.icon;
                  const isSelected = selectedTypes.includes(t.id);
                  const count = nodeCountsByType[t.id] || 0;
                  return (
                    <button
                      key={t.id}
                      onClick={() => toggleType(t.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                        isSelected
                          ? 'bg-cyan-500/20 text-cyan-200 font-medium'
                          : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className="w-3.5 h-3.5" />
                        <span>{t.label}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">{count}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Timeline Toggle Button */}
          <button
            onClick={() => setShowTimeline(!showTimeline)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs border transition-all ${
              showTimeline || timelineDate
                ? 'bg-purple-500/20 text-purple-200 border-purple-500/40 font-medium'
                : 'bg-black/40 text-slate-300 border-white/[0.08] hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-purple-400" />
            <span>Timeline</span>
            {timelineDate && (
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping"></span>
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

      {/* Expanded Crime Timeline Slider */}
      {showTimeline && (
        <div className="mt-3 pt-3 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs animate-fade-in">
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              onClick={() => setTimelinePlaying(!timelinePlaying)}
              className="p-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 transition-colors"
            >
              {timelinePlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>

            <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none py-1">
              <button
                onClick={() => setTimelineDate(null)}
                className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-all whitespace-nowrap ${
                  !timelineDate
                    ? 'bg-purple-500/30 text-purple-200 border border-purple-500/50 font-bold'
                    : 'bg-black/40 text-slate-400 hover:text-slate-200 border border-white/[0.05]'
                }`}
              >
                All Dates
              </button>
              {timelineDates.map((d) => (
                <button
                  key={d.date}
                  onClick={() => setTimelineDate(d.date)}
                  className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-all whitespace-nowrap ${
                    timelineDate === d.date
                      ? 'bg-purple-500/30 text-purple-200 border border-purple-500/50 font-bold shadow-sm'
                      : 'bg-black/40 text-slate-400 hover:text-slate-200 border border-white/[0.05]'
                  }`}
                >
                  Mar {d.day}
                </button>
              ))}
            </div>
          </div>

          {/* Current Timeline Event Description */}
          {currentTimelineEvent && (
            <div className="text-right text-[11px] font-mono text-purple-300 bg-purple-950/30 px-3 py-1 rounded-xl border border-purple-500/20 max-w-md truncate">
              {currentTimelineEvent.event}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
