import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { ComponentService, ProjectsService } from '../client';
import { Plus, Trash2, Save, X, Link as LinkIcon, Edit, ArrowUp, ArrowDown, Filter } from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';

export default function ComponentManager() {
    const { projectId } = useParams<{ projectId: string }>();
    const queryClient = useQueryClient();
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [managingLinksId, setManagingLinksId] = useState<string | null>(null);

    const { data: project } = useQuery({
        queryKey: ['project', projectId],
        queryFn: () => ProjectsService.getProjectApiV1ProjectsProjectsProjectIdGet(projectId!),
        enabled: !!projectId,
    });

    // Form State
    const [formData, setFormData] = useState<{
        name: string;
        type: string;
        description: string;
        tags: string[];
        lifecycle: string;
        project_id: string | null;
    }>({
        name: '',
        type: 'Software',
        description: '',
        tags: [],
        lifecycle: 'Active',
        project_id: null
    });

    const [tagInput, setTagInput] = useState('');

    const [linkData, setLinkData] = useState({
        child_id: '',
        cardinality: '1',
        type: 'composition',
        protocol: '',
        data_items: ''
    });

    // Filter State


    // New filter/sort state
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' | null }>({
        key: null, direction: null
    });
    const [activeFilterDropdown, setActiveFilterDropdown] = useState<string | null>(null);
    const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>({});
    const [confirmation, setConfirmation] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        isDestructive: boolean;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        isDestructive: false
    });

    const { data: components, isLoading } = useQuery({
        queryKey: ['components'],
        queryFn: () => ComponentService.listComponentsApiV1ComponentsGet(),
    });

    // Valid lifecycles
    const LIFECYCLES = ['Active', 'Legacy', 'Planned', 'Deprecated'];

    // Derived state for autocomplete
    const allTags = useMemo(() => {
        if (!components) return [];
        const tags = new Set<string>();
        components.forEach((c: any) => {
            if (Array.isArray(c.tags)) {
                c.tags.forEach((t: string) => tags.add(t));
            }
        });
        return Array.from(tags).sort();
    }, [components]);

    // Derived state for filtering and sorting
    const filteredComponents = useMemo(() => {
        if (!components) return [];

        // Apply column filters
        let filtered = components.filter((item: any) => {
            return Object.entries(columnFilters).every(([key, values]) => {
                if (!values || values.length === 0) return true;

                // Special handling for tags (array field)
                if (key === 'tags') {
                    const itemTags = item.tags || [];
                    // Check if any of the selected filter values corresponds to one of the component tags
                    return values.some(v => itemTags.includes(v));
                }

                const itemValue = item[key] || '';
                return values.includes(itemValue);
            });
        });

        // Apply sorting
        if (sortConfig.key && sortConfig.direction) {
            filtered = [...filtered].sort((a: any, b: any) => {
                const aValue = a[sortConfig.key!] || '';
                const bValue = b[sortConfig.key!] || '';

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        return filtered;
    }, [components, columnFilters, sortConfig]);

    // Click-outside handler for filter dropdowns
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

    const getUniqueValuesForColumn = (key: string): string[] => {
        if (!components) return [];

        // Special handling for tags (array field)
        if (key === 'tags') {
            const allTags = components.flatMap((item: any) => item.tags || []);
            return [...new Set(allTags)].sort() as string[];
        }

        const values = components.map((item: any) => item[key] || '');
        return [...new Set(values)].filter(v => v).sort() as string[];
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
        setColumnFilters({});
        setSortConfig({ key: null, direction: null });
    };

    const handleSort = (key: string) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleBulkDelete = () => {
        for (const id of selectedItems) {
            deleteMutation.mutate(id);
        }
        setSelectedItems([]);
    };

    const createMutation = useMutation({
        mutationFn: ComponentService.createComponentApiV1ComponentsPost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['components'] });
            setIsCreating(false);
            setFormData({
                name: '',
                type: 'Software',
                description: '',
                tags: [],
                lifecycle: 'Active',
                project_id: null
            });
            setTagInput('');
        },
        onError: (error: any) => {
            alert(`Failed to create component: ${error.body?.detail || error.message}`);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            ComponentService.updateComponentApiV1ComponentsComponentIdPut(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['components'] });
            setEditingId(null);
            setIsCreating(false);
            setFormData({
                name: '',
                type: 'Software',
                description: '',
                tags: [],
                lifecycle: 'Active',
                project_id: null
            });
            setTagInput('');
        },
        onError: (error: any) => {
            alert(`Failed to update component: ${error.body?.detail || error.message}`);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: ComponentService.deleteComponentApiV1ComponentsComponentIdDelete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['components'] });
        },
        onError: (error: any) => {
            alert(`Failed to delete component: ${error.body?.detail || error.message}`);
        },
    });

    const linkMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            ComponentService.linkComponentApiV1ComponentsComponentIdLinkPost(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['components'] });
            setLinkData({
                child_id: '',
                cardinality: '1',
                type: 'composition',
                protocol: '',
                data_items: ''
            });
        },
        onError: (error: any) => {
            alert(`Failed to link component: ${error.body?.detail || error.message}`);
        },
    });

    const unlinkMutation = useMutation({
        mutationFn: ({ id, childId }: { id: string; childId: string }) =>
            ComponentService.unlinkComponentApiV1ComponentsComponentIdLinkChildIdDelete(id, childId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['components'] });
        },
        onError: (error: any) => {
            alert(`Failed to unlink component: ${error.body?.detail || error.message}`);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Ensure project_id is set if creating new and we have a project loaded
        const dataToSubmit = {
            ...formData,
            project_id: formData.project_id || project?.id || null
        };

        if (editingId) {
            updateMutation.mutate({ id: editingId, data: dataToSubmit });
        } else {
            createMutation.mutate(dataToSubmit);
        }
    };

    const startEdit = (comp: any) => {
        setEditingId(comp.id);
        setFormData({
            name: comp.name,
            type: comp.type,
            description: comp.description || '',
            tags: Array.isArray(comp.tags) ? comp.tags : [],
            lifecycle: comp.lifecycle || 'Active',
            project_id: comp.project_id || null
        });
        setIsCreating(true);
        setManagingLinksId(null);
    };

    const startLinking = (comp: any) => {
        setManagingLinksId(comp.id);
        setIsCreating(false);
        setEditingId(null);
    };

    const cancelEdit = () => {
        setIsCreating(false);
        setEditingId(null);
        setManagingLinksId(null);
        setFormData({
            name: '',
            type: 'Software',
            description: '',
            tags: [],
            lifecycle: 'Active',
            project_id: null
        });
        setTagInput('');
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="p-6">
            <ConfirmationModal
                isOpen={confirmation.isOpen}
                title={confirmation.title}
                message={confirmation.message}
                onConfirm={() => {
                    confirmation.onConfirm();
                    setConfirmation({ ...confirmation, isOpen: false });
                }}
                onClose={() => setConfirmation({ ...confirmation, isOpen: false })}
                isDestructive={confirmation.isDestructive}
            />

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Component Management</h2>
                <div className="flex gap-2">
                    {/* Clear All Filters */}
                    {(sortConfig.key || Object.keys(columnFilters).length > 0) && (
                        <button
                            onClick={clearAllFilters}
                            className="px-3 py-2 bg-slate-600 text-white rounded hover:bg-slate-700 transition-colors flex items-center gap-2"
                        >
                            <Filter className="w-4 h-4" />
                            Clear Filters
                        </button>
                    )}

                    {/* Bulk Delete */}
                    {selectedItems.length > 0 && (
                        <button
                            onClick={() => {
                                setConfirmation({
                                    isOpen: true,
                                    title: 'Delete Selected Components',
                                    message: `Are you sure you want to delete ${selectedItems.length} selected item(s)?`,
                                    isDestructive: true,
                                    onConfirm: handleBulkDelete
                                });
                            }}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete Selected ({selectedItems.length})
                        </button>
                    )}

                    <a
                        href={`/project/${(window.location.pathname.match(/project\/([^/]+)/) || [])[1]}/components/diagram`}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 border border-slate-300"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-network"><rect x="16" y="16" width="6" height="6" rx="1" /><rect x="2" y="16" width="6" height="6" rx="1" /><rect x="9" y="2" width="6" height="6" rx="1" /><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3" /><path d="M12 12V8" /></svg>
                        View Diagram
                    </a>
                    {!isCreating && !editingId && !managingLinksId && (
                        <button
                            onClick={() => setIsCreating(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            <Plus className="w-4 h-4" /> Add Component
                        </button>
                    )}
                </div>
            </div>

            {/* Component Edit/Create Modal */}
            {(isCreating || editingId) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    onClick={cancelEdit}>
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white border-b px-6 py-4">
                            <h3 className="text-lg font-semibold">
                                {editingId ? 'Edit Component' : 'Add Component'}
                            </h3>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full p-2 border rounded-md"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full p-2 border rounded-md"
                                        >
                                            <option value="Software">Software</option>
                                            <option value="Hardware">Hardware</option>
                                            <option value="Service">Service</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Lifecycle</label>
                                        <select
                                            value={formData.lifecycle}
                                            onChange={(e) => setFormData({ ...formData, lifecycle: e.target.value })}
                                            className="w-full p-2 border rounded-md"
                                        >
                                            {LIFECYCLES.map(lc => (
                                                <option key={lc} value={lc}>{lc}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Tags</label>
                                        <div className="space-y-2">
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={tagInput}
                                                    onChange={(e) => setTagInput(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
                                                                setFormData({
                                                                    ...formData,
                                                                    tags: [...formData.tags, tagInput.trim()]
                                                                });
                                                                setTagInput('');
                                                            }
                                                        }
                                                    }}
                                                    list="tag-suggestions"
                                                    placeholder="Type and press Enter..."
                                                    className="w-full p-2 border rounded-md"
                                                />
                                                <datalist id="tag-suggestions">
                                                    {allTags.map(tag => (
                                                        <option key={tag} value={tag} />
                                                    ))}
                                                </datalist>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
                                                            setFormData({
                                                                ...formData,
                                                                tags: [...formData.tags, tagInput.trim()]
                                                            });
                                                            setTagInput('');
                                                        }
                                                    }}
                                                    className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-md hover:bg-slate-200"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                            <div className="flex flex-wrap gap-2 min-h-[32px]">
                                                {formData.tags.map(tag => (
                                                    <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                        {tag}
                                                        <button
                                                            type="button"
                                                            onClick={() => setFormData({
                                                                ...formData,
                                                                tags: formData.tags.filter(t => t !== tag)
                                                            })}
                                                            className="hover:text-blue-600"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full p-2 border rounded-md"
                                        rows={3}
                                    />
                                </div>

                                <div className="flex gap-3 pt-4 border-t mt-4">
                                    <button
                                        type="button"
                                        onClick={cancelEdit}
                                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                                    >
                                        <Save className="w-4 h-4" /> Save
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Link Management Modal */}
            {managingLinksId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                            <h3 className="text-lg font-semibold">
                                Manage Links for: {components?.find((c: any) => c.id === managingLinksId)?.name}
                            </h3>
                            <button
                                onClick={() => setManagingLinksId(null)}
                                className="text-slate-500 hover:text-slate-700 p-1 hover:bg-slate-100 rounded-full"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Add New Link */}
                                <div className="bg-white p-4 rounded border border-slate-200">
                                    <h4 className="font-medium mb-3 text-slate-700">Add Relationship</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 mb-1">Child Component</label>
                                            <select
                                                value={linkData.child_id}
                                                onChange={(e) => setLinkData({ ...linkData, child_id: e.target.value })}
                                                className="w-full p-2 border rounded text-sm"
                                            >
                                                <option value="">Select Component...</option>
                                                {filteredComponents?.filter((c: any) => c.id !== managingLinksId).map((c: any) => (
                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 mb-1">Relationship Type</label>
                                            <select
                                                value={linkData.type}
                                                onChange={(e) => setLinkData({ ...linkData, type: e.target.value })}
                                                className="w-full p-2 border rounded text-sm"
                                            >
                                                <option value="composition">Composition (Has-a)</option>
                                                <option value="communication">Communication (Talks-to)</option>
                                            </select>
                                        </div>
                                        {linkData.type === 'composition' && (
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 mb-1">Cardinality</label>
                                                <input
                                                    type="text"
                                                    value={linkData.cardinality}
                                                    onChange={(e) => setLinkData({ ...linkData, cardinality: e.target.value })}
                                                    placeholder="e.g. 1, 0..1, 1..*"
                                                    className="w-full p-2 border rounded text-sm"
                                                />
                                            </div>
                                        )}
                                        {linkData.type === 'communication' && (
                                            <>
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-500 mb-1">Protocol</label>
                                                    <input
                                                        type="text"
                                                        value={linkData.protocol}
                                                        onChange={(e) => setLinkData({ ...linkData, protocol: e.target.value })}
                                                        placeholder="e.g. TCP, HTTP"
                                                        className="w-full p-2 border rounded text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-500 mb-1">Data Items</label>
                                                    <input
                                                        type="text"
                                                        value={linkData.data_items}
                                                        onChange={(e) => setLinkData({ ...linkData, data_items: e.target.value })}
                                                        placeholder="e.g. Packets, JSON"
                                                        className="w-full p-2 border rounded text-sm"
                                                    />
                                                </div>
                                            </>
                                        )}
                                        <button
                                            onClick={() => {
                                                if (linkData.child_id) {
                                                    linkMutation.mutate({ id: managingLinksId, data: linkData });
                                                }
                                            }}
                                            disabled={!linkData.child_id}
                                            className="w-full py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 disabled:bg-slate-300"
                                        >
                                            Add Link
                                        </button>
                                    </div>
                                </div>

                                {/* Existing Links */}
                                <div className="bg-white p-4 rounded border border-slate-200">
                                    <h4 className="font-medium mb-3 text-slate-700">Existing Relationships</h4>
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {components?.find((c: any) => c.id === managingLinksId)?.children?.map((child: any) => (
                                            <div key={child.child_id} className="flex justify-between items-center p-2 bg-slate-50 rounded border border-slate-100">
                                                <div>
                                                    <div className="font-medium text-sm">{child.child_name}</div>
                                                    <div className="text-xs text-slate-500">
                                                        {child.type === 'communication'
                                                            ? `${child.protocol || 'Unknown'}: ${child.data_items || 'None'}`
                                                            : `Cardinality: ${child.cardinality || 'N/A'}`
                                                        }
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => unlinkMutation.mutate({ id: managingLinksId, childId: child.child_id })}
                                                    className="text-red-500 hover:text-red-700 p-1"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                        {(!components?.find((c: any) => c.id === managingLinksId)?.children?.length) && (
                                            <div className="text-sm text-slate-400 italic text-center py-4">No relationships defined</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t mt-6">
                                <button
                                    onClick={() => setManagingLinksId(null)}
                                    className="px-4 py-2 bg-slate-600 text-white rounded hover:bg-slate-700"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white border rounded-md shadow-sm overflow-x-auto">
                <div className="min-w-[1000px]">
                    <div className="grid gap-2 p-3 border-b bg-slate-50 font-medium text-slate-700"
                        style={{ gridTemplateColumns: '30px 200px 100px 1fr 100px 200px 100px' }}>

                        {/* Checkbox */}
                        <div className="flex items-center justify-center">
                            <input
                                type="checkbox"
                                className="rounded border-slate-300"
                                checked={filteredComponents.length > 0 && filteredComponents.every((c: any) => selectedItems.includes(c.id))}
                                onChange={() => {
                                    if (filteredComponents.every((c: any) => selectedItems.includes(c.id))) {
                                        setSelectedItems([]);
                                    } else {
                                        setSelectedItems(filteredComponents.map((c: any) => c.id));
                                    }
                                }}
                            />
                        </div>

                        {/* Name Column */}
                        <div className="flex items-center gap-1 select-none relative">
                            <div className="flex items-center gap-1 cursor-pointer hover:bg-slate-200 px-1 py-0.5 rounded"
                                onClick={(e) => { e.stopPropagation(); setActiveFilterDropdown(activeFilterDropdown === 'name' ? null : 'name'); }}>
                                <Filter className={`w-3 h-3 ${columnFilters['name']?.length > 0 ? 'text-blue-600' : 'text-slate-400'}`} />
                                {columnFilters['name']?.length > 0 && (
                                    <span className="text-xs bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center">
                                        {columnFilters['name'].length}
                                    </span>
                                )}
                            </div>
                            <div className="cursor-pointer hover:bg-slate-100 flex-1 flex items-center gap-1" onClick={() => handleSort('name')}>
                                Name
                                {sortConfig.key === 'name' && (
                                    <span className="text-slate-400">
                                        {sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                                    </span>
                                )}
                            </div>
                            {activeFilterDropdown === 'name' && (
                                <div className="absolute top-8 left-0 bg-white border shadow-lg rounded-md p-2 z-50 w-64 max-h-60 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex justify-between items-center mb-2 pb-2 border-b">
                                        <span className="text-xs font-semibold text-slate-500">Filter Name</span>
                                        <button onClick={() => clearColumnFilter('name')} className="text-xs text-blue-600 hover:underline">Clear</button>
                                    </div>
                                    <div className="space-y-1">
                                        {getUniqueValuesForColumn('name').map((value: string) => (
                                            <label key={value} className="flex items-center gap-2 p-1 hover:bg-slate-50 rounded cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={columnFilters['name']?.includes(value)}
                                                    onChange={() => toggleFilter('name', value)}
                                                    className="rounded border-slate-300"
                                                />
                                                <span className="text-sm truncate" title={value}>{value}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Type Column */}
                        <div className="flex items-center gap-1 select-none relative">
                            <div className="flex items-center gap-1 cursor-pointer hover:bg-slate-200 px-1 py-0.5 rounded"
                                onClick={(e) => { e.stopPropagation(); setActiveFilterDropdown(activeFilterDropdown === 'type' ? null : 'type'); }}>
                                <Filter className={`w-3 h-3 ${columnFilters['type']?.length > 0 ? 'text-blue-600' : 'text-slate-400'}`} />
                                {columnFilters['type']?.length > 0 && (
                                    <span className="text-xs bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center">
                                        {columnFilters['type'].length}
                                    </span>
                                )}
                            </div>
                            <div className="cursor-pointer hover:bg-slate-100 flex-1 flex items-center gap-1" onClick={() => handleSort('type')}>
                                Type
                                {sortConfig.key === 'type' && (
                                    <span className="text-slate-400">
                                        {sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                                    </span>
                                )}
                            </div>
                            {activeFilterDropdown === 'type' && (
                                <div className="absolute top-8 left-0 bg-white border shadow-lg rounded-md p-2 z-50 w-48 max-h-60 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex justify-between items-center mb-2 pb-2 border-b">
                                        <span className="text-xs font-semibold text-slate-500">Filter Type</span>
                                        <button onClick={() => clearColumnFilter('type')} className="text-xs text-blue-600 hover:underline">Clear</button>
                                    </div>
                                    <div className="space-y-1">
                                        {getUniqueValuesForColumn('type').map((value: string) => (
                                            <label key={value} className="flex items-center gap-2 p-1 hover:bg-slate-50 rounded cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={columnFilters['type']?.includes(value)}
                                                    onChange={() => toggleFilter('type', value)}
                                                    className="rounded border-slate-300"
                                                />
                                                <span className="text-sm">{value}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Description Column */}
                        <div className="flex items-center gap-1 select-none relative">
                            <div className="flex items-center gap-1 cursor-pointer hover:bg-slate-200 px-1 py-0.5 rounded"
                                onClick={(e) => { e.stopPropagation(); setActiveFilterDropdown(activeFilterDropdown === 'description' ? null : 'description'); }}>
                                <Filter className={`w-3 h-3 ${columnFilters['description']?.length > 0 ? 'text-blue-600' : 'text-slate-400'}`} />
                                {columnFilters['description']?.length > 0 && (
                                    <span className="text-xs bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center">
                                        {columnFilters['description'].length}
                                    </span>
                                )}
                            </div>
                            <div className="cursor-pointer hover:bg-slate-100 flex-1 flex items-center gap-1" onClick={() => handleSort('description')}>
                                Description
                                {sortConfig.key === 'description' && (
                                    <span className="text-slate-400">
                                        {sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                                    </span>
                                )}
                            </div>
                            {activeFilterDropdown === 'description' && (
                                <div className="absolute top-8 left-0 bg-white border shadow-lg rounded-md p-2 z-50 w-80 max-h-60 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex justify-between items-center mb-2 pb-2 border-b">
                                        <span className="text-xs font-semibold text-slate-500">Filter Description</span>
                                        <button onClick={() => clearColumnFilter('description')} className="text-xs text-blue-600 hover:underline">Clear</button>
                                    </div>
                                    <div className="space-y-1">
                                        {getUniqueValuesForColumn('description').map((value: string) => (
                                            <label key={value} className="flex items-center gap-2 p-1 hover:bg-slate-50 rounded cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={columnFilters['description']?.includes(value)}
                                                    onChange={() => toggleFilter('description', value)}
                                                    className="rounded border-slate-300"
                                                />
                                                <span className="text-sm truncate" title={value}>{value}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Lifecycle Column */}
                        <div className="flex items-center gap-1 select-none relative">
                            <div className="flex items-center gap-1 cursor-pointer hover:bg-slate-200 px-1 py-0.5 rounded"
                                onClick={(e) => { e.stopPropagation(); setActiveFilterDropdown(activeFilterDropdown === 'lifecycle' ? null : 'lifecycle'); }}>
                                <Filter className={`w-3 h-3 ${columnFilters['lifecycle']?.length > 0 ? 'text-blue-600' : 'text-slate-400'}`} />
                                {columnFilters['lifecycle']?.length > 0 && (
                                    <span className="text-xs bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center">
                                        {columnFilters['lifecycle'].length}
                                    </span>
                                )}
                            </div>
                            <div className="cursor-pointer hover:bg-slate-100 flex-1 flex items-center gap-1" onClick={() => handleSort('lifecycle')}>
                                Lifecycle
                                {sortConfig.key === 'lifecycle' && (
                                    <span className="text-slate-400">
                                        {sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                                    </span>
                                )}
                            </div>
                            {activeFilterDropdown === 'lifecycle' && (
                                <div className="absolute top-8 left-0 bg-white border shadow-lg rounded-md p-2 z-50 w-48 max-h-60 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex justify-between items-center mb-2 pb-2 border-b">
                                        <span className="text-xs font-semibold text-slate-500">Filter Lifecycle</span>
                                        <button onClick={() => clearColumnFilter('lifecycle')} className="text-xs text-blue-600 hover:underline">Clear</button>
                                    </div>
                                    <div className="space-y-1">
                                        {getUniqueValuesForColumn('lifecycle').map((value: string) => (
                                            <label key={value} className="flex items-center gap-2 p-1 hover:bg-slate-50 rounded cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={columnFilters['lifecycle']?.includes(value)}
                                                    onChange={() => toggleFilter('lifecycle', value)}
                                                    className="rounded border-slate-300"
                                                />
                                                <span className="text-sm">{value}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Tags Column */}
                        <div className="flex items-center gap-1 select-none relative">
                            <div className="flex items-center gap-1 cursor-pointer hover:bg-slate-200 px-1 py-0.5 rounded"
                                onClick={(e) => { e.stopPropagation(); setActiveFilterDropdown(activeFilterDropdown === 'tags' ? null : 'tags'); }}>
                                <Filter className={`w-3 h-3 ${columnFilters['tags']?.length > 0 ? 'text-blue-600' : 'text-slate-400'}`} />
                                {columnFilters['tags']?.length > 0 && (
                                    <span className="text-xs bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center">
                                        {columnFilters['tags'].length}
                                    </span>
                                )}
                            </div>
                            <div className="cursor-pointer hover:bg-slate-100 flex-1 flex items-center gap-1">
                                Tags
                                {/* Sorting tags is complex, skipping sort icon here or we can implement it */}
                            </div>
                            {activeFilterDropdown === 'tags' && (
                                <div className="absolute top-8 left-0 bg-white border shadow-lg rounded-md p-2 z-50 w-64 max-h-60 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex justify-between items-center mb-2 pb-2 border-b">
                                        <span className="text-xs font-semibold text-slate-500">Filter Tags</span>
                                        <button onClick={() => clearColumnFilter('tags')} className="text-xs text-blue-600 hover:underline">Clear</button>
                                    </div>
                                    <div className="space-y-1">
                                        {getUniqueValuesForColumn('tags').map((value: string) => (
                                            <label key={value} className="flex items-center gap-2 p-1 hover:bg-slate-50 rounded cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={columnFilters['tags']?.includes(value)}
                                                    onChange={() => toggleFilter('tags', value)}
                                                    className="rounded border-slate-300"
                                                />
                                                <span className="text-sm truncate" title={value}>{value}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="text-right p-4 font-medium text-slate-600">Actions</div>
                    </div>

                    <ul className="divide-y divide-slate-100">
                        {filteredComponents.map((comp: any) => (
                            <li key={comp.id} className={`hover:bg-slate-50 transition-colors ${selectedItems.includes(comp.id) ? 'bg-blue-50' : ''}`}>
                                <div className="grid gap-2 p-3 items-center"
                                    style={{ gridTemplateColumns: '30px 200px 100px 1fr 100px 200px 100px' }}>

                                    {/* Checkbox */}
                                    <div className="flex items-center justify-center">
                                        <input
                                            type="checkbox"
                                            className="rounded border-slate-300"
                                            checked={selectedItems.includes(comp.id)}
                                            onChange={() => {
                                                if (selectedItems.includes(comp.id)) {
                                                    setSelectedItems(selectedItems.filter(id => id !== comp.id));
                                                } else {
                                                    setSelectedItems([...selectedItems, comp.id]);
                                                }
                                            }}
                                        />
                                    </div>

                                    {/* Name */}
                                    <button
                                        onClick={() => startEdit(comp)}
                                        className="font-medium text-slate-800 hover:text-blue-600 hover:underline text-left truncate"
                                        title={comp.name}
                                    >
                                        {comp.name}
                                    </button>

                                    {/* Type */}
                                    <div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${comp.type === 'Hardware' ? 'bg-orange-100 text-orange-700' :
                                            comp.type === 'Service' ? 'bg-purple-100 text-purple-700' :
                                                'bg-blue-100 text-blue-700'
                                            }`}>
                                            {comp.type}
                                        </span>
                                    </div>

                                    {/* Description */}
                                    <div className="text-sm text-slate-600 truncate" title={comp.description}>
                                        {comp.description}
                                    </div>

                                    {/* Lifecycle */}
                                    <div className="flex items-center gap-1.5">
                                        <div className={`w-2 h-2 rounded-full ${comp.lifecycle === 'Active' ? 'bg-green-500' :
                                            comp.lifecycle === 'Legacy' ? 'bg-amber-500' :
                                                comp.lifecycle === 'Planned' ? 'bg-blue-500' :
                                                    'bg-slate-400'
                                            }`} />
                                        <span className="text-sm text-slate-600">{comp.lifecycle || 'Active'}</span>
                                    </div>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-1">
                                        {Array.isArray(comp.tags) && comp.tags.slice(0, 3).map((tag: string) => (
                                            <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded border border-slate-200">
                                                {tag}
                                            </span>
                                        ))}
                                        {Array.isArray(comp.tags) && comp.tags.length > 3 && (
                                            <span className="px-2 py-0.5 bg-slate-50 text-slate-400 text-xs rounded border border-slate-200" title={comp.tags.slice(3).join(', ')}>
                                                +{comp.tags.length - 3}
                                            </span>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex justify-end gap-1">
                                        <button
                                            onClick={() => startEdit(comp)}
                                            className="p-1 text-slate-400 hover:text-blue-600 transition-colors rounded hover:bg-blue-50"
                                            title="Edit Component"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => startLinking(comp)}
                                            className="p-1 text-slate-400 hover:text-indigo-600 transition-colors rounded hover:bg-indigo-50"
                                            title="Manage Links"
                                        >
                                            <LinkIcon className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setConfirmation({
                                                    isOpen: true,
                                                    title: 'Delete Component',
                                                    message: `Are you sure you want to delete component "${comp.name}"?`,
                                                    isDestructive: true,
                                                    onConfirm: () => deleteMutation.mutate(comp.id)
                                                });
                                            }}
                                            className="p-1 text-slate-400 hover:text-red-600 transition-colors rounded hover:bg-red-50"
                                            title="Delete Component"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                        {filteredComponents.length === 0 && (
                            <li className="p-8 text-center text-slate-500">
                                No components found matching your filters.
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
}
