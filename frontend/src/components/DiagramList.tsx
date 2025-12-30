import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';

import axios from 'axios';
import { Plus, Network, Edit, Trash2, GitGraph, ArrowUp, ArrowDown, Filter, Wand2, FileCode, Check, FileText } from 'lucide-react';
import MarkdownDisplay from './MarkdownDisplay';
import { MetadataService } from '../client';

export default function DiagramList() {
    const { projectId } = useParams<{ projectId: string }>();
    const queryClient = useQueryClient();
    const [isCreating, setIsCreating] = useState(false);
    const [newDiagramName, setNewDiagramName] = useState('');
    const [newDiagramDesc, setNewDiagramDesc] = useState('');
    const [newDiagramType, setNewDiagramType] = useState<'component' | 'artifact_graph' | 'mermaid' | 'plantuml'>('component');
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
    const [copyStatus, setCopyStatus] = useState<string | null>(null);

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
        const handleClickOutside = (e: MouseEvent) => {
            if (activeFilterDropdown && !(e.target as HTMLElement).closest('.filter-container')) {
                setActiveFilterDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [activeFilterDropdown]);

    const getUniqueValuesForColumn = (key: string): string[] => {
        if (!diagrams) return [];
        const values = new Set<string>();
        diagrams.forEach((d: any) => {
            if (d[key]) values.add(String(d[key]));
        });
        // We do NOT sort here to keep the filter options in the same relative order 
        // as they appear in the listView (usually by name or ID).
        return Array.from(values);
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

    const handleCopyMarkdown = async (diagram: any) => {
        let text = "";
        const isTextDiagram = diagram.type === 'mermaid' || diagram.type === 'sequence' || diagram.type === 'plantuml';

        if (isTextDiagram) {
            const lang = diagram.type === 'plantuml' ? 'plantuml' : 'mermaid';
            text = `\`\`\`${lang}\n${diagram.content || ""}\n\`\`\``;
        } else {
            const url = `${window.location.origin}/projects/${projectId}/diagrams/${diagram.id}`;
            text = `[Diagram: ${diagram.name}](${url})`;
        }

        try {
            await navigator.clipboard.writeText(text);
            setCopyStatus(diagram.id);
            setTimeout(() => setCopyStatus(null), 2000);
        } catch (err) {
            console.error("Failed to copy", err);
        }
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
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                        <h2 className="text-xl font-semibold mb-4">Create New Diagram</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setNewDiagramType('component')}
                                        className={`p-3 rounded-lg border text-sm font-medium flex flex-col items-center gap-2 transition-all ${newDiagramType === 'component' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                                    >
                                        <Network className="w-5 h-5" />
                                        Component
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNewDiagramType('artifact_graph')}
                                        className={`p-3 rounded-lg border text-sm font-medium flex flex-col items-center gap-2 transition-all ${newDiagramType === 'artifact_graph' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                                    >
                                        <GitGraph className="w-5 h-5" />
                                        Artifact Graph
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNewDiagramType('mermaid')}
                                        className={`p-3 rounded-lg border text-sm font-medium flex flex-col items-center gap-2 transition-all ${newDiagramType === 'mermaid' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                                    >
                                        <Wand2 className="w-5 h-5" />
                                        Mermaid
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNewDiagramType('plantuml')}
                                        className={`p-3 rounded-lg border text-sm font-medium flex flex-col items-center gap-2 transition-all ${newDiagramType === 'plantuml' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                                    >
                                        <FileCode className="w-5 h-5" />
                                        PlantUML
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
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
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
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
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

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold text-sm">
                                <th className="p-4 w-12">
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
                                </th>
                                <th className="p-4 relative filter-container">
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleSort('name')} className="hover:text-blue-600 flex items-center gap-1">
                                            Name
                                            {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? <ArrowUp className="w-3" /> : <ArrowDown className="w-3" />)}
                                        </button>
                                        <button onClick={() => setActiveFilterDropdown(activeFilterDropdown === 'name' ? null : 'name')}>
                                            <Filter className={`w-3 h-3 ${columnFilters['name']?.length ? 'text-blue-600' : 'text-slate-400'}`} />
                                        </button>
                                    </div>
                                    {activeFilterDropdown === 'name' && (
                                        <div className="absolute top-full left-0 mt-1 bg-white border shadow-xl rounded-lg p-3 z-50 w-64 min-w-full">
                                            <div className="flex justify-between items-center mb-2 text-xs">
                                                <span className="font-bold text-slate-500 uppercase">Filter</span>
                                                <button onClick={() => clearColumnFilter('name')} className="text-blue-600 hover:underline font-medium">Clear</button>
                                            </div>
                                            <div className="space-y-1 max-h-48 overflow-y-auto">
                                                {getUniqueValuesForColumn('name').map(val => (
                                                    <label key={val} className="flex items-center gap-2 p-1 hover:bg-slate-50 rounded cursor-pointer text-sm">
                                                        <input type="checkbox" checked={columnFilters['name']?.includes(val)} onChange={() => toggleFilter('name', val)} />
                                                        <span className="truncate">{val}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </th>
                                <th className="p-4 relative filter-container">
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleSort('type')} className="hover:text-blue-600 flex items-center gap-1">
                                            Type
                                        </button>
                                        <button onClick={() => setActiveFilterDropdown(activeFilterDropdown === 'type' ? null : 'type')}>
                                            <Filter className={`w-3 h-3 ${columnFilters['type']?.length ? 'text-blue-600' : 'text-slate-400'}`} />
                                        </button>
                                    </div>
                                    {activeFilterDropdown === 'type' && (
                                        <div className="absolute top-full left-0 mt-1 bg-white border shadow-xl rounded-lg p-3 z-50 w-48">
                                            <div className="space-y-1">
                                                {['component', 'artifact_graph', 'mermaid', 'plantuml'].map(val => (
                                                    <label key={val} className="flex items-center gap-2 p-1 hover:bg-slate-50 rounded cursor-pointer text-sm">
                                                        <input type="checkbox" checked={columnFilters['type']?.includes(val)} onChange={() => toggleFilter('type', val)} />
                                                        <span>{val.replace('_', ' ')}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </th>
                                <th className="p-4">Description</th>
                                <th className="p-4">Details</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 italic text-sm">
                            {filteredDiagrams.map((diagram: any) => (
                                <tr key={diagram.id} className={`hover:bg-slate-50 transition-colors ${selectedItems.includes(diagram.id) ? 'bg-blue-50' : ''}`}>
                                    <td className="p-4 text-center">
                                        <input
                                            type="checkbox"
                                            className="rounded border-slate-300"
                                            checked={selectedItems.includes(diagram.id)}
                                            onChange={() => {
                                                setSelectedItems(prev => prev.includes(diagram.id) ? prev.filter(id => id !== diagram.id) : [...prev, diagram.id]);
                                            }}
                                        />
                                    </td>
                                    <td className="p-4 font-bold not-italic">
                                        <Link to={`${diagram.id}`} className="text-slate-900 hover:text-blue-600 transition-colors">
                                            {diagram.name}
                                        </Link>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 not-italic">
                                            {diagram.type === 'artifact_graph' ? <GitGraph className="w-4 h-4 text-purple-600" /> :
                                                diagram.type === 'mermaid' || diagram.type === 'sequence' ? <Wand2 className="w-4 h-4 text-emerald-600" /> :
                                                    diagram.type === 'plantuml' ? <FileCode className="w-4 h-4 text-orange-600" /> :
                                                        <Network className="w-4 h-4 text-blue-600" />}
                                            <span className="capitalize">{diagram.type.replace('_', ' ')}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-500 max-w-xs overflow-hidden">
                                        <div className="pointer-events-none line-clamp-2 list-view-description">
                                            <MarkdownDisplay content={diagram.description || '-'} />
                                        </div>
                                    </td>
                                    <td className="p-4 not-italic">
                                        {diagram.type === 'artifact_graph' ? (
                                            <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 rounded-full">{diagram.filter_data?.area || 'All Areas'}</span>
                                        ) : diagram.type === 'component' ? (
                                            <span className="text-xs text-slate-500">{diagram.components?.length || 0} Components</span>
                                        ) : '-'}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex justify-end gap-1 not-italic">
                                            <button
                                                onClick={() => handleCopyMarkdown(diagram)}
                                                className={`p-1.5 rounded-lg transition-all ${copyStatus === diagram.id ? 'bg-green-100 text-green-700' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'}`}
                                                title="Copy Markdown"
                                            >
                                                {copyStatus === diagram.id ? <Check className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                            </button>
                                            <button
                                                onClick={() => setEditingDiagram(diagram)}
                                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                title="Edit"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setDeletingDiagramId(diagram.id)}
                                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                title="Delete"
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
                {filteredDiagrams.length === 0 && (
                    <div className="p-20 text-center">
                        <div className="bg-slate-50 inline-block p-4 rounded-full mb-4">
                            <Network className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-slate-900 font-bold">No diagrams found</h3>
                        <p className="text-slate-500 text-sm">Try adjusting your filters or create a new diagram.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
