import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SiteService } from '../client';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';

export default function SiteManager() {
    const queryClient = useQueryClient();
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: '', security_domain: '' });

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
            setEditingId(null);
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
        if (editingId) {
            updateMutation.mutate({ id: editingId, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const startEdit = (site: any) => {
        setEditingId(site.id);
        setFormData({ name: site.name, security_domain: site.security_domain || '' });
        setIsCreating(true);
    };

    const cancelEdit = () => {
        setIsCreating(false);
        setEditingId(null);
        setFormData({ name: '', security_domain: '' });
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Site Management</h2>
                {!isCreating && (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <Plus className="w-4 h-4" /> Add Site
                    </button>
                )}
            </div>

            {isCreating && (
                <div className="mb-8 bg-slate-50 p-6 rounded-lg border border-slate-200">
                    <h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit Site' : 'New Site'}</h3>
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

            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-4 font-medium text-slate-600">Name</th>
                            <th className="p-4 font-medium text-slate-600">Security Domain</th>
                            <th className="p-4 font-medium text-slate-600 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {sites?.map((site: any) => (
                            <tr key={site.id} className="hover:bg-slate-50">
                                <td className="p-4 font-medium text-slate-800">{site.name}</td>
                                <td className="p-4 text-slate-600">{site.security_domain || '-'}</td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => startEdit(site)}
                                            className="p-1 text-slate-400 hover:text-blue-600"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm('Are you sure?')) deleteMutation.mutate(site.id);
                                            }}
                                            className="p-1 text-slate-400 hover:text-red-600"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {sites?.length === 0 && (
                            <tr>
                                <td colSpan={3} className="p-8 text-center text-slate-500">
                                    No sites found. Create one to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
