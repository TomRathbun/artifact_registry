import React, { useCallback, useEffect } from 'react';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    type Connection,
    type Edge,
    type Node,
    Position,
    MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import axios from 'axios';
import { toPng, toSvg } from 'html-to-image';
import { Download } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import {
    VisionService,
    NeedsService,
    UseCaseService,
    RequirementService,
    LinkagesService,
    MetadataService,
    ProjectsService
} from '../client';

const nodeWidth = 250;
const nodeHeight = 80;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'LR') => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    nodes.forEach((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        node.targetPosition = direction === 'LR' ? Position.Left : Position.Top;
        node.sourcePosition = direction === 'LR' ? Position.Right : Position.Bottom;

        // We are shifting the dagre node position (anchor=center center) to the top left
        // so it matches the React Flow node anchor point (top left).
        node.position = {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
        };

        return node;
    });

    return { nodes, edges };
};

interface ArtifactGraphViewProps {
    initialArea?: string;
    diagramId?: string;
}

const ArtifactGraphView: React.FC<ArtifactGraphViewProps> = ({ initialArea = 'All', diagramId }) => {
    const { projectId } = useParams<{ projectId: string }>();
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const [selectedArea, setSelectedArea] = React.useState<string>(initialArea);
    const [edgeType, setEdgeType] = React.useState<'default' | 'straight' | 'step' | 'smoothstep'>('smoothstep');

    useEffect(() => {
        setSelectedArea(initialArea);
    }, [initialArea]);

    // Fetch project details first to get the real UUID
    const { data: project } = useQuery({
        queryKey: ['project', projectId],
        queryFn: () => ProjectsService.getProjectApiV1ProjectsProjectsProjectIdGet(projectId!),
        enabled: !!projectId
    });

    const realProjectId = project?.id;

    // Fetch all artifacts
    const { data: visions } = useQuery({
        queryKey: ['visions', realProjectId],
        queryFn: () => VisionService.listVisionStatementsApiV1VisionVisionStatementsGet(realProjectId!),
        enabled: !!realProjectId
    });

    const { data: needs } = useQuery({
        queryKey: ['needs', realProjectId],
        queryFn: () => NeedsService.listNeedsApiV1NeedNeedsGet(realProjectId!),
        enabled: !!realProjectId
    });

    const { data: useCases } = useQuery({
        queryKey: ['useCases', realProjectId],
        queryFn: () => UseCaseService.listUseCasesApiV1UseCaseUseCasesGet(realProjectId!),
        enabled: !!realProjectId
    });

    const { data: requirements } = useQuery({
        queryKey: ['requirements', realProjectId],
        queryFn: () => RequirementService.listRequirementsApiV1RequirementRequirementsGet(realProjectId!),
        enabled: !!realProjectId
    });

    const { data: linkages } = useQuery({
        queryKey: ['linkages'],
        queryFn: () => LinkagesService.listLinkagesApiV1LinkageLinkagesGet(),
    });

    const { data: areas } = useQuery({
        queryKey: ['areas'],
        queryFn: () => MetadataService.listAreasApiV1MetadataMetadataAreasGet(),
    });

    useEffect(() => {
        if (!visions || !needs || !useCases || !requirements || !linkages) return;

        const newNodes: Node[] = [];
        const newEdges: Edge[] = [];

        // Helper to create node
        const createNode = (id: string, label: string, color: string) => ({
            id,
            data: { label: <div><strong>{id}</strong><br />{label.length > 30 ? label.substring(0, 30) + '...' : label}</div> },
            position: { x: 0, y: 0 }, // Initial position, will be set by dagre
            style: {
                background: '#fff',
                border: `1px solid ${color}`,
                borderRadius: '5px',
                padding: '10px',
                width: nodeWidth,
                fontSize: '12px',
                borderLeft: `5px solid ${color}`
            },
        });

        const filterArtifact = (a: any) => selectedArea === 'All' || a.area === selectedArea;

        // Process Visions (Global - always show)
        visions.forEach((v: any) => {
            newNodes.push(createNode(v.aid || `VIS-${v.id}`, v.title, '#8b5cf6')); // Purple
        });

        // Process Needs
        needs.filter(filterArtifact).forEach((n: any) => {
            newNodes.push(createNode(n.aid, n.title, '#f59e0b')); // Amber
        });

        // Process Use Cases
        useCases.filter(filterArtifact).forEach((u: any) => {
            newNodes.push(createNode(u.aid, u.title, '#3b82f6')); // Blue
        });

        // Process Requirements
        requirements.filter(filterArtifact).forEach((r: any) => {
            newNodes.push(createNode(r.aid, r.short_name, '#10b981')); // Emerald
        });

        // Process Linkages
        const artifactIds = new Set(newNodes.map(n => n.id));
        const processedLinkages = new Set<string>();

        linkages.forEach((l: any) => {
            // Ensure we only process unique linkages and those where both endpoints exist in the graph
            // Use a composite key as fallback if aid is missing, though aid should be present
            const uniqueKey = l.aid || `${l.source_id}-${l.target_id}-${l.relationship_type}`;

            if (artifactIds.has(l.source_id) && artifactIds.has(l.target_id) && !processedLinkages.has(uniqueKey)) {
                processedLinkages.add(uniqueKey);
                newEdges.push({
                    id: `e${uniqueKey}`,
                    source: l.source_id,
                    target: l.target_id,
                    type: edgeType,
                    label: l.relationship_type, // Show relationship type on edge
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                    },
                    animated: true,
                    style: { stroke: '#94a3b8' }
                });
            }
        });

        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
            newNodes,
            newEdges
        );

        setNodes(layoutedNodes);
        setEdges(layoutedEdges);

    }, [visions, needs, useCases, requirements, linkages, setNodes, setEdges, selectedArea, edgeType]);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    const updateMutation = useMutation({
        mutationFn: async (newArea: string) => {
            if (!diagramId) return;
            // We need to fetch the current diagram details first to preserve name/desc
            // Or the backend supports partial updates? The backend updates only provided fields.
            // But wait, the backend update endpoint updates name/desc/filter_data if provided.
            // So we can just send filter_data.
            await axios.put(`/api/v1/diagrams/${diagramId}`, {
                filter_data: { area: newArea }
            });
        },
        onSuccess: () => {
            // queryClient.invalidateQueries({ queryKey: ['diagram', diagramId] }); // Optional, local state is enough
        }
    });

    const handleAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newArea = e.target.value;
        setSelectedArea(newArea);
        if (diagramId) {
            updateMutation.mutate(newArea);
        }
    };

    const downloadImage = (format: 'png' | 'svg') => {
        const flowElement = document.querySelector('.react-flow') as HTMLElement;
        if (!flowElement) return;

        const download = (dataUrl: string) => {
            const a = document.createElement('a');
            a.setAttribute('download', `artifact-graph.${format}`);
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

    return (
        <div className="h-[calc(100vh-100px)] w-full bg-slate-50 border rounded-lg shadow-inner relative">
            <div className="absolute top-4 left-4 z-10 bg-white p-2 rounded shadow border border-slate-200 flex items-center gap-2">
                <label className="text-sm font-medium text-slate-700">Filter by Area:</label>
                <select
                    value={selectedArea}
                    onChange={handleAreaChange}
                    className="text-sm border-slate-300 rounded focus:ring-blue-500 focus:border-blue-500 p-1"
                >
                    <option value="All">All Areas</option>
                    {areas?.map((area: any) => (
                        <option key={area.code} value={area.code}>{area.name}</option>
                    ))}
                </select>
            </div>
            <div className="absolute top-4 left-64 z-10 bg-white p-2 rounded shadow border border-slate-200 flex items-center gap-2">
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
            </div>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
                attributionPosition="bottom-right"
            >
                <Controls />
                <MiniMap />
                <Background gap={12} size={1} />
            </ReactFlow>
        </div >
    );
};

export default ArtifactGraphView;
