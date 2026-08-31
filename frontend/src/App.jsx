import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import GraphCanvas from './components/GraphCanvas';
import EvidenceDrawer from './components/EvidenceDrawer';
import AgentQueryBar from './components/AgentQueryBar';
import FinancialFlowView from './components/FinancialFlowView';
import CdrTelemetryView from './components/CdrTelemetryView';
import FirCorpusView from './components/FirCorpusView';
import LegalAuditVault from './components/LegalAuditVault';
import { apiService } from './services/api';
import { MOCK_GRAPH_DATA, AGENT_QUERY_PRESETS } from './data/mockIntelligenceData';

export default function App() {
  // Navigation View Tab: 'graph' | 'agent' | 'financial' | 'cdr' | 'fir' | 'audit'
  const [activeTab, setActiveTab] = useState('graph');

  // Core Data
  const [rawGraphData, setRawGraphData] = useState(MOCK_GRAPH_DATA);
  const [backendStatus, setBackendStatus] = useState({ isLive: false, source: 'AUTONOMOUS_DATASET' });
  const [loading, setLoading] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [riskThreshold, setRiskThreshold] = useState(0);
  const [selectedTypes, setSelectedTypes] = useState(['Person', 'Phone', 'Organization', 'Vehicle', 'Account']);
  const [selectedCluster, setSelectedCluster] = useState('ALL');
  const [timelineDate, setTimelineDate] = useState(null);
  const [timelinePlaying, setTimelinePlaying] = useState(false);

  // Selection & Focus
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [highlightedNodeIds, setHighlightedNodeIds] = useState([]);
  const [highlightedEdgeIds, setHighlightedEdgeIds] = useState([]);
  const [activeLayout, setActiveLayout] = useState('force');

  // Agent State
  const [agentResponse, setAgentResponse] = useState(AGENT_QUERY_PRESETS[0].response);
  const [loadingQuery, setLoadingQuery] = useState(false);

  // Fetch / Refresh Data on Mount
  const loadData = useCallback(async () => {
    setLoading(true);
    const health = await apiService.checkHealth();
    const result = await apiService.getGraph();
    
    if (result?.data) {
      setRawGraphData(result.data);
      setBackendStatus({
        isLive: health.isLive || result.source === 'LIVE_FASTAPI',
        source: result.source
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Node Counts by Type
  const nodeCountsByType = useMemo(() => {
    const counts = {};
    (rawGraphData?.nodes || []).forEach((n) => {
      counts[n.type] = (counts[n.type] || 0) + 1;
    });
    return counts;
  }, [rawGraphData]);

  // Toggle Type Selection
  const toggleType = (typeId) => {
    setSelectedTypes((prev) =>
      prev.includes(typeId) ? prev.filter((t) => t !== typeId) : [...prev, typeId]
    );
  };

  // Filtered Nodes Calculation
  const filteredNodes = useMemo(() => {
    let list = rawGraphData?.nodes || [];

    // Filter by Entity Type
    list = list.filter((n) => selectedTypes.includes(n.type));

    // Filter by Risk Threshold
    if (riskThreshold > 0) {
      list = list.filter((n) => (n.risk_score || 0) >= riskThreshold);
    }

    // Filter by Cluster
    if (selectedCluster !== 'ALL') {
      list = list.filter((n) => n.cluster_id === selectedCluster);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (n) =>
          n.name.toLowerCase().includes(q) ||
          n.id.toLowerCase().includes(q) ||
          (n.role && n.role.toLowerCase().includes(q)) ||
          (n.phone && n.phone.includes(q)) ||
          (n.account && n.account.includes(q)) ||
          (n.vehicle && n.vehicle.toLowerCase().includes(q)) ||
          (n.aliases && n.aliases.some((a) => a.toLowerCase().includes(q))) ||
          (n.source_docs && n.source_docs.some((doc) => doc.toLowerCase().includes(q)))
      );
    }

    return list;
  }, [rawGraphData, selectedTypes, riskThreshold, selectedCluster, searchQuery]);

  // Filtered Edges (Edges between visible nodes or matching timeline)
  const filteredEdges = useMemo(() => {
    const visibleNodeIds = new Set(filteredNodes.map((n) => n.id));
    let edgeList = (rawGraphData?.edges || []).filter(
      (e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target)
    );

    // Timeline Date Filter
    if (timelineDate) {
      edgeList = edgeList.filter((e) => {
        if (!e.timestamp) return true;
        return e.timestamp.includes(timelineDate);
      });
    }

    return edgeList;
  }, [rawGraphData, filteredNodes, timelineDate]);

  // Run LangGraph Agent Query
  const handleRunAgentQuery = async (queryText) => {
    setLoadingQuery(true);
    const result = await apiService.queryAgent(queryText);
    if (result?.data) {
      setAgentResponse({
        query: queryText,
        ...result.data,
      });

      // Highlight target path nodes and edges in Canvas
      if (result.data.highlighted_nodes) {
        setHighlightedNodeIds(result.data.highlighted_nodes);
      }
      if (result.data.highlighted_edges) {
        setHighlightedEdgeIds(result.data.highlighted_edges);
      }
    }
    setLoadingQuery(false);
  };

  // Trace Shortest Path to Mastermind Kingpin (Debasish Chatterjee P008)
  const handleTraceKingpin = (startNode) => {
    if (!startNode) return;
    const kingpinId = 'P008';

    // Simple BFS / Path highlighter
    const targetEdges = [];
    const targetNodes = [startNode.id, kingpinId];

    if (startNode.cluster_id === 'cluster_a') {
      // Path: startNode -> Sunita Roy (P007) -> Debasish (P008)
      targetNodes.push('P007', 'PH005', 'PH009');
      targetEdges.push('e_call_06', 'e_tx_cut_03', 'e_has_ph_01', 'e_has_ph_04');
    } else if (startNode.cluster_id === 'cluster_b') {
      // Path: startNode -> Ashok Mehta (P010) -> Debasish (P008)
      targetNodes.push('P010', 'PH007', 'PH009', 'VEH003');
      targetEdges.push('e_call_07', 'e_veh_03', 'e_veh_04', 'e_has_ph_01');
    } else {
      // Victim -> Rajesh -> Sunita -> Debasish
      targetNodes.push('P003', 'P007', 'PH002', 'PH005', 'PH009');
      targetEdges.push('e_spike_01', 'e_call_03', 'e_call_06');
    }

    setHighlightedNodeIds(targetNodes);
    setHighlightedEdgeIds(targetEdges);
    setActiveTab('graph');
  };

  // Reset Filters
  const resetFilters = () => {
    setSearchQuery('');
    setRiskThreshold(0);
    setSelectedTypes(['Person', 'Phone', 'Organization', 'Vehicle', 'Account']);
    setSelectedCluster('ALL');
    setTimelineDate(null);
    setTimelinePlaying(false);
    setHighlightedNodeIds([]);
    setHighlightedEdgeIds([]);
    setSelectedNode(null);
  };

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedNode(null);
        setHighlightedNodeIds([]);
        setHighlightedEdgeIds([]);
      } else if (e.key === '1' && e.altKey) {
        setActiveTab('graph');
      } else if (e.key === '2' && e.altKey) {
        setActiveTab('agent');
      } else if (e.key === '3' && e.altKey) {
        setActiveTab('financial');
      } else if (e.key === '4' && e.altKey) {
        setActiveTab('cdr');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#060913] text-slate-100 font-sans">
      {/* 1. Header with Telemetry & Module Tabs */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        backendStatus={backendStatus}
        refreshData={loadData}
        caseInfo={rawGraphData?.case_info}
        kpiStats={{
          totalNodes: rawGraphData?.nodes?.length || 0,
          totalEdges: rawGraphData?.edges?.length || 0,
        }}
      />

      {/* 2. Primary Workspace Body */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* VIEW 1: INTERACTIVE GRAPH CANVAS */}
        {activeTab === 'graph' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Filter and Timeline Controls */}
            <FilterBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              riskThreshold={riskThreshold}
              setRiskThreshold={setRiskThreshold}
              selectedTypes={selectedTypes}
              toggleType={toggleType}
              selectedCluster={selectedCluster}
              setSelectedCluster={setSelectedCluster}
              timelineDate={timelineDate}
              setTimelineDate={setTimelineDate}
              timelinePlaying={timelinePlaying}
              setTimelinePlaying={setTimelinePlaying}
              nodeCountsByType={nodeCountsByType}
              resetFilters={resetFilters}
            />

            {/* Force Canvas */}
            <div className="flex-1 relative overflow-hidden">
              <GraphCanvas
                nodes={filteredNodes}
                edges={filteredEdges}
                selectedNode={selectedNode}
                onSelectNode={(node) => setSelectedNode(node)}
                selectedEdge={selectedEdge}
                onSelectEdge={(edge) => setSelectedEdge(edge)}
                highlightedNodeIds={highlightedNodeIds}
                highlightedEdgeIds={highlightedEdgeIds}
                timelineDate={timelineDate}
                activeLayout={activeLayout}
                onLayoutChange={(layout) => setActiveLayout(layout)}
              />
            </div>
          </div>
        )}

        {/* VIEW 2: AI AGENTIC INVESTIGATION CONSOLE */}
        {activeTab === 'agent' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <AgentQueryBar
              onRunAgentQuery={handleRunAgentQuery}
              agentResponse={agentResponse}
              loadingQuery={loadingQuery}
              onFocusSubgraph={(nodeIds, edgeIds) => {
                setHighlightedNodeIds(nodeIds || []);
                setHighlightedEdgeIds(edgeIds || []);
                setActiveTab('graph');
              }}
            />

            {/* Split Preview Graph Canvas */}
            <div className="flex-1 relative">
              <GraphCanvas
                nodes={filteredNodes}
                edges={filteredEdges}
                selectedNode={selectedNode}
                onSelectNode={(node) => setSelectedNode(node)}
                highlightedNodeIds={agentResponse?.highlighted_nodes || highlightedNodeIds}
                highlightedEdgeIds={agentResponse?.highlighted_edges || highlightedEdgeIds}
                activeLayout="force"
              />
            </div>
          </div>
        )}

        {/* VIEW 3: CIRCULAR MONEY TRAIL & AML FLOW */}
        {activeTab === 'financial' && (
          <FinancialFlowView onSelectEntity={(nodeId) => {
            const found = rawGraphData.nodes.find(n => n.id === nodeId);
            if (found) {
              setSelectedNode(found);
              setActiveTab('graph');
            }
          }} />
        )}

        {/* VIEW 4: CDR TELEMETRY & CALL SPIKE MATRIX */}
        {activeTab === 'cdr' && (
          <CdrTelemetryView />
        )}

        {/* VIEW 5: FIR CORPUS & IN-TEXT NER HIGHLIGHTER */}
        {activeTab === 'fir' && (
          <FirCorpusView
            onSelectEntity={(entityName) => {
              const found = rawGraphData.nodes.find(n => n.name.includes(entityName));
              if (found) {
                setSelectedNode(found);
                setActiveTab('graph');
              }
            }}
            onJumpToGraph={() => setActiveTab('graph')}
          />
        )}

        {/* VIEW 6: BSA SECTION 65B LEGAL AUDIT VAULT */}
        {activeTab === 'audit' && (
          <LegalAuditVault
            caseInfo={rawGraphData.case_info}
            nodes={rawGraphData.nodes}
            edges={rawGraphData.edges}
          />
        )}

        {/* 3. Slide-Over Evidence & Investigation Drawer */}
        {selectedNode && (
          <EvidenceDrawer
            selectedNode={selectedNode}
            onClose={() => setSelectedNode(null)}
            onFocusNode={(node) => {
              setHighlightedNodeIds([node.id]);
            }}
            onTraceKingpin={handleTraceKingpin}
            onOpenFirDoc={(docId) => {
              setActiveTab('fir');
            }}
            allEdges={rawGraphData?.edges || []}
          />
        )}
      </main>
    </div>
  );
}
