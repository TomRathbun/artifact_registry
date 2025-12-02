import { NavLink, Link } from 'react-router-dom';
import { ArrowLeft, Users, FileText, List, Settings, Network } from 'lucide-react';

interface SidePanelProps {
    projectId: string;
}

export default function SidePanel({ projectId }: SidePanelProps) {
    const base = `/project/${projectId}`;
    return (
        <nav className="w-64 bg-slate-800 text-slate-100 h-full flex flex-col p-4">
            <div className="flex justify-center mb-6">
                <img src="/assets/logo.png" alt="Registry Logo" className="w-24 h-24 object-contain" />
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
                        to={`${base}/graph`}
                        className={({ isActive }) =>
                            `flex items-center gap-2 p-2 rounded hover:bg-slate-700 ${isActive ? 'bg-slate-700' : ''}`
                        }
                    >
                        <Network className="w-4 h-4" /> Graph View
                    </NavLink>
                </li>
            </ul>
            <div className="mt-auto space-y-2">
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
            </div>
        </nav>
    );
}
