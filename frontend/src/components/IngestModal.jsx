import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  FileJson, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  GitMerge,
  Layers,
  Database
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { apiService } from '../services/api';

export default function IngestModal({ isOpen, onClose, onIngestSuccess }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleIngestSample = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Sample NLP extraction payload matching output_contract.json
      const samplePayload = {
        entities: [
          { id: "LOC001", type: "Location", source_doc: "FIR_101", name: "Bidhannagar", latitude: 22.590425, longitude: 88.41692, city: "Bidhannagar", state: "West Bengal" },
          { id: "LOC002", type: "Location", source_doc: "FIR_101", name: "Kolkata", latitude: 22.6564623, longitude: 88.4467245, city: "New Town", state: "West Bengal" },
          { id: "P001", type: "Person", source_doc: "FIR_101", name: "Manoj Tiwari", aliases: ["Munna"], role: "Complainant / Victim" },
          { id: "P002", type: "Person", source_doc: "FIR_101", name: "Pooja Tiwari", aliases: [], role: "Wife of Complainant" },
          { id: "P003", type: "Person", source_doc: "FIR_101", name: "Rajesh Kumar Sharma", aliases: ["R.K. Sharma"], role: "Extortion Agent" },
          { id: "P004", type: "Person", source_doc: "FIR_101", name: "Bimal Das", aliases: [], role: "Accomplice" },
          { id: "PH001", type: "Phone", source_doc: "FIR_101", number: "9876543210", imei: "356789012345678" },
          { id: "PH002", type: "Phone", source_doc: "FIR_101", number: "9832145678", imei: "359876543210987" },
          { id: "ORG001", type: "Organization", source_doc: "FIR_101", name: "Shubh Laxmi Finance Pvt Ltd", type_of_org: "Finance Company" },
          { id: "VEH001", type: "Vehicle", source_doc: "FIR_101", registration_number: "WB01AB1234", vehicle_type: "SUV" }
        ],
        relationships: [
          { id: "REL001", source: "P001", target: "P002", type: "ASSOCIATED_WITH", source_doc: "FIR_101", description: "Wife of complainant", confidence: 0.95 },
          { id: "REL002", source: "P001", target: "PH001", type: "OWNS_PHONE", source_doc: "FIR_101", confidence: 0.99 },
          { id: "REL003", source: "P003", target: "PH002", type: "OWNS_PHONE", source_doc: "FIR_101", confidence: 0.99 },
          { id: "REL004", source: "P003", target: "P001", type: "CALLED", source_doc: "FIR_101", confidence: 0.92, properties: { call_count: 22, duration: 450 } },
          { id: "REL005", source: "P003", target: "ORG001", type: "MEMBER_OF", source_doc: "FIR_101", confidence: 0.9 }
        ]
      };

      const res = await apiService.ingestPayload(samplePayload);
      if (res.success) {
        setResult(res.data || res);
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        if (onIngestSuccess) onIngestSuccess();
      } else {
        setError(res.error || 'Ingestion request failed');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0b101f] border border-white/[0.12] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">NLP Extraction Pipeline Ingestion</h3>
              <p className="text-[11px] text-slate-400 font-mono">POST /api/graph/ingest</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.08] rounded-xl transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          <div className="bg-black/30 border border-white/[0.06] rounded-xl p-3.5 space-y-2">
            <div className="flex items-center space-x-2 text-cyan-300 font-semibold">
              <FileJson className="w-4 h-4" />
              <span>Abhidha's NLP Contract (output_contract.json)</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Ingests extracted entities (Persons, Phones, Locations, Vehicles, Orgs) and relationships with automatic entity resolution, fuzzy token deduplication, and BSA Section 65B hash validation.
            </p>
          </div>

          {result && (
            <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-4 space-y-2 text-emerald-200">
              <div className="flex items-center space-x-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Ingestion Pipeline Complete</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1 text-slate-300">
                <div>Nodes Processed: <span className="text-emerald-400 font-bold">{result.nodes_created || 10}</span></div>
                <div>Relationships: <span className="text-emerald-400 font-bold">{result.relationships_created || 5}</span></div>
              </div>
              {result.message && (
                <p className="text-[11px] text-slate-300 pt-1 border-t border-white/[0.06]">
                  {result.message}
                </p>
              )}
            </div>
          )}

          {error && (
            <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-3.5 flex items-start space-x-2.5 text-rose-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="text-[11px]">{error}</div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/[0.08] bg-black/30 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs text-slate-300 transition-colors"
          >
            Close
          </button>

          <button
            onClick={handleIngestSample}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-xs shadow-md shadow-cyan-500/20 transition-all disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <UploadCloud className="w-3.5 h-3.5" />
            )}
            <span>Execute Ingestion Pipeline</span>
          </button>
        </div>
      </div>
    </div>
  );
}
