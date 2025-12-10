import { useEffect, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidBlockProps {
    chart: string;
}

const MermaidBlock: React.FC<MermaidBlockProps> = ({ chart }) => {
    const [svg, setSvg] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        mermaid.initialize({ startOnLoad: false, theme: 'default' });

        const renderChart = async () => {
            try {
                const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
                const { svg } = await mermaid.render(id, chart);
                setSvg(svg);
                setError(null);
            } catch (err: any) {
                console.error('Mermaid render error:', err);
                setError('Syntax error in Mermaid diagram');
                // Mermaid might leave residuals or fail silently in some versions, but usually throws.
            }
        };

        if (chart) {
            renderChart();
        }
    }, [chart]);

    if (error) {
        return <div className="text-red-500 font-mono text-sm p-2 border border-red-200 bg-red-50 rounded">{error}</div>;
    }

    return <div dangerouslySetInnerHTML={{ __html: svg }} className="my-4 overflow-x-auto" />;
};

export default MermaidBlock;
