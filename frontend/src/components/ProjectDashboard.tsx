import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ProjectsService, type ProjectCreate } from '../client'
import { useForm } from 'react-hook-form'
import { Plus, FolderOpen, Trash2, Download, Upload, Info, History, Settings, Shield } from 'lucide-react'
import clsx from 'clsx'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { ConfirmationModal } from './ConfirmationModal'
import { InfoModal } from './InfoModal'

export default function ProjectDashboard() {
    const navigate = useNavigate();
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const isAdmin = user?.roles?.includes('admin') || user?.role === 'admin'; // Support both old and new format

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const queryClient = useQueryClient()
    const { data: projects, isLoading } = useQuery({
        queryKey: ['projects'],
        queryFn: () => ProjectsService.listProjectsApiV1ProjectsProjectsGet(),

    })

    const { register, handleSubmit, reset } = useForm<ProjectCreate>()

    // Modal States
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        isDestructive?: boolean;
        confirmLabel?: string;
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

    const createProjectMutation = useMutation({
        mutationFn: (data: ProjectCreate) => ProjectsService.createProjectApiV1ProjectsProjectsPost(data),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] })
            reset()
        },
        onError: (error) => {
            console.error("Failed to create project:", error)
            setInfoModal({
                isOpen: true,
                title: 'Error',
                message: "Failed to create project. Please check the console for details."
            });
        }
    })

    const deleteProjectMutation = useMutation({
        mutationFn: (projectId: string) => ProjectsService.deleteProjectApiV1ProjectsProjectsProjectIdDelete(projectId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] })
        },
        onError: (error) => {
            console.error("Failed to delete project:", error)
            setInfoModal({
                isOpen: true,
                title: 'Error',
                message: "Failed to delete project. Please check the console for details."
            });
        }
    })

    const handleExport = async (e: React.MouseEvent, projectId: string, projectName: string) => {
        e.preventDefault();
        try {
            const response = await fetch(`/api/v1/projects/${projectId}/export`);
            if (!response.ok) throw new Error('Export failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `project_export_${projectName}_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Export error:', error);
            setInfoModal({
                isOpen: true,
                title: 'Export Failed',
                message: 'Failed to export project data'
            });
        }
    };

    const handleImportClick = (e: React.MouseEvent, projectId: string) => {
        e.preventDefault();
        e.stopPropagation();

        // Trigger file input click programmatically after confirmation?
        // No, we can't trigger file input from async callback easily in all browsers.
        // Better to show modal first, then if confirmed, show file input?
        // Or: File input is hidden. Label click triggers it.
        // We need to intercept the label click.

        // Actually, the previous logic was: Click label -> File Input opens -> Select File -> onChange -> Confirm -> Process.
        // But `confirm()` is blocking.
        // With non-blocking modal, we can't pause the file selection.

        // Alternative flow:
        // 1. User clicks "Import" button (not file input label).
        // 2. Show Confirmation Modal "This will overwrite...".
        // 3. If Confirmed -> Trigger hidden file input click.
        // 4. File Input onChange -> Process Import.

        setConfirmModal({
            isOpen: true,
            title: 'Overwrite Project?',
            message: "This will OVERWRITE all existing data in this project. This action cannot be undone. Are you sure you want to proceed?",
            isDestructive: true,
            confirmLabel: 'Yes, Overwrite',
            onConfirm: () => {
                // Trigger file input
                const fileInput = document.getElementById(`import-file-${projectId}`) as HTMLInputElement;
                if (fileInput) fileInput.click();
            }
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, projectId: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const jsonData = JSON.parse(event.target?.result as string);

                const response = await fetch(`/api/v1/projects/${projectId}/import`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(jsonData),
                });

                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.detail || 'Import failed');
                }

                setInfoModal({
                    isOpen: true,
                    title: 'Success',
                    message: 'Project imported successfully!'
                });
                queryClient.invalidateQueries({ queryKey: ['projects'] });
            } catch (error) {
                console.error('Import error:', error);
                setInfoModal({
                    isOpen: true,
                    title: 'Import Failed',
                    message: `Failed to import project: ${error}`
                });
            }
        };
        reader.readAsText(file);
        e.target.value = ''; // Reset
    };

    const onSubmit = (data: ProjectCreate) => {
        createProjectMutation.mutate(data)
    }

    const handleDelete = (e: React.MouseEvent, projectId: string, projectName: string) => {
        e.preventDefault(); // Prevent navigation
        setConfirmModal({
            isOpen: true,
            title: 'Delete Project?',
            message: `Are you sure you want to delete project "${projectName}"? This will delete ALL artifacts associated with it. This action cannot be undone.`,
            isDestructive: true,
            confirmLabel: 'Delete',
            onConfirm: () => deleteProjectMutation.mutate(projectId)
        });
    }

    if (isLoading) return <div className="p-8">Loading projects...</div>

    const handleDatabaseBackup = async () => {
        try {
            const response = await fetch('/api/v1/database/backup');
            if (!response.ok) throw new Error('Backup failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `database_backup_${new Date().toISOString().split('T')[0]}.sql`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            setInfoModal({
                isOpen: true,
                title: 'Success',
                message: 'Database backup downloaded successfully!'
            });
        } catch (error) {
            console.error('Backup error:', error);
            setInfoModal({
                isOpen: true,
                title: 'Backup Failed',
                message: 'Failed to create database backup'
            });
        }
    };

    const handleDatabaseRestore = () => {
        setConfirmModal({
            isOpen: true,
            title: 'Restore Database?',
            message: 'This will COMPLETELY REPLACE the entire database with the backup file. ALL current data will be lost. This action cannot be undone. Are you absolutely sure?',
            isDestructive: true,
            confirmLabel: 'Yes, Restore Database',
            onConfirm: () => {
                const fileInput = document.getElementById('database-restore-file') as HTMLInputElement;
                if (fileInput) fileInput.click();
            }
        });
    };

    const handleDatabaseRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/v1/database/restore', {
                method: 'POST',
                body: await file.arrayBuffer()
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.detail || 'Restore failed');
            }

            setInfoModal({
                isOpen: true,
                title: 'Success',
                message: 'Database restored successfully! Please refresh the page.'
            });

            // Refresh all queries
            queryClient.invalidateQueries();
        } catch (error) {
            console.error('Restore error:', error);
            setInfoModal({
                isOpen: true,
                title: 'Restore Failed',
                message: `Failed to restore database: ${error}`
            });
        }
        e.target.value = ''; // Reset
    };

    return (
        <div className="max-w-4xl mx-auto p-8">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <img src="/assets/logo.png" alt="Registry Logo" className="w-16 h-16 object-contain" />
                    <h1 className="text-3xl font-bold text-slate-800">Artifact Registry</h1>
                </div>
                <div className="flex gap-2">
                    <Link to="/about" className="px-3 py-2 bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200 transition-colors flex items-center gap-2">
                        <Info className="w-4 h-4" /> About
                    </Link>
                    <Link to="/changelog" className="px-3 py-2 bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200 transition-colors flex items-center gap-2 font-medium">
                        <History className="w-4 h-4" /> Changelog
                    </Link>
                    {isAdmin && (
                        <Link to="/admin" className="px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors flex items-center gap-2 font-bold border border-blue-200">
                            <Shield className="w-4 h-4" /> Admin
                        </Link>
                    )}
                    <button
                        onClick={handleLogout}
                        className="px-3 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors flex items-center gap-2 font-medium border border-red-100"
                    >
                        Log Out
                    </button>
                </div>
            </div>

            {/* Admin Section */}
            {isAdmin && (
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200 mb-8 overflow-hidden">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                <Download className="w-4 h-4" />
                                Full Database Backup
                            </h3>
                            <p className="text-sm text-slate-600">Backup or restore the entire PostgreSQL database</p>
                        </div>
                        <div className="flex gap-2">
                            <Link
                                to="/admin"
                                className="px-4 py-2 bg-slate-600 text-white rounded hover:bg-slate-700 transition-colors flex items-center gap-2 text-sm font-bold"
                                title="Go to System Administration"
                            >
                                <Settings className="w-4 h-4" />
                                Admin Console
                            </Link>
                            <button
                                onClick={handleDatabaseBackup}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-bold"
                                title="Download full database backup"
                            >
                                <Download className="w-4 h-4" />
                                Backup Database
                            </button>
                            <button
                                onClick={handleDatabaseRestore}
                                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm font-bold"
                                title="Restore database from backup file"
                            >
                                <Upload className="w-4 h-4" />
                                Restore Database
                            </button>
                            <input
                                id="database-restore-file"
                                type="file"
                                accept=".sql"
                                className="hidden"
                                onChange={handleDatabaseRestoreFile}
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Project List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-slate-700 flex items-center gap-2">
                        <FolderOpen className="w-5 h-5" />
                        Select Project
                    </h2>
                    <div className="grid gap-4">
                        {projects?.map((project) => (
                            <Link
                                key={project.id}
                                to={`/project/${project.name}`}
                                className="block p-4 bg-white rounded-lg shadow-sm border border-slate-200 hover:border-blue-500 cursor-pointer transition-colors group relative"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-medium text-lg group-hover:text-blue-600">{project.name}</h3>
                                        <p className="text-slate-500 text-sm">{project.description}</p>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={(e) => handleExport(e, project.id, project.name)}
                                            className="text-slate-400 hover:text-blue-600 p-1 rounded-full hover:bg-blue-50 transition-colors"
                                            title="Export Project"
                                        >
                                            <Download className="w-4 h-4" />
                                        </button>

                                        {/* Import Button */}
                                        <button
                                            className="text-slate-400 hover:text-green-600 p-1 rounded-full hover:bg-green-50 transition-colors"
                                            title="Import Project (Overwrite)"
                                            onClick={(e) => handleImportClick(e, project.id)}
                                        >
                                            <Upload className="w-4 h-4" />
                                        </button>
                                        <input
                                            id={`import-file-${project.id}`}
                                            type="file"
                                            accept=".json"
                                            className="hidden"
                                            onChange={(e) => handleFileChange(e, project.id)}
                                            onClick={(e) => e.stopPropagation()}
                                        />

                                        <button
                                            onClick={(e) => handleDelete(e, project.id, project.name)}
                                            className="text-slate-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors"
                                            title="Delete Project"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        ))}
                        {projects?.length === 0 && (
                            <p className="text-slate-400 italic">No projects found.</p>
                        )}
                    </div>
                </div>

                {/* Create Project */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
                    <h2 className="text-xl font-semibold text-slate-700 mb-4 flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        New Project
                    </h2>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Project Name</label>
                            <input
                                {...register('name', { required: true })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g. TR3"
                                spellCheck={true}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                            <textarea
                                {...register('description')}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={3}
                                placeholder="Project goals..."
                                spellCheck={true}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={createProjectMutation.isPending}
                            className={clsx(
                                "w-full py-2 px-4 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors",
                                createProjectMutation.isPending && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            {createProjectMutation.isPending ? 'Creating...' : 'Create Project'}
                        </button>
                    </form>
                </div>
            </div>

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                isDestructive={confirmModal.isDestructive}
                confirmLabel={confirmModal.confirmLabel}
            />

            <InfoModal
                isOpen={infoModal.isOpen}
                onClose={() => setInfoModal(prev => ({ ...prev, isOpen: false }))}
                title={infoModal.title}
                message={infoModal.message}
            />
        </div >
    )
}
