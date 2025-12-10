import { NavLink, Link } from 'react-router-dom';
import { ArrowLeft, Users, FileText, List, Settings, Network, Image } from 'lucide-react';

import { useQuery } from '@tanstack/react-query';
import { ProjectsService } from '../client';

interface SidePanelProps {
    projectId: string;
}

export default function SidePanel({ projectId }: SidePanelProps) {
    const base = `/project/${projectId}`;

    const { data: project } = useQuery({
        queryKey: ['project', projectId],
        queryFn: () => ProjectsService.getProjectApiV1ProjectsProjectsProjectIdGet(projectId),
        enabled: !!projectId,
    });

    return (
        <nav className="w-64 bg-slate-800 text-slate-100 h-full flex flex-col p-4 overflow-y-auto">
            <div className="flex flex-col items-center mb-6">
                <img src="/assets/logo.png" alt="Registry Logo" className="w-24 h-24 object-contain mb-2" />
                {project && (
                    <div className="text-center">
                        <h2 className="font-bold text-lg">{project.name}</h2>
                        <p className="text-xs text-slate-400">{project.description}</p>
                    </div>
                )}
            </div>
            <Link to="/" className="mb-6 flex items-center gap-2 hover:text-blue-300 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span className="font-semibold text-lg">All Projects</span>
            </Link>
            <ul className="flex-1 space-y-2">
                <li>
                    <NavLink
                        to={`${base}/visions`}
                        className={({ isActive }) =>
                            `flex items-center gap-2 p-2 rounded hover:bg-slate-700 ${isActive ? 'bg-slate-700' : ''}`
                        }
                    >
                        <FileText className="w-4 h-4" /> Vision Statements
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to={`${base}/needs`}
                        className={({ isActive }) =>
                            `flex items-center gap-2 p-2 rounded hover:bg-slate-700 ${isActive ? 'bg-slate-700' : ''}`
                        }
                    >
                        <List className="w-4 h-4" /> Needs
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to={`${base}/use-cases`}
                        className={({ isActive }) =>
                            `flex items-center gap-2 p-2 rounded hover:bg-slate-700 ${isActive ? 'bg-slate-700' : ''}`
                        }
                    >
                        <Users className="w-4 h-4" /> Use Cases
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to={`${base}/requirements`}
                        className={({ isActive }) =>
                            `flex items-center gap-2 p-2 rounded hover:bg-slate-700 ${isActive ? 'bg-slate-700' : ''}`
                        }
                    >
                        <FileText className="w-4 h-4" /> Requirements
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to={`${base}/documents`}
                        className={({ isActive }) =>
                            `flex items-center gap-2 p-2 rounded hover:bg-slate-700 ${isActive ? 'bg-slate-700' : ''}`
                        }
                    >
                        <FileText className="w-4 h-4" /> Documents
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to={`${base}/linkages`}
                        className={({ isActive }) =>
                            `flex items-center gap-2 p-2 rounded hover:bg-slate-700 ${isActive ? 'bg-slate-700' : ''}`
                        }
                    >
                        <Network className="w-4 h-4" /> Linkages
                    </NavLink>
                </li>
            </ul>
            <div className="mt-auto space-y-2 border-t border-slate-700 pt-4">
                <NavLink
                    to={`${base}/people`}
                    className={({ isActive }) =>
                        `flex items-center gap-2 p-2 rounded hover:bg-slate-700 ${isActive ? 'bg-slate-700' : ''}`
                    }
                >
                    <Users className="w-4 h-4" /> People
                </NavLink>
                <NavLink
                    to={`${base}/areas`}
                    className={({ isActive }) =>
                        `flex items-center gap-2 p-2 rounded hover:bg-slate-700 ${isActive ? 'bg-slate-700' : ''}`
                    }
                >
                    <Settings className="w-4 h-4" /> Areas
                </NavLink>
                <NavLink
                    to={`${base}/sites`}
                    className={({ isActive }) =>
                        `flex items-center gap-2 p-2 rounded hover:bg-slate-700 ${isActive ? 'bg-slate-700' : ''}`
                    }
                >
                    <Settings className="w-4 h-4" /> Sites
                </NavLink>
                <NavLink
                    to={`${base}/components`}
                    className={({ isActive }) =>
                        `flex items-center gap-2 p-2 rounded hover:bg-slate-700 ${isActive ? 'bg-slate-700' : ''}`
                    }
                >
                    <Settings className="w-4 h-4" /> Components
                </NavLink>
                <NavLink
                    to={`${base}/diagrams`}
                    className={({ isActive }) =>
                        `flex items-center gap-2 p-2 rounded hover:bg-slate-700 ${isActive ? 'bg-slate-700' : ''}`
                    }
                >
                    <Network className="w-4 h-4" /> Diagrams
                </NavLink>
                <NavLink
                    to={`${base}/images`}
                    className={({ isActive }) =>
                        `flex items-center gap-2 p-2 rounded hover:bg-slate-700 ${isActive ? 'bg-slate-700' : ''}`
                    }
                >
                    <Image className="w-4 h-4" /> Images
                </NavLink>
            </div>
        </nav >
    );
}
