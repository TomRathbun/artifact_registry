import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams, Link } from 'react-router-dom';
import { ChevronLeft, ExternalLink, Package, Server, Smartphone, Search, AlertTriangle, ShieldCheck } from 'lucide-react';

interface Dependency {
    name: string;
    version: string;
    latest?: string;
    description?: string;
    source: 'npm' | 'pypi';
    homepage?: string;
    analysis?: {
        safe: boolean;
        summary: string;
        issues: string[];
    };
}

const DependencyPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const type = searchParams.get('type') || 'frontend'; // 'frontend' or 'backend'

    const [loading, setLoading] = useState(true);
    const [upgrading, setUpgrading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
    const [systemInfo, setSystemInfo] = useState<any>(null);
    const [dependencies, setDependencies] = useState<{ frontend: Dependency[], backend: Dependency[] }>({ frontend: [], backend: [] });
    const [analyzing, setAnalyzing] = useState<string | null>(null);
    const [expandedPkg, setExpandedPkg] = useState<string | null>(null);

    const fetchDeps = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            const [depsRes, infoRes] = await Promise.all([
                axios.get('/api/v1/system/dependencies', { headers }),
                axios.get('/api/v1/system/info', { headers })
            ]);
            setDependencies(depsRes.data);
            setSystemInfo(infoRes.data);
            setError(null);
        } catch (err: any) {
            console.error('Error fetching dependencies:', err);
            if (err.response?.status === 401 || err.response?.status === 403) {
                setError('Unauthorized: You do not have permission to view dependencies.');
            } else {
                setError('Failed to fetch dependency information.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDeps();
    }, []);

    const handleUpgrade = async (pkg: Dependency) => {
        if (!pkg.latest) return;

        setUpgrading(pkg.name);
        setMessage(null);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('/api/v1/system/dependencies/upgrade', {
                name: pkg.name,
                version: pkg.latest,
                source: pkg.source
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data.success) {
                setMessage({ text: response.data.message, type: 'success' });
                // Refresh dependencies to show the new version
                await fetchDeps();
            } else {
                setMessage({ text: response.data.message, type: 'error' });
            }
        } catch (err: any) {
            if (err.response?.status === 401 || err.response?.status === 403) {
                setMessage({ text: 'Unauthorized: You do not have permission to upgrade packages.', type: 'error' });
            } else {
                setMessage({ text: err.response?.data?.message || 'Upgrade failed due to a server error.', type: 'error' });
            }
        } finally {
            setUpgrading(null);
        }
    };

    const handleAnalyze = async (pkg: Dependency) => {
        setAnalyzing(pkg.name);
        setExpandedPkg(pkg.name);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('/api/v1/system/dependencies/analyze', {
                name: pkg.name,
                version: pkg.latest,
                source: pkg.source
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setDependencies(prev => {
                const list = pkg.source === 'npm' ? [...prev.frontend] : [...prev.backend];
                const index = list.findIndex(p => p.name === pkg.name);
                if (index !== -1) {
                    list[index] = { ...list[index], analysis: response.data };
                }
                return pkg.source === 'npm' ? { ...prev, frontend: list } : { ...prev, backend: list };
            });
        } catch (err) {
            console.error('Analysis failed:', err);
        } finally {
            setAnalyzing(null);
        }
    };

    const currentDeps = type === 'frontend' ? dependencies.frontend : dependencies.backend;
    const runtimeVersion = type === 'frontend' ? systemInfo?.node_version : systemInfo?.python_version;
    const runtimeName = type === 'frontend' ? 'Node.js' : 'Python';

    if (loading && !dependencies.frontend.length) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-slate-500 flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                    <p>Fetching dependency information...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to="/about" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ChevronLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                            {type === 'frontend' ? <Smartphone className="text-blue-600" /> : <Server className="text-emerald-600" />}
                            {type === 'frontend' ? 'Frontend' : 'Backend'} Dependencies
                        </h1>
                        <div className="flex items-center gap-3 mt-1">
                            <p className="text-slate-500">
                                Viewing {currentDeps.length} packages for the {type === 'frontend' ? 'React Client' : 'FastAPI Backend'}
                            </p>
                            {runtimeVersion && (
                                <>
                                    <span className="text-slate-300">•</span>
                                    <p className="text-slate-600 font-medium text-sm flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                        {runtimeName}: <span className="font-mono">{runtimeVersion}</span>
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button
                        onClick={() => setSearchParams({ type: 'frontend' })}
                        className={`px-4 py-2 rounded-md transition-all ${type === 'frontend' ? 'bg-white shadow text-blue-600 font-medium' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        Frontend (NPM)
                    </button>
                    <button
                        onClick={() => setSearchParams({ type: 'backend' })}
                        className={`px-4 py-2 rounded-md transition-all ${type === 'backend' ? 'bg-white shadow text-emerald-600 font-medium' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        Backend (PyPI)
                    </button>
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-lg mb-6 border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
                    }`}>
                    <Package className="shrink-0" size={18} />
                    <p className="text-sm font-medium">{message.text}</p>
                    <button onClick={() => setMessage(null)} className="ml-auto text-slate-400 hover:text-slate-600">
                        ×
                    </button>
                </div>
            )}

            {error && !message && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-100 flex items-center gap-3">
                    <Package className="shrink-0" />
                    {error}
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse text-sm">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-6 py-4 font-semibold text-slate-700">Package Name</th>
                            <th className="px-6 py-4 font-semibold text-slate-700 text-center">Installed</th>
                            <th className="px-6 py-4 font-semibold text-slate-700 text-center">Latest</th>
                            <th className="px-6 py-4 font-semibold text-slate-700">Description</th>
                            <th className="px-6 py-4 font-semibold text-slate-700 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {currentDeps.map((pkg) => {
                            const hasUpdate = pkg.latest && pkg.version !== pkg.latest;
                            const isUpgrading = upgrading === pkg.name;
                            const isAnalyzing = analyzing === pkg.name;
                            const isExpanded = expandedPkg === pkg.name;

                            return (
                                <React.Fragment key={pkg.name}>
                                    <tr className={`hover:bg-slate-50 transition-colors ${isExpanded ? 'bg-slate-50 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'}`}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setExpandedPkg(isExpanded ? null : pkg.name)}
                                                    className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded transition-colors"
                                                >
                                                    {isExpanded ? '−' : '+'}
                                                </button>
                                                <span className="font-medium text-slate-900">{pkg.name}</span>
                                                <a
                                                    href={pkg.source === 'npm' ? `https://www.npmjs.com/package/${pkg.name}` : `https://pypi.org/project/${pkg.name}/`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-slate-400 hover:text-primary p-1"
                                                >
                                                    <ExternalLink size={14} />
                                                </a>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-2 py-1 bg-slate-100 rounded text-xs font-mono text-slate-600">{pkg.version}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {pkg.latest ? (
                                                <span className={`px-2 py-1 rounded text-xs font-mono ${!hasUpdate ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700'}`}>
                                                    {pkg.latest}
                                                </span>
                                            ) : (
                                                <span className="text-slate-300 text-xs italic">Unknown</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 max-w-md truncate" title={pkg.description}>
                                            {pkg.description || <span className="text-slate-300 italic">No description available</span>}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {hasUpdate && !pkg.analysis && !isAnalyzing && (
                                                    <button
                                                        onClick={() => handleAnalyze(pkg)}
                                                        className="p-1.5 text-slate-400 hover:text-primary hover:bg-white rounded transition-colors"
                                                        title="Check Compatibility"
                                                    >
                                                        <Search size={16} />
                                                    </button>
                                                )}
                                                {isAnalyzing && (
                                                    <div className="w-4 h-4 border-2 border-slate-200 border-t-primary rounded-full animate-spin"></div>
                                                )}
                                                {pkg.analysis && (
                                                    <div className={`flex items-center gap-1 text-xs font-bold ${pkg.analysis.safe ? 'text-emerald-600' : 'text-red-600'}`}>
                                                        {pkg.analysis.safe ? <ShieldCheck size={14} /> : <AlertTriangle size={14} />}
                                                        {pkg.analysis.safe ? 'Safe' : 'Conflict'}
                                                    </div>
                                                )}
                                                {hasUpdate ? (
                                                    <button
                                                        onClick={() => handleUpgrade(pkg)}
                                                        disabled={!!upgrading}
                                                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${isUpgrading
                                                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                            : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'
                                                            }`}
                                                    >
                                                        {isUpgrading ? (
                                                            <span className="flex items-center gap-1.5">
                                                                <div className="w-3 h-3 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin"></div>
                                                                Upgrading...
                                                            </span>
                                                        ) : 'Upgrade'}
                                                    </button>
                                                ) : (
                                                    <span className="text-slate-400 text-xs">-</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                    {isExpanded && (
                                        <tr className="bg-slate-50 border-l-4 border-l-primary">
                                            <td colSpan={5} className="px-12 py-6 border-t border-slate-100">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-4 duration-300">
                                                    <div className="space-y-4">
                                                        <div>
                                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Update Details</h4>
                                                            <p className="text-slate-700 leading-relaxed">
                                                                {pkg.description || 'No additional summary provided by registry.'}
                                                            </p>
                                                        </div>
                                                        {pkg.homepage && (
                                                            <div>
                                                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Package Resources</h4>
                                                                <a
                                                                    href={pkg.homepage}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium"
                                                                >
                                                                    <ExternalLink size={14} />
                                                                    Official Homepage / Documentation
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
                                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Compatibility Analysis</h4>
                                                        {!pkg.analysis ? (
                                                            <div className="flex flex-col items-center justify-center py-6 text-center">
                                                                <p className="text-sm text-slate-500 mb-4">Run a dry-run check to identify potential conflicts in your dependency tree.</p>
                                                                <button
                                                                    onClick={() => handleAnalyze(pkg)}
                                                                    disabled={isAnalyzing}
                                                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-sm font-bold transition-all flex items-center gap-2"
                                                                >
                                                                    {isAnalyzing ? <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div> : <Search size={16} />}
                                                                    {isAnalyzing ? 'Analyzing...' : 'Check Compatibility'}
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-4">
                                                                <div className={`p-3 rounded flex items-start gap-3 ${pkg.analysis.safe ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                                                    {pkg.analysis.safe ? <ShieldCheck className="shrink-0 mt-0.5" /> : <AlertTriangle className="shrink-0 mt-0.5" />}
                                                                    <div>
                                                                        <p className="font-bold text-sm">{pkg.analysis.safe ? 'Safe to Upgrade' : 'Compatibility Issue Detected'}</p>
                                                                        <p className="text-xs opacity-90">{pkg.analysis.summary}</p>
                                                                    </div>
                                                                </div>
                                                                {pkg.analysis.issues.length > 0 && (
                                                                    <div>
                                                                        <p className="text-xs font-bold text-slate-500 mb-2">Identified Conflicts:</p>
                                                                        <ul className="space-y-1.5">
                                                                            {pkg.analysis.issues.map((issue, i) => (
                                                                                <li key={i} className="text-xs text-red-600 flex items-start gap-2 bg-red-50/30 p-1.5 rounded">
                                                                                    <span className="mt-1 w-1 h-1 rounded-full bg-red-400 shrink-0"></span>
                                                                                    {issue}
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
                {currentDeps.length === 0 && !loading && (
                    <div className="p-12 text-center text-slate-400">
                        <Package size={48} className="mx-auto mb-4 opacity-20" />
                        <p>No dependency data found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DependencyPage;
