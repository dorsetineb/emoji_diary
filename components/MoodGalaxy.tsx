import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { MoodEntry, MoodId } from '../types';
import { MOODS } from '../constants';

// FIX: Explicitly added properties from `d3.SimulationNodeDatum` to the Node interface.
// This resolves errors where properties like `x`, `y`, `fx`, and `fy` were not found on the type.
// The d3 force simulation adds these properties to nodes to manage their position, and this
// change makes them available to TypeScript.
interface Node {
  id: string;
  entry: MoodEntry;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

const MoodGalaxy: React.FC<{ data: MoodEntry[] }> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    const { width, height } = svg.node()!.getBoundingClientRect();
    
    svg.selectAll("*").remove(); // Clear previous render

    const nodes: Node[] = data.map(entry => ({
      id: entry.date,
      entry,
    }));

    // Define cluster centers for each mood type
    const moodIds = Object.keys(MOODS) as MoodId[];
    const numClusters = moodIds.length;
    const clusterRadius = Math.min(width, height) / 2.5;

    const clusterCenters = moodIds.reduce((acc, moodId, i) => {
        const angle = (i / numClusters) * 2 * Math.PI;
        acc[moodId] = {
            x: width / 2 + clusterRadius * Math.cos(angle),
            y: height / 2 + clusterRadius * Math.sin(angle)
        };
        return acc;
    }, {} as Record<MoodId, { x: number, y: number }>);
    
    const getRadius = (d: Node) => 8 + d.entry.intensity * 1.8;
    
    // Primary mood is used for clustering
    const getPrimaryMood = (d: Node): MoodId => d.entry.moods[0] ?? 'neutro';

    const simulation = d3.forceSimulation<Node>(nodes)
      .force("charge", d3.forceManyBody().strength(-10))
      // Pull nodes towards the center of the SVG
      .force("center", d3.forceCenter(width / 2, height / 2).strength(0.01))
      // Cluster nodes by their primary mood
      .force("x", d3.forceX<Node>(d => clusterCenters[getPrimaryMood(d)]?.x ?? width / 2).strength(0.08))
      .force("y", d3.forceY<Node>(d => clusterCenters[getPrimaryMood(d)]?.y ?? height / 2).strength(0.08))
      // Prevent nodes from overlapping
      .force("collide", d3.forceCollide<Node>(d => getRadius(d) + 2).strength(0.9));

    const nodeElements = svg.append("g")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .attr("font-size", d => `${getRadius(d)}px`)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .text(d => MOODS[getPrimaryMood(d)].emoji)
      .style("cursor", "pointer")
      .call(createDragHandler(simulation) as any);

    simulation.on("tick", () => {
      nodeElements
        .attr("x", d => d.x!)
        .attr("y", d => d.y!);
    });
    
    const tooltip = d3.select(tooltipRef.current);
    nodeElements
        .on("mouseover", (event, d) => {
            tooltip.style("opacity", 1);
            const moodsHtml = d.entry.moods.map(mId => `${MOODS[mId].emoji} ${MOODS[mId].label}`).join(' & ');
            tooltip.html(`
                <div class="font-bold">${d.entry.date}</div>
                <div>${moodsHtml} (Int: ${d.entry.intensity})</div>
                ${d.entry.tags.length > 0 ? `<div class="flex flex-wrap gap-1 mt-1">
                    ${d.entry.tags.map(t => `<span class="text-xs bg-gray-700 px-1.5 py-0.5 rounded">${t}</span>`).join('')}
                </div>` : ''}
            `);
        })
        .on("mousemove", (event) => {
            tooltip.style("left", `${event.pageX + 15}px`).style("top", `${event.pageY - 10}px`);
        })
        .on("mouseout", () => {
            tooltip.style("opacity", 0);
        });

    return () => {
      simulation.stop();
    };
  }, [data]);

  const createDragHandler = (simulation: d3.Simulation<Node, undefined>) => {
    function dragstarted(event: d3.D3DragEvent<SVGTextElement, Node, any>, d: Node) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    function dragged(event: d3.D3DragEvent<SVGTextElement, Node, any>, d: Node) {
      d.fx = event.x;
      d.fy = event.y;
    }
    function dragended(event: d3.D3DragEvent<SVGTextElement, Node, any>, d: Node) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
    return d3.drag<SVGTextElement, Node, any>().on("start", dragstarted).on("drag", dragged).on("end", dragended);
  }

  return (
    <div className="w-full h-full relative">
        <svg ref={svgRef} className="w-full h-full" />
        <div ref={tooltipRef} className="absolute z-10 p-2 bg-gray-900 border border-gray-600 rounded-lg shadow-lg text-sm text-white pointer-events-none transition-opacity duration-200 opacity-0"></div>
    </div>
  );
};

export default MoodGalaxy;