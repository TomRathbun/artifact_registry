import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import {
    VisionService,
    NeedsService,
    UseCasesService,
    RequirementsService,
    MetadataService,
    SiteService,
    ComponentService,
    ProjectsService,
    ArtifactEventsService,
} from '../client';
import { X, Plus, Trash2, History } from 'lucide-react';
import DualListBox from './DualListBox';
import MDEditor from '@uiw/react-md-editor';
import { LinkageManager } from './LinkageManager';


type ArtifactType = 'vision' | 'need' | 'use_case' | 'requirement';

type FormData = {
    title: string;
    description: string;
    trigger: string;
    primary_actor_id: string;
    source_vision_id: string;
    source_need_id: string;
    source_use_case_id: string;
    area: string;
    status: string;
    // scope removed
    level: string;
    ears_type: string;
    ears_trigger: string;
    ears_state: string;
    ears_condition: string;
    ears_feature: string;
    owner_id: string;
    owner: string;
    stakeholder_id: string;
    rationale: string;
    short_name: string;
    text: string;
    mss: { step_num: number; actor: string; description: string }[];
    stakeholder_ids: string[];
    precondition_ids: string[];
    postcondition_ids: string[];
    exception_ids: string[];
    extensions: { step: string; condition: string; handling: string }[];
    site_ids: string[];
    component_ids: string[];
};

