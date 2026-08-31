import React, { useState } from 'react';
import { 
  Flame, 
  Play, 
  Pause, 
  Search, 
  Radio
} from 'lucide-react';
import { RAW_CDR_RECORDS } from '../data/mockIntelligenceData';

export default function CdrTelemetryView() {
  const [searchPhone, setSearchPhone] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeCallFilter, setActiveCallFilter] = useState('ALL');

  const filteredCalls = RAW_CDR_RECORDS.filter(c => {
    if (activeCallFilter === 'SPIKE' && !c.is_spike) return false;
    if (activeCallFilter === 'MASTERMIND' && !c.is_mastermind) return false;
    if (!searchPhone) return true;
    const q = searchPhone.toLowerCase();
    return c.caller.includes(q) || c.receiver.includes(q) || c.caller_name.toLowerCase().includes(q) || c.receiver_name.toLowerCase().includes(q);
  });

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto overflow-y-auto">
      {/* Extortion Spike Banner */}
      <div className="bg-gradient-to-r from-rose-500/10 via-white/[0.02] to-transparent border border-rose-500/30 rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 bg-rose-500/20 text-rose-300 rounded-xl">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-rose-400 font-semibold tracking-wider">
                CRITICAL ANOMALY // 22-CALL VELOCITY SPIKE
              </span>
              <h2 className="text-lg font-bold text-white">
                Extortion Calling Burst: 9832145678 ↔ 9434567123
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Rajesh Kumar Sharma ➔ Manoj Tiwari (Victim) • 22 calls within 8 hours on 2026-03-05.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono">
            <div className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/[0.08] text-center">
              <span className="text-slate-500 block text-[9px]">TOTAL SPIKE CALLS</span>
              <span className="text-rose-400 font-bold">22 Calls</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/[0.08] text-center">
              <span className="text-slate-500 block text-[9px]">DATE</span>
              <span className="text-slate-200 font-bold">05/03/2026</span>
            </div>
          </div>
        </div>
      </div>

      {/* Wiretap Audio Simulation */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4 text-rose-400" />
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Intercept Recording // Tape No. 2026-CDR-05B
            </h3>
          </div>
          <span className="text-[11px] font-mono text-emerald-400">
            ✓ Forensic Authenticated
          </span>
        </div>

        <div className="bg-black/30 border border-white/[0.06] rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5 w-full md:w-auto">
            <button
              onClick={() => setIsPlayingAudio(!isPlayingAudio)}
              className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
                isPlayingAudio
                  ? 'bg-rose-500 text-white'
                  : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
              }`}
            >
              {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            <div className="space-y-0.5">
              <div className="flex items-center space-x-2 text-xs font-mono">
                <span className="text-rose-300 font-medium">2026-03-05 08:40:00 (Call #3)</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">Duration: 55s</span>
              </div>
              <p className="text-xs text-slate-300 italic font-serif">
                “Pay the loan installments immediately or Bimal and I will visit your Salt Lake residence with consequences...”
              </p>
            </div>
          </div>

          {/* Minimal Waveform */}
          <div className="flex items-center space-x-1 h-6 w-36 justify-center">
            {[4, 10, 18, 14, 22, 16, 12, 20, 24, 12, 18, 8, 14].map((h, i) => (
              <span
                key={i}
                className={`w-1 rounded-full transition-all ${
                  isPlayingAudio ? 'bg-cyan-400 animate-pulse' : 'bg-slate-700'
                }`}
                style={{
                  height: isPlayingAudio ? `${Math.min(h + (i % 2) * 5, 24)}px` : `${h * 0.4}px`,
                  animationDelay: `${i * 0.07}s`
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* CDR Records Table */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              placeholder="Search phone number or caller..."
              className="w-full pl-8 pr-3 py-1.5 bg-black/30 border border-white/[0.08] rounded-lg text-xs text-slate-200 placeholder-slate-500"
            />
          </div>

          <div className="flex items-center space-x-1 text-xs">
            {['ALL', 'SPIKE', 'MASTERMIND'].map((t) => (
              <button
                key={t}
                onClick={() => setActiveCallFilter(t)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  activeCallFilter === t
                    ? 'bg-white/[0.1] text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t === 'SPIKE' ? '🚨 22-Call Spike' : t === 'MASTERMIND' ? '👑 Mastermind' : 'All CDR'}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] text-[11px] text-slate-500 font-mono uppercase">
                <th className="py-2 px-3">Date</th>
                <th className="py-2 px-3">Caller</th>
                <th className="py-2 px-3">Receiver</th>
                <th className="py-2 px-3">Duration</th>
                <th className="py-2 px-3">Classification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredCalls.map((c, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-2 px-3 text-slate-400 font-mono text-[11px]">{c.timestamp}</td>
                  <td className="py-2 px-3">
                    <span className="text-slate-200 font-medium block">{c.caller_name}</span>
                    <span className="text-[10px] text-cyan-400 font-mono">{c.caller}</span>
                  </td>
                  <td className="py-2 px-3">
                    <span className="text-slate-200 font-medium block">{c.receiver_name}</span>
                    <span className="text-[10px] text-cyan-400 font-mono">{c.receiver}</span>
                  </td>
                  <td className="py-2 px-3 text-slate-300 font-mono">{c.duration_sec}s</td>
                  <td className="py-2 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        c.is_spike
                          ? 'bg-rose-500/20 text-rose-300'
                          : c.is_mastermind
                          ? 'bg-purple-500/20 text-purple-300'
                          : 'bg-white/[0.04] text-slate-400'
                      }`}
                    >
                      {c.is_spike ? 'Extortion Spike' : c.is_mastermind ? 'Mastermind Directive' : 'Normal'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
