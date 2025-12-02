import { useCallback, useMemo, useState, useEffect } from 'react';
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
import { Filter } from 'lucide-react';
import { useParams } from 'react-router-dom';
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

            <div>{data.label}</div>
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

export default function ComponentDiagram() {
    const { diagramId } = useParams<{ diagramId: string }>();
    const queryClient = useQueryClient();
    const [showFilter, setShowFilter] = useState(false);
    const [selectedComponentIds, setSelectedComponentIds] = useState<string[]>([]);

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
            const response = await axios.get(`http://localhost:8000/api/v1/diagrams/${diagramId}`);
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
                await axios.put(`http://localhost:8000/api/v1/diagrams/${diagramId}/components/${id}`, {
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
                await axios.put(`http://localhost:8000/api/v1/diagrams/${diagramId}/components/${componentId}`, {
                    x: 0,
                    y: 0
                });
            } else {
                await axios.delete(`http://localhost:8000/api/v1/diagrams/${diagramId}/components/${componentId}`);
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
                `http://localhost:8000/api/v1/diagrams/${diagramId}/edges`,
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
                data: { label: comp.name, description: comp.description },
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
                            type: 'smoothstep',
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
        setEdges(initialEdges);
    }, [initialNodes, initialEdges, setNodes, setEdges]);

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
                <div className="absolute top-4 right-4 z-10">
                    <button
                        onClick={() => setShowFilter(!showFilter)}
                        className={`p-2 rounded-md shadow-sm border ${showFilter ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-600'} hover:bg-slate-50`}
                        title="Filter Components"
                    >
                        <Filter className="w-5 h-5" />
                    </button>
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
