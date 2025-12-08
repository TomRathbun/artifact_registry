import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LinkageService } from '../client/services/LinkageService';
import { ProjectsService } from '../client/services/ProjectsService';
import type { LinkageCreate } from '../client/models/LinkageCreate';
import { Link as LinkIcon, Plus, Trash2, ExternalLink, Eye, Search, Edit, Filter, ArrowUp, ArrowDown } from 'lucide-react';
import ArtifactSelector from './ArtifactSelector';
import axios from 'axios';

// Enum matching backend
enum LinkType {
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
function DiagramName({ diagramId }: { diagramId: string }) {
    const { data: diagram } = useQuery({
        queryKey: ['diagram', diagramId],
        queryFn: async () => {
            try {
                const response = await axios.get(`/api/v1/diagrams/${diagramId}`);
                return response.data;
            } catch (error) {
                return null;
            }
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
            try {
                const response = await axios.get(`/api/v1/components/${componentId}`);
                return response.data;
            } catch (error) {
                return null;
            }
        },
        enabled: !!componentId,
    });

    return <span>{component?.name || componentId}</span>;
}

export default function LinkageListView() {
    const { projectId } = useParams<{ projectId: string }>();
    const queryClient = useQueryClient();

    // Fetch project details to determine the real UUID
    const { data: project } = useQuery({
        queryKey: ['project', projectId],
        queryFn: () => ProjectsService.getProjectApiV1ProjectsProjectsProjectIdGet(projectId!),
        enabled: !!projectId
    });

    const [isAdding, setIsAdding] = useState(false);
    const [editingLinkage, setEditingLinkage] = useState<any>(null);
    const [newLinkType, setNewLinkType] = useState<LinkType>(LinkType.TRACES_TO);

    const [sourceType, setSourceType] = useState('need');
    const [sourceId, setSourceId] = useState('');

    const [targetType, setTargetType] = useState('need');
    const [targetId, setTargetId] = useState('');
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);
    const [selectorMode, setSelectorMode] = useState<'source' | 'target'>('target');

