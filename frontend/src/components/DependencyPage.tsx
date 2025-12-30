import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams, Link } from 'react-router-dom';
import { ChevronLeft, ExternalLink, Package, Server, Smartphone } from 'lucide-react';

interface Dependency {
    name: string;
    version: string;
    latest?: string;
    description?: string;
    source: 'npm' | 'pypi';
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

    const fetchDeps = async () => {
        setLoading(true);
        try {
            const [depsRes, infoRes] = await Promise.all([
                axios.get('/api/v1/system/dependencies'),
                axios.get('/api/v1/system/info')
            ]);
            setDependencies(depsRes.data);
            setSystemInfo(infoRes.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching dependencies:', err);
            setError('Failed to fetch dependency information.');
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
            const response = await axios.post('/api/v1/system/dependencies/upgrade', {
                name: pkg.name,
                version: pkg.latest,
                source: pkg.source
            });

            if (response.data.success) {
                setMessage({ text: response.data.message, type: 'success' });
                // Refresh dependencies to show the new version
                await fetchDeps();
            } else {
                setMessage({ text: response.data.message, type: 'error' });
            }
        } catch (err: any) {
            setMessage({ text: err.response?.data?.message || 'Upgrade failed due to a server error.', type: 'error' });
        } finally {
            setUpgrading(null);
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

                            return (
                                <tr key={pkg.name} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
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
                                    </td>
                                </tr>
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
