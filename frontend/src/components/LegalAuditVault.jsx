import React from 'react';
import { 
  Scale, 
  Printer, 
  Lock, 
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function LegalAuditVault({ caseInfo }) {
  const auditLogRecords = [
    {
      doc_id: 'FIR_101',
      title: 'Bidhannagar PS Complaint (Manoj Tiwari)',
      hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      timestamp: '2026-03-12',
      officer: 'Sub-Insp. B. Banerjee',
      bsa_status: 'CERTIFIED_SEC_63_65B',
    },
    {
      doc_id: 'FIR_102',
      title: 'Howrah PS Meeting Observation (Debjani Sen)',
      hash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
      timestamp: '2026-03-18',
      officer: 'Insp. S. Mukherjee',
      bsa_status: 'CERTIFIED_SEC_63_65B',
    },
    {
      doc_id: 'FIR_103',
      title: 'Park Street PS AML Alert (Anil Kapoor)',
      hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
      timestamp: '2026-03-24',
      officer: 'Insp. R. Sen',
      bsa_status: 'CERTIFIED_SEC_63_65B',
    },
    {
      doc_id: 'CDR_LOGS',
      title: '38 Cellular Call Records & Telemetry Logs',
      hash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
      timestamp: '2026-03-24',
      officer: 'Cyber Forensic Cell',
      bsa_status: 'CERTIFIED_SEC_63_65B',
    },
    {
      doc_id: 'BANK_LOGS',
      title: '₹14.85L Circular Transaction Ledger',
      hash: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
      timestamp: '2026-03-24',
      officer: 'FIU-IND',
      bsa_status: 'CERTIFIED_SEC_63_65B',
    }
  ];

  const handlePrintDossier = () => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 }
    });
    window.print();
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto overflow-y-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-white/[0.02] to-transparent border border-emerald-500/30 rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-300 rounded-xl">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold tracking-wider">
                LEGAL VAULT // COURT EVIDENCE READY
              </span>
              <h2 className="text-lg font-bold text-white">
                Bharatiya Sakshya Adhiniyam (BSA) 2023 / Sec 65B Audit
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                All extracted evidence, call telemetry, and banking loops are cryptographically hashed for court admissibility.
              </p>
            </div>
          </div>

          <button
            onClick={handlePrintDossier}
            className="px-4 py-2 btn-glow-cyan font-semibold rounded-xl text-xs flex items-center space-x-2 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Intelligence Dossier</span>
          </button>
        </div>
      </div>

      {/* SHA-256 Hash Manifest Table */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Electronic Evidence Hash Manifest (SHA-256)</span>
          </h3>
          <span className="text-xs font-mono text-emerald-400 flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>5/5 Artifacts Certified</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] text-[11px] text-slate-500 font-mono uppercase">
                <th className="py-2 px-3">Document / Record</th>
                <th className="py-2 px-3">SHA-256 Checksum</th>
                <th className="py-2 px-3">Officer</th>
                <th className="py-2 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] font-mono">
              {auditLogRecords.map((rec, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-2.5 px-3">
                    <span className="font-sans font-medium text-slate-200 block">{rec.title}</span>
                    <span className="text-[10px] text-slate-500">{rec.doc_id} • {rec.timestamp}</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-[11px] text-slate-400 truncate max-w-xs block font-mono">
                      {rec.hash}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 font-sans">{rec.officer}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300">
                      ✓ BSA 65B VALID
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Findings */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 space-y-3">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Summary Case Findings ({caseInfo?.id || 'CASE-KOL-2026-088'})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-black/30 p-3.5 rounded-xl border border-white/[0.04] space-y-1">
            <span className="font-bold text-slate-200 block">1. Mastermind Identification</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Debasish Chatterjee (P008) identified as bridge node connecting Extortion (Cluster A) and Laundering (Cluster B) with 0.942 Betweenness Centrality.
            </p>
          </div>

          <div className="bg-black/30 p-3.5 rounded-xl border border-white/[0.04] space-y-1">
            <span className="font-bold text-slate-200 block">2. Extortion Calling Spike</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              22 extortion calls logged on 2026-03-05 from Rajesh Kumar Sharma to victim Manoj Tiwari, coercing ₹45,000 duress payment.
            </p>
          </div>

          <div className="bg-black/30 p-3.5 rounded-xl border border-white/[0.04] space-y-1">
            <span className="font-bold text-slate-200 block">3. Circular Money Loop</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              ₹500,000 circular fund route across Ashok Mehta, Priya Banerjee, and Nikhil Ghosh completed in 48 hours at Kolkata Commercial Bank.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
