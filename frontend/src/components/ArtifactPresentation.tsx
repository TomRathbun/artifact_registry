import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { NeedsService, UseCasesService, RequirementsService, VisionService, LinkageService, ProjectsService } from '../client';
import { ArrowLeft, Edit, ExternalLink, X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, MessageSquarePlus } from 'lucide-react';
import ComponentDiagram from './ComponentDiagram';
import ArtifactGraphView from './ArtifactGraphView';
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
        if ('text' in artifact && artifact.text) return artifact.text.substring(0, 50);
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
            className="text-blue-600 hover:underline text-left"
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
                    <div key={link.aid} className="flex items-center gap-2">
                        <span className="text-slate-500">{link.relationship_type}:</span>
                        <LinkedArtifactName link={link} onClick={() => onLinkClick(link)} />
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
    const queryClient = useQueryClient();
    const [selectedLink, setSelectedLink] = useState<any>(null);
    const [showStatusDialog, setShowStatusDialog] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(100);
    const [pendingStatus, setPendingStatus] = useState<string>('');
    const [statusRationale, setStatusRationale] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [selectedField, setSelectedField] = useState<string | null>(null);

    // Valid status transitions from backend
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
    const handleBackgroundClick = () => {
        setSelectedField(null);
    };

    // Fetch project details
    const { data: project } = useQuery({
        queryKey: ['project', projectId],
        queryFn: () => ProjectsService.getProjectApiV1ProjectsProjectsProjectIdGet(projectId!),
        enabled: !!projectId
    });

    // Fetch all artifacts of same type for navigation (with status filter)
    const { data: allArtifacts } = useQuery({
        queryKey: ['artifacts', project?.id, artifactType, statusFilter],
        queryFn: async () => {
            if (!project?.id) return [];
            switch (artifactType) {
                case 'vision':
                    return await VisionService.listVisionStatementsApiV1VisionVisionStatementsGet(
                        project.id,
                        statusFilter || undefined
                    );
                case 'need':
                    const params = new URLSearchParams({ project_id: project.id });
                    if (statusFilter) params.append('status', statusFilter);
                    const needResponse = await fetch(`/api/v1/need/needs/?${params.toString()}`);
                    return needResponse.ok ? await needResponse.json() : [];
                case 'use_case':
                    const ucParams = new URLSearchParams({ project_id: project.id });
                    if (statusFilter) ucParams.append('status', statusFilter);
                    const ucResponse = await fetch(`/api/v1/use_case/use-cases/?${ucParams.toString()}`);
                    return ucResponse.ok ? await ucResponse.json() : [];
                case 'requirement':
                    const reqParams = new URLSearchParams({ project_id: project.id });
                    if (statusFilter) reqParams.append('status', statusFilter);
                    const reqResponse = await fetch(`/api/v1/requirement/requirements/?${reqParams.toString()}`);
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
            navigate(`/project/${projectId}/${artifactType}/${prevArtifact.aid}`);
        }
    };

    const goToNext = () => {
        if (hasNext && allArtifacts) {
            const nextArtifact = allArtifacts[currentIndex + 1];
            navigate(`/project/${projectId}/${artifactType}/${nextArtifact.aid}`);
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
        <div className="min-h-screen bg-slate-50" onClick={handleBackgroundClick}>
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link to={`/project/${projectId}`} className="text-slate-600 hover:text-slate-900">
                                <ArrowLeft className="w-5 h-5" />
                            </Link>

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
                                        {currentIndex + 1}/{totalCount} {artifactType}s
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

                            {/* Status Filter */}
                            <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
                                <label className="text-sm text-slate-600 font-medium">Status:</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="text-sm px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All</option>
                                    <option value="Draft">Draft</option>
                                    <option value="Ready_for_Review">Ready for Review</option>
                                    <option value="In_Review">In Review</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Rejected">Rejected</option>
                                    <option value="Deferred">Deferred</option>
                                    <option value="Superseded">Superseded</option>
                                    <option value="Retired">Retired</option>
                                </select>
                            </div>

                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">
                                    {'title' in artifact ? artifact.title : 'text' in artifact ? artifact.text?.substring(0, 50) : ''}
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

            <div className="max-w-7xl mx-auto px-6 py-3 grid grid-cols-[1fr_400px] gap-4">
                <div className="space-y-3">
                    {/* Preview Pane */}
                    {selectedLink && (
                        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="text-lg font-semibold text-blue-900">
                                        {selectedLink.relationship_type} → {selectedLink.target_artifact_type}
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setSelectedLink(null)}
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            {linkedArtifact && (
                                <div className="bg-white rounded-md p-4 max-h-[600px] overflow-y-auto custom-scrollbar">
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
                                    <h4 className="font-semibold text-slate-900 mb-2">
                                        {'title' in linkedArtifact ? linkedArtifact.title : 'name' in linkedArtifact ? linkedArtifact.name : 'text' in linkedArtifact ? linkedArtifact.text?.substring(0, 100) : ''}
                                    </h4>
                                    <p className="text-sm text-slate-600 mb-3">{linkedArtifact.aid || selectedLink.target_id}</p>

                                    <div className="prose prose-sm max-w-none text-slate-600">
                                        {/* Dynamic Content Rendering based on available fields */}
                                        {(() => {
                                            const content =
                                                ('statement' in linkedArtifact && linkedArtifact.statement) ||
                                                ('content_text' in linkedArtifact && linkedArtifact.content_text) ||
                                                ('text' in linkedArtifact && linkedArtifact.text) ||
                                                ('description' in linkedArtifact && linkedArtifact.description);

                                            if (content) {
                                                return (
                                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                        {String(content)}
                                                    </ReactMarkdown>
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
                                            ) : (
                                                <ComponentDiagram />
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
                <div
                    className="sticky top-20 h-[calc(100vh-6rem)] bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    <CommentPanel
                        artifactAid={artifactId!}
                        selectedField={selectedField}
                        fieldLabel={selectedField ? selectedField.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : ''}
                    />
                </div>
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
                {/* Meta fields remain read-only/non-commentable for now unless requested */}
                <div>
                    <span className="text-sm font-medium text-slate-500">Area</span>
                    <p className="text-slate-900">{artifact.area || 'N/A'}</p>
                </div>
                <div>
                    <span className="text-sm font-medium text-slate-500">Level</span>
                    <p className="text-slate-900">{artifact.level || 'N/A'}</p>
                </div>
                <div>
                    <span className="text-sm font-medium text-slate-500">Owner</span>
                    <p className="text-slate-900">{artifact.owner_id ? <PersonName personId={artifact.owner_id} /> : 'N/A'}</p>
                </div>
                <div>
                    <span className="text-sm font-medium text-slate-500">Stakeholder</span>
                    <p className="text-slate-900">{artifact.stakeholder_id ? <PersonName personId={artifact.stakeholder_id} /> : 'N/A'}</p>
                </div>
            </div>

            <SelectableField
                fieldId="description"
                label="Description"
                isActive={selectedField === 'description'}
                onClick={onFieldClick}
            >
                <div className="mt-1">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {artifact.description || '*No description provided.*'}
                    </ReactMarkdown>
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
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {artifact.rationale}
                            </ReactMarkdown>
                        ) : (
                            <p className="text-slate-400 italic">No rationale provided.</p>
                        )}
                    </div>
                </SelectableField>
            </div>
        </>
    );
}

function UseCasePresentation({ artifact, selectedField, onFieldClick }: PresentationProps) {
    return (
        <>
            <div className="grid grid-cols-2 gap-4 mb-3 not-prose">
                <div>
                    <span className="text-sm font-medium text-slate-500">Area</span>
                    <p className="text-slate-900">{artifact.area || 'N/A'}</p>
                </div>
                <div>
                    <span className="text-sm font-medium text-slate-500">Primary Actor</span>
                    <p className="text-slate-900">{artifact.primary_actor?.name || 'N/A'}</p>
                </div>
            </div>

            <SelectableField fieldId="description" label="Description" isActive={selectedField === 'description'} onClick={onFieldClick}>
                <div className="mt-1">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {artifact.description || '*No description provided.*'}
                    </ReactMarkdown>
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
                <div>
                    <span className="text-sm font-medium text-slate-500">Short Name</span>
                    <p className="text-slate-900 font-mono">{artifact.short_name}</p>
                </div>
                <div>
                    <span className="text-sm font-medium text-slate-500">Area</span>
                    <p className="text-slate-900">{artifact.area || 'N/A'}</p>
                </div>
                <div>
                    <span className="text-sm font-medium text-slate-500">Level</span>
                    <p className="text-slate-900">{artifact.level?.toUpperCase() || 'N/A'}</p>
                </div>
            </div>

            <SelectableField fieldId="text" label="Requirement Text" isActive={selectedField === 'text'} onClick={onFieldClick}>
                <div className="bg-slate-50 p-4 rounded-md border border-slate-200 mt-1">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {artifact.text || ''}
                    </ReactMarkdown>
                </div>
            </SelectableField>

            <div className="mt-4">
                <SelectableField fieldId="rationale" label="Rationale" isActive={selectedField === 'rationale'} onClick={onFieldClick}>
                    <div className="mt-1">
                        {artifact.rationale ? (
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {artifact.rationale}
                            </ReactMarkdown>
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
            <SelectableField fieldId="statement" label="Vision Statement" isActive={selectedField === 'statement'} onClick={onFieldClick}>
                <div className="mt-1">
                    {artifact.statement ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {artifact.statement}
                        </ReactMarkdown>
                    ) : <p className="text-slate-400 italic">No statement.</p>}
                </div>
            </SelectableField>

            <div className="mt-4">
                <SelectableField fieldId="description" label="Description" isActive={selectedField === 'description'} onClick={onFieldClick}>
                    <div className="mt-1">
                        {artifact.description ? (
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {artifact.description}
                            </ReactMarkdown>
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
                <div>
                    <span className="text-sm font-medium text-slate-500">Type</span>
                    <p className="text-slate-900 capitalize">{artifact.document_type || 'Unknown'}</p>
                </div>
                <div>
                    <span className="text-sm font-medium text-slate-500">MIME Type</span>
                    <p className="text-slate-900">{artifact.mime_type || 'N/A'}</p>
                </div>
            </div>

            <SelectableField fieldId="description" label="Description" isActive={selectedField === 'description'} onClick={onFieldClick}>
                <div className="mt-1">
                    {artifact.description ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {artifact.description}
                        </ReactMarkdown>
                    ) : <p className="text-slate-400 italic">No description.</p>}
                </div>
            </SelectableField>

            {/* Content Display (non-interactive for now) */}
            <div className="mt-4 not-prose opacity-90 hover:opacity-100 transition-opacity">
                {artifact.document_type === 'url' && artifact.content_url && (
                    <div className="p-4 bg-slate-50 rounded border border-slate-200">
                        <a href={artifact.content_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline">
                            <ExternalLink className="w-4 h-4" />
                            {artifact.content_url}
                        </a>
                    </div>
                )}

                {/* PDF Rendering */}
                {((artifact.document_type === 'pdf') ||
                    (artifact.document_type === 'file' && artifact.mime_type?.includes('pdf'))) &&
                    artifact.content_url && (
                        <div className="mt-4 h-[600px] border border-slate-200 rounded-lg overflow-hidden bg-slate-100">
                            <iframe
                                src={artifact.content_url}
                                className="w-full h-full"
                                title="PDF Document"
                            />
                        </div>
                    )}

                {/* Markdown/Text Rendering */}
                {/* Check for 'text' type (set by Wizard) or legacy 'markdown' */}
                {(artifact.document_type === 'text' || artifact.document_type === 'markdown') && (
                    <div className="mt-4 p-6 bg-white border border-slate-200 rounded-lg shadow-sm">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {artifact.content_text || artifact.text || '*No content.*'}
                        </ReactMarkdown>
                    </div>
                )}
            </div>
        </>
    );
}
