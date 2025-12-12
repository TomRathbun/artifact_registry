import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import MarkdownDisplay from './MarkdownDisplay';
import { NeedsService, UseCasesService, RequirementsService, VisionService, LinkageService, ProjectsService } from '../client';
import { ArrowLeft, Edit, ExternalLink, X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, MessageSquarePlus, MessageSquare, Tag } from 'lucide-react';
import ComponentDiagram from './ComponentDiagram';
import ArtifactGraphView from './ArtifactGraphView';
import SequenceDiagramEditor from './SequenceDiagramEditor';
import CommentPanel from './CommentPanel';

// Component to fetch and display person name by ID
function PersonName({ personId }: { personId: string }) {
    const { data: people } = useQuery({
        queryKey: ['people'],
        queryFn: async () => {
            const response = await fetch(`/api/v1/metadata/metadata/people`);
            return response.ok ? await response.json() : [];
        },
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });

    const person = people?.find((p: any) => p.id === personId);
    return <span className="text-slate-900">{person?.name || personId}</span>;
}


// Component to fetch and display human-readable name for a linked artifact
function LinkedArtifactName({ link, onClick }: { link: any; onClick: () => void }) {
    const { data: artifact } = useQuery({
        queryKey: ['linkedArtifact', link.target_artifact_type, link.target_id],
        queryFn: async () => {
            if (link.target_artifact_type === 'url') return null;

            switch (link.target_artifact_type) {
                case 'vision':
                    return await VisionService.getVisionStatementApiV1VisionVisionStatementsAidGet(link.target_id);
                case 'need':
                    return await NeedsService.getNeedApiV1NeedNeedsAidGet(link.target_id);
                case 'use_case':
                    return await UseCasesService.getUseCaseApiV1UseCaseUseCasesAidGet(link.target_id);
                case 'requirement':
                    return await RequirementsService.getRequirementApiV1RequirementRequirementsAidGet(link.target_id);
                case 'diagram':
                    const diagResponse = await fetch(`/api/v1/diagrams/${link.target_id}`);
                    return diagResponse.ok ? await diagResponse.json() : null;
                case 'component':
                    const compResponse = await fetch(`/api/v1/components/${link.target_id}`);
                    return compResponse.ok ? await compResponse.json() : null;
                default:
                    return null;
            }
        },
        enabled: !!link.target_id && link.target_artifact_type !== 'url',
    });

    const getDisplayName = () => {
        if (link.target_artifact_type === 'url') {
            return link.target_id;
        }
        if (!artifact) {
            return link.target_id; // Fallback to ID while loading
        }
        // Get title or name from artifact
        if ('title' in artifact && artifact.title) return artifact.title;
        if ('name' in artifact && artifact.name) return artifact.name;
        if ('text' in artifact && artifact.text) return artifact.text;
        return link.target_id;
    };

    if (link.target_artifact_type === 'url') {
        return (
            <a
                href={link.target_id}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline flex items-center gap-1"
            >
                {getDisplayName()}
                <ExternalLink className="w-3 h-3" />
            </a>
        );
    }

    return (
        <button
            onClick={onClick}
            className="text-blue-600 hover:underline text-left whitespace-normal break-words h-auto"
        >
            {getDisplayName()}
        </button>
    );
}

