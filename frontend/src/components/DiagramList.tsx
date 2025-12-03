import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';

import axios from 'axios';
import { Plus, Network, Pencil, Trash2, GitGraph } from 'lucide-react';
import { MetadataService } from '../client';

export default function DiagramList() {
    const { projectId } = useParams<{ projectId: string }>();
    const queryClient = useQueryClient();
    const [isCreating, setIsCreating] = useState(false);
    const [newDiagramName, setNewDiagramName] = useState('');
    const [newDiagramDesc, setNewDiagramDesc] = useState('');
    const [newDiagramType, setNewDiagramType] = useState<'component' | 'artifact_graph'>('component');
    const [newDiagramFilter, setNewDiagramFilter] = useState('All');

    // Edit/Delete state
    const [editingDiagram, setEditingDiagram] = useState<any>(null);
    const [deletingDiagramId, setDeletingDiagramId] = useState<string | null>(null);

    const { data: diagrams, isLoading } = useQuery({
        queryKey: ['diagrams', projectId],
        queryFn: async () => {
            const response = await axios.get(`http://localhost:8000/api/v1/projects/${projectId}/diagrams`);
            return response.data;
        },
        enabled: !!projectId,
    });



    const { data: areas } = useQuery({
        queryKey: ['areas'],
        queryFn: () => MetadataService.listAreasApiV1MetadataMetadataAreasGet(),
    });

    const createMutation = useMutation({
        mutationFn: async (data: { name: string; description: string; type: string; filter_data?: any }) => {
            await axios.post(`http://localhost:8000/api/v1/projects/${projectId}/diagrams`, {
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
            await axios.put(`http://localhost:8000/api/v1/diagrams/${data.id}`, {
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
            await axios.delete(`http://localhost:8000/api/v1/diagrams/${id}`);
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

    if (isLoading) return <div>Loading diagrams...</div>;

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Diagrams</h1>
                    <p className="text-slate-600">Manage component diagrams and artifact graphs</p>
                </div>
                <div className="flex gap-3">
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

                            {newDiagramType === 'artifact_graph' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Filter by Area</label>
                                    <select
                                        value={newDiagramFilter}
                                        onChange={(e) => setNewDiagramFilter(e.target.value)}
                                        className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="All">All Areas</option>
                                        {areas?.map((area: any) => (
                                            <option key={area.code} value={area.code}>{area.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

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

            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Details</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {diagrams?.map((diagram: any) => (
                            <tr key={diagram.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <Link to={`${diagram.id}`} className="font-medium text-slate-900 hover:text-blue-600">
                                        {diagram.name}
                                    </Link>
                                </td>
                                <td className="px-6 py-4">
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
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-slate-500 truncate max-w-xs" title={diagram.description}>
                                        {diagram.description || '-'}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
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
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => setEditingDiagram(diagram)}
                                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                                            title="Edit"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setDeletingDiagramId(diagram.id)}
                                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {diagrams?.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                    <Network className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                    <p>No diagrams yet. Create one to get started.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
