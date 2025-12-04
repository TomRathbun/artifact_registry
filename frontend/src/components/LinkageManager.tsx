import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LinkageService } from '../client/services/LinkageService';
import type { LinkageCreate } from '../client/models/LinkageCreate';
import { Link as LinkIcon, ExternalLink, Eye, Trash2, Search } from 'lucide-react';
import ArtifactSelector from './ArtifactSelector';

// Alias Link from router to avoid conflict with LinkIcon
const Link = RouterLink;

// Enum matching backend
export enum LinkType {
    DERIVES_FROM = "derives_from",
    SATISFIES = "satisfies",
    REFINES = "refines",
    VERIFIES = "verifies",
    PARENT = "parent",
    TRACES_TO = "traces_to",
    DEPENDS_ON = "depends_on",
    ILLUSTRATED_BY = "illustrated_by",
    DOCUMENTED_IN = "documented_in",
    ALLOCATED_TO = "allocated_to",
    RELATED_TO = "related_to"
}

// Helper function to get description for each link type
function getLinkTypeDescription(linkType: LinkType): string {
    const descriptions: Record<LinkType, string> = {
        [LinkType.DERIVES_FROM]: "Use Case derives from Need, Requirement derives from Use Case, etc.",
        [LinkType.SATISFIES]: "Requirement satisfies Need, Test verifies Requirement",
        [LinkType.REFINES]: "Lower-level artifact refines higher-level artifact",
        [LinkType.VERIFIES]: "Test Case verifies Requirement",
        [LinkType.PARENT]: "Tree hierarchy (e.g., parent Need)",
        [LinkType.TRACES_TO]: "Mission Need → Technical Need, Need → Vision (inverse of derives_from)",
        [LinkType.DEPENDS_ON]: "Need A depends on Need B (risk chaining)",
        [LinkType.ILLUSTRATED_BY]: "Need/Req → Diagram, Confluence page, OnePager",
        [LinkType.DOCUMENTED_IN]: "Need/Req → CONOPS, ICD, MOSA Plan, BOM",
        [LinkType.ALLOCATED_TO]: "Requirement → System Component (Network Stack, VDI, etc.)",
        [LinkType.RELATED_TO]: "Catch-all for peer relationships"
    };
    return descriptions[linkType] || "";
}

// Component to fetch and display diagram name
function DiagramName({ diagramId, projectId }: { diagramId: string; projectId: string }) {
    const { data: diagram } = useQuery({
        queryKey: ['diagram', diagramId],
        queryFn: async () => {
            const response = await fetch(`/api/v1/diagrams/${diagramId}`);
            if (!response.ok) return null;
            return response.json();
        },
        enabled: !!diagramId,
    });

    return <span>{diagram?.name || diagramId}</span>;
}

// Component to fetch and display component name
function ComponentName({ componentId }: { componentId: string }) {
    const { data: component } = useQuery({
        queryKey: ['component', componentId],
        queryFn: async () => {
            const response = await fetch(`/api/v1/components/${componentId}`);
            if (!response.ok) return null;
            return response.json();
        },
        enabled: !!componentId,
    });

    return <span>{component?.name || componentId}</span>;
}

interface LinkageManagerProps {
    sourceArtifactType: string;
    sourceId: string;
    projectId: string;
}

