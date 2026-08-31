import React, { useState } from 'react';
import { 
  FileText, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { FIR_CORPUS } from '../data/mockIntelligenceData';

export default function FirCorpusView({ onJumpToGraph }) {
  const [selectedDocId, setSelectedDocId] = useState('FIR_101');

  const currentFir = FIR_CORPUS.find(f => f.doc_id === selectedDocId) || FIR_CORPUS[0];

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto overflow-y-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
        <div>
          <h2 className="text-lg font-bold text-white">
            FIR Corpus & Police Records
          </h2>
          <p className="text-xs text-slate-400">
            Official police case transcripts parsed and linked into the knowledge graph.
          </p>
        </div>

        <div className="flex items-center space-x-1.5 text-xs font-mono">
          {FIR_CORPUS.map((fir) => (
            <button
              key={fir.doc_id}
              onClick={() => setSelectedDocId(fir.doc_id)}
              className={`px-3.5 py-1.5 rounded-lg border transition-all ${
                selectedDocId === fir.doc_id
                  ? 'bg-white/[0.1] text-white font-semibold border-white/[0.15]'
                  : 'bg-black/30 text-slate-400 border-white/[0.06] hover:text-white'
              }`}
            >
              {fir.doc_id}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FIR Document Transcript */}
        <div className="lg:col-span-2 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between border-b border-white/[0.06] pb-3 gap-2">
            <div>
              <span className="text-[10px] text-slate-500 font-mono block uppercase">
                {currentFir.police_station}
              </span>
              <h3 className="text-sm font-semibold text-white">
                FIR No: {currentFir.fir_no} • {currentFir.date}
              </h3>
            </div>

            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-rose-500/20 text-rose-300">
              {currentFir.offence}
            </span>
          </div>

          <div className="bg-black/40 border border-white/[0.04] rounded-xl p-4 font-mono text-xs text-slate-300 leading-relaxed max-h-[480px] overflow-y-auto whitespace-pre-wrap">
            {currentFir.text}
          </div>
        </div>

        {/* Extracted Details Sidebar */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Extracted Incident Details</span>
            </h4>

            <div className="space-y-3 text-xs">
              <div className="bg-black/30 p-3 rounded-xl border border-white/[0.04] space-y-1">
                <span className="text-[10px] text-slate-500 font-mono block">COMPLAINANT</span>
                <span className="text-white font-medium">{currentFir.complainant}</span>
              </div>

              <div className="bg-black/30 p-3 rounded-xl border border-white/[0.04] space-y-1">
                <span className="text-[10px] text-slate-500 font-mono block">ACCUSED NAMED</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {currentFir.accused.map((a, i) => (
                    <span key={i} className="px-2 py-0.5 rounded text-[11px] bg-rose-500/15 text-rose-300 font-mono">
                      {a}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-black/30 p-3 rounded-xl border border-white/[0.04] space-y-1">
                <span className="text-[10px] text-slate-500 font-mono block">INCIDENT SUMMARY</span>
                <p className="text-slate-300 text-xs leading-relaxed">{currentFir.summary}</p>
              </div>
            </div>
          </div>

          <button
            onClick={onJumpToGraph}
            className="w-full py-2.5 btn-glow-cyan font-semibold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-all mt-4"
          >
            <span>Explore in Graph Canvas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
