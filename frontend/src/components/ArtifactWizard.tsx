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
import { X, Plus, Trash2, History, ArrowLeft, MessageSquare } from 'lucide-react';
import DualListBox from './DualListBox';
import MDEditor from '@uiw/react-md-editor';
import remarkGfm from 'remark-gfm';
import { LinkageManager } from './LinkageManager';
import CommentPanel from './CommentPanel';
import MermaidBlock from './MermaidBlock';
import PlantUMLBlock from './PlantUMLBlock';

const extractText = (c: any): string => {
    if (typeof c === 'string') return c;
    if (Array.isArray(c)) return c.map(extractText).join('');
    if (c?.props?.children) return extractText(c.props.children);
    return String(c || '');
};


type ArtifactType = 'vision' | 'need' | 'use_case' | 'requirement' | 'document';

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
    mss: { step_num: number; actor: string; description: string; message?: string; target_actor?: string; response?: string }[];
    stakeholder_ids: string[];
    precondition_ids: string[];
    postcondition_ids: string[];
    exceptions: { trigger: string; handling: string; steps: any[] }[];
    extensions: { step: string; condition: string; handling: string; actor?: string; message?: string; target_actor?: string; response?: string }[];
    site_ids: string[];
    component_ids: string[];
    // Document specific
    document_type: 'url' | 'file' | 'text';
    content_url: string;
    content_text: string;
    mime_type: string;
};


