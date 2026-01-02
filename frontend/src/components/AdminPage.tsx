import { useState, useEffect } from 'react';
import { Database, Users, Package, Shield, LayoutDashboard } from 'lucide-react';
import clsx from 'clsx';
import UserManagement from './UserManagement';
import DatabaseManager from './DatabaseManager';
import DependencyPage from './DependencyPage';

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState<'users' | 'database' | 'packages'>('users');
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // Simple client-side check, backend will still enforce
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            // Support both old (role) and new (roles array) format
            if (user.roles?.includes('admin') || user.role === 'admin') {
                setIsAdmin(true);
            }
        }
    }, []);

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
                <Shield className="w-16 h-16 text-red-500" />
                <h1 className="text-2xl font-bold text-slate-800">Access Denied</h1>
                <p className="text-slate-500 max-w-md">You do not have administrative privileges to access this area. If you believe this is an error, please contact the system administrator.</p>
                <button
                    onClick={() => window.location.href = '/'}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold"
                >
                    Return to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-4">
                            <Shield className="w-8 h-8 text-blue-600" />
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Admin Console</h1>
                        </div>
                        <nav className="flex space-x-8">
                            {[
                                { id: 'users', label: 'Users', icon: Users },
                                { id: 'database', label: 'Database', icon: Database },
                                { id: 'packages', label: 'Packages', icon: Package }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={clsx(
                                        "flex items-center gap-2 px-1 py-4 text-sm font-bold border-b-2 transition-all",
                                        activeTab === tab.id
                                            ? "border-blue-600 text-blue-600"
                                            : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                                    )}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => window.location.href = '/'}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                            >
                                <LayoutDashboard className="w-4 h-4" />
                                Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {activeTab === 'users' && <UserManagement />}
                    {activeTab === 'database' && <DatabaseManager />}
                    {activeTab === 'packages' && <DependencyPage />}
                </div>
            </main>
        </div>
    );
}
