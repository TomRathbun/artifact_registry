import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { VisionService, NeedsService, UseCaseService, RequirementService } from '../client';
import MarkdownDisplay from './MarkdownDisplay';

export default function ArtifactEditor() {
    const { projectId, artifactType, artifactId } = useParams<{
        projectId: string;
        artifactType: string;
        artifactId: string;
    }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [artifact, setArtifact] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'write' | 'preview'>('write');

    // Load artifact based on type and id
    useEffect(() => {
        if (!projectId || !artifactType || !artifactId) return;
        const fetchArtifact = async () => {
            try {
                let data: any = null;
                switch (artifactType) {
                    case 'vision':
                        data = await VisionService.getVisionStatementApiV1VisionVisionStatementsAidGet(artifactId);
                        break;
                    case 'need':
                        data = await NeedsService.getNeedApiV1NeedNeedsAidGet(artifactId);
                        break;
                    case 'use_case':
                        data = await UseCaseService.getUseCaseApiV1UseCaseUseCasesAidGet(artifactId);
                        break;
                    case 'requirement':
                        data = await RequirementService.getRequirementApiV1RequirementRequirementsAidGet(artifactId);
                        break;
                    default:
                        throw new Error('Unsupported artifact type');
                }
                setArtifact(data);
                setLoading(false);
            } catch (e: any) {
                setError(e.message || 'Failed to load');
                setLoading(false);
            }
        };
        fetchArtifact();
    }, [projectId, artifactType, artifactId]);

    const mutation = useMutation({
        mutationFn: async (updated: any) => {
            if (!artifactId) throw new Error('No artifact ID');
            switch (artifactType) {
                case 'vision':
                    return VisionService.updateVisionStatementApiV1VisionVisionStatementsAidPut(artifactId, updated);
                case 'need':
                    return NeedsService.updateNeedApiV1NeedNeedsAidPut(artifactId, updated);
                case 'use_case':
                    return UseCaseService.updateUseCaseApiV1UseCaseUseCasesAidPut(artifactId, updated);
                case 'requirement':
                    return RequirementService.updateRequirementApiV1RequirementRequirementsAidPut(artifactId, updated);
                default:
                    throw new Error('Unsupported artifact type');
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [artifactType, projectId] });
            navigate(`/project/${projectId}/${artifactType}s`);
        },
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setArtifact((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(artifact);
    };

    if (loading) return <div className="p-4">Loading...</div>;
    if (error) return <div className="p-4 text-red-600">Error: {error}</div>;
    if (!artifact) return null;

    return (
        <div className="max-w-2xl mx-auto p-4 bg-white rounded shadow">
            <h2 className="text-2xl font-bold mb-4 capitalize">Edit {artifactType?.replace('_', ' ')}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block font-medium mb-1">Title / Short Name</label>
                    <input
                        name={artifact.short_name ? "short_name" : "title"}
                        value={artifact.title || artifact.short_name || ''}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2"
                    />
                </div>
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="block font-medium">Description / Text</label>
                        <div className="flex gap-2 text-sm bg-gray-100 p-1 rounded">
                            <button
                                type="button"
                                onClick={() => setViewMode('write')}
                                className={`px-3 py-1 rounded ${viewMode === 'write' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                            >
                                Write
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('preview')}
                                className={`px-3 py-1 rounded ${viewMode === 'preview' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                            >
                                Preview
                            </button>
                        </div>
                    </div>
                    {viewMode === 'write' ? (
                        <textarea
                            name={artifact.text ? "text" : "description"}
                            value={artifact.description || artifact.text || ''}
                            onChange={handleChange}
                            className="w-full border rounded px-3 py-2 font-mono text-sm"
                            rows={12}
                        />
                    ) : (
                        <div className="w-full border rounded px-3 py-2 min-h-[300px] bg-gray-50 overflow-y-auto">
                            <MarkdownDisplay content={artifact.description || artifact.text || ''} />
                        </div>
                    )}
                </div>
                {'status' in artifact && (
                    <div>
                        <label className="block font-medium mb-1">Status</label>
                        <input
                            name="status"
                            value={artifact.status || ''}
                            onChange={handleChange}
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>
                )}
                <div className="flex gap-2">
                    <button
                        type="submit"
                        disabled={mutation.isPending}
                        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                    >
                        {mutation.isPending ? 'Saving...' : 'Save'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 bg-gray-300 rounded"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
