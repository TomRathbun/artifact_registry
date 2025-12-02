import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { VisionService, NeedsService, UseCaseService, RequirementService, MetadataService, ProjectsService, LinkagesService, SiteService, ComponentService } from '../client';
import VisionHeader from './VisionHeader';
import { MultiSelect } from './MultiSelect';
import ImportConflictModal from './ImportConflictModal';
import { Download, Upload, Trash2, Edit, FileDown, FileText, File, Copy, Clipboard, Files } from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';

interface ArtifactListViewProps {
    artifactType: 'vision' | 'need' | 'use_case' | 'requirement' | 'actor' | 'stakeholder' | 'area';
}

const STATUS_OPTIONS = [
    { value: 'proposed', label: 'Proposed' },
    { value: 'verified', label: 'Verified' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'base_lined', label: 'Base Lined' },
];

export default function ArtifactListView({ artifactType }: ArtifactListViewProps) {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [area, setArea] = useState<string[]>([]);
    const [status, setStatus] = useState<string[]>([]);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    // Import Conflict State
    const [showImportModal, setShowImportModal] = useState(false);
    const [importConflicts, setImportConflicts] = useState<{ type: 'Area' | 'Owner', value: string }[]>([]);
    const [pendingImportData, setPendingImportData] = useState<{ artifacts: any[], linkages: any[] } | null>(null);

    // Import Results State
    const [showResultsModal, setShowResultsModal] = useState(false);
    const [importResults, setImportResults] = useState<{ artifactResults: any[], linkageResults: any[] } | null>(null);

    // Confirmation Modal State
    const [confirmation, setConfirmation] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        isDestructive: boolean;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        isDestructive: false
    });

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Fetch project details first to get the real UUID
    const { data: project } = useQuery({
        queryKey: ['project', projectId],
        queryFn: () => ProjectsService.getProjectApiV1ProjectsProjectsProjectIdGet(projectId!),
        enabled: !!projectId
    });

    // Fetch vision statement for header (only once)
    const { data: vision } = useQuery({
        queryKey: ['vision', project?.id],
        queryFn: () => VisionService.listVisionStatementsApiV1VisionVisionStatementsGet(project!.id),
        enabled: artifactType !== 'vision' && !!project?.id,
    });

    // Fetch areas for filter
    const { data: areas } = useQuery({
        queryKey: ['areas'],
        queryFn: () => MetadataService.listAreasApiV1MetadataMetadataAreasGet(),
    });

    const areaOptions = areas?.map((a: any) => ({ value: a.code, label: a.name })) || [];

    // Dynamic fetch based on artifact type
    const { data: artifacts, isLoading } = useQuery({
        queryKey: [artifactType, project?.id, area, status, debouncedSearch],
        queryFn: async () => {
            if (!project?.id) return [];
            switch (artifactType) {
                case 'vision':
                    return VisionService.listVisionStatementsApiV1VisionVisionStatementsGet(
                        project.id,
                        status.length > 0 ? status[0] : undefined,
                        debouncedSearch || undefined
                    );
                case 'need':
                    return NeedsService.listNeedsApiV1NeedNeedsGet(
                        project.id,
                        area.length > 0 ? area : undefined,
                        status.length > 0 ? status : undefined,
                        undefined,
                        debouncedSearch || undefined,
                        false
                    );
                case 'use_case':
                    return UseCaseService.listUseCasesApiV1UseCaseUseCasesGet(
                        project.id,
                        area.length > 0 ? area : undefined,
                        status.length > 0 ? status : undefined,
                        undefined,
                        debouncedSearch || undefined,
                        false
                    );
                case 'requirement':
                    return RequirementService.listRequirementsApiV1RequirementRequirementsGet(
                        project.id,
                        area.length > 0 ? area : undefined,
                        status.length > 0 ? status : undefined,
                        undefined,
                        undefined,
                        undefined,
                        debouncedSearch || undefined,
                        false
                    );
                default:
                    return [];
            }
        },
        enabled: !!project?.id,
    });

    // Fetch metadata for export mapping
    const { data: owners } = useQuery({
        queryKey: ['owners', project?.id],
        queryFn: () => MetadataService.listPeopleApiV1MetadataMetadataPeopleGet(project?.id),
        enabled: !!artifacts && !!project?.id
    });
    const { data: stakeholders } = useQuery({
        queryKey: ['stakeholders', project?.id],
        queryFn: () => MetadataService.listPeopleApiV1MetadataMetadataPeopleGet(project?.id),
        enabled: !!artifacts && !!project?.id
    });



    const { data: linkages } = useQuery({
        queryKey: ['linkages'],
        queryFn: () => LinkagesService.listLinkagesApiV1LinkageLinkagesGet(),
        enabled: !!artifacts
    });

    const { data: allSites } = useQuery({
        queryKey: ['sites'],
        queryFn: () => SiteService.listSitesApiV1SitesGet(),
        enabled: artifactType === 'need' && !!artifacts
    });

    const { data: allComponents } = useQuery({
        queryKey: ['components'],
        queryFn: () => ComponentService.listComponentsApiV1ComponentsGet(),
        enabled: artifactType === 'need' && !!artifacts
    });

    // Helper to prepare artifact for export (clean up IDs, etc.)
    const prepareArtifactForExport = (a: any) => {
        const exportItem = { ...a };

        // Replace IDs with names
        if (exportItem.owner_id && owners) {
            const owner = owners.find((o: any) => o.id === exportItem.owner_id);
            if (owner) {
                exportItem.owner = owner.name;
                delete exportItem.owner_id;
            }
        } else if (exportItem.owner && owners) {
            // Handle case where owner field itself contains the ID (e.g. Requirements)
            const owner = owners.find((o: any) => o.id === exportItem.owner);
            if (owner) {
                exportItem.owner = owner.name;
            }
        }

        if (exportItem.stakeholder_id && stakeholders) {
            const stakeholder = stakeholders.find((s: any) => s.id === exportItem.stakeholder_id);
            if (stakeholder) {
                exportItem.stakeholder = stakeholder.name;
                delete exportItem.stakeholder_id;
            }
        }

        // Handle Need specific exports
        if (artifactType === 'need') {
            if (exportItem.sites && Array.isArray(exportItem.sites)) {
                exportItem.sites = exportItem.sites.map((s: any) => s.name);
            } else if (exportItem.site_ids && allSites) {
                exportItem.sites = exportItem.site_ids.map((id: string) => {
                    const site = allSites.find((s: any) => s.id === id);
                    return site ? site.name : id;
                });
                delete exportItem.site_ids;
            }

            if (exportItem.components && Array.isArray(exportItem.components)) {
                exportItem.components = exportItem.components.map((c: any) => c.name);
            } else if (exportItem.component_ids && allComponents) {
                exportItem.components = exportItem.component_ids.map((id: string) => {
                    const comp = allComponents.find((c: any) => c.id === id);
                    return comp ? comp.name : id;
                });
                delete exportItem.component_ids;
            }
        }

        // Clean up Need exports
        if (artifactType === 'need') {
            // Resolve Sites
            if (exportItem.site_ids && Array.isArray(exportItem.site_ids) && allSites) {
                exportItem.sites = exportItem.site_ids.map((id: string) => {
                    const site = allSites.find((s: any) => s.id === id);
                    return site ? site.name : id;
                });
                delete exportItem.site_ids;
            }

            // Resolve Components
            if (exportItem.component_ids && Array.isArray(exportItem.component_ids) && allComponents) {
                exportItem.components = exportItem.component_ids.map((id: string) => {
                    const comp = allComponents.find((c: any) => c.id === id);
                    return comp ? comp.name : id;
                });
                delete exportItem.component_ids;
            }

            // Resolve Owner
            if (exportItem.owner_id && owners) {
                const owner = owners.find((o: any) => o.id === exportItem.owner_id);
                exportItem.owner = owner ? owner.name : exportItem.owner_id;
                delete exportItem.owner_id;
            }

            // Resolve Stakeholder
            if (stakeholders) {
                let sId = exportItem.stakeholder_id;
                if (!sId && exportItem.stakeholder && typeof exportItem.stakeholder === 'string' && exportItem.stakeholder.length > 30) {
                    // Assume it's an ID if it's a long string (UUID)
                    sId = exportItem.stakeholder;
                }

                if (sId) {
                    const stakeholder = stakeholders.find((s: any) => s.id === sId);
                    exportItem.stakeholder = stakeholder ? stakeholder.name : sId;
                    delete exportItem.stakeholder_id;
                }
            }
        }

        // Clean up Requirement exports
        if (artifactType === 'requirement') {
            delete exportItem.ears_trigger;
            delete exportItem.ears_state;
            delete exportItem.ears_condition;
            delete exportItem.ears_feature;
        }

        // Clean up Use Case exports
        if (artifactType === 'use_case') {
            // Convert primary_actor object to just name
            if (exportItem.primary_actor) {
                exportItem.primary_actor = exportItem.primary_actor.name;
            }

            // Convert stakeholders array of objects to array of names
            if (exportItem.stakeholders && Array.isArray(exportItem.stakeholders)) {
                exportItem.stakeholders = exportItem.stakeholders.map((s: any) => s.name);
            }

            // Convert preconditions array of objects to array of text
            if (exportItem.preconditions && Array.isArray(exportItem.preconditions)) {
                exportItem.preconditions = exportItem.preconditions.map((p: any) => p.text);
            }

            // Convert postconditions array of objects to array of text
            if (exportItem.postconditions && Array.isArray(exportItem.postconditions)) {
                exportItem.postconditions = exportItem.postconditions.map((p: any) => p.text);
            }

            // Convert exceptions array of objects to simplified format
            if (exportItem.exceptions && Array.isArray(exportItem.exceptions)) {
                exportItem.exceptions = exportItem.exceptions.map((e: any) => ({
                    trigger: e.trigger,
                    handling: e.handling
                }));
            }
        }

        // Refine Export Format
        if (project) {
            exportItem.project = project.name;
            delete exportItem.project_id;
        }

        // Remove dates and internal fields
        delete exportItem.id;
        delete exportItem.aid; // We might want to keep aid as a reference, but user asked to remove "ids". Let's assume UUIDs. AID is user-facing ID usually.
        // User said "remove the ids", usually meaning database UUIDs. AID (e.g. TR2-UC-001) is usually desired in export.
        // Let's keep AID for now as it's the human readable ID.
        // Wait, user said "remove the ids".
        // "remove the ids, just outut the names"
        // If I remove AID, I lose the reference. But maybe they just want the content.
        // Let's remove 'id' (UUID) and keep 'aid' (Human ID) for now, unless 'aid' is also considered an "id" to remove.
        // "remove the ids" usually refers to the UUIDs.
        // Let's strictly follow "remove the ids".
        delete exportItem.id;

        delete exportItem.created_at;
        delete exportItem.updated_at;
        delete exportItem.created_by;
        delete exportItem.updated_by;
        delete exportItem.created_date;
        delete exportItem.last_updated;
        delete exportItem.source_vision_id;
        delete exportItem.project_id;

        // Helper to replace nulls with empty strings recursively
        const cleanNulls = (obj: any): any => {
            if (obj === null) return "";
            if (Array.isArray(obj)) return obj.map(cleanNulls);
            if (typeof obj === 'object') {
                for (const key in obj) {
                    obj[key] = cleanNulls(obj[key]);
                }
                return obj;
            }
            return obj;
        };

        return cleanNulls(exportItem);
    };

    // Export to JSON
    const handleExport = () => {
        if (!artifacts || artifacts.length === 0) {
            alert('No artifacts to export');
            return;
        }
        if (!stakeholders || !owners) {
            alert('Metadata is still loading. Please wait a moment and try again.');
            return;
        }

        const exportArtifacts = artifacts.map(prepareArtifactForExport);

        // Collect relevant linkages
        const relevantLinkages: string[][] = [];
        const uniqueLinkages = new Set<string>();
        if (linkages) {
            const artifactIds = new Set(artifacts.map((a: any) => a.aid));
            linkages.forEach((l: any) => {
                // Check if this linkage involves any of the exported artifacts
                if (artifactIds.has(l.source_id) || artifactIds.has(l.target_id)) {
                    const s = l.source_id.trim();
                    const t = l.target_id.trim();
                    const key = `${s}|${t}`;
                    if (!uniqueLinkages.has(key)) {
                        uniqueLinkages.add(key);
                        relevantLinkages.push([s, t]);
                    }
                }
            });
        }

        const exportData = {
            artifactType,
            project: project?.name || projectId,
            exportDate: new Date().toISOString(),
            count: exportArtifacts.length,
            artifacts: exportArtifacts,
            linkages: relevantLinkages
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${artifactType}_export_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };



    // Copy to Clipboard
    const handleCopy = async (artifact: any) => {
        if (!stakeholders || !owners) {
            alert('Metadata is still loading. Please wait a moment and try again.');
            return;
        }
        try {
            const exportArtifact = prepareArtifactForExport(artifact);
            // Collect relevant linkages
            const relevantLinkages: string[][] = [];
            const uniqueLinkages = new Set<string>();
            if (linkages) {
                const aid = artifact.aid;
                linkages.forEach((l: any) => {
                    if (l.source_id === aid || l.target_id === aid) {
                        const s = l.source_id.trim();
                        const t = l.target_id.trim();
                        const key = `${s}|${t}`;
                        if (!uniqueLinkages.has(key)) {
                            uniqueLinkages.add(key);
                            relevantLinkages.push([s, t]);
                        }
                    }
                });
            }

            const exportData = {
                artifactType,
                project: project?.name || 'Unknown',
                exportDate: new Date().toISOString(),
                count: 1,
                artifacts: [exportArtifact],
                linkages: relevantLinkages
            };

            await navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
            alert('Artifact copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy:', err);
            alert('Failed to copy to clipboard');
        }
    };

    // Paste from Clipboard
    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (!text) return;

            const jsonData = JSON.parse(text);

            // Basic validation
            if (!jsonData.artifacts || !Array.isArray(jsonData.artifacts)) {
                alert('Invalid clipboard content: missing artifacts array');
                return;
            }

            // Pre-process artifacts (same as handleImport)
            const artifactsToImport = jsonData.artifacts.map((a: any) => {
                const { id, aid, created_at, updated_at, project, ...rest } = a;
                const artifact = { ...rest, _originalAid: aid, project_id: projectId };

                // Normalize EARS type
                if (artifact.ears_type) {
                    const type = artifact.ears_type.toLowerCase();
                    if (type === 'event_driven') artifact.ears_type = 'event-driven';
                    else if (type === 'state_driven') artifact.ears_type = 'state-driven';
                    else if (type === 'unwanted_behavior' || type === 'unwanted-behavior') artifact.ears_type = 'unwanted';
                    else if (type === 'optional_feature' || type === 'optional-feature') artifact.ears_type = 'optional';
                    else artifact.ears_type = type.replace('_', '-');
                }

                // Special handling for Requirements: find source_use_case_id from linkages
                if (jsonData.artifactType === 'requirement' && jsonData.linkages) {
                    const linkage = jsonData.linkages.find((l: any[]) => l[0] === aid);
                    if (linkage && linkage[1]) {
                        let ucId = linkage[1];
                        const parts = ucId.split('-');
                        if (parts.length > 4) {
                            ucId = parts.slice(0, 4).join('-');
                        }
                        artifact.source_use_case_id = ucId;
                    }
                }

                return artifact;
            });

            const conflicts: { type: 'Area' | 'Owner', value: string }[] = [];
            const uniqueOwners = new Set<string>();
            const uniqueAreas = new Set<string>();

            artifactsToImport.forEach((a: any) => {
                if (a.area) uniqueAreas.add(a.area);
                if (a.owner) uniqueOwners.add(a.owner);
                if (a.stakeholder) uniqueOwners.add(a.stakeholder);
                if (a.stakeholders && Array.isArray(a.stakeholders)) {
                    a.stakeholders.forEach((s: any) => uniqueOwners.add(s));
                }
                if (a.primary_actor && typeof a.primary_actor === 'string') uniqueOwners.add(a.primary_actor);
            });
            // Check Areas
            if (areas) {
                uniqueAreas.forEach(areaName => {
                    const exists = areas.some((a: any) => a.name === areaName || a.code === areaName);
                    if (!exists) {
                        conflicts.push({ type: 'Area', value: areaName });
                    }
                });
            }

            // Check Owners
            if (owners) {
                const currentOwners = owners; // Capture for closure
                uniqueOwners.forEach(ownerName => {
                    const exists = currentOwners.some((o: any) => o.name === ownerName);
                    if (!exists) {
                        conflicts.push({ type: 'Owner', value: ownerName });
                    }
                });
            }

            if (conflicts.length > 0) {
                setImportConflicts(conflicts);
                setPendingImportData({
                    artifacts: artifactsToImport,
                    linkages: jsonData.linkages || []
                });
                setShowImportModal(true);
            } else {
                importMutation.mutate({
                    artifacts: artifactsToImport,
                    linkages: jsonData.linkages || [],
                    projectId: project?.id || projectId || ''
                });
            }
        } catch (err) {
            console.error('Failed to paste:', err);
            alert('Failed to paste from clipboard: ' + err);
        }
    };

    const handleExportMarkdown = () => {
        if (!artifacts) return;
        let content = `# ${artifactType.charAt(0).toUpperCase() + artifactType.slice(1)} Export\n\n`;
        content += `**Date**: ${new Date().toLocaleDateString()}\n\n---\n\n`;

        artifacts.forEach((a: any) => {
            switch (artifactType) {
                case 'vision':
                    content += `# ${a.title}\n\n`;
                    content += `**Date**: ${new Date(a.created_at).toLocaleDateString()}\n\n`;
                    content += `${a.vision_statement}\n\n---\n\n`;
                    break;
                case 'need':
                    let stakeholderName = a.stakeholder;
                    if (stakeholders) {
                        const sObj = stakeholders.find((s: any) => s.id === a.stakeholder_id || s.id === a.stakeholder || s.name === a.stakeholder);
                        if (sObj) stakeholderName = sObj.name;
                    }
                    content += `## ${a.aid}: ${a.title}\n\n`;
                    content += `**Stakeholder**: ${stakeholderName || '-'} | **Status**: ${a.status || '-'}\n\n`;
                    content += `> ${a.description}\n\n---\n\n`;
                    break;
                case 'use_case':
                    content += `## ${a.aid}: ${a.title}\n\n`;
                    content += `**Description**: ${a.description || '-'}\n\n`;
                    content += `**Primary Actor**: ${a.primary_actor?.name || '-'}\n\n`;

                    content += `### Preconditions\n`;
                    if (a.preconditions && a.preconditions.length > 0) {
                        content += a.preconditions.map((p: any) => `- ${p.text}`).join('\n') + '\n\n';
                    } else {
                        content += '-\n\n';
                    }

                    content += `### Main Flow\n`;
                    if (a.mss && a.mss.length > 0) {
                        content += a.mss.map((step: any) => `${step.step_num}. **${step.actor}**: ${step.description}`).join('\n') + '\n\n';
                    } else {
                        content += '-\n\n';
                    }

                    content += `### Postconditions\n`;
                    if (a.postconditions && a.postconditions.length > 0) {
                        content += a.postconditions.map((p: any) => `- ${p.text}`).join('\n') + '\n\n';
                    } else {
                        content += '-\n\n';
                    }
                    content += `---\n\n`;
                    break;
                case 'requirement':
                    // Resolve owner name
                    let ownerName = a.owner;
                    if (owners) {
                        const ownerObj = owners.find((o: any) => o.id === a.owner || o.name === a.owner);
                        if (ownerObj) ownerName = ownerObj.name;
                    }

                    content += `## ${a.aid}: ${a.short_name}\n\n`;
                    content += `**Owner**: ${ownerName || '-'} | **Status**: ${a.status || '-'} | **Type**: ${a.ears_type || '-'}\n\n`;
                    content += `> ${a.text}\n\n`;
                    if (a.rationale) content += `*Rationale*: ${a.rationale}\n\n`;
                    content += `---\n\n`;
                    break;
            }
        });

        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${artifactType}_export_${new Date().toISOString().split('T')[0]}.md`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleExportWord = () => {
        if (!artifacts) return;
        let content = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head>
                <meta charset="utf-8">
                <title>${artifactType} Export</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; }
                    h1 { color: #2c3e50; border-bottom: 2px solid #eee; padding-bottom: 10px; }
                    h2 { color: #34495e; margin-top: 30px; border-bottom: 1px solid #eee; }
                    h3 { color: #7f8c8d; margin-top: 20px; }
                    .meta { color: #666; font-size: 0.9em; margin-bottom: 15px; font-style: italic; }
                    blockquote { border-left: 4px solid #ddd; padding-left: 15px; color: #555; margin: 15px 0; }
                    ul, ol { margin-bottom: 15px; }
                    li { margin-bottom: 5px; }
                    .rationale { background: #f9f9f9; padding: 10px; border-radius: 4px; font-size: 0.9em; }
                </style>
            </head>
            <body>
            <h1>${artifactType.charAt(0).toUpperCase() + artifactType.slice(1)} Export</h1>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <hr/>
        `;

        artifacts.forEach((a: any) => {
            switch (artifactType) {
                case 'vision':
                    content += `<h1>${a.title}</h1>`;
                    content += `<p><strong>Date:</strong> ${new Date(a.created_at).toLocaleDateString()}</p>`;
                    content += `<p>${a.vision_statement}</p><hr/>`;
                    break;
                case 'need':
                    let stakeholderName = a.stakeholder;
                    if (stakeholders) {
                        const sObj = stakeholders.find((s: any) => s.id === a.stakeholder_id || s.id === a.stakeholder || s.name === a.stakeholder);
                        if (sObj) stakeholderName = sObj.name;
                    }
                    content += `<h2>${a.aid}: ${a.title}</h2>`;
                    content += `<div class="meta"><strong>Stakeholder:</strong> ${stakeholderName || '-'} | <strong>Status:</strong> ${a.status || '-'}</div>`;
                    content += `<blockquote>${a.description}</blockquote><hr/>`;
                    break;
                case 'use_case':
                    content += `<h2>${a.aid}: ${a.title}</h2>`;
                    content += `<p><strong>Description:</strong> ${a.description || '-'}</p>`;
                    content += `<p><strong>Primary Actor:</strong> ${a.primary_actor?.name || '-'}</p>`;

                    content += `<h3>Preconditions</h3><ul>`;
                    if (a.preconditions && a.preconditions.length > 0) {
                        content += a.preconditions.map((p: any) => `<li>${p.text}</li>`).join('');
                    } else {
                        content += `<li>-</li>`;
                    }
                    content += `</ul>`;

                    content += `<h3>Main Flow</h3><ol>`;
                    if (a.mss && a.mss.length > 0) {
                        content += a.mss.map((step: any) => `<li><strong>${step.actor}</strong>: ${step.description}</li>`).join('');
                    } else {
                        content += `<li>-</li>`;
                    }
                    content += `</ol>`;

                    content += `<h3>Postconditions</h3><ul>`;
                    if (a.postconditions && a.postconditions.length > 0) {
                        content += a.postconditions.map((p: any) => `<li>${p.text}</li>`).join('');
                    } else {
                        content += `<li>-</li>`;
                    }
                    content += `</ul><hr/>`;
                    break;
                case 'requirement':
                    // Resolve owner name
                    let ownerName = a.owner;
                    if (owners) {
                        const ownerObj = owners.find((o: any) => o.id === a.owner || o.name === a.owner);
                        if (ownerObj) ownerName = ownerObj.name;
                    }

                    content += `<h2>${a.aid}: ${a.short_name}</h2>`;
                    content += `<div class="meta"><strong>Owner:</strong> ${ownerName || '-'} | <strong>Status:</strong> ${a.status || '-'} | <strong>Type:</strong> ${a.ears_type || '-'}</div>`;
                    content += `<blockquote>${a.text}</blockquote>`;
                    if (a.rationale) content += `<div class="rationale"><strong>Rationale:</strong> ${a.rationale}</div>`;
                    content += `<hr/>`;
                    break;
            }
        });

        content += `</body></html>`;

        const blob = new Blob([content], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${artifactType}_export_${new Date().toISOString().split('T')[0]}.doc`;
        link.click();
        URL.revokeObjectURL(url);
    };

    // Import mutation
    const importMutation = useMutation({
        mutationFn: async (importData: { artifacts: any[], linkages: any[], projectId: string }) => {
            const { artifacts: importedArtifacts, linkages: importedLinkages, projectId: targetProjectId } = importData;
            const results: { success: boolean, artifact?: any, error?: any }[] = [];
            const aidMapping: { [oldAid: string]: string } = {}; // Map old AIDs to new AIDs

            // Pre-fetch metadata for Needs
            const importedOriginalAids = new Set(importedArtifacts.map((a: any) => a._originalAid).filter(Boolean));
            let allSites: any[] = [];
            let allComponents: any[] = [];
            if (artifactType === 'need') {
                try {
                    allSites = await SiteService.listSitesApiV1SitesGet();
                    allComponents = await ComponentService.listComponentsApiV1ComponentsGet();
                } catch (e) {
                    console.error("Failed to fetch sites/components", e);
                }
            }

            // First, create all artifacts
            for (const artifact of importedArtifacts) {
                try {
                    // Store original AID for mapping
                    const originalAid = artifact._originalAid;

                    // Handle Area lookup/creation
                    if (artifact.area) {
                        const areas = await MetadataService.listAreasApiV1MetadataMetadataAreasGet();
                        let areaObj = areas.find((a: any) => a.name === artifact.area || a.code === artifact.area);

                        if (!areaObj) {
                            // Extract area code from original AID if available
                            let areaCode = '';
                            if (artifact._originalAid && typeof artifact._originalAid === 'string') {
                                const aidParts = artifact._originalAid.split('-');
                                if (aidParts.length >= 3) {
                                    areaCode = aidParts[1];
                                }
                            }

                            areaObj = await MetadataService.createAreaApiV1MetadataMetadataAreasPost({
                                code: areaCode || artifact.area.substring(0, 3).toUpperCase(),
                                name: artifact.area,
                                description: ''
                            });
                        }

                        // IMPORTANT: Use the code, not the name
                        if (areaObj) {
                            artifact.area = areaObj.code;
                        }
                    }

                    delete artifact._originalAid;

                    // Ensure project_id is set to the current project
                    artifact.project_id = targetProjectId;
                    if (artifact.project) delete artifact.project;

                    // Handle People (Owner/Stakeholder) lookup/creation
                    if (artifact.owner) {
                        const people = await MetadataService.listPeopleApiV1MetadataMetadataPeopleGet('owner');
                        const existing = people.find((p: any) => p.name === artifact.owner);
                        let ownerId = '';

                        if (existing) {
                            ownerId = existing.id;
                        } else {
                            const newPerson = await MetadataService.createPersonApiV1MetadataMetadataPeoplePost({
                                name: artifact.owner,
                                roles: ['owner'],
                                project_id: targetProjectId,
                                person_type: 'both'
                            });
                            ownerId = newPerson.id;
                        }

                        // For requirements, the field is 'owner' (string ID)
                        // For others, it might be 'owner_id'
                        if (artifactType === 'requirement') {
                            artifact.owner = ownerId;
                        } else {
                            artifact.owner_id = ownerId;
                            delete artifact.owner;
                        }
                    }

                    if (artifact.stakeholder) {
                        const people = await MetadataService.listPeopleApiV1MetadataMetadataPeopleGet('stakeholder');
                        const existing = people.find((p: any) => p.name === artifact.stakeholder);
                        if (existing) {
                            artifact.stakeholder_id = existing.id;
                        } else {
                            const newPerson = await MetadataService.createPersonApiV1MetadataMetadataPeoplePost({
                                name: artifact.stakeholder,
                                roles: ['stakeholder'],
                                project_id: targetProjectId,
                                person_type: 'both'
                            });
                            artifact.stakeholder_id = newPerson.id;
                        }
                        delete artifact.stakeholder;
                    }

                    // Handle Use Case specific imports
                    if (artifactType === 'use_case') {
                        // Convert stakeholders array of names to array of IDs
                        if (artifact.stakeholders && Array.isArray(artifact.stakeholders)) {
                            const stakeholderIds = [];
                            for (const stakeholderName of artifact.stakeholders) {
                                if (typeof stakeholderName === 'string') {
                                    const people = await MetadataService.listPeopleApiV1MetadataMetadataPeopleGet('stakeholder');
                                    let existing = people.find((p: any) => p.name === stakeholderName);
                                    if (!existing) {
                                        existing = await MetadataService.createPersonApiV1MetadataMetadataPeoplePost({
                                            name: stakeholderName,
                                            roles: ['stakeholder'],
                                            project_id: targetProjectId,
                                            person_type: 'both'
                                        });
                                    }
                                    stakeholderIds.push(existing.id);
                                }
                            }
                            artifact.stakeholder_ids = stakeholderIds;
                            delete artifact.stakeholders;
                        }

                        // Convert preconditions array of text to array of IDs
                        if (artifact.preconditions && Array.isArray(artifact.preconditions)) {
                            const allPreconditions = await UseCaseService.listPreconditionsApiV1UseCaseUseCasesPreconditionsGet(artifact.project_id);
                            const preconditionIds = [];
                            for (const preconditionText of artifact.preconditions) {
                                if (typeof preconditionText === 'string') {
                                    // Check if precondition already exists
                                    let existing = allPreconditions.find((p: any) => p.text === preconditionText && p.project_id === artifact.project_id);
                                    if (!existing) {
                                        existing = await UseCaseService.createPreconditionApiV1UseCaseUseCasesPreconditionsPost({
                                            text: preconditionText,
                                            project_id: artifact.project_id
                                        });
                                    }
                                    preconditionIds.push(existing.id);
                                }
                            }
                            artifact.precondition_ids = preconditionIds;
                            delete artifact.preconditions;
                        }

                        // Convert postconditions array of text to array of IDs
                        if (artifact.postconditions && Array.isArray(artifact.postconditions)) {
                            const allPostconditions = await UseCaseService.listPostconditionsApiV1UseCaseUseCasesPostconditionsGet(artifact.project_id);
                            const postconditionIds = [];
                            for (const postconditionText of artifact.postconditions) {
                                if (typeof postconditionText === 'string') {
                                    // Check if postcondition already exists
                                    let existing = allPostconditions.find((p: any) => p.text === postconditionText && p.project_id === artifact.project_id);
                                    if (!existing) {
                                        existing = await UseCaseService.createPostconditionApiV1UseCaseUseCasesPostconditionsPost({
                                            text: postconditionText,
                                            project_id: artifact.project_id
                                        });
                                    }
                                    postconditionIds.push(existing.id);
                                }
                            }
                            artifact.postcondition_ids = postconditionIds;
                            delete artifact.postconditions;
                        }

                        // Convert exceptions to IDs
                        if (artifact.exceptions && Array.isArray(artifact.exceptions)) {
                            const allExceptions = await UseCaseService.listExceptionsApiV1UseCaseUseCasesExceptionsGet(artifact.project_id);
                            const exceptionIds = [];
                            for (const exception of artifact.exceptions) {
                                if (exception.trigger && exception.handling) {
                                    // Check if exception already exists
                                    let existing = allExceptions.find((e: any) =>
                                        e.trigger === exception.trigger &&
                                        e.handling === exception.handling &&
                                        e.project_id === artifact.project_id
                                    );
                                    if (!existing) {
                                        existing = await UseCaseService.createExceptionApiV1UseCaseUseCasesExceptionsPost({
                                            trigger: exception.trigger,
                                            handling: exception.handling,
                                            project_id: artifact.project_id
                                        });
                                    }
                                    exceptionIds.push(existing.id);
                                }
                            }
                            artifact.exception_ids = exceptionIds;
                            delete artifact.exceptions;
                        }

                        // Convert primary_actor name to ID (if it's a string)
                        if (artifact.primary_actor && typeof artifact.primary_actor === 'string') {
                            const people = await MetadataService.listPeopleApiV1MetadataMetadataPeopleGet('both');
                            let existing = people.find((p: any) => p.name === artifact.primary_actor);
                            if (!existing) {
                                existing = await MetadataService.createPersonApiV1MetadataMetadataPeoplePost({
                                    name: artifact.primary_actor,
                                    roles: ['actor'],
                                    project_id: targetProjectId,
                                    person_type: 'both'
                                });
                            }
                            artifact.primary_actor_id = existing.id;
                            delete artifact.primary_actor;
                        }
                    }

                    // Handle Need specific imports
                    if (artifactType === 'need') {
                        // Handle Sites
                        if (artifact.sites && Array.isArray(artifact.sites)) {
                            const siteIds = [];
                            // allSites is already fetched

                            for (const siteName of artifact.sites) {
                                if (typeof siteName === 'string') {
                                    let existing = allSites.find((s: any) => s.name === siteName);
                                    if (!existing) {
                                        existing = await SiteService.createSiteApiV1SitesPost({
                                            name: siteName
                                        });
                                        allSites.push(existing);
                                    }
                                    siteIds.push(existing.id);
                                }
                            }
                            artifact.site_ids = siteIds;
                            delete artifact.sites;
                        }

                        // Handle Components
                        if (artifact.components && Array.isArray(artifact.components)) {
                            const componentIds = [];
                            // allComponents is already fetched

                            for (const compName of artifact.components) {
                                if (typeof compName === 'string') {
                                    let existing = allComponents.find((c: any) => c.name === compName);
                                    if (!existing) {
                                        existing = await ComponentService.createComponentApiV1ComponentsPost({
                                            name: compName,
                                            type: 'Software' // Default type
                                        });
                                        allComponents.push(existing);
                                    }
                                    componentIds.push(existing.id);
                                }
                            }
                            artifact.component_ids = componentIds;
                            delete artifact.components;
                        }
                    }

                    let result;
                    switch (artifactType) {
                        case 'vision':
                            result = await VisionService.createVisionStatementApiV1VisionVisionStatementsPost(artifact);
                            break;
                        case 'need':
                            result = await NeedsService.createNeedApiV1NeedNeedsPost(artifact);
                            break;
                        case 'use_case':
                            result = await UseCaseService.createUseCaseApiV1UseCaseUseCasesPost(artifact);
                            break;
                        case 'requirement':
                            result = await RequirementService.createRequirementApiV1RequirementRequirementsPost(artifact);
                            break;
                    }

                    // Map old AID to new AID
                    if (originalAid && result?.aid) {
                        aidMapping[originalAid] = result.aid;
                    }

                    results.push({ success: true, artifact: result });
                } catch (error) {
                    results.push({ success: false, error, artifact });
                }
            }

            // Then, create linkages using the AID mapping
            const linkageResults: { success: boolean, source: string, target: string, error?: any }[] = [];
            for (const [sourceAid, targetAid] of importedLinkages) {
                try {
                    // VALIDATION: If the source/target was in the import list, it MUST be mapped.
                    // If it was in the import list but NOT in the mapping, it means artifact creation failed.
                    if (importedOriginalAids.has(sourceAid) && !aidMapping[sourceAid]) {
                        console.warn(`Skipping linkage: Source artifact ${sourceAid} failed to import.`);
                        linkageResults.push({ success: false, error: "Source artifact failed to import", source: sourceAid, target: targetAid });
                        continue;
                    }
                    if (importedOriginalAids.has(targetAid) && !aidMapping[targetAid]) {
                        console.warn(`Skipping linkage: Target artifact ${targetAid} failed to import.`);
                        linkageResults.push({ success: false, error: "Target artifact failed to import", source: sourceAid, target: targetAid });
                        continue;
                    }

                    // Map old AIDs to new AIDs
                    const newSourceAid = aidMapping[sourceAid] || sourceAid;
                    const newTargetAid = aidMapping[targetAid] || targetAid;

                    // Determine artifact types from AIDs
                    const sourceType = newSourceAid.includes('-NEED-') ? 'need' :
                        newSourceAid.includes('-UC-') ? 'use_case' :
                            newSourceAid.includes('-REQ-') ? 'requirement' : 'vision';
                    const targetType = newTargetAid.includes('-NEED-') ? 'need' :
                        newTargetAid.includes('-UC-') ? 'use_case' :
                            newTargetAid.includes('-REQ-') ? 'requirement' : 'vision';

                    // Determine relationship type
                    let relationshipType = 'derives_from';
                    if (sourceType === 'need' && targetType === 'vision') {
                        relationshipType = 'derives_from';
                    } else if (sourceType === 'use_case' && targetType === 'need') {
                        relationshipType = 'satisfies';
                    } else if (sourceType === 'requirement' && targetType === 'use_case') {
                        relationshipType = 'satisfies';
                    }

                    await LinkagesService.createLinkageApiV1LinkageLinkagesPost({
                        source_artifact_type: sourceType,
                        source_id: newSourceAid,
                        target_artifact_type: targetType,
                        target_id: newTargetAid,
                        relationship_type: relationshipType,
                        project_id: targetProjectId
                    });
                    linkageResults.push({ success: true, source: newSourceAid, target: newTargetAid });
                } catch (error) {
                    linkageResults.push({ success: false, error, source: sourceAid, target: targetAid });
                }
            }

            return { artifactResults: results, linkageResults };
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: [artifactType, project?.id] });
            queryClient.invalidateQueries({ queryKey: ['linkages'] }); // Invalidate linkages too
            setShowImportModal(false);
            setPendingImportData(null);
            setImportConflicts([]);

            // Show results modal
            setImportResults(data);
            setShowResultsModal(true);

            console.log("Import completed", data);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (aid: string) => {
            switch (artifactType) {
                case 'vision':
                    return VisionService.deleteVisionStatementApiV1VisionVisionStatementsAidDelete(aid);
                case 'need':
                    return NeedsService.deleteNeedApiV1NeedNeedsAidDelete(aid);
                case 'use_case':
                    return UseCaseService.deleteUseCaseApiV1UseCaseUseCasesAidDelete(aid);
                case 'requirement':
                    return RequirementService.deleteRequirementApiV1RequirementRequirementsAidDelete(aid);
                default:
                    throw new Error(`Delete not implemented for ${artifactType}`);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [artifactType, project?.id] });
            queryClient.invalidateQueries({ queryKey: ['linkages'] }); // Invalidate linkages too
        },
    });

    // Handle import confirmation from modal
    const handleImportConfirmation = (resolutions: Map<string, string>) => {
        if (!pendingImportData) return;

        const { artifacts, linkages } = pendingImportData;
        const resolvedArtifacts = artifacts.map(artifact => {
            const newArtifact = { ...artifact };

            // Resolve Area
            if (newArtifact.area) {
                const resolution = resolutions.get(`Area:${newArtifact.area}`);
                if (resolution && resolution !== 'create_new') {
                    newArtifact.area = resolution;
                }
            }

            // Resolve Owner
            if (newArtifact.owner) {
                const resolution = resolutions.get(`Owner:${newArtifact.owner}`);
                if (resolution && resolution !== 'create_new') {
                    newArtifact.owner = resolution;
                }
            }

            return newArtifact;
        });

        importMutation.mutate({
            artifacts: resolvedArtifacts,
            linkages,
            projectId: project?.id || projectId || ''
        });

        setShowImportModal(false);
        setPendingImportData(null);
        setImportConflicts([]);
    };

    // Handle file import
    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const jsonData = JSON.parse(e.target?.result as string);

                // Validate the JSON structure
                if (!jsonData.artifacts || !Array.isArray(jsonData.artifacts)) {
                    alert('Invalid JSON format: missing artifacts array');
                    return;
                }

                if (jsonData.artifactType !== artifactType) {
                    const proceed = confirm(
                        `Warning: This file contains ${jsonData.artifactType} artifacts but you're importing into ${artifactType}. Continue anyway?`
                    );
                    if (!proceed) return;
                }

                // Pre-process artifacts
                const artifactsToImport = jsonData.artifacts.map((a: any) => {
                    const { id, aid, created_at, updated_at, project, ...rest } = a;
                    const artifact = { ...rest, _originalAid: aid, project_id: projectId };

                    // Normalize EARS type
                    if (artifact.ears_type) {
                        const type = artifact.ears_type.toLowerCase();
                        if (type === 'event_driven') artifact.ears_type = 'event-driven';
                        else if (type === 'state_driven') artifact.ears_type = 'state-driven';
                        else if (type === 'unwanted_behavior' || type === 'unwanted-behavior') artifact.ears_type = 'unwanted';
                        else if (type === 'optional_feature' || type === 'optional-feature') artifact.ears_type = 'optional';
                        else artifact.ears_type = type.replace('_', '-');
                    }

                    // Special handling for Requirements: find source_use_case_id from linkages
                    if (jsonData.artifactType === 'requirement' && jsonData.linkages) {
                        const linkage = jsonData.linkages.find((l: any[]) => l[0] === aid);
                        if (linkage && linkage[1]) {
                            let ucId = linkage[1];
                            const parts = ucId.split('-');
                            if (parts.length > 4) {
                                ucId = parts.slice(0, 4).join('-');
                            }
                            artifact.source_use_case_id = ucId;
                        }
                    }

                    return artifact;
                });

                // Detect Conflicts
                const conflicts: { type: 'Area' | 'Owner', value: string }[] = [];
                const uniqueAreas = new Set<string>();
                const uniqueOwners = new Set<string>();

                artifactsToImport.forEach((a: any) => {
                    if (a.area) uniqueAreas.add(a.area);
                    if (a.owner) uniqueOwners.add(a.owner);
                });

                // Check Areas
                if (areas) {
                    uniqueAreas.forEach(areaName => {
                        const exists = areas.some((a: any) => a.name === areaName || a.code === areaName);
                        if (!exists) {
                            conflicts.push({ type: 'Area', value: areaName });
                        }
                    });
                }

                // Check Owners
                if (owners) {
                    uniqueOwners.forEach(ownerName => {
                        const exists = owners.some((o: any) => o.name === ownerName);
                        if (!exists) {
                            conflicts.push({ type: 'Owner', value: ownerName });
                        }
                    });
                }

                if (conflicts.length > 0) {
                    setImportConflicts(conflicts);
                    setPendingImportData({
                        artifacts: artifactsToImport,
                        linkages: jsonData.linkages || []
                    });
                    setShowImportModal(true);
                } else {
                    // No conflicts, proceed directly
                    importMutation.mutate({
                        artifacts: artifactsToImport,
                        linkages: jsonData.linkages || [],
                        projectId: project?.id || projectId || ''
                    });
                }

            } catch (error) {
                alert(`Failed to parse JSON file: ${error}`);
            }
        };
        reader.readAsText(file);

        // Reset input so same file can be selected again
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    if (isLoading) return <div className="p-4">Loading...</div>;

    return (
        <div className="space-y-6">
            {artifactType !== 'vision' && vision && <VisionHeader vision={vision[0]} />}

            <ImportConflictModal
                isOpen={showImportModal}
                conflicts={importConflicts}
                existingAreas={areas || []}
                existingPeople={owners || []}
                onResolve={handleImportConfirmation}
                onCancel={() => {
                    setShowImportModal(false);
                    setPendingImportData(null);
                    setImportConflicts([]);
                }}
            />

            {/* Filters and Actions */}
            <div className="flex justify-between items-center">
                <div className="flex gap-4 items-center">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="px-3 py-2 border rounded w-64"
                    />
                    {artifactType !== 'vision' && (
                        <>
                            <div className="w-64">
                                <MultiSelect
                                    options={areaOptions}
                                    value={area}
                                    onChange={setArea}
                                    placeholder="Filter by Area"
                                />
                            </div>
                            <div className="w-64">
                                <MultiSelect
                                    options={STATUS_OPTIONS}
                                    value={status}
                                    onChange={setStatus}
                                    placeholder="Filter by Status"
                                />
                            </div>
                        </>
                    )}
                </div>

                <div className="flex gap-2">
                    {/* Export Buttons */}
                    <div className="flex gap-1">
                        <button
                            onClick={handleExport}
                            disabled={!artifacts || artifacts.length === 0}
                            className="px-3 py-2 bg-green-600 text-white rounded-l hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                            title="Export JSON"
                        >
                            <Download className="w-4 h-4" />
                            JSON
                        </button>
                        <button
                            onClick={handleExportMarkdown}
                            disabled={!artifacts || artifacts.length === 0}
                            className="px-3 py-2 bg-slate-600 text-white hover:bg-slate-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 border-l border-slate-500"
                            title="Export Markdown"
                        >
                            <FileText className="w-4 h-4" />
                            MD
                        </button>
                        <button
                            onClick={handleExportWord}
                            disabled={!artifacts || artifacts.length === 0}
                            className="px-3 py-2 bg-blue-600 text-white rounded-r hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                            title="Export Word"
                        >
                            <File className="w-4 h-4" />
                            DOC
                        </button>
                    </div>

                    {/* Import Button */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={importMutation.isPending}
                        className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                        title="Import artifacts from JSON"
                    >
                        <Upload className="w-4 h-4" />
                        {importMutation.isPending ? 'Importing...' : 'Import JSON'}
                    </button>
                    <button
                        onClick={handlePaste}
                        disabled={importMutation.isPending}
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                        title="Paste artifact from clipboard"
                    >
                        <Clipboard className="w-4 h-4" />
                        Paste
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleImport}
                        className="hidden"
                    />

                    {/* Bulk Delete Button - only show when items are selected */}
                    {selectedItems.length > 0 && (
                        <button
                            onClick={() => {
                                setConfirmation({
                                    isOpen: true,
                                    title: 'Delete Selected Artifacts',
                                    message: `Are you sure you want to delete ${selectedItems.length} selected item(s)? This action cannot be undone.`,
                                    isDestructive: true,
                                    onConfirm: async () => {
                                        for (const aid of selectedItems) {
                                            await deleteMutation.mutateAsync(aid);
                                        }
                                        setSelectedItems([]);
                                    }
                                });
                            }}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center gap-2"
                            title={`Delete ${selectedItems.length} selected item(s)`}
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete Selected ({selectedItems.length})
                        </button>
                    )}

                    {/* Create New Button */}
                    <Link
                        to={`/project/${projectId}/${artifactType}/create`}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                        Create New {artifactType.replace('_', ' ')}
                    </Link>
                </div>
            </div>

            {/* List */}
            <div className="bg-white border rounded-md shadow-sm">
                {/* Header Row */}
                <div className="grid grid-cols-12 gap-4 p-3 border-b bg-slate-50 font-medium text-slate-700">
                    <div className="col-span-1 flex items-center">
                        <input
                            type="checkbox"
                            checked={selectedItems.length === artifacts?.length && artifacts?.length > 0}
                            onChange={(e) => {
                                if (e.target.checked) {
                                    setSelectedItems(artifacts?.map((a: any) => a.aid) || []);
                                } else {
                                    setSelectedItems([]);
                                }
                            }}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                    </div>
                    <div className="col-span-2">Artifact ID</div>
                    <div className="col-span-3">Title / Name</div>
                    <div className="col-span-4">Description</div>
                    <div className="col-span-1">Status</div>
                    <div className="col-span-1 text-right">Actions</div>
                </div>

                <ul className="divide-y divide-slate-100">
                    {artifacts?.map((a: any) => (
                        <li key={a.aid} className="hover:bg-slate-50 transition-colors">
                            <div className="grid grid-cols-12 gap-4 p-3 items-center">
                                {/* Checkbox */}
                                <div className="col-span-1 flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.includes(a.aid)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedItems([...selectedItems, a.aid]);
                                            } else {
                                                setSelectedItems(selectedItems.filter(id => id !== a.aid));
                                            }
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                </div>

                                {/* Artifact ID */}
                                <Link
                                    to={`/project/${projectId}/${artifactType}/${a.aid}`}
                                    className="col-span-2 font-mono text-sm text-slate-600 truncate hover:text-blue-600"
                                    title={a.aid}
                                >
                                    {a.aid}
                                </Link>

                                {/* Title / Short Name */}
                                <Link
                                    to={`/project/${projectId}/${artifactType}/${a.aid}`}
                                    className="col-span-3 font-medium text-blue-600 hover:underline flex items-center gap-2 min-w-0"
                                    title={a.title || a.short_name}
                                >
                                    <span className="truncate">{a.title || a.short_name || '-'}</span>
                                    {artifactType === 'requirement' && a.ears_type && (
                                        <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${a.ears_type === 'ubiquitous' ? 'bg-gray-100 text-gray-800' :
                                            a.ears_type === 'event-driven' ? 'bg-blue-100 text-blue-800' :
                                                a.ears_type === 'state-driven' ? 'bg-purple-100 text-purple-800' :
                                                    a.ears_type === 'unwanted' ? 'bg-red-100 text-red-800' :
                                                        'bg-green-100 text-green-800'
                                            }`}>
                                            {a.ears_type}
                                        </span>
                                    )}
                                </Link>

                                {/* Description / Text */}
                                <Link
                                    to={`/project/${projectId}/${artifactType}/${a.aid}`}
                                    className="col-span-4 text-sm text-slate-600 truncate"
                                    title={a.description || a.text}
                                >
                                    {a.description || a.text || '-'}
                                </Link>

                                {/* Status */}
                                <div className="col-span-1">
                                    {a.status ? (
                                        <span className={`text-xs px-2 py-1 rounded-full inline-block whitespace-nowrap ${a.status === 'base_lined' ? 'bg-green-100 text-green-800' :
                                            a.status === 'verified' ? 'bg-blue-100 text-blue-800' :
                                                a.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-800'
                                            }`}>
                                            {a.status}
                                        </span>
                                    ) : (
                                        <span className="text-xs text-slate-400">-</span>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="col-span-1 flex justify-end gap-1">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            // Export single item
                                            const exportArtifact = prepareArtifactForExport(a);
                                            // Collect relevant linkages
                                            const relevantLinkages: string[][] = [];
                                            if (linkages) {
                                                const aid = a.aid;
                                                linkages.forEach((l: any) => {
                                                    // Check if this linkage involves the exported artifact
                                                    if (l.source_id === aid || l.target_id === aid) {
                                                        relevantLinkages.push([l.source_id, l.target_id]);
                                                    }
                                                });
                                            }

                                            const exportData = {
                                                artifactType,
                                                project: project?.name || 'Unknown',
                                                exportDate: new Date().toISOString(),
                                                count: 1,
                                                artifacts: [exportArtifact],
                                                linkages: relevantLinkages
                                            };
                                            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                                            const url = URL.createObjectURL(blob);
                                            const link = document.createElement('a');
                                            link.href = url;
                                            link.download = `${artifactType}_${a.aid}_${new Date().toISOString().split('T')[0]}.json`;
                                            link.click();
                                            URL.revokeObjectURL(url);
                                        }}
                                        className="p-1 text-slate-400 hover:text-green-600 transition-colors rounded hover:bg-green-50"
                                        title="Export this item"
                                    >
                                        <FileDown className="w-4 h-4" />
                                    </button>
                                    <Link
                                        to={`/project/${projectId}/${artifactType}/${a.aid}`}
                                        className="p-1 text-slate-400 hover:text-blue-600 transition-colors rounded hover:bg-blue-50"
                                        title="Edit"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Link>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            // Duplicate: Navigate to create page with data
                                            const duplicateData = { ...a };
                                            // Remove ID and system fields to ensure it's treated as new
                                            delete duplicateData.id;
                                            delete duplicateData.aid;
                                            delete duplicateData.created_at;
                                            delete duplicateData.updated_at;
                                            delete duplicateData.created_by;
                                            delete duplicateData.updated_by;

                                            navigate(`/project/${projectId}/${artifactType}/create`, {
                                                state: { duplicateData }
                                            });
                                        }}
                                        className="p-1 text-slate-400 hover:text-cyan-600 transition-colors rounded hover:bg-cyan-50"
                                        title="Duplicate"
                                    >
                                        <Files className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            handleCopy(a);
                                        }}
                                        className="p-1 text-slate-400 hover:text-indigo-600 transition-colors rounded hover:bg-indigo-50"
                                        title="Copy to clipboard"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            e.preventDefault();
                                            setConfirmation({
                                                isOpen: true,
                                                title: 'Delete Artifact',
                                                message: `Are you sure you want to delete ${a.aid}? This action cannot be undone.`,
                                                isDestructive: true,
                                                onConfirm: () => deleteMutation.mutate(a.aid)
                                            });
                                        }}
                                        className="p-1 text-slate-400 hover:text-red-600 transition-colors rounded hover:bg-red-50"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
                {artifacts?.length === 0 && (
                    <div className="p-8 text-center text-slate-400 italic">
                        No {artifactType.replace('_', ' ')}s found.
                    </div>
                )}
            </div>
            {/* Import Results Modal */}
            {showResultsModal && importResults && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">Import Results</h2>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-slate-50 p-4 rounded border border-slate-200">
                                <h3 className="font-semibold mb-2">Artifacts</h3>
                                <div className="text-sm">
                                    <p>Total: {importResults.artifactResults.length}</p>
                                    <p className="text-green-600">Success: {importResults.artifactResults.filter(r => r.success).length}</p>
                                    <p className="text-red-600">Failed: {importResults.artifactResults.filter(r => !r.success).length}</p>
                                </div>
                            </div>
                            <div className="bg-slate-50 p-4 rounded border border-slate-200">
                                <h3 className="font-semibold mb-2">Linkages</h3>
                                <div className="text-sm">
                                    <p>Total: {importResults.linkageResults.length}</p>
                                    <p className="text-green-600">Success: {importResults.linkageResults.filter(r => r.success).length}</p>
                                    <p className="text-red-600">Failed: {importResults.linkageResults.filter(r => !r.success).length}</p>
                                </div>
                            </div>
                        </div>

                        {/* Failures List */}
                        {(importResults.artifactResults.some(r => !r.success) || importResults.linkageResults.some(r => !r.success)) && (
                            <div className="mb-6">
                                <h3 className="font-semibold mb-2 text-red-600">Failures</h3>
                                <div className="bg-red-50 p-4 rounded border border-red-100 text-sm max-h-40 overflow-y-auto">
                                    {importResults.artifactResults.filter(r => !r.success).map((r, i) => (
                                        <div key={`art-fail-${i}`} className="mb-1">
                                            <span className="font-medium">Artifact:</span> {JSON.stringify(r.error)}
                                        </div>
                                    ))}
                                    {importResults.linkageResults.filter(r => !r.success).map((r, i) => (
                                        <div key={`link-fail-${i}`} className="mb-1">
                                            <span className="font-medium">Linkage ({r.source} -&gt; {r.target}):</span> {typeof r.error === 'object' ? JSON.stringify(r.error) : String(r.error)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowResultsModal(false)}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={confirmation.isOpen}
                onClose={() => setConfirmation(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmation.onConfirm}
                title={confirmation.title}
                message={confirmation.message}
                isDestructive={confirmation.isDestructive}
                confirmLabel="Delete"
            />
        </div>
    );
}
