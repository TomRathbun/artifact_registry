import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ProjectsService, type ProjectCreate } from '../client'
import { useForm } from 'react-hook-form'
import { Plus, FolderOpen, Trash2 } from 'lucide-react'
import clsx from 'clsx'
import { Link } from 'react-router-dom'

export default function ProjectDashboard() {
    const queryClient = useQueryClient()
    const { data: projects, isLoading } = useQuery({
        queryKey: ['projects'],
        queryFn: () => ProjectsService.listProjectsApiV1ProjectsProjectsGet(),

    })

    const { register, handleSubmit, reset } = useForm<ProjectCreate>()

    const createProjectMutation = useMutation({
        mutationFn: (data: ProjectCreate) => ProjectsService.createProjectApiV1ProjectsProjectsPost(data),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] })
            reset()
        },
        onError: (error) => {
            console.error("Failed to create project:", error)
            alert("Failed to create project. Please check the console for details.")
        }
    })

    const deleteProjectMutation = useMutation({
        mutationFn: (projectId: string) => ProjectsService.deleteProjectApiV1ProjectsProjectsProjectIdDelete(projectId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] })
        },
        onError: (error) => {
            console.error("Failed to delete project:", error)
            alert("Failed to delete project. Please check the console for details.")
        }
    })

    const onSubmit = (data: ProjectCreate) => {
        createProjectMutation.mutate(data)
    }

    const handleDelete = (e: React.MouseEvent, projectId: string, projectName: string) => {
        e.preventDefault(); // Prevent navigation
        if (confirm(`Are you sure you want to delete project "${projectName}"? This will delete ALL artifacts associated with it. This action cannot be undone.`)) {
            deleteProjectMutation.mutate(projectId);
        }
    }

    if (isLoading) return <div className="p-8">Loading projects...</div>

    return (
        <div className="max-w-4xl mx-auto p-8">
            <div className="flex items-center gap-4 mb-8">
                <img src="/assets/logo.png" alt="Registry Logo" className="w-16 h-16 object-contain" />
                <h1 className="text-3xl font-bold text-slate-800">Artifact Registry</h1>
            </div>

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
                                    <button
                                        onClick={(e) => handleDelete(e, project.id, project.name)}
                                        className="text-slate-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors"
                                        title="Delete Project"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
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
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                            <textarea
                                {...register('description')}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={3}
                                placeholder="Project goals..."
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
        </div>
    )
}