// Nested component for Exception Steps
const ExceptionStepsEditor = ({ nestIndex, control, register, actors }: { nestIndex: number, control: any, register: any, actors: any[] }) => {
    const { fields, append, remove } = useFieldArray({
        control,
        name: `exceptions.${nestIndex}.steps`
    });

    return (
        <div className="mt-3 bg-slate-50/50 p-2 rounded border border-slate-100">
            <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Exception Flow Steps</label>
            <div className="space-y-3">
                {fields.map((item, k) => (
                    <div key={item.id} className="p-3 bg-white rounded-md border border-slate-200 shadow-sm relative group">
                        <button type="button" onClick={() => remove(k)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Step {k + 1}</div>

                        <div className="grid grid-cols-2 gap-2 mb-2">
                            <div>
                                <label className="block text-[10px] font-medium text-slate-500 mb-0.5">Actor</label>
                                <select {...register(`exceptions.${nestIndex}.steps.${k}.actor`)} className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 bg-slate-50">
                                    <option value="">Select...</option>
                                    {actors?.map((a: any) => <option key={a.id} value={a.name}>{a.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-medium text-slate-500 mb-0.5">Target (Optional)</label>
                                <select {...register(`exceptions.${nestIndex}.steps.${k}.target_actor`)} className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 bg-slate-50">
                                    <option value="">Select...</option>
                                    {actors?.map((a: any) => <option key={a.id} value={a.name}>{a.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                            <div>
                                <label className="block text-[10px] font-medium text-slate-500 mb-0.5">Message (Method)</label>
                                <input {...register(`exceptions.${nestIndex}.steps.${k}.message`)} className="w-full px-2 py-1 text-xs border border-slate-300 rounded" placeholder="doSomething()" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-medium text-slate-500 mb-0.5">Response (Return)</label>
                                <input {...register(`exceptions.${nestIndex}.steps.${k}.response`)} className="w-full px-2 py-1 text-xs border border-slate-300 rounded" placeholder="result" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-medium text-slate-500 mb-0.5">Description (Action)</label>
                            <textarea {...register(`exceptions.${nestIndex}.steps.${k}.description`)} rows={2} className="w-full px-2 py-1 text-xs border border-slate-300 rounded resize-none" placeholder="Description of action..." spellCheck={true} />
                        </div>
                    </div>
                ))}
            </div>
            <button
                type="button"
                onClick={() => append({ step_num: fields.length + 1, actor: '', description: '', message: '', target_actor: '', response: '' })}
                className="mt-3 text-xs text-blue-600 hover:text-blue-800 flex items-center font-medium px-2 py-1 hover:bg-blue-50 rounded"
            >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Step
            </button>
        </div>
    );
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

    // Check user permissions
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const userRoles = user?.roles || [];

    // Map artifact type to role prefix
    const getRolePrefix = (type: string): string => {
        const mapping: Record<string, string> = {
            'vision': 'vision',
            'need': 'need',
            'use_case': 'uc',
            'requirement': 'req',
            'document': 'doc',
            'actor': 'actor',
            'stakeholder': 'stakeholder',
            'area': 'area'
        };
        return mapping[type] || type;
    };

    const rolePrefix = getRolePrefix(artifactType);

    // Determine required permission based on mode and artifact type
    const requiredPermission = isEditMode
        ? `${rolePrefix}_edit`
        : `${rolePrefix}_create`;

    const hasPermission = userRoles.includes('admin') ||
        userRoles.includes(requiredPermission);

    // Show access denied if no permission
    if (!hasPermission) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 p-8">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <X className="w-8 h-8 text-red-600" />
                </div>
                <h1 className="text-2xl font-bold text-slate-800">Access Denied</h1>
                <p className="text-slate-500 max-w-md">
                    You don't have permission to {isEditMode ? 'edit' : 'create'} {artifactType.replace('_', ' ')} artifacts.
                    Please contact your administrator if you need access.
                </p>
                <button
                    onClick={() => navigate(`/projects/${projectId}`)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold"
                >
                    Return to Project
                </button>
            </div>
        );
    }

    const [showAreaModal, setShowAreaModal] = useState(false);
    const [showPersonModal, setShowPersonModal] = useState(false);
    const [showPreconditionModal, setShowPreconditionModal] = useState(false);
    const [showPostconditionModal, setShowPostconditionModal] = useState(false);

    const [showActorModal, setShowActorModal] = useState(false);
    const [personModalType, setPersonModalType] = useState<'owner' | 'stakeholder'>('owner');
    const [savedAid, setSavedAid] = useState<string | null>(null);
    const [focusedField, setFocusedField] = useState<string | null>(null);

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
    const [earsValidation, setEarsValidation] = useState<{ valid: boolean; message: string; suggestions?: string[] } | null>(null);

    // Fetch EARS templates
    const { data: earsTemplatesData } = useQuery({
        queryKey: ['ears-templates'],
        queryFn: async () => {
            return await RequirementsService.getEarsTemplatesApiV1RequirementsEarsTemplatesGet();
        },
        enabled: artifactType === 'requirement'
    });

    // Comment Panel State
    const [showCommentPanel, setShowCommentPanel] = useState(false);
    const { data: comments } = useQuery({
        queryKey: ['comments', artifactId],
        queryFn: async () => {
            if (!artifactId) return [];
            const response = await fetch(`/api/v1/comments/?artifact_aid=${artifactId}`);
            return response.json();
        },
        enabled: !!artifactId
    });

    // Auto-open comment panel if there are comments (only once)
    const [hasInitializedComments, setHasInitializedComments] = useState(false);
    useEffect(() => {
        if (comments && comments.length > 0 && !hasInitializedComments) {
            setShowCommentPanel(true);
            setHasInitializedComments(true);
        }
    }, [comments, hasInitializedComments]);

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
        getValues,
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
            exceptions: [], // Changed from exception_ids to exceptions
            source_use_case_id: '',
            site_ids: [],
            component_ids: [],
        }
    });

    const { fields: mssFields, append: appendMss, remove: removeMss } = useFieldArray({ control, name: 'mss' });
    const { fields: extFields, append: appendExt, remove: removeExt } = useFieldArray({ control, name: 'extensions' });
    const { fields: exceptionFields, append: appendException, remove: removeException } = useFieldArray({ control, name: 'exceptions' });

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
        queryKey: ['areas', realProjectId],
        queryFn: () => MetadataService.listAreasApiV1MetadataMetadataAreasGet(realProjectId)
    });
    const { data: actors } = useQuery({
        queryKey: ['actors', realProjectId],
        queryFn: async () => {
            const result = await MetadataService.listPeopleApiV1MetadataMetadataPeopleGet(realProjectId, 'actor');
            return (result || []).sort((a: any, b: any) => a.name.localeCompare(b.name));
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
                case 'document':
                    const response = await fetch(`/api/v1/documents/${artifactId}`);
                    if (!response.ok) throw new Error('Failed to fetch document');
                    return await response.json();
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
                    setValue('exceptions', ucData.exceptions);
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

    // Set default description template for new Needs
    useEffect(() => {
        if (artifactType === 'need' && !isEditMode && !location.state?.duplicateData) {
            const currentDescription = getValues('description');
            // Only set template if description is empty
            if (!currentDescription || currentDescription.trim() === '') {
                setValue('description', 'As __stakeholder__ we need __the_need__ so that __benefit__.');
            }
        }
    }, [artifactType, isEditMode, location.state, setValue, getValues]);

    // Debounced EARS validation
    useEffect(() => {
        if (artifactType !== 'requirement') return;

        const requirementText = watch('text');
        const selectedEarsType = watch('ears_type');

        if (!requirementText || !selectedEarsType || selectedEarsType === 'UBIQUITOUS') {
            setEarsValidation(null);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                const response = await fetch('/api/v1/requirement/requirements/ears/validate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text: requirementText,
                        pattern: selectedEarsType
                    })
                });

                if (response.ok) {
                    const result = await response.json();
                    setEarsValidation(result);
                }
            } catch (error) {
                console.error('Validation error:', error);
            }
        }, 1000); // Debounce for 1 second

        return () => clearTimeout(timer);
    }, [watch('text'), watch('ears_type'), artifactType, watch, setEarsValidation]);

    // Helper function to convert EARS template placeholders to underscores
    const convertEarsTemplate = (template: string): string => {
        return template
            .replace(/<([^>]+)>/g, '__$1__');  // Convert <placeholder> to __placeholder__
    };

    const preparePayload = (data: FormData) => {
        // Add project_id to payload
        const payload = { ...data, project_id: realProjectId };

        const sanitize = (obj: any) => {
            const cleaned: any = { ...obj };
            ['level', 'status', 'area', 'owner', 'stakeholder_id', 'source_vision_id', 'source_need_id', 'ears_type', 'primary_actor_id'].forEach(field => {
                if (cleaned[field] === '' || cleaned[field] === null) {
                    delete cleaned[field];
                }
            });
            // Also sanitize EARS fields if they are empty
            ['ears_trigger', 'ears_state', 'ears_condition', 'ears_feature'].forEach(field => {
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
                use_case: ['title', 'description', 'area', 'source_need_id', 'status', 'trigger', 'primary_actor_id', 'stakeholder_ids', 'precondition_ids', 'postcondition_ids', 'exceptions', 'mss', 'extensions', 'project_id'],
                requirement: ['short_name', 'text', 'area', 'level', 'ears_type', 'ears_trigger', 'ears_state', 'ears_condition', 'ears_feature', 'status', 'rationale', 'owner', 'source_use_case_id', 'project_id'],
                document: ['title', 'description', 'document_type', 'content_url', 'content_text', 'mime_type', 'area', 'project_id']
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

        return filterFields(cleanPayload, artifactType);
    };

    // Mutations for creating/updating the main artifact
    const createMutation = useMutation({
        mutationFn: async (data: FormData) => {
            const filteredPayload = preparePayload(data);
            console.log('Sending create payload:', filteredPayload);

            switch (artifactType) {
                case 'vision':
                    return await VisionService.createVisionStatementApiV1VisionVisionStatementsPost(filteredPayload as any);
                case 'need':
                    return await NeedsService.createNeedApiV1NeedNeedsPost(filteredPayload as any);
                case 'use_case':
                    return await UseCasesService.createUseCaseApiV1UseCaseUseCasesPost(filteredPayload as any);
                case 'requirement':
                    return await RequirementsService.createRequirementApiV1RequirementRequirementsPost(filteredPayload as any);
                case 'document':
                    const response = await fetch('/api/v1/documents/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(filteredPayload),
                    });
                    if (!response.ok) throw new Error('Failed to create document');
                    return await response.json();
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

            const filteredPayload = preparePayload(data);
            console.log('Sending update payload:', filteredPayload);

            switch (artifactType) {
                case 'vision':
                    return await VisionService.updateVisionStatementApiV1VisionVisionStatementsAidPut(aid, filteredPayload as any);
                case 'need':
                    return await NeedsService.updateNeedApiV1NeedNeedsAidPut(aid, filteredPayload as any);
                case 'use_case':
                    return await UseCasesService.updateUseCaseApiV1UseCaseUseCasesAidPut(aid, filteredPayload as any);
                case 'requirement':
                    return await RequirementsService.updateRequirementApiV1RequirementRequirementsAidPut(aid, filteredPayload as any);
                case 'document':
                    const response = await fetch(`/api/v1/documents/${aid}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(filteredPayload),
                    });
                    if (!response.ok) throw new Error('Failed to update document');
                    return await response.json();
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

    const onSubmitAndReturn = async (data: FormData) => {
        if (isEditMode || savedAid) {
            await updateMutation.mutateAsync(data);
        } else {
            await createMutation.mutateAsync(data);
        }
        navigate(`/project/${projectId}/${routeType}/${artifactId || savedAid}`);
    };

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl+S / Cmd+S: Save and Stay
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSubmit(onSubmit, onError)();
            }
            // Ctrl+Enter / Cmd+Enter: Save and Return
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                handleSubmit(onSubmitAndReturn, onError)();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleSubmit, onSubmit, onSubmitAndReturn]);

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
                            onFocus={() => setFocusedField('short_name')}
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
                            onFocus={() => setFocusedField('title')}
                            spellCheck={true}
                        />
                    </div>
                )}

                {artifactType === 'requirement' ? (
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Requirement Text
                        </label>
                        <Controller
                            control={control}
                            name="text"
                            render={({ field }) => (
                                <div data-color-mode="light">
                                    <MDEditor
                                        value={field.value || ''}
                                        onChange={field.onChange}
                                        preview="live"
                                        height={300}
                                        textareaProps={{ spellCheck: true }}
                                        className="border border-slate-300 rounded-md overflow-hidden"
                                        onFocus={() => setFocusedField('text')}
                                        previewOptions={{
                                            remarkPlugins: [remarkGfm],
                                            className: 'prose prose-slate max-w-none p-4',
                                            components: {
                                                code: ({ node, inline, className, children, ...props }: any) => {
                                                    const match = /language-(\w+)/.exec(className || '');
                                                    const language = match ? match[1] : '';

                                                    if (!inline && language === 'mermaid') {
                                                        return (
                                                            <div className="not-prose">
                                                                <MermaidBlock chart={extractText(children).replace(/\n$/, '')} />
                                                            </div>
                                                        );
                                                    }

                                                    if (!inline && language === 'plantuml') {
                                                        return (
                                                            <div className="not-prose">
                                                                <PlantUMLBlock code={extractText(children).replace(/\n$/, '')} />
                                                            </div>
                                                        );
                                                    }
                                                    return (
                                                        <code className={className} {...props}>
                                                            {children}
                                                        </code>
                                                    );
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            )}
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
                                        preview="live"
                                        height={400}
                                        textareaProps={{ spellCheck: true }}
                                        className="border border-slate-300 rounded-md overflow-hidden"
                                        onFocus={() => setFocusedField('description')}
                                        previewOptions={{
                                            remarkPlugins: [remarkGfm],
                                            className: 'prose prose-slate max-w-none p-4',
                                            components: {
                                                code: ({ node, inline, className, children, ...props }: any) => {
                                                    const match = /language-(\w+)/.exec(className || '');
                                                    const language = match ? match[1] : '';

                                                    if (!inline && language === 'mermaid') {
                                                        return (
                                                            <div className="not-prose">
                                                                <MermaidBlock chart={extractText(children).replace(/\n$/, '')} />
                                                            </div>
                                                        );
                                                    }

                                                    if (!inline && language === 'plantuml') {
                                                        return (
                                                            <div className="not-prose">
                                                                <PlantUMLBlock code={extractText(children).replace(/\n$/, '')} />
                                                            </div>
                                                        );
                                                    }

                                                    return (
                                                        <code className={className} {...props}>
                                                            {children}
                                                        </code>
                                                    );
                                                }
                                            }
                                        }}
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
                    <select {...register('area')} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" onFocus={() => setFocusedField('area')}>
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
                            <Controller
                                control={control}
                                name="rationale"
                                render={({ field }) => (
                                    <div data-color-mode="light">
                                        <MDEditor
                                            value={field.value || ''}
                                            onChange={field.onChange}
                                            preview="live"
                                            height={200}
                                            textareaProps={{ spellCheck: true }}
                                            className="border border-slate-300 rounded-md overflow-hidden"
                                            onFocus={() => setFocusedField('rationale')}
                                            previewOptions={{
                                                remarkPlugins: [remarkGfm],
                                                className: 'prose prose-slate max-w-none p-4',
                                                components: {
                                                    code: ({ node, inline, className, children, ...props }: any) => {
                                                        const match = /language-(\w+)/.exec(className || '');
                                                        const language = match ? match[1] : '';

                                                        if (!inline && language === 'mermaid') {
                                                            return <MermaidBlock chart={String(children).replace(/\n$/, '')} />;
                                                        }

                                                        if (!inline && language === 'plantuml') {
                                                            return <PlantUMLBlock code={String(children).replace(/\n$/, '')} />;
                                                        }

                                                        return (
                                                            <code className={className} {...props}>
                                                                {children}
                                                            </code>
                                                        );
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-medium text-slate-700">Owner</label>
                                    <button type="button" onClick={() => { setPersonModalType('owner'); setShowPersonModal(true); }} className="text-xs text-blue-600 hover:text-blue-800 flex items-center">
                                        <Plus className="w-3 h-3 mr-1" /> Add Owner
                                    </button>
                                </div>
                                <select {...register('owner_id')} className="w-full px-3 py-2 border border-slate-300 rounded-md" onFocus={() => setFocusedField('owner')}>
                                    <option value="">Select Owner...</option>
                                    {owners?.sort((a: any, b: any) => a.name.localeCompare(b.name)).map((p: any) => (
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
                                <select {...register('stakeholder_id')} className="w-full px-3 py-2 border border-slate-300 rounded-md" onFocus={() => setFocusedField('stakeholder')}>
                                    <option value="">Select Stakeholder...</option>
                                    {stakeholders?.sort((a: any, b: any) => a.name.localeCompare(b.name)).map((p: any) => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Level</label>
                            <select {...register('level')} className="w-full px-3 py-2 border border-slate-300 rounded-md" onFocus={() => setFocusedField('level')}>
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
                                spellCheck={true}
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
                                spellCheck={true}
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

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Trigger</label>
                            <input {...register('trigger')} className="w-full px-3 py-2 border border-slate-300 rounded-md" spellCheck={true} />
                        </div>
                        <div className="mt-6">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-medium">Main Success Scenario</h3>
                                <button type="button" onClick={() => appendMss({ step_num: mssFields.length + 1, actor: '', description: '', message: '', target_actor: '', response: '' })} className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                                    <Plus className="w-4 h-4 mr-1" /> Add Step
                                </button>
                            </div>
                            <div className="space-y-4">
                                {mssFields.map((field, index) => (
                                    <div key={field.id} className="p-3 bg-slate-50 rounded-md border border-slate-200">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-sm font-medium text-slate-700">Step {index + 1}</span>
                                            <button type="button" onClick={() => removeMss(index)} className="text-red-500 hover:text-red-700">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 mb-3">
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 mb-1">Actor</label>
                                                <select {...register(`mss.${index}.actor`)} className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-md">
                                                    <option value="">Select Actor...</option>
                                                    {actors?.map((a: any) => (
                                                        <option key={a.id} value={a.name}>{a.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 mb-1">Target Actor (Optional)</label>
                                                <select {...register(`mss.${index}.target_actor`)} className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-md bg-white">
                                                    <option value="">Select Target...</option>
                                                    {actors?.map((a: any) => (
                                                        <option key={a.id} value={a.name}>{a.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 mb-3">
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 mb-1">Message (Method)</label>
                                                <input {...register(`mss.${index}.message`)} placeholder="e.g. IngestData()" className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-md" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 mb-1">Response (Return)</label>
                                                <input {...register(`mss.${index}.response`)} placeholder="e.g. DataNormalized" className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-md" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 mb-1">Description (Action)</label>
                                            <textarea {...register(`mss.${index}.description`)} rows={2} className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-md" spellCheck={true} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="mt-6">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-medium">Extensions</h3>
                                <button type="button" onClick={() => appendExt({ step: '', condition: '', handling: '', actor: '', message: '', target_actor: '', response: '' })} className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                                    <Plus className="w-4 h-4 mr-1" /> Add Extension
                                </button>
                            </div>
                            <div className="space-y-2">
                                {extFields.map((field, index) => (
                                    <div key={field.id} className="p-3 bg-slate-50 rounded-md border border-slate-200">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <label className="text-sm font-medium text-slate-700">Ref</label>
                                                <input {...register(`extensions.${index}.step`)} placeholder="3a" className="w-16 px-2 py-1 text-sm border border-slate-300 rounded-md" />
                                            </div>
                                            <button type="button" onClick={() => removeExt(index)} className="text-red-500 hover:text-red-700">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 mb-3">
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 mb-1">Source Actor (Optional)</label>
                                                <select {...register(`extensions.${index}.actor`)} className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-md bg-white">
                                                    <option value="">Select Actor...</option>
                                                    {actors?.map((a: any) => (
                                                        <option key={a.id} value={a.name}>{a.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 mb-1">Target Actor (Optional)</label>
                                                <select {...register(`extensions.${index}.target_actor`)} className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-md bg-white">
                                                    <option value="">Select Target...</option>
                                                    {actors?.map((a: any) => (
                                                        <option key={a.id} value={a.name}>{a.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 mb-3">
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 mb-1">Message (Optional)</label>
                                                <input {...register(`extensions.${index}.message`)} placeholder="Triggering Message" className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-md" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 mb-1">Response (Optional)</label>
                                                <input {...register(`extensions.${index}.response`)} placeholder="Result Message" className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-md" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 mb-1">Condition</label>
                                                <input {...register(`extensions.${index}.condition`)} placeholder="e.g. Network Fail" className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-md" spellCheck={true} />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 mb-1">Handling</label>
                                                <input {...register(`extensions.${index}.handling`)} placeholder="e.g. Retry 3x" className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-md" spellCheck={true} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-4 mt-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium">Exceptions</h3>
                                <button type="button" onClick={() => appendException({ trigger: '', handling: '', steps: [] })} className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                                    <Plus className="w-4 h-4 mr-1" /> Add Exception
                                </button>
                            </div>
                            <div className="space-y-2">
                                {exceptionFields.map((field, index) => (
                                    <div key={field.id} className="p-3 bg-slate-50 rounded-md border border-slate-200">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="font-medium text-slate-700 text-sm">Exception {index + 1}</div>
                                            <button type="button" onClick={() => removeException(index)} className="text-red-500 hover:text-red-700">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 gap-3 mb-3">
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 mb-1">Trigger</label>
                                                <input {...register(`exceptions.${index}.trigger` as const)} placeholder="Trigger condition" className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-md" spellCheck={true} />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 mb-1">Handling</label>
                                                <textarea {...register(`exceptions.${index}.handling` as const)} rows={2} placeholder="Handling logic" className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-md" spellCheck={true} />
                                            </div>
                                            <div>
                                                <ExceptionStepsEditor
                                                    nestIndex={index}
                                                    control={control}
                                                    register={register}
                                                    actors={actors || []}
                                                />
                                            </div>
                                        </div>
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
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-slate-700">Owner</label>
                                <button type="button" onClick={() => { setPersonModalType('owner'); setShowPersonModal(true); }} className="text-xs text-blue-600 hover:text-blue-800 flex items-center">
                                    <Plus className="w-3 h-3 mr-1" /> Add Owner
                                </button>
                            </div>
                            <select {...register('owner')} className="w-full px-3 py-2 border border-slate-300 rounded-md">
                                <option value="">Select Owner...</option>
                                {(() => {
                                    // Deduplicate owners by name for the text-based Requirement field
                                    const uniqueNames = new Set();
                                    return owners?.filter((p: any) => {
                                        if (uniqueNames.has(p.name)) return false;
                                        uniqueNames.add(p.name);
                                        return true;
                                    }).map((p: any) => (
                                        <option key={p.id} value={p.name}>{p.name}</option>
                                    ));
                                })()}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Requirement Text</label>
                            <textarea
                                {...register('text', { required: true })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={4}
                                placeholder="The system shall..."
                            />
                            {/* EARS Validation Feedback */}
                            {earsValidation && (
                                <div className={`mt-2 p-3 rounded-md text-sm ${earsValidation.valid ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
                                    <div className="flex items-start gap-2">
                                        <span className="font-medium">
                                            {earsValidation.valid ? '✓' : '✗'}
                                        </span>
                                        <div className="flex-1">
                                            <p className="font-medium">{earsValidation.message}</p>
                                            {earsValidation.suggestions && earsValidation.suggestions.length > 0 && (
                                                <ul className="mt-2 space-y-1 text-xs">
                                                    {earsValidation.suggestions.map((suggestion, idx) => (
                                                        <li key={idx}>• {suggestion}</li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
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
                                        setValue('text', convertEarsTemplate(earsTemplates[selectedType].template));
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
                                                    let newText = convertEarsTemplate(earsTemplates[watch('ears_type')].template);

                                                    if (e.target.value) newText = newText.replace('__trigger__', e.target.value);
                                                    if (watch('ears_state')) newText = newText.replace('__state__', watch('ears_state'));
                                                    if (watch('ears_feature')) newText = newText.replace('__feature__', watch('ears_feature'));
                                                    if (watch('ears_condition')) newText = newText.replace('__condition__', watch('ears_condition'));

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
                                                    let newText = convertEarsTemplate(earsTemplates[watch('ears_type')].template);

                                                    if (watch('ears_feature')) newText = newText.replace('__feature__', watch('ears_feature'));
                                                    if (e.target.value) newText = newText.replace('__state__', e.target.value);
                                                    if (watch('ears_condition')) newText = newText.replace('__condition__', watch('ears_condition'));
                                                    if (watch('ears_trigger')) newText = newText.replace('__trigger__', watch('ears_trigger'));
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
            case 'document': {
                const docType = watch('document_type');
                return (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Document Type</label>
                            <select
                                {...register('document_type')}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md"
                            >
                                <option value="url">External URL</option>
                                <option value="file">File Upload</option>
                                <option value="text">Formatted Text (Markdown)</option>
                            </select>
                        </div>

                        {docType === 'url' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">URL</label>
                                <input
                                    {...register('content_url', { required: true })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                                    placeholder="https://example.com/doc"
                                />
                            </div>
                        )}

                        {docType === 'file' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">File Upload</label>
                                <input
                                    type="file"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const formData = new FormData();
                                            formData.append('file', file);
                                            try {
                                                const response = await fetch('/api/v1/documents/upload', {
                                                    method: 'POST',
                                                    body: formData,
                                                });
                                                if (!response.ok) throw new Error('Upload failed');
                                                const result = await response.json();
                                                setValue('content_url', result.url); // Store path
                                                setValue('mime_type', file.type);
                                            } catch (err) {
                                                console.error(err);
                                                alert('File upload failed');
                                            }
                                        }
                                    }}
                                />
                                {watch('content_url') && (
                                    <p className="text-xs text-green-600 mt-1">File uploaded successfully.</p>
                                )}
                            </div>
                        )}

                        {docType === 'text' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Content
                                </label>
                                <Controller
                                    control={control}
                                    name="content_text"
                                    render={({ field }) => (
                                        <div data-color-mode="light">
                                            <MDEditor
                                                value={field.value || ''}
                                                onChange={field.onChange}
                                                preview="live"
                                                height={500}
                                                textareaProps={{ spellCheck: true }}
                                                className="border border-slate-300 rounded-md overflow-hidden"
                                                onFocus={() => setFocusedField('content_text')}
                                                previewOptions={{
                                                    remarkPlugins: [remarkGfm],
                                                    className: 'prose prose-slate max-w-none p-4',
                                                    components: {
                                                        code: ({ node, inline, className, children, ...props }: any) => {
                                                            const match = /language-(\w+)/.exec(className || '');
                                                            const language = match ? match[1] : '';

                                                            if (!inline && language === 'mermaid') {
                                                                return (
                                                                    <div className="not-prose">
                                                                        <MermaidBlock chart={extractText(children).replace(/\n$/, '')} />
                                                                    </div>
                                                                );
                                                            }

                                                            if (!inline && language === 'plantuml') {
                                                                return (
                                                                    <div className="not-prose">
                                                                        <PlantUMLBlock code={extractText(children).replace(/\n$/, '')} />
                                                                    </div>
                                                                );
                                                            }

                                                            return (
                                                                <code className={className} {...props}>
                                                                    {children}
                                                                </code>
                                                            );
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>
                                    )}
                                />
                            </div>
                        )}
                    </>
                );
            }
            default:
                return null;
        }
    };

    const onError = (errors: any) => {
        console.error('Form validation errors:', errors);
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            <div className={`max-w-${isEditMode && showCommentPanel ? '7xl' : '4xl'} mx-auto px-4 sm:px-6 lg:px-8 py-8 ${isEditMode && showCommentPanel ? 'grid grid-cols-[1fr_400px] gap-6' : ''}`}>
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            {isEditMode && (
                                <button
                                    onClick={() => navigate(`/project/${projectId}/${routeType}/${artifactId}`)}
                                    className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                                    title="Back to Presentation"
                                >
                                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                                </button>
                            )}
                            <h1 className="text-2xl font-bold text-slate-900">
                                {isEditMode ? `Edit ${artifactType === 'use_case' ? 'Use Case' : artifactType.charAt(0).toUpperCase() + artifactType.slice(1)}` : `New ${artifactType === 'use_case' ? 'Use Case' : artifactType.charAt(0).toUpperCase() + artifactType.slice(1)}`}
                            </h1>
                        </div>
                        <div className="flex items-center gap-2">
                            {isEditMode && (
                                <button
                                    onClick={() => setShowCommentPanel(!showCommentPanel)}
                                    className={`p-2 rounded-full transition-colors ${showCommentPanel ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                                    title={showCommentPanel ? "Hide Comments" : "Show Comments"}
                                >
                                    <MessageSquare className="w-5 h-5" />
                                    {comments && comments.length > 0 && !showCommentPanel && (
                                        <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white bg-red-500 transform translate-x-1/2 -translate-y-1/2" />
                                    )}
                                </button>
                            )}
                            <button
                                onClick={handleCancel}
                                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Status Action Bar - Only in Edit Mode */}
                    {
                        isEditMode && (
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
                        )
                    }
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
                            <button
                                type="button"
                                onClick={handleSubmit(onSubmitAndReturn, onError)}
                                className="flex-1 bg-teal-600 text-white py-3 rounded-md hover:bg-teal-700 transition-colors font-medium"
                                disabled={isEditMode ? updateMutation.isPending : createMutation.isPending}
                                title="Ctrl+Enter"
                            >
                                Save & View
                            </button>
                        </div>
                    </form>

                    {/* Linkage Manager - Only visible when artifact exists */}
                    {
                        (isEditMode || savedAid) && realProjectId && (
                            <div className="mt-8 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                                <h2 className="text-xl font-bold text-slate-900 mb-6">Artifact Linkages</h2>
                                <LinkageManager
                                    sourceArtifactType={artifactType}
                                    sourceId={artifactId || savedAid || ''}
                                    projectId={realProjectId}
                                />
                            </div>
                        )
                    }
                </div>

                {/* Comment Panel Sidebar - Only in Edit Mode */}
                {isEditMode && showCommentPanel && (
                    <div className="sticky top-8 h-[calc(100vh-4rem)]">
                        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden h-full">
                            <CommentPanel
                                artifactAid={artifactId!}
                                artifactType={artifactType}
                                selectedField={focusedField}
                                fieldLabel={focusedField ? focusedField.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : ''}
                            />
                        </div>
                    </div>
                )}
            </div>

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
                                    <textarea name="description" className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} spellCheck={true} />
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
                                    <textarea name="description" className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} spellCheck={true} />
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
                                        spellCheck={true}
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
                                        spellCheck={true}
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
                                        spellCheck={true}
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
                                        spellCheck={true}
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
                                        spellCheck={true}
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
        </div>
    );
}


