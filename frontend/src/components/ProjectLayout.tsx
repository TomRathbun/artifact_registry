
import SidePanel from './SidePanel';
import { Outlet, useParams } from 'react-router-dom';

export default function ProjectLayout() {
    const { projectId } = useParams<{ projectId: string }>();
    if (!projectId) return null;

    return (
        <div className="flex h-screen overflow-hidden">
            <SidePanel projectId={projectId} />
            <main className="flex-1 overflow-y-auto p-6 bg-transparent">
                {/* Header could include project title, breadcrumbs, etc. */}
                <Outlet /> {/* Render nested routes */}
            </main>
        </div>
    );
}
