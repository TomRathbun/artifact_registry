import React, { useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LinkageService } from '../client/services/LinkageService';
import type { LinkageCreate } from '../client/models/LinkageCreate';
import { Link as LinkIcon, Plus, Trash2, ExternalLink, Eye, Search, Pencil } from 'lucide-react';
import { LinkType } from './LinkageManager'; // Reuse enum
import ArtifactSelector from './ArtifactSelector';

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

export default function LinkageListView() {
    const { projectId } = useParams<{ projectId: string }>();
    const queryClient = useQueryClient();

    const [isAdding, setIsAdding] = useState(false);
    const [editingLinkage, setEditingLinkage] = useState<any>(null);
    const [newLinkType, setNewLinkType] = useState<LinkType>(LinkType.TRACES_TO);

    const [sourceType, setSourceType] = useState('need');
    const [sourceId, setSourceId] = useState('');

    const [targetType, setTargetType] = useState('need');
    const [targetId, setTargetId] = useState('');
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);
    const [selectorMode, setSelectorMode] = useState<'source' | 'target'>('target');

    // Fetch all linkages for project
    const { data: linkages, isLoading } = useQuery({
        queryKey: ['linkages', 'all', projectId],
        queryFn: () => LinkageService.listLinkagesApiV1LinkageLinkagesGet(projectId),
    });

    // Create mutation
    const createMutation = useMutation({
        mutationFn: (payload: LinkageCreate) => LinkageService.createLinkageApiV1LinkageLinkagesPost(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['linkages', 'all', projectId] });
            setIsAdding(false);
            setSourceId('');
            setTargetId('');
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ aid, payload }: { aid: string; payload: LinkageCreate }) =>
            LinkageService.updateLinkageApiV1LinkageLinkagesAidPut(aid, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['linkages', 'all', projectId] });
            setEditingLinkage(null);
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (aid: string) => LinkageService.deleteLinkageApiV1LinkageLinkagesAidDelete(aid),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['linkages', 'all', projectId] });
        },
    });

    const handleAddLinkage = (e: React.FormEvent) => {
        e.preventDefault();

        let finalTargetType = targetType;
        if (targetId.startsWith('http://') || targetId.startsWith('https://')) {
            finalTargetType = 'url';
        }

        createMutation.mutate({
            source_artifact_type: sourceType,
            source_id: sourceId,
            target_artifact_type: finalTargetType,
            target_id: targetId,
            relationship_type: newLinkType,
            project_id: projectId,
        });
    };

    const handleUpdateLinkage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingLinkage) return;

        let finalTargetType = editingLinkage.target_artifact_type;
        if (editingLinkage.target_id?.startsWith('http://') || editingLinkage.target_id?.startsWith('https://')) {
            finalTargetType = 'url';
        }

        updateMutation.mutate({
            aid: editingLinkage.aid,
            payload: {
                source_artifact_type: editingLinkage.source_artifact_type,
                source_id: editingLinkage.source_id,
                target_artifact_type: finalTargetType,
                target_id: editingLinkage.target_id,
                relationship_type: editingLinkage.relationship_type,
                project_id: projectId,
            },
        });
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-900 flex items-center">
                    <LinkIcon className="w-6 h-6 mr-2" />
                    All Linkages
                </h1>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    {isAdding ? 'Cancel' : 'Add Linkage'}
                </button>
            </div>

            {isAdding && (
                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm mb-6">
                    <h3 className="text-lg font-semibold mb-4">Create New Linkage</h3>
                    <form onSubmit={handleAddLinkage} className="space-y-4">
                        {/* Source */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">Source</label>
                            <div className="flex gap-2">
                                <select
                                    value={sourceType}
                                    onChange={(e) => {
                                        setSourceType(e.target.value);
                                        setSourceId('');
                                    }}
                                    className="w-1/4 px-3 py-2 border border-slate-300 rounded-md"
                                >
                                    <option value="need">Need</option>
                                    <option value="requirement">Requirement</option>
                                    <option value="use_case">Use Case</option>
                                    <option value="vision">Vision</option>
                                    <option value="diagram">Diagram</option>
                                    <option value="component">Component</option>
                                </select>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectorMode('source');
                                        setIsSelectorOpen(true);
                                    }}
                                    className={`flex-1 px-3 py-2 border rounded-md text-left flex justify-between items-center ${sourceId ? 'border-slate-300 text-slate-900' : 'border-slate-300 text-slate-400'
                                        } hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                >
                                    <span className="truncate">
                                        {sourceId ? (
                                            sourceType === 'diagram' ? (
                                                <DiagramName diagramId={sourceId} projectId={projectId || ''} />
                                            ) : sourceType === 'component' ? (
                                                <ComponentName componentId={sourceId} />
                                            ) : (
                                                sourceId
                                            )
                                        ) : (
                                            `Select ${sourceType}...`
                                        )}
                                    </span>
                                    <Search className="w-4 h-4 text-slate-400 flex-shrink-0 ml-2" />
                                </button>
                            </div>
                        </div>

                        {/* Relationship */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">Relationship</label>
                            <select
                                value={newLinkType}
                                onChange={(e) => setNewLinkType(e.target.value as LinkType)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md"
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

                        {/* Target */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">Target</label>
                            <div className="flex gap-2">
                                <select
                                    value={targetType}
                                    onChange={(e) => {
                                        setTargetType(e.target.value);
                                        setTargetId('');
                                    }}
                                    className="w-1/4 px-3 py-2 border border-slate-300 rounded-md"
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
                                            onClick={() => {
                                                setSelectorMode('target');
                                                setIsSelectorOpen(true);
                                            }}
                                            className={`w-full px-3 py-2 border rounded-md text-left flex justify-between items-center ${targetId ? 'border-slate-300 text-slate-900' : 'border-slate-300 text-slate-400'
                                                } hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        >
                                            <span className="truncate">
                                                {targetId ? (
                                                    targetType === 'diagram' ? (
                                                        <DiagramName diagramId={targetId} projectId={projectId || ''} />
                                                    ) : targetType === 'component' ? (
                                                        <ComponentName componentId={targetId} />
                                                    ) : (
                                                        targetId
                                                    )
                                                ) : (
                                                    `Select ${targetType}...`
                                                )}
                                            </span>
                                            <Search className="w-4 h-4 text-slate-400 flex-shrink-0 ml-2" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={createMutation.isPending || !sourceId || (!targetId && targetType !== 'url')}
                                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                            >
                                {createMutation.isPending ? 'Creating...' : 'Create Linkage'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {isSelectorOpen && (
                <ArtifactSelector
                    projectId={projectId || ''}
                    artifactType={selectorMode === 'source' ? sourceType : (editingLinkage ? editingLinkage.target_artifact_type : targetType)}
                    onSelect={(id) => {
                        if (editingLinkage) {
                            setEditingLinkage({ ...editingLinkage, target_id: id });
                        } else if (selectorMode === 'source') {
                            setSourceId(id);
                        } else {
                            setTargetId(id);
                        }
                        setIsSelectorOpen(false);
                    }}
                    onCancel={() => setIsSelectorOpen(false)}
                />
            )}

            {/* Edit Modal */}
            {editingLinkage && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold mb-4">Edit Linkage</h3>
                        <form onSubmit={handleUpdateLinkage} className="space-y-4">
                            {/* Source (read-only) */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-700">Source</label>
                                <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-600">
                                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded mr-2">
                                        {editingLinkage.source_artifact_type}
                                    </span>
                                    {editingLinkage.source_id}
                                </div>
                            </div>

                            {/* Relationship */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-700">Relationship</label>
                                <select
                                    value={editingLinkage.relationship_type}
                                    onChange={(e) => setEditingLinkage({ ...editingLinkage, relationship_type: e.target.value as LinkType })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
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
                                    {getLinkTypeDescription(editingLinkage.relationship_type)}
                                </p>
                            </div>

                            {/* Target */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-700">Target</label>
                                <div className="flex gap-2">
                                    <select
                                        value={editingLinkage.target_artifact_type}
                                        onChange={(e) => setEditingLinkage({ ...editingLinkage, target_artifact_type: e.target.value, target_id: '' })}
                                        className="w-1/4 px-3 py-2 border border-slate-300 rounded-md"
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
                                        {editingLinkage.target_artifact_type === 'url' ? (
                                            <input
                                                type="text"
                                                value={editingLinkage.target_id || ''}
                                                onChange={(e) => setEditingLinkage({ ...editingLinkage, target_id: e.target.value })}
                                                placeholder="https://example.com..."
                                                className="w-full px-3 py-2 border border-slate-300 rounded-md"
                                                required
                                            />
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => setIsSelectorOpen(true)}
                                                className={`w-full px-3 py-2 border rounded-md text-left flex justify-between items-center ${editingLinkage.target_id ? 'border-slate-300 text-slate-900' : 'border-slate-300 text-slate-400'
                                                    } hover:border-blue-400`}
                                            >
                                                <span className="truncate">{editingLinkage.target_id || `Select ${editingLinkage.target_artifact_type}...`}</span>
                                                <Search className="w-4 h-4 text-slate-400 flex-shrink-0 ml-2" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setEditingLinkage(null)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={updateMutation.isPending}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isLoading ? (
                <div className="text-center py-12 text-slate-500">Loading linkages...</div>
            ) : linkages && linkages.length > 0 ? (
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Source</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Relationship</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Target</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {linkages.map((link) => (
                                <tr key={link.aid} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded mr-2">
                                            {link.source_artifact_type}
                                        </span>
                                        {link.source_artifact_type === 'diagram' ? (
                                            <DiagramName diagramId={link.source_id || ''} projectId={projectId || ''} />
                                        ) : link.source_artifact_type === 'component' ? (
                                            <ComponentName componentId={link.source_id || ''} />
                                        ) : (
                                            link.source_id
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-blue-600">
                                        <span className="bg-blue-50 px-3 py-1 rounded-full">
                                            {link.relationship_type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded mr-2">
                                            {link.target_artifact_type}
                                        </span>
                                        {link.target_artifact_type === 'url' ? (
                                            <a href={link.target_id || '#'} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                                                {link.target_id}
                                            </a>
                                        ) : link.target_artifact_type === 'diagram' ? (
                                            <DiagramName diagramId={link.target_id || ''} projectId={projectId || ''} />
                                        ) : link.target_artifact_type === 'component' ? (
                                            <ComponentName componentId={link.target_id || ''} />
                                        ) : (
                                            link.target_id
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end items-center gap-2">
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
                                                        {isUrl ? (
                                                            <a
                                                                href={targetUrl}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="text-slate-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-full transition-colors"
                                                                title="Open in New Tab"
                                                            >
                                                                <ExternalLink className="w-4 h-4" />
                                                            </a>
                                                        ) : (
                                                            <RouterLink
                                                                to={targetUrl}
                                                                className="text-slate-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-full transition-colors"
                                                                title="Open"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </RouterLink>
                                                        )}
                                                    </>
                                                );
                                            })()}

                                            <button
                                                onClick={() => setEditingLinkage(link)}
                                                className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-full transition-colors"
                                                title="Edit Linkage"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>

                                            <button
                                                onClick={() => deleteMutation.mutate(link.aid)}
                                                className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-full transition-colors"
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
                <div className="text-center py-12 text-slate-500">
                    <LinkIcon className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p>No linkages found. Create one to get started!</p>
                </div>
            )}
        </div>
    );
}
