import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Pause, 
  Play, 
  Layers, 
  Eye, 
  EyeOff, 
  Crosshair, 
  Sparkles,
  Info,
  Compass
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
  const [showLegend, setShowLegend] = useState(true);

  // Internal node physical state: { id, x, y, vx, vy, radius, color, ... }
  const simNodesRef = useRef([]);
  const animFrameRef = useRef(null);
  const pulseOffsetRef = useRef(0);

  // Cluster Center Anchors
  const clusterCenters = {
    bridge: { x: 0, y: -40, label: 'Mastermind Nexus' },
    cluster_a: { x: -320, y: 80, label: 'Cluster A: Extortion Cell' },
    cluster_b: { x: 320, y: 80, label: 'Cluster B: Laundering Cell' },
    victim: { x: -160, y: 340, label: 'Victims & Witnesses' },
  };

  // Initialize Physical Nodes from props
  useEffect(() => {
    const existingMap = new Map(simNodesRef.current.map(n => [n.id, n]));
    
    simNodesRef.current = nodes.map((node, i) => {
      const existing = existingMap.get(node.id);
      const clusterCenter = clusterCenters[node.cluster_id] || { x: 0, y: 0 };
      
      // Radius scaled by risk and betweenness
      const baseRadius = node.type === 'Person' ? 22 : node.type === 'Organization' ? 20 : 16;
      const riskBonus = (node.risk_score || 0) * 0.12;
      const centralityBonus = (node.betweenness_centrality || 0) * 15;
      const radius = baseRadius + riskBonus + centralityBonus;

      // Deterministic spread
      const angle = (i / Math.max(nodes.length, 1)) * 2 * Math.PI;
      const spread = 90 + (i % 3) * 45;
      
      const initialX = existing?.x ?? (clusterCenter.x + Math.cos(angle) * spread + (Math.random() - 0.5) * 40);
      const initialY = existing?.y ?? (clusterCenter.y + Math.sin(angle) * spread + (Math.random() - 0.5) * 40);

      // Risk colors
      let color = '#10b981'; // Emerald Low
      let glowColor = 'rgba(16, 185, 129, 0.4)';
      if (node.risk_score >= 85) {
        color = '#f43f5e'; // Rose Critical
        glowColor = 'rgba(244, 63, 94, 0.6)';
      } else if (node.risk_score >= 70) {
        color = '#f59e0b'; // Amber High
        glowColor = 'rgba(245, 158, 11, 0.5)';
      } else if (node.risk_score >= 40) {
        color = '#06b6d4'; // Cyan Moderate
        glowColor = 'rgba(6, 182, 212, 0.4)';
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

  // Center Canvas Initial View
  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPan({ x: rect.width / 2, y: rect.height / 2 });
    }
  }, []);

  // Force Layout Reconfiguration (when layout changed)
  const applyLayout = (layoutType) => {
    if (!simNodesRef.current.length) return;
    const simNodes = simNodesRef.current;
    
    if (layoutType === 'radial') {
      // Kingpin at center, others around concentric rings
      simNodes.forEach((node) => {
        if (node.isKingpin) {
          node.x = 0;
          node.y = 0;
        } else {
          const isClusterA = node.cluster_id === 'cluster_a';
          const isClusterB = node.cluster_id === 'cluster_b';
          const radius = node.type === 'Person' ? 220 : 360;
          const offsetAngle = isClusterA ? -Math.PI * 0.65 : isClusterB ? -Math.PI * 0.35 : Math.PI * 0.5;
          const jitter = (Math.random() - 0.5) * 1.2;
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
        const dist = 40 + (i % 4) * 35;
        node.x = center.x + Math.cos(angle) * dist;
        node.y = center.y + Math.sin(angle) * dist;
        node.vx = 0;
        node.vy = 0;
      });
    }
    setPhysicsRunning(true);
  };

  // Main Physics Engine & Renderer Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const updatePhysics = () => {
      if (!physicsRunning) return;
      const simNodes = simNodesRef.current;
      const nodeCount = simNodes.length;

      // 1. Repulsion between all node pairs
      for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
          const n1 = simNodes[i];
          const n2 = simNodes[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const distSq = dx * dx + dy * dy || 1;
          const dist = Math.sqrt(distSq);
          const minDist = n1.radius + n2.radius + 35;

          if (dist < 450) {
            const force = (minDist * minDist * 4.5) / distSq;
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

      // 2. Spring Attraction along Edges
      const nodeMap = new Map(simNodes.map(n => [n.id, n]));
      edges.forEach((edge) => {
        const source = nodeMap.get(edge.source);
        const target = nodeMap.get(edge.target);
        if (source && target) {
          const dx = target.x - source.x;
          const dy = target.y - source.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const targetDist = edge.is_anomaly ? 130 : 180;
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

      // 3. Cluster Gravity Pull & Velocity Damping
      simNodes.forEach((node) => {
        if (node.id === draggingNodeId) return;

        const center = clusterCenters[node.cluster_id] || { x: 0, y: 0 };
        const cdx = center.x - node.x;
        const cdy = center.y - node.y;
        node.vx += cdx * 0.003;
        node.vy += cdy * 0.003;

        // Damping / Friction
        node.vx *= 0.88;
        node.vy *= 0.88;

        // Update positions
        node.x += node.vx;
        node.y += node.vy;
      });
    };

    const render = () => {
      // Resize canvas to container
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
        }
      }

      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      // Pulse offset for animations
      pulseOffsetRef.current = (pulseOffsetRef.current + 0.04) % 100;
      const pulseVal = Math.sin(pulseOffsetRef.current);

      ctx.save();
      // Apply Pan and Zoom transforms
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);

      // 1. Draw Cluster Backdrop Zones
      Object.entries(clusterCenters).forEach(([clusterId, center]) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(center.x, center.y, 160, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(center.x, center.y, 20, center.x, center.y, 160);
        if (clusterId === 'bridge') {
          grad.addColorStop(0, 'rgba(168, 85, 247, 0.09)');
          grad.addColorStop(1, 'rgba(168, 85, 247, 0)');
        } else if (clusterId === 'cluster_a') {
          grad.addColorStop(0, 'rgba(244, 63, 94, 0.07)');
          grad.addColorStop(1, 'rgba(244, 63, 94, 0)');
        } else if (clusterId === 'cluster_b') {
          grad.addColorStop(0, 'rgba(245, 158, 11, 0.07)');
          grad.addColorStop(1, 'rgba(245, 158, 11, 0)');
        } else {
          grad.addColorStop(0, 'rgba(16, 185, 129, 0.06)');
          grad.addColorStop(1, 'rgba(16, 185, 129, 0)');
        }
        ctx.fillStyle = grad;
        ctx.fill();

        // Cluster Title Pill
        ctx.font = '11px JetBrains Mono, monospace';
        ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
        ctx.textAlign = 'center';
        ctx.fillText(center.label.toUpperCase(), center.x, center.y - 140);
        ctx.restore();
      });

      const simNodes = simNodesRef.current;
      const nodeMap = new Map(simNodes.map(n => [n.id, n]));
      const hasHighlights = highlightedNodeIds.length > 0;

      // 2. Draw Edges (Lines, glow, particles, arrowheads)
      edges.forEach((edge) => {
        const source = nodeMap.get(edge.source);
        const target = nodeMap.get(edge.target);
        if (!source || !target) return;

        const isEdgeHighlighted = highlightedEdgeIds.includes(edge.id) || 
          (selectedNode && (edge.source === selectedNode.id || edge.target === selectedNode.id));
        const isDimmed = hasHighlights && !isEdgeHighlighted && !highlightedNodeIds.includes(edge.source) && !highlightedNodeIds.includes(edge.target);

        ctx.save();
        ctx.globalAlpha = isDimmed ? 0.12 : 1;

        // Custom edge styles
        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);

        if (edge.is_anomaly || edge.sub_type === 'CALL_SPIKE_ANOMALY') {
          // 🚨 CALL SPIKE ANOMALY (22 Calls) - Glowing Rose
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = isEdgeHighlighted ? 4.5 : 3;
          ctx.shadowColor = '#f43f5e';
          ctx.shadowBlur = 14;
          ctx.stroke();

          // Draw animated energy pulse packets along spike line
          const progress = (pulseOffsetRef.current * 0.8) % 1;
          const px = source.x + (target.x - source.x) * progress;
          const py = source.y + (target.y - source.y) * progress;
          ctx.beginPath();
          ctx.arc(px, py, 4.5, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#f43f5e';
          ctx.shadowBlur = 10;
          ctx.fill();

        } else if (edge.anomaly_type?.includes('CIRCULAR') || edge.is_circular) {
          // 💸 CIRCULAR MONEY ROUTING - Glowing Gold / Amber
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = isEdgeHighlighted ? 4 : 2.5;
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 12;
          ctx.stroke();

          // Animated Currency flow dot
          const progress = (pulseOffsetRef.current * 0.5) % 1;
          const px = source.x + (target.x - source.x) * progress;
          const py = source.y + (target.y - source.y) * progress;
          ctx.beginPath();
          ctx.arc(px, py, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#fef08a';
          ctx.fill();

        } else if (edge.is_bridge) {
          // 👑 BRIDGE CONNECTION (Debasish Kingpin) - Glowing Violet
          ctx.strokeStyle = '#a855f7';
          ctx.lineWidth = isEdgeHighlighted ? 3.5 : 2;
          ctx.shadowColor = '#a855f7';
          ctx.shadowBlur = 10;
          ctx.stroke();

        } else {
          // Standard Edge
          ctx.strokeStyle = isEdgeHighlighted ? '#00f0ff' : 'rgba(51, 65, 85, 0.6)';
          ctx.lineWidth = isEdgeHighlighted ? 2.5 : 1.2;
          if (isEdgeHighlighted) {
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 8;
          }
          ctx.stroke();
        }

        // Draw Edge Type / Amount Tag if zoomed in or highlighted
        if ((zoom > 0.95 || isEdgeHighlighted) && (edge.amount || edge.frequency || edge.type)) {
          const midX = (source.x + target.x) / 2;
          const midY = (source.y + target.y) / 2;
          ctx.font = '9px JetBrains Mono, monospace';
          ctx.fillStyle = edge.is_anomaly ? '#fca5a5' : edge.amount ? '#fde047' : '#94a3b8';
          ctx.textAlign = 'center';
          const tag = edge.amount ? `₹${(edge.amount).toLocaleString('en-IN')}` : edge.frequency ? `${edge.frequency} calls` : edge.type;
          ctx.fillText(tag, midX, midY - 4);
        }

        ctx.restore();
      });

      // 3. Draw Nodes (Auras, Circles, Icons, Badges, Labels)
      simNodes.forEach((node) => {
        const isSelected = selectedNode?.id === node.id;
        const isHighlighted = highlightedNodeIds.includes(node.id) || isSelected;
        const isDimmed = hasHighlights && !isHighlighted;

        ctx.save();
        ctx.globalAlpha = isDimmed ? 0.18 : 1;

        // Glowing halo for Kingpin or Critical Risk (>80)
        if (node.isKingpin || node.risk_score >= 85 || isSelected) {
          ctx.beginPath();
          const haloRadius = node.radius + (node.isKingpin ? 10 + pulseVal * 3 : 6 + pulseVal * 2);
          ctx.arc(node.x, node.y, haloRadius, 0, Math.PI * 2);
          ctx.fillStyle = node.isKingpin ? 'rgba(168, 85, 247, 0.25)' : node.glowColor;
          ctx.fill();

          // Outer pulsing ring
          ctx.beginPath();
          ctx.arc(node.x, node.y, haloRadius + 4, 0, Math.PI * 2);
          ctx.strokeStyle = node.isKingpin ? 'rgba(168, 85, 247, 0.6)' : node.color;
          ctx.lineWidth = node.isKingpin ? 2 : 1.2;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Base Node Circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#0b1120';
        ctx.fill();

        // Node Inner Gradient Fill
        const grad = ctx.createRadialGradient(node.x - 4, node.y - 4, 2, node.x, node.y, node.radius);
        grad.addColorStop(0, node.color);
        grad.addColorStop(1, '#060913');
        ctx.fillStyle = grad;
        ctx.fill();

        // Node Border
        ctx.lineWidth = isSelected ? 3.5 : node.isKingpin ? 3 : 1.8;
        ctx.strokeStyle = isSelected ? '#ffffff' : node.color;
        if (isSelected || node.isKingpin) {
          ctx.shadowColor = node.color;
          ctx.shadowBlur = 15;
        }
        ctx.stroke();

        // Node Glyph / Type Icon
        ctx.font = `${Math.round(node.radius * 0.9)}px system-ui`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        let glyph = '👤';
        if (node.type === 'Phone') glyph = '📱';
        if (node.type === 'Organization') glyph = '🏢';
        if (node.type === 'Vehicle') glyph = '🚗';
        if (node.type === 'Account') glyph = '💳';
        if (node.isKingpin) glyph = '👑';
        ctx.fillText(glyph, node.x, node.y);

        // Risk Score Badge (top right of node)
        if (node.risk_score !== undefined && node.risk_score > 0) {
          const badgeX = node.x + node.radius * 0.75;
          const badgeY = node.y - node.radius * 0.75;
          ctx.beginPath();
          ctx.arc(badgeX, badgeY, 9, 0, Math.PI * 2);
          ctx.fillStyle = node.color;
          ctx.fill();
          ctx.strokeStyle = '#060913';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.font = 'bold 8px JetBrains Mono, monospace';
          ctx.fillStyle = '#060913';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${node.risk_score}`, badgeX, badgeY);
        }

        // Text Labels below node
        if (showLabels || isSelected || isHighlighted) {
          ctx.font = `${node.isKingpin ? 'bold 12px' : '11px'} Inter, sans-serif`;
          ctx.fillStyle = isSelected ? '#00f0ff' : node.isKingpin ? '#e9d5ff' : '#f1f5f9';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.shadowColor = '#000000';
          ctx.shadowBlur = 4;
          
          // Truncate long names
          const displayName = node.name.length > 20 ? node.name.substring(0, 18) + '...' : node.name;
          ctx.fillText(displayName, node.x, node.y + node.radius + 6);

          // Role / Subtitle
          if (node.role && (zoom > 0.8 || isSelected || node.isKingpin)) {
            ctx.font = '9px JetBrains Mono, monospace';
            ctx.fillStyle = node.isKingpin ? '#c084fc' : '#94a3b8';
            ctx.fillText(node.role, node.x, node.y + node.radius + 20);
          }
        }

        ctx.restore();
      });

      ctx.restore();

      // Render Mini-Map Radar on the top layer
      drawMiniMap(ctx, width, height, simNodes);

      updatePhysics();
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [edges, selectedNode, highlightedNodeIds, highlightedEdgeIds, zoom, pan, physicsRunning, showLabels]);

  // Mini-Map Radar Renderer
  const drawMiniMap = (ctx, canvasWidth, canvasHeight, simNodes) => {
    const mapW = 140;
    const mapH = 100;
    const mapX = canvasWidth - mapW - 16;
    const mapY = canvasHeight - mapH - 16;

    ctx.save();
    // Frame
    ctx.fillStyle = 'rgba(6, 9, 19, 0.85)';
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.6)';
    ctx.lineWidth = 1;
    ctx.roundRect(mapX, mapY, mapW, mapH, 6);
    ctx.fill();
    ctx.stroke();

    // Radar Header
    ctx.font = '8px JetBrains Mono, monospace';
    ctx.fillStyle = '#06b6d4';
    ctx.textAlign = 'left';
    ctx.fillText('RADAR MINIMAP', mapX + 8, mapY + 12);

    // Map Center is at mapX + mapW/2, mapY + mapH/2
    const scale = 0.12;
    const mcx = mapX + mapW / 2;
    const mcy = mapY + mapH / 2;

    // Mini nodes
    simNodes.forEach((node) => {
      const nx = mcx + node.x * scale;
      const ny = mcy + node.y * scale;
      if (nx >= mapX + 2 && nx <= mapX + mapW - 2 && ny >= mapY + 2 && ny <= mapY + mapH - 2) {
        ctx.beginPath();
        ctx.arc(nx, ny, node.isKingpin ? 3.5 : 2, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();
      }
    });

    // Viewport box in minimap
    const viewW = (canvasWidth / zoom) * scale;
    const viewH = (canvasHeight / zoom) * scale;
    const vx = mcx - (pan.x / zoom) * scale - viewW / 2;
    const vy = mcy - (pan.y / zoom) * scale - viewH / 2;
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 1;
    ctx.strokeRect(vx, vy, viewW, viewH);

    ctx.restore();
  };

  // Convert Screen Coordinates to Graph World Space
  const screenToWorld = useCallback((screenX, screenY) => {
    return {
      x: (screenX - pan.x) / zoom,
      y: (screenY - pan.y) / zoom
    };
  }, [pan, zoom]);

  // Handle Mouse Down (Node Click/Drag or Canvas Pan)
  const handleMouseDown = (e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const worldPos = screenToWorld(mouseX, mouseY);

    // Check if clicked a node (from top-most)
    const clickedNode = [...simNodesRef.current].reverse().find((node) => {
      const dx = node.x - worldPos.x;
      const dy = node.y - worldPos.y;
      return Math.sqrt(dx * dx + dy * dy) <= node.radius + 5;
    });

    if (clickedNode) {
      setDraggingNodeId(clickedNode.id);
      onSelectNode?.(clickedNode);
    } else {
      // Start Canvas Pan
      setIsDraggingCanvas(true);
      setDragStart({ x: mouseX - pan.x, y: mouseY - pan.y });
    }
  };

  // Handle Mouse Move (Drag node, Drag pan, Hover detect)
  const handleMouseMove = (e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const worldPos = screenToWorld(mouseX, mouseY);

    if (draggingNodeId) {
      // Dragging a node
      const node = simNodesRef.current.find(n => n.id === draggingNodeId);
      if (node) {
        node.x = worldPos.x;
        node.y = worldPos.y;
        node.vx = 0;
        node.vy = 0;
      }
    } else if (isDraggingCanvas) {
      // Panning Canvas
      setPan({
        x: mouseX - dragStart.x,
        y: mouseY - dragStart.y
      });
    } else {
      // Hover detection
      const hovered = simNodesRef.current.find((node) => {
        const dx = node.x - worldPos.x;
        const dy = node.y - worldPos.y;
        return Math.sqrt(dx * dx + dy * dy) <= node.radius + 5;
      });
      setHoveredNode(hovered || null);
    }
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
    setIsDraggingCanvas(false);
  };

  // Handle Mouse Wheel Zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.12 : 0.88;
    const newZoom = Math.min(Math.max(zoom * zoomFactor, 0.35), 3.5);

    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Zoom centered at mouse cursor
    setPan({
      x: mouseX - (mouseX - pan.x) * (newZoom / zoom),
      y: mouseY - (mouseY - pan.y) * (newZoom / zoom)
    });
    setZoom(newZoom);
  };

  // Reset Camera View to Center
  const resetView = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPan({ x: rect.width / 2, y: rect.height / 2 });
      setZoom(1);
    }
  };

  // Focus Camera on Selected Node
  const focusNode = (node) => {
    if (!node || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPan({
      x: rect.width / 2 - node.x * 1.5,
      y: rect.height / 2 - node.y * 1.5
    });
    setZoom(1.5);
  };

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[620px] bg-[#060913] cyber-grid overflow-hidden select-none">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
      />

      {/* Floating Canvas Control Bar */}
      <div className="absolute top-4 left-4 flex flex-wrap items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 shadow-xl z-20">
        <button
          onClick={() => setZoom((z) => Math.min(z * 1.2, 3.5))}
          className="p-2 text-slate-300 hover:text-cyan-300 hover:bg-slate-800 rounded-lg transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(z * 0.8, 0.35))}
          className="p-2 text-slate-300 hover:text-cyan-300 hover:bg-slate-800 rounded-lg transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={resetView}
          className="p-2 text-slate-300 hover:text-cyan-300 hover:bg-slate-800 rounded-lg transition-colors"
          title="Reset View to Center"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-5 bg-slate-700 mx-1"></div>

        {/* Physics Pause / Resume */}
        <button
          onClick={() => setPhysicsRunning(!physicsRunning)}
          className={`p-2 rounded-lg transition-colors ${
            physicsRunning
              ? 'text-cyan-400 hover:bg-slate-800'
              : 'text-amber-400 bg-amber-950/40 border border-amber-500/40'
          }`}
          title={physicsRunning ? 'Pause Physics Simulation' : 'Resume Physics Simulation'}
        >
          {physicsRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>

        {/* Labels Toggle */}
        <button
          onClick={() => setShowLabels(!showLabels)}
          className={`p-2 rounded-lg transition-colors ${
            showLabels ? 'text-cyan-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-800'
          }`}
          title={showLabels ? 'Hide Labels' : 'Show Labels'}
        >
          {showLabels ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>

        <div className="w-[1px] h-5 bg-slate-700 mx-1"></div>

        {/* Layout Mode Presets */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => {
              applyLayout('force');
              onLayoutChange?.('force');
            }}
            className="px-2 py-1 text-[11px] font-mono rounded bg-slate-800/80 hover:bg-cyan-950 text-slate-300 hover:text-cyan-300 border border-slate-700"
          >
            Force Physics
          </button>
          <button
            onClick={() => {
              applyLayout('cluster');
              onLayoutChange?.('cluster');
            }}
            className="px-2 py-1 text-[11px] font-mono rounded bg-slate-800/80 hover:bg-cyan-950 text-slate-300 hover:text-cyan-300 border border-slate-700"
          >
            Cluster Hull
          </button>
          <button
            onClick={() => {
              applyLayout('radial');
              onLayoutChange?.('radial');
            }}
            className="px-2 py-1 text-[11px] font-mono rounded bg-slate-800/80 hover:bg-cyan-950 text-slate-300 hover:text-cyan-300 border border-slate-700"
          >
            Radial Rings
          </button>
        </div>
      </div>

      {/* Floating Hover Tooltip */}
      {hoveredNode && !isDraggingCanvas && !draggingNodeId && (
        <div 
          className="absolute pointer-events-none bg-slate-950/95 border border-cyan-500/50 rounded-lg p-3 shadow-glow-cyan z-30 max-w-xs transition-opacity"
          style={{
            left: `${hoveredNode.x * zoom + pan.x + 20}px`,
            top: `${hoveredNode.y * zoom + pan.y - 20}px`,
          }}
        >
          <div className="flex items-center justify-between space-x-2 mb-1">
            <span className="font-bold text-slate-100 text-xs truncate">{hoveredNode.name}</span>
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                hoveredNode.risk_score >= 85
                  ? 'bg-rose-950 text-rose-300 border border-rose-600/40'
                  : hoveredNode.risk_score >= 70
                  ? 'bg-amber-950 text-amber-300 border border-amber-600/40'
                  : 'bg-cyan-950 text-cyan-300 border border-cyan-600/40'
              }`}
            >
              RISK: {hoveredNode.risk_score}/100
            </span>
          </div>
          <p className="text-[11px] text-cyan-300 font-mono mb-1">{hoveredNode.role || hoveredNode.type}</p>
          <p className="text-[10px] text-slate-400 line-clamp-2">{hoveredNode.summary}</p>
          <div className="mt-2 pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Cluster: {hoveredNode.cluster_id}</span>
            <span>Click to inspect ➔</span>
          </div>
        </div>
      )}

      {/* Legend & Instructions Drawer Toggle */}
      <div className="absolute bottom-4 left-4 z-20">
        <div className="bg-slate-950/90 backdrop-blur-md border border-slate-800/90 rounded-xl p-3 text-xs text-slate-300 max-w-xs space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400 font-bold border-b border-slate-800 pb-1">
            <span>GRAPH INTELLIGENCE KEY</span>
            <span className="text-[9px] text-slate-500">INTERACTIVE</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500 shadow-glow-rose"></span>
              <span>Critical Risk (&gt;85)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span>High Risk (70-84)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-cyan-500"></span>
              <span>Moderate (40-69)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span>Low / Victim (&lt;40)</span>
            </div>
          </div>
          <div className="pt-1.5 border-t border-slate-800/80 space-y-1 text-[10px] font-mono text-slate-400">
            <div className="flex items-center space-x-1.5 text-rose-300">
              <span className="w-2.5 h-0.5 bg-rose-500"></span>
              <span>🚨 22-Call Extortion Spike</span>
            </div>
            <div className="flex items-center space-x-1.5 text-amber-300">
              <span className="w-2.5 h-0.5 bg-amber-400"></span>
              <span>💸 ₹500k Circular Fund Route</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