    // Filter & Sort States
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' | null }>({ key: null, direction: null });
    const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>({});
    const [activeFilterDropdown, setActiveFilterDropdown] = useState<string | null>(null);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = () => {
            if (activeFilterDropdown) {
                setActiveFilterDropdown(null);
            }
        };
        if (activeFilterDropdown) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [activeFilterDropdown]);

    // Fetch all linkages
    const { data: linkages, isLoading } = useQuery({
        queryKey: ['linkages', 'all', project?.id],
        queryFn: () => LinkageService.listLinkagesApiV1LinkageLinkagesGet(project!.id),
        enabled: !!project?.id,
    });

    // Filtering and Sorting Logic
    const getFilteredAndSortedLinkages = () => {
        if (!linkages) return [];

        let filtered = linkages;

        // Global Search
        if (debouncedSearch) {
            const lowerSearch = debouncedSearch.toLowerCase();
            filtered = filtered.filter((l: any) =>
                l.source_id.toLowerCase().includes(lowerSearch) ||
                l.target_id.toLowerCase().includes(lowerSearch) ||
                l.relationship_type.toLowerCase().includes(lowerSearch) ||
                l.source_artifact_type.toLowerCase().includes(lowerSearch) ||
                l.target_artifact_type.toLowerCase().includes(lowerSearch)
            );
        }

        // Column Filters
        filtered = filtered.filter((l: any) => {
            return Object.entries(columnFilters).every(([key, values]) => {
                if (!values || values.length === 0) return true;
                return values.includes(l[key]);
            });
        });

        // Sorting
        if (sortConfig.key && sortConfig.direction) {
            filtered = [...filtered].sort((a: any, b: any) => {
                const aValue = a[sortConfig.key!] || '';
                const bValue = b[sortConfig.key!] || '';

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return filtered;
    };

    const getUniqueValuesForColumn = (key: string): string[] => {
        if (!linkages) return [];
        const values = linkages.map((l: any) => l[key] || '');
        return [...new Set(values)].filter(v => v).sort() as string[];
    };

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' | null = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = null;
        }
        setSortConfig({ key: direction ? key : null, direction });
    };

    const toggleFilter = (key: string, value: string) => {
        setColumnFilters(prev => {
            const current = prev[key] || [];
            const updated = current.includes(value)
                ? current.filter(v => v !== value)
                : [...current, value];
            return { ...prev, [key]: updated };
        });
    };

    const clearColumnFilter = (key: string) => {
        setColumnFilters(prev => {
            const updated = { ...prev };
            delete updated[key];
            return updated;
        });
    };

    const clearAllFilters = () => {
        setSearch('');
        setDebouncedSearch('');
        setSortConfig({ key: null, direction: null });
        setColumnFilters({});
    };

    const filteredLinkages = getFilteredAndSortedLinkages();

    // Mutations
    const createMutation = useMutation({
        mutationFn: (payload: LinkageCreate) => LinkageService.createLinkageApiV1LinkageLinkagesPost(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['linkages', 'all', project?.id] });
            setIsAdding(false);
            setSourceId('');
            setTargetId('');
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ aid, payload }: { aid: string; payload: LinkageCreate }) =>
            LinkageService.updateLinkageApiV1LinkageLinkagesAidPut(aid, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['linkages', 'all', project?.id] });
            setEditingLinkage(null);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (aid: string) => LinkageService.deleteLinkageApiV1LinkageLinkagesAidDelete(aid),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['linkages', 'all', project?.id] });
        },
    });

    const handleAddLinkage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!project?.id) return;

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
            project_id: project.id,
        });
    };

    const handleUpdateLinkage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingLinkage || !project?.id) return;

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
                project_id: project.id,
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
                <div className='flex gap-2'>
                    {(search || sortConfig.key || Object.keys(columnFilters).length > 0) && (
                        <button
                            onClick={clearAllFilters}
                            className="px-3 py-2 bg-slate-600 text-white rounded hover:bg-slate-700 transition-colors flex items-center gap-2"
                            title="Clear all filters and sorting"
                        >
                            <Filter className="w-4 h-4" />
                            Clear Filters
                        </button>
                    )}
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        {isAdding ? 'Cancel' : 'Add Linkage'}
                    </button>
                </div>
            </div>

            {/* Quick Search */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search linkages..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="px-3 py-2 border rounded w-full md:w-64"
                />
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
                                                <DiagramName diagramId={sourceId} />
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
                                                        <DiagramName diagramId={targetId} />
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
                    projectId={project?.id || ''}
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
            ) : filteredLinkages && filteredLinkages.length > 0 ? (
                <div className="bg-white rounded-lg border border-slate-200 overflow-visible shadow-sm">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                {[
                                    { key: 'source_artifact_type', label: 'Source Type' },
                                    { key: 'source_id', label: 'Source ID' },
                                    { key: 'relationship_type', label: 'Relationship' },
                                    { key: 'target_artifact_type', label: 'Target Type' },
                                    { key: 'target_id', label: 'Target ID' }
                                ].map((col) => (
                                    <th
                                        key={col.key}
                                        className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider relative group select-none"
                                    >
                                        <div className="flex items-center gap-1">
                                            <div
                                                className="flex items-center gap-1 cursor-pointer hover:bg-slate-200 px-1 py-0.5 rounded"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveFilterDropdown(activeFilterDropdown === col.key ? null : col.key);
                                                }}
                                            >
                                                <Filter className={`w-3 h-3 ${columnFilters[col.key]?.length > 0 ? 'text-blue-600' : 'text-slate-400'}`} />
                                                {columnFilters[col.key]?.length > 0 && (
                                                    <span className="text-xs bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center">
                                                        {columnFilters[col.key].length}
                                                    </span>
                                                )}
                                            </div>
                                            <div
                                                className="cursor-pointer hover:bg-slate-200 px-1 py-0.5 rounded flex items-center gap-1"
                                                onClick={() => handleSort(col.key)}
                                            >
                                                {col.label}
                                                {sortConfig.key === col.key && (
                                                    <span className="text-slate-600">
                                                        {sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Filter Dropdown */}
                                        {activeFilterDropdown === col.key && (
                                            <div className="absolute top-full left-0 mt-1 bg-white border rounded-md shadow-lg z-50 min-w-[200px] max-h-[300px] overflow-y-auto normal-case">
                                                <div className="sticky top-0 bg-slate-50 p-2 border-b flex justify-between items-center">
                                                    <span className="text-xs font-medium text-slate-600">Filter by {col.label}</span>
                                                    {columnFilters[col.key]?.length > 0 && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                clearColumnFilter(col.key);
                                                            }}
                                                            className="text-xs text-blue-600 hover:text-blue-800"
                                                        >
                                                            Clear
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="p-1">
                                                    {getUniqueValuesForColumn(col.key).map((value: string) => (
                                                        <label
                                                            key={value}
                                                            className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 cursor-pointer rounded"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={columnFilters[col.key]?.includes(value) || false}
                                                                onChange={() => toggleFilter(col.key, value)}
                                                                className="w-3 h-3 text-blue-600 rounded"
                                                            />
                                                            <span className="text-sm truncate">{value}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </th>
                                ))}
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {filteredLinkages.map((link: any) => (
                                <tr key={link.aid} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                            {link.source_artifact_type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                        {link.source_artifact_type === 'diagram' ? (
                                            <DiagramName diagramId={link.source_id || ''} />
                                        ) : link.source_artifact_type === 'component' ? (
                                            <ComponentName componentId={link.source_id || ''} />
                                        ) : (
                                            link.source_id
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-blue-600">
                                        <span className="bg-blue-50 px-3 py-1 rounded-full text-left inline-block w-full text-center">
                                            {link.relationship_type}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded inline-block">
                                            {link.target_artifact_type}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4 text-sm text-slate-900">
                                        <div className="flex flex-col gap-1">
                                            {link.target_artifact_type === 'url' ? (
                                                <a
                                                    href={link.target_id || '#'}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-blue-600 hover:underline break-all max-w-md"
                                                    title={link.target_id || ''}
                                                >
                                                    {link.target_id}
                                                </a>
                                            ) : link.target_artifact_type === 'diagram' ? (
                                                <DiagramName diagramId={link.target_id || ''} />
                                            ) : link.target_artifact_type === 'component' ? (
                                                <ComponentName componentId={link.target_id || ''} />
                                            ) : (
                                                <span className="whitespace-nowrap">{link.target_id}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end items-center gap-2">
                                            {/* View/Open button */}
                                            {link.target_artifact_type === 'url' ? (
                                                <a
                                                    href={link.target_id || ''}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="p-1 text-slate-400 hover:text-blue-600 transition-colors rounded hover:bg-blue-50"
                                                    title="Open in New Tab"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            ) : (
                                                <RouterLink
                                                    to={
                                                        link.target_artifact_type === 'diagram'
                                                            ? `/project/${projectId}/diagrams/${link.target_id}`
                                                            : link.target_artifact_type === 'component'
                                                                ? `/project/${projectId}/components`
                                                                : `/project/${projectId}/${link.target_artifact_type}/${link.target_id}`
                                                    }
                                                    className="p-1 text-slate-400 hover:text-blue-600 transition-colors rounded hover:bg-blue-50"
                                                    title="Open"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </RouterLink>
                                            )}

                                            {/* Edit button */}
                                            <button
                                                onClick={() => setEditingLinkage(link)}
                                                className="p-1 text-slate-400 hover:text-blue-600 transition-colors rounded hover:bg-blue-50"
                                                title="Edit Linkage"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>

                                            {/* Delete button */}
                                            <button
                                                onClick={() => deleteMutation.mutate(link.aid)}
                                                className="p-1 text-slate-400 hover:text-red-600 transition-colors rounded hover:bg-red-50"
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
            ) : linkages && linkages.length > 0 ? (
                <div className="text-center py-12 text-slate-500">
                    <Filter className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p className="text-lg font-medium mb-2">No linkages match your filters</p>
                    <button
                        onClick={clearAllFilters}
                        className="text-blue-600 hover:text-blue-700 underline"
                    >
                        Clear all filters
                    </button>
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
