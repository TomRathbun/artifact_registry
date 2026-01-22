import React, { useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    reconnectEdge,
    type Connection,
    type Edge,
    type Node,
    Position,
    MarkerType,
    type NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import axios from 'axios';
import { toPng, toSvg } from 'html-to-image';
import { Download, Search, Check, X, Plus, List, Link as LinkIcon, Save, Camera } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import MultiHandleNode from './MultiHandleNode';
import {
    VisionService,
    NeedsService,
    UseCaseService,
    RequirementService,
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
    onSave?: (filterData: any) => void;
}

const ArtifactGraphView: React.FC<ArtifactGraphViewProps> = ({ initialArea = 'All', diagramId }) => {
    const { projectId } = useParams<{ projectId: string }>();
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const nodeTypes = useMemo<NodeTypes>(() => ({ custom: MultiHandleNode }), []);

    const [selectedArea, setSelectedArea] = React.useState<string>(initialArea);
    const [edgeType, setEdgeType] = React.useState<'default' | 'straight' | 'step' | 'smoothstep'>('smoothstep');
    const [selectedAids, setSelectedAids] = React.useState<Set<string>>(new Set());
    const [isSelectModalOpen, setIsSelectModalOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [hasLoadedInitial, setHasLoadedInitial] = React.useState(false);
    const [isCapturing, setIsCapturing] = React.useState(false);
    const [captureStatus, setCaptureStatus] = React.useState<'idle' | 'success' | 'error'>('idle');
    const [pngStatus, setPngStatus] = React.useState<'idle' | 'success' | 'error'>('idle');

    const { data: diagram } = useQuery({
        queryKey: ['diagram', diagramId],
        queryFn: async () => {
            if (!diagramId) return null;
            const resp = await axios.get(`/api/v1/diagrams/${diagramId}`);
            return resp.data;
        },
        enabled: !!diagramId
    });

    useEffect(() => {
        if (diagram && !hasLoadedInitial) {
            if (diagram.filter_data?.selection) {
                setSelectedAids(new Set(diagram.filter_data.selection));
            }
            if (diagram.filter_data?.area) {
                setSelectedArea(diagram.filter_data.area);
            }
            if (diagram.filter_data?.edges) {
                // Restore edges with handles if available
                // We will handle edge merging in the main useEffect
            }
            setHasLoadedInitial(true);
        }
    }, [diagram]);

    useEffect(() => {
        if (!diagramId) setSelectedArea(initialArea);
    }, [initialArea, diagramId]);

    const { data: project } = useQuery({
        queryKey: ['project', projectId],
        queryFn: () => ProjectsService.getProjectApiV1ProjectsProjectsProjectIdGet(projectId!),
        enabled: !!projectId
    });

    const realProjectId = project?.id;

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

    const { data: documents } = useQuery({
        queryKey: ['documents', realProjectId],
        queryFn: async () => {
            const resp = await axios.get('/api/v1/documents/', { params: { project_id: realProjectId } });
            return resp.data;
        },
        enabled: !!realProjectId
    });

    const { data: diagrams } = useQuery({
        queryKey: ['diagrams', realProjectId],
        queryFn: async () => {
            const resp = await axios.get(`/api/v1/projects/${projectId}/diagrams`);
            return resp.data;
        },
        enabled: !!projectId
    });

    const { data: linkages } = useQuery({
        queryKey: ['linkages', realProjectId],
        queryFn: async () => {
            const resp = await axios.get('/api/v1/linkage/linkages/', { params: { project_id: realProjectId } });
            return resp.data;
        },
        enabled: !!realProjectId
    });

    const { data: areas } = useQuery({
        queryKey: ['areas', realProjectId],
        queryFn: () => MetadataService.listAreasApiV1MetadataMetadataAreasGet(realProjectId),
    });

    useEffect(() => {
        if (!visions || !needs || !useCases || !requirements || !linkages) return;

        const createNode = (id: string, label: string, color: string, shortId?: string, description?: string) => {
            const savedPos = diagram?.filter_data?.positions?.[id];
            return {
                id,
                type: 'custom',
                data: {
                    color: color,
                    label: (
                        <div className="flex flex-col items-center text-center w-full h-full">
                            {shortId === 'DIAGRAM' ? (
                                <>
                                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Diagram</div>
                                    <div className="font-bold text-slate-800 leading-tight">{label}</div>
                                    {description && <div className="text-[10px] text-slate-500 mt-1 line-clamp-2 italic">{description}</div>}
                                </>
                            ) : (
                                <>
                                    <div className="font-bold text-blue-600 mb-0.5">{shortId || id}</div>
                                    <div className="text-slate-700 leading-tight">{label}</div>
                                    {description && <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">{description}</div>}
                                </>
                            )}
                        </div>
                    )
                },
                position: savedPos || { x: 0, y: 0 },
                style: {
                    background: 'transparent', // Will be handled by inner component
                    border: 'none',
                    padding: 0,
                    width: nodeWidth,
                    minHeight: nodeHeight,
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                },
            };
        };

        // 1. Gather all potential nodes (WITHOUT area filtering yet)
        const allPotentialNodes: Node[] = [
            ...visions.map((v: any) => createNode(v.aid || v.id || 'VIS', v.title, '#8b5cf6')),
            ...needs.map((n: any) => createNode(n.aid, n.title, '#f59e0b', undefined, n.description)),
            ...useCases.map((u: any) => createNode(u.aid, u.title, '#3b82f6', undefined, u.description)),
            ...requirements.map((r: any) => createNode(r.aid, r.short_name, '#10b981', undefined, r.description)),
            ...(documents || []).map((d: any) => createNode(d.aid, d.title, '#64748b', undefined, d.description)),
            ...(diagrams || []).filter((d: any) => d.id !== diagramId).map((d: any) => createNode(d.id, d.name, '#e11d48', 'DIAGRAM', d.description))
        ];

        let finalNodeIds = new Set<string>();

        // 2. Determine which nodes to show
        if (selectedAids.size > 0) {
            // Strict selection ignores area filter
            selectedAids.forEach(aid => finalNodeIds.add(aid));
        } else {
            // Fallback to area filtering
            const filterArtifactByArea = (a: any) => selectedArea === 'All' || a.area === selectedArea;

            visions.filter(filterArtifactByArea).forEach((v: any) => finalNodeIds.add(v.aid || v.id || 'VIS'));
            needs.filter(filterArtifactByArea).forEach((n: any) => finalNodeIds.add(n.aid));
            useCases.filter(filterArtifactByArea).forEach((u: any) => finalNodeIds.add(u.aid));
            requirements.filter(filterArtifactByArea).forEach((r: any) => finalNodeIds.add(r.aid));
            (documents || []).filter(filterArtifactByArea).forEach((d: any) => finalNodeIds.add(d.aid));
            (diagrams || []).filter((d: any) => d.id !== diagramId).forEach((d: any) => finalNodeIds.add(d.id));
        }

        const newNodes = allPotentialNodes.filter(n => finalNodeIds.has(n.id));
        const newEdges: Edge[] = [];
        const nodesInGraph = new Set(newNodes.map(n => n.id));
        const processedLinkEdges = new Set<string>();

        // Load edge handles from saved diagram if available
        const savedEdges = diagram?.filter_data?.edges || {};

        linkages.forEach((l: any) => {
            const uniqueKey = l.aid || `${l.source_id}-${l.target_id}-${l.relationship_type}`;
            const edgeId = `e${uniqueKey}`;

            if (nodesInGraph.has(l.source_id) && nodesInGraph.has(l.target_id) && !processedLinkEdges.has(uniqueKey)) {
                processedLinkEdges.add(uniqueKey);

                const savedEdge = savedEdges[edgeId];

                newEdges.push({
                    id: edgeId,
                    source: l.source_id,
                    target: l.target_id,
                    type: edgeType,
                    sourceHandle: savedEdge?.sourceHandle || undefined,
                    targetHandle: savedEdge?.targetHandle || undefined,
                    label: l.relationship_type,
                    labelStyle: { fill: '#475569', fontWeight: 700, fontSize: 10, fontFamily: 'sans-serif' },
                    labelBgStyle: { fill: '#f8fafc', fillOpacity: 1 },
                    labelBgPadding: [4, 6],
                    labelBgBorderRadius: 4,
                    markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
                    animated: true,
                    style: { stroke: '#94a3b8' },
                    reconnectable: true,
                    zIndex: 1
                });
            }
        });

        // 3. Layout calculation (only run if no saved positions for all nodes)
        const hasSavedPositions = newNodes.some(n => diagram?.filter_data?.positions?.[n.id]);

        if (hasSavedPositions) {
            setNodes(newNodes);
            setEdges(newEdges);
        } else {
            const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(newNodes, newEdges);
            setNodes(layoutedNodes);
            setEdges(layoutedEdges);
        }

    }, [visions, needs, useCases, requirements, documents, diagrams, linkages, setNodes, setEdges, selectedArea, edgeType, selectedAids, diagram, hasLoadedInitial]);

    useEffect(() => {
        const needsUpdate = edges.some(e => (e.selected && (e.zIndex || 0) < 1000) || (!e.selected && e.zIndex === 1000));
        if (needsUpdate) {
            setEdges(eds => eds.map(e => ({
                ...e,
                zIndex: e.selected ? 1000 : 1
            })));
        }
    }, [edges, setEdges]);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    const onReconnect = useCallback(
        (oldEdge: Edge, newConnection: Connection) => {
            setEdges((els) => reconnectEdge(oldEdge, newConnection, els));
        },
        [setEdges]
    );

    const saveMutation = useMutation({
        mutationFn: async () => {
            if (!diagramId) return;
            const positions: Record<string, { x: number; y: number }> = {};
            nodes.forEach(n => {
                positions[n.id] = { x: n.position.x, y: n.position.y };
            });

            const edgesData: Record<string, { sourceHandle?: string | null; targetHandle?: string | null }> = {};
            edges.forEach(e => {
                edgesData[e.id] = { sourceHandle: e.sourceHandle, targetHandle: e.targetHandle };
            });

            const filterData = {
                area: selectedArea,
                selection: Array.from(selectedAids),
                positions,
                edges: edgesData
            };

            await axios.put(`/api/v1/diagrams/${diagramId}`, { filter_data: filterData });
        }
    });

    const handleAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newArea = e.target.value;
        setSelectedArea(newArea);
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
                if (node.classList && (node.classList.contains('react-flow__minimap') || node.classList.contains('react-flow__controls'))) return false;
                return true;
            }
        };
        if (format === 'png') toPng(flowElement, options).then(download);
        else toSvg(flowElement, options).then(download);
    };

    const handleCaptureToGallery = async () => {
        const flowElement = document.querySelector('.react-flow') as HTMLElement;
        if (!flowElement) return;

        setIsCapturing(true);
        setCaptureStatus('idle');

        try {
            const dataUrl = await toPng(flowElement, {
                backgroundColor: '#fff',
                filter: (node: HTMLElement) => {
                    if (node.classList && (node.classList.contains('react-flow__minimap') || node.classList.contains('react-flow__controls'))) return false;
                    return true;
                }
            });

            // Convert dataUrl to Blob
            const res = await fetch(dataUrl);
            const blob = await res.blob();
            const file = new File([blob], `graph-${diagram?.name || 'capture'}-${Date.now()}.png`, { type: 'image/png' });

            const formData = new FormData();
            formData.append('file', file);

            const uploadResp = await axios.post('/api/v1/documents/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const imageUrl = uploadResp.data.url;
            const markdownLink = `![${diagram?.name || 'Artifact Graph'}](${imageUrl})`;

            await navigator.clipboard.writeText(markdownLink);

            setCaptureStatus('success');
            setTimeout(() => setCaptureStatus('idle'), 3000);
        } catch (err) {
            console.error("Capture failed:", err);
            setCaptureStatus('error');
        } finally {
            setIsCapturing(false);
        }
    };

    const handleClipboardPNG = async () => {
        const flowElement = document.querySelector('.react-flow') as HTMLElement;
        if (!flowElement) return;

        setPngStatus('idle');
        try {
            const dataUrl = await toPng(flowElement, {
                backgroundColor: '#fff',
                filter: (node: HTMLElement) => {
                    if (node.classList && (node.classList.contains('react-flow__minimap') || node.classList.contains('react-flow__controls'))) return false;
                    return true;
                }
            });

            const res = await fetch(dataUrl);
            const blob = await res.blob();

            await navigator.clipboard.write([
                new ClipboardItem({
                    [blob.type]: blob
                })
            ]);

            setPngStatus('success');
            setTimeout(() => setPngStatus('idle'), 3000);
        } catch (err) {
            console.error("Clipboard PNG failed:", err);
            setPngStatus('error');
        }
    };

    // Calculate linkage context for the modal
    const linkedToSelection = React.useMemo(() => {
        const linked = new Set<string>();
        if (!linkages || selectedAids.size === 0) return linked;

        linkages.forEach((l: any) => {
            if (selectedAids.has(l.source_id)) linked.add(l.target_id);
            if (selectedAids.has(l.target_id)) linked.add(l.source_id);
        });
        return linked;
    }, [linkages, selectedAids]);

    return (
        <div className="h-[calc(100vh-100px)] w-full bg-slate-50 border rounded-lg shadow-inner relative">
            <div className="absolute top-4 left-4 z-10 flex gap-2">
                <div className="bg-white p-2 rounded shadow border border-slate-200 flex items-center gap-2">
                    <label className="text-sm font-medium text-slate-700">Area:</label>
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

                <div className="bg-white p-2 rounded shadow border border-slate-200 flex items-center gap-2">
                    <button
                        onClick={() => setIsSelectModalOpen(true)}
                        className="flex items-center gap-2 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-sm font-medium transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        {selectedAids.size > 0 ? `${selectedAids.size} Selected` : 'Select Artifacts'}
                    </button>
                    {selectedAids.size > 0 && (
                        <div className="flex items-center gap-1 border-l pl-2 ml-1">
                            <button
                                onClick={() => setSelectedAids(new Set())}
                                className="text-xs text-slate-500 hover:text-red-500 font-medium px-1"
                            >
                                Clear
                            </button>
                        </div>
                    )}
                </div>

                {diagramId && (
                    <button
                        onClick={() => saveMutation.mutate()}
                        disabled={saveMutation.isPending}
                        className={`flex items-center gap-2 px-4 py-2 rounded shadow border text-sm font-medium transition-all ${saveMutation.isSuccess ? 'bg-green-500 text-white border-green-600' : 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700'}`}
                    >
                        <Save className="w-4 h-4" />
                        {saveMutation.isPending ? 'Saving...' : saveMutation.isSuccess ? 'Saved!' : 'Save Layout'}
                    </button>
                )}

                <div className="bg-white p-2 rounded shadow border border-slate-200 flex items-center gap-2">
                    <label className="text-sm font-medium text-slate-700">Style:</label>
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
            </div>

            <div className="absolute top-4 right-4 z-10 flex gap-2">
                <button
                    onClick={handleCaptureToGallery}
                    disabled={isCapturing}
                    className={`p-2 rounded shadow border text-white transition-all flex items-center gap-2 ${captureStatus === 'success' ? 'bg-green-500 border-green-600' : captureStatus === 'error' ? 'bg-red-500 border-red-600' : 'bg-slate-800 border-slate-900 hover:bg-slate-700'}`}
                    title="Capture to Gallery and Copy Markdown"
                >
                    <Camera className={`w-4 h-4 ${isCapturing ? 'animate-pulse' : ''}`} />
                    <span className="text-sm font-medium">
                        {isCapturing ? 'MD...' : captureStatus === 'success' ? 'Copied!' : 'MD'}
                    </span>
                </button>
                <button
                    onClick={handleClipboardPNG}
                    className={`p-2 rounded shadow border text-white transition-all flex items-center gap-2 ${pngStatus === 'success' ? 'bg-green-500 border-green-600' : pngStatus === 'error' ? 'bg-red-500 border-red-600' : 'bg-slate-800 border-slate-900 hover:bg-slate-700'}`}
                    title="Capture to Clipboard as PNG"
                >
                    <Camera className="w-4 h-4" />
                    <span className="text-sm font-medium">
                        {pngStatus === 'success' ? 'Copied!' : 'PNG'}
                    </span>
                </button>
                <button onClick={() => downloadImage('png')} className="bg-white p-2 rounded shadow border border-slate-200 hover:bg-slate-50 text-slate-600 flex items-center gap-1 text-sm font-medium" title="Download as PNG"><Download className="w-4 h-4" /> File</button>
                <button onClick={() => downloadImage('svg')} className="bg-white p-2 rounded shadow border border-slate-200 hover:bg-slate-50 text-slate-600 flex items-center gap-1 text-sm font-medium" title="Download as SVG"><Download className="w-4 h-4" /> SVG</button>
            </div>

            {/* Selection Modal */}
            {isSelectModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-8">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl h-[600px] flex flex-col overflow-hidden">
                        <div className="p-4 border-b flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <List className="w-5 h-5" />
                                Select Artifacts to Display
                            </h3>
                            <button onClick={() => setIsSelectModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-4 border-b">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name or AID..."
                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {[
                                ...(visions || []).map((v: any) => ({ id: v.aid || v.id || 'VIS', name: v.title, type: 'Vision', color: 'bg-purple-100 text-purple-700' })),
                                ...(needs || []).map((n: any) => ({ id: n.aid, name: n.title, type: 'Need', color: 'bg-amber-100 text-amber-700' })),
                                ...(useCases || []).map((u: any) => ({ id: u.aid, name: u.title, type: 'Use Case', color: 'bg-blue-100 text-blue-700' })),
                                ...(requirements || []).map((r: any) => ({ id: r.aid, name: r.short_name, type: 'Requirement', color: 'bg-emerald-100 text-emerald-700' })),
                                ...(documents || []).map((d: any) => ({ id: d.aid, name: d.title, type: 'Document', color: 'bg-slate-100 text-slate-700' })),
                                ...(diagrams || []).map((d: any) => ({ id: d.id, name: d.name, type: 'Diagram', color: 'bg-rose-100 text-rose-700' }))
                            ]
                                .filter(a =>
                                    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    a.id.toLowerCase().includes(searchQuery.toLowerCase())
                                )
                                .map((item: any) => {
                                    const isLinked = linkedToSelection.has(item.id);
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                const next = new Set(selectedAids);
                                                if (next.has(item.id)) next.delete(item.id);
                                                else next.add(item.id);
                                                setSelectedAids(next);
                                            }}
                                            className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors border-2 ${selectedAids.has(item.id) ? 'bg-blue-50 border-blue-500 shadow-sm' : isLinked ? 'bg-slate-50 border-blue-200 border-dashed' : 'hover:bg-slate-50 border-transparent'}`}
                                        >
                                            <div className={`flex-shrink-0 w-5 h-5 border rounded flex items-center justify-center ${selectedAids.has(item.id) ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'}`}>
                                                {selectedAids.has(item.id) && <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${item.color}`}>{item.type}</span>
                                                    <span className="text-xs font-mono text-slate-500">{item.id.length > 20 ? item.id.substring(0, 8) + '...' : item.id}</span>
                                                    {isLinked && !selectedAids.has(item.id) && (
                                                        <span className="text-[10px] text-blue-600 font-bold flex items-center gap-0.5">
                                                            <LinkIcon className="w-3 h-3" /> Linked
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm font-medium text-slate-700 truncate">{item.name}</div>
                                            </div>
                                        </button>
                                    );
                                })}
                        </div>

                        <div className="p-4 border-t bg-slate-50 flex justify-between items-center">
                            <span className="text-sm text-slate-500">{selectedAids.size} artifacts selected</span>
                            <button
                                onClick={() => setIsSelectModalOpen(false)}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-shadow shadow-md"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onReconnect={onReconnect}
                edgeUpdaterRadius={20}
                nodeTypes={nodeTypes}
                fitView
                elevateEdgesOnSelect={true}
                attributionPosition="bottom-right"
            >
                <Controls />
                <MiniMap />
                <Background gap={12} size={1} />
            </ReactFlow>
        </div>
    );
};

export default ArtifactGraphView;
