import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ArrowLeft, GitCommit } from 'lucide-react';
import MarkdownDisplay from './MarkdownDisplay';

const ChangelogPage: React.FC = () => {
    const navigate = useNavigate();

    const { data: changelog, isLoading } = useQuery({
        queryKey: ['changelog'],
        queryFn: async () => {
            const res = await axios.get('/api/v1/system/changelog');
            return res.data.content;
        }
    });

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <div className="flex items-center gap-3 mb-8">
                <GitCommit className="w-8 h-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-slate-800">Changelog</h1>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
                {isLoading ? (
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-slate-200 rounded w-1/4"></div>
                        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                        <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                    </div>
                ) : (
                    <div className="prose prose-slate max-w-none">
                        <MarkdownDisplay content={changelog || 'No changelog found.'} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChangelogPage;
