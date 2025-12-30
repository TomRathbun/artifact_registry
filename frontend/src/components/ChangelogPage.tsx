import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, GitCommit } from 'lucide-react';

interface ChangeLogEntry {
    version: string;
    date: string;
    changes: string[];
    type: 'major' | 'minor' | 'patch';
}

const changelogData: ChangeLogEntry[] = [
    {
        version: '0.1.5',
        date: '2025-12-26',
        type: 'minor',
        changes: [
            'Interactive Graph Reconnection: Enabled bidirectional edge reconnection in the Artifact Graph View',
            'Rich List Views: Implemented Markdown and Mermaid rendering for description fields in all list views',
            'UI Polishing: Softened table borders and refined typography for a cleaner, modern look',
            'System Update: Upgraded Node.js to v20.19.6 for improved performance and security'
        ]
    },
    {
        version: '0.1.4',
        date: '2025-12-25',
        type: 'minor',
        changes: [
            'Enhanced System Stability: Relocated local PostgreSQL to port 5433 and implemented robust connection retries',
            'Added Dependency Management: View and upgrade Frontend (NPM) and Backend (PyPI) packages directly from the UI',
            'Interactive Architecture: Updated System Architecture diagram to be interactive with real-time status and navigation',
            'Advanced Artifact Renaming: Enabled renaming artifacts across different Areas and IDs',
            'UX Improvements: graceful error handling for database connection failures'
        ]
    },
    {
        version: '0.1.3',
        date: '2025-12-14',
        type: 'minor',
        changes: [
            'Implemented Arabic Translation support for Artifact Presentation view',
            'Fixed critical crash when hovering over comments in presentation mode',
            'Added database auto-migration on restore to ensure schema consistency',
            'Improved database connection resilience with auto-reconnect (pool_pre_ping)'
        ]
    },
    {
        version: '0.1.2',
        date: '2025-12-12',
        type: 'patch',
        changes: [
            'Enhanced Comment Panel: Comments are now grouped by field and sorted to match the presentation order',
            'Added Persistent Comment Highlighting: Clicking a field in the artifact editor highlights relevant comments',
            'Improved Selection Handling: Text selection is preserved when clicking back into the same field',
            'Added Comment Support for All Fields: Metadata, sites, components, and document content are now eligible for comments'
        ]
    },
    {
        version: '0.1.1',
        date: '2025-12-10',
        type: 'minor',
        changes: [
            'Added `MarkdownDisplay` component for unified Markdown and Mermaid diagram rendering',
            'Added Image Gallery and Upload functionality',
            'Fixed Document artifact deletion in List View',
            'Enhanced `ArtifactPresentation` to support Mermaid diagrams in all description fields'
        ]
    },
    {
        version: '0.1.0',
        date: '2025-12-10',
        type: 'minor',
        changes: [
            'Refactored project file structure for better organization',
            'Implemented "Tags" functionality for Sites',
            'Added "Changelog" page',
            'Separated "Security Domain" and "Tags" columns in Site Manager',
            'Fixed Mermaid diagram content persistence issue',
            'Fixed 500 error on Need list view due to tag deserialization',
            'Moved "About" page to global route'
        ]
    },
    {
        version: '0.0.5',
        date: '2025-12-09',
        type: 'patch',
        changes: [
            'Added initial Site Management interface',
            'Implemented basic Artifact List Views',
            'Added Graph View for artifact relationships'
        ]
    }
];

const ChangelogPage: React.FC = () => {
    const navigate = useNavigate();

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

            <div className="space-y-8">
                {changelogData.map((entry, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <span className="text-lg font-bold text-slate-800">v{entry.version}</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium uppercase ${entry.type === 'major' ? 'bg-red-100 text-red-700' :
                                    entry.type === 'minor' ? 'bg-blue-100 text-blue-700' :
                                        'bg-slate-200 text-slate-700'
                                    }`}>
                                    {entry.type}
                                </span>
                            </div>
                            <span className="text-sm text-slate-500 font-mono">{entry.date}</span>
                        </div>
                        <div className="p-6">
                            <ul className="space-y-2">
                                {entry.changes.map((change, i) => (
                                    <li key={i} className="flex items-start gap-2 text-slate-600">
                                        <span className="mt-2 w-1.5 h-1.5 bg-slate-400 rounded-full flex-shrink-0" />
                                        <span>{change}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ChangelogPage;
