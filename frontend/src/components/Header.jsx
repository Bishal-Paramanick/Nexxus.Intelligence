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
  Sparkles,
  Lock,
  Radio
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
    { id: 'graph', label: 'Graph Canvas', icon: Network, badge: `${kpiStats.totalNodes}` },
    { id: 'agent', label: 'AI Investigation', icon: Bot, isHighlight: true },
    { id: 'financial', label: 'Money Trail', icon: CircleDollarSign },
    { id: 'cdr', label: 'Call Matrix', icon: PhoneCall },
    { id: 'fir', label: 'FIR Corpus', icon: FileText },
    { id: 'audit', label: 'Legal Vault', icon: Scale },
  ];

  return (
    <header className="border-b border-white/[0.08] bg-[#070a13]/90 backdrop-blur-2xl sticky top-0 z-40 transition-all">
      <div className="max-w-[1780px] mx-auto px-4 lg:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Brand Identity & Active Case */}
        <div className="flex items-center space-x-3.5 shrink-0">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-600/20 to-purple-600/20 border border-cyan-500/40 text-cyan-400 shadow-sm">
            <ShieldAlert className="w-5 h-5" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-display font-black text-sm tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-200 bg-clip-text text-transparent">
                NEXXUS.INTELLIGENCE
              </h1>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
                SIH 2026
              </span>
            </div>
            <div className="flex items-center space-x-2 text-[11px] text-slate-400">
              <span className="text-amber-300 font-mono font-medium">CASE-KOL-2026</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300 truncate max-w-[240px] xl:max-w-none">
                Cyber Extortion & Laundering Syndicate
              </span>
            </div>
          </div>
        </div>

        {/* Center: Modern Segmented Navigation Tabs */}
        <nav className="flex items-center p-1 bg-black/40 border border-white/[0.08] rounded-xl overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.isHighlight && (
                  <span className="px-1 py-0.2 rounded text-[9px] font-mono bg-cyan-400/20 text-cyan-300 font-bold">
                    AI
                  </span>
                )}
                {tab.badge && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-white/[0.06] text-slate-400">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Telemetry & Actions */}
        <div className="flex items-center space-x-3 shrink-0">
          {/* Kingpin Isolated Pill */}
          <div className="hidden xl:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
            <span>Kingpin Isolated (P008)</span>
          </div>

          {/* BSA Compliance Badge */}
          <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>BSA Sec 65B</span>
          </div>

          <button 
            onClick={refreshData} 
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.08] rounded-lg transition-colors border border-white/[0.08]"
            title="Refresh Knowledge Graph"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
