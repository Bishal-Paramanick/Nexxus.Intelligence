import React from 'react';
import { 
  ShieldAlert, 
  Network, 
  Bot, 
  CircleDollarSign, 
  PhoneCall, 
  FileText, 
  Scale, 
  Radio, 
  RefreshCw,
  Cpu,
  AlertTriangle,
  Lock,
  Layers
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
    { id: 'graph', label: 'Graph Canvas', icon: Network, badge: `${kpiStats.totalNodes} Nodes` },
    { id: 'agent', label: 'AI Agent Console', icon: Bot, badge: 'LangGraph' },
    { id: 'financial', label: 'Circular Money Trail', icon: CircleDollarSign, badge: '₹500k Loop' },
    { id: 'cdr', label: 'CDR Telemetry', icon: PhoneCall, badge: '22-Call Spike' },
    { id: 'fir', label: 'FIR Corpus & NER', icon: FileText, badge: '3 FIRs' },
    { id: 'audit', label: 'BSA Legal Vault', icon: Scale, badge: 'Sec 65B' },
  ];

  return (
    <header className="border-b border-slate-800 bg-[#070b18]/90 backdrop-blur-md sticky top-0 z-40">
      {/* Top Banner: Status & Case Telemetry */}
      <div className="px-4 py-2 border-b border-slate-800/60 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 font-mono font-medium">
            <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>NEXXUS // INTEL PLATFORM</span>
          </span>
          <span className="hidden sm:inline-block text-slate-600">|</span>
          <span className="text-slate-300 font-medium">
            Case: <span className="text-amber-300 font-mono">{caseInfo?.id || 'CASE-KOL-2026-088'}</span>
          </span>
          <span className="hidden md:inline text-slate-400 truncate max-w-md">
            • {caseInfo?.title || 'Operation Kolkata Synergy'}
          </span>
        </div>

        <div className="flex items-center space-x-3">
          {/* Backend Connection Indicator */}
          <div className="flex items-center space-x-1.5">
            <span className={`w-2 h-2 rounded-full ${backendStatus.isLive ? 'bg-emerald-400 animate-ping' : 'bg-cyan-400'}`}></span>
            <span className="font-mono text-slate-300">
              {backendStatus.isLive ? 'LIVE FASTAPI' : 'AUTONOMOUS CORE'}
            </span>
          </div>

          {/* Legal Compliance Badge */}
          <span className="hidden lg:flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-mono text-[11px]">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>BSA 2023 SEC 65B VALIDATED</span>
          </span>

          <button 
            onClick={refreshData} 
            className="p-1 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded transition-colors"
            title="Reload Knowledge Graph"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Header & Module Navigation */}
      <div className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 via-blue-600/20 to-purple-600/20 border border-cyan-500/50 shadow-glow-cyan">
            <ShieldAlert className="w-6 h-6 text-cyan-400" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping"></span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-display font-black tracking-wider text-lg bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-300 bg-clip-text text-transparent">
                NEXXUS.INTELLIGENCE
              </h1>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-indigo-950/80 text-indigo-300 border border-indigo-500/40">
                v2.6 SIH
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              AI Crime Knowledge Graph & Multi-Agent Investigation
            </p>
          </div>
        </div>

        {/* Quick KPI Stat Chips */}
        <div className="hidden xl:flex items-center space-x-2">
          <div className="px-2.5 py-1 rounded-md bg-slate-900/90 border border-slate-800 flex items-center space-x-2 text-xs">
            <span className="text-slate-400">Entities:</span>
            <span className="font-mono font-bold text-cyan-300">{kpiStats.totalNodes}</span>
          </div>
          <div className="px-2.5 py-1 rounded-md bg-slate-900/90 border border-slate-800 flex items-center space-x-2 text-xs">
            <span className="text-slate-400">Links:</span>
            <span className="font-mono font-bold text-indigo-300">{kpiStats.totalEdges}</span>
          </div>
          <div className="px-2.5 py-1 rounded-md bg-rose-950/40 border border-rose-800/50 flex items-center space-x-2 text-xs text-rose-300">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span className="font-bold">Kingpin Identified</span>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <nav className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg font-medium text-xs transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-200 border border-cyan-500/50 shadow-glow-cyan'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                    isActive 
                      ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/40' 
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
