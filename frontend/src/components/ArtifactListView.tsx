import { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { VisionService, NeedsService, UseCaseService, RequirementService, MetadataService, ProjectsService, LinkagesService, SiteService, ComponentService } from '../client';
import VisionHeader from './VisionHeader';
import ImportConflictModal from './ImportConflictModal';
import axios from 'axios';
import { Download, Upload, Trash2, Edit, FileDown, Copy, Clipboard, Files, ArrowUp, ArrowDown, Filter, FilterX, RotateCcw, Search } from 'lucide-react';
import { marked } from 'marked';
import mermaid from 'mermaid';
import * as htmlToImage from 'html-to-image';
import { generateSequenceDiagram, generateStateDiagram, getPlantUMLImageUrl } from '../utils/plantuml';
import { ConfirmationModal } from './ConfirmationModal';
import MarkdownDisplay from './MarkdownDisplay';

interface ArtifactListViewProps {
    artifactType: 'vision' | 'need' | 'use_case' | 'requirement' | 'actor' | 'stakeholder' | 'area' | 'document';
}



export function ArtifactListView({ artifactType }: ArtifactListViewProps) {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

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
    const canEdit = userRoles.includes('admin') || userRoles.includes(`${rolePrefix}_edit`);
    const canDelete = userRoles.includes('admin') || userRoles.includes(`${rolePrefix}_delete`);
    const canCreate = userRoles.includes('admin') || userRoles.includes(`${rolePrefix}_create`);

    // --- Resizable Columns State & Logic ---
    const getDefaultColumnWidths = (type: string): Record<string, number> => {
        const base = {
            checkbox: 40,
            aid: 180,
            title: 200,
            status: 100,
            actions: 100
        };

        if (type === 'vision' || type === 'document') {
            return { ...base, description: 400 };
        }
        return { ...base, area: 80, description: 300 };
    };

    const getStorageKeyForWidths = () => `column-widths-${projectId}-${artifactType}`;

    // Initialize state with defaults or stored values
    const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
        try {
            if (projectId && artifactType) {
                const stored = sessionStorage.getItem(`column-widths-${projectId}-${artifactType}`);
                if (stored) return JSON.parse(stored);
            }
        } catch (e) {
            console.error('Failed to load column widths:', e);
        }
        return getDefaultColumnWidths(artifactType);
    });

    const [resizingColumn, setResizingColumn] = useState<string | null>(null);
    const [resizeStartX, setResizeStartX] = useState(0);
    const [resizeStartWidth, setResizeStartWidth] = useState(0);

    // Initialize mermaid
    useEffect(() => {
        mermaid.initialize({ startOnLoad: false });
    }, []);

    // Update widths when artifact type changes, if not found in storage
    useEffect(() => {
        try {
            const key = getStorageKeyForWidths();
            const stored = sessionStorage.getItem(key);
            if (stored) {
                setColumnWidths(JSON.parse(stored));
            } else {
                setColumnWidths(getDefaultColumnWidths(artifactType));
            }
        } catch (e) {
            console.error('Failed to load column widths:', e);
        }
    }, [projectId, artifactType]);

    // Save widths to storage
    useEffect(() => {
        if (!projectId || !artifactType) return;
        try {
            sessionStorage.setItem(getStorageKeyForWidths(), JSON.stringify(columnWidths));
        } catch (e) {
            console.error('Failed to save column widths:', e);
        }
    }, [columnWidths, projectId, artifactType]);

    // Resize Handlers
    const handleResizeStart = (columnKey: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setResizingColumn(columnKey);
        setResizeStartX(e.clientX);
        setResizeStartWidth(columnWidths[columnKey] || 100);
    };

    const handleResizeMove = (e: MouseEvent) => {
        if (!resizingColumn) return;

        const delta = e.clientX - resizeStartX;
        const newWidth = Math.max(50, resizeStartWidth + delta); // Min 50px

        setColumnWidths(prev => ({
            ...prev,
            [resizingColumn]: newWidth
        }));
    };

    const handleResizeEnd = () => {
        setResizingColumn(null);
        document.body.style.cursor = 'default';
    };

    // Global listeners for resize
    useEffect(() => {
        if (resizingColumn) {
            document.addEventListener('mousemove', handleResizeMove);
            document.addEventListener('mouseup', handleResizeEnd);
            document.body.style.cursor = 'col-resize';
            return () => {
                document.removeEventListener('mousemove', handleResizeMove);
                document.removeEventListener('mouseup', handleResizeEnd);
                document.body.style.cursor = 'default';
            };
        }
    }, [resizingColumn]); // eslint-disable-next-line react-hooks/exhaustive-deps

    const resetColumnWidths = () => {
        setColumnWidths(getDefaultColumnWidths(artifactType));
    };

    const getGridTemplate = () => {
        const cols = [];
        // Checkbox
        cols.push(`${columnWidths.checkbox || 40}px`);

        // Area (if applicable)
        if (artifactType !== 'vision' && artifactType !== 'document') {
            cols.push(`${columnWidths.area || 80}px`);
        }

        cols.push(`${columnWidths.aid || 180}px`);
        cols.push(`${columnWidths.title || 200}px`);
        cols.push(`minmax(${columnWidths.description || 300}px, 1fr)`); // Make description take remaining space but respect user width as min
        cols.push(`${columnWidths.status || 100}px`);
        cols.push(`${columnWidths.actions || 100}px`);

        return cols.join(' ');
    };

    // Helper component for resize handle
    const ResizeHandle = ({ columnKey }: { columnKey: string }) => (
        <div
            className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-400 opacity-0 hover:opacity-100 transition-opacity z-10 flex flex-col justify-center items-center group"
            onMouseDown={(e) => handleResizeStart(columnKey, e)}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="w-0.5 h-full bg-blue-300 group-hover:bg-blue-500" />
        </div>
    );


    // Load filters from sessionStorage on mount
    const getStorageKey = () => `artifact-filters-${projectId}-${artifactType}`;

    const loadFiltersFromStorage = () => {
        try {
            const stored = sessionStorage.getItem(getStorageKey());
            if (stored) {
                const parsed = JSON.parse(stored);
                return {
                    search: parsed.search || '',
                    sortConfig: parsed.sortConfig || { key: null, direction: null },
                    columnFilters: parsed.columnFilters || {}
                };
            }
        } catch (e) {
            console.error('Failed to load filters:', e);
        }
        return { search: '', sortConfig: { key: null, direction: null }, columnFilters: {} };
    };

    const initialFilters = loadFiltersFromStorage();
    const [search, setSearch] = useState(initialFilters.search);
    const [debouncedSearch, setDebouncedSearch] = useState(initialFilters.search);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' | null }>(initialFilters.sortConfig);
    const [activeFilterDropdown, setActiveFilterDropdown] = useState<string | null>(null);
    const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>(initialFilters.columnFilters);
    const [pendingFilters, setPendingFilters] = useState<Record<string, string[]>>(initialFilters.columnFilters);



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

    // Load filters from sessionStorage when projectId or artifactType changes
    useEffect(() => {
        if (!projectId || !artifactType) return;

        try {
            const stored = sessionStorage.getItem(getStorageKey());
            if (stored) {
                const parsed = JSON.parse(stored);
                setSearch(parsed.search || '');
                setDebouncedSearch(parsed.search || '');
                setSortConfig(parsed.sortConfig || { key: null, direction: null });
                setColumnFilters(parsed.columnFilters || {});
            } else {
                // Reset to defaults if no stored filters for this artifact type
                setSearch('');
                setDebouncedSearch('');
                setSortConfig({ key: null, direction: null });
                setColumnFilters({});
            }
        } catch (e) {
            console.error('Failed to load filters:', e);
        }
    }, [projectId, artifactType]);

    // Save filters to sessionStorage whenever they change
    useEffect(() => {
        if (!projectId || !artifactType) return;

        try {
            sessionStorage.setItem(getStorageKey(), JSON.stringify({
                search,
                sortConfig,
                columnFilters
            }));
        } catch (e) {
            console.error('Failed to save filters:', e);
        }
    }, [search, sortConfig, columnFilters, projectId, artifactType]);

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
        queryKey: ['areas', project?.id],
        queryFn: () => MetadataService.listAreasApiV1MetadataMetadataAreasGet(project?.id),
    });



    // Dynamic fetch based on artifact type
    const { data: artifacts, isLoading } = useQuery({
        queryKey: [artifactType, project?.id, debouncedSearch],
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
                        undefined,
                        undefined,
                        undefined,
                        debouncedSearch || undefined,
                        false
                    );
                case 'use_case':
                    return UseCaseService.listUseCasesApiV1UseCaseUseCasesGet(
                        project.id,
                        undefined,
                        undefined,
                        undefined,
                        debouncedSearch || undefined,
                        false
                    );
                case 'requirement':
                    return RequirementService.listRequirementsApiV1RequirementRequirementsGet(
                        project.id,
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        debouncedSearch || undefined,
                        false
                    );
                case 'document':
                    // Manual fetch until client is regenerated
                    const params = new URLSearchParams();
                    params.append('project_id', project.id);
                    if (debouncedSearch) params.append('search', debouncedSearch);
                    const res = await fetch(`/api/v1/documents/?${params.toString()}`);
                    if (!res.ok) throw new Error('Failed to fetch documents');
                    return res.json();
                default:
                    return [];
            }
        },
        enabled: !!project?.id,
    });



    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' | null = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = null;
        }
        setSortConfig({ key: direction ? key : null, direction });
    };

    const filteredResults = useMemo(() => {
        if (!artifacts) return [];

        // Apply column filters first
        let filtered = artifacts.filter((a: any) => {
            return Object.entries(columnFilters).every(([key, values]) => {
                if (!values || values.length === 0) return true;

                let itemValue = a[key];
                if (key === 'title') {
                    itemValue = a.title || a.short_name || '';
                } else if (key === 'description') {
                    itemValue = a.description || a.text || '';
                }

                return values.includes(itemValue);
            });
        });

        // Then apply sorting
        if (!sortConfig.key || !sortConfig.direction) return filtered;

        return [...filtered].sort((a: any, b: any) => {
            let aValue = a[sortConfig.key!];
            let bValue = b[sortConfig.key!];

            // Normalize for specific columns
            if (sortConfig.key === 'title') {
                aValue = a.title || a.short_name || '';
                bValue = b.title || b.short_name || '';
            } else if (sortConfig.key === 'description') {
                aValue = a.description || a.text || '';
                bValue = b.description || b.text || '';
            }

            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }, [artifacts, columnFilters, sortConfig]);

    const filteredAids = useMemo(() => filteredResults.map((a: any) => a.aid), [filteredResults]);

    const getUniqueValuesForColumn = (key: string): string[] => {
        if (!artifacts) return [];
        const values = artifacts.map((a: any) => {
            if (key === 'title') return a.title || a.short_name || '';
            if (key === 'description') return a.description || a.text || '';
            return a[key] || '';
        });
        // We do NOT sort here because users want the filter options to appear 
        // in the same logical order as the artifacts in the table (usually by Artifact ID).
        return [...new Set(values)].filter(v => v) as string[];
    };



    // ...



    const toggleFilter = (key: string, value: string) => {
        setPendingFilters(prev => {
            const current = prev[key] || [];
            const updated = current.includes(value)
                ? current.filter(v => v !== value)
                : [...current, value];
            return { ...prev, [key]: updated };
        });
    };

    const clearColumnFilter = (key: string) => {
        const update = (prev: Record<string, string[]>) => {
            const updated = { ...prev };
            delete updated[key];
            return updated;
        };
        setPendingFilters(prev => {
            const newState = update(prev);
            setColumnFilters(newState); // Immediate apply for clear
            return newState;
        });
    };

    // Clear all filters
    const clearAllFilters = () => {
        setSearch('');
        setDebouncedSearch('');
        setSortConfig({ key: null, direction: null });
        setColumnFilters({});
        setPendingFilters({});
    };

    // Close filter dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            if (activeFilterDropdown) {
                setColumnFilters(pendingFilters);
                setActiveFilterDropdown(null);
            }
        };

        if (activeFilterDropdown) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [activeFilterDropdown, pendingFilters]);

    // Get filtered AIDs for presentation mode navigation
    const getFilteredAIDs = () => filteredAids;

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

    const { data: diagrams } = useQuery({
        queryKey: ['diagrams', project?.id],
        queryFn: async () => {
            const res = await axios.get(`/api/v1/projects/${project?.id}/diagrams`);
            return res.data;
        },
        enabled: !!project?.id
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
                exportItem.sites = exportItem.sites.map((s: any) => ({
                    name: s.name,
                    security_domain: s.security_domain,
                    tags: s.tags || []
                }));
            } else if (exportItem.site_ids && allSites) {
                exportItem.sites = exportItem.site_ids.map((id: string) => {
                    const site = allSites.find((s: any) => s.id === id) as any;
                    return site ? {
                        name: site.name,
                        security_domain: site.security_domain,
                        tags: site.tags || []
                    } : { name: id };
                });
                delete exportItem.site_ids;
            }

            if (exportItem.components && Array.isArray(exportItem.components)) {
                // Export detailed component info including tags
                exportItem.components = exportItem.components.map((c: any) => ({
                    name: c.name,
                    tags: c.tags || [],
                    type: c.type,
                    lifecycle: c.lifecycle
                }));
            } else if (exportItem.component_ids && allComponents) {
                exportItem.components = exportItem.component_ids.map((id: string) => {
                    const comp = allComponents.find((c: any) => c.id === id) as any;
                    return comp ? {
                        name: comp.name,
                        tags: comp.tags || [],
                        type: comp.type,
                        lifecycle: comp.lifecycle
                    } : { name: id };
                });
                delete exportItem.component_ids;
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
        // Keep AID as it is the human readable identifier
        // delete exportItem.aid; 

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

    const handleExport = () => {
        const artifactsToExport = filteredResults;
        if (!artifactsToExport || artifactsToExport.length === 0) {
            alert('No artifacts to export matching current filters');
            return;
        }
        const exportArtifacts = artifactsToExport.map(prepareArtifactForExport);

        // Collect relevant linkages
        const relevantLinkages: string[][] = [];
        const uniqueLinkages = new Set<string>();

        // Create lookup for Diagrams (UUID -> Name)
        const diagramMap = new Map<string, string>();
        if (diagrams) {
            diagrams.forEach((d: any) => {
                diagramMap.set(d.id, d.name);
            });
        }

        if (linkages) {
            const artifactIds = new Set(artifacts.map((a: any) => a.aid));
            linkages.forEach((l: any) => {
                // Check if this linkage involves any of the exported artifacts
                if (artifactIds.has(l.source_id) || artifactIds.has(l.target_id)) {
                    let s = l.source_id.trim();
                    let t = l.target_id.trim();

                    // Resolve Diagram UUIDs to Names
                    if (diagramMap.has(s)) s = diagramMap.get(s)!;
                    if (diagramMap.has(t)) t = diagramMap.get(t)!;

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

            // Create lookup for Diagrams (UUID -> Name)
            const diagramMap = new Map<string, string>();
            if (diagrams) {
                diagrams.forEach((d: any) => {
                    diagramMap.set(d.id, d.name);
                });
            }

            if (linkages) {
                const aid = artifact.aid;
                linkages.forEach((l: any) => {
                    if (l.source_id === aid || l.target_id === aid) {
                        let s = l.source_id.trim();
                        let t = l.target_id.trim();

                        // Resolve Diagram UUIDs to Names
                        if (diagramMap.has(s)) s = diagramMap.get(s)!;
                        if (diagramMap.has(t)) t = diagramMap.get(t)!;

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


    const importMutation = useMutation({
        mutationFn: async (importData: { artifacts: any[], linkages: any[], projectId: string }) => {
            const { artifacts: importedArtifacts, linkages: importedLinkages, projectId: targetProjectId } = importData;
            const results: { success: boolean, artifact?: any, error?: any }[] = [];
            const aidMapping: { [oldAid: string]: string } = {}; // Map old AIDs to new AIDs

            // Pre-fetch metadata for Needs
            const importedOriginalAids = new Set(importedArtifacts.map((a: any) => a._originalAid).filter(Boolean));
            let allSites: any[] = [];
            let allComponents: any[] = [];
            let allPeople: any[] = [];

            try {
                // Fetch people once to prevent duplicates
                allPeople = await MetadataService.listPeopleApiV1MetadataMetadataPeopleGet(targetProjectId);

                if (artifactType === 'need') {
                    allSites = await SiteService.listSitesApiV1SitesGet();
                    allComponents = await ComponentService.listComponentsApiV1ComponentsGet();
                }
            } catch (e) {
                console.error("Failed to fetch metadata", e);
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
                        const cleanName = String(artifact.owner).trim();
                        // Case-insensitive check
                        const existing = allPeople.find((p: any) => p.name.toLowerCase() === cleanName.toLowerCase());
                        let ownerId = '';

                        if (existing) {
                            ownerId = existing.id;
                        } else {
                            const newPerson = await MetadataService.createPersonApiV1MetadataMetadataPeoplePost({
                                name: cleanName,
                                roles: ['owner'],
                                project_id: targetProjectId,
                                person_type: 'both'
                            });
                            ownerId = newPerson.id;
                            allPeople.push(newPerson); // Update local cache
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
                        const cleanName = String(artifact.stakeholder).trim();
                        const existing = allPeople.find((p: any) => p.name.toLowerCase() === cleanName.toLowerCase());

                        if (existing) {
                            artifact.stakeholder_id = existing.id;
                        } else {
                            const newPerson = await MetadataService.createPersonApiV1MetadataMetadataPeoplePost({
                                name: cleanName,
                                roles: ['stakeholder'],
                                project_id: targetProjectId,
                                person_type: 'both'
                            });
                            artifact.stakeholder_id = newPerson.id;
                            allPeople.push(newPerson); // Update local cache
                        }
                        delete artifact.stakeholder;
                    }

                    // Handle Use Case specific imports
                    if (artifactType === 'use_case') {
                        // allPeople is already fetched and cached above


                        // Convert stakeholders array of names to array of IDs
                        if (artifact.stakeholders && Array.isArray(artifact.stakeholders)) {
                            const stakeholderIds = [];
                            for (const stakeholderName of artifact.stakeholders) {
                                if (typeof stakeholderName === 'string') {
                                    // Check if person already exists
                                    let existing = allPeople.find((p: any) => p.name === stakeholderName);
                                    if (!existing) {
                                        // Create new person
                                        existing = await MetadataService.createPersonApiV1MetadataMetadataPeoplePost({
                                            name: stakeholderName,
                                            roles: ['stakeholder'],
                                            project_id: targetProjectId,
                                            person_type: 'both'
                                        });
                                        allPeople.push(existing); // Add to cache
                                    } else if (!(existing as any).roles?.includes('stakeholder')) {
                                        // Update roles if stakeholder role is missing
                                        const updatedRoles = [...((existing as any).roles || []), 'stakeholder'];
                                        await MetadataService.updatePersonApiV1MetadataMetadataPeoplePersonIdPut(existing.id, {
                                            ...(existing as any),
                                            roles: updatedRoles
                                        } as any);
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

                        // Handle primary_actor name to ID (if it's a string)
                        if (artifact.primary_actor && typeof artifact.primary_actor === 'string') {
                            // Reuse allPeople if available, otherwise fetch
                            const people = allPeople || await MetadataService.listPeopleApiV1MetadataMetadataPeopleGet(targetProjectId);
                            let existing = people.find((p: any) => p.name === artifact.primary_actor);
                            if (!existing) {
                                existing = await MetadataService.createPersonApiV1MetadataMetadataPeoplePost({
                                    name: artifact.primary_actor,
                                    roles: ['actor'],
                                    project_id: targetProjectId,
                                    person_type: 'both'
                                });
                                if (allPeople) allPeople.push(existing);
                            } else if (!(existing as any).roles?.includes('actor')) {
                                // Update roles if actor role is missing
                                const updatedRoles = [...((existing as any).roles || []), 'actor'];
                                await MetadataService.updatePersonApiV1MetadataMetadataPeoplePersonIdPut(existing.id, {
                                    ...(existing as any),
                                    roles: updatedRoles
                                } as any);
                            }
                            artifact.primary_actor_id = existing.id;
                            delete artifact.primary_actor;
                        }

                        // Handle MSS steps - convert actor names to IDs
                        if (artifact.mss && Array.isArray(artifact.mss)) {
                            const people = allPeople || await MetadataService.listPeopleApiV1MetadataMetadataPeopleGet(targetProjectId);
                            for (const step of artifact.mss) {
                                if (step.actor && typeof step.actor === 'string') {
                                    // Check if person exists
                                    let existing = people.find((p: any) => p.name === step.actor);
                                    if (!existing) {
                                        // Create new person with actor role
                                        existing = await MetadataService.createPersonApiV1MetadataMetadataPeoplePost({
                                            name: step.actor,
                                            roles: ['actor'],
                                            project_id: targetProjectId,
                                            person_type: 'both'
                                        });
                                        people.push(existing);
                                    } else if (!(existing as any).roles?.includes('actor')) {
                                        // Update roles if actor role is missing
                                        const updatedRoles = [...((existing as any).roles || []), 'actor'];
                                        await MetadataService.updatePersonApiV1MetadataMetadataPeoplePersonIdPut(existing.id, {
                                            ...(existing as any),
                                            roles: updatedRoles
                                        } as any);
                                    }
                                    // Add actor_id but keep actor field for backend compatibility
                                    step.actor_id = existing.id;
                                }
                            }
                        }
                    }

                    // Handle Need specific imports
                    if (artifactType === 'need') {
                        // Handle Sites
                        if (artifact.sites && Array.isArray(artifact.sites)) {
                            const siteIds = [];
                            // allSites is already fetched

                            for (const siteItem of artifact.sites) {
                                let siteName = '';
                                let siteData: any = {};

                                if (typeof siteItem === 'string') {
                                    siteName = siteItem;
                                    siteData = { name: siteName };
                                } else if (typeof siteItem === 'object' && siteItem.name) {
                                    siteName = siteItem.name;
                                    siteData = siteItem;
                                }

                                if (siteName) {
                                    let existing = allSites.find((s: any) => s.name === siteName);
                                    if (!existing) {
                                        existing = await SiteService.createSiteApiV1SitesPost({
                                            name: siteName,
                                            security_domain: siteData.security_domain,
                                            tags: siteData.tags || []
                                        } as any);
                                        // Update local cache
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

                            for (const compItem of artifact.components) {
                                let compName = '';
                                let compData: any = {};

                                if (typeof compItem === 'string') {
                                    compName = compItem;
                                    compData = { name: compName, type: 'Software' };
                                } else if (typeof compItem === 'object' && compItem.name) {
                                    compName = compItem.name;
                                    compData = compItem;
                                }

                                if (compName) {
                                    // First try exact name match
                                    let existing = allComponents.find((c: any) => c.name === compName);

                                    // If not found, create new component
                                    if (!existing) {
                                        existing = await ComponentService.createComponentApiV1ComponentsPost({
                                            name: compName,
                                            type: compData.type || 'Software',
                                            lifecycle: compData.lifecycle || 'Active',
                                            tags: compData.tags || []
                                        } as any);
                                        allComponents.push(existing);
                                    }
                                    componentIds.push(existing.id);
                                }
                            }
                            artifact.component_ids = componentIds;
                            delete artifact.components;
                        }

                        // Handle Owner (convert name to ID)
                        if (artifact.owner && typeof artifact.owner === 'string') {
                            const people = await MetadataService.listPeopleApiV1MetadataMetadataPeopleGet(targetProjectId);
                            let existing = people.find((p: any) => p.name === artifact.owner);
                            if (!existing) {
                                existing = await MetadataService.createPersonApiV1MetadataMetadataPeoplePost({
                                    name: artifact.owner,
                                    roles: ['owner'],
                                    project_id: targetProjectId,
                                    person_type: 'both'
                                });
                            }
                            artifact.owner_id = existing.id;
                            delete artifact.owner;
                        }

                        // Handle Stakeholder (convert name to ID)
                        if (artifact.stakeholder && typeof artifact.stakeholder === 'string') {
                            const people = await MetadataService.listPeopleApiV1MetadataMetadataPeopleGet(targetProjectId);
                            let existing = people.find((p: any) => p.name === artifact.stakeholder);
                            if (!existing) {
                                existing = await MetadataService.createPersonApiV1MetadataMetadataPeoplePost({
                                    name: artifact.stakeholder,
                                    roles: ['stakeholder'],
                                    project_id: targetProjectId,
                                    person_type: 'both'
                                });
                            }
                            artifact.stakeholder_id = existing.id;
                            delete artifact.stakeholder;
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
                        case 'document':
                            const response = await fetch('/api/v1/documents/', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(artifact),
                            });
                            if (!response.ok) throw new Error('Failed to import document');
                            result = await response.json();
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
                            newSourceAid.includes('-REQ-') ? 'requirement' :
                                newSourceAid.includes('-DOC-') ? 'document' :
                                    newSourceAid.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) ? 'diagram' : 'vision';
                    const targetType = newTargetAid.includes('-NEED-') ? 'need' :
                        newTargetAid.includes('-UC-') ? 'use_case' :
                            newTargetAid.includes('-REQ-') ? 'requirement' :
                                newTargetAid.includes('-DOC-') ? 'document' :
                                    newTargetAid.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) ? 'diagram' : 'vision';

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
        const filteredArtifacts = filteredResults;
        if (!filteredArtifacts || filteredArtifacts.length === 0) return;

        let content = `# ${artifactType.charAt(0).toUpperCase() + artifactType.slice(1)} Export\n\n`;
        content += `**Date**: ${new Date().toLocaleDateString()}\n\n---\n\n`;

        filteredArtifacts.forEach((a: any) => {
            switch (artifactType) {
                case 'vision':
                    content += `# ${a.title}\n\n`;
                    content += `**Date**: ${a.created_date ? new Date(a.created_date).toLocaleDateString() : '-'}\n\n`;
                    content += `${a.description || a.vision_statement || ''}\n\n---\n\n`;
                    break;
                case 'need': {
                    let stakeholderName = a.stakeholder;
                    if (stakeholders) {
                        const sObj = stakeholders.find((s: any) => s.id === a.stakeholder_id || s.id === a.stakeholder || s.name === a.stakeholder);
                        if (sObj) stakeholderName = sObj.name;
                    }

                    let ownerName = a.owner;
                    if (owners) {
                        const ownerObj = owners.find((o: any) => o.id === a.owner_id || o.id === a.owner || o.name === a.owner);
                        if (ownerObj) ownerName = ownerObj.name;
                    }

                    const areaCode = a.area || '-';
                    const level = a.level || '-';

                    content += `## ${a.aid}: ${a.title}\n\n`;

                    // Check for linkages (derives_from)
                    if (linkages) {
                        const related = linkages.filter((l: any) => l.source_id === a.aid || l.source_id === a.id);
                        const derivesFrom = related.filter((l: any) => l.relationship_type === 'derives_from');
                        if (derivesFrom.length > 0) {
                            content += `*derives_from*: ${derivesFrom.map((l: any) => l.target_id).join(', ')}\n\n`;
                        }
                    }

                    content += `**Area**: ${areaCode} | **Level**: ${level}\n`;
                    content += `**Owner**: ${ownerName || '-'} | **Stakeholder**: ${stakeholderName || '-'}\n\n`;

                    content += `### Description\n\n${a.description || '-'}\n\n`;

                    if (a.rationale) {
                        content += `### Rationale\n\n${a.rationale}\n\n`;
                    }

                    if (a.sites && a.sites.length > 0) {
                        content += `### Related Sites\n\n`;
                        a.sites.forEach((site: any) => {
                            const sName = typeof site === 'string' ? site : (site.name || 'Unknown');
                            let badges = [];
                            if (site.security_domain) badges.push(`\`${site.security_domain}\``);
                            if (site.tags && Array.isArray(site.tags)) {
                                badges.push(...site.tags.map((t: string) => `🏷️ ${t}`));
                            }
                            content += `* **${sName}** ${badges.join(' ')}\n`;
                        });
                        content += '\n';
                    } else if (a.site_ids && allSites) {
                        content += `### Related Sites\n\n`;
                        a.site_ids.forEach((sid: string) => {
                            const site = allSites.find((s: any) => s.id === sid);
                            if (site) {
                                let badges = [];
                                if (site.security_domain) badges.push(`\`${site.security_domain}\``);
                                if ((site as any).tags && Array.isArray((site as any).tags)) {
                                    badges.push(...(site as any).tags.map((t: string) => `🏷️ ${t}`));
                                }
                                content += `* **${site.name}** ${badges.join(' ')}\n`;
                            }
                        });
                        content += '\n';
                    }

                    if (a.components && a.components.length > 0) {
                        content += `### Related Components\n\n`;
                        a.components.forEach((comp: any) => {
                            const cName = comp.name || (typeof comp === 'string' ? comp : 'Unknown');
                            let badges = [];
                            if (comp.type) badges.push(`\`${comp.type}\``);
                            if ((comp as any).lifecycle) badges.push(`\`${(comp as any).lifecycle}\``);
                            if (comp.tags && Array.isArray(comp.tags)) {
                                badges.push(...comp.tags.map((t: string) => `🏷️ ${t}`));
                            }
                            content += `* **${cName}** ${badges.join(' ')}\n`;
                        });
                        content += '\n';
                    } else if (a.component_ids && allComponents) {
                        content += `### Related Components\n\n`;
                        a.component_ids.forEach((cid: string) => {
                            const comp = allComponents.find((c: any) => c.id === cid);
                            if (comp) {
                                let badges = [];
                                if (comp.type) badges.push(`\`${comp.type}\``);
                                if ((comp as any).lifecycle) badges.push(`\`${(comp as any).lifecycle}\``);
                                if ((comp as any).tags && Array.isArray((comp as any).tags)) {
                                    badges.push(...(comp as any).tags.map((t: string) => `🏷️ ${t}`));
                                }
                                content += `* **${comp.name}** ${badges.join(' ')}\n`;
                            }
                        });
                        content += '\n';
                    }

                    content += `---\n\n`;
                    break;
                }

                case 'use_case':
                    content += `## ${a.aid}: ${a.title}\n\n`;
                    content += `**Area**: ${a.area || '-'}\n\n`;
                    content += `**Description**: ${a.description || '-'}\n\n`;
                    content += `**Primary Actor**: ${a.primary_actor?.name || '-'}\n\n`;
                    content += `**Trigger**: ${a.trigger || '-'}\n\n`;

                    content += `### Preconditions\n`;
                    if (a.preconditions && a.preconditions.length > 0) {
                        content += a.preconditions.map((p: any) => `- ${p.text}`).join('\n') + '\n\n';
                    } else {
                        content += '-\n\n';
                    }

                    content += `### Main Flow\n`;
                    if (a.mss && a.mss.length > 0) {
                        content += a.mss.map((step: any) => `${step.step_num || (a.mss.indexOf(step) + 1)}. **${step.actor}**: ${step.description}`).join('\n') + '\n\n';
                    } else {
                        content += '-\n\n';
                    }

                    content += `### Postconditions\n`;
                    if (a.postconditions && a.postconditions.length > 0) {
                        content += a.postconditions.map((p: any) => `- ${p.text}`).join('\n') + '\n\n';
                    } else {
                        content += '-\n\n';
                    }

                    // Add Diagrams
                    try {
                        const statePuml = generateStateDiagram(a);
                        const seqPuml = generateSequenceDiagram(a.mss, a.extensions, a.exceptions);
                        const stateUrl = getPlantUMLImageUrl(statePuml, 'png');
                        const seqUrl = getPlantUMLImageUrl(seqPuml, 'png');

                        content += `### Diagrams\n\n`;
                        if (stateUrl) {
                            content += `#### Hybrid State Diagram\n\n![State Diagram](${stateUrl})\n\n`;
                        }
                        if (seqUrl) {
                            content += `#### Sequence Diagram\n\n![Sequence Diagram](${seqUrl})\n\n`;
                        }
                    } catch (e) {
                        console.error("Failed to generate diagrams for markdown export", e);
                    }

                    content += `---\n\n`;
                    break;
                case 'requirement': {
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
                case 'document': {
                    content += `## ${a.aid}: ${a.title}\n\n`;
                    content += `**Status**: ${a.status || '-'} | **Type**: ${a.document_type || '-'}\n\n`;
                    if (a.content_url) content += `*URL/File*: ${a.content_url}\n\n`;
                    if (a.description) content += `${a.description}\n\n`;
                    if (a.content_text) content += `${a.content_text}\n\n`;
                    content += `---\n\n`;
                    break;
                }

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

    const handleExportWord = async () => {
        const filteredArtifacts = filteredResults;
        if (!filteredArtifacts || filteredArtifacts.length === 0) return;

        // Custom renderer to ensure images are resized in Word
        const renderer = new marked.Renderer();
        renderer.image = ({ href, text }) => {
            // Add inline styles and attributes that Word respects for page-width fitting
            return `<img src="${href}" alt="${text}" width="100%" style="width: 100%; max-width: 100%; height: auto; display: block; margin: 10px 0;" />`;
        };

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
                    img { width: 100%; max-width: 100%; height: auto; display: block; margin: 10px 0; border: 1px solid #eee; }
                </style>
            </head>
            <body>
            <h1>${artifactType.charAt(0).toUpperCase() + artifactType.slice(1)} Export</h1>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <hr/>
        `;


        const processMarkdownImages = async (markdown: string): Promise<string> => {
            if (!markdown) return '';
            const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
            let match;
            const replacements = [];

            while ((match = imageRegex.exec(markdown)) !== null) {
                const alt = match[1];
                let src = match[2];

                // Skip if already base64
                if (src.startsWith('data:')) continue;

                let fetchUrl = src;
                if (src.startsWith('/')) {
                    fetchUrl = `${window.location.origin}${src}`;
                } else if (src.startsWith('http')) {
                    fetchUrl = src;
                } else {
                    // Relative path? Assume root if starts with uploads/, otherwise maybe it's just a filename?
                    fetchUrl = `${window.location.origin}/${src}`;
                }

                try {
                    const resp = await fetch(fetchUrl);
                    if (resp.ok) {
                        const blob = await resp.blob();
                        const base64 = await new Promise<string>((resolve) => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result as string);
                            reader.readAsDataURL(blob);
                        });
                        replacements.push({
                            original: match[0],
                            replacement: `![${alt}](${base64})`
                        });
                    } else {
                        // Fallback: Try a common pattern if the first fail was a 404 and it looks like a filename
                        if (!src.includes('/') && !src.startsWith('http')) {
                            const fallbackUrl = `${window.location.origin}/api/v1/documents/files/${src}`;
                            try {
                                const resp2 = await fetch(fallbackUrl);
                                if (resp2.ok) {
                                    const blob2 = await resp2.blob();
                                    const base64_2 = await new Promise<string>((resolve) => {
                                        const reader2 = new FileReader();
                                        reader2.onloadend = () => resolve(reader2.result as string);
                                        reader2.readAsDataURL(blob2);
                                    });
                                    replacements.push({
                                        original: match[0],
                                        replacement: `![${alt}](${base64_2})`
                                    });
                                } else {
                                    console.warn(`Failed to fetch image (fallback): ${fallbackUrl}`);
                                }
                            } catch (e2) {
                                console.error("Fallback fetch error", e2);
                            }
                        } else {
                            console.warn(`Failed to fetch image: ${fetchUrl}`);
                        }
                    }
                } catch (e) {
                    console.error(`Error processing image ${src}:`, e);
                }
            }

            let processed = markdown;
            for (const r of replacements) {
                processed = processed.replace(r.original, r.replacement);
            }
            return processed;
        };

        const processMermaidDiagrams = async (markdown: string): Promise<string> => {
            if (!markdown) return '';
            const mermaidRegex = /```mermaid\n([\s\S]*?)\n```/g;
            let match;
            const replacements = [];

            while ((match = mermaidRegex.exec(markdown)) !== null) {
                try {
                    const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                    const { svg } = await mermaid.render(id, match[1]);

                    // Create a temporary container to render SVG to PNG
                    const container = document.createElement('div');
                    container.innerHTML = svg;
                    document.body.appendChild(container);

                    const dataUrl = await htmlToImage.toPng(container);
                    document.body.removeChild(container);

                    replacements.push({
                        original: match[0],
                        replacement: `![Mermaid Diagram](${dataUrl})`
                    });
                } catch (e) {
                    console.error('Failed to render mermaid diagram', e);
                }
            }

            let processed = markdown;
            for (const r of replacements) {
                processed = processed.replace(r.original, r.replacement);
            }
            return processed;
        };

        for (const a of filteredArtifacts) {
            switch (artifactType) {
                case 'vision':
                    content += `<h1>${a.title}</h1>`;
                    content += `<p><strong>Date:</strong> ${a.created_date ? new Date(a.created_date).toLocaleDateString() : '-'}</p>`;

                    let description = a.description || a.vision_statement || '';
                    description = await processMarkdownImages(description);

                    // Process Mermaid diagrams

                    // Process Mermaid diagrams
                    description = await processMermaidDiagrams(description);

                    const descHtml = await marked.parse(description, { renderer });
                    content += `<div>${descHtml}</div><hr/>`;
                    break;
                case 'need':
                    let stakeholderName = a.stakeholder;
                    if (stakeholders) {
                        const sObj = stakeholders.find((s: any) => s.id === a.stakeholder_id || s.id === a.stakeholder || s.name === a.stakeholder);
                        if (sObj) stakeholderName = sObj.name;
                    }
                    const areaCode = a.area || '-';
                    const level = 'Mission';
                    const needOwnerName = 'Air Power Commander';
                    content += `<h2>${a.aid}: ${a.title}</h2>`;
                    content += `
                            <table style="width: 100%; margin-bottom: 20px; border-collapse: collapse;">
                                <tr>
                                    <td style="width: 50%; padding-bottom: 15px;">
                                        <div style="font-size: 0.8em; color: #64748b; font-weight: bold; text-transform: uppercase;">Area</div>
                                        <div style="font-weight: 500; font-size: 1.1em;">${areaCode}</div>
                                    </td>
                                    <td style="width: 50%; padding-bottom: 15px;">
                                        <div style="font-size: 0.8em; color: #64748b; font-weight: bold; text-transform: uppercase;">Level</div>
                                        <div style="font-weight: 500; font-size: 1.1em;">${level}</div>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="width: 50%; padding-bottom: 15px;">
                                        <div style="font-size: 0.8em; color: #64748b; font-weight: bold; text-transform: uppercase;">Owner</div>
                                        <div style="font-weight: 500; font-size: 1.1em;">${needOwnerName}</div>
                                    </td>
                                    <td style="width: 50%; padding-bottom: 15px;">
                                        <div style="font-size: 0.8em; color: #64748b; font-weight: bold; text-transform: uppercase;">Stakeholder</div>
                                        <div style="font-weight: 500; font-size: 1.1em;">${stakeholderName || '-'}</div>
                                    </td>
                                </tr>
                            </table>
                        `;

                    const needDesc = await processMarkdownImages(a.description || '');
                    const needDescHtml = await marked.parse(needDesc, { renderer });
                    content += `<div style="font-size: 0.8em; color: #64748b; font-weight: bold; text-transform: uppercase; margin-bottom: 5px;">Description</div>`;
                    content += `<div style="margin-top: 0;">${needDescHtml}</div>`;

                    if (a.rationale) {
                        const rationale = await processMarkdownImages(a.rationale || '');
                        const rationaleHtml = await marked.parse(rationale, { renderer });
                        content += `<div style="font-size: 0.8em; color: #64748b; font-weight: bold; text-transform: uppercase; margin-bottom: 5px; margin-top: 20px;">Rationale</div>`;
                        content += `<div style="margin-top: 0;">${rationaleHtml}</div>`;
                    }
                    if (a.sites && a.sites.length > 0) {
                        content += `<div style="font-size: 0.8em; color: #64748b; font-weight: bold; text-transform: uppercase; margin-bottom: 5px; margin-top: 20px;">Related Sites</div>`;
                        content += `<div>`;
                        a.sites.forEach((site: any) => {
                            const sName = typeof site === 'string' ? site : site.name;
                            content += `<span style="display: inline-block; background-color: #eef2ff; color: #4338ca; padding: 4px 10px; border-radius: 9999px; font-size: 0.85em; font-weight: 500; border: 1px solid #e0e7ff; margin-right: 5px; margin-bottom: 5px;">${sName}</span>`;
                        });
                        content += `</div>`;
                    } else if (a.site_ids && allSites) {
                        content += `<div style="font-size: 0.8em; color: #64748b; font-weight: bold; text-transform: uppercase; margin-bottom: 5px; margin-top: 20px;">Related Sites</div>`;
                        content += `<div>`;
                        a.site_ids.forEach((sid: string) => {
                            const site = allSites.find((s: any) => s.id === sid);
                            if (site) {
                                content += `<span style="display: inline-block; background-color: #eef2ff; color: #4338ca; padding: 4px 10px; border-radius: 9999px; font-size: 0.85em; font-weight: 500; border: 1px solid #e0e7ff; margin-right: 5px; margin-bottom: 5px;">${site.name}</span>`;
                            }
                        });
                        content += `</div>`;
                    }
                    if (a.components && a.components.length > 0) {
                        content += `<div style="font-size: 0.8em; color: #64748b; font-weight: bold; text-transform: uppercase; margin-bottom: 5px; margin-top: 20px;">Related Components</div>`;
                        content += `<div>`;
                        a.components.forEach((comp: any) => {
                            const cName = comp.name || (typeof comp === 'string' ? comp : 'Unknown');
                            content += `<span style="display: inline-block; background-color: #f8fafc; color: #0f172a; padding: 4px 10px; border-radius: 9999px; font-size: 0.85em; font-weight: 500; border: 1px solid #e2e8f0; margin-right: 5px; margin-bottom: 5px;">${cName}</span>`;
                            if (comp.type) content += `<span style="display: inline-block; background-color: #eff6ff; color: #1e40af; padding: 4px 10px; border-radius: 9999px; font-size: 0.85em; font-weight: 500; border: 1px solid #dbeafe; margin-right: 5px; margin-bottom: 5px;">${comp.type}</span>`;
                            if (comp.lifecycle) content += `<span style="display: inline-block; background-color: #f0fdf4; color: #166534; padding: 4px 10px; border-radius: 9999px; font-size: 0.85em; font-weight: 500; border: 1px solid #dcfce7; margin-right: 5px; margin-bottom: 5px;">${comp.lifecycle}</span>`;
                            if (comp.tags && Array.isArray(comp.tags)) {
                                comp.tags.forEach((tag: string) => {
                                    content += `<span style="display: inline-block; background-color: #fff; color: #475569; padding: 4px 10px; border-radius: 6px; font-size: 0.85em; border: 1px solid #e2e8f0; margin-right: 5px; margin-bottom: 5px;">🏷️ ${tag}</span>`;
                                });
                            }
                        });
                        content += `</div>`;
                    } else if (a.component_ids && allComponents) {
                        content += `<div style="font-size: 0.8em; color: #64748b; font-weight: bold; text-transform: uppercase; margin-bottom: 5px; margin-top: 20px;">Related Components</div>`;
                        content += `<div>`;
                        a.component_ids.forEach((cid: string) => {
                            const comp = allComponents.find((c: any) => c.id === cid);
                            if (comp) {
                                content += `<span style="display: inline-block; background-color: #f8fafc; color: #0f172a; padding: 4px 10px; border-radius: 9999px; font-size: 0.85em; font-weight: 500; border: 1px solid #e2e8f0; margin-right: 5px; margin-bottom: 5px;">${comp.name}</span>`;
                            }
                        });
                        content += `</div>`;
                    }
                    content += `<hr style="margin-top: 30px; border: 0; border-top: 1px solid #eee;" />`;
                    break;
                case 'use_case':
                    content += `<h2>${a.aid}: ${a.title}</h2>`;
                    const ucDesc = await processMarkdownImages(a.description || '');
                    const ucDescHtml = await marked.parse(ucDesc, { renderer });
                    content += `<div style="margin-bottom: 10px;"><strong>Description:</strong> <div>${ucDescHtml || '-'}</div></div>`;
                    content += `<p><strong>Primary Actor:</strong> ${a.primary_actor?.name || '-'}</p>`;
                    content += `<h3>Preconditions</h3><ul>`;
                    if (a.preconditions && a.preconditions.length > 0) {
                        content += a.preconditions.map((p: any) => `<li>${p.text}</li>`).join('');
                    } else { content += `<li>-</li>`; }
                    content += `</ul>`;

                    content += `<h3>Main Flow</h3><ol>`;
                    if (a.mss && a.mss.length > 0) {
                        content += a.mss.map((step: any) => `<li><strong>${step.actor}</strong>: ${step.description}</li>`).join('');
                    } else { content += `<li>-</li>`; }
                    content += `</ol>`;

                    content += `<h3>Postconditions</h3><ul>`;
                    if (a.postconditions && a.postconditions.length > 0) {
                        content += a.postconditions.map((p: any) => `<li>${p.text}</li>`).join('');
                    } else { content += `<li>-</li>`; }
                    content += `</ul>`;

                    // Diagrams
                    try {
                        const statePuml = generateStateDiagram(a);
                        const seqPuml = generateSequenceDiagram(a.mss, a.extensions, a.exceptions);

                        const stateUrl = getPlantUMLImageUrl(statePuml, 'png');
                        const seqUrl = getPlantUMLImageUrl(seqPuml, 'png');

                        if (stateUrl) {
                            const resp = await fetch(stateUrl);
                            if (resp.ok) {
                                const blob = await resp.blob();
                                const base64 = await new Promise((resolve) => {
                                    const reader = new FileReader();
                                    reader.onloadend = () => resolve(reader.result);
                                    reader.readAsDataURL(blob);
                                });
                                content += `<h3>Hybrid State Diagram</h3><img src="${base64}" width="100%" style="width: 100%; max-width: 100%; border: 1px solid #ddd;" /><br/>`;
                            }
                        }

                        if (seqUrl) {
                            const resp = await fetch(seqUrl);
                            if (resp.ok) {
                                const blob = await resp.blob();
                                const base64 = await new Promise((resolve) => {
                                    const reader = new FileReader();
                                    reader.onloadend = () => resolve(reader.result);
                                    reader.readAsDataURL(blob);
                                });
                                content += `<h3>Sequence Diagram</h3><img src="${base64}" width="100%" style="width: 100%; max-width: 100%; border: 1px solid #ddd;" /><br/>`;
                            }
                        }
                    } catch (e) {
                        console.error("Failed to export diagrams", e);
                    }

                    content += `<hr/>`;
                    break;
                case 'requirement':
                    let ownerName = a.owner;
                    if (owners) {
                        const ownerObj = owners.find((o: any) => o.id === a.owner || o.name === a.owner);
                        if (ownerObj) ownerName = ownerObj.name;
                    }
                    content += `<h2>${a.aid}: ${a.short_name}</h2>`;
                    content += `<div class="meta"><strong>Owner:</strong> ${ownerName || '-'} | <strong>Status:</strong> ${a.status || '-'} | <strong>Type:</strong> ${a.ears_type || '-'}</div>`;
                    const reqText = await processMarkdownImages(a.text || '');
                    const reqTextHtml = await marked.parse(reqText, { renderer });
                    content += `<blockquote>${reqTextHtml}</blockquote>`;
                    if (a.rationale) {
                        const reqRat = await processMarkdownImages(a.rationale);
                        const reqRatHtml = await marked.parse(reqRat, { renderer });
                        content += `<div class="rationale"><strong>Rationale:</strong> ${reqRatHtml}</div>`;
                    }
                    content += `<hr/>`;
                    break;
                case 'document':
                    content += `<h2>${a.aid}: ${a.title}</h2>`;
                    content += `<p><strong>File Name:</strong> ${a.content_url || '-'}</p>`;
                    content += `<p><strong>Type:</strong> ${a.document_type || '-'}</p>`;
                    const docContent = await processMarkdownImages(a.content_text || '');
                    const docContentWithMermaid = await processMermaidDiagrams(docContent);
                    const docContentHtml = await marked.parse(docContentWithMermaid, { renderer });
                    content += `<div>${docContentHtml}</div>`;
                    content += `<hr/>`;
                    break;
            }
        }

        content += `</body></html>`;
        const blob = new Blob([content], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${artifactType}_export_${new Date().toISOString().split('T')[0]}.doc`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const deleteMutation = useMutation({
        mutationFn: async (aid: string) => {
            switch (artifactType) {
                case 'vision':
                    return VisionService.deleteVisionStatementApiV1VisionVisionStatementsAidDelete(aid);
                case 'need':
                    return NeedsService.deleteNeedApiV1NeedNeedsAidDelete(aid);
                case 'use_case':
                    return UseCaseService.deleteUseCaseApiV1UseCaseUseCasesAidDelete(aid);
                case 'requirement':
                    return RequirementService.deleteRequirementApiV1RequirementRequirementsAidDelete(aid);
                case 'document':
                    const res = await fetch(`/api/v1/documents/${aid}`, { method: 'DELETE' });
                    if (!res.ok) throw new Error('Failed to delete document');
                    return res.json();
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
                const resolution = resolutions.get(`Area:${newArtifact.area} `);
                if (resolution && resolution !== 'create_new') {
                    newArtifact.area = resolution;
                }
            }

            // Resolve Owner
            if (newArtifact.owner) {
                const resolution = resolutions.get(`Owner:${newArtifact.owner} `);
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
            {artifactType !== 'vision' && vision && <VisionHeader visions={vision} />}

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

            {/* Actions */}
            <div className="flex justify-between items-center">
                <div className="flex gap-3 items-center">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-9 pr-3 py-2 border rounded w-64 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>

                    {/* Active Actions (Clear Filters / Delete) */}
                    <div className="flex items-center gap-2 border-l pl-3 border-slate-200 min-h-[40px]">
                        {/* Clear All Filters */}
                        {(search || sortConfig.key || Object.keys(columnFilters).length > 0) && (
                            <button
                                onClick={clearAllFilters}
                                className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2 ring-1 ring-slate-200"
                                title="Clear all filters and sorting"
                            >
                                <FilterX className="w-4 h-4" />
                                <span className="text-xs font-medium">Clear</span>
                            </button>
                        )}

                        {/* Bulk Delete */}
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
                                className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2 ring-1 ring-red-200"
                                title={`Delete ${selectedItems.length} selected item(s)`}
                            >
                                <Trash2 className="w-4 h-4" />
                                <span className="text-xs font-bold">{selectedItems.length}</span>
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex gap-2">
                    {/* Export Buttons */}
                    <div className="flex gap-0.5">
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
                            className="px-3 py-2 bg-slate-600 text-white hover:bg-slate-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                            title="Export Markdown"
                        >
                            <Download className="w-4 h-4" />
                            MD
                        </button>
                        <button
                            onClick={handleExportWord}
                            disabled={!artifacts || artifacts.length === 0}
                            className="px-3 py-2 bg-blue-600 text-white rounded-r hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                            title="Export Word"
                        >
                            <Download className="w-4 h-4" />
                            DOC
                        </button>
                    </div>

                    {/* Import Button */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={importMutation.isPending}
                        className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                        title="Import artifacts from JSON"
                    >
                        <Upload className="w-4 h-4" />
                        JSON
                    </button>
                    <button
                        onClick={handlePaste}
                        disabled={importMutation.isPending}
                        className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                        title="Paste artifact from clipboard"
                    >
                        <Clipboard className="w-4 h-4" />
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleImport}
                        className="hidden"
                    />





                    {/* Reset Columns Button */}
                    <button
                        onClick={resetColumnWidths}
                        className="px-3 py-2 bg-slate-100 text-slate-700 border border-slate-300 rounded hover:bg-slate-200 transition-colors flex items-center justify-center"
                        title="Reset column widths to defaults"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>

                    {/* Create New Button */}
                    <Link
                        to={canCreate ? `/project/${projectId}/${artifactType}/create` : '#'}
                        onClick={(e) => !canCreate && e.preventDefault()}
                        className={`px-3 py-2 rounded transition-colors flex items-center gap-2 ${canCreate
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                            }`}
                        title={canCreate ? `Create new ${artifactType.replace('_', ' ')}` : "You don't have permission to create this artifact type"}
                    >
                        <div className={`rounded-full p-0.5 ${canCreate ? 'bg-white' : 'bg-slate-200'}`}>
                            <Edit className={`w-3 h-3 ${canCreate ? 'text-blue-600' : 'text-slate-400'}`} />
                        </div>
                        {artifactType === 'use_case' ? 'Use Case' : artifactType.charAt(0).toUpperCase() + artifactType.slice(1).replace('_', ' ')}
                    </Link>
                </div>
            </div>

            {/* List */}
            <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-x-auto">
                <div style={{ minWidth: '100%' }}>
                    {/* Header Row */}
                    <div className="grid gap-2 p-3 border-b bg-slate-50 font-medium text-slate-700 sticky top-0 z-10" style={{ gridTemplateColumns: getGridTemplate() }}>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                checked={filteredResults.length > 0 && filteredResults.every((a: any) => selectedItems.includes(a.aid))}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        // Add all filtered items to selection (avoiding duplicates)
                                        setSelectedItems(Array.from(new Set([...selectedItems, ...filteredAids])));
                                    } else {
                                        // Remove all filtered items from selection
                                        setSelectedItems(selectedItems.filter(id => !filteredAids.includes(id)));
                                    }
                                }}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                        </div>
                        {[
                            ...(artifactType !== 'vision' && artifactType !== 'document' ? [{ key: 'area', label: 'Area', span: 1 }] : []),
                            { key: 'aid', label: 'Artifact ID', span: 2 },
                            { key: 'title', label: 'Title / Name', span: 2 },
                            { key: 'description', label: 'Description', span: artifactType !== 'vision' && artifactType !== 'document' ? 3 : 4 },
                            { key: 'status', label: 'Status', span: 1 },
                        ].map((col) => (
                            <div
                                key={col.key}
                                className="flex items-center gap-1 select-none relative group h-full"
                            >
                                <ResizeHandle columnKey={col.key} />
                                <div
                                    className="flex items-center gap-1 cursor-pointer hover:bg-slate-200 px-1 py-0.5 rounded"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (activeFilterDropdown !== col.key) {
                                            // Opening new dropdown: Sync pending with current applied filters
                                            setPendingFilters(columnFilters);
                                            setActiveFilterDropdown(col.key);
                                        } else {
                                            // Closing current dropdown: Commit pending changes
                                            setColumnFilters(pendingFilters);
                                            setActiveFilterDropdown(null);
                                        }
                                    }}
                                >
                                    <Filter className={`w-3 h-3 ${columnFilters[col.key]?.length > 0 ? 'text-blue-600' : 'text-slate-400'}`} />
                                    {columnFilters[col.key]?.length > 0 && (
                                        <span className="text-xs bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center">
                                            {columnFilters[col.key].length}
                                        </span>
                                    )}
                                </div>
                                <div
                                    className="cursor-pointer hover:bg-slate-100 flex-1 flex items-center gap-1 truncate"
                                    onClick={() => handleSort(col.key)}
                                >
                                    {col.label}
                                    {sortConfig.key === col.key && (
                                        <span className="text-slate-400">
                                            {sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                                        </span>
                                    )}
                                </div>

                                {/* Filter Dropdown */}
                                {activeFilterDropdown === col.key && (
                                    <div className="absolute top-full left-0 mt-1 bg-white border rounded-md shadow-lg z-50 min-w-[200px] max-h-[300px] overflow-y-auto">
                                        <div className="sticky top-0 bg-slate-50 p-2 border-b flex justify-between items-center">
                                            <span className="text-xs font-medium text-slate-600">Filter by {col.label}</span>
                                            {columnFilters[col.key]?.length > 0 && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        clearColumnFilter(col.key);
                                                    }}
                                                    className="text-xs text-blue-600 hover:text-blue-800"
                                                >
                                                    Clear
                                                </button>
                                            )}
                                        </div>
                                        <div className="p-1">
                                            {getUniqueValuesForColumn(col.key).map((value: string) => (
                                                <label
                                                    key={value}
                                                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 cursor-pointer rounded"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={pendingFilters[col.key]?.includes(value) || false}
                                                        onChange={() => toggleFilter(col.key, value)}
                                                        className="w-3 h-3 text-blue-600 rounded"
                                                    />
                                                    <span className="text-sm truncate">{value}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        <div className="text-right flex items-center justify-end relative">
                            Actions
                            <ResizeHandle columnKey="actions" />
                        </div>
                    </div>

                    <ul className="divide-y divide-slate-100">
                        {filteredResults.map((a: any) => (
                            <li key={a.aid} className="hover:bg-slate-50 transition-colors">
                                <div className="grid gap-2 p-3 items-center" style={{ gridTemplateColumns: getGridTemplate() }}>
                                    {/* Checkbox */}
                                    <div className="flex items-center">
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

                                    {/* Area (only for need, use_case, requirement) */}
                                    {(artifactType === 'need' || artifactType === 'use_case' || artifactType === 'requirement') && (
                                        <div className="text-sm text-slate-600">
                                            {a.area || '-'}
                                        </div>
                                    )}

                                    {/* Artifact ID */}
                                    <Link
                                        to={`/project/${projectId}/${artifactType}/${a.aid}`}
                                        state={{ filteredAIDs: filteredAids }}
                                        className="font-mono text-sm text-slate-600 truncate hover:text-blue-600"
                                        title={a.aid}
                                    >
                                        {a.aid}
                                    </Link>

                                    {/* Title / Short Name */}
                                    <Link
                                        to={`/project/${projectId}/${artifactType}/${a.aid}`}
                                        state={{ filteredAIDs: getFilteredAIDs() }}
                                        className="font-medium text-blue-600 hover:underline flex items-center gap-2 min-w-0"
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
                                        {artifactType === 'document' && (
                                            <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0 bg-blue-100 text-blue-800">
                                                {a.document_type === 'url' ? 'URL' : 'FILE'}
                                            </span>
                                        )}
                                    </Link>

                                    {/* Description / Text */}
                                    <Link
                                        to={`/project/${projectId}/${artifactType}/${a.aid}`}
                                        className="text-sm text-slate-600 block max-h-20 overflow-hidden"
                                        title={a.description || a.text}
                                    >
                                        <div className="pointer-events-none line-clamp-2 list-view-description">
                                            <MarkdownDisplay content={a.description || a.text || '-'} compact />
                                        </div>
                                    </Link>

                                    {/* Status */}
                                    <div>
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
                                    <div className="flex justify-end gap-1">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                // Export single item
                                                const exportArtifact = prepareArtifactForExport(a);
                                                // Collect relevant linkages
                                                const relevantLinkages: string[][] = [];
                                                const uniqueLinkages = new Set<string>();

                                                // Create lookup for Diagrams (UUID -> Name)
                                                const diagramMap = new Map<string, string>();
                                                if (diagrams) {
                                                    diagrams.forEach((d: any) => {
                                                        diagramMap.set(d.id, d.name);
                                                    });
                                                }

                                                if (linkages) {
                                                    const aid = a.aid;
                                                    linkages.forEach((l: any) => {
                                                        // Check if this linkage involves the exported artifact
                                                        if (l.source_id === aid || l.target_id === aid) {
                                                            let s = l.source_id.trim();
                                                            let t = l.target_id.trim();

                                                            // Resolve Diagram UUIDs to Names
                                                            if (diagramMap.has(s)) s = diagramMap.get(s)!;
                                                            if (diagramMap.has(t)) t = diagramMap.get(t)!;

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
                                            to={canEdit ? `/project/${projectId}/${artifactType}/${a.aid}/edit` : '#'}
                                            onClick={(e) => !canEdit && e.preventDefault()}
                                            className={`p-1 transition-colors rounded ${canEdit
                                                ? 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'
                                                : 'text-slate-300 cursor-not-allowed opacity-50'
                                                }`}
                                            title={canEdit ? "Edit" : "You don't have permission to edit"}
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Link>
                                        <button
                                            onClick={(e) => {
                                                if (!canCreate) return;
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
                                            disabled={!canCreate}
                                            className={`p-1 transition-colors rounded ${canCreate
                                                ? 'text-slate-400 hover:text-cyan-600 hover:bg-cyan-50'
                                                : 'text-slate-300 cursor-not-allowed opacity-50'
                                                }`}
                                            title={canCreate ? "Duplicate" : "You don't have permission to create"}
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
                                                if (!canDelete) return;
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
                                            disabled={!canDelete}
                                            className={`p-1 transition-colors rounded ${canDelete
                                                ? 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                                                : 'text-slate-300 cursor-not-allowed opacity-50'
                                                }`}
                                            title={canDelete ? "Delete" : "You don't have permission to delete"}
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
};

export default ArtifactListView;
