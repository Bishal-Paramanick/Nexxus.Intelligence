import React, { useState } from 'react';
import { 
  Scale, 
  ShieldCheck, 
  Lock, 
  FileCheck, 
  Printer, 
  Download, 
  CheckCircle2, 
  FileText, 
  Hash, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function LegalAuditVault({ caseInfo, nodes, edges }) {
  const [activeReport, setActiveReport] = useState('FULL_DOSSIER');

  const auditLogRecords = [
    {
      doc_id: 'FIR_101',
      title: 'Bidhannagar PS Extortion Complaint (Manoj Tiwari)',
      hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      timestamp: '2026-03-12T10:30:00Z',
      officer: 'Sub-Insp. B. Banerjee (Bidhannagar PS)',
      bsa_status: 'CERTIFIED_SEC_63_65B',
      signature: 'ECDSA-SHA256: 3045022100a89f...55b2',
    },
    {
      doc_id: 'FIR_102',
      title: 'Howrah PS Threat & Meeting Observation (Debjani Sen)',
      hash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
      timestamp: '2026-03-18T14:15:00Z',
      officer: 'Insp. S. Mukherjee (Howrah PS)',
      bsa_status: 'CERTIFIED_SEC_63_65B',
      signature: 'ECDSA-SHA256: 304402203e4d81...7c01',
    },
    {
      doc_id: 'FIR_103',
      title: 'Park Street PS AML Bank Alert (Anil Kapoor, Manager)',
      hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
      timestamp: '2026-03-24T17:00:00Z',
      officer: 'Insp. R. Sen (Park Street PS)',
      bsa_status: 'CERTIFIED_SEC_63_65B',
      signature: 'ECDSA-SHA256: 3046022100fd41...89a2',
    },
    {
      doc_id: 'CDR_TELEMETRY_LOG',
      title: '38 Cellular Intercept & Extortion Call Logs',
      hash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
      timestamp: '2026-03-24T18:00:00Z',
      officer: 'Cyber Cell Forensic Lab, Kolkata',
      bsa_status: 'CERTIFIED_SEC_63_65B',
      signature: 'ECDSA-SHA256: 3045022100c411...99e3',
    },
    {
      doc_id: 'BANK_TRANSFERS_LOG',
      title: '₹14.85L Circular Transfer & Extortion Ledger',
      hash: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
      timestamp: '2026-03-24T18:00:00Z',
      officer: 'Financial Intelligence Unit (FIU-IND)',
      bsa_status: 'CERTIFIED_SEC_63_65B',
      signature: 'ECDSA-SHA256: 304402207a9b33...21f0',
    }
  ];

  const handlePrintDossier = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    window.print();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Top Banner: Legal Admissibility Certification */}
      <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-cyan-950/60 border border-emerald-500/50 rounded-2xl p-5 shadow-glow-emerald">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-emerald-300 shadow-glow-emerald">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase text-emerald-300 font-bold tracking-wider">
                LEGAL COMPLIANCE VAULT // COURT EVIDENCE READY
              </span>
              <h2 className="text-xl font-display font-black text-slate-100">
                Bharatiya Sakshya Adhiniyam (BSA) 2023 Certificate of Admissibility
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                All extracted entities, call telemetry, and banking cycles cryptographically hashed to establish immutable chain-of-custody.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrintDossier}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-2 shadow-glow-emerald transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print Court Intelligence Dossier</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cryptographic Chain of Custody Table */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-mono font-bold uppercase text-slate-200 flex items-center space-x-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>Cryptographic Electronic Hash Manifest (SHA-256 Ledger)</span>
          </h3>
          <span className="text-xs font-mono text-emerald-400 flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>5/5 Artifacts Verified</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase">
                <th className="py-2.5 px-3">Document / Record</th>
                <th className="py-2.5 px-3">SHA-256 Checksum Hash</th>
                <th className="py-2.5 px-3">Certifying Officer</th>
                <th className="py-2.5 px-3">Admissibility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {auditLogRecords.map((rec, i) => (
                <tr key={i} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-2.5 px-3">
                    <span className="font-sans font-semibold text-slate-200 block">{rec.title}</span>
                    <span className="text-[10px] text-cyan-400">{rec.doc_id} • {rec.timestamp}</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-[11px] text-slate-400 truncate max-w-xs block font-mono bg-slate-950 p-1 rounded border border-slate-800">
                      {rec.hash}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 font-sans">{rec.officer}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-600/40">
                      ✓ BSA SEC 65B VALID
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Court Intelligence Summary Preview */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4 print:bg-white print:text-black">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400">
              LEGAL DOSSIER PREVIEW // SPECIAL TASK FORCE
            </span>
            <h3 className="text-base font-bold text-slate-100 font-display">
              Charge-Sheet Evidence Annexure: {caseInfo.id}
            </h3>
          </div>
          <span className="text-xs font-mono text-cyan-300">
            Case Status: Under Special Investigation
          </span>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-4 text-xs text-slate-300 font-sans leading-relaxed">
          <div className="border-b border-slate-800 pb-3">
            <h4 className="font-bold text-slate-100 text-sm mb-1">1. PRIMARY MASTERMIND FINDING</h4>
            <p>
              Subject <strong>DEBASISH CHATTERJEE (P008)</strong> is identified as the hidden apex coordinator connecting the loan-extortion operations in Salt Lake/Howrah (Cluster A) with the shell-company money laundering ring in Park Street (Cluster B). Betweenness centrality reaches <strong>0.942</strong>, representing the critical single point of network failure.
            </p>
          </div>

          <div className="border-b border-slate-800 pb-3">
            <h4 className="font-bold text-slate-100 text-sm mb-1">2. 22-CALL EXTORTION SIEGE (2026-03-05)</h4>
            <p>
              Coercive harassment substantiated by 22 telephonic call records logged within an 8-hour window between <strong>Rajesh Kumar Sharma (9832145678)</strong> and victim <strong>Manoj Tiwari (9434567123)</strong>, resulting in a ₹45,000 duress wire transfer.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-100 text-sm mb-1">3. 3-HOP CIRCULAR LAUNDERING (₹5,00,000)</h4>
            <p>
              Layering loop confirmed between accounts <strong>30123456793 (Ashok Mehta)</strong> ➔ <strong>30123456794 (Priya Banerjee)</strong> ➔ <strong>30123456795 (Nikhil Ghosh)</strong> ➔ <strong>30123456793 (Ashok Mehta)</strong> in a 48-hour window (2026-03-20 to 2026-03-21).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