export const LinkageManager: React.FC<LinkageManagerProps> = ({ sourceArtifactType, sourceId, projectId }) => {
    const queryClient = useQueryClient();
    const [newLinkType, setNewLinkType] = useState<LinkType>(LinkType.TRACES_TO);
    const [targetId, setTargetId] = useState('');
    const [targetType, setTargetType] = useState('need');
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);

    // Fetch existing linkages
    const { data: linkages, isLoading } = useQuery({
        queryKey: ['linkages', sourceId],
        queryFn: () => LinkageService.getOutgoingLinkagesApiV1LinkageLinkagesFromSourceAidGet(sourceId),
    });

    // Create mutation
    const createMutation = useMutation({
        mutationFn: (payload: LinkageCreate) => LinkageService.createLinkageApiV1LinkageLinkagesPost(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['linkages', sourceId] });
            setTargetId('');
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (aid: string) => LinkageService.deleteLinkageApiV1LinkageLinkagesAidDelete(aid),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['linkages', sourceId] });
        },
    });

    const handleAddLinkage = (e: React.FormEvent) => {
        e.preventDefault();

        // Simple heuristic for target type if it looks like a URL
        let finalTargetType = targetType;
        if (targetId.startsWith('http://') || targetId.startsWith('https://')) {
            finalTargetType = 'url';
        }

        createMutation.mutate({
            source_artifact_type: sourceArtifactType,
            source_id: sourceId,
            target_artifact_type: finalTargetType,
            target_id: targetId,
            relationship_type: newLinkType,
            project_id: projectId,
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <LinkIcon className="w-5 h-5 mr-2" />
                    Existing Linkages
                </h3>

                {isLoading ? (
                    <div className="text-slate-500">Loading linkages...</div>
                ) : linkages && linkages.length > 0 ? (
                    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Relationship</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Source</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">→</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Target</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {linkages.map((link) => (
                                    <tr key={link.aid}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                            {link.relationship_type}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {link.source_id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-slate-400">
                                            →
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                            {link.target_artifact_type === 'url' ? (
                                                <a href={link.target_id || '#'} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                                                    {link.target_id}
                                                </a>
                                            ) : link.target_artifact_type === 'diagram' ? (
                                                <DiagramName diagramId={link.target_id || ''} projectId={projectId} />
                                            ) : link.target_artifact_type === 'component' ? (
                                                <ComponentName componentId={link.target_id || ''} />
                                            ) : (
                                                link.target_id
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end items-center gap-3">
                                                {/* Open Actions */}
                                                {(() => {
                                                    const isUrl = link.target_artifact_type === 'url';
                                                    const targetUrl = isUrl
                                                        ? (link.target_id || '')
                                                        : link.target_artifact_type === 'diagram'
                                                            ? `/project/${projectId}/diagrams/${link.target_id}`
                                                            : link.target_artifact_type === 'component'
                                                                ? `/project/${projectId}/components`
                                                                : `/project/${projectId}/${link.target_artifact_type}/${link.target_id}`;

                                                    return (
                                                        <>
                                                            {/* Open in New Tab */}
                                                            <a
                                                                href={targetUrl}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="text-slate-400 hover:text-blue-600 transition-colors"
                                                                title="Open in New Tab"
                                                            >
                                                                <ExternalLink className="w-4 h-4" />
                                                            </a>

                                                            {/* Open in Current Tab (Internal only) */}
                                                            {!isUrl && (
                                                                <Link
                                                                    to={targetUrl}
                                                                    className="text-slate-400 hover:text-blue-600 transition-colors"
                                                                    title="Open"
                                                                >
                                                                    <Eye className="w-4 h-4" />
                                                                </Link>
                                                            )}
                                                        </>
                                                    );
                                                })()}

                                                {/* Delete Action */}
                                                <button
                                                    onClick={() => deleteMutation.mutate(link.aid)}
                                                    className="text-slate-400 hover:text-red-600 transition-colors"
                                                    title="Delete Linkage"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-slate-500 italic">No linkages found.</div>
                )}
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h3 className="text-md font-semibold mb-3">Add New Linkage</h3>
                <form onSubmit={handleAddLinkage} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Relationship Type</label>
                        <select
                            value={newLinkType}
                            onChange={(e) => setNewLinkType(e.target.value as LinkType)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <optgroup label="Vertical Traceability">
                                <option value={LinkType.DERIVES_FROM}>derives_from</option>
                                <option value={LinkType.SATISFIES}>satisfies</option>
                                <option value={LinkType.REFINES}>refines</option>
                                <option value={LinkType.VERIFIES}>verifies</option>
                                <option value={LinkType.PARENT}>parent</option>
                            </optgroup>
                            <optgroup label="Lateral & Supporting">
                                <option value={LinkType.TRACES_TO}>traces_to</option>
                                <option value={LinkType.DEPENDS_ON}>depends_on</option>
                                <option value={LinkType.ILLUSTRATED_BY}>illustrated_by</option>
                                <option value={LinkType.DOCUMENTED_IN}>documented_in</option>
                                <option value={LinkType.ALLOCATED_TO}>allocated_to</option>
                                <option value={LinkType.RELATED_TO}>related_to</option>
                            </optgroup>
                        </select>
                        <p className="text-xs text-slate-500 mt-1">
                            {getLinkTypeDescription(newLinkType)}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Target Artifact</label>
                        <select
                            value={targetType}
                            onChange={(e) => setTargetType(e.target.value)}
                            className="w-1/4 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="need">Need</option>
                            <option value="requirement">Requirement</option>
                            <option value="use_case">Use Case</option>
                            <option value="vision">Vision</option>
                            <option value="diagram">Diagram</option>
                            <option value="component">Component</option>
                            <option value="url">URL/External</option>
                        </select>
                        <div className="flex-1">
                            {targetType === 'url' ? (
                                <input
                                    type="text"
                                    value={targetId}
                                    onChange={(e) => setTargetId(e.target.value)}
                                    placeholder="https://example.com..."
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setIsSelectorOpen(true)}
                                    className={`w-full px-3 py-2 border rounded-md text-left flex justify-between items-center ${targetId ? 'border-slate-300 text-slate-900' : 'border-slate-300 text-slate-400'
                                        } hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                >
                                    <span>{targetId || `Select ${targetType}...`}</span>
                                    <Search className="w-4 h-4 text-slate-400" />
                                </button>
                            )}
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={createMutation.isPending || (!targetId && targetType !== 'url')} // specific check might be needed
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                        {createMutation.isPending ? 'Adding...' : 'Add Linkage'}
                    </button>
                </form>
            </div>

            {isSelectorOpen && (
                <ArtifactSelector
                    projectId={projectId}
                    artifactType={targetType}
                    onSelect={(id) => {
                        setTargetId(id);
                        setIsSelectorOpen(false);
                    }}
                    onCancel={() => setIsSelectorOpen(false)}
                />
            )}
        </div>
    );
};
