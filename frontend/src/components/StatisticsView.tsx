import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    BarChart3,
    PieChart,
    CheckCircle2,
    Clock,
    Hash,
    Layers,
    Download
} from 'lucide-react';
import { clsx } from 'clsx';
import { OpenAPI } from '../client/core/OpenAPI';
import { request as __request } from '../client/core/request';

interface StatMatrix {
    artifact_type: string;
    area: string;
    status: string;
    count: number;
}

interface StatisticsData {
    total_count: number;
    by_type: Record<string, number>;
    by_status: Record<string, number>;
    by_area: Record<string, number>;
    matrix: StatMatrix[];
}

export default function StatisticsView() {
    const { projectId } = useParams<{ projectId: string }>();

    const { data: stats, isLoading, error } = useQuery<StatisticsData>({
        queryKey: ['statistics', projectId],
        queryFn: async () => {
            return __request(OpenAPI, {
                method: 'GET',
                url: '/api/v1/reports/statistics/{project_id}',
                path: {
                    'project_id': projectId || '',
                },
            });
        },
        enabled: !!projectId,
    });

    if (isLoading) return <div className="p-8">Loading statistics...</div>;

    if (error || !stats) {
        return (
            <div className="p-8 text-red-500 bg-red-50 rounded-lg border border-red-200">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    Failed to load statistics
                </h2>
                <p className="mt-2">There was an error fetching the project statistics. Please try again later.</p>
            </div>
        );
    }

    const handleExportMarkdown = () => {
        if (!stats) return;

        let content = `# Project Statistics: ${projectId}\n\n`;
        content += `*Exported on ${new Date().toLocaleString()}*\n\n`;

        content += `## Summary\n\n`;
        content += `- **Total Artifacts**: ${stats.total_count}\n`;
        content += `- **Approved**: ${stats.by_status['Approved'] || 0} (${stats.total_count > 0 ? Math.round(((stats.by_status['Approved'] || 0) / stats.total_count) * 100) : 0}%)\n`;
        content += `- **In Review**: ${(stats.by_status['In_Review'] || 0) + (stats.by_status['Ready_for_Review'] || 0)}\n`;
        content += `- **Total Areas**: ${Object.keys(stats.by_area).length}\n\n`;

        content += `## Artifact Types\n\n`;
        const typeOrder = ['vision', 'need', 'use_case', 'requirement', 'document'];
        typeOrder.forEach(type => {
            const count = stats.by_type[type] || 0;
            const percentage = stats.total_count > 0 ? Math.round((count / stats.total_count) * 100) : 0;
            content += `- **${type.replace('_', ' ').toUpperCase()}**: ${count} (${percentage}%)\n`;
        });
        content += `\n`;

        content += `## Status Distribution\n\n`;
        Object.entries(stats.by_status).sort((a, b) => b[1] - a[1]).forEach(([status, count]) => {
            content += `- **${status.replace('_', ' ')}**: ${count}\n`;
        });
        content += `\n`;

        content += `## Area Coverage\n\n`;
        content += `| Domain Area | Total | Type Breakdown | Status Overview |\n`;
        content += `| :--- | :---: | :--- | :--- |\n`;

        Object.entries(stats.by_area)
            .sort(([a], [b]) => {
                if (a === 'GLOBAL') return -1;
                if (b === 'GLOBAL') return 1;
                return a.localeCompare(b);
            })
            .forEach(([area, count]) => {
                const types = stats.matrix
                    .filter(m => m.area === area)
                    .reduce((acc, curr) => {
                        const existing = acc.find(a => a.type === curr.artifact_type);
                        if (existing) existing.count += curr.count;
                        else acc.push({ type: curr.artifact_type, count: curr.count });
                        return acc;
                    }, [] as { type: string, count: number }[])
                    .sort((a, b) => {
                        const order = ['vision', 'need', 'use_case', 'requirement', 'document'];
                        return order.indexOf(a.type) - order.indexOf(b.type);
                    })
                    .map(t => `${t.count} ${t.type.replace('_', ' ')}`)
                    .join(' | ');

                const statuses = stats.matrix
                    .filter(m => m.area === area)
                    .reduce((acc, curr) => {
                        const existing = acc.find(a => a.status === curr.status);
                        if (existing) existing.count += curr.count;
                        else acc.push({ status: curr.status, count: curr.count });
                        return acc;
                    }, [] as { status: string, count: number }[])
                    .map(s => `${s.count} ${s.status.replace('_', ' ')}`)
                    .join(', ');

                content += `| ${area} | ${count} | ${types} | ${statuses} |\n`;
            });

        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `statistics_export_${projectId}_${new Date().toISOString().split('T')[0]}.md`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleExportWord = () => {
        if (!stats) return;

        let content = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head>
                <meta charset="utf-8">
                <title>Project Statistics</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; }
                    h1 { color: #2c3e50; border-bottom: 2px solid #eee; padding-bottom: 10px; }
                    h2 { color: #34495e; margin-top: 30px; border-bottom: 1px solid #eee; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th { background-color: #f8f9fa; border: 1px solid #dee2e6; padding: 12px; text-align: left; font-weight: bold; }
                    td { border: 1px solid #dee2e6; padding: 12px; }
                    .summary-card { background: #f1f5f9; padding: 15px; border-radius: 8px; margin-bottom: 10px; border: 1px solid #e2e8f0; }
                </style>
            </head>
            <body>
            <h1>Project Statistics: ${projectId}</h1>
            <p><strong>Exported on:</strong> ${new Date().toLocaleString()}</p>
            
            <h2>Summary</h2>
            <div class="summary-card">
                <p><strong>Total Artifacts:</strong> ${stats.total_count}</p>
                <p><strong>Approved:</strong> ${stats.by_status['Approved'] || 0} (${stats.total_count > 0 ? Math.round(((stats.by_status['Approved'] || 0) / stats.total_count) * 100) : 0}%)</p>
                <p><strong>In Review:</strong> ${(stats.by_status['In_Review'] || 0) + (stats.by_status['Ready_for_Review'] || 0)}</p>
                <p><strong>Total Areas:</strong> ${Object.keys(stats.by_area).length}</p>
            </div>

            <h2>Artifact Types</h2>
            <table>
                <thead>
                    <tr><th>Type</th><th>Count</th><th>Percentage</th></tr>
                </thead>
                <tbody>
        `;

        const typeOrder = ['vision', 'need', 'use_case', 'requirement', 'document'];
        typeOrder.forEach(type => {
            const count = stats.by_type[type] || 0;
            const percentage = stats.total_count > 0 ? Math.round((count / stats.total_count) * 100) : 0;
            content += `<tr><td style="text-transform: capitalize;">${type.replace('_', ' ')}</td><td>${count}</td><td>${percentage}%</td></tr>`;
        });

        content += `
                </tbody>
            </table>

            <h2>Status Distribution</h2>
            <table>
                <thead>
                    <tr><th>Status</th><th>Count</th></tr>
                </thead>
                <tbody>
        `;

        Object.entries(stats.by_status).sort((a, b) => b[1] - a[1]).forEach(([status, count]) => {
            content += `<tr><td>${status.replace('_', ' ')}</td><td>${count}</td></tr>`;
        });

        content += `
                </tbody>
            </table>

            <h2>Area Coverage</h2>
            <table>
                <thead>
                    <tr>
                        <th>Domain Area</th>
                        <th style="text-align: center;">Total</th>
                        <th>Type Breakdown</th>
                        <th>Status Overview</th>
                    </tr>
                </thead>
                <tbody>
        `;

        Object.entries(stats.by_area)
            .sort(([a], [b]) => {
                if (a === 'GLOBAL') return -1;
                if (b === 'GLOBAL') return 1;
                return a.localeCompare(b);
            })
            .forEach(([area, count]) => {
                const types = stats.matrix
                    .filter(m => m.area === area)
                    .reduce((acc, curr) => {
                        const existing = acc.find(a => a.type === curr.artifact_type);
                        if (existing) existing.count += curr.count;
                        else acc.push({ type: curr.artifact_type, count: curr.count });
                        return acc;
                    }, [] as { type: string, count: number }[])
                    .sort((a, b) => {
                        const order = ['vision', 'need', 'use_case', 'requirement', 'document'];
                        return order.indexOf(a.type) - order.indexOf(b.type);
                    })
                    .map(t => `${t.count} ${t.type.replace('_', ' ')}`)
                    .join(' | ');

                const statuses = stats.matrix
                    .filter(m => m.area === area)
                    .reduce((acc, curr) => {
                        const existing = acc.find(a => a.status === curr.status);
                        if (existing) existing.count += curr.count;
                        else acc.push({ status: curr.status, count: curr.count });
                        return acc;
                    }, [] as { status: string, count: number }[])
                    .map(s => `${s.count} ${s.status.replace('_', ' ')}`)
                    .join(', ');

                content += `
                    <tr>
                        <td><strong>${area}</strong></td>
                        <td style="text-align: center;">${count}</td>
                        <td style="font-size: 0.9em;">${types}</td>
                        <td style="font-size: 0.9em;">${statuses}</td>
                    </tr>
                `;
            });

        content += `
                </tbody>
            </table>
            </body>
            </html>
        `;

        const blob = new Blob([content], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `statistics_export_${projectId}_${new Date().toISOString().split('T')[0]}.doc`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const statusColors: Record<string, string> = {
        'Draft': 'bg-gray-100 text-gray-700 border-gray-200',
        'Ready_for_Review': 'bg-blue-100 text-blue-700 border-blue-200',
        'In_Review': 'bg-amber-100 text-amber-700 border-amber-200',
        'Approved': 'bg-emerald-100 text-emerald-700 border-emerald-200',
        'Rejected': 'bg-red-100 text-red-700 border-red-200',
        'Deferred': 'bg-purple-100 text-purple-700 border-purple-200',
    };

    return (
        <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
            <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <BarChart3 className="w-8 h-8 text-blue-600" />
                        Project Statistics
                    </h1>
                    <p className="text-slate-500 mt-2">Analysis of artifacts by type, status, and domain area.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleExportMarkdown}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-600 border border-slate-700 text-white rounded-lg hover:bg-slate-700 transition-colors shadow-sm text-sm font-medium"
                    >
                        <Download className="w-4 h-4" />
                        Markdown
                    </button>
                    <button
                        onClick={handleExportWord}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 border border-blue-700 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm font-medium"
                    >
                        <Download className="w-4 h-4" />
                        Word (Doc)
                    </button>
                </div>
            </header>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <StatCard
                    icon={<Hash className="w-6 h-6 text-blue-500" />}
                    label="Total Artifacts"
                    value={stats.total_count}
                    color="blue"
                />
                <StatCard
                    icon={<CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                    label="Approved"
                    value={stats.by_status['Approved'] || 0}
                    percentage={stats.total_count > 0 ? Math.round(((stats.by_status['Approved'] || 0) / stats.total_count) * 100) : 0}
                    color="emerald"
                />
                <StatCard
                    icon={<Clock className="w-6 h-6 text-amber-500" />}
                    label="In Review"
                    value={(stats.by_status['In_Review'] || 0) + (stats.by_status['Ready_for_Review'] || 0)}
                    color="amber"
                />
                <StatCard
                    icon={<Layers className="w-6 h-6 text-purple-500" />}
                    label="Total Areas"
                    value={Object.keys(stats.by_area).length}
                    color="purple"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {/* Breakdown by Type */}
                <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-slate-400" />
                        Artifact Types
                    </h2>
                    <div className="space-y-4">
                        {Object.entries(stats.by_type).map(([type, count]) => (
                            <div key={type} className="group">
                                <div className="flex justify-between mb-1.5">
                                    <span className="text-sm font-medium text-slate-600 capitalize">{type.replace('_', ' ')}</span>
                                    <span className="text-sm font-bold text-slate-900">{count}</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="bg-blue-500 h-full rounded-full transition-all duration-1000 group-hover:bg-blue-600"
                                        style={{ width: `${(count / stats.total_count) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Breakdown by Status */}
                <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-slate-400" />
                        Status Distribution
                    </h2>
                    <div className="flex flex-wrap gap-3">
                        {Object.entries(stats.by_status).sort((a, b) => b[1] - a[1]).map(([status, count]) => (
                            <div
                                key={status}
                                className={clsx(
                                    "px-4 py-3 rounded-xl border flex flex-col min-w-[120px]",
                                    statusColors[status] || "bg-slate-50 text-slate-600 border-slate-200"
                                )}
                            >
                                <span className="text-xs font-semibold uppercase tracking-wider">{status.replace('_', ' ')}</span>
                                <span className="text-2xl font-bold mt-1">{count}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Area Matrix */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Layers className="w-5 h-5 text-slate-400" />
                        Area Coverage
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                <th className="px-6 py-4">Domain Area</th>
                                <th className="px-6 py-4 text-center">Total</th>
                                <th className="px-6 py-4">Type Breakdown</th>
                                <th className="px-6 py-4">Status Overview</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {Object.entries(stats.by_area)
                                .sort(([a], [b]) => {
                                    if (a === 'GLOBAL') return -1;
                                    if (b === 'GLOBAL') return 1;
                                    return a.localeCompare(b);
                                })
                                .map(([area, count]) => (
                                    <tr key={area} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-semibold text-slate-900">{area}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                                {count}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-1.5 flex-wrap">
                                                {stats.matrix
                                                    .filter(m => m.area === area)
                                                    .reduce((acc, curr) => {
                                                        const existing = acc.find(a => a.type === curr.artifact_type);
                                                        if (existing) existing.count += curr.count;
                                                        else acc.push({ type: curr.artifact_type, count: curr.count });
                                                        return acc;
                                                    }, [] as { type: string, count: number }[])
                                                    .sort((a, b) => {
                                                        const order = ['vision', 'need', 'use_case', 'requirement', 'document'];
                                                        return order.indexOf(a.type) - order.indexOf(b.type);
                                                    })
                                                    .map(t => (
                                                        <span key={t.type} className="text-[10px] text-slate-500 font-medium whitespace-nowrap">
                                                            <span className="text-slate-900 font-bold">{t.count}</span> <span className="capitalize">{t.type.replace('_', ' ')}</span>
                                                        </span>
                                                    ))
                                                    .reduce((prev, curr, idx) => idx === 0 ? [curr] : [...prev, <span key={`sep-${idx}`} className="text-slate-300">|</span>, curr], [] as React.ReactNode[])
                                                }
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-1.5 flex-wrap">
                                                {stats.matrix
                                                    .filter(m => m.area === area)
                                                    .reduce((acc, curr) => {
                                                        const existing = acc.find(a => a.status === curr.status);
                                                        if (existing) existing.count += curr.count;
                                                        else acc.push({ status: curr.status, count: curr.count });
                                                        return acc;
                                                    }, [] as { status: string, count: number }[])
                                                    .map(s => (
                                                        <span
                                                            key={s.status}
                                                            className={clsx(
                                                                "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border",
                                                                statusColors[s.status] || "bg-slate-50 text-slate-600 border-slate-200"
                                                            )}
                                                        >
                                                            {s.count} {s.status.replace('_', ' ')}
                                                        </span>
                                                    ))
                                                }
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}

function StatCard({ icon, label, value, percentage, color }: { icon: React.ReactNode, label: string, value: number | string, percentage?: number, color: string }) {
    const colorClasses: Record<string, string> = {
        blue: 'bg-blue-50/50 border-blue-100',
        emerald: 'bg-emerald-50/50 border-emerald-100',
        amber: 'bg-amber-50/50 border-amber-100',
        purple: 'bg-purple-50/50 border-purple-100',
    };

    return (
        <div className={clsx("p-6 rounded-2xl border shadow-sm transition-all hover:shadow-md", colorClasses[color])}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{value}</h3>
                        {percentage !== undefined && (
                            <span className="text-sm font-semibold text-emerald-600">({percentage}%)</span>
                        )}
                    </div>
                </div>
                <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100/50">
                    {icon}
                </div>
            </div>
        </div>
    );
}
