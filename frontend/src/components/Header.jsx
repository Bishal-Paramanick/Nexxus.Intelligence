import React from 'react';
import { 
  ShieldAlert, 
  Network, 
  Bot, 
  CircleDollarSign, 
  PhoneCall, 
  FileText, 
  Scale, 
  RefreshCw,
  Sparkles
} from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  backendStatus, 
  refreshData, 
  caseInfo, 
  kpiStats 
}) {
  const tabs = [
    { id: 'graph', label: 'Graph Canvas', icon: Network },
    { id: 'agent', label: 'AI Investigation', icon: Bot, isNew: true },
    { id: 'financial', label: 'Money Trail', icon: CircleDollarSign },
    { id: 'cdr', label: 'Call Matrix', icon: PhoneCall },
    { id: 'fir', label: 'FIR Corpus', icon: FileText },
    { id: 'audit', label: 'Legal Vault', icon: Scale },
  ];

  return (
    <header className="border-b border-white/[0.06] bg-[#090d16]/90 backdrop-blur-xl sticky top-0 z-40 transition-all">
      <div className="max-w-[1720px] mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-display font-bold text-sm tracking-tight text-white">
                Nexxus Intelligence
              </h1>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-white/[0.05] text-slate-300 border border-white/[0.08]">
                SIH 2026
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center space-x-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Kolkata Crime Knowledge Graph</span>
            </p>
          </div>
        </div>

        {/* Center: Clean Modern Segmented Tab Switcher */}
        <nav className="flex items-center p-1 bg-black/40 border border-white/[0.06] rounded-xl overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03] border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.isNew && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Telemetry & Actions */}
        <div className="flex items-center space-x-3 shrink-0">
          {/* Quick Metrics */}
          <div className="hidden lg:flex items-center space-x-2 text-xs font-mono">
            <span className="px-2 py-1 rounded-md bg-white/[0.03] border border-white/[0.06] text-slate-300">
              <strong className="text-cyan-400">{kpiStats.totalNodes}</strong> Entities
            </span>
            <span className="px-2 py-1 rounded-md bg-white/[0.03] border border-white/[0.06] text-slate-300">
              <strong className="text-indigo-400">{kpiStats.totalEdges}</strong> Links
            </span>
          </div>

          <button 
            onClick={refreshData} 
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors border border-white/[0.06]"
            title="Refresh Knowledge Graph"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
