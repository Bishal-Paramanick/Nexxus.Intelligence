import React, { useState } from 'react';
import { 
  CircleDollarSign, 
  ArrowRight, 
  Repeat, 
  ShieldAlert, 
  TrendingDown, 
  Clock, 
  Building2, 
  ExternalLink,
  CheckCircle,
  Filter
} from 'lucide-react';
import { RAW_BANK_TRANSFERS } from '../data/mockIntelligenceData';

export default function FinancialFlowView({ onSelectEntity }) {
  const [filterType, setFilterType] = useState('ALL');

  const circularTransfers = RAW_BANK_TRANSFERS.filter(t => t.is_circular);
  const filteredTransfers = filterType === 'ALL' 
    ? RAW_BANK_TRANSFERS 
    : filterType === 'CIRCULAR' 
    ? circularTransfers 
    : RAW_BANK_TRANSFERS.filter(t => !t.is_circular);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Top Banner: AML Anomaly Flag */}
      <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-purple-950/60 border border-amber-500/40 rounded-2xl p-5 shadow-glow-amber">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-300 shadow-glow-amber">
              <Repeat className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase text-amber-300 font-bold tracking-wider">
                AML ALERT // TARJAN'S DIRECTED CYCLE DETECTED
              </span>
              <h2 className="text-xl font-display font-black text-slate-100">
                ₹500,000 Circular Fund Routing Loop (48-Hour Cycle)
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Kolkata Commercial Bank (Park Street) • Corroborated in FIR_103 lodged by Branch Manager Anil Kapoor.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono">
            <div className="px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
              <span className="text-slate-400 block text-[10px]">TOTAL VALUE</span>
              <span className="text-amber-300 font-bold text-sm">₹14,85,000</span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
              <span className="text-slate-400 block text-[10px]">TIME DELTA</span>
              <span className="text-cyan-300 font-bold text-sm">48.0 Hours</span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
              <span className="text-slate-400 block text-[10px]">SMURFING LOSS</span>
              <span className="text-rose-400 font-bold text-sm">₹10,000 (2%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Hop Visual Flow Chart */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-mono font-bold uppercase text-cyan-300 flex items-center space-x-2">
            <CircleDollarSign className="w-4 h-4 text-cyan-400" />
            <span>3-Hop Circular Layering Topology (Smurfing & Return)</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">
            Confidence: <strong className="text-emerald-400">99.2% (BSA Sec 65B Audit)</strong>
          </span>
        </div>

        {/* Dynamic Visual Nodes & Arrows */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* HOP 1 */}
          <div className="bg-slate-950/80 border border-amber-500/40 rounded-xl p-4 space-y-3 relative hover:border-amber-400 transition-all">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-600/40">
                HOP 1 (ORIGINATION)
              </span>
              <span className="text-xs font-mono text-slate-400 flex items-center space-x-1">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>2026-03-20 09:00</span>
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-slate-400 block">Sender (Shell Origin):</span>
              <h4 className="text-sm font-bold text-slate-100">Ashok Mehta (Mehta Global Traders)</h4>
              <span className="text-xs font-mono text-purple-300 block">Acct: 30123456793</span>
            </div>

            <div className="py-2 px-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-center font-mono">
              <span className="text-lg font-black text-amber-300">₹5,00,000</span>
              <span className="text-[10px] text-slate-400 block">Transferred onward to Accountant</span>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-slate-400 block">Receiver (Layering Hub):</span>
              <h4 className="text-sm font-bold text-slate-100">Priya Banerjee (Accountant)</h4>
              <span className="text-xs font-mono text-purple-300 block">Acct: 30123456794</span>
            </div>
          </div>

          {/* HOP 2 */}
          <div className="bg-slate-950/80 border border-amber-500/40 rounded-xl p-4 space-y-3 relative hover:border-amber-400 transition-all">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-600/40">
                HOP 2 (LAYERING)
              </span>
              <span className="text-xs font-mono text-slate-400 flex items-center space-x-1">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>2026-03-20 15:00 (+6h)</span>
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-slate-400 block">Sender:</span>
              <h4 className="text-sm font-bold text-slate-100">Priya Banerjee (Accountant)</h4>
              <span className="text-xs font-mono text-purple-300 block">Acct: 30123456794</span>
            </div>

            <div className="py-2 px-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-center font-mono">
              <span className="text-lg font-black text-amber-300">₹4,95,000</span>
              <span className="text-[10px] text-rose-400 block">(-₹5,000 / 1% Layering Cut)</span>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-slate-400 block">Receiver (Mule Node):</span>
              <h4 className="text-sm font-bold text-slate-100">Nikhil Ghosh (Park Street Mule)</h4>
              <span className="text-xs font-mono text-purple-300 block">Acct: 30123456795</span>
            </div>
          </div>

          {/* HOP 3 */}
          <div className="bg-slate-950/80 border border-emerald-500/40 rounded-xl p-4 space-y-3 relative hover:border-emerald-400 transition-all">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-600/40">
                HOP 3 (LOOP COMPLETION)
              </span>
              <span className="text-xs font-mono text-slate-400 flex items-center space-x-1">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>2026-03-21 09:00 (+18h)</span>
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-slate-400 block">Sender:</span>
              <h4 className="text-sm font-bold text-slate-100">Nikhil Ghosh (Mule)</h4>
              <span className="text-xs font-mono text-purple-300 block">Acct: 30123456795</span>
            </div>

            <div className="py-2 px-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-center font-mono">
              <span className="text-lg font-black text-emerald-300">₹4,90,000</span>
              <span className="text-[10px] text-emerald-400 block">Returned directly to Origin Acct</span>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-slate-400 block">Loop Terminal:</span>
              <h4 className="text-sm font-bold text-slate-100">Ashok Mehta (Mehta Global)</h4>
              <span className="text-xs font-mono text-purple-300 block">Acct: 30123456793</span>
            </div>
          </div>
        </div>
      </div>

      {/* Extortion Cut Waterfall Breakdown */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <h3 className="text-sm font-mono font-bold uppercase text-rose-300 flex items-center space-x-2">
          <TrendingDown className="w-4 h-4 text-rose-400" />
          <span>Extortion Extraction & Kingpin Tribute Flow (Cluster A ➔ Kingpin)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
            <span className="text-[10px] font-mono text-slate-500 block">1. COERCED EXTORTION</span>
            <span className="text-base font-bold text-rose-300 font-mono">₹45,000</span>
            <p className="text-[11px] text-slate-300 mt-1">Manoj Tiwari ➔ Rajesh Sharma (FIR_101)</p>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
            <span className="text-[10px] font-mono text-slate-500 block">2. FIELD ENFORCER CUT</span>
            <span className="text-base font-bold text-amber-300 font-mono">₹15,000</span>
            <p className="text-[11px] text-slate-300 mt-1">Rajesh Sharma ➔ Bimal Das</p>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
            <span className="text-[10px] font-mono text-slate-500 block">3. DISPATCH CUT</span>
            <span className="text-base font-bold text-cyan-300 font-mono">₹5,000</span>
            <p className="text-[11px] text-slate-300 mt-1">Bimal Das ➔ Sunita Roy (FIR_102)</p>
          </div>
          <div className="bg-slate-950/80 border border-purple-500/40 p-3 rounded-xl">
            <span className="text-[10px] font-mono text-purple-400 block">4. MASTERMIND TRIBUTE</span>
            <span className="text-base font-bold text-purple-300 font-mono">₹3,000</span>
            <p className="text-[11px] text-slate-300 mt-1">Sunita Roy ➔ Debasish Chatterjee</p>
          </div>
        </div>
      </div>

      {/* Complete Financial Ledger Table */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <h3 className="text-sm font-mono font-bold uppercase text-slate-200 flex items-center space-x-2">
            <span>AUDITED BANKING TRANSACTIONS LEDGER ({filteredTransfers.length})</span>
          </h3>

          <div className="flex items-center space-x-1.5 text-xs font-mono">
            <span className="text-slate-400 mr-1">Filter:</span>
            {['ALL', 'CIRCULAR', 'EXTORTION'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-2.5 py-1 rounded-lg border transition-all ${
                  filterType === t
                    ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-glow-cyan'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Sender</th>
                <th className="py-2.5 px-3">Receiver</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Classification</th>
                <th className="py-2.5 px-3">Source FIR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredTransfers.map((tx, idx) => (
                <tr key={idx} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-2.5 px-3 text-slate-400 text-[11px]">{tx.timestamp}</td>
                  <td className="py-2.5 px-3 text-slate-200">
                    <span className="font-sans font-medium block">{tx.sender_name}</span>
                    <span className="text-[10px] text-slate-500">{tx.sender}</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-200">
                    <span className="font-sans font-medium block">{tx.receiver_name}</span>
                    <span className="text-[10px] text-slate-500">{tx.receiver}</span>
                  </td>
                  <td className="py-2.5 px-3 font-bold text-amber-300">
                    ₹{(tx.amount).toLocaleString('en-IN')}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        tx.is_circular
                          ? 'bg-amber-950 text-amber-300 border border-amber-600/40'
                          : tx.amount >= 40000
                          ? 'bg-rose-950 text-rose-300 border border-rose-600/40'
                          : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-cyan-400 uppercase">{tx.doc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
