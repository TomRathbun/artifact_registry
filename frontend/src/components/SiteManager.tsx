import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SiteService } from '../client';
import { Plus, Trash2, Edit, ArrowUp, ArrowDown, Filter } from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';

export default function SiteManager() {
    const queryClient = useQueryClient();
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: '', security_domain: '' });
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

    const { data: sites, isLoading } = useQuery({
        queryKey: ['sites'],
        queryFn: () => SiteService.listSitesApiV1SitesGet(),
    });

    const createMutation = useMutation({
        mutationFn: SiteService.createSiteApiV1SitesPost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sites'] });
            setIsCreating(false);
            setFormData({ name: '', security_domain: '' });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            SiteService.updateSiteApiV1SitesSiteIdPut(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sites'] });
            setIsEditing(null);
            setIsCreating(false);
            setFormData({ name: '', security_domain: '' });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: SiteService.deleteSiteApiV1SitesSiteIdDelete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sites'] });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            updateMutation.mutate({ id: isEditing, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const handleEdit = (site: any) => {
        setIsEditing(site.id);
        setFormData({ name: site.name, security_domain: site.security_domain || '' });
        setIsCreating(true);
    };

    const handleSort = (key: string) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const getFilteredAndSortedItems = () => {
        if (!sites) return [];

        // Apply column filters
        let filtered = sites.filter((item: any) => {
            return Object.entries(columnFilters).every(([key, values]) => {
                if (!values || values.length === 0) return true;
                const itemValue = item[key] || '';
                return values.includes(itemValue);
            });
        });

        // Apply sorting
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
        if (!sites) return [];
        const values = sites.map((item: any) => item[key] || '');
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

    const handleBulkDelete = () => {
        for (const id of selectedItems) {
            deleteMutation.mutate(id);
        }
        setSelectedItems([]);
    };

    const renderForm = () => (
        <div>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                    <label className="block text-sm font-medium text-slate-700 mb-1">Security Domain</label>
                    <input
                        type="text"
                        value={formData.security_domain}
                        onChange={(e) => setFormData({ ...formData, security_domain: e.target.value })}
                        className="w-full p-2 border rounded-md"
                    />
                </div>
                <div className="flex gap-3 pt-4 border-t">
                    <button
                        type="button"
                        onClick={() => { setIsCreating(false); setIsEditing(null); setFormData({ name: '', security_domain: '' }); }}
                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Save
                    </button>
                </div>
            </form>
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
                <h2 className="text-xl font-bold capitalize">Sites</h2>
                <div className="flex gap-2">
                    {/* Clear All Filters Button */}
                    {(sortConfig.key || Object.keys(columnFilters).length > 0) && (
                        <button
                            onClick={clearAllFilters}
                            className="px-3 py-2 bg-slate-600 text-white rounded hover:bg-slate-700 transition-colors flex items-center gap-2"
                            title="Clear all filters and sorting"
                        >
                            <Filter className="w-4 h-4" />
                            Clear Filters
                        </button>
                    )}
                    {selectedItems.length > 0 && (
                        <button
                            onClick={() => {
                                setConfirmation({
                                    isOpen: true,
                                    title: 'Delete Selected Sites',
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
                            onClick={() => { setIsCreating(true); setFormData({ name: '', security_domain: '' }); }}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                        >
                            <Plus size={16} /> Add Site
                        </button>
                    )}
                </div>
            </div>

            {/* Edit/Create Modal */}
            {(isCreating || isEditing) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => { setIsCreating(false); setIsEditing(null); setFormData({ name: '', security_domain: '' }); }}>
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white border-b px-6 py-4">
                            <h3 className="text-lg font-semibold">
                                {isCreating && !isEditing ? 'Add Site' : 'Edit Site'}
                            </h3>
                        </div>
                        <div className="p-6">
                            {renderForm()}
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white border rounded-md shadow-sm">
                {/* Header Row */}
                <div className="grid gap-2 p-3 border-b bg-slate-50 font-medium text-slate-700" style={{ gridTemplateColumns: 'auto 1fr 1fr 100px' }}>
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
                            <div className="absolute top-full left-0 mt-1 bg-white border rounded-md shadow-lg z-50 min-w-[200px] max-h-[300px] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
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

                    {/* Security Domain Column with Filter */}
                    <div className="flex items-center gap-1 select-none relative">
                        <div
                            className="flex items-center gap-1 cursor-pointer hover:bg-slate-200 px-1 py-0.5 rounded"
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveFilterDropdown(activeFilterDropdown === 'security_domain' ? null : 'security_domain');
                            }}
                        >
                            <Filter className={`w-3 h-3 ${columnFilters['security_domain']?.length > 0 ? 'text-blue-600' : 'text-slate-400'}`} />
                            {columnFilters['security_domain']?.length > 0 && (
                                <span className="text-xs bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center">
                                    {columnFilters['security_domain'].length}
                                </span>
                            )}
                        </div>
                        <div className="cursor-pointer hover:bg-slate-100 flex-1 flex items-center gap-1" onClick={() => handleSort('security_domain')}>
                            Security Domain
                            {sortConfig.key === 'security_domain' && (
                                <span className="text-slate-400">
                                    {sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                                </span>
                            )}
                        </div>

                        {/* Filter Dropdown */}
                        {activeFilterDropdown === 'security_domain' && (
                            <div className="absolute top-full left-0 mt-1 bg-white border rounded-md shadow-lg z-50 min-w-[200px] max-h-[300px] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                                <div className="sticky top-0 bg-slate-50 p-2 border-b flex justify-between items-center">
                                    <span className="text-xs font-medium text-slate-600">Filter by Security Domain</span>
                                    {columnFilters['security_domain']?.length > 0 && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                clearColumnFilter('security_domain');
                                            }}
                                            className="text-xs text-blue-600 hover:text-blue-800"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                                <div className="p-1">
                                    {getUniqueValuesForColumn('security_domain').map((value: string) => (
                                        <label key={value} className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 cursor-pointer rounded">
                                            <input
                                                type="checkbox"
                                                checked={columnFilters['security_domain']?.includes(value) || false}
                                                onChange={() => toggleFilter('security_domain', value)}
                                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm truncate">{value}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="text-right">Actions</div>
                </div>

                <ul className="divide-y divide-slate-100">
                    {getFilteredAndSortedItems()?.map((site: any) => (
                        <li key={site.id} className="hover:bg-slate-50 transition-colors">
                            <div className="grid gap-2 p-3 items-center" style={{ gridTemplateColumns: 'auto 1fr 1fr 100px' }}>
                                {/* Checkbox */}
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.includes(site.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedItems([...selectedItems, site.id]);
                                            } else {
                                                setSelectedItems(selectedItems.filter(id => id !== site.id));
                                            }
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                </div>

                                {/* Name */}
                                <div className="font-medium">{site.name}</div>

                                {/* Security Domain */}
                                <div className="text-sm text-slate-600">{site.security_domain || '-'}</div>

                                {/* Actions */}
                                <div className="flex justify-end gap-1">
                                    <button
                                        onClick={() => handleEdit(site)}
                                        className="text-slate-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-full transition-colors"
                                        title="Edit"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            setConfirmation({
                                                isOpen: true,
                                                title: 'Delete Site',
                                                message: `Are you sure you want to delete "${site.name}"? This action cannot be undone.`,
                                                isDestructive: true,
                                                onConfirm: () => deleteMutation.mutate(site.id)
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
                            No sites found.
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
}
