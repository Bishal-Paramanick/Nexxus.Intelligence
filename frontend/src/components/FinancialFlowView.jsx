import React, { useState } from 'react';
import { 
  CircleDollarSign, 
  Repeat, 
  Clock, 
  TrendingDown
} from 'lucide-react';
import { RAW_BANK_TRANSFERS } from '../data/mockIntelligenceData';

export default function FinancialFlowView() {
  const [filterType, setFilterType] = useState('ALL');

  const circularTransfers = RAW_BANK_TRANSFERS.filter(t => t.is_circular);
  const filteredTransfers = filterType === 'ALL' 
    ? RAW_BANK_TRANSFERS 
    : filterType === 'CIRCULAR' 
    ? circularTransfers 
    : RAW_BANK_TRANSFERS.filter(t => !t.is_circular);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto overflow-y-auto">
      {/* AML Alert Header */}
      <div className="bg-gradient-to-r from-amber-500/10 via-white/[0.02] to-transparent border border-amber-500/30 rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 bg-amber-500/20 text-amber-300 rounded-xl">
              <Repeat className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-amber-400 font-semibold tracking-wider">
                AML ALERT // DIRECTED CYCLE
              </span>
              <h2 className="text-lg font-bold text-white">
                ₹500,000 Circular Fund Routing Loop (48-Hour Cycle)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Kolkata Commercial Bank • Corroborated in FIR_103 lodged by Branch Manager Anil Kapoor.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono">
            <div className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/[0.08] text-center">
              <span className="text-slate-500 block text-[9px]">TOTAL LOOP</span>
              <span className="text-amber-300 font-bold">₹14.85 Lakh</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/[0.08] text-center">
              <span className="text-slate-500 block text-[9px]">TIME WINDOW</span>
              <span className="text-cyan-300 font-bold">48 Hours</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Hop Visual Flow Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* HOP 1 */}
        <div className="bg-white/[0.02] border border-amber-500/30 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300">
              HOP 1: ORIGINATION
            </span>
            <span className="text-[11px] text-slate-400 flex items-center space-x-1 font-mono">
              <Clock className="w-3 h-3 text-slate-500" />
              <span>Mar 20, 09:00</span>
            </span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 block">Sender (Shell Origin):</span>
            <h4 className="text-sm font-semibold text-white">Ashok Mehta (Mehta Global)</h4>
            <span className="text-xs font-mono text-slate-500">Acct: 30123456793</span>
          </div>

          <div className="py-2.5 px-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center font-mono">
            <span className="text-base font-bold text-amber-300">₹5,00,000</span>
            <span className="text-[10px] text-slate-400 block">Initial Layering Outflow</span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 block">Receiver:</span>
            <h4 className="text-sm font-semibold text-white">Priya Banerjee (Accountant)</h4>
            <span className="text-xs font-mono text-slate-500">Acct: 30123456794</span>
          </div>
        </div>

        {/* HOP 2 */}
        <div className="bg-white/[0.02] border border-amber-500/30 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300">
              HOP 2: LAYERING
            </span>
            <span className="text-[11px] text-slate-400 flex items-center space-x-1 font-mono">
              <Clock className="w-3 h-3 text-slate-500" />
              <span>Mar 20, 15:00 (+6h)</span>
            </span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 block">Sender:</span>
            <h4 className="text-sm font-semibold text-white">Priya Banerjee (Accountant)</h4>
            <span className="text-xs font-mono text-slate-500">Acct: 30123456794</span>
          </div>

          <div className="py-2.5 px-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center font-mono">
            <span className="text-base font-bold text-amber-300">₹4,95,000</span>
            <span className="text-[10px] text-rose-400 block">-₹5,000 (1% Smurfing Fee)</span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 block">Receiver:</span>
            <h4 className="text-sm font-semibold text-white">Nikhil Ghosh (Park Street Mule)</h4>
            <span className="text-xs font-mono text-slate-500">Acct: 30123456795</span>
          </div>
        </div>

        {/* HOP 3 */}
        <div className="bg-white/[0.02] border border-emerald-500/30 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300">
              HOP 3: LOOP CLOSURE
            </span>
            <span className="text-[11px] text-slate-400 flex items-center space-x-1 font-mono">
              <Clock className="w-3 h-3 text-slate-500" />
              <span>Mar 21, 09:00 (+18h)</span>
            </span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 block">Sender:</span>
            <h4 className="text-sm font-semibold text-white">Nikhil Ghosh (Mule)</h4>
            <span className="text-xs font-mono text-slate-500">Acct: 30123456795</span>
          </div>

          <div className="py-2.5 px-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center font-mono">
            <span className="text-base font-bold text-emerald-300">₹4,90,000</span>
            <span className="text-[10px] text-emerald-400 block">Closed back to Origin</span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 block">Terminal:</span>
            <h4 className="text-sm font-semibold text-white">Ashok Mehta (Mehta Global)</h4>
            <span className="text-xs font-mono text-slate-500">Acct: 30123456793</span>
          </div>
        </div>
      </div>

      {/* Extortion Cut Waterfall */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 space-y-3">
        <h3 className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5 uppercase tracking-wider">
          <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
          <span>Extortion Extraction & Tribute Trail</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="bg-black/30 p-3 rounded-xl border border-white/[0.04]">
            <span className="text-[10px] text-slate-500 font-mono block">1. COERCED PAYMENT</span>
            <span className="text-sm font-bold text-rose-400 font-mono">₹45,000</span>
            <p className="text-[11px] text-slate-400 mt-0.5">Manoj ➔ Rajesh (FIR_101)</p>
          </div>
          <div className="bg-black/30 p-3 rounded-xl border border-white/[0.04]">
            <span className="text-[10px] text-slate-500 font-mono block">2. FIELD AGENT CUT</span>
            <span className="text-sm font-bold text-amber-400 font-mono">₹15,000</span>
            <p className="text-[11px] text-slate-400 mt-0.5">Rajesh ➔ Bimal Das</p>
          </div>
          <div className="bg-black/30 p-3 rounded-xl border border-white/[0.04]">
            <span className="text-[10px] text-slate-500 font-mono block">3. DISPATCH CUT</span>
            <span className="text-sm font-bold text-cyan-400 font-mono">₹5,000</span>
            <p className="text-[11px] text-slate-400 mt-0.5">Bimal ➔ Sunita (FIR_102)</p>
          </div>
          <div className="bg-black/30 p-3 rounded-xl border border-purple-500/20">
            <span className="text-[10px] text-purple-400 font-mono block">4. MASTERMIND TRIBUTE</span>
            <span className="text-sm font-bold text-purple-300 font-mono">₹3,000</span>
            <p className="text-[11px] text-slate-400 mt-0.5">Sunita ➔ Debasish</p>
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Bank Transactions Ledger ({filteredTransfers.length})
          </h3>

          <div className="flex items-center space-x-1 text-xs">
            {['ALL', 'CIRCULAR', 'EXTORTION'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  filterType === t
                    ? 'bg-white/[0.1] text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] text-[11px] text-slate-500 font-mono uppercase">
                <th className="py-2 px-3">Date</th>
                <th className="py-2 px-3">Sender</th>
                <th className="py-2 px-3">Receiver</th>
                <th className="py-2 px-3">Amount</th>
                <th className="py-2 px-3">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredTransfers.map((tx, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-2 px-3 text-slate-400 font-mono text-[11px]">{tx.timestamp}</td>
                  <td className="py-2 px-3 text-slate-200 font-medium">{tx.sender_name}</td>
                  <td className="py-2 px-3 text-slate-200 font-medium">{tx.receiver_name}</td>
                  <td className="py-2 px-3 font-mono font-bold text-amber-300">
                    ₹{(tx.amount).toLocaleString('en-IN')}
                  </td>
                  <td className="py-2 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        tx.is_circular
                          ? 'bg-amber-500/20 text-amber-300'
                          : tx.amount >= 40000
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-white/[0.04] text-slate-400'
                      }`}
                    >
                      {tx.type}
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
