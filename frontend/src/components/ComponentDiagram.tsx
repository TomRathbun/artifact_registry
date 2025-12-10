import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    addEdge,
    type Connection,
    type Edge,
    type Node,
    MarkerType,
    Handle,
    Position,
    updateEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ComponentService } from '../client';
import dagre from 'dagre';
import DualListBox from './DualListBox';
import {
    Filter,
    Download,
    AlignHorizontalJustifyStart,
    AlignHorizontalJustifyCenter,
    AlignHorizontalJustifyEnd,
    AlignVerticalJustifyStart,
    AlignVerticalJustifyCenter,
    AlignVerticalJustifyEnd,
    Tag,
    Activity
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import { toPng, toSvg } from 'html-to-image';
import axios from 'axios';

const CustomNode = ({ data, style }: any) => {
    return (
        <div style={style} title={data.description}>
            {/* Top and Bottom Handles */}
            <Handle type="target" position={Position.Top} id="top" style={{ background: '#555' }} />
            <Handle type="source" position={Position.Top} id="top-source" style={{ background: '#555' }} />
            <Handle type="target" position={Position.Bottom} id="bottom" style={{ background: '#555' }} />
            <Handle type="source" position={Position.Bottom} id="bottom-source" style={{ background: '#555' }} />

            {/* Right Side Handles */}
            {/* Right Side Handles */}
            <Handle type="source" position={Position.Right} id="right-top" style={{ top: '20%', background: '#555' }} />
            <Handle type="target" position={Position.Right} id="right-top-target" style={{ top: '30%', background: '#555' }} />
            <Handle type="source" position={Position.Right} id="right-bottom" style={{ top: '70%', background: '#555' }} />
            <Handle type="target" position={Position.Right} id="right-bottom-target" style={{ top: '80%', background: '#555' }} />

            {/* Left Side Handles */}
            <Handle type="target" position={Position.Left} id="left-top" style={{ top: '20%', background: '#555' }} />
            <Handle type="source" position={Position.Left} id="left-top-source" style={{ top: '30%', background: '#555' }} />
            <Handle type="target" position={Position.Left} id="left-bottom" style={{ top: '70%', background: '#555' }} />
            <Handle type="source" position={Position.Left} id="left-bottom-source" style={{ top: '80%', background: '#555' }} />

            <div className="flex flex-col items-center gap-1">
                <div className="font-semibold">{data.label}</div>

                <div className="flex flex-wrap justify-center gap-1 mt-1">
                    {data.lifecycle && (
                        <span className={`text-[10px] px-1 py-0.5 rounded border inline-flex items-center gap-0.5 ${data.lifecycle === 'Active' ? 'bg-green-50 text-green-700 border-green-200' :
                            data.lifecycle === 'Deprecated' ? 'bg-red-50 text-red-700 border-red-200' :
                                'bg-slate-50 text-slate-600 border-slate-200'
                            }`}>
                            <Activity className="w-2 h-2" />
                            {data.lifecycle}
                        </span>
                    )}
                    {data.tags && Array.isArray(data.tags) && data.tags.map((tag: string) => (
                        <span key={tag} className="text-[10px] text-blue-600 bg-blue-50 border border-blue-100 px-1 py-0.5 rounded inline-flex items-center gap-0.5">
                            <Tag className="w-2 h-2" /> {tag}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

const nodeTypes = {
    custom: CustomNode,
};

const nodeWidth = 172;
const nodeHeight = 36;

const getLayoutedElements = (nodes: any[], edges: any[], direction = 'TB') => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    nodes.forEach((node) => {
        // Only apply layout if position is not already set (x=0, y=0 or null)
        if (!node.position.x && !node.position.y) {
            const nodeWithPosition = dagreGraph.node(node.id);
            node.targetPosition = isHorizontal ? 'left' : 'top';
            node.sourcePosition = isHorizontal ? 'right' : 'bottom';

            // We are shifting the dagre node position (anchor=center center) to the top left
            // so it matches the React Flow node anchor point (top left).
            node.position = {
                x: nodeWithPosition.x - nodeWidth / 2,
                y: nodeWithPosition.y - nodeHeight / 2,
            };
        }

        return node;
    });

    return { nodes, edges };
};

interface ComponentDiagramProps {
    diagramId?: string;
    readOnly?: boolean;
}

export default function ComponentDiagram({ diagramId: propDiagramId, readOnly = false }: ComponentDiagramProps = {}) {
    const params = useParams<{ diagramId: string }>();
    const diagramId = propDiagramId || params.diagramId;
    const queryClient = useQueryClient();
    const [showFilter, setShowFilter] = useState(false);
    const [selectedComponentIds, setSelectedComponentIds] = useState<string[]>([]);
    const [edgeType, setEdgeType] = useState<'default' | 'straight' | 'step' | 'smoothstep'>('smoothstep');
    const saveTimeoutRef = useRef<any>(null);
    const pendingUpdatesRef = useRef<Record<string, { x: number; y: number }>>({});

    // Fetch all components (needed for the list)
    const { data: allComponents } = useQuery({
        queryKey: ['components'],
        queryFn: () => ComponentService.listComponentsApiV1ComponentsGet(),
    });

    // Fetch diagram details if diagramId exists
    const { data: diagram, isLoading: isDiagramLoading } = useQuery({
        queryKey: ['diagram', diagramId],
        queryFn: async () => {
            if (!diagramId) return null;
            const response = await axios.get(`/api/v1/diagrams/${diagramId}`);
            return response.data;
        },
        enabled: !!diagramId,
    });

    // Initialize selected IDs based on diagram components
    useEffect(() => {
        if (diagram && diagram.components) {
            setSelectedComponentIds(diagram.components.map((c: any) => c.component_id));
        } else if (!diagramId && allComponents && selectedComponentIds.length === 0) {
            // Fallback for global view (if we keep it)
            setSelectedComponentIds(allComponents.map((c: any) => c.id));
        }
    }, [diagram, allComponents, diagramId]);

    const updateComponentMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            if (diagramId) {
                // Update diagram-specific position
                await axios.put(`/api/v1/diagrams/${diagramId}/components/${id}`, {
                    x: data.x,
                    y: data.y
                });
            } else {
                // Update global position (legacy)
                await ComponentService.updateComponentApiV1ComponentsComponentIdPut(id, data);
            }
        },
        onSuccess: () => {
            if (diagramId) {
                queryClient.invalidateQueries({ queryKey: ['diagram', diagramId] });
            } else {
                queryClient.invalidateQueries({ queryKey: ['components'] });
            }
        },
    });

    // Mutation to add/remove components from diagram
    const toggleComponentInDiagramMutation = useMutation({
        mutationFn: async ({ componentId, action }: { componentId: string; action: 'add' | 'remove' }) => {
            if (!diagramId) return; // Only for diagram mode

            if (action === 'add') {
                // Add with default position (0,0)
                await axios.put(`/api/v1/diagrams/${diagramId}/components/${componentId}`, {
                    x: 0,
                    y: 0
                });
            } else {
                await axios.delete(`/api/v1/diagrams/${diagramId}/components/${componentId}`);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['diagram', diagramId] });
        }
    });

    const updateEdgeMutation = useMutation({
        mutationFn: async ({ sourceId, targetId, sourceHandle, targetHandle }: { sourceId: string; targetId: string; sourceHandle: string; targetHandle: string }) => {
            if (!diagramId) return;
            await axios.put(
                `/api/v1/diagrams/${diagramId}/edges`,
                {
                    source_handle: sourceHandle,
                    target_handle: targetHandle
                },
                {
                    params: {
                        source_id: sourceId,
                        target_id: targetId
                    }
                }
            );
        },
        onSuccess: () => {
            // We don't necessarily need to invalidate immediately as local state updates first, 
            // but it's good for consistency.
            // queryClient.invalidateQueries({ queryKey: ['diagram', diagramId] });
        }
    });

    const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
        if (!allComponents) return { nodes: [], edges: [] };

        const nodes: any[] = [];
        const edges: any[] = [];

        // Filter components based on selection
        const filteredComponents = allComponents.filter((c: any) =>
            selectedComponentIds.length === 0 || selectedComponentIds.includes(c.id)
        );

        filteredComponents.forEach((comp: any) => {
            // Determine position: Diagram-specific or Global
            let x = comp.x || 0;
            let y = comp.y || 0;

            if (diagramId && diagram?.components) {
                const diagramComp = diagram.components.find((dc: any) => dc.component_id === comp.id);
                if (diagramComp) {
                    x = diagramComp.x;
                    y = diagramComp.y;
                }
            }

            nodes.push({
                id: comp.id,
                type: 'custom',
                data: {
                    label: comp.name,
                    description: comp.description,
                    tags: comp.tags,
                    lifecycle: comp.lifecycle
                },
                position: { x, y },
                style: {
                    background: comp.type === 'Hardware' ? '#fff7ed' : '#eff6ff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '10px',
                    fontSize: '12px',
                    fontWeight: 500,
                    color: '#1e293b',
                    width: nodeWidth,
                    textAlign: 'center',
                },
            });

            if (comp.children) {
                comp.children.forEach((child: any) => {
                    // Only add edge if both source and target are visible
                    if (selectedComponentIds.includes(comp.id) && selectedComponentIds.includes(child.child_id)) {
                        const isCommunication = child.type === 'communication';

                        let sourceHandle = 'bottom-source';
                        let targetHandle = 'top';

                        if (isCommunication) {
                            const sourceNode = nodes.find(n => n.id === comp.id);
                            const targetNode = nodes.find(n => n.id === child.child_id);

                            // Check if we have a stored edge for this connection
                            const storedEdge = diagram?.edges?.find((e: any) =>
                                e.source_id === comp.id && e.target_id === child.child_id
                            );

                            if (storedEdge) {
                                // Use stored handles
                                sourceHandle = storedEdge.source_handle || sourceHandle;
                                targetHandle = storedEdge.target_handle || targetHandle;
                            } else if (sourceNode && targetNode) {
                                // Auto-calculate based on positions
                                const sourceX = sourceNode.position.x;
                                const targetX = targetNode.position.x;

                                if (sourceX < targetX) {
                                    // Forward flow (Left -> Right): Use Top-Side handles
                                    sourceHandle = 'right-top';
                                    targetHandle = 'left-top';
                                } else {
                                    // Reverse flow (Right -> Left): Use Bottom-Side handles
                                    sourceHandle = 'left-bottom-source';
                                    targetHandle = 'right-bottom-target';
                                }
                            } else {
                                // Default if positions not found yet
                                sourceHandle = 'right-top';
                                targetHandle = 'left-top';
                            }
                        }

                        edges.push({
                            id: `${comp.id}-${child.child_id}`,
                            source: comp.id,
                            target: child.child_id,
                            sourceHandle: sourceHandle,
                            targetHandle: targetHandle,
                            label: isCommunication
                                ? `${child.protocol || '?'}: ${child.data_items || ''}`
                                : child.cardinality,
                            type: edgeType,
                            animated: isCommunication,
                            markerEnd: {
                                type: MarkerType.ArrowClosed,
                            },
                            style: {
                                stroke: isCommunication ? '#3b82f6' : '#94a3b8',
                                strokeDasharray: isCommunication ? '5,5' : undefined
                            },
                            labelStyle: { fill: '#64748b', fontWeight: 500, fontSize: '10px' },
                            labelBgStyle: { fill: '#f8fafc' },
                        });
                    }
                });
            }
        });

        // Only run layout if we have nodes without positions
        const needsLayout = nodes.some(n => n.position.x === 0 && n.position.y === 0);
        if (needsLayout) {
            return getLayoutedElements(nodes, edges);
        }
        return { nodes, edges };
    }, [allComponents, selectedComponentIds, diagramId, diagram]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    // Update nodes/edges when data changes
    useEffect(() => {
        setNodes(initialNodes);
        setEdges(initialEdges.map(e => ({ ...e, type: edgeType })));
    }, [initialNodes, initialEdges, setNodes, setEdges, edgeType]);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );

    const onNodeDragStop = useCallback(
        (_: React.MouseEvent, node: Node) => {
            updateComponentMutation.mutate({
                id: node.id,
                data: { x: Math.round(node.position.x), y: Math.round(node.position.y) }
            });
        },
        [updateComponentMutation]
    );

    const onEdgeUpdate = useCallback(
        (oldEdge: Edge, newConnection: Connection) => {
            setEdges((els) => updateEdge(oldEdge, newConnection, els));

            if (diagramId && newConnection.source && newConnection.target) {
                updateEdgeMutation.mutate({
                    sourceId: newConnection.source,
                    targetId: newConnection.target,
                    sourceHandle: newConnection.sourceHandle || '',
                    targetHandle: newConnection.targetHandle || ''
                });
            }
        },
        [setEdges, diagramId, updateEdgeMutation]
    );

    const downloadImage = (format: 'png' | 'svg') => {
        const flowElement = document.querySelector('.react-flow') as HTMLElement;
        if (!flowElement) return;

        const download = (dataUrl: string) => {
            const a = document.createElement('a');
            a.setAttribute('download', `component-diagram.${format}`);
            a.setAttribute('href', dataUrl);
            a.click();
        };

        const options = {
            backgroundColor: '#fff',
            filter: (node: HTMLElement) => {
                // Exclude the MiniMap and Controls from the export
                if (node.classList && (node.classList.contains('react-flow__minimap') || node.classList.contains('react-flow__controls'))) {
                    return false;
                }
                return true;
            }
        };

        if (format === 'png') {
            toPng(flowElement, options).then(download);
        } else {
            toSvg(flowElement, options).then(download);
        }
    };

    // Alignment Logic
    const alignNodes = (direction: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
        const selectedNodes = nodes.filter((n) => n.selected);
        if (selectedNodes.length < 2) return;

        let targetValue = 0;
        if (direction === 'left') targetValue = Math.min(...selectedNodes.map((n) => n.position.x));
        if (direction === 'right') targetValue = Math.max(...selectedNodes.map((n) => n.position.x));
        if (direction === 'top') targetValue = Math.min(...selectedNodes.map((n) => n.position.y));
        if (direction === 'bottom') targetValue = Math.max(...selectedNodes.map((n) => n.position.y));
        if (direction === 'center') {
            const minX = Math.min(...selectedNodes.map((n) => n.position.x));
            const maxX = Math.max(...selectedNodes.map((n) => n.position.x));
            targetValue = (minX + maxX) / 2;
        }
        if (direction === 'middle') {
            const minY = Math.min(...selectedNodes.map((n) => n.position.y));
            const maxY = Math.max(...selectedNodes.map((n) => n.position.y));
            targetValue = (minY + maxY) / 2;
        }

        const updatedNodes = nodes.map((n) => {
            if (!n.selected) return n;
            const newPos = { ...n.position };
            if (direction === 'left' || direction === 'right') newPos.x = targetValue;
            if (direction === 'center') newPos.x = targetValue; // Center aligns centers, but here we align left edge to center line? Or center of node to center line?
            // Usually center alignment means aligning the center of the nodes.
            // Let's refine center/middle:
            // Center: x = targetValue - nodeWidth/2
            // Middle: y = targetValue - nodeHeight/2
            // But my nodes have fixed width/height? Yes, nodeWidth/nodeHeight constants.

            if (direction === 'center') newPos.x = targetValue; // Simplified, assumes same width or aligning lefts to center? 
            // Better: Align centers. 
            // If I calculated targetValue as average of centers, then newPos.x = targetValue - width/2.
            // Current targetValue for center is average of Lefts (minX) and Rights (maxX)? No, minX and maxX are left positions.
            // Let's stick to simple alignment for now. Align Lefts.

            if (direction === 'top' || direction === 'bottom') newPos.y = targetValue;
            if (direction === 'middle') newPos.y = targetValue;

            return { ...n, position: newPos };
        });

        setNodes(updatedNodes);

        // Persist changes
        updatedNodes.forEach(n => {
            if (n.selected) {
                updateComponentMutation.mutate({
                    id: n.id,
                    data: { x: Math.round(n.position.x), y: Math.round(n.position.y) }
                });
            }
        });
    };

    // Keyboard Nudging
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Only if not editing text inputs
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return;

            const selectedNodes = nodes.filter((n) => n.selected);
            if (selectedNodes.length === 0) return;

            let dx = 0;
            let dy = 0;
            const step = e.shiftKey ? 10 : 1; // Shift for larger steps

            if (e.key === 'ArrowLeft') dx = -step;
            if (e.key === 'ArrowRight') dx = step;
            if (e.key === 'ArrowUp') dy = -step;
            if (e.key === 'ArrowDown') dy = step;

            if (dx === 0 && dy === 0) return;

            e.preventDefault();

            const updatedNodes = nodes.map((n) => {
                if (!n.selected) return n;
                return {
                    ...n,
                    position: {
                        x: n.position.x + dx,
                        y: n.position.y + dy
                    }
                };
            });

            setNodes(updatedNodes);

            // Store updates in ref for debounced saving
            updatedNodes.forEach(n => {
                if (n.selected) {
                    pendingUpdatesRef.current[n.id] = { x: n.position.x, y: n.position.y };
                }
            });

            // Debounce save
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }

            saveTimeoutRef.current = setTimeout(() => {
                Object.entries(pendingUpdatesRef.current).forEach(([id, pos]) => {
                    updateComponentMutation.mutate({
                        id,
                        data: { x: Math.round(pos.x), y: Math.round(pos.y) }
                    });
                });
                pendingUpdatesRef.current = {};
            }, 1000);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        };
    }, [nodes, setNodes, updateComponentMutation]);

    if (isDiagramLoading) return <div>Loading diagram...</div>;

    return (
        <div className="flex flex-col h-full space-y-4">
            {diagramId && diagram && (
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                    <h2 className="text-xl font-semibold text-slate-800">{diagram.name}</h2>
                    {diagram.description && (
                        <p className="text-slate-600 mt-1">{diagram.description}</p>
                    )}
                </div>
            )}

            <div className="relative h-[600px] w-full border border-slate-200 rounded-lg bg-slate-50">
                <div className="absolute top-4 left-4 z-10 bg-white p-2 rounded shadow border border-slate-200 flex items-center gap-2">
                    <label className="text-sm font-medium text-slate-700">Edge Style:</label>
                    <select
                        value={edgeType}
                        onChange={(e) => setEdgeType(e.target.value as any)}
                        className="text-sm border-slate-300 rounded focus:ring-blue-500 focus:border-blue-500 p-1"
                    >
                        <option value="default">Bezier</option>
                        <option value="straight">Straight</option>
                        <option value="step">Step</option>
                        <option value="smoothstep">Smooth Step</option>
                    </select>
                </div>
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                    <button
                        onClick={() => downloadImage('png')}
                        className="bg-white p-2 rounded shadow border border-slate-200 hover:bg-slate-50 text-slate-600 flex items-center gap-1 text-sm font-medium"
                        title="Export as PNG"
                    >
                        <Download className="w-4 h-4" /> PNG
                    </button>
                    <button
                        onClick={() => downloadImage('svg')}
                        className="bg-white p-2 rounded shadow border border-slate-200 hover:bg-slate-50 text-slate-600 flex items-center gap-1 text-sm font-medium"
                        title="Export as SVG"
                    >
                        <Download className="w-4 h-4" /> SVG
                    </button>
                    {!readOnly && (
                        <>
                            <div className="flex bg-white rounded shadow border border-slate-200 mr-2">
                                <button onClick={() => alignNodes('left')} className="p-2 hover:bg-slate-50 text-slate-600" title="Align Left"><AlignHorizontalJustifyStart className="w-4 h-4" /></button>
                                <button onClick={() => alignNodes('center')} className="p-2 hover:bg-slate-50 text-slate-600" title="Align Center"><AlignHorizontalJustifyCenter className="w-4 h-4" /></button>
                                <button onClick={() => alignNodes('right')} className="p-2 hover:bg-slate-50 text-slate-600" title="Align Right"><AlignHorizontalJustifyEnd className="w-4 h-4" /></button>
                                <div className="w-px bg-slate-200 mx-1"></div>
                                <button onClick={() => alignNodes('top')} className="p-2 hover:bg-slate-50 text-slate-600" title="Align Top"><AlignVerticalJustifyStart className="w-4 h-4" /></button>
                                <button onClick={() => alignNodes('middle')} className="p-2 hover:bg-slate-50 text-slate-600" title="Align Middle"><AlignVerticalJustifyCenter className="w-4 h-4" /></button>
                                <button onClick={() => alignNodes('bottom')} className="p-2 hover:bg-slate-50 text-slate-600" title="Align Bottom"><AlignVerticalJustifyEnd className="w-4 h-4" /></button>
                            </div>
                            <button
                                onClick={() => setShowFilter(!showFilter)}
                                className={`p-2 rounded-md shadow-sm border ${showFilter ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-600'} hover:bg-slate-50`}
                                title="Filter Components"
                            >
                                <Filter className="w-5 h-5" />
                            </button>
                        </>
                    )}
                </div>

                {showFilter && (
                    <div className="absolute top-16 right-4 z-10 w-80 bg-white p-4 rounded-lg shadow-lg border border-slate-200">
                        <h3 className="font-medium mb-2 text-slate-700">Filter Components</h3>
                        <DualListBox
                            available={allComponents || []}
                            selected={(allComponents || []).filter((c: any) => selectedComponentIds.includes(c.id))}
                            onChange={(selected) => {
                                const newIds = selected.map((c: any) => c.id);

                                if (diagramId) {
                                    // Find added/removed IDs
                                    const added = newIds.filter(id => !selectedComponentIds.includes(id));
                                    const removed = selectedComponentIds.filter(id => !newIds.includes(id));

                                    added.forEach(id => toggleComponentInDiagramMutation.mutate({ componentId: id, action: 'add' }));
                                    removed.forEach(id => toggleComponentInDiagramMutation.mutate({ componentId: id, action: 'remove' }));
                                }

                                setSelectedComponentIds(newIds);
                            }}
                            getKey={(item: any) => item.id}
                            getLabel={(item: any) => item.name}
                            availableLabel="Hidden"
                            selectedLabel="Visible"
                            height="h-48"
                        />
                    </div>
                )}

                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onEdgeUpdate={onEdgeUpdate}
                    onNodeDragStop={onNodeDragStop}
                    fitView
                    attributionPosition="bottom-right"
                >
                    <MiniMap />
                    <Controls />
                    <Background color="#cbd5e1" gap={16} />
                </ReactFlow>
            </div>
        </div>
    );
}
