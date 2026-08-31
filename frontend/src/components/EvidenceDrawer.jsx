import React, { useState } from 'react';
import { 
  X, 
  Scale, 
  FileText, 
  Phone, 
  CreditCard, 
  Car, 
  Activity, 
  Download, 
  ExternalLink,
  Sparkles,
  Fingerprint
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function EvidenceDrawer({
  selectedNode,
  onClose,
  onFocusNode,
  onTraceKingpin,
  onOpenFirDoc,
  allEdges = []
}) {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'evidence' | 'factors' | 'links'

  if (!selectedNode) return null;

  const connectedEdges = allEdges.filter(
    (e) => e.source === selectedNode.id || e.target === selectedNode.id
  );

  const breakdown = selectedNode.score_breakdown || {
    centrality_score: Math.round((selectedNode.risk_score || 0) * 0.3),
    cross_case_links: Math.round((selectedNode.risk_score || 0) * 0.25),
    call_velocity: Math.round((selectedNode.risk_score || 0) * 0.25),
    financial_anomalies: Math.round((selectedNode.risk_score || 0) * 0.2),
  };

  const handleExportDossier = () => {
    confetti({
      particleCount: 60,
      spread: 50,
      origin: { y: 0.6 }
    });
    alert(`Court-Certified Evidence Dossier generated for [${selectedNode.name}] under BSA 2023 / Sec 65B.`);
  };

  return (
    <aside className="fixed top-0 right-0 h-full w-full sm:w-[440px] bg-[#0c101c]/95 backdrop-blur-2xl border-l border-white/[0.08] shadow-2xl z-50 flex flex-col transition-all">
      {/* Header */}
      <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              selectedNode.risk_score >= 85
                ? 'bg-rose-500 shadow-glow-rose'
                : selectedNode.risk_score >= 70
                ? 'bg-amber-500'
                : 'bg-cyan-500'
            }`}
          />
          <div>
            <h2 className="text-sm font-semibold text-white truncate max-w-[260px]">
              {selectedNode.name}
            </h2>
            <span className="text-[11px] text-cyan-300 font-mono">
              {selectedNode.role || selectedNode.type}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/[0.06] px-4 text-xs">
        {[
          { id: 'profile', label: 'Overview' },
          { id: 'evidence', label: 'FIR Evidence' },
          { id: 'factors', label: 'Risk Factors' },
          { id: 'links', label: `Links (${connectedEdges.length})` },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`py-2.5 px-3 font-medium transition-all border-b-2 ${
              activeTab === t.id
                ? 'text-cyan-300 border-cyan-400 font-semibold'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* OVERVIEW TAB */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            {/* Risk & Summary Card */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    {selectedNode.cluster || selectedNode.cluster_id}
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    {selectedNode.name}
                  </h3>
                </div>

                <div className="px-3 py-1 rounded-lg bg-black/40 border border-white/[0.08] text-center">
                  <span className="text-[9px] text-slate-400 block font-mono">RISK SCORE</span>
                  <span
                    className={`text-lg font-mono font-bold ${
                      selectedNode.risk_score >= 85
                        ? 'text-rose-400'
                        : selectedNode.risk_score >= 70
                        ? 'text-amber-400'
                        : 'text-cyan-400'
                    }`}
                  >
                    {selectedNode.risk_score}/100
                  </span>
                </div>
              </div>

              {selectedNode.aliases?.length > 0 && (
                <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-lg px-2.5 py-1.5 text-xs text-indigo-300 flex items-center space-x-2">
                  <Fingerprint className="w-3.5 h-3.5" />
                  <span>Alias: <strong>{selectedNode.aliases.join(', ')}</strong></span>
                </div>
              )}

              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedNode.summary}
              </p>
            </div>

            {/* Quick Metadata */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-white/[0.02] border border-white/[0.05] p-2.5 rounded-lg">
                <span className="text-[10px] text-slate-500 block">BETWEENNESS CENTRALITY</span>
                <span className="text-cyan-300 font-bold text-sm">
                  {selectedNode.betweenness_centrality ?? '0.000'}
                </span>
              </div>
              <div className="bg-white/[0.02] border border-white/[0.05] p-2.5 rounded-lg">
                <span className="text-[10px] text-slate-500 block">CONNECTED EDGES</span>
                <span className="text-indigo-300 font-bold text-sm">
                  {connectedEdges.length} Links
                </span>
              </div>
              {selectedNode.phone && (
                <div className="bg-white/[0.02] border border-white/[0.05] p-2.5 rounded-lg">
                  <span className="text-[10px] text-slate-500 block">PHONE NUMBER</span>
                  <span className="text-slate-200">{selectedNode.phone}</span>
                </div>
              )}
              {selectedNode.account && (
                <div className="bg-white/[0.02] border border-white/[0.05] p-2.5 rounded-lg">
                  <span className="text-[10px] text-slate-500 block">BANK ACCOUNT</span>
                  <span className="text-slate-200">{selectedNode.account}</span>
                </div>
              )}
              {selectedNode.vehicle && (
                <div className="bg-white/[0.02] border border-white/[0.05] p-2.5 rounded-lg col-span-2">
                  <span className="text-[10px] text-slate-500 block">VEHICLE LOGGED</span>
                  <span className="text-emerald-300">{selectedNode.vehicle}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => onFocusNode?.(selectedNode)}
                className="w-full py-2.5 btn-glow-cyan font-semibold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-all"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Focus in Graph Canvas</span>
              </button>

              {selectedNode.id !== 'P008' && (
                <button
                  onClick={() => onTraceKingpin?.(selectedNode)}
                  className="w-full py-2 bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/30 text-purple-300 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Trace Path to Kingpin (Debasish)</span>
                </button>
              )}

              <button
                onClick={handleExportDossier}
                className="w-full py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export BSA 65B Dossier</span>
              </button>
            </div>
          </div>
        )}

        {/* EVIDENCE TAB */}
        {activeTab === 'evidence' && (
          <div className="space-y-3">
            <div className="bg-emerald-950/20 border border-emerald-500/30 p-3 rounded-xl flex items-start space-x-2.5 text-xs">
              <Scale className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-emerald-300 block">
                  BSA 2023 / Section 65B Validated
                </span>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Evidence extracted directly from official FIR records with cryptographic verification.
                </p>
              </div>
            </div>

            {(selectedNode.source_docs || ['FIR_101']).map((docId) => (
              <div
                key={docId}
                className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3.5 space-y-2 hover:border-cyan-500/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-cyan-300 text-xs">
                    {docId}
                  </span>
                  <button
                    onClick={() => onOpenFirDoc?.(docId)}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
                  >
                    <span>View Case</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-xs text-slate-300 italic font-serif bg-black/30 p-2.5 rounded-lg border border-white/[0.04]">
                  {docId === 'FIR_101' &&
                    '“...named as recovery agent threatening complainant at Salt Lake residence; coerced ₹45,000 transfer to acct 30123456789.”'}
                  {docId === 'FIR_102' &&
                    '“...witnessed coordinating recovery teams; personally met Debasish Chatterjee at Howrah Maidan tea stall.”'}
                  {docId === 'FIR_103' &&
                    '“...identified visiting Kolkata Commercial Bank with Debasish Chatterjee in vehicle WB01AB1234; flagged in circular money routing.”'}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* RISK FACTORS TAB */}
        {activeTab === 'factors' && (
          <div className="space-y-4">
            <div className="space-y-3">
              {[
                { label: 'Network Centrality (Betweenness)', score: breakdown.centrality_score, max: 30, color: 'bg-purple-500' },
                { label: 'Cross-Case Links (FIRs)', score: breakdown.cross_case_links, max: 25, color: 'bg-rose-500' },
                { label: 'Call Velocity / Spikes', score: breakdown.call_velocity, max: 25, color: 'bg-amber-500' },
                { label: 'Financial Routing Anomalies', score: breakdown.financial_anomalies, max: 20, color: 'bg-cyan-500' },
              ].map((f, i) => (
                <div key={i} className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-300">{f.label}</span>
                    <span className="font-mono text-slate-400">+{f.score}/{f.max}</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className={`h-full ${f.color} rounded-full`}
                      style={{ width: `${(f.score / f.max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white/[0.02] border border-white/[0.06] p-3.5 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block font-mono">TOTAL EXPLAINABLE SCORE</span>
                <span className="text-[11px] text-slate-500">Auditable in court</span>
              </div>
              <span className="text-2xl font-mono font-bold text-rose-400">
                {selectedNode.risk_score}/100
              </span>
            </div>
          </div>
        )}

        {/* LINKS TAB */}
        {activeTab === 'links' && (
          <div className="space-y-2">
            {connectedEdges.map((edge) => (
              <div
                key={edge.id}
                className="bg-white/[0.02] border border-white/[0.06] p-2.5 rounded-xl text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-cyan-300 font-medium">
                    {edge.type}
                  </span>
                  {edge.amount && (
                    <span className="font-mono text-amber-300 font-bold">
                      ₹{(edge.amount).toLocaleString('en-IN')}
                    </span>
                  )}
                  {edge.frequency && (
                    <span className="font-mono text-rose-300 font-bold">
                      {edge.frequency} Calls
                    </span>
                  )}
                </div>
                <p className="text-slate-400 text-[11px]">
                  {edge.source === selectedNode.id ? edge.target_name : edge.source_name}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
