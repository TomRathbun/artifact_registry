import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Database,
    RefreshCcw,
    Download,
    Trash2,
    RotateCcw,
    Plus,
    MessageSquare,
    Table,
    Clock,
    HardDrive,
    Search,
    ChevronDown,
    ChevronRight,
    Check,
    X,
    AlertTriangle
} from 'lucide-react';
import clsx from 'clsx';
import { ConfirmationModal } from './ConfirmationModal';
import { InfoModal } from './InfoModal';

interface Backup {
    filename: string;
    size_mb: number;
    created: string;
    note: string;
}

interface TableSchema {
    table: string;
    columns: { name: string; type: string }[];
    sample_data: any[];
}

export default function DatabaseManager() {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<'backups' | 'schema'>('backups');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedTables, setExpandedTables] = useState<string[]>([]);
    const [editingNote, setEditingNote] = useState<{ filename: string; note: string } | null>(null);

    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        isDestructive?: boolean;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
    });

    const [infoModal, setInfoModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
    }>({
        isOpen: false,
        title: '',
        message: '',
    });

    const getAuthHeaders = () => ({
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    });

    const { data: backups, isLoading: backupsLoading, error: backupsError } = useQuery<Backup[]>({
        queryKey: ['backups'],
        queryFn: async () => {
            const res = await fetch('/api/v1/database/backups', {
                headers: getAuthHeaders()
            });
            if (!res.ok) {
                if (res.status === 401 || res.status === 403) {
                    throw new Error('Unauthorized: You do not have permission to access database backups.');
                }
                throw new Error('Failed to fetch backups');
            }
            return res.json();
        },
        retry: false
    });

    const { data: schema, isLoading: schemaLoading } = useQuery<TableSchema[]>({
        queryKey: ['schema'],
        queryFn: () => fetch('/api/v1/database/schema').then(res => res.json()),
        enabled: activeTab === 'schema'
    });

    const restartMutation = useMutation({
        mutationFn: () => fetch('/api/v1/database/restart', { method: 'POST' }).then(res => res.json()),
        onSuccess: () => alert('Database connections flushed successfully.')
    });

    const createBackupMutation = useMutation({
        mutationFn: (note: string) => fetch(`/api/v1/database/backup/create?note=${encodeURIComponent(note)}`, { method: 'POST' }).then(res => res.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['backups'] });
            alert('Backup created successfully.');
        }
    });

    const deleteBackupMutation = useMutation({
        mutationFn: (filename: string) => fetch(`/api/v1/database/backups/${filename}`, { method: 'DELETE' }).then(res => res.json()),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['backups'] })
    });

    const restoreBackupMutation = useMutation({
        mutationFn: (filename: string) => fetch(`/api/v1/database/backups/${filename}/restore`, { method: 'POST' }).then(res => res.json()),
        onSuccess: () => {
            alert('Database restored successfully. The page will reload.');
            window.location.reload();
        }
    });

    const updateNoteMutation = useMutation({
        mutationFn: ({ filename, note }: { filename: string, note: string }) =>
            fetch(`/api/v1/database/backups/${filename}/note`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ note })
            }).then(res => res.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['backups'] });
            setEditingNote(null);
        }
    });

    const filteredBackups = backups?.filter(b =>
        b.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.note.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleTable = (tableName: string) => {
        setExpandedTables(prev =>
            prev.includes(tableName) ? prev.filter(t => t !== tableName) : [...prev, tableName]
        );
    };

    const handleRestore = (filename: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Restore Database',
            message: `Are you sure you want to restore from "${filename}"? This will COMPLETELY OVERWRITE the current database data.`,
            isDestructive: true,
            onConfirm: () => restoreBackupMutation.mutate(filename)
        });
    };

    const handleRestart = () => {
        setConfirmModal({
            isOpen: true,
            title: 'Restart Database Cache',
            message: 'This will terminate all active connections to the database. This is safe to do if the database is acting up or stuck.',
            onConfirm: () => restartMutation.mutate()
        });
    };

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <Database className="w-8 h-8 text-blue-600" />
                        Database Management
                    </h1>
                    <p className="text-slate-500 mt-1">Manage backups, monitor schema, and maintain system health.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleRestart}
                        className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-600 font-medium"
                    >
                        <RefreshCcw className={clsx("w-4 h-4", restartMutation.isPending && "animate-spin")} />
                        Flush Connections
                    </button>
                    <button
                        onClick={() => createBackupMutation.mutate('')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        New Backup
                    </button>
                </div>
            </header>

            {backupsError && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 flex items-start gap-4">
                    <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-bold text-red-900 mb-1">Access Denied</h3>
                        <p className="text-red-700">{(backupsError as Error).message}</p>
                    </div>
                </div>
            )}

            <nav className="flex border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('backups')}
                    className={clsx(
                        "px-6 py-3 font-medium transition-colors border-b-2",
                        activeTab === 'backups' ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"
                    )}
                >
                    Backups
                </button>
                <button
                    onClick={() => setActiveTab('schema')}
                    className={clsx(
                        "px-6 py-3 font-medium transition-colors border-b-2",
                        activeTab === 'schema' ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"
                    )}
                >
                    Schema & Data
                </button>
            </nav>

            <main className="min-h-[400px]">
                {activeTab === 'backups' ? (
                    <div className="space-y-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search backups and notes..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>

                        {backupsLoading ? (
                            <div className="flex justify-center p-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {filteredBackups?.map((backup) => (
                                    <div key={backup.filename} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-slate-300 transition-all group">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <HardDrive className="w-5 h-5 text-slate-400" />
                                                    <h3 className="font-bold text-slate-800 text-lg">{backup.filename}</h3>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500">
                                                    <span className="flex items-center gap-1.5">
                                                        <Clock className="w-4 h-4" />
                                                        {new Date(backup.created).toLocaleString()}
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <Database className="w-4 h-4" />
                                                        {backup.size_mb} MB
                                                    </span>
                                                </div>

                                                {editingNote?.filename === backup.filename ? (
                                                    <div className="mt-3 flex items-center gap-2 max-w-xl">
                                                        <input
                                                            autoFocus
                                                            type="text"
                                                            value={editingNote.note}
                                                            onChange={(e) => setEditingNote({ ...editingNote, note: e.target.value })}
                                                            className="flex-1 px-3 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                            placeholder="Add a note..."
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') updateNoteMutation.mutate({ filename: backup.filename, note: editingNote.note });
                                                                if (e.key === 'Escape') setEditingNote(null);
                                                            }}
                                                        />
                                                        <button
                                                            onClick={() => updateNoteMutation.mutate({ filename: backup.filename, note: editingNote.note })}
                                                            className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                                                        >
                                                            <Check className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingNote(null)}
                                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                                        >
                                                            <X className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div
                                                        onClick={() => setEditingNote({ filename: backup.filename, note: backup.note })}
                                                        className="mt-3 flex items-start gap-2 text-slate-600 italic cursor-pointer hover:bg-slate-50 p-2 rounded-lg group/note border border-transparent hover:border-slate-100 transition-colors"
                                                    >
                                                        <MessageSquare className="w-4 h-4 mt-0.5 text-slate-400 group-hover/note:text-blue-500" />
                                                        {backup.note || "Add a note to this backup..."}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => {
                                                        const link = document.createElement('a');
                                                        link.href = `/api/v1/database/backups/${backup.filename}`;
                                                        link.download = backup.filename;
                                                        document.body.appendChild(link);
                                                        link.click();
                                                        document.body.removeChild(link);
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Download"
                                                >
                                                    <Download className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleRestore(backup.filename)}
                                                    className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                                    title="Restore from this Backup"
                                                >
                                                    <RotateCcw className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setConfirmModal({
                                                            isOpen: true,
                                                            title: 'Delete Backup',
                                                            message: `Are you sure you want to delete "${backup.filename}"? This cannot be undone.`,
                                                            isDestructive: true,
                                                            onConfirm: () => deleteBackupMutation.mutate(backup.filename)
                                                        });
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {filteredBackups?.length === 0 && (
                                    <div className="text-center p-12 bg-white rounded-xl border border-dashed border-slate-300">
                                        <HardDrive className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                        <p className="text-slate-500 font-medium">No backups found.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {schemaLoading ? (
                            <div className="flex justify-center p-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {schema?.map((table) => (
                                    <div key={table.table} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                        <div
                                            onClick={() => toggleTable(table.table)}
                                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Table className="w-5 h-5 text-blue-500" />
                                                <span className="font-bold text-slate-800 font-mono">{table.table}</span>
                                                <span className="text-sm text-slate-400">({table.columns.length} columns)</span>
                                            </div>
                                            {expandedTables.includes(table.table) ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                                        </div>

                                        {expandedTables.includes(table.table) && (
                                            <div className="border-t border-slate-100 p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
                                                <div>
                                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Columns</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {table.columns.map(col => (
                                                            <div key={col.name} className="px-2 py-1 bg-slate-50 border border-slate-100 rounded text-xs">
                                                                <span className="font-bold text-slate-700">{col.name}</span>
                                                                <span className="text-slate-400 ml-1">:{col.type}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Sample Data (First 5 Rows)</h4>
                                                    {table.sample_data.length > 0 ? (
                                                        <div className="overflow-x-auto rounded-lg border border-slate-100">
                                                            <table className="w-full text-sm text-left border-collapse">
                                                                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                                                                    <tr>
                                                                        {table.columns.map(col => (
                                                                            <th key={col.name} className="px-4 py-2 font-mono text-[11px]">{col.name}</th>
                                                                        ))}
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-slate-50">
                                                                    {table.sample_data.map((row, i) => (
                                                                        <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                                                                            {table.columns.map(col => (
                                                                                <td key={col.name} className="px-4 py-2 text-slate-600 truncate max-w-[200px]" title={String(row[col.name])}>
                                                                                    {String(row[col.name])}
                                                                                </td>
                                                                            ))}
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-slate-400 italic">No records found.</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-4 text-amber-800">
                <AlertTriangle className="w-6 h-6 flex-shrink-0" />
                <div className="text-sm">
                    <p className="font-bold">Caution with Database Restores</p>
                    <p className="mt-1 opacity-90">Restoring a database replaces ALL current data with the selected backup version. This process is irreversible once started. Always ensure you have a fresh backup of the current state before performing a restore.</p>
                </div>
            </div>

            <ConfirmationModal
                {...confirmModal}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
            />

            <InfoModal
                {...infoModal}
                onClose={() => setInfoModal({ ...infoModal, isOpen: false })}
            />
        </div>
    );
}
