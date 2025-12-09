import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';

import axios from 'axios';
import { Plus, Network, Edit, Trash2, GitGraph, ArrowUp, ArrowDown, Filter } from 'lucide-react';
import { MetadataService } from '../client';

export default function DiagramList() {
    const { projectId } = useParams<{ projectId: string }>();
    const queryClient = useQueryClient();
    const [isCreating, setIsCreating] = useState(false);
    const [newDiagramName, setNewDiagramName] = useState('');
    const [newDiagramDesc, setNewDiagramDesc] = useState('');
    const [newDiagramType, setNewDiagramType] = useState<'component' | 'artifact_graph' | 'sequence'>('component');
    const [newDiagramFilter, setNewDiagramFilter] = useState('All');

    // Edit/Delete state
    const [editingDiagram, setEditingDiagram] = useState<any>(null);
    const [deletingDiagramId, setDeletingDiagramId] = useState<string | null>(null);

    // Filter & Sort State
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' | null }>({
        key: null, direction: null
    });
    const [activeFilterDropdown, setActiveFilterDropdown] = useState<string | null>(null);
    const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>({});

    const { data: diagrams, isLoading, isError, error } = useQuery({
        queryKey: ['diagrams', projectId],
        queryFn: async () => {
            try {
                const response = await axios.get(`/api/v1/projects/${projectId}/diagrams`);
                return response.data;
            } catch (err) {
                console.error("Error fetching diagrams:", err);
                throw err;
            }
        },
        enabled: !!projectId,
    });

    const { data: areas } = useQuery({
        queryKey: ['areas'],
        queryFn: () => MetadataService.listAreasApiV1MetadataMetadataAreasGet(),
    });

    const createMutation = useMutation({
        mutationFn: async (data: { name: string; description: string; type: string; filter_data?: any }) => {
            await axios.post(`/api/v1/projects/${projectId}/diagrams`, {
                name: data.name,
                description: data.description,
                type: data.type,
                filter_data: data.filter_data
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['diagrams', projectId] });
            setIsCreating(false);
            setNewDiagramName('');
            setNewDiagramDesc('');
            setNewDiagramType('component');
            setNewDiagramFilter('All');
        },
    });

    const updateMutation = useMutation({
        mutationFn: async (data: { id: string; name: string; description: string; filter_data?: any }) => {
            await axios.put(`/api/v1/diagrams/${data.id}`, {
                name: data.name,
                description: data.description,
                filter_data: data.filter_data
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['diagrams', projectId] });
            setEditingDiagram(null);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await axios.delete(`/api/v1/diagrams/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['diagrams', projectId] });
            setDeletingDiagramId(null);
        },
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDiagramName.trim()) return;

        const filterData = newDiagramType === 'artifact_graph' ? { area: newDiagramFilter } : null;

        createMutation.mutate({
            name: newDiagramName,
            description: newDiagramDesc,
            type: newDiagramType,
            filter_data: filterData
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingDiagram || !editingDiagram.name.trim()) return;
        updateMutation.mutate({
            id: editingDiagram.id,
            name: editingDiagram.name,
            description: editingDiagram.description,
            filter_data: editingDiagram.filter_data
        });
    };

    // Filter & Sort Logic
    const filteredDiagrams = useMemo(() => {
        if (!diagrams) return [];

        let filtered = diagrams.filter((item: any) => {
            return Object.entries(columnFilters).every(([key, values]) => {
                if (!values || values.length === 0) return true;
                const itemValue = item[key] || '';
                return values.includes(String(itemValue));
            });
        });

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
    }, [diagrams, columnFilters, sortConfig]);

    useEffect(() => {
        const handleClickOutside = () => {
            if (activeFilterDropdown) setActiveFilterDropdown(null);
        };
        if (activeFilterDropdown) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [activeFilterDropdown]);

    const getUniqueValuesForColumn = (key: string): string[] => {
        if (!diagrams) return [];
        const values = new Set<string>();
        diagrams.forEach((d: any) => {
            if (d[key]) values.add(String(d[key]));
        });
        return Array.from(values).sort();
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
            const next = { ...prev };
            delete next[key];
            return next;
        });
    };

    const clearAllFilters = () => {
        setColumnFilters({});
        setSortConfig({ key: null, direction: null });
    };

    const handleSort = (key: string) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    if (isLoading) return <div className="p-8 text-center text-slate-500">Loading diagrams...</div>;
    if (isError) return <div className="p-8 text-center text-red-500">Error loading diagrams: {(error as Error).message}</div>;

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Diagrams</h1>
                    <p className="text-slate-600">Manage component diagrams and artifact graphs</p>
                </div>
                <div className="flex gap-3">
                    {(sortConfig.key || Object.keys(columnFilters).length > 0) && (
                        <button
                            onClick={clearAllFilters}
                            className="px-3 py-2 bg-slate-600 text-white rounded hover:bg-slate-700 transition-colors flex items-center gap-2"
                        >
                            <Filter className="w-4 h-4" />
                            Clear Filters
                        </button>
                    )}
                    <button
                        onClick={() => setIsCreating(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" /> New Diagram
                    </button>
                </div>
            </div>

            {/* Create Modal */}
            {isCreating && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-semibold mb-4">Create New Diagram</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setNewDiagramType('component')}
                                        className={`p-3 rounded-lg border text-sm font-medium flex flex-col items-center gap-2 ${newDiagramType === 'component' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                                    >
                                        <Network className="w-5 h-5" />
                                        Component Diagram
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNewDiagramType('artifact_graph')}
                                        className={`p-3 rounded-lg border text-sm font-medium flex flex-col items-center gap-2 ${newDiagramType === 'artifact_graph' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                                    >
                                        <GitGraph className="w-5 h-5" />
                                        Artifact Graph
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={newDiagramName}
                                    onChange={(e) => setNewDiagramName(e.target.value)}
                                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder={newDiagramType === 'component' ? "e.g., System Architecture" : "e.g., AI Area Graph"}
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea
                                    value={newDiagramDesc}
                                    onChange={(e) => setNewDiagramDesc(e.target.value)}
                                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Optional description..."
                                    rows={3}
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsCreating(false)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createMutation.isPending}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {createMutation.isPending ? 'Creating...' : 'Create Diagram'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editingDiagram && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-semibold mb-4">Edit Diagram</h2>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={editingDiagram.name}
                                    onChange={(e) => setEditingDiagram({ ...editingDiagram, name: e.target.value })}
                                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea
                                    value={editingDiagram.description || ''}
                                    onChange={(e) => setEditingDiagram({ ...editingDiagram, description: e.target.value })}
                                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    rows={3}
                                />
                            </div>
                            {editingDiagram.type === 'artifact_graph' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Filter by Area</label>
                                    <select
                                        value={editingDiagram.filter_data?.area || 'All'}
                                        onChange={(e) => setEditingDiagram({
                                            ...editingDiagram,
                                            filter_data: { ...editingDiagram.filter_data, area: e.target.value }
                                        })}
                                        className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="All">All Areas</option>
                                        {areas?.map((area: any) => (
                                            <option key={area.code} value={area.code}>{area.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingDiagram(null)}
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

            {/* Delete Confirmation Modal */}
            {deletingDiagramId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-semibold mb-2 text-red-600">Delete Diagram?</h2>
                        <p className="text-slate-600 mb-6">
                            Are you sure you want to delete this diagram? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setDeletingDiagramId(null)}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => deleteMutation.mutate(deletingDiagramId)}
                                disabled={deleteMutation.isPending}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                            >
                                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden overflow-x-auto">
                <div className="min-w-[1000px]">
                    <div className="grid gap-2 p-3 border-b bg-slate-50 font-medium text-slate-700"
                        style={{ gridTemplateColumns: '30px 250px 150px 1fr 200px 100px' }}>

                        {/* Checkbox */}
                        <div className="flex items-center justify-center">
                            <input
                                type="checkbox"
                                className="rounded border-slate-300"
                                checked={filteredDiagrams.length > 0 && filteredDiagrams.every((d: any) => selectedItems.includes(d.id))}
                                onChange={() => {
                                    if (filteredDiagrams.every((d: any) => selectedItems.includes(d.id))) {
                                        setSelectedItems([]);
                                    } else {
                                        setSelectedItems(filteredDiagrams.map((d: any) => d.id));
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

                        {/* Details Column (Sorting/Filtering omitted for simplicity as it's computed/polymorphic) */}
                        <div className="flex items-center gap-1 p-1 px-2">
                            Details
                        </div>

                        {/* Actions */}
                        <div className="text-right p-1 px-2">Actions</div>
                    </div>

                    <ul className="divide-y divide-slate-100">
                        {filteredDiagrams.map((diagram: any) => (
                            <li key={diagram.id} className={`hover:bg-slate-50 transition-colors ${selectedItems.includes(diagram.id) ? 'bg-blue-50' : ''}`}>
                                <div className="grid gap-2 p-3 items-center"
                                    style={{ gridTemplateColumns: '30px 250px 150px 1fr 200px 100px' }}>

                                    {/* Checkbox */}
                                    <div className="flex items-center justify-center">
                                        <input
                                            type="checkbox"
                                            className="rounded border-slate-300"
                                            checked={selectedItems.includes(diagram.id)}
                                            onChange={() => {
                                                if (selectedItems.includes(diagram.id)) {
                                                    setSelectedItems(selectedItems.filter(id => id !== diagram.id));
                                                } else {
                                                    setSelectedItems([...selectedItems, diagram.id]);
                                                }
                                            }}
                                        />
                                    </div>

                                    {/* Name */}
                                    <Link to={`${diagram.id}`} className="font-medium text-slate-900 hover:text-blue-600 truncate" title={diagram.name}>
                                        {diagram.name}
                                    </Link>

                                    {/* Type */}
                                    <div className="flex items-center gap-2">
                                        {diagram.type === 'artifact_graph' ? (
                                            <>
                                                <GitGraph className="w-4 h-4 text-purple-600" />
                                                <span className="text-sm text-slate-600">Artifact Graph</span>
                                            </>
                                        ) : (
                                            <>
                                                <Network className="w-4 h-4 text-blue-600" />
                                                <span className="text-sm text-slate-600">Component Diagram</span>
                                            </>
                                        )}
                                    </div>

                                    {/* Description */}
                                    <div className="text-sm text-slate-500 truncate" title={diagram.description}>
                                        {diagram.description || '-'}
                                    </div>

                                    {/* Details */}
                                    <div>
                                        {diagram.type === 'artifact_graph' && diagram.filter_data?.area ? (
                                            <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">
                                                Area: {diagram.filter_data.area}
                                            </span>
                                        ) : diagram.type === 'component' ? (
                                            <span className="text-sm text-slate-500">
                                                {diagram.components?.length || 0} components
                                            </span>
                                        ) : (
                                            <span className="text-sm text-slate-400">-</span>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => setEditingDiagram(diagram)}
                                            className="p-1 text-slate-400 hover:text-blue-600 transition-colors rounded hover:bg-blue-50"
                                            title="Edit"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setDeletingDiagramId(diagram.id)}
                                            className="p-1 text-slate-400 hover:text-red-600 transition-colors rounded hover:bg-red-50"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                        {filteredDiagrams.length === 0 && (
                            <li className="p-12 text-center text-slate-500">
                                <Network className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                <p>No diagrams found matching your filters.</p>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
}
