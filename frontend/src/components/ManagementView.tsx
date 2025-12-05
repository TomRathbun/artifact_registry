import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { MetadataService, ProjectsService } from '../client';
import { Plus, Edit, Trash2, Save } from 'lucide-react';

interface ManagementViewProps {
    type: 'area' | 'people';
}

export default function ManagementView({ type }: ManagementViewProps) {
    const { projectId } = useParams<{ projectId: string }>();
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState<string | number | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState<any>({});

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
            if (!confirm('Are you sure you want to delete this item?')) return;
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

    const renderForm = () => (
        <div className="bg-slate-50 p-4 rounded border mb-4">
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
            <div className="mt-4 flex justify-end gap-2">
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
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold capitalize">{type}s</h2>
                {!isCreating && !isEditing && (
                    <button
                        onClick={() => { setIsCreating(true); setFormData({}); }}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Plus size={16} /> Add {type}
                    </button>
                )}
            </div>

            {(isCreating || isEditing) && renderForm()}

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
                            {type === 'people' && (
                                <>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Roles</th>
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
                                {type === 'people' && (
                                    <>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium">{item.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            <div className="flex gap-1">
                                                {item.roles?.map((role: string) => (
                                                    <span key={role} className="px-2 py-1 bg-slate-100 rounded text-xs capitalize">
                                                        {role}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
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
                                        onClick={() => deleteMutation.mutate(item.id || item.code)}
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
        </div>
    );
}