// Compact linkages component for presentation mode
function CompactLinkages({
    artifactId,
    onLinkClick
}: {
    artifactId: string;
    onLinkClick: (link: any) => void;
}) {
    const { data: linkages } = useQuery({
        queryKey: ['linkages', artifactId],
        queryFn: () => LinkageService.getOutgoingLinkagesApiV1LinkageLinkagesFromSourceAidGet(artifactId),
        enabled: !!artifactId,
    });

    if (!linkages || linkages.length === 0) {
        return null;
    }

    return (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm px-6 py-3">
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                {linkages.map((link) => (
                    <div key={link.aid} className="flex items-center gap-2 min-w-0 max-w-full">
                        <span className="text-slate-500 whitespace-nowrap flex-shrink-0">{link.relationship_type}:</span>
                        <div className="min-w-0 flex-1">
                            <LinkedArtifactName link={link} onClick={() => onLinkClick(link)} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}




// Wrapper component to make fields clickable for commenting
function SelectableField({
    fieldId,
    label,
    children,
    isActive,
    onClick
}: {
    fieldId: string;
    label: string;
    children: React.ReactNode;
    isActive: boolean;
    onClick: (id: string) => void;
}) {
    return (
        <div
            data-field-name={fieldId}
            onClick={(e) => {
                e.stopPropagation();
                onClick(fieldId);
            }}
            className={`
                relative group rounded-md transition-all duration-200
                ${isActive
                    ? 'ring-2 ring-blue-500 bg-blue-50/50 -m-2 p-2'
                    : 'hover:bg-slate-50 -m-2 p-2 cursor-pointer border border-transparent hover:border-slate-200'
                }
            `}
        >
            <div className="flex items-center justify-between mb-1">
                {/* Always show label if provided, or if active/hovered to indicate what this field is */}
                {(label || isActive) && (
                    <span className={`text-xs font-semibold uppercase tracking-wider ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                        {label}
                    </span>
                )}

                {/* Comment icon that appears on hover or when active */}
                <div className={`
                    opacity-0 group-hover:opacity-100 transition-opacity
                    ${isActive ? 'opacity-100 text-blue-600' : 'text-slate-400'}
                `}>
                    <MessageSquarePlus className="w-4 h-4" />
                </div>
            </div>

            {children}
        </div>
    );
}

// ... existing helper components (PersonName, LinkedArtifactName, CompactLinkages) ...

export default function ArtifactPresentation() {
    const { projectId, artifactType, artifactId } = useParams<{ projectId: string; artifactType: string; artifactId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();
    const [selectedLink, setSelectedLink] = useState<any | null>(null);
    const [selectedField, setSelectedField] = useState<string | null>(null);
    const [zoomLevel, setZoomLevel] = useState(100);
    const [showComments, setShowComments] = useState(true);
    const [showStatusDialog, setShowStatusDialog] = useState(false);
    const [pendingStatus, setPendingStatus] = useState<string>('');
    const [statusRationale, setStatusRationale] = useState('');
    const [selectedText, setSelectedText] = useState<string | null>(null);
    const [highlightedField, setHighlightedField] = useState<string | null>(null);

    // Effect to handle highlighting fields when comments are focused
    useEffect(() => {
        // Clear previous highlights
        document.querySelectorAll('[data-highlighted="true"]').forEach(el => {
            el.removeAttribute('data-highlighted');
            el.classList.remove('ring-4', 'ring-yellow-200', 'bg-yellow-50');
        });

        if (highlightedField) {
            const field = document.querySelector(`[data-field-name="${highlightedField}"]`);
            if (field) {
                field.setAttribute('data-highlighted', 'true');
                field.classList.add('ring-4', 'ring-yellow-200', 'bg-yellow-50');
                field.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [highlightedField]);

    const handleTextSelection = (e: React.MouseEvent) => {
        const selection = window.getSelection();
        if (selection && selection.toString().trim()) {
            // Find closest selectable field
            let node = selection.anchorNode;
            // Traverse up to find data-field-name
            while (node && node !== document.body) {
                if (node && node.nodeType === 1 && (node as Element).hasAttribute('data-field-name')) {
                    const fieldName = (node as Element).getAttribute('data-field-name');
                    if (fieldName) {
                        setSelectedField(fieldName);
                        setSelectedText(selection.toString().trim());
                        return;
                    }
                }
                // Handle text nodes parent
                if (node && node.nodeType === 3 && node.parentNode) {
                    node = node.parentNode;
                    continue;
                }
                node = node ? node.parentNode : null;
            }
        } else {
            // If we clicked inside a field (but no selection)
            let node = e.target as Element;
            while (node && node !== document.body) {
                if (node.getAttribute && node.hasAttribute('data-field-name')) {
                    const clickedField = node.getAttribute('data-field-name');
                    // Only clear selected text if we clicked a DIFFERENT field.
                    // This allows clicking the same field (e.g. to focus) without losing the captured text selection.
                    if (clickedField !== selectedField) {
                        setSelectedText(null);
                    }
                    return;
                }
                node = node.parentNode as Element;
            }
        }
    };

    // Clear selected link when navigating between artifacts
    useEffect(() => {
        setSelectedLink(null);
    }, [artifactId]);

    // Get filtered AIDs from sessionStorage (persisted from list view) or location state
    const getFilteredAIDsKey = () => `filtered-aids-${projectId}-${artifactType}`;
    const getFilteredAIDs = () => {
        // First try location state (direct navigation from list)
        const stateAIDs = (location.state as any)?.filteredAIDs;
        if (stateAIDs) {
            // Store in sessionStorage for persistence across back/forward navigation
            try {
                sessionStorage.setItem(getFilteredAIDsKey(), JSON.stringify(stateAIDs));
            } catch (e) {
                console.error('Failed to store filtered AIDs:', e);
            }
            return stateAIDs;
        }

        // Fall back to sessionStorage (browser back/forward navigation)
        try {
            const stored = sessionStorage.getItem(getFilteredAIDsKey());
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (e) {
            console.error('Failed to load filtered AIDs:', e);
        }

        return null;
    };

    // Get filtered AIDs from navigation state (if coming from list view with filters)
    const filteredAIDs = getFilteredAIDs();

    const VALID_TRANSITIONS: Record<string, string[]> = {
        'Draft': ['Ready_for_Review'],
        'Ready_for_Review': ['In_Review', 'Draft'],
        'In_Review': ['Approved', 'Rejected', 'Deferred', 'Draft'],
        'Approved': ['Superseded', 'Retired', 'Draft'], // One-click re-open
        'Deferred': ['In_Review', 'Draft'],
        'Rejected': ['Draft'],
        'Superseded': [],
        'Retired': []
    };

    // Clear selection when clicking outside
    const handleBackgroundClick = (e: React.MouseEvent) => {
        // Don't clear if clicking inside specific UI elements
        if ((e.target as Element).closest('.prevent-deselect')) return;

        // If selecting text, don't clear
        if (window.getSelection()?.toString()) return;

        setSelectedField(null);
        setSelectedText(null);
    };

    // Fetch project details
    const { data: project } = useQuery({
        queryKey: ['project', projectId],
        queryFn: () => ProjectsService.getProjectApiV1ProjectsProjectsProjectIdGet(projectId!),
        enabled: !!projectId
    });

    // Fetch all artifacts of same type for navigation
    // If filteredAIDs is provided, use that list; otherwise fetch all ordered by AID
    const { data: allArtifacts } = useQuery({
        queryKey: ['artifacts', project?.id, artifactType, filteredAIDs],
        queryFn: async () => {
            if (!project?.id) return [];

            // If we have filtered AIDs from list view, fetch only those
            if (filteredAIDs && filteredAIDs.length > 0) {
                // Fetch artifacts in the order of filtered AIDs
                const promises = filteredAIDs.map(async (aid: string) => {
                    try {
                        switch (artifactType) {
                            case 'vision':
                                return await VisionService.getVisionStatementApiV1VisionVisionStatementsAidGet(aid);
                            case 'need':
                                return await NeedsService.getNeedApiV1NeedNeedsAidGet(aid);
                            case 'use_case':
                                return await UseCasesService.getUseCaseApiV1UseCaseUseCasesAidGet(aid);
                            case 'requirement':
                                return await RequirementsService.getRequirementApiV1RequirementRequirementsAidGet(aid);
                            default:
                                return null;
                        }
                    } catch (e) {
                        return null; // Skip artifacts that can't be fetched
                    }
                });
                const results = await Promise.all(promises);
                return results.filter(r => r !== null);
            }

            // Otherwise fetch all artifacts ordered by AID
            switch (artifactType) {
                case 'vision':
                    return await VisionService.listVisionStatementsApiV1VisionVisionStatementsGet(project.id);
                case 'need':
                    const needResponse = await fetch(`/api/v1/need/needs/?project_id=${project.id}`);
                    return needResponse.ok ? await needResponse.json() : [];
                case 'use_case':
                    const ucResponse = await fetch(`/api/v1/use_case/use-cases/?project_id=${project.id}`);
                    return ucResponse.ok ? await ucResponse.json() : [];
                case 'requirement':
                    const reqResponse = await fetch(`/api/v1/requirement/requirements/?project_id=${project.id}`);
                    return reqResponse.ok ? await reqResponse.json() : [];
                default:
                    return [];
            }
        },
        enabled: !!project?.id && !!artifactType,
    });

    // Calculate current position
    const currentIndex = allArtifacts?.findIndex((a: any) => a.aid === artifactId) ?? -1;
    const totalCount = allArtifacts?.length ?? 0;
    const hasPrevious = currentIndex > 0;
    const hasNext = currentIndex >= 0 && currentIndex < totalCount - 1;

    // Navigation functions
    const goToPrevious = () => {
        if (hasPrevious && allArtifacts) {
            const prevArtifact = allArtifacts[currentIndex - 1];
            navigate(`/project/${projectId}/${artifactType}/${prevArtifact.aid}`, {
                state: { filteredAIDs }
            });
        }
    };

    const goToNext = () => {
        if (hasNext && allArtifacts) {
            const nextArtifact = allArtifacts[currentIndex + 1];
            navigate(`/project/${projectId}/${artifactType}/${nextArtifact.aid}`, {
                state: { filteredAIDs }
            });
        }
    };

    // Fetch artifact data
    const { data: artifact, isLoading } = useQuery({
        queryKey: ['artifact', artifactType, artifactId],
        queryFn: async () => {
            switch (artifactType) {
                case 'vision':
                    return await VisionService.getVisionStatementApiV1VisionVisionStatementsAidGet(artifactId!);
                case 'need':
                    return await NeedsService.getNeedApiV1NeedNeedsAidGet(artifactId!);
                case 'use_case':
                    return await UseCasesService.getUseCaseApiV1UseCaseUseCasesAidGet(artifactId!);
                case 'requirement':
                    return await RequirementsService.getRequirementApiV1RequirementRequirementsAidGet(artifactId!);
                case 'document':
                    const docResponse = await fetch(`/api/v1/documents/${artifactId}`);
                    if (!docResponse.ok) throw new Error('Document not found');
                    return await docResponse.json();
                default:
                    throw new Error('Unknown artifact type');
            }
        },
        enabled: !!artifactId && !!artifactType,
    });

    // Update status mutation
    const updateStatusMutation = useMutation({
        mutationFn: async (newStatus: string) => {
            if (!artifact) throw new Error('Artifact not loaded');
            const currentStatus = ('status' in artifact && artifact.status) ? artifact.status : 'Draft';
            const response = await fetch(`/api/v1/events/${artifactType}/${artifactId}/transition`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    from_status: currentStatus,
                    to_status: newStatus,
                    rationale: statusRationale || `Status changed from ${currentStatus} to ${newStatus}`,
                    comment: ''
                })
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Failed to update status');
            }
            return await response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['artifact', artifactType, artifactId] });
        },
    });

    // Fetch linked artifact for preview
    const { data: linkedArtifact } = useQuery({
        queryKey: ['linkedArtifact', selectedLink?.target_artifact_type, selectedLink?.target_id],
        queryFn: async () => {
            if (!selectedLink || selectedLink.target_artifact_type === 'url') return null;

            switch (selectedLink.target_artifact_type) {
                case 'vision':
                    return await VisionService.getVisionStatementApiV1VisionVisionStatementsAidGet(selectedLink.target_id);
                case 'need':
                    return await NeedsService.getNeedApiV1NeedNeedsAidGet(selectedLink.target_id);
                case 'use_case':
                    return await UseCasesService.getUseCaseApiV1UseCaseUseCasesAidGet(selectedLink.target_id);
                case 'requirement':
                    return await RequirementsService.getRequirementApiV1RequirementRequirementsAidGet(selectedLink.target_id);
                case 'diagram':
                    const diagResponse = await fetch(`/api/v1/diagrams/${selectedLink.target_id}`);
                    return diagResponse.ok ? await diagResponse.json() : null;
                case 'component':
                    const compResponse = await fetch(`/api/v1/components/${selectedLink.target_id}`);
                    return compResponse.ok ? await compResponse.json() : null;
                case 'document':
                    const docResponse = await fetch(`/api/v1/documents/${selectedLink.target_id}`);
                    return docResponse.ok ? await docResponse.json() : null;
                default:
                    return null;
            }
        },
        enabled: !!selectedLink && selectedLink.target_artifact_type !== 'url',
    });

    const handleEditClick = () => {
        navigate(`/project/${projectId}/${artifactType}/${artifactId}/edit`);
    };

    if (isLoading) {
        return <div className="p-6 text-center">Loading...</div>;
    }

    if (!artifact) {
        return <div className="p-6 text-center text-red-600">Artifact not found</div>;
    }

    const getStatusOptions = () => {
        if (!artifact || !('status' in artifact)) return [];
        const currentStatus = artifact.status || 'Draft';
        return VALID_TRANSITIONS[currentStatus] || [];
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'approved':
            case 'verified':
            case 'base_lined':
                return 'bg-green-100 text-green-800';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800';
            case 'completed':
                return 'bg-purple-100 text-purple-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-slate-100 text-slate-800';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50" onClick={handleBackgroundClick} onMouseUp={handleTextSelection}>
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="text-slate-600 hover:text-slate-900 transition-colors"
                                title="Go Back"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>

                            {/* Navigation Controls */}
                            {totalCount > 0 && (
                                <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
                                    <button
                                        onClick={goToPrevious}
                                        disabled={!hasPrevious}
                                        className="p-2 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        title="Previous artifact"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <span className="text-sm text-slate-600 min-w-[100px] text-center font-medium">
                                        {currentIndex + 1}/{totalCount} {artifactType}s{filteredAIDs ? ' (filtered)' : ''}
                                    </span>
                                    <button
                                        onClick={goToNext}
                                        disabled={!hasNext}
                                        className="p-2 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        title="Next artifact"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            )}


                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">
                                    {'title' in artifact ? artifact.title : 'text' in artifact ? artifact.text : ''}
                                </h1>
                                <p className="text-sm text-slate-500">{artifact.aid}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* Zoom Controls */}
                            <div className="flex items-center gap-1 border-r border-slate-200 pr-4 mr-2">
                                <button
                                    onClick={() => setZoomLevel(prev => Math.max(50, prev - 10))}
                                    className="p-1.5 rounded hover:bg-slate-100 text-slate-600 transition-colors"
                                    title="Zoom Out"
                                >
                                    <ZoomOut className="w-4 h-4" />
                                </button>
                                <span className="text-xs text-slate-500 w-10 text-center">{zoomLevel}%</span>
                                <button
                                    onClick={() => setZoomLevel(prev => Math.min(200, prev + 10))}
                                    className="p-1.5 rounded hover:bg-slate-100 text-slate-600 transition-colors"
                                    title="Zoom In"
                                >
                                    <ZoomIn className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Comment Toggle */}
                            <button
                                onClick={() => setShowComments(!showComments)}
                                className={`p-2 rounded-md transition-colors mr-2 ${showComments
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                                title={showComments ? "Hide Comments" : "Show Comments"}
                            >
                                <MessageSquare className="w-4 h-4" />
                            </button>

                            {/* Status Dropdown */}
                            {'status' in artifact && (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-slate-700">Status:</span>
                                    <select
                                        value={artifact.status || ''}
                                        onChange={(e) => {
                                            if (e.target.value !== artifact.status) {
                                                setPendingStatus(e.target.value);
                                                setShowStatusDialog(true);
                                                e.target.value = artifact.status || '';
                                            }
                                        }}
                                        className={`px-3 py-1 rounded-full text-sm font-medium border-0 ${getStatusColor(artifact.status || '')}`}
                                    >
                                        <option value={artifact.status || ''} disabled>
                                            {(artifact.status || 'Draft').replace('_', ' ')}
                                        </option>
                                        {getStatusOptions().map((status) => (
                                            <option key={status} value={status}>
                                                {status.replace('_', ' ')}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            {/* Edit Button */}
                            <button
                                onClick={handleEditClick}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                <Edit className="w-4 h-4" />
                                Edit
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className={`max-w-7xl mx-auto px-6 py-3 grid gap-4 transition-all duration-300 ${showComments ? 'grid-cols-[1fr_400px]' : 'grid-cols-1'
                }`}>
                <div className="space-y-3">
                    {/* Preview Pane */}
                    {selectedLink && (
                        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
                            <div className="flex justify-between items-start mb-3">
                                <div className="min-w-0 flex-1 mr-2">
                                    <h3 className="text-lg font-semibold text-blue-900 break-words">
                                        {selectedLink.relationship_type} → {selectedLink.target_artifact_type}
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setSelectedLink(null)}
                                    className="text-blue-600 hover:text-blue-800 flex-shrink-0"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            {linkedArtifact && (
                                <div className="bg-white rounded-md p-4 overflow-y-auto custom-scrollbar max-h-[600px]">
                                    {/* Document Specific Preview */}
                                    {selectedLink.target_artifact_type === 'document' && 'document_type' in linkedArtifact && (
                                        <div className="mb-4">
                                            <div className="flex gap-2 mb-3">
                                                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium uppercase tracking-wider border border-slate-200">
                                                    {linkedArtifact.document_type}
                                                </span>
                                                {linkedArtifact.mime_type && (
                                                    <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded text-xs font-mono border border-slate-200">
                                                        {linkedArtifact.mime_type}
                                                    </span>
                                                )}
                                            </div>

                                            {linkedArtifact.content_url && (
                                                <a
                                                    href={linkedArtifact.content_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors text-sm font-medium border border-blue-200 mb-3"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                    Open Document
                                                </a>
                                            )}

                                            {/* Inline PDF Preview */}
                                            {((linkedArtifact.document_type === 'pdf') ||
                                                (linkedArtifact.document_type === 'file' && linkedArtifact.mime_type?.includes('pdf'))) &&
                                                linkedArtifact.content_url && (
                                                    <div className="mt-2 h-[400px] border border-slate-200 rounded-lg overflow-hidden bg-slate-100">
                                                        <iframe
                                                            src={linkedArtifact.content_url}
                                                            className="w-full h-full"
                                                            title="PDF Document Preview"
                                                        />
                                                    </div>
                                                )}
                                        </div>
                                    )}

                                    {/* Link Preview Content */}
                                    <div className="flex justify-between items-start gap-4 mb-2">
                                        <h4 className="font-semibold text-slate-900 break-words flex-1">
                                            {(() => {
                                                const url = projectId ? (
                                                    (selectedLink.target_artifact_type === 'vision' ||
                                                        selectedLink.target_artifact_type === 'need' ||
                                                        selectedLink.target_artifact_type === 'use_case' ||
                                                        selectedLink.target_artifact_type === 'requirement' ||
                                                        selectedLink.target_artifact_type === 'document')
                                                        ? `/project/${projectId}/${selectedLink.target_artifact_type}/${selectedLink.target_id}`
                                                        : selectedLink.target_artifact_type === 'diagram'
                                                            ? `/project/${projectId}/diagrams/${selectedLink.target_id}`
                                                            : null
                                                ) : null;

                                                const name = 'title' in linkedArtifact ? linkedArtifact.title : 'name' in linkedArtifact ? linkedArtifact.name : 'text' in linkedArtifact ? linkedArtifact.text : '';

                                                return url ? (
                                                    <Link to={url} className="hover:text-blue-600 hover:underline">
                                                        {name}
                                                    </Link>
                                                ) : name;
                                            })()}
                                        </h4>

                                        {(() => {
                                            const url = projectId ? (
                                                (selectedLink.target_artifact_type === 'vision' ||
                                                    selectedLink.target_artifact_type === 'need' ||
                                                    selectedLink.target_artifact_type === 'use_case' ||
                                                    selectedLink.target_artifact_type === 'requirement' ||
                                                    selectedLink.target_artifact_type === 'document')
                                                    ? `/project/${projectId}/${selectedLink.target_artifact_type}/${selectedLink.target_id}`
                                                    : selectedLink.target_artifact_type === 'diagram'
                                                        ? `/project/${projectId}/diagrams/${selectedLink.target_id}`
                                                        : null
                                            ) : null;

                                            return url && (
                                                <Link
                                                    to={url}
                                                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white text-slate-600 border border-slate-200 rounded-md text-xs font-medium hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 transition-colors shadow-sm"
                                                >
                                                    <ExternalLink className="w-3 h-3" />
                                                    Open
                                                </Link>
                                            );
                                        })()}
                                    </div>
                                    {selectedLink.target_artifact_type !== 'diagram' && (
                                        <p className="text-sm text-slate-600 mb-3">{linkedArtifact.aid || selectedLink.target_id}</p>
                                    )}

                                    <div className="prose prose-sm max-w-none text-slate-600">
                                        {/* Dynamic Content Rendering based on available fields */}
                                        {/* Dynamic Content Rendering based on artifact type */}
                                        {(() => {
                                            // 1. Use Case Specific Rendering
                                            if (selectedLink.target_artifact_type === 'use_case') {
                                                return (
                                                    <div className="space-y-4">
                                                        {/* Description */}
                                                        <div>
                                                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Description</div>
                                                            <MarkdownDisplay content={linkedArtifact.description || '*No description.*'} />
                                                        </div>

                                                        {/* Trigger */}
                                                        {linkedArtifact.trigger && (
                                                            <div>
                                                                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Trigger</div>
                                                                <p>{linkedArtifact.trigger}</p>
                                                            </div>
                                                        )}

                                                        {/* Preconditions */}
                                                        {linkedArtifact.preconditions && linkedArtifact.preconditions.length > 0 && (
                                                            <div>
                                                                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Preconditions</div>
                                                                <ol className="list-decimal list-inside pl-2">
                                                                    {linkedArtifact.preconditions.map((p: any, i: number) => (
                                                                        <li key={i}>{p.text}</li>
                                                                    ))}
                                                                </ol>
                                                            </div>
                                                        )}

                                                        {/* MSS */}
                                                        {linkedArtifact.mss && linkedArtifact.mss.length > 0 && (
                                                            <div>
                                                                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Main Success Scenario</div>
                                                                <ol className="list-decimal list-inside pl-2">
                                                                    {linkedArtifact.mss.map((step: any, i: number) => (
                                                                        <li key={i}>
                                                                            <strong className="text-slate-700">{step.actor}:</strong> {step.description}
                                                                        </li>
                                                                    ))}
                                                                </ol>
                                                            </div>
                                                        )}

                                                        {/* Postconditions */}
                                                        {linkedArtifact.postconditions && linkedArtifact.postconditions.length > 0 && (
                                                            <div>
                                                                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Postconditions</div>
                                                                <ol className="list-decimal list-inside pl-2">
                                                                    {linkedArtifact.postconditions.map((p: any, i: number) => (
                                                                        <li key={i}>{p.text}</li>
                                                                    ))}
                                                                </ol>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            }

                                            // 2. Generic Fallback
                                            const content =
                                                ('statement' in linkedArtifact && linkedArtifact.statement) ||
                                                ('content_text' in linkedArtifact && linkedArtifact.content_text) ||
                                                ('text' in linkedArtifact && linkedArtifact.text) ||
                                                ('description' in linkedArtifact && linkedArtifact.description);

                                            if (content) {
                                                return (
                                                    <MarkdownDisplay content={String(content)} />
                                                );
                                            }

                                            return <span className="text-slate-400 italic">No description available.</span>;
                                        })()}
                                    </div>

                                    {/* Diagram - embed interactive diagram */}
                                    {selectedLink.target_artifact_type === 'diagram' && (
                                        <div className="mt-3 border border-slate-200 rounded-lg overflow-hidden" style={{ height: '400px' }}>
                                            {linkedArtifact.type === 'artifact_graph' ? (
                                                <ArtifactGraphView
                                                    initialArea={linkedArtifact.filter_data?.area}
                                                    diagramId={selectedLink.target_id}
                                                />
                                            ) : (linkedArtifact.type === 'sequence' || linkedArtifact.type === 'mermaid') ? (
                                                <SequenceDiagramEditor diagramId={selectedLink.target_id} readOnly={true} />
                                            ) : (
                                                <ComponentDiagram diagramId={selectedLink.target_id} readOnly={true} />
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Compact Linkages Section */}
                    <CompactLinkages
                        artifactId={artifactId!}
                        onLinkClick={(link) => setSelectedLink(link)}
                    />

                    {/* Artifact Content */}
                    <div
                        className="bg-white rounded-lg border border-slate-200 shadow-sm p-6"
                        style={{ zoom: zoomLevel / 100 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="prose max-w-none">
                            {artifactType === 'need' && (
                                <NeedPresentation
                                    artifact={artifact}
                                    selectedField={selectedField}
                                    onFieldClick={setSelectedField}
                                />
                            )}
                            {artifactType === 'use_case' && (
                                <UseCasePresentation
                                    artifact={artifact}
                                    selectedField={selectedField}
                                    onFieldClick={setSelectedField}
                                />
                            )}
                            {artifactType === 'requirement' && (
                                <RequirementPresentation
                                    artifact={artifact}
                                    selectedField={selectedField}
                                    onFieldClick={setSelectedField}
                                />
                            )}
                            {artifactType === 'vision' && (
                                <VisionPresentation
                                    artifact={artifact}
                                    selectedField={selectedField}
                                    onFieldClick={setSelectedField}
                                />
                            )}
                            {artifactType === 'document' && (
                                <DocumentPresentation
                                    artifact={artifact}
                                    selectedField={selectedField}
                                    onFieldClick={setSelectedField}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Comment Panel Column */}
                {showComments && (
                    <div
                        className="sticky top-20 h-[calc(100vh-6rem)] bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden prevent-deselect"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <CommentPanel
                            artifactAid={artifactId!}
                            artifactType={artifactType!}
                            selectedField={selectedField}
                            fieldLabel={selectedField ? selectedField.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : ''}
                            selectedText={selectedText}
                            onCommentFocus={(fieldId, text) => {
                                setHighlightedField(fieldId);
                            }}
                        /></div>
                )}
            </div>

            {/* Status Change Confirmation Dialog */}
            {
                showStatusDialog && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full">
                            <h2 className="text-xl font-bold mb-3">Confirm Status Change</h2>
                            <p className="text-sm text-slate-600 mb-3">
                                Change status from <span className="font-semibold">{('status' in artifact && artifact.status) ? artifact.status : 'Draft'}</span> to <span className="font-semibold">{pendingStatus}</span>
                            </p>
                            <div className="mb-3">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Rationale <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={statusRationale}
                                    onChange={(e) => setStatusRationale(e.target.value)}
                                    placeholder="Enter rationale for this status change..."
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={4}
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => {
                                        setShowStatusDialog(false);
                                        setPendingStatus('');
                                        setStatusRationale('');
                                    }}
                                    className="px-4 py-2 text-slate-600 hover:text-slate-800 rounded-md hover:bg-slate-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        if (statusRationale.trim()) {
                                            updateStatusMutation.mutate(pendingStatus);
                                            setShowStatusDialog(false);
                                            setPendingStatus('');
                                            setStatusRationale('');
                                        }
                                    }}
                                    disabled={!statusRationale.trim()}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}

// Updated Presentation Components

interface PresentationProps {
    artifact: any;
    selectedField: string | null;
    onFieldClick: (field: string) => void;
}

function NeedPresentation({ artifact, selectedField, onFieldClick }: PresentationProps) {
    return (
        <>
            <div className="grid grid-cols-2 gap-4 mb-3 not-prose">
                <SelectableField fieldId="area" label="Area" isActive={selectedField === 'area'} onClick={onFieldClick}>
                    <p className="text-slate-900">{artifact.area || 'N/A'}</p>
                </SelectableField>
                <SelectableField fieldId="level" label="Level" isActive={selectedField === 'level'} onClick={onFieldClick}>
                    <p className="text-slate-900">{artifact.level || 'N/A'}</p>
                </SelectableField>
                <SelectableField fieldId="owner" label="Owner" isActive={selectedField === 'owner'} onClick={onFieldClick}>
                    <p className="text-slate-900">{artifact.owner_id ? <PersonName personId={artifact.owner_id} /> : 'N/A'}</p>
                </SelectableField>
                <SelectableField fieldId="stakeholder" label="Stakeholder" isActive={selectedField === 'stakeholder'} onClick={onFieldClick}>
                    <p className="text-slate-900">{artifact.stakeholder_id ? <PersonName personId={artifact.stakeholder_id} /> : 'N/A'}</p>
                </SelectableField>
            </div>

            <SelectableField
                fieldId="description"
                label="Description"
                isActive={selectedField === 'description'}
                onClick={onFieldClick}
            >
                <div className="mt-1">
                    <MarkdownDisplay content={artifact.description || '*No description provided.*'} />
                </div>
            </SelectableField>

            <div className="mt-4">
                <SelectableField
                    fieldId="rationale"
                    label="Rationale"
                    isActive={selectedField === 'rationale'}
                    onClick={onFieldClick}
                >
                    <div className="mt-1">
                        {artifact.rationale ? (
                            <MarkdownDisplay content={artifact.rationale} />
                        ) : (
                            <p className="text-slate-400 italic">No rationale provided.</p>
                        )}
                    </div>
                </SelectableField>
            </div>

            {/* Sites Display */}
            {artifact.sites && artifact.sites.length > 0 && (
                <div className="mt-4">
                    <SelectableField fieldId="related_sites" label="Related Sites" isActive={selectedField === 'related_sites'} onClick={onFieldClick}>
                        <div className="flex flex-col gap-2 mt-1">
                            {artifact.sites.map((site: any) => (
                                <div key={site.id} className="flex flex-wrap items-center gap-2 text-sm bg-slate-50 p-2 rounded border border-slate-100">
                                    <span className="font-medium text-slate-900 mr-1">{site.name}</span>

                                    {/* Security Domain Badge */}
                                    {site.security_domain && (
                                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                                            {site.security_domain}
                                        </span>
                                    )}

                                    {/* Tags */}
                                    {Array.isArray(site.tags) && site.tags.map((tag: string) => (
                                        <span key={tag} className="px-2 py-0.5 bg-white text-slate-600 text-xs rounded border border-slate-200 flex items-center gap-1">
                                            <Tag className="w-3 h-3" />
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </SelectableField>
                </div>
            )}

            {/* Components Display */}
            {artifact.components && artifact.components.length > 0 && (
                <div className="mt-4">
                    <SelectableField fieldId="related_components" label="Related Components" isActive={selectedField === 'related_components'} onClick={onFieldClick}>
                        <div className="flex flex-col gap-2 mt-1">
                            {artifact.components.map((comp: any) => (
                                <div key={comp.id} className="flex flex-wrap items-center gap-2 text-sm bg-slate-50 p-2 rounded border border-slate-100">
                                    <span className="font-medium text-slate-900 mr-1">{comp.name}</span>

                                    {/* Type Badge */}
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${comp.type === 'Hardware' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        {comp.type || 'Software'}
                                    </span>

                                    {/* Lifecycle Badge */}
                                    {comp.lifecycle && (
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${comp.lifecycle === 'Active' ? 'bg-green-100 text-green-700' :
                                            comp.lifecycle === 'Legacy' ? 'bg-amber-100 text-amber-700' :
                                                'bg-slate-100 text-slate-700'
                                            }`}>
                                            {comp.lifecycle}
                                        </span>
                                    )}

                                    {/* Tags */}
                                    {Array.isArray(comp.tags) && comp.tags.map((tag: string) => (
                                        <span key={tag} className="px-2 py-0.5 bg-white text-slate-600 text-xs rounded border border-slate-200 flex items-center gap-1">
                                            <Tag className="w-3 h-3" />
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </SelectableField>
                </div>
            )}
        </>
    );
}

function UseCasePresentation({ artifact, selectedField, onFieldClick }: PresentationProps) {
    return (
        <>
            <div className="grid grid-cols-2 gap-4 mb-3 not-prose">
                <SelectableField fieldId="area" label="Area" isActive={selectedField === 'area'} onClick={onFieldClick}>
                    <p className="text-slate-900">{artifact.area || 'N/A'}</p>
                </SelectableField>
                <SelectableField fieldId="primary_actor" label="Primary Actor" isActive={selectedField === 'primary_actor'} onClick={onFieldClick}>
                    <p className="text-slate-900">{artifact.primary_actor?.name || 'N/A'}</p>
                </SelectableField>
            </div>

            <SelectableField fieldId="description" label="Description" isActive={selectedField === 'description'} onClick={onFieldClick}>
                <div className="mt-1">
                    <MarkdownDisplay content={artifact.description || '*No description provided.*'} />
                </div>
            </SelectableField>

            <div className="mt-4">
                <SelectableField fieldId="trigger" label="Trigger" isActive={selectedField === 'trigger'} onClick={onFieldClick}>
                    <p className="mt-1">{artifact.trigger || <span className="text-slate-400 italic">No trigger definition.</span>}</p>
                </SelectableField>
            </div>

            <div className="mt-4">
                <SelectableField fieldId="preconditions" label="Preconditions" isActive={selectedField === 'preconditions'} onClick={onFieldClick}>
                    {artifact.preconditions && artifact.preconditions.length > 0 ? (
                        <ol className="list-decimal list-inside mt-1">
                            {artifact.preconditions.map((p: any, i: number) => (
                                <li key={i}>{p.text}</li>
                            ))}
                        </ol>
                    ) : <p className="text-slate-400 italic mt-1">No preconditions.</p>}
                </SelectableField>
            </div>

            <div className="mt-4">
                <SelectableField fieldId="mss" label="Main Success Scenario" isActive={selectedField === 'mss'} onClick={onFieldClick}>
                    {artifact.mss && artifact.mss.length > 0 ? (
                        <ol className="list-decimal list-inside mt-1">
                            {artifact.mss.map((step: any, i: number) => (
                                <li key={i}>
                                    <strong>{step.actor}:</strong> {step.description}
                                </li>
                            ))}
                        </ol>
                    ) : <p className="text-slate-400 italic mt-1">No main success scenario.</p>}
                </SelectableField>
            </div>

            <div className="mt-4">
                <SelectableField fieldId="postconditions" label="Postconditions" isActive={selectedField === 'postconditions'} onClick={onFieldClick}>
                    {artifact.postconditions && artifact.postconditions.length > 0 ? (
                        <ol className="list-decimal list-inside mt-1">
                            {artifact.postconditions.map((p: any, i: number) => (
                                <li key={i}>{p.text}</li>
                            ))}
                        </ol>
                    ) : <p className="text-slate-400 italic mt-1">No postconditions.</p>}
                </SelectableField>
            </div>
        </>
    );
}

function RequirementPresentation({ artifact, selectedField, onFieldClick }: PresentationProps) {
    return (
        <>
            <div className="grid grid-cols-3 gap-4 mb-3 not-prose">
                {/* Metadata fields */}
                <SelectableField fieldId="short_name" label="Short Name" isActive={selectedField === 'short_name'} onClick={onFieldClick}>
                    <p className="text-slate-900 font-mono">{artifact.short_name}</p>
                </SelectableField>
                <SelectableField fieldId="area" label="Area" isActive={selectedField === 'area'} onClick={onFieldClick}>
                    <p className="text-slate-900">{artifact.area || 'N/A'}</p>
                </SelectableField>
                <SelectableField fieldId="level" label="Level" isActive={selectedField === 'level'} onClick={onFieldClick}>
                    <p className="text-slate-900">{artifact.level?.toUpperCase() || 'N/A'}</p>
                </SelectableField>
            </div>

            <SelectableField fieldId="text" label="Requirement Text" isActive={selectedField === 'text'} onClick={onFieldClick}>
                <div className="bg-slate-50 p-4 rounded-md border border-slate-200 mt-1">
                    <MarkdownDisplay content={artifact.text || ''} />
                </div>
            </SelectableField>

            <div className="mt-4">
                <SelectableField fieldId="rationale" label="Rationale" isActive={selectedField === 'rationale'} onClick={onFieldClick}>
                    <div className="mt-1">
                        {artifact.rationale ? (
                            <MarkdownDisplay content={artifact.rationale} />
                        ) : (
                            <p className="text-slate-400 italic">No rationale provided.</p>
                        )}
                    </div>
                </SelectableField>
            </div>
        </>
    );
}

function VisionPresentation({ artifact, selectedField, onFieldClick }: PresentationProps) {
    return (
        <>


            <div className="mt-4">
                <SelectableField fieldId="description" label="Description" isActive={selectedField === 'description'} onClick={onFieldClick}>
                    <div className="mt-1">
                        {artifact.description ? (
                            <MarkdownDisplay content={artifact.description} />
                        ) : <p className="text-slate-400 italic">No description.</p>}
                    </div>
                </SelectableField>
            </div>
        </>
    );
}

function DocumentPresentation({ artifact, selectedField, onFieldClick }: PresentationProps) {
    return (
        <>
            <div className="grid grid-cols-2 gap-4 mb-4 not-prose">
                <SelectableField fieldId="type" label="Type" isActive={selectedField === 'type'} onClick={onFieldClick}>
                    <p className="text-slate-900 capitalize">{artifact.document_type || 'Unknown'}</p>
                </SelectableField>
                <SelectableField fieldId="mime_type" label="MIME Type" isActive={selectedField === 'mime_type'} onClick={onFieldClick}>
                    <p className="text-slate-900">{artifact.mime_type || 'N/A'}</p>
                </SelectableField>
            </div>

            <SelectableField fieldId="description" label="Description" isActive={selectedField === 'description'} onClick={onFieldClick}>
                <div className="mt-1">
                    {artifact.description ? (
                        <MarkdownDisplay content={artifact.description} />
                    ) : <p className="text-slate-400 italic">No description.</p>}
                </div>
            </SelectableField>

            {/* Content Display (non-interactive for now) */}
            <div className="mt-4 not-prose opacity-90 hover:opacity-100 transition-opacity">
                {artifact.document_type === 'url' && artifact.content_url && (
                    <SelectableField fieldId="content_url" label="Content URL" isActive={selectedField === 'content_url'} onClick={onFieldClick}>
                        <div className="p-4 bg-slate-50 rounded border border-slate-200">
                            <a href={artifact.content_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline">
                                <ExternalLink className="w-4 h-4" />
                                {artifact.content_url}
                            </a>
                        </div>
                    </SelectableField>
                )}

                {/* PDF Rendering */}
                {((artifact.document_type === 'pdf') ||
                    (artifact.document_type === 'file' && artifact.mime_type?.includes('pdf'))) &&
                    artifact.content_url && (
                        <SelectableField fieldId="pdf_content" label="PDF Viewer" isActive={selectedField === 'pdf_content'} onClick={onFieldClick}>
                            <div className="mt-4 h-[600px] border border-slate-200 rounded-lg overflow-hidden bg-slate-100">
                                <iframe
                                    src={artifact.content_url}
                                    className="w-full h-full"
                                    title="PDF Document"
                                />
                            </div>
                        </SelectableField>
                    )}

            </div>

            {/* Markdown/Text Rendering */}
            {/* Check for 'text' type (set by Wizard) or legacy 'markdown' */}
            {(artifact.document_type === 'text' || artifact.document_type === 'markdown') && (
                <div className="mt-4">
                    <SelectableField fieldId="content_text" label="Document Content" isActive={selectedField === 'content_text'} onClick={onFieldClick}>
                        <div className="p-6 bg-white border border-slate-200 rounded-lg shadow-sm">
                            <MarkdownDisplay content={artifact.content_text || artifact.text || '*No content.*'} />
                        </div>
                    </SelectableField>
                </div>
            )}
        </>
    );
}
