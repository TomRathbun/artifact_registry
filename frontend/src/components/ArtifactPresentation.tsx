import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { NeedsService, UseCasesService, RequirementsService, VisionService, LinkageService, ProjectsService } from '../client';
import { ArrowLeft, Edit, ExternalLink, X, ChevronLeft, ChevronRight } from 'lucide-react';
import ComponentDiagram from './ComponentDiagram';
import ArtifactGraphView from './ArtifactGraphView';

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


export default function ArtifactPresentation() {
    const { projectId, artifactType, artifactId } = useParams<{ projectId: string; artifactType: string; artifactId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [selectedLink, setSelectedLink] = useState<any>(null);
    const [showStatusDialog, setShowStatusDialog] = useState(false);
    const [pendingStatus, setPendingStatus] = useState<string>('');
    const [statusRationale, setStatusRationale] = useState('');

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

    // Fetch project details first to get the real UUID
    const { data: project } = useQuery({
        queryKey: ['project', projectId],
        queryFn: () => ProjectsService.getProjectApiV1ProjectsProjectsProjectIdGet(projectId!),
        enabled: !!projectId
    });

    // Fetch all artifacts of same type for navigation
    const { data: allArtifacts } = useQuery({
        queryKey: ['artifacts', project?.id, artifactType],
        queryFn: async () => {
            if (!project?.id) return [];
            switch (artifactType) {
                case 'vision':
                    return await VisionService.listVisionStatementsApiV1VisionVisionStatementsGet(project.id);
                case 'need':
                    // Use manual fetch to ensure project_id is passed correctly
                    const needResponse = await fetch(`/api/v1/need/needs/?project_id=${project.id}`);
                    return needResponse.ok ? await needResponse.json() : [];
                case 'use_case':
                    // Use manual fetch because generated service doesn't include project_id parameter
                    const ucResponse = await fetch(`/api/v1/use_case/use-cases/?project_id=${project.id}`);
                    return ucResponse.ok ? await ucResponse.json() : [];
                case 'requirement':
                    // Use manual fetch because generated service doesn't handle query params correctly
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
    // Status update mutation using events API for event sourcing
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
        // Only show valid transitions from current status
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
        <div className="min-h-screen bg-slate-50">
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

                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">
                                    {'title' in artifact ? artifact.title : 'text' in artifact ? artifact.text?.substring(0, 50) : ''}
                                </h1>
                                <p className="text-sm text-slate-500">{artifact.aid}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* Status Dropdown - all artifacts have status from BaseArtifact */}
                            {'status' in artifact && (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-slate-700">Status:</span>
                                    <select
                                        value={artifact.status || ''}
                                        onChange={(e) => {
                                            if (e.target.value !== artifact.status) {
                                                setPendingStatus(e.target.value);
                                                setShowStatusDialog(true);
                                                // Reset select to current value
                                                e.target.value = artifact.status || '';
                                            }
                                        }}
                                        className={`px-3 py-1 rounded-full text-sm font-medium border-0 ${getStatusColor(artifact.status || '')}`}
                                    >
                                        {/* Current status (disabled) */}
                                        <option value={artifact.status || ''} disabled>
                                            {(artifact.status || 'Draft').replace('_', ' ')}
                                        </option>
                                        {/* Valid transitions */}
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

            <div className="max-w-7xl mx-auto px-6 py-3 space-y-3">
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
                            <div className="bg-white rounded-md p-4 max-h-96 overflow-y-auto">
                                {/* Title/Name */}
                                <h4 className="font-semibold text-slate-900 mb-2">
                                    {'title' in linkedArtifact ? linkedArtifact.title : 'name' in linkedArtifact ? linkedArtifact.name : 'text' in linkedArtifact ? linkedArtifact.text?.substring(0, 100) : ''}
                                </h4>
                                <p className="text-sm text-slate-600 mb-3">{linkedArtifact.aid || selectedLink.target_id}</p>

                                {/* Vision - render statement or description as markdown */}
                                {selectedLink.target_artifact_type === 'vision' && (
                                    <div className="prose prose-sm max-w-none">
                                        {('statement' in linkedArtifact && linkedArtifact.statement) ? (
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {linkedArtifact.statement}
                                            </ReactMarkdown>
                                        ) : ('description' in linkedArtifact && linkedArtifact.description) ? (
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {linkedArtifact.description}
                                            </ReactMarkdown>
                                        ) : null}
                                    </div>
                                )}

                                {/* Need - render description as markdown and show owner/stakeholder names */}
                                {selectedLink.target_artifact_type === 'need' && (
                                    <>
                                        {linkedArtifact.description && (
                                            <div className="prose prose-sm max-w-none mb-3">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {linkedArtifact.description}
                                                </ReactMarkdown>
                                            </div>
                                        )}
                                        <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                                            {linkedArtifact.owner_id && (
                                                <div>
                                                    <span className="font-medium text-slate-500">Owner: </span>
                                                    <PersonName personId={linkedArtifact.owner_id} />
                                                </div>
                                            )}
                                            {linkedArtifact.stakeholder_id && (
                                                <div>
                                                    <span className="font-medium text-slate-500">Stakeholder: </span>
                                                    <PersonName personId={linkedArtifact.stakeholder_id} />
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}

                                {/* Use Case - render description, trigger, actor, preconditions, MSS, postconditions */}
                                {selectedLink.target_artifact_type === 'use_case' && (
                                    <div className="space-y-3">
                                        {linkedArtifact.description && (
                                            <div className="prose prose-sm max-w-none">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {linkedArtifact.description}
                                                </ReactMarkdown>
                                            </div>
                                        )}
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            {linkedArtifact.trigger && (
                                                <div>
                                                    <span className="font-medium text-slate-500">Trigger: </span>
                                                    <span className="text-slate-900">{linkedArtifact.trigger}</span>
                                                </div>
                                            )}
                                            {linkedArtifact.primary_actor && (
                                                <div>
                                                    <span className="font-medium text-slate-500">Primary Actor: </span>
                                                    <span className="text-slate-900">{linkedArtifact.primary_actor.name || linkedArtifact.primary_actor}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Preconditions */}
                                        {linkedArtifact.preconditions && linkedArtifact.preconditions.length > 0 && (
                                            <div>
                                                <h5 className="text-sm font-semibold text-slate-700 mb-1">Preconditions</h5>
                                                <ul className="text-sm text-slate-600 list-disc list-inside space-y-0.5">
                                                    {linkedArtifact.preconditions.map((pc: any, idx: number) => (
                                                        <li key={idx}>{pc.text || pc}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* MSS */}
                                        {linkedArtifact.mss && linkedArtifact.mss.length > 0 && (
                                            <div>
                                                <h5 className="text-sm font-semibold text-slate-700 mb-1">Main Success Scenario</h5>
                                                <ol className="text-sm text-slate-600 list-decimal list-inside space-y-0.5">
                                                    {linkedArtifact.mss.map((step: any, idx: number) => (
                                                        <li key={idx}>{step.description || step}</li>
                                                    ))}
                                                </ol>
                                            </div>
                                        )}

                                        {/* Postconditions */}
                                        {linkedArtifact.postconditions && linkedArtifact.postconditions.length > 0 && (
                                            <div>
                                                <h5 className="text-sm font-semibold text-slate-700 mb-1">Postconditions</h5>
                                                <ul className="text-sm text-slate-600 list-disc list-inside space-y-0.5">
                                                    {linkedArtifact.postconditions.map((pc: any, idx: number) => (
                                                        <li key={idx}>{pc.text || pc}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Requirement - show text */}
                                {selectedLink.target_artifact_type === 'requirement' && 'text' in linkedArtifact && linkedArtifact.text && (
                                    <div className="prose prose-sm max-w-none">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {linkedArtifact.text}
                                        </ReactMarkdown>
                                    </div>
                                )}

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

                                {/* Component - show description */}
                                {selectedLink.target_artifact_type === 'component' && 'description' in linkedArtifact && linkedArtifact.description && (
                                    <p className="text-sm text-slate-700">{linkedArtifact.description}</p>
                                )}

                                {/* Document - show details */}
                                {selectedLink.target_artifact_type === 'document' && (
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-4 text-sm not-prose">
                                            <div>
                                                <span className="font-medium text-slate-500">Type: </span>
                                                <span className="text-slate-900 capitalize">{('document_type' in linkedArtifact ? (linkedArtifact as any).document_type : 'Unknown')}</span>
                                            </div>
                                            <div>
                                                <span className="font-medium text-slate-500">MIME: </span>
                                                <span className="text-slate-900">{('mime_type' in linkedArtifact ? (linkedArtifact as any).mime_type : '-')}</span>
                                            </div>
                                        </div>

                                        {('description' in linkedArtifact && linkedArtifact.description) && (
                                            <div className="prose prose-sm max-w-none">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {linkedArtifact.description}
                                                </ReactMarkdown>
                                            </div>
                                        )}

                                        {'document_type' in linkedArtifact && (linkedArtifact as any).document_type === 'url' && 'content_url' in linkedArtifact && (
                                            <a
                                                href={(linkedArtifact as any).content_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-blue-600 hover:underline mt-2"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                                {(linkedArtifact as any).content_url}
                                            </a>
                                        )}

                                        {'document_type' in linkedArtifact && (linkedArtifact as any).document_type === 'text' && 'content_text' in linkedArtifact && (
                                            <div className="prose prose-sm max-w-none mt-2 p-3 bg-slate-50 rounded border border-slate-200">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {(linkedArtifact as any).content_text || '_No content provided_'}
                                                </ReactMarkdown>
                                            </div>
                                        )}

                                        {'document_type' in linkedArtifact && (linkedArtifact as any).document_type === 'file' && 'content_url' in linkedArtifact && (
                                            <div className="mt-2 border border-slate-200 rounded overflow-hidden">
                                                {(linkedArtifact as any).mime_type === 'application/pdf' ? (
                                                    <iframe
                                                        src={(linkedArtifact as any).content_url}
                                                        className="w-full"
                                                        style={{ height: '600px' }}
                                                        title="PDF Document"
                                                    />
                                                ) : (linkedArtifact as any).mime_type?.startsWith('image/') ? (
                                                    <img
                                                        src={(linkedArtifact as any).content_url}
                                                        alt="Document"
                                                        className="max-w-full h-auto"
                                                    />
                                                ) : (
                                                    <div className="p-4 bg-slate-50">
                                                        <a
                                                            href={(linkedArtifact as any).content_url}
                                                            download
                                                            className="flex items-center gap-2 text-blue-600 hover:underline"
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                            Download {(linkedArtifact as any).mime_type || 'file'}
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
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
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
                    <div className="prose max-w-none">
                        {artifactType === 'need' && (
                            <NeedPresentation artifact={artifact} />
                        )}
                        {artifactType === 'use_case' && (
                            <UseCasePresentation artifact={artifact} />
                        )}
                        {artifactType === 'requirement' && (
                            <RequirementPresentation artifact={artifact} />
                        )}
                        {artifactType === 'vision' && (
                            <VisionPresentation artifact={artifact} />
                        )}
                    </div>
                </div>
            </div>

            {/* Status Change Confirmation Dialog */}
            {showStatusDialog && (
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
            )}
        </div>
    );
}

// Presentation components for each artifact type
function NeedPresentation({ artifact }: { artifact: any }) {
    return (
        <>
            <div className="grid grid-cols-2 gap-4 mb-3 not-prose">
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

            <h3 className="text-lg font-semibold text-slate-900 mt-3 mb-2">Description</h3>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {artifact.description || 'No description provided.'}
            </ReactMarkdown>

            {artifact.rationale && (
                <>
                    <h3 className="text-lg font-semibold text-slate-900 mt-3 mb-2">Rationale</h3>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {artifact.rationale}
                    </ReactMarkdown>
                </>
            )}
        </>
    );
}

function UseCasePresentation({ artifact }: { artifact: any }) {
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

            <h3 className="text-lg font-semibold text-slate-900 mt-3 mb-2">Description</h3>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {artifact.description || 'No description provided.'}
            </ReactMarkdown>

            {artifact.trigger && (
                <>
                    <h3 className="text-lg font-semibold text-slate-900 mt-3 mb-2">Trigger</h3>
                    <p>{artifact.trigger}</p>
                </>
            )}

            {artifact.preconditions && artifact.preconditions.length > 0 && (
                <>
                    <h3 className="text-lg font-semibold text-slate-900 mt-3 mb-2">Preconditions</h3>
                    <ol>
                        {artifact.preconditions.map((p: any, i: number) => (
                            <li key={i}>{p.text}</li>
                        ))}
                    </ol>
                </>
            )}

            {artifact.mss && artifact.mss.length > 0 && (
                <>
                    <h3 className="text-lg font-semibold text-slate-900 mt-3 mb-2">Main Success Scenario</h3>
                    <ol>
                        {artifact.mss.map((step: any, i: number) => (
                            <li key={i}>
                                <strong>{step.actor}:</strong> {step.description}
                            </li>
                        ))}
                    </ol>
                </>
            )}

            {artifact.extensions && artifact.extensions.length > 0 && (
                <>
                    <h3 className="text-lg font-semibold text-slate-900 mt-3 mb-2">Extensions</h3>
                    <ul>
                        {artifact.extensions.map((ext: any, i: number) => (
                            <li key={i}>
                                <strong>{ext.step}:</strong> {ext.condition} → {ext.handling}
                            </li>
                        ))}
                    </ul>
                </>
            )}

            {artifact.postconditions && artifact.postconditions.length > 0 && (
                <>
                    <h3 className="text-lg font-semibold text-slate-900 mt-3 mb-2">Postconditions</h3>
                    <ol>
                        {artifact.postconditions.map((p: any, i: number) => (
                            <li key={i}>{p.text}</li>
                        ))}
                    </ol>
                </>
            )}

            {artifact.stakeholders && artifact.stakeholders.length > 0 && (
                <>
                    <h3 className="text-lg font-semibold text-slate-900 mt-3 mb-2">Stakeholders</h3>
                    <ul>
                        {artifact.stakeholders.map((s: any, i: number) => (
                            <li key={i}>{s.name}</li>
                        ))}
                    </ul>
                </>
            )}
        </>
    );
}

function RequirementPresentation({ artifact }: { artifact: any }) {
    return (
        <>
            <div className="grid grid-cols-3 gap-4 mb-3 not-prose">
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
                <div>
                    <span className="text-sm font-medium text-slate-500">EARS Type</span>
                    <p className="text-slate-900">{artifact.ears_type || 'N/A'}</p>
                </div>
                <div>
                    <span className="text-sm font-medium text-slate-500">Owner</span>
                    <p className="text-slate-900">{artifact.owner || 'N/A'}</p>
                </div>
            </div>

            <h3 className="text-lg font-semibold text-slate-900 mt-3 mb-2">Requirement Text</h3>
            <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {artifact.text}
                </ReactMarkdown>
            </div>

            {artifact.ears_trigger && (
                <>
                    <h4>Trigger</h4>
                    <p>{artifact.ears_trigger}</p>
                </>
            )}

            {artifact.ears_state && (
                <>
                    <h4>State</h4>
                    <p>{artifact.ears_state}</p>
                </>
            )}

            {artifact.ears_condition && (
                <>
                    <h4>Condition</h4>
                    <p>{artifact.ears_condition}</p>
                </>
            )}

            {artifact.ears_feature && (
                <>
                    <h4>Feature</h4>
                    <p>{artifact.ears_feature}</p>
                </>
            )}

            {artifact.rationale && (
                <>
                    <h3 className="text-lg font-semibold text-slate-900 mt-3 mb-2">Rationale</h3>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {artifact.rationale}
                    </ReactMarkdown>
                </>
            )}
        </>
    );
}

function VisionPresentation({ artifact }: { artifact: any }) {
    return (
        <>
            {artifact.statement && (
                <>
                    <h3 className="text-lg font-semibold text-slate-900 mt-3 mb-2">Vision Statement</h3>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {artifact.statement}
                    </ReactMarkdown>
                </>
            )}

            {artifact.description && (
                <>
                    <h3 className="text-lg font-semibold text-slate-900 mt-3 mb-2">Description</h3>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {artifact.description}
                    </ReactMarkdown>
                </>
            )}
        </>
    );
}
