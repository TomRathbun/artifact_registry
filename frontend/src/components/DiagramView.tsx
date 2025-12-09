import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import ComponentDiagram from './ComponentDiagram';
import ArtifactGraphView from './ArtifactGraphView';
import SequenceDiagramEditor from './SequenceDiagramEditor';

export default function DiagramView() {
    const { diagramId } = useParams<{ diagramId: string }>();

    const { data: diagram, isLoading } = useQuery({
        queryKey: ['diagram', diagramId],
        queryFn: async () => {
            if (!diagramId) return null;
            const response = await axios.get(`/api/v1/diagrams/${diagramId}`);
            return response.data;
        },
        enabled: !!diagramId,
    });

    if (isLoading) return <div className="p-8 text-center text-slate-500">Loading diagram...</div>;
    if (!diagram) return <div className="p-8 text-center text-red-500">Diagram not found</div>;

    if (diagram.type === 'sequence') {
        return <SequenceDiagramEditor />;
    }

    if (diagram.type === 'artifact_graph') {
        return (
            <div className="flex flex-col h-full space-y-4 p-6">
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                    <h2 className="text-xl font-semibold text-slate-800">{diagram.name}</h2>
                    {diagram.description && (
                        <p className="text-slate-600 mt-1">{diagram.description}</p>
                    )}
                </div>
                <ArtifactGraphView initialArea={diagram.filter_data?.area} diagramId={diagram.id} />
            </div>
        );
    }

    return <ComponentDiagram />;
}
