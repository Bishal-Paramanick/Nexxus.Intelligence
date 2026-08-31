import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Pause, 
  Play, 
  Eye, 
  EyeOff, 
  Sparkles,
  Layers
} from 'lucide-react';

export default function GraphCanvas({
  nodes,
  edges,
  selectedNode,
  onSelectNode,
  selectedEdge,
  onSelectEdge,
  highlightedNodeIds = [],
  highlightedEdgeIds = [],
  timelineDate = null,
  activeLayout = 'force',
  onLayoutChange
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Simulation & Viewport State
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [physicsRunning, setPhysicsRunning] = useState(true);
  const [showLabels, setShowLabels] = useState(true);

  // Internal physical nodes state
  const simNodesRef = useRef([]);
  const animFrameRef = useRef(null);
  const pulseOffsetRef = useRef(0);

  // Cluster Center Anchors
  const clusterCenters = {
    bridge: { x: 0, y: -30, label: 'Mastermind Bridge' },
    cluster_a: { x: -300, y: 70, label: 'Cluster A: Extortion' },
    cluster_b: { x: 300, y: 70, label: 'Cluster B: Laundering' },
    victim: { x: -140, y: 320, label: 'Victims' },
  };

  // Sync Physical Nodes from Props
  useEffect(() => {
    const existingMap = new Map(simNodesRef.current.map(n => [n.id, n]));
    
    simNodesRef.current = nodes.map((node, i) => {
      const existing = existingMap.get(node.id);
      const clusterCenter = clusterCenters[node.cluster_id] || { x: 0, y: 0 };
      
      const baseRadius = node.type === 'Person' ? 20 : node.type === 'Organization' ? 18 : 15;
      const riskBonus = (node.risk_score || 0) * 0.1;
      const centralityBonus = (node.betweenness_centrality || 0) * 12;
      const radius = baseRadius + riskBonus + centralityBonus;

      const angle = (i / Math.max(nodes.length, 1)) * 2 * Math.PI;
      const spread = 80 + (i % 3) * 40;
      
      const initialX = existing?.x ?? (clusterCenter.x + Math.cos(angle) * spread + (Math.random() - 0.5) * 30);
      const initialY = existing?.y ?? (clusterCenter.y + Math.sin(angle) * spread + (Math.random() - 0.5) * 30);

      // Clean Modern Colors
      let color = '#10b981'; // Emerald Low
      let glowColor = 'rgba(16, 185, 129, 0.3)';
      if (node.risk_score >= 85) {
        color = '#f43f5e'; // Rose Critical
        glowColor = 'rgba(244, 63, 94, 0.5)';
      } else if (node.risk_score >= 70) {
        color = '#f59e0b'; // Amber High
        glowColor = 'rgba(245, 158, 11, 0.4)';
      } else if (node.risk_score >= 40) {
        color = '#06b6d4'; // Cyan Moderate
        glowColor = 'rgba(6, 182, 212, 0.35)';
      }

      return {
        ...node,
        x: initialX,
        y: initialY,
        vx: existing?.vx ?? 0,
        vy: existing?.vy ?? 0,
        radius,
        color,
        glowColor,
        isKingpin: node.id === 'P008' || node.name.includes('Debasish'),
      };
    });
  }, [nodes]);

  // Center initial view
  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPan({ x: rect.width / 2, y: rect.height / 2 });
    }
  }, []);

  const applyLayout = (layoutType) => {
    if (!simNodesRef.current.length) return;
    const simNodes = simNodesRef.current;
    
    if (layoutType === 'radial') {
      simNodes.forEach((node) => {
        if (node.isKingpin) {
          node.x = 0;
          node.y = 0;
        } else {
          const isClusterA = node.cluster_id === 'cluster_a';
          const isClusterB = node.cluster_id === 'cluster_b';
          const radius = node.type === 'Person' ? 200 : 330;
          const offsetAngle = isClusterA ? -Math.PI * 0.65 : isClusterB ? -Math.PI * 0.35 : Math.PI * 0.5;
          const jitter = (Math.random() - 0.5) * 1.0;
          node.x = Math.cos(offsetAngle + jitter) * radius;
          node.y = Math.sin(offsetAngle + jitter) * radius;
        }
        node.vx = 0;
        node.vy = 0;
      });
    } else if (layoutType === 'cluster') {
      simNodes.forEach((node, i) => {
        const center = clusterCenters[node.cluster_id] || { x: 0, y: 0 };
        const angle = (i * 1.37) % (2 * Math.PI);
        const dist = 35 + (i % 4) * 30;
        node.x = center.x + Math.cos(angle) * dist;
        node.y = center.y + Math.sin(angle) * dist;
        node.vx = 0;
        node.vy = 0;
      });
    }
    setPhysicsRunning(true);
  };

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const updatePhysics = () => {
      if (!physicsRunning) return;
      const simNodes = simNodesRef.current;
      const nodeCount = simNodes.length;

      // 1. Repulsion
      for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
          const n1 = simNodes[i];
          const n2 = simNodes[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const distSq = dx * dx + dy * dy || 1;
          const dist = Math.sqrt(distSq);
          const minDist = n1.radius + n2.radius + 30;

          if (dist < 400) {
            const force = (minDist * minDist * 3.8) / distSq;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            if (n1.id !== draggingNodeId) {
              n1.vx -= fx * 0.08;
              n1.vy -= fy * 0.08;
            }
            if (n2.id !== draggingNodeId) {
              n2.vx += fx * 0.08;
              n2.vy += fy * 0.08;
            }
          }
        }
      }

      // 2. Spring Attraction
      const nodeMap = new Map(simNodes.map(n => [n.id, n]));
      edges.forEach((edge) => {
        const source = nodeMap.get(edge.source);
        const target = nodeMap.get(edge.target);
        if (source && target) {
          const dx = target.x - source.x;
          const dy = target.y - source.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const targetDist = edge.is_anomaly ? 120 : 160;
          const springForce = (dist - targetDist) * 0.015;
          const fx = (dx / dist) * springForce;
          const fy = (dy / dist) * springForce;

          if (source.id !== draggingNodeId) {
            source.vx += fx;
            source.vy += fy;
          }
          if (target.id !== draggingNodeId) {
            target.vx -= fx;
            target.vy -= fy;
          }
        }
      });

      // 3. Cluster Gravity Pull & Damping
      simNodes.forEach((node) => {
        if (node.id === draggingNodeId) return;

        const center = clusterCenters[node.cluster_id] || { x: 0, y: 0 };
        const cdx = center.x - node.x;
        const cdy = center.y - node.y;
        node.vx += cdx * 0.003;
        node.vy += cdy * 0.003;

        node.vx *= 0.88;
        node.vy *= 0.88;

        node.x += node.vx;
        node.y += node.vy;
      });
    };

    const render = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
        }
      }

      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      pulseOffsetRef.current = (pulseOffsetRef.current + 0.035) % 100;
      const pulseVal = Math.sin(pulseOffsetRef.current);

      ctx.save();
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);

      // 1. Subtle Cluster Zones
      Object.entries(clusterCenters).forEach(([clusterId, center]) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(center.x, center.y, 150, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(center.x, center.y, 20, center.x, center.y, 150);
        if (clusterId === 'bridge') {
          grad.addColorStop(0, 'rgba(168, 85, 247, 0.06)');
          grad.addColorStop(1, 'rgba(168, 85, 247, 0)');
        } else if (clusterId === 'cluster_a') {
          grad.addColorStop(0, 'rgba(244, 63, 94, 0.05)');
          grad.addColorStop(1, 'rgba(244, 63, 94, 0)');
        } else if (clusterId === 'cluster_b') {
          grad.addColorStop(0, 'rgba(245, 158, 11, 0.05)');
          grad.addColorStop(1, 'rgba(245, 158, 11, 0)');
        } else {
          grad.addColorStop(0, 'rgba(16, 185, 129, 0.04)');
          grad.addColorStop(1, 'rgba(16, 185, 129, 0)');
        }
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.font = '10px Inter, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.textAlign = 'center';
        ctx.fillText(center.label.toUpperCase(), center.x, center.y - 130);
        ctx.restore();
      });

      const simNodes = simNodesRef.current;
      const nodeMap = new Map(simNodes.map(n => [n.id, n]));
      const hasHighlights = highlightedNodeIds.length > 0;

      // 2. Draw Edges
      edges.forEach((edge) => {
        const source = nodeMap.get(edge.source);
        const target = nodeMap.get(edge.target);
        if (!source || !target) return;

        const isEdgeHighlighted = highlightedEdgeIds.includes(edge.id) || 
          (selectedNode && (edge.source === selectedNode.id || edge.target === selectedNode.id));
        const isDimmed = hasHighlights && !isEdgeHighlighted && !highlightedNodeIds.includes(edge.source) && !highlightedNodeIds.includes(edge.target);

        ctx.save();
        ctx.globalAlpha = isDimmed ? 0.12 : 1;

        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);

        if (edge.is_anomaly || edge.sub_type === 'CALL_SPIKE_ANOMALY') {
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = isEdgeHighlighted ? 3.5 : 2.5;
          ctx.shadowColor = 'rgba(244, 63, 94, 0.6)';
          ctx.shadowBlur = 8;
          ctx.stroke();

          // Pulse Dot
          const progress = (pulseOffsetRef.current * 0.8) % 1;
          const px = source.x + (target.x - source.x) * progress;
          const py = source.y + (target.y - source.y) * progress;
          ctx.beginPath();
          ctx.arc(px, py, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();

        } else if (edge.anomaly_type?.includes('CIRCULAR') || edge.is_circular) {
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = isEdgeHighlighted ? 3.5 : 2;
          ctx.shadowColor = 'rgba(245, 158, 11, 0.5)';
          ctx.shadowBlur = 8;
          ctx.stroke();

          const progress = (pulseOffsetRef.current * 0.5) % 1;
          const px = source.x + (target.x - source.x) * progress;
          const py = source.y + (target.y - source.y) * progress;
          ctx.beginPath();
          ctx.arc(px, py, 3, 0, Math.PI * 2);
          ctx.fillStyle = '#fef08a';
          ctx.fill();

        } else if (edge.is_bridge) {
          ctx.strokeStyle = '#a855f7';
          ctx.lineWidth = isEdgeHighlighted ? 3 : 1.8;
          ctx.stroke();
        } else {
          ctx.strokeStyle = isEdgeHighlighted ? '#00f0ff' : 'rgba(255, 255, 255, 0.12)';
          ctx.lineWidth = isEdgeHighlighted ? 2 : 1;
          ctx.stroke();
        }

        // Clean subtle tag
        if ((zoom > 1.05 || isEdgeHighlighted) && (edge.amount || edge.frequency)) {
          const midX = (source.x + target.x) / 2;
          const midY = (source.y + target.y) / 2;
          ctx.font = '9px JetBrains Mono, monospace';
          ctx.fillStyle = edge.is_anomaly ? '#fca5a5' : edge.amount ? '#fde047' : '#94a3b8';
          ctx.textAlign = 'center';
          const tag = edge.amount ? `₹${(edge.amount).toLocaleString('en-IN')}` : `${edge.frequency} calls`;
          ctx.fillText(tag, midX, midY - 4);
        }

        ctx.restore();
      });

      // 3. Draw Nodes (Clean modern aesthetics)
      simNodes.forEach((node) => {
        const isSelected = selectedNode?.id === node.id;
        const isHighlighted = highlightedNodeIds.includes(node.id) || isSelected;
        const isDimmed = hasHighlights && !isHighlighted;

        ctx.save();
        ctx.globalAlpha = isDimmed ? 0.18 : 1;

        // Subtle Glow for Kingpin or Critical Risk
        if (node.isKingpin || node.risk_score >= 85 || isSelected) {
          ctx.beginPath();
          const haloRadius = node.radius + (node.isKingpin ? 8 + pulseVal * 2 : 5 + pulseVal * 1.5);
          ctx.arc(node.x, node.y, haloRadius, 0, Math.PI * 2);
          ctx.fillStyle = node.isKingpin ? 'rgba(168, 85, 247, 0.2)' : node.glowColor;
          ctx.fill();
        }

        // Base Node Circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#0f1422';
        ctx.fill();

        // Node Border & Inner Color Fill
        ctx.lineWidth = isSelected ? 3 : node.isKingpin ? 2.5 : 1.8;
        ctx.strokeStyle = isSelected ? '#ffffff' : node.color;
        if (isSelected) {
          ctx.shadowColor = '#00f0ff';
          ctx.shadowBlur = 12;
        }
        ctx.stroke();

        // Inner soft radial fill
        const innerGrad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.radius);
        innerGrad.addColorStop(0, node.color + '40');
        innerGrad.addColorStop(1, '#0f1422');
        ctx.fillStyle = innerGrad;
        ctx.fill();

        // Icon Glyph
        ctx.font = `${Math.round(node.radius * 0.85)}px system-ui`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        let glyph = '👤';
        if (node.type === 'Phone') glyph = '📱';
        if (node.type === 'Organization') glyph = '🏢';
        if (node.type === 'Vehicle') glyph = '🚗';
        if (node.type === 'Account') glyph = '💳';
        if (node.isKingpin) glyph = '👑';
        ctx.fillText(glyph, node.x, node.y);

        // Small Risk Badge
        if (node.risk_score !== undefined && node.risk_score > 0) {
          const badgeX = node.x + node.radius * 0.7;
          const badgeY = node.y - node.radius * 0.7;
          ctx.beginPath();
          ctx.arc(badgeX, badgeY, 8, 0, Math.PI * 2);
          ctx.fillStyle = node.color;
          ctx.fill();
          ctx.strokeStyle = '#07090e';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.font = 'bold 7.5px JetBrains Mono, monospace';
          ctx.fillStyle = '#07090e';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${node.risk_score}`, badgeX, badgeY);
        }

        // Clean Modern Label
        if (showLabels || isSelected || isHighlighted) {
          ctx.font = `${node.isKingpin ? '600 11px' : '500 10.5px'} Inter, sans-serif`;
          ctx.fillStyle = isSelected ? '#38bdf8' : node.isKingpin ? '#e9d5ff' : '#f8fafc';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          
          const displayName = node.name.length > 22 ? node.name.substring(0, 20) + '...' : node.name;
          ctx.fillText(displayName, node.x, node.y + node.radius + 5);

          if (node.role && (zoom > 0.9 || isSelected || node.isKingpin)) {
            ctx.font = '9px Inter, sans-serif';
            ctx.fillStyle = '#94a3b8';
            ctx.fillText(node.role, node.x, node.y + node.radius + 18);
          }
        }

        ctx.restore();
      });

      ctx.restore();

      updatePhysics();
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [edges, selectedNode, highlightedNodeIds, highlightedEdgeIds, zoom, pan, physicsRunning, showLabels]);

  const screenToWorld = useCallback((screenX, screenY) => {
    return {
      x: (screenX - pan.x) / zoom,
      y: (screenY - pan.y) / zoom
    };
  }, [pan, zoom]);

  const handleMouseDown = (e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const worldPos = screenToWorld(mouseX, mouseY);

    const clickedNode = [...simNodesRef.current].reverse().find((node) => {
      const dx = node.x - worldPos.x;
      const dy = node.y - worldPos.y;
      return Math.sqrt(dx * dx + dy * dy) <= node.radius + 4;
    });

    if (clickedNode) {
      setDraggingNodeId(clickedNode.id);
      onSelectNode?.(clickedNode);
    } else {
      setIsDraggingCanvas(true);
      setDragStart({ x: mouseX - pan.x, y: mouseY - pan.y });
    }
  };

  const handleMouseMove = (e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const worldPos = screenToWorld(mouseX, mouseY);

    if (draggingNodeId) {
      const node = simNodesRef.current.find(n => n.id === draggingNodeId);
      if (node) {
        node.x = worldPos.x;
        node.y = worldPos.y;
        node.vx = 0;
        node.vy = 0;
      }
    } else if (isDraggingCanvas) {
      setPan({
        x: mouseX - dragStart.x,
        y: mouseY - dragStart.y
      });
    } else {
      const hovered = simNodesRef.current.find((node) => {
        const dx = node.x - worldPos.x;
        const dy = node.y - worldPos.y;
        return Math.sqrt(dx * dx + dy * dy) <= node.radius + 4;
      });
      setHoveredNode(hovered || null);
    }
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
    setIsDraggingCanvas(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newZoom = Math.min(Math.max(zoom * zoomFactor, 0.4), 3.0);

    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setPan({
      x: mouseX - (mouseX - pan.x) * (newZoom / zoom),
      y: mouseY - (mouseY - pan.y) * (newZoom / zoom)
    });
    setZoom(newZoom);
  };

  const resetView = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPan({ x: rect.width / 2, y: rect.height / 2 });
      setZoom(1);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[620px] bg-[#07090e] cyber-grid overflow-hidden select-none">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
      />

      {/* Sleek Minimal Floating Controls */}
      <div className="absolute top-4 left-4 flex items-center space-x-1 p-1 bg-[#0f1422]/90 backdrop-blur-xl rounded-xl border border-white/[0.08] shadow-lg z-20">
        <button
          onClick={() => setZoom((z) => Math.min(z * 1.2, 3.0))}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-white/[0.08] rounded-lg transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(z * 0.8, 0.4))}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-white/[0.08] rounded-lg transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={resetView}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-white/[0.08] rounded-lg transition-colors"
          title="Center View"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-4 bg-white/[0.1] mx-0.5"></div>

        <button
          onClick={() => setPhysicsRunning(!physicsRunning)}
          className={`p-1.5 rounded-lg transition-colors ${
            physicsRunning
              ? 'text-cyan-400 hover:bg-white/[0.08]'
              : 'text-amber-400 bg-amber-500/10'
          }`}
          title={physicsRunning ? 'Pause Physics' : 'Resume Physics'}
        >
          {physicsRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>

        <div className="w-[1px] h-4 bg-white/[0.1] mx-0.5"></div>

        {/* Layout Presets */}
        <div className="flex items-center space-x-1 text-xs">
          <button
            onClick={() => {
              applyLayout('force');
              onLayoutChange?.('force');
            }}
            className="px-2 py-1 text-[11px] rounded-md text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            Force
          </button>
          <button
            onClick={() => {
              applyLayout('cluster');
              onLayoutChange?.('cluster');
            }}
            className="px-2 py-1 text-[11px] rounded-md text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            Cluster
          </button>
          <button
            onClick={() => {
              applyLayout('radial');
              onLayoutChange?.('radial');
            }}
            className="px-2 py-1 text-[11px] rounded-md text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            Radial
          </button>
        </div>
      </div>

      {/* Floating Hover Tooltip */}
      {hoveredNode && !isDraggingCanvas && !draggingNodeId && (
        <div 
          className="absolute pointer-events-none bg-[#0f1422]/95 border border-cyan-500/40 rounded-xl p-3 shadow-2xl z-30 max-w-xs transition-opacity"
          style={{
            left: `${hoveredNode.x * zoom + pan.x + 16}px`,
            top: `${hoveredNode.y * zoom + pan.y - 16}px`,
          }}
        >
          <div className="flex items-center justify-between space-x-2 mb-1">
            <span className="font-semibold text-white text-xs truncate">{hoveredNode.name}</span>
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                hoveredNode.risk_score >= 85
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : hoveredNode.risk_score >= 70
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              }`}
            >
              Risk: {hoveredNode.risk_score}
            </span>
          </div>
          <p className="text-[11px] text-cyan-300 mb-1">{hoveredNode.role || hoveredNode.type}</p>
          <p className="text-[10px] text-slate-400 line-clamp-2">{hoveredNode.summary}</p>
        </div>
      )}

      {/* Clean Minimal Legend in Bottom-Left */}
      <div className="absolute bottom-4 left-4 z-20 hidden md:block">
        <div className="bg-[#0f1422]/80 backdrop-blur-md border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-slate-300 flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span className="text-[11px]">Critical (&gt;85)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-[11px]">High (70-84)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
            <span className="text-[11px]">Moderate</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-[11px]">Witness/Victim</span>
          </div>
        </div>
      </div>
    </div>
  );
}
