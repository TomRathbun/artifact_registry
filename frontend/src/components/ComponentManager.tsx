import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ComponentService } from '../client';
import { Plus, Trash2, Save, X } from 'lucide-react';

export default function ComponentManager() {
    const queryClient = useQueryClient();
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [managingLinksId, setManagingLinksId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: '', type: 'Software', description: '' });
    const [linkData, setLinkData] = useState({
        child_id: '',
        cardinality: '1',
        type: 'composition',
        protocol: '',
        data_items: ''
    });

    const { data: components, isLoading } = useQuery({
        queryKey: ['components'],
        queryFn: () => ComponentService.listComponentsApiV1ComponentsGet(),
    });

    const createMutation = useMutation({
        mutationFn: ComponentService.createComponentApiV1ComponentsPost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['components'] });
            setIsCreating(false);
            setFormData({ name: '', type: 'Software', description: '' });
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
            setFormData({ name: '', type: 'Software', description: '' });
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
        if (editingId) {
            updateMutation.mutate({ id: editingId, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const startEdit = (comp: any) => {
        setEditingId(comp.id);
        setFormData({ name: comp.name, type: comp.type, description: comp.description || '' });
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
        setFormData({ name: '', type: 'Software', description: '' });
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Component Management</h2>
                {!isCreating && (
                    <div className="flex gap-2">
                        <a
                            href={`/project/${(window.location.pathname.match(/project\/([^/]+)/) || [])[1]}/components/diagram`}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 border border-slate-300"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-network"><rect x="16" y="16" width="6" height="6" rx="1" /><rect x="2" y="16" width="6" height="6" rx="1" /><rect x="9" y="2" width="6" height="6" rx="1" /><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3" /><path d="M12 12V8" /></svg>
                            View Diagram
                        </a>
                        <button
                            onClick={() => setIsCreating(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            <Plus className="w-4 h-4" /> Add Component
                        </button>
                    </div>
                )}
            </div>

            {isCreating && (
                <div className="mb-8 bg-slate-50 p-6 rounded-lg border border-slate-200">
                    <h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit Component' : 'New Component'}</h3>
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
                            <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full p-2 border rounded-md"
                            >
                                <option value="Software">Software</option>
                                <option value="Hardware">Hardware</option>
                            </select>
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
                        <div className="flex gap-3 pt-2">
                            <button
                                type="submit"
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                <Save className="w-4 h-4" /> Save
                            </button>
                            <button
                                type="button"
                                onClick={cancelEdit}
                                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-md"
                            >
                                <X className="w-4 h-4" /> Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {managingLinksId && (
                <div className="mb-8 bg-slate-50 p-6 rounded-lg border border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">
                            Manage Links for: {components?.find((c: any) => c.id === managingLinksId)?.name}
                        </h3>
                        <button onClick={cancelEdit} className="text-slate-500 hover:text-slate-700">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

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
                                        {components?.filter((c: any) => c.id !== managingLinksId).map((c: any) => (
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
                </div>
            )}

            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-4 font-medium text-slate-600">Name</th>
                            <th className="p-4 font-medium text-slate-600">Type</th>
                            <th className="p-4 font-medium text-slate-600 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {components?.map((comp: any) => (
                            <tr key={comp.id} className="hover:bg-slate-50">
                                <td className="p-4 font-medium text-slate-800">
                                    <button
                                        onClick={() => startEdit(comp)}
                                        className="hover:text-blue-600 hover:underline text-left"
                                    >
                                        {comp.name}
                                    </button>
                                </td>
                                <td className="p-4 text-slate-600">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${comp.type === 'Hardware' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        {comp.type}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => startLinking(comp)}
                                            className="p-1 text-slate-400 hover:text-indigo-600"
                                            title="Manage Links"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-link"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm('Are you sure?')) deleteMutation.mutate(comp.id);
                                            }}
                                            className="p-1 text-slate-400 hover:text-red-600"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {components?.length === 0 && (
                            <tr>
                                <td colSpan={3} className="p-8 text-center text-slate-500">
                                    No components found. Create one to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
