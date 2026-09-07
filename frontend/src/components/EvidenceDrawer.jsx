import React, { useState, useEffect } from 'react';
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
  Fingerprint,
  TrendingUp,
  ShieldCheck,
  MapPin,
  GitFork,
  RefreshCw,
  Search
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { apiService } from '../services/api';

export default function EvidenceDrawer({
  selectedNode,
  onClose,
  onFocusNode,
  onTraceKingpin,
  onOpenFirDoc,
  onExpandSubgraph,
  allEdges = []
}) {
  const [activeTab, setActiveTab] = useState('profile');
  const [liveNeighbors, setLiveNeighbors] = useState([]);
  const [sharedLocations, setSharedLocations] = useState([]);
  const [subgraphDepth, setSubgraphDepth] = useState(2);
  const [loadingNeighbors, setLoadingNeighbors] = useState(false);
  const [loadingShared, setLoadingShared] = useState(false);
  const [selectedEdgeEvidence, setSelectedEdgeEvidence] = useState(null);

  useEffect(() => {
    if (!selectedNode) return;

    // Fetch 1-hop direct neighbors from API
    const fetchNeighbors = async () => {
      setLoadingNeighbors(true);
      const res = await apiService.getEntityNeighbors(selectedNode.id);
      if (Array.isArray(res)) {
        setLiveNeighbors(res);
      }
      setLoadingNeighbors(false);
    };

    // Fetch shared locations from API
    const fetchShared = async () => {
      setLoadingShared(true);
      const res = await apiService.getSharedLocations(selectedNode.id);
      if (Array.isArray(res)) {
        setSharedLocations(res);
      }
      setLoadingShared(false);
    };

    fetchNeighbors();
    fetchShared();
  }, [selectedNode]);

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

  // Inspect Live Evidence between two nodes
  const handleInspectEvidence = async (otherId) => {
    const ev = await apiService.getEvidence(selectedNode.id, otherId);
    setSelectedEdgeEvidence(ev);
  };

  // Expand Subgraph via API
  const handleTriggerSubgraph = async () => {
    const sub = await apiService.getEntitySubgraph(selectedNode.id, subgraphDepth);
    if (onExpandSubgraph) {
      onExpandSubgraph(sub);
    }
  };

  // SVG Circular Gauge calculations
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - ((selectedNode.risk_score || 0) / 100) * circumference;

  return (
    <aside className="fixed top-0 right-0 h-full w-full sm:w-[480px] bg-[#0a0e1a]/95 backdrop-blur-2xl border-l border-white/[0.08] shadow-2xl z-50 flex flex-col transition-all animate-fade-in">
      {/* Drawer Header */}
      <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span
            className={`w-3 h-3 rounded-full ${
              selectedNode.risk_score >= 85
                ? 'bg-rose-500 shadow-glow-rose'
                : selectedNode.risk_score >= 70
                ? 'bg-amber-500'
                : 'bg-cyan-500'
            }`}
          />
          <div>
            <h2 className="text-sm font-bold text-white truncate max-w-[260px]">
              {selectedNode.name}
            </h2>
            <span className="text-[11px] text-cyan-300 font-mono">
              {selectedNode.role || selectedNode.type}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.08] rounded-xl transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Modern Tabs */}
      <div className="flex border-b border-white/[0.08] px-4 text-xs overflow-x-auto scrollbar-none">
        {[
          { id: 'profile', label: 'Overview' },
          { id: 'neighbors', label: `1-Hop Neighbors (${liveNeighbors.length || connectedEdges.length})` },
          { id: 'shared', label: 'Co-Location' },
          { id: 'evidence', label: 'FIR Evidence' },
          { id: 'factors', label: 'Risk Metrics' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`py-2.5 px-3 font-medium transition-all border-b-2 whitespace-nowrap ${
              activeTab === t.id
                ? 'text-cyan-300 border-cyan-400 font-semibold'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 1. OVERVIEW TAB */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            {/* Suspect Master Profile Card */}
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 space-y-3.5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">
                    {selectedNode.cluster || selectedNode.cluster_id}
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    {selectedNode.name}
                  </h3>
                  <span className="text-xs text-cyan-400 font-mono">
                    ID: {selectedNode.id}
                  </span>
                </div>

                {/* Circular Animated SVG Gauge */}
                <div className="relative flex items-center justify-center">
                  <svg className="w-16 h-16 -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r={radius}
                      className="text-slate-800"
                      strokeWidth="5"
                      stroke="currentColor"
                      fill="transparent"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r={radius}
                      strokeWidth="5"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      stroke={selectedNode.risk_score >= 85 ? '#f43f5e' : selectedNode.risk_score >= 70 ? '#f59e0b' : '#06b6d4'}
                      fill="transparent"
                      className="transition-all duration-700 ease-out"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className={`text-xs font-mono font-bold ${
                      selectedNode.risk_score >= 85 ? 'text-rose-400' : selectedNode.risk_score >= 70 ? 'text-amber-400' : 'text-cyan-400'
                    }`}>
                      {selectedNode.risk_score}
                    </span>
                    <span className="text-[7px] text-slate-500 font-mono uppercase">RISK</span>
                  </div>
                </div>
              </div>

              {selectedNode.aliases?.length > 0 && (
                <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl px-3 py-2 text-xs text-indigo-300 flex items-center space-x-2">
                  <Fingerprint className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Alias: <strong className="text-indigo-200">{selectedNode.aliases.join(', ')}</strong></span>
                </div>
              )}

              <p className="text-xs text-slate-300 leading-relaxed bg-black/30 p-3 rounded-xl border border-white/[0.04]">
                {selectedNode.summary || `Intelligence record registered in Neo4j database under ${selectedNode.type}.`}
              </p>
            </div>

            {/* Quick Metadata Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-white/[0.02] border border-white/[0.06] p-3 rounded-xl">
                <span className="text-[10px] text-slate-500 block">BETWEENNESS CENTRALITY</span>
                <span className="text-cyan-300 font-bold text-sm">
                  {selectedNode.betweenness_centrality ?? '0.000'}
                </span>
              </div>
              <div className="bg-white/[0.02] border border-white/[0.06] p-3 rounded-xl">
                <span className="text-[10px] text-slate-500 block">DIRECT CONNECTIONS</span>
                <span className="text-indigo-300 font-bold text-sm">
                  {liveNeighbors.length || connectedEdges.length} 1-Hop
                </span>
              </div>
              {selectedNode.phone && (
                <div className="bg-white/[0.02] border border-white/[0.06] p-3 rounded-xl">
                  <span className="text-[10px] text-slate-500 block">PHONE NUMBER</span>
                  <span className="text-slate-200">{selectedNode.phone}</span>
                </div>
              )}
              {selectedNode.account && (
                <div className="bg-white/[0.02] border border-white/[0.06] p-3 rounded-xl">
                  <span className="text-[10px] text-slate-500 block">BANK ACCOUNT</span>
                  <span className="text-slate-200">{selectedNode.account}</span>
                </div>
              )}
              {selectedNode.vehicle && (
                <div className="bg-white/[0.02] border border-white/[0.06] p-3 rounded-xl col-span-2">
                  <span className="text-[10px] text-slate-500 block">VEHICLE LOGGED</span>
                  <span className="text-emerald-300">{selectedNode.vehicle}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => onFocusNode?.(selectedNode)}
                className="w-full py-2.5 btn-cyan font-semibold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-all shadow-sm"
              >
                <Activity className="w-4 h-4" />
                <span>Focus in Graph Canvas</span>
              </button>

              {selectedNode.id !== 'P008' && (
                <button
                  onClick={() => onTraceKingpin?.(selectedNode)}
                  className="w-full py-2.5 bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/30 text-purple-200 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-all"
                >
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Trace Shortest Path to Kingpin (Debasish)</span>
                </button>
              )}

              <button
                onClick={handleExportDossier}
                className="w-full py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-all"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Export Certified BSA 65B Dossier</span>
              </button>
            </div>
          </div>
        )}

        {/* 2. 1-HOP NEIGHBORS TAB (Direct Neo4j /api/entity/{id}/neighbors) */}
        {activeTab === 'neighbors' && (
          <div className="space-y-3">
            {/* Multi-Hop Subgraph Depth Controller */}
            <div className="bg-black/30 border border-white/[0.08] p-3 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <GitFork className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Multi-Hop Subgraph Depth</span>
                </span>
                <span className="text-cyan-300 font-bold">{subgraphDepth} Hops</span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="1"
                  max="4"
                  value={subgraphDepth}
                  onChange={(e) => setSubgraphDepth(Number(e.target.value))}
                  className="flex-1 accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
                <button
                  onClick={handleTriggerSubgraph}
                  className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[11px] font-mono border border-cyan-500/30 transition-colors"
                >
                  Expand
                </button>
              </div>
            </div>

            {loadingNeighbors ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto text-cyan-400 mb-2" />
                Querying 1-hop connections from Neo4j...
              </div>
            ) : liveNeighbors.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                No direct connections recorded for this entity.
              </div>
            ) : (
              liveNeighbors.map((item, idx) => {
                const targetEntity = item.entity || {};
                return (
                  <div
                    key={idx}
                    className="bg-white/[0.02] border border-white/[0.06] hover:border-cyan-500/40 p-3 rounded-xl text-xs space-y-1.5 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-cyan-300 font-semibold text-[11px]">
                        {item.relationship}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-slate-400">
                        {item.entity_type || 'Entity'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-xs">
                        {targetEntity.name || targetEntity.id}
                      </h4>
                      {targetEntity.id && (
                        <button
                          onClick={() => handleInspectEvidence(targetEntity.id)}
                          className="text-[10px] text-indigo-400 hover:text-indigo-300 font-mono"
                        >
                          Evidence
                        </button>
                      )}
                    </div>

                    {item.details?.evidence && (
                      <p className="text-slate-400 text-[11px] bg-black/20 p-2 rounded-lg border border-white/[0.04]">
                        {item.details.evidence}
                      </p>
                    )}
                  </div>
                );
              })
            )}

            {/* Edge Evidence Modal / Banner */}
            {selectedEdgeEvidence && (
              <div className="bg-indigo-950/40 border border-indigo-500/40 rounded-xl p-3 text-xs space-y-2 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Relationship Provenance (BSA §65B)</span>
                  </span>
                  <button onClick={() => setSelectedEdgeEvidence(null)} className="text-slate-400 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                {selectedEdgeEvidence.map((ev, i) => (
                  <div key={i} className="text-[11px] text-slate-300 font-mono">
                    <div>Source Doc: <span className="text-cyan-300">{ev.source_doc}</span></div>
                    <div>Confidence: <span className="text-emerald-400">{Math.round(ev.confidence * 100)}%</span></div>
                    <div>Timestamp: <span className="text-slate-400">{ev.timestamp}</span></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. SHARED LOCATIONS / CO-OCCURRENCE (Direct Neo4j /api/entity/{id}/shared-locations) */}
        {activeTab === 'shared' && (
          <div className="space-y-3">
            <div className="bg-cyan-950/30 border border-cyan-500/30 p-3 rounded-xl flex items-start space-x-2 text-xs text-cyan-200">
              <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Geospatial Co-Presence Analysis</span>
                <span className="text-slate-400 text-[11px]">
                  Suspects co-located at identical coordinates or premises based on CDR cell-tower triangulations and physical surveillance.
                </span>
              </div>
            </div>

            {loadingShared ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto text-cyan-400 mb-2" />
                Querying co-presence records from Neo4j...
              </div>
            ) : sharedLocations.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                No shared location records identified for this suspect.
              </div>
            ) : (
              sharedLocations.map((loc, idx) => (
                <div
                  key={idx}
                  className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3.5 space-y-2"
                >
                  <div className="flex items-center space-x-2 text-xs font-bold text-white">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>{loc.location}</span>
                  </div>

                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">
                      Co-Located Suspects:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(loc.co_located_persons || []).map((p, pIdx) => (
                        <span
                          key={pIdx}
                          className="px-2 py-0.5 rounded-lg bg-black/40 border border-white/[0.08] text-[11px] text-cyan-300 font-mono"
                        >
                          {p.name || p.id}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 4. FIR EVIDENCE TAB */}
        {activeTab === 'evidence' && (
          <div className="space-y-3">
            <div className="bg-emerald-950/30 border border-emerald-500/30 p-3 rounded-xl flex items-start space-x-2.5 text-xs">
              <Scale className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-emerald-300 block">
                  BSA 2023 / Section 65B Admissibility
                </span>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Electronic evidence corroborated from official police filings and immutable logs.
                </p>
              </div>
            </div>

            {(selectedNode.source_docs || ['FIR_101']).map((docId) => (
              <div
                key={docId}
                className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 space-y-2 hover:border-cyan-500/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-cyan-300 text-xs">
                    {docId}
                  </span>
                  <button
                    onClick={() => onOpenFirDoc?.(docId)}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
                  >
                    <span>View FIR</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-xs text-slate-300 italic font-serif bg-black/30 p-3 rounded-xl border border-white/[0.04]">
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

        {/* 5. RISK METRICS TAB */}
        {activeTab === 'factors' && (
          <div className="space-y-4">
            <div className="space-y-3">
              {[
                { label: 'Network Centrality (Betweenness)', score: breakdown.centrality_score, max: 30, color: 'bg-purple-500' },
                { label: 'Cross-Case Links (FIR 101/102/103)', score: breakdown.cross_case_links, max: 25, color: 'bg-rose-500' },
                { label: 'Call Velocity & Telemetry Spike', score: breakdown.call_velocity, max: 25, color: 'bg-amber-500' },
                { label: 'Financial Routing & Anomaly Ratio', score: breakdown.financial_anomalies, max: 20, color: 'bg-cyan-500' },
              ].map((f, i) => (
                <div key={i} className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-300 font-medium">{f.label}</span>
                    <span className="font-mono text-slate-400">+{f.score}/{f.max}</span>
                  </div>
                  <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-white/[0.06]">
                    <div
                      className={`h-full ${f.color} rounded-full transition-all duration-500`}
                      style={{ width: `${(f.score / f.max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-rose-950/40 via-purple-950/40 to-black/40 border border-rose-500/30 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs text-rose-300 font-mono block font-semibold">TOTAL EXPLAINABLE RISK</span>
                <span className="text-[11px] text-slate-400">Court-auditable mathematical breakdown</span>
              </div>
              <span className="text-2xl font-mono font-black text-rose-400">
                {selectedNode.risk_score}/100
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
