import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { VisionService, NeedsService, MetadataService, ProjectsService } from '../client'

import { ArrowLeft, Plus, X } from 'lucide-react'

export default function ProjectDetails() {
    const { projectId } = useParams<{ projectId: string }>()
    const queryClient = useQueryClient()
    const [editingNeed, setEditingNeed] = useState<any>(null)
    const { register, handleSubmit, reset, setValue } = useForm()

    // Fetch project details to get the real UUID if projectId is a name
    const { data: project } = useQuery({
        queryKey: ['project', projectId],
        queryFn: () => ProjectsService.getProjectApiV1ProjectsProjectsProjectIdGet(projectId!)
    })

    const realProjectId = project?.id

    const { data: visions } = useQuery({
        queryKey: ['visions', realProjectId],
        queryFn: () => VisionService.listVisionStatementsApiV1VisionVisionStatementsGet(realProjectId),
        enabled: !!realProjectId
    })
    const { data: needs } = useQuery({
        queryKey: ['needs', realProjectId],
        queryFn: () => NeedsService.listNeedsApiV1NeedNeedsGet(realProjectId),
        enabled: !!realProjectId
    })

    // Metadata for edit form
    const { data: areas } = useQuery({
        queryKey: ['areas'],
        queryFn: () => MetadataService.listAreasApiV1MetadataMetadataAreasGet()
    })
    const { data: owners } = useQuery({
        queryKey: ['owners', realProjectId],
        queryFn: () => MetadataService.listPeopleApiV1MetadataMetadataPeopleGet('owner'),
        enabled: !!realProjectId
    })
    const { data: stakeholders } = useQuery({
        queryKey: ['stakeholders', realProjectId],
        queryFn: () => MetadataService.listPeopleApiV1MetadataMetadataPeopleGet('stakeholder'),
        enabled: !!realProjectId
    })

    const projectVisions = visions || []
    const projectNeeds = needs || []

    const updateNeedMutation = useMutation({
        mutationFn: (data: any) => NeedsService.updateNeedApiV1NeedNeedsAidPut(editingNeed.aid, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['needs', realProjectId] })
            setEditingNeed(null)
            reset()
        },
        onError: (error) => {
            console.error("Failed to update need:", error)
            alert("Failed to update need")
        }
    })

    const handleEditClick = (need: any) => {
        setEditingNeed(need)
        // Pre-fill form
        setValue('title', need.title)
        setValue('description', need.description)
        setValue('rationale', need.rationale)
        setValue('area', need.area)
        setValue('status', need.status)
        setValue('owner_id', need.owner_id)
        setValue('stakeholder_id', need.stakeholder_id)
        setValue('source_vision_id', need.source_vision_id)
        setValue('project_id', need.project_id) // Ensure project_id is kept
    }

    const onEditSubmit = (data: any) => {
        updateNeedMutation.mutate(data)
    }

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'approved': return 'bg-green-100 text-green-800'
            case 'in_progress': return 'bg-blue-100 text-blue-800'
            case 'completed': return 'bg-purple-100 text-purple-800'
            case 'rejected': return 'bg-red-100 text-red-800'
            default: return 'bg-slate-100 text-slate-800' // Proposed
        }
    }

    return (
        <div className="max-w-6xl mx-auto p-8">
            <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to="/" className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-slate-600" />
                    </Link>
                    <h1 className="text-3xl font-bold text-slate-800">Project Artifacts</h1>
                </div>
                <Link
                    to={`/project/${projectId}/create`}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Create Artifact
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Visions */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h2 className="text-xl font-semibold text-slate-700 mb-4">Vision Statements</h2>
                    <div className="space-y-3">
                        {projectVisions.map((vision: any) => (
                            <div key={vision.aid} className="p-3 border border-slate-100 rounded-lg hover:bg-slate-50">
                                <div className="font-medium text-slate-900">
                                    <span className="text-slate-500 mr-2 text-xs font-mono">{vision.aid}</span>
                                    {vision.title}
                                </div>
                                <div className="text-sm text-slate-500 truncate">{vision.description}</div>
                            </div>
                        ))}
                        {projectVisions.length === 0 && <p className="text-slate-400 italic">No vision statements yet.</p>}
                    </div>
                </div>

                {/* Needs */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h2 className="text-xl font-semibold text-slate-700 mb-4">Needs</h2>
                    <div className="space-y-3">
                        {projectNeeds.map((need: any) => (
                            <div
                                key={need.aid}
                                onClick={() => handleEditClick(need)}
                                className="p-3 border border-slate-100 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors group"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="font-medium text-slate-900">
                                        <span className="text-slate-500 mr-2 text-xs font-mono">{need.aid}</span>
                                        {need.title}
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(need.status)}`}>
                                        {need.status || 'Proposed'}
                                    </span>
                                </div>
                                <div className="text-sm text-slate-500 truncate mt-1">{need.description}</div>
                            </div>
                        ))}
                        {projectNeeds.length === 0 && <p className="text-slate-400 italic">No needs yet.</p>}
                    </div>
                </div>
            </div>

            {/* Edit Need Modal */}
            {editingNeed && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Edit Need</h2>
                                <p className="text-sm text-slate-500 font-mono">{editingNeed.aid}</p>
                            </div>
                            <button onClick={() => setEditingNeed(null)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Source Vision</label>
                                <select
                                    {...register('source_vision_id')}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select Source Vision...</option>
                                    {projectVisions.map((v: any) => (
                                        <option key={v.aid} value={v.aid}>{v.aid} - {v.title}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                                    <select
                                        {...register('status')}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="proposed">Proposed</option>
                                        <option value="approved">Approved</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Area</label>
                                    <select
                                        {...register('area')}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select Area...</option>
                                        {areas?.map((a: any) => (
                                            <option key={a.code} value={a.code}>{a.code} - {a.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                                <input
                                    {...register('title', { required: true })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea
                                    {...register('description', { required: true })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={4}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Rationale</label>
                                <textarea
                                    {...register('rationale')}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={3}
                                />
                            </div>

                            {/* Hidden fields for required backend fields */}
                            <input type="hidden" {...register('project_id')} />

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Owner</label>
                                    <select
                                        {...register('owner_id')}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select Owner...</option>
                                        {owners?.map((p: any) => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Stakeholder</label>
                                    <select
                                        {...register('stakeholder_id')}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select Stakeholder...</option>
                                        {stakeholders?.map((p: any) => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-2">
                                <Link to={`/project/${projectId}/sites`} target="_blank" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                                    <Plus className="w-3 h-3" /> Manage Sites
                                </Link>
                                <Link to={`/project/${projectId}/components`} target="_blank" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                                    <Plus className="w-3 h-3" /> Manage Components
                                </Link>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setEditingNeed(null)}
                                    className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={updateNeedMutation.isPending}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    {updateNeedMutation.isPending ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
