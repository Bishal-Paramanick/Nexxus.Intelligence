// API Interface Service for Bishal <-> Jayanta Contract
// Supports live FastAPI backend endpoints and autonomous fallback to high-fidelity mock engine

import { MOCK_GRAPH_DATA, FIR_CORPUS, AGENT_QUERY_PRESETS } from '../data/mockIntelligenceData';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const apiService = {
  // Check backend server health
  async checkHealth() {
    try {
      const res = await fetch(`${BASE_URL}/health`, { method: 'GET', signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        return { isLive: true, data: await res.json() };
      }
      return { isLive: false };
    } catch {
      return { isLive: false };
    }
  },

  // 1. GET /api/graph -> JSON { nodes, edges }
  async getGraph() {
    try {
      const res = await fetch(`${BASE_URL}/graph`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const liveData = await res.json();
        return { source: 'LIVE_FASTAPI', data: liveData };
      }
    } catch (e) {
      console.info('Backend unreachable, using embedded high-fidelity knowledge graph.', e.message);
    }
    // Autonomous Fallback
    return { source: 'AUTONOMOUS_DATASET', data: MOCK_GRAPH_DATA };
  },

  // 2. GET /api/entity/{id} -> Suspect profile card & risk factor breakdown
  async getEntityById(entityId) {
    try {
      const res = await fetch(`${BASE_URL}/entity/${entityId}`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        return { source: 'LIVE_FASTAPI', data: await res.json() };
      }
    } catch (e) {
      console.info(`Using embedded entity profile for ${entityId}`);
    }

    // Local resolution
    const node = MOCK_GRAPH_DATA.nodes.find(n => n.id === entityId || n.name === entityId);
    if (!node) return null;

    return {
      source: 'AUTONOMOUS_DATASET',
      data: {
        entity_id: node.id,
        name: node.name,
        type: node.type,
        role: node.role || 'Unspecified Role',
        cluster: node.cluster,
        risk_score: node.risk_score || 0,
        risk_tier: node.risk_tier || (node.risk_score > 75 ? 'CRITICAL' : node.risk_score > 50 ? 'HIGH' : 'MODERATE'),
        betweenness_centrality: node.betweenness_centrality || 0,
        aliases: node.aliases || [],
        phone: node.phone,
        account: node.account,
        vehicle: node.vehicle,
        source_docs: node.source_docs || [],
        score_breakdown: node.score_breakdown || {
          centrality_score: Math.round((node.risk_score || 0) * 0.3),
          cross_case_links: Math.round((node.risk_score || 0) * 0.25),
          call_velocity: Math.round((node.risk_score || 0) * 0.25),
          financial_anomalies: Math.round((node.risk_score || 0) * 0.2),
        },
        summary: node.summary || `Entity ${node.name} associated with ${node.cluster}.`,
        status: node.status || 'ACTIVE'
      }
    };
  },

  // 3. GET /api/entity/{id}/evidence -> Extracted FIR excerpts & confidence %
  async getEntityEvidence(entityId) {
    try {
      const res = await fetch(`${BASE_URL}/entity/${entityId}/evidence`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        return { source: 'LIVE_FASTAPI', data: await res.json() };
      }
    } catch (e) {
      console.info(`Using embedded evidence audit trail for ${entityId}`);
    }

    const node = MOCK_GRAPH_DATA.nodes.find(n => n.id === entityId || n.name === entityId);
    const relatedEdges = MOCK_GRAPH_DATA.edges.filter(e => e.source === entityId || e.target === entityId);

    const firExcerpts = (node?.source_docs || ['FIR_101', 'FIR_102', 'FIR_103']).map(docId => {
      const fir = FIR_CORPUS.find(f => f.doc_id === docId);
      return {
        doc_id: docId,
        fir_no: fir?.fir_no || `${docId}/2026`,
        police_station: fir?.police_station || 'Kolkata Cyber Cell',
        date: fir?.date || '2026-03-12',
        excerpt: fir?.summary || `Directly cited in ${docId} investigation transcript.`,
        confidence_percentage: 95.8,
        legal_admissibility_standard: 'BSA 2023 Sec 63 / Sec 65B Indian Evidence Act'
      };
    });

    return {
      source: 'AUTONOMOUS_DATASET',
      data: {
        entity_id: entityId,
        entity_name: node?.name || entityId,
        source_documents: node?.source_docs || [],
        fir_excerpts: firExcerpts,
        telemetry_links_count: relatedEdges.length,
        edges_evidence: relatedEdges.map(e => ({
          edge_id: e.id,
          type: e.type,
          connected_to: e.source === entityId ? e.target_name : e.source_name,
          evidence: e.evidence,
          confidence: Math.round(e.confidence * 100),
          timestamp: e.timestamp,
          is_anomaly: e.is_anomaly || false
        }))
      }
    };
  },

  // 4. POST /api/agent/query -> Natural language investigator query
  async queryAgent(userPrompt) {
    try {
      const res = await fetch(`${BASE_URL}/agent/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userPrompt }),
        signal: AbortSignal.timeout(4000)
      });
      if (res.ok) {
        return { source: 'LIVE_FASTAPI', data: await res.json() };
      }
    } catch (e) {
      console.info('Backend agent query fallback engaged.');
    }

    // Dynamic mock intelligence matcher
    const normalized = userPrompt.toLowerCase();
    
    // Match against pre-computed query presets
    let matchedPreset = AGENT_QUERY_PRESETS.find(p => 
      normalized.includes('kingpin') || normalized.includes('mastermind') || normalized.includes('debasish') || normalized.includes('bridge')
    );

    if (normalized.includes('money') || normalized.includes('circular') || normalized.includes('laundering') || normalized.includes('fund') || normalized.includes('500,000') || normalized.includes('loop')) {
      matchedPreset = AGENT_QUERY_PRESETS[1];
    } else if (normalized.includes('spike') || normalized.includes('call') || normalized.includes('extortion') || normalized.includes('22') || normalized.includes('manoj')) {
      matchedPreset = AGENT_QUERY_PRESETS[2];
    } else if (normalized.includes('alias') || normalized.includes('r.k.') || normalized.includes('rajesh') || normalized.includes('resolution')) {
      matchedPreset = AGENT_QUERY_PRESETS[3];
    } else if (!matchedPreset) {
      // General match
      matchedPreset = AGENT_QUERY_PRESETS[0];
    }

    return {
      source: 'AUTONOMOUS_DATASET',
      data: {
        query: userPrompt,
        summary: matchedPreset.response.summary,
        reasoning_steps: matchedPreset.response.reasoning_steps,
        highlighted_nodes: matchedPreset.response.highlighted_nodes,
        highlighted_edges: matchedPreset.response.highlighted_edges,
        timestamp: new Date().toISOString(),
        confidence: 0.96
      }
    };
  }
};
