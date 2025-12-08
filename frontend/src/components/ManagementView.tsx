import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { MetadataService, ProjectsService } from '../client';
import { Plus, Edit, Trash2, Save, ArrowUp, ArrowDown, Filter } from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';

interface ManagementViewProps {
    type: 'area' | 'people';
}

export default function ManagementView({ type }: ManagementViewProps) {
    const { projectId } = useParams<{ projectId: string }>();
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState<string | number | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState<any>({});
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' | null }>({ key: null, direction: null });
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

    // Close filter dropdown when clicking outside
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

    // Fetch Project to get real ID
    const { data: project } = useQuery({
        queryKey: ['project', projectId],
        queryFn: () => ProjectsService.getProjectApiV1ProjectsProjectsProjectIdGet(projectId!),
        enabled: !!projectId
    });

    const realProjectId = project?.id || projectId;

    // Fetch Data
    const { data: items, isLoading } = useQuery({
        queryKey: [type, realProjectId],
        queryFn: async () => {
            switch (type) {
                case 'area':
                    return MetadataService.listAreasApiV1MetadataMetadataAreasGet();
                case 'people':
                    return MetadataService.listPeopleApiV1MetadataMetadataPeopleGet(realProjectId);
                default:
                    return [];
            }
        },
        enabled: !!realProjectId
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            switch (type) {
                case 'area':
                    return MetadataService.createAreaApiV1MetadataMetadataAreasPost(data);
                case 'people':
                    return MetadataService.createPersonApiV1MetadataMetadataPeoplePost({ ...data, project_id: realProjectId });
                default:
                    throw new Error('Invalid type');
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [type, realProjectId] });
            setIsCreating(false);
            setFormData({});
        },
        onError: (error: any) => {
            console.error('Create mutation error:', error);
            alert(`Error creating person: ${error.message || JSON.stringify(error)}`);
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string | number, data: any }) => {
            switch (type) {
                case 'area':
                    return MetadataService.updateAreaApiV1MetadataMetadataAreasCodePut(id as string, data);
                case 'people':
                    return MetadataService.updatePersonApiV1MetadataMetadataPeoplePersonIdPut(id as string, data);
                default:
                    throw new Error('Invalid type');
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [type, realProjectId] });
            setIsEditing(null);
            setFormData({});
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string | number) => {
            switch (type) {
                case 'area':
                    return MetadataService.deleteAreaApiV1MetadataMetadataAreasCodeDelete(id as string);
                case 'people':
                    return MetadataService.deletePersonApiV1MetadataMetadataPeoplePersonIdDelete(id as string);
                default:
                    throw new Error('Invalid type');
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [type, realProjectId] });
        },
    });

    const handleEdit = (item: any) => {
        setIsEditing(type === 'area' ? item.code : item.id);
        setFormData(item);
    };

    const handleSave = () => {
        if (isCreating) {
            createMutation.mutate(formData);
        } else if (isEditing) {
            updateMutation.mutate({ id: isEditing, data: formData });
        }
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

    const getFilteredAndSortedItems = () => {
        if (!items) return [];

        // Apply column filters first
        let filtered = items.filter((item: any) => {
            return Object.entries(columnFilters).every(([key, values]) => {
                if (!values || values.length === 0) return true;
                const itemValue = item[key] || '';
                return values.includes(itemValue);
            });
        });

        // Then apply sorting
        if (!sortConfig.key || !sortConfig.direction) return filtered;

        return [...filtered].sort((a: any, b: any) => {
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
    };

    const getUniqueValuesForColumn = (key: string): string[] => {
        if (!items) return [];
        const values = items.map((item: any) => item[key] || '');
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

    const handleBulkDelete = async () => {
        for (const id of selectedItems) {
            await deleteMutation.mutateAsync(id);
        }
        setSelectedItems([]);
    };

    const renderForm = () => (
        <div>
            <div className="grid grid-cols-2 gap-4">
                {type === 'area' && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Code</label>
                            <input
                                type="text"
                                value={formData.code || ''}
                                onChange={e => setFormData({ ...formData, code: e.target.value })}
                                disabled={!!isEditing} // PK cannot be changed
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm border p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Name</label>
                            <input
                                type="text"
                                value={formData.name || ''}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm border p-2"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700">Description</label>
                            <textarea
                                value={formData.description || ''}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm border p-2"
                            />
                        </div>
                    </>
                )}
                {type === 'people' && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Name</label>
                            <input
                                type="text"
                                value={formData.name || ''}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm border p-2"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700">Roles</label>
                            <div className="mt-1 flex gap-4">
                                {['owner', 'stakeholder', 'actor'].map(role => (
                                    <label key={role} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.roles?.includes(role) || false}
                                            onChange={e => {
                                                const currentRoles = formData.roles || [];
                                                if (e.target.checked) {
                                                    setFormData({ ...formData, roles: [...currentRoles, role] });
                                                } else {
                                                    setFormData({ ...formData, roles: currentRoles.filter((r: string) => r !== role) });
                                                }
                                            }}
                                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="capitalize">{role}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700">Description</label>
                            <textarea
                                value={formData.description || ''}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm border p-2"
                            />
                        </div>
                    </>
                )}
            </div>
            <div className="mt-6 flex justify-end gap-2 border-t pt-4">
                <button
                    onClick={() => { setIsCreating(false); setIsEditing(null); setFormData({}); }}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                >
                    <Save size={16} /> Save
                </button>
            </div>
        </div>
    );

    if (isLoading) return <div className="p-4">Loading...</div>;

    return (
        <div className="space-y-6">
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

            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold capitalize">{type}s</h2>
                <div className="flex gap-2">
                    {selectedItems.length > 0 && (
                        <button
                            onClick={() => {
                                setConfirmation({
                                    isOpen: true,
                                    title: `Delete Selected ${type}s`,
                                    message: `Are you sure you want to delete ${selectedItems.length} selected item(s)? This action cannot be undone.`,
                                    isDestructive: true,
                                    onConfirm: handleBulkDelete
                                });
                            }}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center gap-2"
                            title={`Delete ${selectedItems.length} selected item(s)`}
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete Selected ({selectedItems.length})
                        </button>
                    )}
                    {!isCreating && !isEditing && (
                        <button
                            onClick={() => { setIsCreating(true); setFormData({}); }}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                        >
                            <Plus size={16} /> Add {type}
                        </button>
                    )}
                </div>
            </div>

            {/* Edit/Create Modal */}
            {(isCreating || isEditing) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => { setIsCreating(false); setIsEditing(null); setFormData({}); }}>
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white border-b px-6 py-4">
                            <h3 className="text-lg font-semibold">
                                {isCreating ? `Add ${type}` : `Edit ${type}`}
                            </h3>
                        </div>
                        <div className="p-6">
                            {renderForm()}
                        </div>
                    </div>
                </div>
            )}

            {type === 'people' ? (
                <div className="bg-white border rounded-md shadow-sm">
                    {/* Header Row */}
                    <div className="grid gap-2 p-3 border-b bg-slate-50 font-medium text-slate-700" style={{ gridTemplateColumns: 'auto 1fr 200px 1fr 100px' }}>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                checked={selectedItems.length === getFilteredAndSortedItems()?.length && getFilteredAndSortedItems()?.length > 0}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setSelectedItems(getFilteredAndSortedItems()?.map((item: any) => item.id) || []);
                                    } else {
                                        setSelectedItems([]);
                                    }
                                }}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                        </div>

                        {/* Name Column with Filter */}
                        <div className="flex items-center gap-1 select-none relative">
                            <div
                                className="flex items-center gap-1 cursor-pointer hover:bg-slate-200 px-1 py-0.5 rounded"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveFilterDropdown(activeFilterDropdown === 'name' ? null : 'name');
                                }}
                            >
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

                            {/* Filter Dropdown */}
                            {activeFilterDropdown === 'name' && (
                                <div className="absolute top-full left-0 mt-1 bg-white border rounded-md shadow-lg z-50 min-w-[200px] max-h-[300px] overflow-y-auto">
                                    <div className="sticky top-0 bg-slate-50 p-2 border-b flex justify-between items-center">
                                        <span className="text-xs font-medium text-slate-600">Filter by Name</span>
                                        {columnFilters['name']?.length > 0 && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    clearColumnFilter('name');
                                                }}
                                                className="text-xs text-blue-600 hover:text-blue-800"
                                            >
                                                Clear
                                            </button>
                                        )}
                                    </div>
                                    <div className="p-1">
                                        {getUniqueValuesForColumn('name').map((value: string) => (
                                            <label key={value} className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 cursor-pointer rounded">
                                                <input
                                                    type="checkbox"
                                                    checked={columnFilters['name']?.includes(value) || false}
                                                    onChange={() => toggleFilter('name', value)}
                                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-sm truncate">{value}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>Roles</div>
                        <div>Description</div>
                        <div className="text-right">Actions</div>
                    </div>

                    <ul className="divide-y divide-slate-100">
                        {getFilteredAndSortedItems()?.map((item: any) => (
                            <li key={item.id} className="hover:bg-slate-50 transition-colors">
                                <div className="grid gap-2 p-3 items-center" style={{ gridTemplateColumns: 'auto 1fr 200px 1fr 100px' }}>
                                    {/* Checkbox */}
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.includes(item.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedItems([...selectedItems, item.id]);
                                                } else {
                                                    setSelectedItems(selectedItems.filter(id => id !== item.id));
                                                }
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                        />
                                    </div>

                                    {/* Name */}
                                    <div className="font-medium">{item.name}</div>

                                    {/* Roles */}
                                    <div className="flex gap-1 flex-wrap">
                                        {item.roles?.map((role: string) => (
                                            <span key={role} className="px-2 py-1 bg-slate-100 rounded text-xs capitalize">
                                                {role}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Description */}
                                    <div className="text-sm text-slate-600 truncate">{item.description || '-'}</div>

                                    {/* Actions */}
                                    <div className="flex justify-end gap-1">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="text-slate-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-full transition-colors"
                                            title="Edit"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setConfirmation({
                                                    isOpen: true,
                                                    title: `Delete ${type}`,
                                                    message: `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
                                                    isDestructive: true,
                                                    onConfirm: () => deleteMutation.mutate(item.id)
                                                });
                                            }}
                                            className="text-slate-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                        {getFilteredAndSortedItems()?.length === 0 && (
                            <li className="p-6 text-center text-slate-500 italic">
                                No {type}s found.
                            </li>
                        )}
                    </ul>
                </div>
            ) : (
                <div className="bg-white border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                {type === 'area' && (
                                    <>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Code</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
                                    </>
                                )}
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {items?.map((item: any) => (
                                <tr key={item.id || item.code}>
                                    {type === 'area' && (
                                        <>
                                            <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">{item.code}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{item.name}</td>
                                            <td className="px-6 py-4 text-sm text-slate-500">{item.description}</td>
                                        </>
                                    )}
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="text-slate-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-full transition-colors"
                                            title="Edit"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setConfirmation({
                                                    isOpen: true,
                                                    title: `Delete ${type}`,
                                                    message: `Are you sure you want to delete this item? This action cannot be undone.`,
                                                    isDestructive: true,
                                                    onConfirm: () => deleteMutation.mutate(item.id || item.code)
                                                });
                                            }}
                                            className="text-slate-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {items?.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-4 text-center text-slate-500 italic">
                                        No {type}s found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