export default function ArtifactWizard() {
    const { projectId, artifactType: routeType, artifactId } = useParams<{ projectId: string; artifactType?: string; artifactId?: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();
    const isEditMode = !!artifactId;

    // Fetch project details to get the real UUID if projectId is a name
    const { data: project } = useQuery({
        queryKey: ['project', projectId],
        queryFn: () => ProjectsService.getProjectApiV1ProjectsProjectsProjectIdGet(projectId!)
    });

    const realProjectId = project?.id;

    // Derive artifact type from route params (edit mode) or search params (create mode)
    const artifactType = (routeType as ArtifactType) || (searchParams.get('type') as ArtifactType) || 'vision';

    const [showAreaModal, setShowAreaModal] = useState(false);
    const [showPersonModal, setShowPersonModal] = useState(false);
    const [showPreconditionModal, setShowPreconditionModal] = useState(false);
    const [showPostconditionModal, setShowPostconditionModal] = useState(false);
    const [showExceptionModal, setShowExceptionModal] = useState(false);
    const [showActorModal, setShowActorModal] = useState(false);
    const [personModalType, setPersonModalType] = useState<'owner' | 'stakeholder'>('owner');
    const [savedAid, setSavedAid] = useState<string | null>(null);

    // Status Transition State
    const [showTransitionModal, setShowTransitionModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [targetStatus, setTargetStatus] = useState<string>('');
    const [transitionRationale, setTransitionRationale] = useState('');
    const [transitionComment, setTransitionComment] = useState('');

    // Fetch Artifact History
    const { data: historyEvents } = useQuery({
        queryKey: ['artifact-history', artifactType, artifactId],
        queryFn: async () => {
            if (!artifactId) return [];
            return await ArtifactEventsService.getArtifactHistoryApiV1EventsArtifactTypeArtifactIdHistoryGet(
                artifactType,
                artifactId
            );
        },
        enabled: !!artifactId && showHistoryModal
    });

    // EARS State
    const [earsTemplates, setEarsTemplates] = useState<any>(null);
    const [showEarsHelper, setShowEarsHelper] = useState(false);

    // Fetch EARS templates
    const { data: earsTemplatesData } = useQuery({
        queryKey: ['ears-templates'],
        queryFn: async () => {
            return await RequirementsService.getEarsTemplatesApiV1RequirementsEarsTemplatesGet();
        },
        enabled: artifactType === 'requirement'
    });

    useEffect(() => {
        if (earsTemplatesData) {
            // Transform backend response { templates: {}, descriptions: {} } to { KEY: { template, description } }
            const templates = earsTemplatesData.templates || {};
            const descriptions = earsTemplatesData.descriptions || {};
            const transformed: any = {};

            Object.keys(templates).forEach(key => {
                transformed[key] = {
                    template: templates[key],
                    description: descriptions[key] || ''
                };
            });

            setEarsTemplates(transformed);
        }
    }, [earsTemplatesData]);

    // Form handling
    const {
        register,
        handleSubmit,
        watch,
        control,
        reset,
        setValue,
    } = useForm<FormData>({
        defaultValues: {
            title: '',
            description: '',
            text: '',
            ears_type: '',
            mss: [],
            extensions: [],
            stakeholder_ids: [],
            precondition_ids: [],
            postcondition_ids: [],
            exception_ids: [],
            source_use_case_id: '',
            site_ids: [],
            component_ids: [],
        }
    });

    const { fields: mssFields, append: appendMss, remove: removeMss } = useFieldArray({
        control,
        name: "mss"
    });

    const { fields: extFields, append: appendExt, remove: removeExt } = useFieldArray({
        control,
        name: "extensions"
    });

    // Queries for auxiliary data
    const { data: owners } = useQuery({
        queryKey: ['owners', realProjectId],
        queryFn: () => MetadataService.listPeopleApiV1MetadataMetadataPeopleGet(realProjectId, 'owner'),
        enabled: !!realProjectId
    });
    const { data: stakeholders } = useQuery({
        queryKey: ['stakeholders', realProjectId],
        queryFn: () => MetadataService.listPeopleApiV1MetadataMetadataPeopleGet(realProjectId, 'stakeholder'),
        enabled: !!realProjectId
    });

    const { data: areas } = useQuery({
        queryKey: ['areas'],
        queryFn: () => MetadataService.listAreasApiV1MetadataMetadataAreasGet()
    });
    const { data: actors } = useQuery({
        queryKey: ['actors', realProjectId],
        queryFn: async () => {
            const result = await MetadataService.listPeopleApiV1MetadataMetadataPeopleGet(realProjectId, 'actor');
            console.log('Fetched actors:', result);
            return result;
        },
        enabled: !!realProjectId
    });
    const { data: preconditions } = useQuery({
        queryKey: ['preconditions', realProjectId],
        queryFn: () => {
            if (!realProjectId) return [];
            return UseCasesService.listPreconditionsApiV1UseCaseUseCasesPreconditionsGet(realProjectId);
        },
        enabled: !!realProjectId
    });
    const { data: postconditions } = useQuery({
        queryKey: ['postconditions', realProjectId],
        queryFn: () => {
            if (!realProjectId) return [];
            return UseCasesService.listPostconditionsApiV1UseCaseUseCasesPostconditionsGet(realProjectId);
        },
        enabled: !!realProjectId
    });
    const { data: exceptions } = useQuery({
        queryKey: ['exceptions', realProjectId],
        queryFn: () => {
            if (!realProjectId) return [];
            return UseCasesService.listExceptionsApiV1UseCaseUseCasesExceptionsGet(realProjectId);
        },
        enabled: !!realProjectId
    });

    // const { data: visions } = useQuery({
    //     queryKey: ['visions', realProjectId],
    //     queryFn: () => VisionService.listVisionStatementsApiV1VisionVisionStatementsGet(realProjectId),
    //     enabled: !!realProjectId
    // });

    // const { data: needs } = useQuery({
    //     queryKey: ['needs', realProjectId],
    //     queryFn: () => NeedsService.listNeedsApiV1NeedNeedsGet(realProjectId),
    //     enabled: !!realProjectId
    // });
    // const { data: useCases } = useQuery({
    //     queryKey: ['use_cases', realProjectId],
    //     queryFn: () => UseCasesService.listUseCasesApiV1UseCaseUseCasesGet(undefined, undefined, undefined, true), // TODO: Filter by project?
    //     enabled: !!realProjectId
    // });
    const { data: allSites } = useQuery({
        queryKey: ['sites'],
        queryFn: () => SiteService.listSitesApiV1SitesGet()
    });
    const { data: allComponents } = useQuery({
        queryKey: ['components'],
        queryFn: () => ComponentService.listComponentsApiV1ComponentsGet()
    });

    // Fetch existing artifact data if in edit mode
    const { data: artifactData } = useQuery({
        queryKey: ['artifact', artifactType, artifactId],
        queryFn: async () => {
            if (!artifactId) return null;
            switch (artifactType) {
                case 'vision': return await VisionService.getVisionStatementApiV1VisionVisionStatementsAidGet(artifactId);
                case 'need': return await NeedsService.getNeedApiV1NeedNeedsAidGet(artifactId);
                case 'use_case': return await UseCasesService.getUseCaseApiV1UseCaseUseCasesAidGet(artifactId);
                case 'requirement': return await RequirementsService.getRequirementApiV1RequirementRequirementsAidGet(artifactId);
            }
        },
        enabled: !!artifactId
    });

    useEffect(() => {
        const dataToLoad = artifactData || location.state?.duplicateData;

        if (dataToLoad) {
            reset(dataToLoad as any);
            // Handle specific field mappings
            if (artifactType === 'use_case') {
                const ucData = dataToLoad as any;
                // Map objects to IDs
                if (ucData.primary_actor) {
                    setValue('primary_actor_id', ucData.primary_actor.id);
                }
                // Map stakeholders array to IDs
                if (ucData.stakeholders && Array.isArray(ucData.stakeholders)) {
                    setValue('stakeholder_ids', ucData.stakeholders.map((s: any) => s.id));
                }
                // Map preconditions array to IDs
                if (ucData.preconditions && Array.isArray(ucData.preconditions)) {
                    setValue('precondition_ids', ucData.preconditions.map((p: any) => p.id));
                }
                // Map postconditions array to IDs
                if (ucData.postconditions && Array.isArray(ucData.postconditions)) {
                    setValue('postcondition_ids', ucData.postconditions.map((p: any) => p.id));
                }
                // Map exceptions array to IDs
                if (ucData.exceptions && Array.isArray(ucData.exceptions)) {
                    setValue('exception_ids', ucData.exceptions.map((e: any) => e.id));
                }
                // Ensure arrays are initialized
                if (!ucData.mss) setValue('mss', []);
                if (!ucData.extensions) setValue('extensions', []);
            }
            if (artifactType === 'need') {
                const needData = dataToLoad as any;
                if (needData.sites && Array.isArray(needData.sites)) {
                    setValue('site_ids', needData.sites.map((s: any) => s.id));
                }
                if (needData.components && Array.isArray(needData.components)) {
                    setValue('component_ids', needData.components.map((c: any) => c.id));
                }
            }
            // Note: For requirements, source_use_case_id should come from the linkage
            // The backend GET endpoint should include it in the response
        }
    }, [artifactData, reset, artifactType, setValue, location.state]);

    // Mutations for creating/updating the main artifact
    const createMutation = useMutation({
        mutationFn: async (data: FormData) => {
            // Add project_id to payload
            const payload = { ...data, project_id: realProjectId };

            const sanitize = (obj: any) => {
                const cleaned: any = { ...obj };
                ['level', 'status', 'area', 'owner', 'stakeholder_id', 'source_vision_id', 'source_need_id', 'ears_type', 'primary_actor_id'].forEach(field => {
                    if (cleaned[field] === '' || cleaned[field] === null) {
                        delete cleaned[field];
                    }
                });
                return cleaned;
            };

            // Filter fields based on artifact type
            const filterFields = (obj: any, type: ArtifactType) => {
                const validFields: Record<ArtifactType, string[]> = {
                    vision: ['title', 'description', 'area', 'status', 'project_id'],
                    need: ['title', 'description', 'area', 'status', 'rationale', 'source_vision_id', 'owner_id', 'stakeholder_id', 'level', 'site_ids', 'component_ids', 'project_id'],
                    use_case: ['title', 'description', 'source_need_id', 'status', 'trigger', 'primary_actor_id', 'stakeholder_ids', 'precondition_ids', 'postcondition_ids', 'exception_ids', 'mss', 'extensions', 'project_id'],
                    requirement: ['short_name', 'text', 'area', 'level', 'ears_type', 'ears_trigger', 'ears_state', 'ears_condition', 'ears_feature', 'status', 'rationale', 'owner', 'source_use_case_id', 'project_id']
                };
                const allowed = validFields[type];
                const filtered: any = {};
                allowed.forEach(field => {
                    if (obj[field] !== undefined) {
                        filtered[field] = obj[field];
                    }
                });
                return filtered;
            };

            const cleanPayload = sanitize(payload);

            // Filter out incomplete MSS steps
            if (cleanPayload.mss && Array.isArray(cleanPayload.mss)) {
                cleanPayload.mss = cleanPayload.mss.filter((step: any) => step.actor && step.description);
            }

            const filteredPayload = filterFields(cleanPayload, artifactType);

            console.log('Sending payload:', filteredPayload);

            switch (artifactType) {
                case 'vision':
                    return await VisionService.createVisionStatementApiV1VisionVisionStatementsPost(filteredPayload as any);
                case 'need':
                    return await NeedsService.createNeedApiV1NeedNeedsPost(filteredPayload as any);
                case 'use_case':
                    return await UseCasesService.createUseCaseApiV1UseCaseUseCasesPost(filteredPayload as any);
                case 'requirement':
                    return await RequirementsService.createRequirementApiV1RequirementRequirementsPost(filteredPayload as any);
            }
        },
        onSuccess: (result: any) => {
            queryClient.invalidateQueries({ queryKey: ['artifacts', realProjectId] });
            queryClient.invalidateQueries({ queryKey: [artifactType, realProjectId] });
            setSavedAid(result.aid);
        },
    });


    const updateMutation = useMutation({
        mutationFn: async (data: FormData) => {
            const aid = artifactId ?? savedAid;
            if (!aid) throw new Error('Missing artifact ID');
            switch (artifactType) {
                case 'vision':
                    return await VisionService.updateVisionStatementApiV1VisionVisionStatementsAidPut(aid, data as any);
                case 'need':
                    return await NeedsService.updateNeedApiV1NeedNeedsAidPut(aid, data as any);
                case 'use_case':
                    return await UseCasesService.updateUseCaseApiV1UseCaseUseCasesAidPut(aid, data as any);
                case 'requirement':
                    return await RequirementsService.updateRequirementApiV1RequirementRequirementsAidPut(aid, data as any);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['artifacts', realProjectId] });
            queryClient.invalidateQueries({ queryKey: [artifactType, realProjectId] });
        },
    });

    // Modal related mutations
    const createAreaMutation = useMutation({
        mutationFn: (payload: any) => MetadataService.createAreaApiV1MetadataMetadataAreasPost(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['areas'] });
            setShowAreaModal(false);
        }
    });
    const createPersonMutation = useMutation({
        mutationFn: (payload: any) => {
            return MetadataService.createPersonApiV1MetadataMetadataPeoplePost({
                ...payload,
                project_id: realProjectId
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['owners'] });
            queryClient.invalidateQueries({ queryKey: ['stakeholders'] });
            setShowPersonModal(false);
        }
    });
    const createPreconditionMutation = useMutation({
        mutationFn: (text: string) => {
            if (!realProjectId) throw new Error("Project ID is required");
            return UseCasesService.createPreconditionApiV1UseCaseUseCasesPreconditionsPost({ text, project_id: realProjectId });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['preconditions'] });
            setShowPreconditionModal(false);
        }
    });
    const createPostconditionMutation = useMutation({
        mutationFn: (text: string) => {
            if (!realProjectId) throw new Error("Project ID is required");
            return UseCasesService.createPostconditionApiV1UseCaseUseCasesPostconditionsPost({ text, project_id: realProjectId });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['postconditions'] });
            setShowPostconditionModal(false);
        }
    });
    const createExceptionMutation = useMutation({
        mutationFn: (payload: any) => {
            if (!realProjectId) throw new Error("Project ID is required");
            return UseCasesService.createExceptionApiV1UseCaseUseCasesExceptionsPost({ ...payload, project_id: realProjectId });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['exceptions'] });
            setShowExceptionModal(false);
        }
    });
    const createActorMutation = useMutation({
        mutationFn: (payload: any) => {
            if (!realProjectId) throw new Error("Project ID is required");
            return MetadataService.createPersonApiV1MetadataMetadataPeoplePost({
                ...payload,
                roles: ['actor'],
                project_id: realProjectId
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['actors'] });
            setShowActorModal(false);
        }
    });

    const transitionMutation = useMutation({
        mutationFn: async () => {
            if (!artifactId || !targetStatus) return;
            return await ArtifactEventsService.transitionArtifactApiV1EventsArtifactTypeArtifactIdTransitionPost(
                artifactType,
                artifactId,
                {
                    from_status: watch('status') || 'Draft',
                    to_status: targetStatus,
                    rationale: transitionRationale,
                    comment: transitionComment
                }
            );
        },
        onSuccess: (result) => {
            if (result) {
                // Update local form state
                setValue('status', result.event_data.to);
                queryClient.invalidateQueries({ queryKey: ['artifact', artifactType, artifactId] });
                setShowTransitionModal(false);
                setTransitionRationale('');
                setTransitionComment('');
            }
        }
    });

    const handleTransitionClick = (status: string) => {
        setTargetStatus(status);
        setShowTransitionModal(true);
    };

    const getValidTransitions = (currentStatus: string) => {
        // Map matching backend VALID_TRANSITIONS
        const status = currentStatus || 'Draft';
        switch (status) {
            case 'Draft': return ['Ready_for_Review'];
            case 'Ready_for_Review': return ['In_Review', 'Draft'];
            case 'In_Review': return ['Approved', 'Rejected', 'Deferred', 'Draft'];
            case 'Approved': return ['Superseded', 'Retired', 'Draft'];
            case 'Deferred': return ['In_Review', 'Draft'];
            case 'Rejected': return ['Draft'];
            default: return [];
        }
    };

    const onSubmit = async (data: FormData) => {
        if (isEditMode || savedAid) {
            await updateMutation.mutateAsync(data);
        } else {
            await createMutation.mutateAsync(data);
        }
    };

    const onSubmitAndClose = async (data: FormData) => {
        if (isEditMode || savedAid) {
            await updateMutation.mutateAsync(data);
        } else {
            await createMutation.mutateAsync(data);
        }

        // Determine the correct list path based on artifact type
        let listPath = `${artifactType}s`;
        if (artifactType === 'use_case') {
            listPath = 'use-cases';
        }

        navigate(`/project/${projectId}/${listPath}`);
    };

    const handleCancel = () => {
        // Determine the correct list path based on artifact type
        let listPath = `${artifactType}s`;
        if (artifactType === 'use_case') {
            listPath = 'use-cases';
        }
        navigate(`/project/${projectId}/${listPath}`);
    };

    const renderCommonFields = () => {
        if (artifactType === 'use_case') return null; // Use Case has custom layout

        return (
            <>
                {artifactType === 'requirement' ? (
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Short Name (ID)
                        </label>
                        <input
                            {...register('short_name', { required: true })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. SYS-001"
                        />
                    </div>
                ) : (
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Title
                        </label>
                        <input
                            {...register('title', { required: true })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Artifact Title"
                        />
                    </div>
                )}

                {artifactType === 'requirement' ? (
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Requirement Text
                        </label>
                        <textarea
                            {...register('text', { required: true })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={4}
                            placeholder="The system shall..."
                        />
                    </div>
                ) : (
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Description
                        </label>
                        <Controller
                            control={control}
                            name="description"
                            render={({ field }) => (
                                <div data-color-mode="light">
                                    <MDEditor
                                        value={field.value || ''}
                                        onChange={field.onChange}
                                        preview="edit"
                                        height={300}
                                        className="border border-slate-300 rounded-md overflow-hidden"
                                    />
                                </div>
                            )}
                        />
                    </div>
                )}

                {/* Area Selection - Now available for all types including Vision */}
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-slate-700">Area</label>
                        <button type="button" onClick={() => setShowAreaModal(true)} className="text-xs text-blue-600 hover:text-blue-800 flex items-center">
                            <Plus className="w-3 h-3 mr-1" /> Add Area
                        </button>
                    </div>
                    <select {...register('area')} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Select Area...</option>
                        {areas?.map((area: any) => (
                            <option key={area.code} value={area.code}>{area.code} - {area.name}</option>
                        ))}
                    </select>
                    {isEditMode && (
                        <p className="text-xs text-slate-500 mt-1">Area cannot be changed after creation (used in artifact ID)</p>
                    )}
                </div>

            </>
        );
    };

    const renderSpecificFields = () => {
        switch (artifactType) {
            case 'vision':
                return null; // Only common fields (Area hidden for Vision)
            case 'need':
                return (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Rationale</label>
                            <textarea {...register('rationale')} className="w-full px-3 py-2 border border-slate-300 rounded-md" rows={2} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-medium text-slate-700">Owner</label>
                                    <button type="button" onClick={() => { setPersonModalType('owner'); setShowPersonModal(true); }} className="text-xs text-blue-600 hover:text-blue-800 flex items-center">
                                        <Plus className="w-3 h-3 mr-1" /> Add Owner
                                    </button>
                                </div>
                                <select {...register('owner_id')} className="w-full px-3 py-2 border border-slate-300 rounded-md">
                                    <option value="">Select Owner...</option>
                                    {owners?.map((p: any) => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-medium text-slate-700">Stakeholder</label>
                                    <button type="button" onClick={() => { setPersonModalType('stakeholder'); setShowPersonModal(true); }} className="text-xs text-blue-600 hover:text-blue-800 flex items-center">
                                        <Plus className="w-3 h-3 mr-1" /> Add Stakeholder
                                    </button>
                                </div>
                                <select {...register('stakeholder_id')} className="w-full px-3 py-2 border border-slate-300 rounded-md">
                                    <option value="">Select Stakeholder...</option>
                                    {stakeholders?.map((p: any) => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Level</label>
                            <select {...register('level')} className="w-full px-3 py-2 border border-slate-300 rounded-md">
                                <option value="">Select Level...</option>
                                <option value="Mission">Mission</option>
                                <option value="Enterprise">Enterprise</option>
                                <option value="Technical">Technical</option>
                            </select>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="block text-sm font-medium text-slate-700">Sites</label>
                                <a href={`/project/${projectId}/sites`} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:text-blue-800 flex items-center">
                                    <Plus className="w-3 h-3 mr-1" /> Manage Sites
                                </a>
                            </div>
                            <Controller
                                control={control}
                                name="site_ids"
                                render={({ field }) => (
                                    <DualListBox
                                        available={allSites || []}
                                        selected={(allSites || []).filter((s: any) => field.value?.includes(s.id))}
                                        onChange={(selected) => field.onChange(selected.map((s: any) => s.id))}
                                        getKey={(item: any) => item.id}
                                        getLabel={(item: any) => item.name}
                                        availableLabel="Available Sites"
                                        selectedLabel="Selected Sites"
                                        height="h-48"
                                    />
                                )}
                            />
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="block text-sm font-medium text-slate-700">Components</label>
                                <a href={`/project/${projectId}/components`} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:text-blue-800 flex items-center">
                                    <Plus className="w-3 h-3 mr-1" /> Manage Components
                                </a>
                            </div>
                            <Controller
                                control={control}
                                name="component_ids"
                                render={({ field }) => (
                                    <DualListBox
                                        available={allComponents || []}
                                        selected={(allComponents || []).filter((c: any) => field.value?.includes(c.id))}
                                        onChange={(selected) => field.onChange(selected.map((c: any) => c.id))}
                                        getKey={(item: any) => item.id}
                                        getLabel={(item: any) => item.name}
                                        availableLabel="Available Components"
                                        selectedLabel="Selected Components"
                                        height="h-48"
                                    />
                                )}
                            />
                        </div>
                    </>
                );
            case 'use_case':
                return (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                            <input
                                {...register('title', { required: true })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Use Case Title"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Area</label>
                            <select {...register('area')} disabled={isEditMode} className="w-full px-3 py-2 border border-slate-300 rounded-md disabled:bg-slate-100 disabled:cursor-not-allowed">
                                <option value="">Select Area...</option>
                                {areas?.map((a: any) => (
                                    <option key={a.code} value={a.code}>{a.code} - {a.name}</option>
                                ))}
                            </select>
                            {isEditMode && (
                                <p className="text-xs text-slate-500 mt-1">Area cannot be changed after creation (used in artifact ID)</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                            <textarea
                                {...register('description')}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={4}
                                placeholder="Description..."
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-slate-700">Primary Actor</label>
                                <button type="button" onClick={() => setShowActorModal(true)} className="text-xs text-blue-600 hover:text-blue-800 flex items-center">
                                    <Plus className="w-3 h-3 mr-1" /> Add Actor
                                </button>
                            </div>
                            <select {...register('primary_actor_id')} className="w-full px-3 py-2 border border-slate-300 rounded-md">
                                <option value="">Select Actor...</option>
                                {actors?.map((a: any) => (
                                    <option key={a.id} value={a.id}>{a.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <Controller
                                control={control}
                                name="stakeholder_ids"
                                render={({ field }) => (
                                    <DualListBox
                                        available={stakeholders || []}
                                        selected={(stakeholders || []).filter((s: any) => field.value?.includes(s.id.toString()))}
                                        onChange={(selected) => field.onChange(selected.map((s: any) => s.id.toString()))}
                                        getKey={(item: any) => item.id}
                                        getLabel={(item: any) => item.name}
                                        availableLabel="Available Stakeholders"
                                        selectedLabel="Selected Stakeholders"
                                        height="h-48"
                                    />
                                )}
                            />
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="block text-sm font-medium text-slate-700">Preconditions</label>
                                <button type="button" onClick={() => setShowPreconditionModal(true)} className="text-xs text-blue-600 hover:text-blue-800 flex items-center">
                                    <Plus className="w-3 h-3 mr-1" /> Add Precondition
                                </button>
                            </div>
                            <Controller
                                control={control}
                                name="precondition_ids"
                                render={({ field }) => (
                                    <DualListBox
                                        available={preconditions || []}
                                        selected={(preconditions || []).filter((p: any) => field.value?.includes(p.id))}
                                        onChange={(selected) => field.onChange(selected.map((p: any) => p.id))}
                                        getKey={(item: any) => item.id}
                                        getLabel={(item: any) => item.text}
                                        availableLabel="Available Preconditions"
                                        selectedLabel="Selected Preconditions"
                                        height="h-48"
                                    />
                                )}
                            />
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="block text-sm font-medium text-slate-700">Exceptions</label>
                                <button type="button" onClick={() => setShowExceptionModal(true)} className="text-xs text-blue-600 hover:text-blue-800 flex items-center">
                                    <Plus className="w-3 h-3 mr-1" /> Add Exception
                                </button>
                            </div>
                            <Controller
                                control={control}
                                name="exception_ids"
                                render={({ field }) => (
                                    <DualListBox
                                        available={exceptions || []}
                                        selected={(exceptions || []).filter((e: any) => field.value?.includes(e.id))}
                                        onChange={(selected) => field.onChange(selected.map((e: any) => e.id))}
                                        getKey={(item: any) => item.id}
                                        getLabel={(item: any) => `${item.trigger} -> ${item.handling}`}
                                        availableLabel="Available Exceptions"
                                        selectedLabel="Selected Exceptions"
                                        height="h-48"
                                    />
                                )}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Trigger</label>
                            <input {...register('trigger')} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
                        </div>
                        <div className="mt-6">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-medium">Main Success Scenario</h3>
                                <button type="button" onClick={() => appendMss({ step_num: mssFields.length + 1, actor: '', description: '' })} className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                                    <Plus className="w-4 h-4 mr-1" /> Add Step
                                </button>
                            </div>
                            <div className="space-y-2">
                                {mssFields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2 items-start">
                                        <span className="pt-2 text-sm font-medium text-slate-500 w-8">{index + 1}.</span>
                                        <div className="w-1/4">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-xs font-medium text-slate-500">Actor</span>
                                                <button type="button" onClick={() => setShowActorModal(true)} className="text-xs text-blue-600 hover:text-blue-800 flex items-center">
                                                    <Plus className="w-3 h-3 mr-1" /> New
                                                </button>
                                            </div>
                                            <select {...register(`mss.${index}.actor`)} className="w-full px-3 py-2 border border-slate-300 rounded-md">
                                                <option value="">Select Actor...</option>
                                                {actors?.map((a: any) => (
                                                    <option key={a.id} value={a.name}>{a.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex-1">
                                            <div className="mb-1 text-xs font-medium text-slate-500">Action</div>
                                            <input {...register(`mss.${index}.description`)} placeholder="Action description" className="w-full px-3 py-2 border border-slate-300 rounded-md" />
                                        </div>
                                        <button type="button" onClick={() => removeMss(index)} className="mt-6 p-2 text-red-500 hover:bg-red-50 rounded-md">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="mt-6">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-medium">Extensions</h3>
                                <button type="button" onClick={() => appendExt({ step: '', condition: '', handling: '' })} className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                                    <Plus className="w-4 h-4 mr-1" /> Add Extension
                                </button>
                            </div>
                            <div className="space-y-2">
                                {extFields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2 items-start">
                                        <input {...register(`extensions.${index}.step`)} placeholder="Step Ref" className="w-20 px-3 py-2 border border-slate-300 rounded-md" />
                                        <input {...register(`extensions.${index}.condition`)} placeholder="Condition" className="w-1/3 px-3 py-2 border border-slate-300 rounded-md" />
                                        <input {...register(`extensions.${index}.handling`)} placeholder="Handling" className="flex-1 px-3 py-2 border border-slate-300 rounded-md" />
                                        <button type="button" onClick={() => removeExt(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-md">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-4 mt-4">
                            <div className="flex justify-between items-center">
                                <label className="block text-sm font-medium text-slate-700">Postconditions</label>
                                <button type="button" onClick={() => setShowPostconditionModal(true)} className="text-xs text-blue-600 hover:text-blue-800 flex items-center">
                                    <Plus className="w-3 h-3 mr-1" /> Add Postcondition
                                </button>
                            </div>
                            <Controller
                                control={control}
                                name="postcondition_ids"
                                render={({ field }) => (
                                    <DualListBox
                                        available={postconditions || []}
                                        selected={(postconditions || []).filter((p: any) => field.value?.includes(p.id))}
                                        onChange={(selected) => field.onChange(selected.map((p: any) => p.id))}
                                        getKey={(item: any) => item.id}
                                        getLabel={(item: any) => item.text}
                                        availableLabel="Available Postconditions"
                                        selectedLabel="Selected Postconditions"
                                        height="h-48"
                                    />
                                )}
                            />
                        </div>
                    </>
                );
            case 'requirement':
                return (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Area</label>
                            <select {...register('area')} disabled={isEditMode} className="w-full px-3 py-2 border border-slate-300 rounded-md disabled:bg-slate-100 disabled:cursor-not-allowed">
                                <option value="">Select Area...</option>
                                {areas?.map((a: any) => (
                                    <option key={a.code} value={a.code}>{a.code} - {a.name}</option>
                                ))}
                            </select>
                            {isEditMode && (
                                <p className="text-xs text-slate-500 mt-1">Area cannot be changed after creation (used in artifact ID)</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                            <select {...register('status')} className="w-full px-3 py-2 border border-slate-300 rounded-md">
                                <option value="proposed">Proposed</option>
                                <option value="verified">Verified</option>
                                <option value="rejected">Rejected</option>
                                <option value="base_lined">Base Lined</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Level</label>
                            <select {...register('level')} className="w-full px-3 py-2 border border-slate-300 rounded-md">
                                <option value="">Select Level...</option>
                                <option value="stk">Stakeholder (STK)</option>
                                <option value="sys">System (SYS)</option>
                                <option value="sub">Subsystem (SUB)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Short Name (ID)</label>
                            <input
                                {...register('short_name', { required: true })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g. SYS-001"
                            />
                        </div>
                        <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-slate-700">EARS Pattern Type</label>
                                <button
                                    type="button"
                                    onClick={() => setShowEarsHelper(!showEarsHelper)}
                                    className="text-xs text-blue-600 hover:text-blue-800"
                                >
                                    {showEarsHelper ? 'Hide Helper' : 'Show Helper'}
                                </button>
                            </div>
                            <select
                                {...register('ears_type')}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md mb-2"
                                onChange={(e) => {
                                    const selectedType = e.target.value;
                                    setValue('ears_type', selectedType);
                                    if (earsTemplates && earsTemplates[selectedType]) {
                                        setValue('text', earsTemplates[selectedType].template);
                                    }
                                }}
                            >
                                <option value="">Select EARS Pattern...</option>
                                {earsTemplates && Object.keys(earsTemplates).map((key) => (
                                    <option key={key} value={key}>
                                        {key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')}
                                    </option>
                                ))}
                            </select>
                            {showEarsHelper && earsTemplates && watch('ears_type') && earsTemplates[watch('ears_type')] && (
                                <div className="text-sm text-slate-600 mb-3 bg-white p-2 rounded border border-slate-100">
                                    <p className="font-medium mb-1">Syntax:</p>
                                    <code className="block bg-slate-100 p-1 rounded mb-2 text-xs">
                                        {earsTemplates[watch('ears_type')].template}
                                    </code>
                                    <p className="font-medium mb-1">Description:</p>
                                    <p className="text-xs">{earsTemplates[watch('ears_type')].description}</p>
                                </div>
                            )}
                            {watch('ears_type') && watch('ears_type') !== 'UBIQUITOUS' && (
                                <div className="grid grid-cols-1 gap-2 mt-2">
                                    {(['EVENT_DRIVEN', 'OPTIONAL_FEATURE'].includes(watch('ears_type'))) && (
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500">Trigger</label>
                                            <input
                                                {...register('ears_trigger')}
                                                onChange={(e) => {
                                                    setValue('ears_trigger', e.target.value);
                                                    const template = earsTemplates[watch('ears_type')].template;
                                                    let newText = template
                                                        .replace('<system>', 'the system')
                                                        .replace('<action>', 'shall...');

                                                    if (e.target.value) newText = newText.replace('<trigger>', e.target.value);
                                                    if (watch('ears_state')) newText = newText.replace('<state>', watch('ears_state'));
                                                    if (watch('ears_feature')) newText = newText.replace('<feature>', watch('ears_feature'));
                                                    if (watch('ears_condition')) newText = newText.replace('<condition>', watch('ears_condition'));

                                                    setValue('text', newText);
                                                }}
                                                placeholder="When..."
                                                className="w-full px-2 py-1 text-sm border border-slate-300 rounded"
                                            />
                                        </div>
                                    )}
                                    {(['STATE_DRIVEN', 'OPTIONAL_FEATURE'].includes(watch('ears_type'))) && (
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500">State</label>
                                            <input
                                                {...register('ears_state')}
                                                onChange={(e) => {
                                                    setValue('ears_state', e.target.value);
                                                    const template = earsTemplates[watch('ears_type')].template;
                                                    let newText = template
                                                        .replace('<system>', 'the system')
                                                        .replace('<action>', 'shall...');
                                                    if (watch('ears_feature')) newText = newText.replace('<feature>', watch('ears_feature'));
                                                    if (e.target.value) newText = newText.replace('<state>', e.target.value);
                                                    if (watch('ears_condition')) newText = newText.replace('<condition>', watch('ears_condition'));
                                                    setValue('text', newText);
                                                }}
                                                placeholder="While..."
                                                className="w-full px-2 py-1 text-sm border border-slate-300 rounded"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                );

            default:
                return null;
        }
    };

    const onError = (errors: any) => {
        console.error('Form validation errors:', errors);
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-900">
                    {isEditMode ? `Edit ${artifactType === 'use_case' ? 'Use Case' : artifactType.charAt(0).toUpperCase() + artifactType.slice(1)}` : `New ${artifactType === 'use_case' ? 'Use Case' : artifactType.charAt(0).toUpperCase() + artifactType.slice(1)}`}
                </h1>
                <button
                    onClick={handleCancel}
                    className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Status Action Bar - Only in Edit Mode */}
            {isEditMode && (
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm mb-6 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-slate-500">Current Status:</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${watch('status') === 'Approved' ? 'bg-green-100 text-green-800' :
                            watch('status') === 'Rejected' ? 'bg-red-100 text-red-800' :
                                watch('status') === 'In_Review' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-slate-100 text-slate-800'
                            }`}>
                            {watch('status') || 'Draft'}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        {getValidTransitions(watch('status')).map((status) => (
                            <button
                                key={status}
                                type="button"
                                onClick={() => handleTransitionClick(status)}
                                className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                            >
                                {status.replace(/_/g, ' ')}
                            </button>
                        ))}
                        <button
                            type="button"
                            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100"
                            title="View History"
                            onClick={() => setShowHistoryModal(true)}
                        >
                            <History className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
            <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                {artifactType !== 'requirement' && renderCommonFields()}
                {renderSpecificFields()}

                <div className="flex gap-3 pt-6 border-t mt-8">
                    <button
                        type="submit"
                        className="flex-1 bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
                        disabled={isEditMode ? updateMutation.isPending : createMutation.isPending}
                    >
                        {isEditMode || savedAid ? (updateMutation.isPending ? 'Saving...' : 'Save') : (createMutation.isPending ? 'Creating...' : 'Create Artifact')}
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit(onSubmitAndClose, onError)}
                        className="flex-1 bg-purple-600 text-white py-3 rounded-md hover:bg-purple-700 transition-colors font-medium"
                        disabled={isEditMode ? updateMutation.isPending : createMutation.isPending}
                    >
                        Save & Close
                    </button>
                </div>
            </form>

            {/* Linkage Manager - Only visible when artifact exists */}
            {(isEditMode || savedAid) && realProjectId && (
                <div className="mt-8 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">Artifact Linkages</h2>
                    <LinkageManager
                        sourceArtifactType={artifactType}
                        sourceId={artifactId || savedAid || ''}
                        projectId={realProjectId}
                    />
                </div>
            )}

            {/* Modals */}
            {
                showAreaModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">Add New Area</h2>
                                <button onClick={() => setShowAreaModal(false)} className="text-slate-400 hover:text-slate-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.currentTarget);
                                    createAreaMutation.mutate({
                                        code: formData.get('code') as string,
                                        name: formData.get('name') as string,
                                        description: formData.get('description') as string,
                                    });
                                }}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Code (e.g., AI, ZTN)</label>
                                    <input name="code" required className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                                    <input name="name" required className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                    <textarea name="description" className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} />
                                </div>
                                <button
                                    type="submit"
                                    disabled={createAreaMutation.isPending}
                                    className="w-full py-2 px-4 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
                                >
                                    {createAreaMutation.isPending ? 'Adding...' : 'Add Area'}
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Person Modal */}
            {
                showPersonModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">Add New Person</h2>
                                <button onClick={() => setShowPersonModal(false)} className="text-slate-400 hover:text-slate-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.currentTarget);
                                    const roles: string[] = [];
                                    if (formData.get('role_owner')) roles.push('owner');
                                    if (formData.get('role_stakeholder')) roles.push('stakeholder');
                                    if (formData.get('role_actor')) roles.push('actor');

                                    // Fallback if no role selected (shouldn't happen with default checks, but good for safety)
                                    if (roles.length === 0) roles.push(personModalType);

                                    createPersonMutation.mutate({
                                        name: formData.get('name'),
                                        description: formData.get('description'),
                                        roles: roles,
                                    });
                                }}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                                    <input name="name" required className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Roles</label>
                                    <div className="flex gap-4 mt-1">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                name="role_owner"
                                                defaultChecked={personModalType === 'owner'}
                                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-slate-700">Owner</span>
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                name="role_stakeholder"
                                                defaultChecked={personModalType === 'stakeholder'}
                                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-slate-700">Stakeholder</span>
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                name="role_actor"
                                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-slate-700">Actor</span>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                    <textarea name="description" className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} />
                                </div>

                                <button
                                    type="submit"
                                    disabled={createPersonMutation.isPending}
                                    className="w-full py-2 px-4 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
                                >
                                    {createPersonMutation.isPending ? 'Adding...' : 'Add Person'}
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Precondition Modal */}
            {
                showPreconditionModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">Add New Precondition</h2>
                                <button onClick={() => setShowPreconditionModal(false)} className="text-slate-400 hover:text-slate-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.currentTarget);
                                    createPreconditionMutation.mutate(formData.get('text') as string);
                                }}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Precondition Text</label>
                                    <textarea
                                        name="text"
                                        required
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                                        placeholder="e.g., User is logged in"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={createPreconditionMutation.isPending}
                                    className="w-full py-2 px-4 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
                                >
                                    {createPreconditionMutation.isPending ? 'Adding...' : 'Add Precondition'}
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Postcondition Modal */}
            {
                showPostconditionModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full">
                            <h3 className="text-lg font-semibold mb-4">Create New Postcondition</h3>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.currentTarget);
                                    createPostconditionMutation.mutate(formData.get('text') as string);
                                }}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Postcondition Text</label>
                                    <textarea
                                        name="text"
                                        required
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                                        placeholder="e.g., System records the transaction"
                                    />
                                </div>
                                <div className="flex justify-end gap-2 mt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowPostconditionModal(false)}
                                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        Create
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Exception Modal */}
            {
                showExceptionModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full">
                            <h3 className="text-lg font-semibold mb-4">Create New Exception</h3>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.currentTarget);
                                    createExceptionMutation.mutate({
                                        trigger: formData.get('trigger') as string,
                                        handling: formData.get('handling') as string,
                                    });
                                }}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Trigger *</label>
                                    <input
                                        name="trigger"
                                        required
                                        placeholder="e.g., Sensor/data link failure"
                                        className="w-full px-3 py-2 border rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Handling *</label>
                                    <textarea
                                        name="handling"
                                        required
                                        placeholder="e.g., Fall back to last known good data; alert Operator"
                                        className="w-full px-3 py-2 border rounded-md"
                                        rows={3}
                                    />
                                </div>
                                <div className="flex justify-end gap-2 mt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowExceptionModal(false)}
                                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        Create
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Actor Modal */}
            {
                showActorModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full">
                            <h3 className="text-lg font-semibold mb-4">Create New Actor</h3>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.currentTarget);
                                    createActorMutation.mutate({
                                        name: formData.get('name') as string,
                                        description: formData.get('description') as string || undefined,
                                    });
                                }}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                                    <input
                                        name="name"
                                        required
                                        className="w-full px-3 py-2 border rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                    <textarea
                                        name="description"
                                        placeholder="Optional description"
                                        className="w-full px-3 py-2 border rounded-md"
                                        rows={3}
                                    />
                                </div>
                                <div className="flex justify-end gap-2 mt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowActorModal(false)}
                                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        Create
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Status Transition Modal */}
            {
                showTransitionModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full">
                            <h3 className="text-lg font-semibold mb-4">Transition to {targetStatus}</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Rationale *</label>
                                    <textarea
                                        value={transitionRationale}
                                        onChange={(e) => setTransitionRationale(e.target.value)}
                                        required
                                        placeholder="Why are you making this change?"
                                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                                        rows={3}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Comment (Optional)</label>
                                    <textarea
                                        value={transitionComment}
                                        onChange={(e) => setTransitionComment(e.target.value)}
                                        placeholder="Additional context..."
                                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                                        rows={2}
                                    />
                                </div>
                                <div className="flex justify-end gap-2 mt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowTransitionModal(false);
                                            setTransitionRationale('');
                                            setTransitionComment('');
                                        }}
                                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => transitionMutation.mutate()}
                                        disabled={!transitionRationale || transitionMutation.isPending}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {transitionMutation.isPending ? 'Updating...' : 'Confirm Transition'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* History Modal */}
            {
                showHistoryModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">Artifact History</h3>
                                <button onClick={() => setShowHistoryModal(false)} className="text-slate-400 hover:text-slate-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto pr-2">
                                {historyEvents && historyEvents.length > 0 ? (
                                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                                        {historyEvents.map((event: any) => (
                                            <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-blue-500 text-slate-500 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                                    <History className="w-5 h-5" />
                                                </div>
                                                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-slate-200 shadow">
                                                    <div className="flex items-center justify-between space-x-2 mb-1">
                                                        <div className="font-bold text-slate-900">{event.event_type}</div>
                                                        <time className="font-caveat font-medium text-indigo-500 text-xs">
                                                            {new Date(event.timestamp).toLocaleString()}
                                                        </time>
                                                    </div>
                                                    <div className="text-slate-500 text-sm">
                                                        {event.event_data.from && event.event_data.to ? (
                                                            <div className="font-medium text-slate-800 mb-1">
                                                                {event.event_data.from} ➝ {event.event_data.to}
                                                            </div>
                                                        ) : null}
                                                        {event.event_data.rationale && (
                                                            <div className="italic mb-1">"{event.event_data.rationale}"</div>
                                                        )}
                                                        {event.comment && (
                                                            <div className="text-slate-400 text-xs">{event.comment}</div>
                                                        )}
                                                        <div className="text-xs text-slate-400 mt-2">
                                                            By: {event.user_name || 'System'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center text-slate-500 py-8">
                                        No history available.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}


