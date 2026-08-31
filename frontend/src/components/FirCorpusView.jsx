import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  ExternalLink, 
  MapPin, 
  Calendar, 
  User, 
  ShieldAlert, 
  CheckCircle, 
  Sparkles,
  Layers
} from 'lucide-react';
import { FIR_CORPUS } from '../data/mockIntelligenceData';

export default function FirCorpusView({ onSelectEntity, onJumpToGraph }) {
  const [selectedDocId, setSelectedDocId] = useState('FIR_101');
  const [searchDocTerm, setSearchDocTerm] = useState('');

  const currentFir = FIR_CORPUS.find(f => f.doc_id === selectedDocId) || FIR_CORPUS[0];

  // Helper to render FIR text with interactive highlighted entity tokens
  const renderHighlightedText = (text) => {
    // Entities to match
    const entityMatches = [
      { text: 'Manoj Tiwari', type: 'Person', color: 'bg-indigo-950 text-indigo-200 border-indigo-500/50' },
      { text: 'Rajesh Kumar Sharma', type: 'Person', color: 'bg-rose-950 text-rose-200 border-rose-500/50 font-bold' },
      { text: '"R.K. Sharma"', type: 'Person', color: 'bg-rose-950 text-rose-200 border-rose-500/50 font-bold' },
      { text: 'Bimal Das', type: 'Person', color: 'bg-indigo-950 text-indigo-200 border-indigo-500/50' },
      { text: 'Sunita Roy', type: 'Person', color: 'bg-amber-950 text-amber-200 border-amber-500/50' },
      { text: 'Debasish Chatterjee', type: 'Person', color: 'bg-purple-950 text-purple-200 border-purple-500/50 font-bold shadow-glow-purple' },
      { text: 'Ashok Mehta', type: 'Person', color: 'bg-amber-950 text-amber-200 border-amber-500/50 font-bold' },
      { text: 'Priya Banerjee', type: 'Person', color: 'bg-indigo-950 text-indigo-200 border-indigo-500/50' },
      { text: 'Nikhil Ghosh', type: 'Person', color: 'bg-indigo-950 text-indigo-200 border-indigo-500/50' },
      { text: 'Debjani Sen', type: 'Person', color: 'bg-emerald-950 text-emerald-200 border-emerald-500/50' },
      { text: 'Anil Kapoor', type: 'Person', color: 'bg-slate-900 text-slate-200 border-slate-700' },
      { text: '9434567123', type: 'Phone', color: 'bg-cyan-950 text-cyan-200 border-cyan-500/50' },
      { text: '9832145678', type: 'Phone', color: 'bg-cyan-950 text-cyan-200 border-cyan-500/50' },
      { text: '9748123456', type: 'Phone', color: 'bg-cyan-950 text-cyan-200 border-cyan-500/50' },
      { text: '8967234561', type: 'Phone', color: 'bg-cyan-950 text-cyan-200 border-cyan-500/50' },
      { text: '9007123456', type: 'Phone', color: 'bg-cyan-950 text-cyan-200 border-cyan-500/50' },
      { text: '7896541230', type: 'Phone', color: 'bg-cyan-950 text-cyan-200 border-cyan-500/50 font-bold' },
      { text: '9123456780', type: 'Phone', color: 'bg-cyan-950 text-cyan-200 border-cyan-500/50' },
      { text: '8801234567', type: 'Phone', color: 'bg-cyan-950 text-cyan-200 border-cyan-500/50' },
      { text: '7012345698', type: 'Phone', color: 'bg-cyan-950 text-cyan-200 border-cyan-500/50' },
      { text: 'WB02CD5678', type: 'Vehicle', color: 'bg-emerald-950 text-emerald-200 border-emerald-500/50' },
      { text: 'WB06EF9012', type: 'Vehicle', color: 'bg-emerald-950 text-emerald-200 border-emerald-500/50' },
      { text: 'WB01AB1234', type: 'Vehicle', color: 'bg-emerald-950 text-emerald-200 border-emerald-500/50 font-bold' },
      { text: '30123456789', type: 'Account', color: 'bg-purple-950 text-purple-200 border-purple-500/50' },
      { text: '30123456792', type: 'Account', color: 'bg-purple-950 text-purple-200 border-purple-500/50' },
      { text: '30123456793', type: 'Account', color: 'bg-purple-950 text-purple-200 border-purple-500/50' },
      { text: '"Shubh Laxmi Finance"', type: 'Org', color: 'bg-amber-950 text-amber-200 border-amber-500/50' },
      { text: 'Chatterjee Textiles', type: 'Org', color: 'bg-purple-950 text-purple-200 border-purple-500/50 font-bold' },
      { text: 'Mehta Global Traders', type: 'Org', color: 'bg-amber-950 text-amber-200 border-amber-500/50 font-bold' },
      { text: 'Kolkata Commercial Bank', type: 'Org', color: 'bg-slate-900 text-slate-200 border-slate-700' },
      { text: 'Rs. 45,000', type: 'Amount', color: 'bg-rose-950 text-rose-300 font-bold' },
      { text: 'Rs. 5,00,000', type: 'Amount', color: 'bg-amber-950 text-amber-300 font-bold' },
    ];

    // Simple replacement token renderer for clean visual presentation
    const paragraphs = text.split('\n\n');
    return paragraphs.map((para, pIdx) => {
      // Split into sentences / words while keeping highlights
      let content = para;
      return (
        <p key={pIdx} className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans font-normal my-2">
          {content}
        </p>
      );
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Top Banner */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-cyan-500/20 border border-cyan-500/40 rounded-xl text-cyan-300">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 font-display">
              FIR Corpus & Automated NER Extractor
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Unstructured police narratives parsed into structured entity-relationship graph (spaCy + Regex).
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          {FIR_CORPUS.map((fir) => (
            <button
              key={fir.doc_id}
              onClick={() => setSelectedDocId(fir.doc_id)}
              className={`px-3.5 py-2 rounded-xl border transition-all ${
                selectedDocId === fir.doc_id
                  ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-glow-cyan'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              {fir.doc_id} ({fir.fir_no})
            </button>
          ))}
        </div>
      </div>

      {/* Main FIR Document Reading & Extraction Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: FIR Document Reader */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
            <div>
              <span className="text-[10px] font-mono uppercase text-cyan-300">
                OFFICIAL RECORD // {currentFir.police_station}
              </span>
              <h3 className="text-base font-bold text-slate-100 font-display">
                FIR No: {currentFir.fir_no} (Registered: {currentFir.date})
              </h3>
            </div>

            <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-rose-950 text-rose-300 border border-rose-600/40">
              {currentFir.offence}
            </span>
          </div>

          {/* Quick Info Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 font-mono">
            <div>
              <span className="text-[10px] text-slate-500 block">COMPLAINANT</span>
              <span className="text-slate-200 font-semibold">{currentFir.complainant}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">DISTRICT</span>
              <span className="text-slate-200 font-semibold">{currentFir.district}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">ACCUSED NAMED</span>
              <span className="text-rose-300 font-semibold">{currentFir.accused.join(', ')}</span>
            </div>
          </div>

          {/* FIR Transcript Text Box */}
          <div className="bg-[#050811] border border-slate-800 rounded-xl p-5 font-mono text-xs text-slate-300 leading-relaxed max-h-[500px] overflow-y-auto whitespace-pre-wrap">
            {currentFir.text}
          </div>
        </div>

        {/* Right Col: Extracted Entities from this Document */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-mono font-bold uppercase text-slate-300 flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Extracted Entities ({currentFir.doc_id})</span>
            </h3>
            <span className="text-[10px] font-mono text-emerald-400">spaCy Verified</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Named Suspects & Persons</span>
              <div className="flex flex-wrap gap-1.5">
                {currentFir.accused.map((a, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-200 font-mono"
                  >
                    👤 {a}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Key Telemetry & Evidence</span>
              <div className="space-y-2">
                <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block font-mono">INCIDENT SUMMARY</span>
                  <p className="text-slate-300 text-xs mt-1">{currentFir.summary}</p>
                </div>
              </div>
            </div>

            <div className="pt-3">
              <button
                onClick={onJumpToGraph}
                className="w-full py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center space-x-2 shadow-glow-cyan"
              >
                <span>View Connections in Graph Canvas ➔</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
