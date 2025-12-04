import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, X, Check } from 'lucide-react';
import axios from 'axios';

interface ArtifactSelectorProps {
    projectId: string;
    artifactType: string;
    onSelect: (id: string) => void;
    onCancel: () => void;
}

export default function ArtifactSelector({ projectId, artifactType, onSelect, onCancel }: ArtifactSelectorProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const { data: artifacts, isLoading } = useQuery({
        queryKey: ['artifacts', artifactType, projectId],
        queryFn: async () => {
            switch (artifactType) {
                case 'need':
                    return (await axios.get(`/api/v1/need/needs/?project_id=${projectId}&select_all=true`)).data;
                case 'requirement':
                    return (await axios.get(`/api/v1/requirement/requirements/?project_id=${projectId}&select_all=true`)).data;
                case 'use_case':
                    return (await axios.get(`/api/v1/use_case/use_cases/?project_id=${projectId}&select_all=true`)).data;
                case 'vision':
                    return (await axios.get(`/api/v1/vision/vision-statements/?project_id=${projectId}`)).data;
                case 'diagram':
                    return (await axios.get(`/api/v1/projects/${projectId}/diagrams`)).data;
                case 'component':
                    return (await axios.get(`/api/v1/components/`)).data;
                default:
                    return [];
            }
        },
    });

    const filteredArtifacts = artifacts?.filter((artifact: any) => {
        const searchLower = searchTerm.toLowerCase();
        const id = artifact.aid || artifact.id || '';
        const title = artifact.title || artifact.name || artifact.short_name || '';
        return id.toLowerCase().includes(searchLower) || title.toLowerCase().includes(searchLower);
    });

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col shadow-xl">
                <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-slate-900 capitalize">Select {artifactType.replace('_', ' ')}</h3>
                    <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 border-b border-slate-200">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by ID or title..."
                            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    {isLoading ? (
                        <div className="text-center py-8 text-slate-500">Loading...</div>
                    ) : filteredArtifacts?.length > 0 ? (
                        <div className="space-y-1">
                            {filteredArtifacts.map((artifact: any) => (
                                <button
                                    key={artifact.aid || artifact.id}
                                    onClick={() => onSelect(artifact.aid || artifact.id)}
                                    className="w-full text-left px-4 py-3 rounded-md hover:bg-blue-50 group flex items-center justify-between transition-colors"
                                >
                                    <div>
                                        <div className="font-medium text-slate-900">
                                            {artifact.title || artifact.name || artifact.short_name}
                                        </div>
                                        <div className="text-xs text-slate-500 font-mono mt-0.5">
                                            {artifact.aid || artifact.id}
                                        </div>
                                    </div>
                                    <Check className="w-4 h-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-500">
                            No artifacts found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
