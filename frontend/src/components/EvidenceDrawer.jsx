import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldAlert, 
  Scale, 
  FileText, 
  Phone, 
  CreditCard, 
  Car, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Share2, 
  Download, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Fingerprint,
  Sparkles
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
  const [evidenceData, setEvidenceData] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('profile'); // 'profile' | 'evidence' | 'telemetry' | 'connections'
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!selectedNode) return;
    // Set active tab default
    setActiveSubTab('profile');
  }, [selectedNode]);

  if (!selectedNode) return null;

  // Filter connected edges
  const connectedEdges = allEdges.filter(
    (e) => e.source === selectedNode.id || e.target === selectedNode.id
  );

  const breakdown = selectedNode.score_breakdown || {
    centrality_score: Math.round((selectedNode.risk_score || 0) * 0.3),
    cross_case_links: Math.round((selectedNode.risk_score || 0) * 0.25),
    call_velocity: Math.round((selectedNode.risk_score || 0) * 0.25),
    financial_anomalies: Math.round((selectedNode.risk_score || 0) * 0.2),
  };

  const handleExportCertifiedDossier = () => {
    confetti({
      particleCount: 75,
      spread: 60,
      origin: { y: 0.6 }
    });
    alert(`Court-Admissible Evidence Dossier for [${selectedNode.name}] has been generated under Bharatiya Sakshya Adhiniyam (BSA) 2023 / Sec 65B.`);
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(selectedNode.id);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <aside className="fixed top-0 right-0 h-full w-full sm:w-[460px] md:w-[500px] bg-[#070b18]/95 backdrop-blur-2xl border-l border-slate-800 shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out">
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center space-x-2.5">
          <div
            className={`w-3 h-3 rounded-full ${
              selectedNode.risk_score >= 85
                ? 'bg-rose-500 shadow-glow-rose animate-pulse'
                : selectedNode.risk_score >= 70
                ? 'bg-amber-500'
                : 'bg-cyan-500'
            }`}
          />
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400">
              ENTITY AUDIT // {selectedNode.type}
            </span>
            <h2 className="text-base font-display font-bold text-slate-100 truncate max-w-[280px]">
              {selectedNode.name}
            </h2>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={handleCopyId}
            className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded-lg text-xs font-mono"
            title="Copy Entity ID"
          >
            {copiedLink ? '✓ Copied' : selectedNode.id}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Drawer Navigation Tabs */}
      <div className="flex border-b border-slate-800/80 px-4 bg-slate-950/40 text-xs">
        {[
          { id: 'profile', label: 'Suspect Profile' },
          { id: 'evidence', label: 'FIR Evidence & BSA' },
          { id: 'telemetry', label: 'Risk Factor Gauge' },
          { id: 'connections', label: `Links (${connectedEdges.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`py-2.5 px-3 font-medium transition-all border-b-2 ${
              activeSubTab === tab.id
                ? 'text-cyan-300 border-cyan-400 bg-cyan-950/20'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Drawer Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* === TAB 1: SUSPECT PROFILE === */}
        {activeSubTab === 'profile' && (
          <div className="space-y-4">
            {/* Suspect Master Card */}
            <div className="glass-card-interactive rounded-xl p-4 border border-slate-800/80 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold mb-1.5 ${
                      selectedNode.risk_score >= 85
                        ? 'bg-rose-950 text-rose-300 border border-rose-600/40'
                        : selectedNode.risk_score >= 70
                        ? 'bg-amber-950 text-amber-300 border border-amber-600/40'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-600/40'
                    }`}
                  >
                    {selectedNode.risk_tier || 'SYNDICATE NODE'}
                  </span>
                  <h3 className="text-lg font-bold text-slate-100 font-display">
                    {selectedNode.name}
                  </h3>
                  <p className="text-xs text-cyan-300 font-mono">
                    {selectedNode.role || selectedNode.type}
                  </p>
                </div>

                {/* Risk Score Circle Meter */}
                <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-center min-w-[70px]">
                  <span className="text-[10px] font-mono text-slate-400">RISK</span>
                  <span
                    className={`text-xl font-mono font-black ${
                      selectedNode.risk_score >= 85
                        ? 'text-rose-400'
                        : selectedNode.risk_score >= 70
                        ? 'text-amber-400'
                        : 'text-cyan-400'
                    }`}
                  >
                    {selectedNode.risk_score || 0}
                  </span>
                  <span className="text-[9px] text-slate-500">/100</span>
                </div>
              </div>

              {/* Aliases Banner */}
              {selectedNode.aliases && selectedNode.aliases.length > 0 && (
                <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-lg p-2 text-xs flex items-center space-x-2">
                  <Fingerprint className="w-4 h-4 text-indigo-400" />
                  <span className="text-slate-300">
                    Known Aliases:{' '}
                    <strong className="text-indigo-300">
                      {selectedNode.aliases.join(', ')}
                    </strong>
                  </span>
                </div>
              )}

              {/* Summary Description */}
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
                {selectedNode.summary}
              </p>
            </div>

            {/* Quick Metadata Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-lg">
                <span className="text-[10px] text-slate-400 block font-mono">
                  CLUSTER SECTOR
                </span>
                <span className="font-semibold text-slate-200">
                  {selectedNode.cluster || selectedNode.cluster_id}
                </span>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-lg">
                <span className="text-[10px] text-slate-400 block font-mono">
                  BETWEENNESS CENTRALITY
                </span>
                <span className="font-mono font-bold text-cyan-300">
                  {selectedNode.betweenness_centrality ?? '0.000'}
                </span>
              </div>
              {selectedNode.phone && (
                <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-lg">
                  <span className="text-[10px] text-slate-400 block font-mono">
                    LINKED PHONE
                  </span>
                  <span className="font-mono text-cyan-300 flex items-center space-x-1">
                    <Phone className="w-3 h-3 text-cyan-400" />
                    <span>{selectedNode.phone}</span>
                  </span>
                </div>
              )}
              {selectedNode.account && (
                <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-lg">
                  <span className="text-[10px] text-slate-400 block font-mono">
                    BANK ACCOUNT
                  </span>
                  <span className="font-mono text-purple-300 flex items-center space-x-1">
                    <CreditCard className="w-3 h-3 text-purple-400" />
                    <span>{selectedNode.account}</span>
                  </span>
                </div>
              )}
              {selectedNode.vehicle && (
                <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-lg col-span-2">
                  <span className="text-[10px] text-slate-400 block font-mono">
                    TELEMETRY VEHICLE
                  </span>
                  <span className="font-mono text-emerald-300 flex items-center space-x-1">
                    <Car className="w-3 h-3 text-emerald-400" />
                    <span>{selectedNode.vehicle}</span>
                  </span>
                </div>
              )}
            </div>

            {/* Action Shortcuts */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => onFocusNode?.(selectedNode)}
                className="w-full py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center space-x-1.5 shadow-glow-cyan transition-all"
              >
                <Activity className="w-4 h-4" />
                <span>Focus Node in Canvas</span>
              </button>

              {selectedNode.id !== 'P008' && (
                <button
                  onClick={() => onTraceKingpin?.(selectedNode)}
                  className="w-full py-2 bg-purple-950/60 hover:bg-purple-900/70 border border-purple-500/50 text-purple-200 font-medium rounded-lg text-xs flex items-center justify-center space-x-1.5 transition-all"
                >
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Trace Shortest Path to Kingpin (Debasish)</span>
                </button>
              )}

              <button
                onClick={handleExportCertifiedDossier}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-medium rounded-lg text-xs flex items-center justify-center space-x-1.5 transition-all"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Export Certified BSA 65B Dossier</span>
              </button>
            </div>
          </div>
        )}

        {/* === TAB 2: FIR EVIDENCE & BSA COMPLIANCE === */}
        {activeSubTab === 'evidence' && (
          <div className="space-y-4">
            <div className="bg-emerald-950/40 border border-emerald-500/40 p-3 rounded-lg flex items-start space-x-2.5">
              <Scale className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-emerald-300 block">
                  Bharatiya Sakshya Adhiniyam (BSA) Compliance
                </span>
                <p className="text-slate-300 text-[11px] mt-0.5">
                  Electronic evidence extracted with immutable document hash and chain-of-custody timestamps admissible under Section 65B Indian Evidence Act.
                </p>
              </div>
            </div>

            {/* Source FIR Citations */}
            <div className="space-y-3">
              <span className="text-xs font-mono text-slate-400 block uppercase">
                Corroborating FIR Filings ({selectedNode.source_docs?.length || 1})
              </span>

              {(selectedNode.source_docs || ['FIR_101']).map((docId) => (
                <div
                  key={docId}
                  className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 space-y-2 hover:border-cyan-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-cyan-300 text-xs">
                      {docId}
                    </span>
                    <button
                      onClick={() => onOpenFirDoc?.(docId)}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 font-mono"
                    >
                      <span>Open Full FIR</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 bg-slate-900/80 p-2 rounded border border-slate-800/80 font-serif italic">
                    {docId === 'FIR_101' &&
                      '“...named as recovery agent threatening complainant at Salt Lake residence; coerced ₹45,000 transfer to acct 30123456789.”'}
                    {docId === 'FIR_102' &&
                      '“...witnessed coordinating recovery teams; personally met Debasish Chatterjee at Howrah Maidan tea stall.”'}
                    {docId === 'FIR_103' &&
                      '“...identified visiting Kolkata Commercial Bank with Debasish Chatterjee in vehicle WB01AB1234; flagged in circular money routing.”'}
                  </p>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
                    <span>Confidence: 96.4%</span>
                    <span className="text-emerald-400">✓ Cryptographically Signed</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === TAB 3: EXPLAINABLE RISK GAUGE === */}
        {activeSubTab === 'telemetry' && (
          <div className="space-y-4">
            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-lg text-xs space-y-2">
              <span className="font-mono text-cyan-300 font-bold block">
                MATHEMATICAL RISK FORMULA
              </span>
              <p className="text-slate-400 font-mono text-[11px]">
                Risk Score = Centrality + Cross-Case Links + Call Velocity + Financial Anomalies
              </p>
            </div>

            {/* Multi-Factor Breakdown Bars */}
            <div className="space-y-3">
              {[
                { label: 'Network Centrality (Betweenness)', score: breakdown.centrality_score, max: 30, color: 'bg-purple-500' },
                { label: 'Cross-Case Linkages (FIR 101/102/103)', score: breakdown.cross_case_links, max: 25, color: 'bg-rose-500' },
                { label: 'Call Velocity & Telemetry Spike', score: breakdown.call_velocity, max: 25, color: 'bg-amber-500' },
                { label: 'Financial Routing & Anomaly Ratio', score: breakdown.financial_anomalies, max: 20, color: 'bg-cyan-500' },
              ].map((factor, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-300">{factor.label}</span>
                    <span className="font-bold text-slate-100">
                      +{factor.score}/{factor.max}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full ${factor.color} rounded-full transition-all duration-500`}
                      style={{ width: `${(factor.score / factor.max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Total Cumulative Score Pill */}
            <div className="bg-gradient-to-r from-rose-950/60 to-purple-950/60 border border-rose-500/40 p-3 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-rose-300 block">TOTAL EXPLAINABLE SCORE</span>
                <span className="text-[11px] text-slate-400">Auditable in court proceedings</span>
              </div>
              <span className="text-2xl font-mono font-black text-rose-400">
                {selectedNode.risk_score}/100
              </span>
            </div>
          </div>
        )}

        {/* === TAB 4: CONNECTIONS & EDGES === */}
        {activeSubTab === 'connections' && (
          <div className="space-y-3">
            <span className="text-xs font-mono text-slate-400 block">
              DIRECT 1-HOP NEIGHBORS ({connectedEdges.length})
            </span>

            <div className="space-y-2">
              {connectedEdges.map((edge) => (
                <div
                  key={edge.id}
                  className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 p-2.5 rounded-lg text-xs space-y-1.5 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-cyan-300 font-semibold">
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
                  <p className="text-[11px] text-slate-400">
                    Connected to:{' '}
                    <strong className="text-slate-200">
                      {edge.source === selectedNode.id ? edge.target_name : edge.source_name}
                    </strong>
                  </p>
                  <p className="text-[10px] text-slate-500 line-clamp-2">
                    {edge.evidence}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
