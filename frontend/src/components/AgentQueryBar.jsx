import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Cpu, 
  CheckCircle2, 
  Layers, 
  Terminal, 
  ArrowRight, 
  Crosshair, 
  FileCode,
  Zap,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { AGENT_QUERY_PRESETS } from '../data/mockIntelligenceData';

export default function AgentQueryBar({
  onRunAgentQuery,
  agentResponse,
  loadingQuery,
  onFocusSubgraph
}) {
  const [inputQuery, setInputQuery] = useState('');
  const [showSteps, setShowSteps] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputQuery.trim() || loadingQuery) return;
    onRunAgentQuery(inputQuery);
  };

  const handleSelectPreset = (preset) => {
    setInputQuery(preset.query);
    onRunAgentQuery(preset.query);
  };

  return (
    <div className="bg-[#0b1120] border-b border-slate-800 p-4 space-y-4">
      {/* Search Bar & Prompt Action */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-cyan-400 animate-pulse" />
            <h3 className="text-xs font-mono font-bold uppercase text-cyan-300">
              LANGGRAPH MULTI-AGENT INVESTIGATION CONSOLE
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Target Endpoint: <code className="text-indigo-300">/api/agent/query</code>
          </span>
        </div>

        <form onSubmit={handleSubmit} className="relative flex items-center">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center space-x-2 text-slate-500">
            <Terminal className="w-4 h-4 text-cyan-400" />
          </div>
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask agent: e.g., 'Who is the hidden mastermind bridging the extortion and laundering cells?'"
            className="w-full pl-10 pr-28 py-3 bg-slate-950/90 border border-slate-700/80 rounded-xl text-xs md:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 transition-all font-sans shadow-inner"
          />
          <button
            type="submit"
            disabled={loadingQuery || !inputQuery.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-lg text-xs flex items-center space-x-1.5 shadow-glow-cyan disabled:opacity-50 transition-all"
          >
            {loadingQuery ? (
              <>
                <Cpu className="w-4 h-4 animate-spin text-slate-950" />
                <span>Reasoning...</span>
              </>
            ) : (
              <>
                <span>Query</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Quick Preset Query Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-mono text-slate-500 flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Preset Intelligence Queries:</span>
          </span>
          {AGENT_QUERY_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className="px-2.5 py-1 rounded-lg text-xs bg-slate-900/90 hover:bg-cyan-950/70 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-200 transition-all font-mono"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Agent Response Card & Multi-Agent Execution Steps */}
      {agentResponse && (
        <div className="bg-slate-950/80 border border-cyan-500/40 rounded-xl p-4 space-y-3 shadow-glow-cyan animate-fadeIn">
          {/* Response Lead Summary Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                <Zap className="w-4 h-4 text-cyan-400" />
              </span>
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400">
                  AGENTIC INTELLIGENCE SYNTHESIS // CONFIDENCE: 96.8%
                </span>
                <h4 className="text-xs text-slate-300 font-mono">
                  Query: “{agentResponse.query}”
                </h4>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => onFocusSubgraph?.(agentResponse.highlighted_nodes, agentResponse.highlighted_edges)}
                className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-glow-cyan transition-all"
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>Focus Subgraph in Canvas</span>
              </button>

              <button
                onClick={() => setShowSteps(!showSteps)}
                className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded-lg text-xs"
                title="Toggle Multi-Agent Reasoning Steps"
              >
                {showSteps ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Lead Summary Paragraph */}
          <p className="text-sm text-slate-200 leading-relaxed font-sans bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
            {agentResponse.summary}
          </p>

          {/* Multi-Agent Reasoning Execution Chain */}
          {showSteps && agentResponse.reasoning_steps && (
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-mono text-slate-400 block uppercase">
                LangGraph Autonomous Orchestration Trace ({agentResponse.reasoning_steps.length} Steps)
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {agentResponse.reasoning_steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-lg text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-cyan-300 flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Step {idx + 1}: {step.agent}</span>
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                        {step.status}
                      </span>
                    </div>
                    <span className="text-slate-400 text-[11px] font-medium block">
                      {step.action}
                    </span>
                    <p className="text-[10px] font-mono text-slate-400 bg-slate-950/80 p-1.5 rounded border border-slate-800/60 break-words">
                      {step.details}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
