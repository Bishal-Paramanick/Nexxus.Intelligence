import React, { useState } from 'react';
import { 
  PhoneCall, 
  Flame, 
  Radio, 
  Volume2, 
  Play, 
  Pause, 
  Search, 
  AlertTriangle, 
  Clock, 
  Activity,
  Sliders
} from 'lucide-react';
import { RAW_CDR_RECORDS } from '../data/mockIntelligenceData';

export default function CdrTelemetryView() {
  const [searchPhone, setSearchPhone] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeCallFilter, setActiveCallFilter] = useState('ALL'); // 'ALL' | 'SPIKE' | 'MASTERMIND'

  const spikeCalls = RAW_CDR_RECORDS.filter(c => c.is_spike);
  const mastermindCalls = RAW_CDR_RECORDS.filter(c => c.is_mastermind);

  const filteredCalls = RAW_CDR_RECORDS.filter(c => {
    if (activeCallFilter === 'SPIKE' && !c.is_spike) return false;
    if (activeCallFilter === 'MASTERMIND' && !c.is_mastermind) return false;
    if (!searchPhone) return true;
    const q = searchPhone.toLowerCase();
    return c.caller.includes(q) || c.receiver.includes(q) || c.caller_name.toLowerCase().includes(q) || c.receiver_name.toLowerCase().includes(q);
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* 22-Call Extortion Spike Banner */}
      <div className="bg-gradient-to-r from-rose-950/70 via-slate-900 to-amber-950/60 border border-rose-500/50 rounded-2xl p-5 shadow-glow-rose">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-rose-500/20 border border-rose-500/50 rounded-xl text-rose-300 shadow-glow-rose animate-pulse">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase text-rose-300 font-bold tracking-wider">
                CRITICAL ANOMALY // 22-CALL VELOCITY SPIKE DETECTED
              </span>
              <h2 className="text-xl font-display font-black text-slate-100">
                Extortion Telephonic Siege: 9832145678 ↔ 9434567123
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Rajesh Kumar Sharma ➔ Manoj Tiwari (Victim) • Date: 2026-03-05 • 22 calls within 8 hours (Z-Score: 4.87).
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono">
            <div className="px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
              <span className="text-slate-400 block text-[10px]">TOTAL CALLS</span>
              <span className="text-rose-400 font-bold text-sm">22 Calls</span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
              <span className="text-slate-400 block text-[10px]">TIME WINDOW</span>
              <span className="text-amber-300 font-bold text-sm">08:01 - 16:20</span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
              <span className="text-slate-400 block text-[10px]">CUMULATIVE DURATION</span>
              <span className="text-cyan-300 font-bold text-sm">765 Seconds</span>
            </div>
          </div>
        </div>
      </div>

      {/* Simulated Telephonic Intercept Player */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Radio className="w-5 h-5 text-rose-400 animate-pulse" />
            <h3 className="text-sm font-mono font-bold uppercase text-slate-200">
              COURT-CERTIFIED INTERCEPT RECORDING // TAPE NO. 2026-CDR-05B
            </h3>
          </div>
          <span className="text-xs font-mono text-emerald-400">
            ✓ Forensic Spectrogram Validated
          </span>
        </div>

        <div className="bg-slate-950/90 border border-slate-800/90 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4 w-full md:w-auto">
            <button
              onClick={() => setIsPlayingAudio(!isPlayingAudio)}
              className={`p-3 rounded-xl flex items-center justify-center transition-all ${
                isPlayingAudio
                  ? 'bg-rose-600 text-white shadow-glow-rose'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-glow-cyan'
              }`}
            >
              {isPlayingAudio ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>

            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-xs font-mono">
                <span className="text-rose-400 font-bold">2026-03-05 08:40:00 (Call #3)</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">Duration: 55s</span>
              </div>
              <p className="text-xs text-slate-300 italic font-serif">
                “Pay the loan installments immediately or Bimal and I will visit your Salt Lake residence with consequences...”
              </p>
            </div>
          </div>

          {/* Animated Audio Waveform */}
          <div className="flex items-center space-x-1 h-8 w-full md:w-48 justify-center">
            {[4, 12, 24, 18, 30, 22, 14, 28, 32, 16, 26, 12, 6, 20, 30, 15, 8].map((h, i) => (
              <span
                key={i}
                className={`w-1.5 rounded-full transition-all ${
                  isPlayingAudio ? 'bg-cyan-400 animate-pulse' : 'bg-slate-700'
                }`}
                style={{
                  height: isPlayingAudio ? `${Math.min(h + (i % 3) * 6, 32)}px` : `${h * 0.4}px`,
                  animationDelay: `${i * 0.08}s`
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Complete Call Detail Records Matrix */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              placeholder="Search phone number or caller name..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950/80 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 font-mono"
            />
          </div>

          <div className="flex items-center space-x-1.5 text-xs font-mono">
            {['ALL', 'SPIKE', 'MASTERMIND'].map((t) => (
              <button
                key={t}
                onClick={() => setActiveCallFilter(t)}
                className={`px-3 py-1 rounded-lg border transition-all ${
                  activeCallFilter === t
                    ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-glow-cyan'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {t === 'SPIKE' ? '🚨 22-Call Spike' : t === 'MASTERMIND' ? '👑 Mastermind Burner' : 'All CDR Logs'}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase">
                <th className="py-2.5 px-3">Call Timestamp</th>
                <th className="py-2.5 px-3">Caller (A-Party)</th>
                <th className="py-2.5 px-3">Receiver (B-Party)</th>
                <th className="py-2.5 px-3">Duration</th>
                <th className="py-2.5 px-3">Classification</th>
                <th className="py-2.5 px-3">Evidence Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredCalls.map((c, idx) => (
                <tr key={idx} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-2 px-3 text-slate-400 text-[11px]">{c.timestamp}</td>
                  <td className="py-2 px-3">
                    <span className="font-sans font-medium text-slate-200 block">{c.caller_name}</span>
                    <span className="text-[10px] text-cyan-300">{c.caller}</span>
                  </td>
                  <td className="py-2 px-3">
                    <span className="font-sans font-medium text-slate-200 block">{c.receiver_name}</span>
                    <span className="text-[10px] text-cyan-300">{c.receiver}</span>
                  </td>
                  <td className="py-2 px-3 text-slate-300">{c.duration_sec}s</td>
                  <td className="py-2 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.is_spike
                          ? 'bg-rose-950 text-rose-300 border border-rose-600/40'
                          : c.is_mastermind
                          ? 'bg-purple-950 text-purple-300 border border-purple-600/40'
                          : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {c.is_spike ? 'Extortion Spike' : c.is_mastermind ? 'Mastermind Directive' : 'Operational'}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-cyan-400 uppercase">{c.doc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
